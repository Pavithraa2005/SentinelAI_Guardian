import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentinelAI Guardian | Agentic AI Cybersecurity Platform",
  description: "Enterprise-grade autonomous AI cybersecurity platform for phishing detection, ransomware mitigation, cloud posture audits, compliance mapping, and active recovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-cyber-bg text-gray-100 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
