"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Camera, Check, Download, Sparkles } from "lucide-react";
import { ELEMENT_THEMES, toShortCardFact } from "@/lib/saju-engine";
import type { ElementKey, SajuReport } from "@/lib/saju-types";

interface ShareCardStudioProps {
  report: SajuReport;
}

type CardRatio = "9:16" | "4:5";
export type CardTierKey = "SSR" | "SR" | "S" | "A";

export interface TierCardTheme {
  key: CardTierKey;
  tabLabel: string;
  sampleBadge: string;
  image: string;
  bg: string;
  panelBg: string;
  accentPill: string;
  accentText: string;
  fadeColor: string;
}

export const TIER_CARD_THEMES: Record<CardTierKey, TierCardTheme> = {
  SSR: {
    key: "SSR",
    tabLabel: "👑 SSR",
    sampleBadge: "TIER: SSR · 상위 3%",
    image: "/cards/tier-ssr.jpg",
    bg: "from-[#fef3c7] via-[#fff5eb] to-[#f3e8ff]",
    panelBg: "bg-gradient-to-b from-[#fffaf0] via-[#fff6ec] to-[#faf5ff]",
    accentPill:
      "bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#7c3aed] text-white",
    accentText: "text-[#8a4b08]",
    fadeColor: "from-[#fffaf0]",
  },
  SR: {
    key: "SR",
    tabLabel: "💎 SR",
    sampleBadge: "TIER: SR · 상위 8%",
    image: "/cards/tier-sr.jpg",
    bg: "from-[#ede9fe] via-[#fdf2f8] to-[#fff7ed]",
    panelBg: "bg-gradient-to-b from-[#faf7ff] via-[#fdf5fb] to-[#fff9f3]",
    accentPill:
      "bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#ec4899] text-white",
    accentText: "text-[#5b21b6]",
    fadeColor: "from-[#faf7ff]",
  },
  S: {
    key: "S",
    tabLabel: "🎀 S",
    sampleBadge: "TIER: S · 상위 18%",
    image: "/cards/tier-s.jpg",
    bg: "from-[#fce7f3] via-[#fff2ea] to-[#f4ecff]",
    panelBg: "bg-gradient-to-b from-[#fff8fc] via-[#fff5fa] to-[#fdf6ff]",
    accentPill: "bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white",
    accentText: "text-[#9d174d]",
    fadeColor: "from-[#fff8fc]",
  },
  A: {
    key: "A",
    tabLabel: "🌙 A",
    sampleBadge: "TIER: A · 상위 32%",
    image: "/cards/tier-a.jpg",
    bg: "from-[#e0e7ff] via-[#f5f3ff] to-[#fff7ed]",
    panelBg: "bg-gradient-to-b from-[#f8f9ff] via-[#faf6ff] to-[#fffaf4]",
    accentPill: "bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] text-white",
    accentText: "text-[#3730a3]",
    fadeColor: "from-[#f8f9ff]",
  },
};

export function resolveCardTier(tierBadge?: string): CardTierKey {
  const upper = (tierBadge || "").toUpperCase();
  if (upper.includes("SSR")) return "SSR";
  if (upper.includes("SR")) return "SR";
  if (/\bS\b/.test(upper)) return "S";
  if (/\bA\b/.test(upper)) return "A";
  return "S";
}

const ELEMENT_PASTEL_BARS: Record<ElementKey, string> = {
  wood: "bg-[#8fd9a8]",
  fire: "bg-[#ffa89b]",
  earth: "bg-[#f7d08a]",
  metal: "bg-[#b8cff8]",
  water: "bg-[#c3b2f6]",
};

