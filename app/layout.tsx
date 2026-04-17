import type { Metadata } from "next";
import "./globals.css";
import PasswordGate from "@/components/PasswordGate";

export const metadata: Metadata = {
  title: "Majombagázs Nyaral",
  description: "Időpont-tervező a bagázsnak – when2meet, csak jobb.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
