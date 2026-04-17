import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { CalorieProvider } from "@/context/CalorieContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "칼로리 계산기",
  description: "일일 칼로리 목표 대비 섭취량을 추적하고, 남은 칼로리에 따라 음식을 추천하는 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CalorieProvider>{children}</CalorieProvider>
      </body>
    </html>
  );
}
