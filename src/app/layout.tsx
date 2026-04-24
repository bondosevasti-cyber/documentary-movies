import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "სტატიები - სტუდია სენაკი",
  description: "დოკუმენტური ფილმები და სტატიები",
};

import { Header } from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" className="bg-black">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-black text-white">
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
