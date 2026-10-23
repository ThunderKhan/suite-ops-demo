import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { DemoProvider } from "@/lib/demo-context";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const displayFont = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "500", "600", "700"] });
const uiFont = Manrope({ subsets: ["latin"], variable: "--font-ui", display: "swap" });

export const metadata: Metadata = {
  title: "Suite Operations | Hospitality Workflow Concept",
  description: "Independent hospitality operations demo for room readiness, housekeeping and purchasing workflows. Fictional data only.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${uiFont.variable}`}>
      <body>
        <DemoProvider><AppShell>{children}</AppShell></DemoProvider>
      </body>
    </html>
  );
}
