import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";

import { AppProvider } from "@/components/providers/app-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { APP_NAME } from "@/lib/constants";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Premium ebooks, audiobooks, workbooks, and courses for modern founders and operators.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-[#FAFAFA] font-sans text-[#1F1F1F] antialiased">
        <AppProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
