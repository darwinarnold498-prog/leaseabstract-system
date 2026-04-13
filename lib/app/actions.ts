'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function validateAccessCode(code: string) {
  const serverSupabase = createServerClient();
  const { data } = await serverSupabase
    .from("licenses")
    .select("id")
    .eq("code", code.toUpperCase().trim())
    .is("redeemed_at", null)
    .single();

  if (!data) return { success: false, message: "Invalid or already used code" };

  await serverSupabase
    .from("licenses")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("id", data.id);

  const cookieStore = cookies();
  cookieStore.set("access_granted", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/"
  });

  return { success: true };
}

export async function analyzeLease(formData: FormData) {
  const cookieStore = cookies();
  if (cookieStore.get("access_granted")?.value !== "true") {
    throw new Error("Access not granted. Enter your Gumroad code first.");
  }

  const file = formData.get("file") as File;
  if (!file || !file.name.endsWith(".pdf")) throw new Error("Valid PDF required");

  const buffer = Buffer.from(await file.arrayBuffer());
  const serverSupabase = createServerClient();

  const fileName = `${Date.now()}-${file.name}`;
  await serverSupabase.storage.from("leases").upload(fileName, buffer, { contentType: "application/pdf" });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert real estate attorney. Extract from this lease PDF and return ONLY valid JSON:
{
  "tenantName": string,
  "landlordName": string,
  "propertyAddress": string,
  "monthlyRent": number,
  "securityDeposit": number,
  "leaseStartDate": string,
  "leaseEndDate": string,
  "renewalOptions": string,
  "terminationClauses": string,
  "maintenanceResponsibilities": string,
  "redFlagRisks": string[],
  "plainEnglishSummary": string,
  "actionItems": string[]
}`;

  const result = await model.generateContent([
    { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } },
    { text: prompt }
  ]);

  let analysis;
  try {
    analysis = JSON.parse(result.response.text().trim());
  } catch {
    analysis = { error: "JSON parse failed", raw: result.response.text() };
  }

  await serverSupabase.from("lease_analyses").insert({ filename: file.name, analysis });

  return analysis;
}
