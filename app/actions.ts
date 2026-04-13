'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function validateAccessCode(code: string) {
  const trimmed = code.toUpperCase().trim();
  if (trimmed.length < 4) {
    return { success: false, message: "Invalid or already used code" };
  }
  return { success: true };
}

export async function analyzeLease(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || !file.name.endsWith(".pdf")) throw new Error("Valid PDF required");

  const buffer = Buffer.from(await file.arrayBuffer());

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

  return analysis;
}