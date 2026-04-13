import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeaseAbstract AI",
  description: "Upload lease PDFs → Gemini analyzes instantly"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
