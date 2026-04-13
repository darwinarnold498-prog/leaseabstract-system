'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function validateAccessCode(code: string) {
  const trimmed = code.toUpperCase().trim();
  if (trimmed === "LEASEABSTRACT2026") {
    return { success: true };
  }
  return { success: false, message: "Invalid code" };
}

export async function analyzeLease(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || !file.name.endsWith(".pdf")) throw new Error("Valid PDF required");

  // Mock response so it works immediately (real Gemini added later)
  return {
    tenantName: "John Michael Doe",
    landlordName: "ABC Properties LLC",
    propertyAddress: "123 Main Street, Apartment 4C, City, State 12345",
    monthlyRent: 2150,
    securityDeposit: 2150,
    leaseStartDate: "2025-05-01",
    leaseEndDate: "2026-04-30",
    renewalOptions: "Tenant may renew for another 12 months at $2,250/month with 60 days written notice",
    terminationClauses: "Tenant may terminate with 60 days notice and payment of 2 months rent penalty",
    maintenanceResponsibilities: "Tenant responsible for minor repairs under $200. Landlord responsible for major repairs",
    redFlagRisks: ["Strict pet policy with $500 fine for unauthorized pets", "High early termination penalty"],
    plainEnglishSummary: "Standard 12-month residential lease for $2,150/month. Everything looks normal except for a strict pet restriction and high early termination fee.",
    actionItems: ["Confirm move-in date with landlord", "Pay security deposit by April 20, 2025", "Schedule utility transfer"]
  };
}