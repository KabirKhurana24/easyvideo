import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "EasyVideo Change Studio — Keep Training Up To Date",
  description:
    "AI-powered training video maintenance SaaS. Automatically compare policy documents, map changes to affected video scenes, and selectively regenerate scripts and localizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-purple-soft selection:text-purple">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
