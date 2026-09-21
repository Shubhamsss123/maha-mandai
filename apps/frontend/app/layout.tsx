import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maha Mandai",
  description: "Online agriculture and grocery delivery in Baramati",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
