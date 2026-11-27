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
  title: "사주팩트 (SajuFact) | 위로 대신 뼈 때리는 AI 사주·타로",
  description:
    "2027 정미년 신년운세, 평생 사주 팩폭, 재물·이직운, 연애·궁합 스캔, 오늘의 무료 타로까지. PC와 모바일 웹에서 오라(Aura) 모던 동양화 운명 카드를 저장하세요.",
  openGraph: {
    title: "사주팩트 (SajuFact) — 위로 빼고 팩트만",
    description: "내 사주 오행 오라(Aura) 카드와 뼈 때리는 2027 운세 리포트",
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
