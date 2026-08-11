import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Habito - Habit Tracker",
  description: "Build better habits, one day at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
    >
      <body className="min-h-screen">
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="pt-4 flex-1 lg:pt-0">
              <div className="pb-16 lg:pb-0">
                {children}
              </div>
            </main>
          </div>
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}