export function ShareCardStudio({ report }: ShareCardStudioProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<CardRatio>("9:16");
  const [downloading, setDownloading] = useState<CardRatio | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const theme = ELEMENT_THEMES[report.dominantElement];
  const cardTier = resolveCardTier(report.tierBadge);
  const tierTheme = TIER_CARD_THEMES[cardTier];

  const dayPillar =
    report.pillars.find((p) => p.label === "일주") ?? report.pillars[1];
  const bestMonth = [...report.monthlyFlow].sort((a, b) => b.score - a.score)[0];
  const shortFact = toShortCardFact(report.oneLineFact, 40);
  const shortDangerMonth = report.criticalMistake2027.dangerMonth
    .split("(")[0]
    .trim();

  const handleDownload = async (targetRatio: CardRatio) => {
    setRatio(targetRatio);
    setDownloading(targetRatio);

    await new Promise((r) => setTimeout(r, 140));

    if (!cardRef.current) {
      setDownloading(null);
      return;
    }

    const fileName = `daltosaju_${report.input.name}_tier_${cardTier.toLowerCase()}_${targetRatio.replace(":", "x")}.png`;

    try {
      let dataUrl: string;
      try {
        dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        });
      } catch {
        dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          skipFonts: true,
        });
      }

      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setSavedToast(`${targetRatio} ${cardTier} 티어 오라 카드가 고화질 PNG로 저장되었습니다!`);
      setTimeout(() => setSavedToast(null), 3000);
    } catch {
      setSavedToast("이미지 생성 중 잠시 오류가 발생했습니다. 다시 시도해 주세요.");
      setTimeout(() => setSavedToast(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3.5 border border-white/90">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-violet-700 bg-violet-100/80 px-2.5 py-0.5 rounded-full">
            <Camera className="w-3 h-3" />
            티어별 달토 오라 인스타그램 카드
          </span>
          <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 mt-1">
            {report.input.name}님의 {cardTier} 티어 카드 · {theme.nameKo}
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
          {theme.auraLabel}
        </span>
      </div>

      {/* 4단계 티어 희귀도 표시 바 (사주 결과 티어 자동 매칭) */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-violet-100/70 rounded-2xl">
        {(["SSR", "SR", "S", "A"] as CardTierKey[]).map((tKey) => {
          const isMine = cardTier === tKey;
          return (
            <div
              key={tKey}
              className={`py-1.5 px-1 rounded-xl text-[10.5px] sm:text-[11px] font-extrabold text-center transition whitespace-nowrap ${
                isMine
                  ? `${TIER_CARD_THEMES[tKey].accentPill} shadow-sm`
                  : "text-slate-500 bg-white/40"
              }`}
            >
              {TIER_CARD_THEMES[tKey].tabLabel}
              {isMine ? " · 내 등급" : ""}
            </div>
          );
        })}
      </div>

      {/* 9:16 / 4:5 비율 전환 탭 */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-orange-100/60 rounded-2xl">
        <button
          type="button"
          onClick={() => setRatio("9:16")}
          className={`py-1.5 rounded-xl text-xs font-extrabold transition ${
            ratio === "9:16"
              ? "bg-white text-orange-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          9:16 (스토리·릴스)
        </button>
        <button
          type="button"
          onClick={() => setRatio("4:5")}
          className={`py-1.5 rounded-xl text-xs font-extrabold transition ${
            ratio === "4:5"
              ? "bg-white text-orange-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          4:5 (피드용)
        </button>
      </div>

      {/* PNG 저장 캡처 영역 — 티어 전용 달토 일러스트 + 하단 파스텔 오라 정보 패널 */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className={`${
            ratio === "9:16" ? "w-[324px] h-[576px]" : "w-[340px] h-[425px]"
          } rounded-[28px] bg-gradient-to-br ${tierTheme.bg} text-[#2b2242] relative overflow-hidden shadow-[0_22px_55px_rgba(139,92,246,0.24)] border-2 border-white flex flex-col select-none transition-all duration-300`}
        >
          {/* 1) 상단 풀블리드 티어 전용 달토 사진 */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <img
              src={tierTheme.image}
              alt={`${cardTier} 티어 달토 카드`}
              className="w-full h-full object-cover object-center"
            />
            {/* 상단 가장자리 작은 배지 2개 */}
            <div className="absolute inset-x-0 top-0 px-3 pt-3 flex items-center justify-between gap-2 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-white/88 backdrop-blur-sm border border-white rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#4b3880] shadow-xs whitespace-nowrap">
                🐇 달토 오라 · {theme.nameKo}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold whitespace-nowrap shadow-xs ${tierTheme.accentPill}`}
              >
                {report.tierBadge}
              </span>
            </div>
            {/* 하단 패널과 자연스럽게 이어지는 파스텔 페이드 */}
            <div
              className={`absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t ${tierTheme.fadeColor} to-transparent pointer-events-none`}
            />
          </div>

          {/* 2) 하단 컴팩트 파스텔 정보 패널 */}
          <div
            className={`shrink-0 px-3.5 py-2.5 space-y-2 border-t border-white/90 ${tierTheme.panelBg}`}
          >
            {/* 이름 + 일주 + 4주 한자 미니 배지 */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10.5px] font-extrabold truncate ${tierTheme.accentText}`}>
                {report.input.name} · {dayPillar.hangul}({dayPillar.hanja})일주
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {report.pillars.map((p) => (
                  <span
                    key={p.label}
                    className="px-1.5 py-0.5 rounded-md bg-white border border-violet-100 text-[9px] font-serif font-black text-[#2b2242]"
                  >
                    {p.hanja}
                  </span>
                ))}
              </div>
            </div>

            {/* 달토 핵심 총평 */}
            <div className="rounded-2xl bg-white/90 border border-white px-3 py-2 text-center shadow-2xs">
              <h4
                className={`font-serif font-black leading-snug break-keep text-balance text-[#2b2242] ${
                  ratio === "9:16" ? "text-[13px]" : "text-[12px]"
                }`}
              >
                “{shortFact}”
              </h4>
            </div>

            {/* 횡재 & 주의 2칸 미니 지표 */}
            <div className="grid grid-cols-2 gap-1.5 text-left">
              <div className="rounded-xl px-2.5 py-1.5 bg-[#fff7ef] border border-orange-200/60">
                <span className="text-[8px] font-bold text-orange-600 block">
                  🥕 횡재 피크
                </span>
                <span className="text-[10px] font-extrabold text-slate-900 whitespace-nowrap">
                  {bestMonth.label} ({bestMonth.score}점)
                </span>
              </div>
              <div className="rounded-xl px-2.5 py-1.5 bg-[#fff1f4] border border-rose-200/60">
                <span className="text-[8px] font-bold text-rose-600 block">
                  ⚠️ 주의 시기
                </span>
                <span className="text-[10px] font-extrabold text-slate-900 whitespace-nowrap">
                  {shortDangerMonth}
                </span>
              </div>
            </div>

            {/* 9:16 스토리 전용 — 얇은 오행 오라 바 + 달토 1줄 처방 */}
            {ratio === "9:16" && (
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-white border border-white">
                  {report.elements.map((el) => (
                    <div
                      key={el.key}
                      style={{ width: `${Math.max(5, el.percentage)}%` }}
                      className={`h-full ${ELEMENT_PASTEL_BARS[el.key]}`}
                    />
                  ))}
                </div>
                <p className="rounded-xl bg-white/80 border border-violet-100/80 px-2.5 py-1 text-[9.5px] font-semibold text-slate-700 leading-snug break-keep text-balance">
                  💌 {report.talisman.talismanMantra}
                </p>
              </div>
            )}

            {/* 하단 워터마크 */}
            <div className="flex items-center justify-between gap-2 pt-0.5 text-[9.5px] text-[#55447a]">
              <span className="flex items-center gap-1 font-bold break-keep leading-tight">
                <Sparkles className="w-2.5 h-2.5 text-orange-500 shrink-0" />
                {report.hashtags.slice(0, 2).join(" ")}
              </span>
              <span className="font-serif text-[11px] font-black tracking-[0.16em] shrink-0">
                🐇 sajufact.kr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PNG 저장 버튼 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={downloading !== null}
          onClick={() => handleDownload("9:16")}
          className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#5c489b] to-[#c96a8b] hover:brightness-105 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === "9:16" ? "저장 중..." : "9:16 스토리 PNG 저장"}
        </button>
        <button
          type="button"
          disabled={downloading !== null}
          onClick={() => handleDownload("4:5")}
          className="py-3 px-3 rounded-2xl bg-white hover:bg-violet-50 border border-violet-200 text-[#4c3787] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === "4:5" ? "저장 중..." : "4:5 피드 PNG 저장"}
        </button>
      </div>

      {savedToast && (
        <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 shrink-0" />
          {savedToast}
        </p>
      )}
    </section>
  );
}
