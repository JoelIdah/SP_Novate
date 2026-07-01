import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./auth.css";

const openSauce = localFont({
  display: "swap",
  src: [
    {
      path: "../public/fonts/OpenSauceTwo-Regular.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "../public/fonts/OpenSauceTwo-Medium.ttf",
      style: "normal",
      weight: "500",
    },
    {
      path: "../public/fonts/OpenSauceTwo-SemiBold.ttf",
      style: "normal",
      weight: "600",
    },
    {
      path: "../public/fonts/OpenSauceTwo-Bold.ttf",
      style: "normal",
      weight: "700",
    },
    {
      path: "../public/fonts/OpenSauceTwo-Italic.ttf",
      style: "italic",
      weight: "400",
    },
    {
      path: "../public/fonts/OpenSauceTwo-MediumItalic.ttf",
      style: "italic",
      weight: "500",
    },
  ],
  variable: "--font-open-sauce",
});

export const metadata: Metadata = {
  title: "SP Novate",
  description: "SP Novate sign-up experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSauce.variable} h-full antialiased`}>
      <body className="min-h-full bg-brand-surface text-brand-ink">{children}</body>
    </html>
  );
}

