import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "谁是人机 - AI内容识别挑战",
  description: "挑战你的AI内容识别能力，看看你能否分辨人类与AI创作的内容",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: "AI, 人工智能, 游戏, 判断, 挑战, 内容创作",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}