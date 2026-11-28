import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://daltosaju.com"),
  title: "달토사주 (DaltoSaju) | 달토끼 달토 AI 사주 · 사주 카드",
  description:
    "2027 정미년 신년운세, 평생 사주 원국 풀이, 재물·이직운, 연애·궁합 스캔, 오늘의 무료 타로까지. 달토끼 달토의 솔직한 조언·따뜻한 처방전과 달토 사주 카드를 소장하세요.",
  openGraph: {
    title: "달토사주 (DaltoSaju) — 달토끼 달토 AI 사주 · 달토 사주 카드",
    description: "달토가 짚어주는 정밀 사주 풀이와 달토 사주 카드",
    siteName: "달토사주 (DaltoSaju)",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${notoSerifKr.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#fdf6f0] text-slate-900 font-sans selection:bg-violet-200/70 selection:text-slate-900">
        <main className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
