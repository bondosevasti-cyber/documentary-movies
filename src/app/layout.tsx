import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "სტატიები - სტუდია სენაკი",
  description: "დოკუმენტური ფილმები და სტატიები",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {/* We can add a Global Header here if needed */}
        <main>{children}</main>
        {/* We can add a Global Footer here if needed */}
      </body>
    </html>
  );
}
