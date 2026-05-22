import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LayoutContent from "@/components/LayoutContent";

export const metadata: Metadata = {
  title: "VedaAI - Assessment Creator",
  description: "AI-powered question paper generator for educators",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#e6e6e6]">
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
