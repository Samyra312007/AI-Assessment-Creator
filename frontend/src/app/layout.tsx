import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "VedaAI - Assessment Creator",
  description: "AI-powered question paper generator for educators",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#e6e6e6]">
        <AuthProvider>
          <Sidebar />
          <main className="ml-[304px] min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
