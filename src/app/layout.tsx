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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sajufact.kr"),
  title: "사주팩트 (SajuFact) | AI 명리 사주·수호 영물 카드",
  description:
    "2027 정미년 신년운세, 평생 사주 원국 풀이, 재물·이직운, 연애·궁합 스캔, 오늘의 무료 타로까지. 내 오행 수호 영물 화보와 정밀 운세 카드를 소장하세요.",
  openGraph: {
    title: "사주팩트 (SajuFact) — 팩트 기반 AI 사주·수호 영물",
    description: "내 사주 오행 수호 영물 카드와 정밀 2027 운세 리포트",
    siteName: "사주팩트 (SajuFact)",
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
      <body className="min-h-full bg-[#f6f3ef] text-slate-900 font-sans selection:bg-amber-200/70 selection:text-slate-900">
        <main className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
