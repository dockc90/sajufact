"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Camera, Check, Download, Lock, Sparkles } from "lucide-react";
import { buildNatureStory, buildTodayCardStory } from "@/lib/nature-story";
import { ELEMENT_THEMES, calculateTodayFortune } from "@/lib/saju-engine";
import type { ElementKey, SajuReport, TodayFortuneReport } from "@/lib/saju-types";

interface ShareCardStudioProps {
  report: SajuReport;
  liveToday?: TodayFortuneReport;
  isSajuCardLocked?: boolean;
  walletCoins?: number;
  coinCost?: number;
  onUnlockSajuCard?: () => void;
}

type CardKind = "today" | "saju";
type CardRatio = "9:16" | "4:5";
export type CardTierKey = "SSR" | "SR" | "S" | "A";

export interface TierCardTheme {
  key: CardTierKey;
  tabLabel: string;
  sampleBadge: string;
  image: string;
  image916: string;
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
    image916: "/cards/tier-ssr-916.jpg",
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
    image916: "/cards/tier-sr-916.jpg",
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
    image916: "/cards/tier-s-916.jpg",
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
    image916: "/cards/tier-a-916.jpg",
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

const ELEMENT_CHIP_STYLES: Record<ElementKey, string> = {
  wood: "bg-[#eaf9f0] border-[#a7e6c0] text-[#11643b]",
  fire: "bg-[#fff0ee] border-[#ffc1b8] text-[#9b271c]",
  earth: "bg-[#fff7e5] border-[#f4d794] text-[#7c5009]",
  metal: "bg-[#eff5ff] border-[#bed6fb] text-[#1f4287]",
  water: "bg-[#f3efff] border-[#cfc1fb] text-[#4c2889]",
};

export function ShareCardStudio({
  report,
  liveToday,
  isSajuCardLocked = false,
  walletCoins = 0,
  coinCost = 1,
  onUnlockSajuCard,
}: ShareCardStudioProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardKind, setCardKind] = useState<CardKind>("today");
  const [ratio, setRatio] = useState<CardRatio>("9:16");
  const [downloading, setDownloading] = useState<CardRatio | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const theme = ELEMENT_THEMES[report.dominantElement];
  const nature = buildNatureStory(report);
  const cardTier = resolveCardTier(report.tierBadge);
  const tierTheme = TIER_CARD_THEMES[cardTier];

  const todayData =
    liveToday ??
    report.todayReport ??
    calculateTodayFortune(
      report.input,
      report.dayMasterHanja,
      report.dayBranchHanja || "午",
      report.weakestElement
    );
  const todayStory = buildTodayCardStory(report, todayData);
  const todayTierTheme = TIER_CARD_THEMES[todayStory.scoreTier];

  const dayPillar =
    report.pillars.find((p) => p.label === "일주") ?? report.pillars[1];

  const handleDownload = async (targetRatio: CardRatio) => {
    setRatio(targetRatio);
    setDownloading(targetRatio);

    await new Promise((r) => setTimeout(r, 140));

    if (!cardRef.current) {
      setDownloading(null);
      return;
    }

    const fileName =
      cardKind === "today"
        ? `daltosaju_${report.input.name}_today_${todayStory.score}pt_${targetRatio.replace(":", "x")}.png`
        : `daltosaju_${report.input.name}_tier_${cardTier.toLowerCase()}_${targetRatio.replace(":", "x")}.png`;

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

      setSavedToast(
        cardKind === "today"
          ? `${targetRatio} 오늘의 행운카드 (${todayStory.score}점)가 고화질 PNG로 저장되었습니다!`
          : `${targetRatio} ${cardTier} 티어 달토 사주 카드가 고화질 PNG로 저장되었습니다!`
      );
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
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-violet-700 bg-violet-100/80 px-2.5 py-0.5 rounded-full">
            <Camera className="w-3 h-3" />
            {cardKind === "today" ? "오늘의 행운카드" : "티어별 달토 사주 카드"}
          </span>
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            {cardKind === "today"
              ? `${todayStory.todayDateShort} · 행운 ${todayStory.score}점`
              : `${nature.stemEmoji} ${nature.stemShortName} · ${theme.nameKo} 기운`}
          </span>
        </div>
        <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 leading-snug break-keep">
          {cardKind === "today"
            ? `${report.input.name}님의 오늘의 행운카드 · ${todayStory.score}점`
            : `${report.input.name}님의 ${cardTier} 티어 사주 카드 · ${nature.stemShortName}`}
        </h3>
      </div>

      {/* 1차 탭: 오늘의 행운카드 / 사주 카드 */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-violet-100/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setCardKind("today")}
          className={`py-2 rounded-xl text-xs font-extrabold transition ${
            cardKind === "today"
              ? "bg-gradient-to-r from-[#5b469c] to-[#d96b8a] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ☀️ 오늘의 행운카드
        </button>
        <button
          type="button"
          onClick={() => setCardKind("saju")}
          className={`py-2 rounded-xl text-xs font-extrabold transition ${
            cardKind === "saju"
              ? "bg-gradient-to-r from-[#5b469c] to-[#d96b8a] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ✨ 사주 카드
        </button>
      </div>

      {/* 2차 탭: 9:16 / 4:5 비율 전환 */}
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

      {/* 카드 프리뷰 / PNG 저장 캡처 영역 */}
      {cardKind === "today" ? (
        <>
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className={`${
                ratio === "9:16" ? "w-[324px] h-[576px]" : "w-[340px] h-[425px]"
              } rounded-[28px] bg-gradient-to-br ${todayTierTheme.bg} text-[#2b2242] relative overflow-hidden shadow-[0_22px_55px_rgba(139,92,246,0.24)] border-2 border-white flex flex-col select-none transition-all duration-300`}
            >
              {/* 상단 풀블리드 행운지수 점수별 달토 일러스트 */}
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <img
                  src={ratio === "9:16" ? todayTierTheme.image916 : todayTierTheme.image}
                  alt={`오늘의 행운지수 ${todayStory.score}점 달토 카드`}
                  className="w-full h-full object-cover object-center"
                />
                {/* 상단 배지: 오늘 날짜·오행 + 오늘의 행운지수 점수 */}
                <div className="absolute inset-x-0 top-0 px-3 pt-3 flex items-center justify-between gap-2 pointer-events-none">
                  <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-white rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#4b3880] shadow-xs whitespace-nowrap">
                    {todayStory.todayElementEmoji} {todayStory.todayDateShort} · {todayStory.todayElementNameKo}의 날
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap shadow-xs ${todayTierTheme.accentPill}`}
                  >
                    🍀 {todayStory.score}점 · {todayStory.scoreTier}
                  </span>
                </div>
                <div
                  className={`absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t ${todayTierTheme.fadeColor} to-transparent pointer-events-none`}
                />
              </div>

              {/* 하단 오늘의 일진 스토리텔링 & 체크/주의 패널 */}
              <div
                className={`shrink-0 px-3.5 py-2 space-y-1.5 border-t border-white/90 ${todayTierTheme.panelBg}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold ${todayTierTheme.accentText}`}>
                    {report.input.name} · {nature.stemEmoji} {todayStory.myShortName}
                  </span>
                  <span className="text-[9.5px] font-extrabold text-slate-600 whitespace-nowrap">
                    {todayStory.todayGanZhiLabel} · {todayStory.scoreGradeLabel}
                  </span>
                </div>

                {/* 스토리텔링 메인 박스 */}
                <div className="rounded-2xl bg-white/92 border border-white px-3 py-2 text-center shadow-2xs">
                  <h4
                    className={`font-serif font-black leading-snug break-keep text-balance text-[#2b2242] ${
                      ratio === "9:16" ? "text-[12px]" : "text-[11px]"
                    }`}
                  >
                    “{todayStory.cardTitle}”
                  </h4>
                  <p
                    className={`text-slate-600 font-medium leading-snug break-keep text-balance mt-1 ${
                      ratio === "9:16" ? "text-[9.5px]" : "text-[8.5px]"
                    }`}
                  >
                    {todayStory.storyBody}
                  </p>
                </div>

                {/* 오늘 체크할 내용 / 주의할 내용 2칸 */}
                <div className="grid grid-cols-2 gap-1.5 text-left">
                  <div className="rounded-xl px-2.5 py-1.5 bg-[#eefbf5] border border-emerald-200/70">
                    <span className="text-[8px] font-extrabold text-emerald-700 block">
                      ✅ 오늘 체크
                    </span>
                    <span
                      className={`font-bold text-slate-800 leading-snug break-keep block ${
                        ratio === "9:16" ? "text-[9px]" : "text-[8px] line-clamp-2"
                      }`}
                    >
                      {todayStory.checkText}
                    </span>
                  </div>
                  <div className="rounded-xl px-2.5 py-1.5 bg-[#fff3f5] border border-rose-200/70">
                    <span className="text-[8px] font-extrabold text-rose-700 block">
                      ⚠️ 오늘 주의
                    </span>
                    <span
                      className={`font-bold text-slate-800 leading-snug break-keep block ${
                        ratio === "9:16" ? "text-[9px]" : "text-[8px] line-clamp-2"
                      }`}
                    >
                      {todayStory.cautionText}
                    </span>
                  </div>
                </div>

                {/* 9:16 스토리 전용 행운 방위·골든타임 바 */}
                {ratio === "9:16" && (
                  <div className="rounded-xl bg-white/88 border border-violet-100/80 px-2.5 py-1 text-[8.5px] font-bold text-slate-700 flex items-center justify-between gap-2">
                    <span className="truncate">⏰ {todayData.luckyTime}</span>
                    <span className="shrink-0 text-violet-700">🧭 {todayData.luckyDirection}</span>
                  </div>
                )}

                {/* 하단 워터마크 */}
                <div className="flex items-center justify-between gap-2 pt-0.5 text-[9.5px] text-[#55447a]">
                  <span className="flex items-center gap-1 font-bold break-keep leading-tight">
                    <Sparkles className="w-2.5 h-2.5 text-orange-500 shrink-0" />
                    #행운{todayStory.score}점 #{todayStory.todayElementTag}
                  </span>
                  <span className="font-serif text-[11px] font-black tracking-[0.12em] shrink-0">
                    🐇 daltosaju.com
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
        </>
      ) : isSajuCardLocked ? (
        <div className="rounded-3xl overflow-hidden border-2 border-white bg-gradient-to-br from-[#fce7f3] via-[#fff2ea] to-[#f4ecff] text-[#2b2242] shadow-lg">
          <div className="relative h-56 overflow-hidden">
            <img
              src={tierTheme.image}
              alt={`${cardTier} 티어 달토 사주 카드`}
              className="w-full h-full object-cover blur-[2.5px] scale-105 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/25 via-violet-950/35 to-[#fff8fc]/90 flex flex-col items-center justify-center p-4 text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10.5px] font-extrabold text-violet-700 mb-1.5 shadow">
                <Lock className="w-3 h-3" />
                {cardTier} 티어 달토 사주 카드 잠금됨
              </span>
              <p className="font-serif text-sm font-black text-white drop-shadow">
                {report.input.name}님 · {report.tierBadge}
              </p>
            </div>
          </div>
          <div className="p-3.5 bg-white/90 backdrop-blur-sm border-t border-white text-center space-y-2.5">
            <p className="text-xs text-slate-600 font-semibold break-keep">
              👑 SSR · 💎 SR · 🎀 S · 🌙 A 티어별 사주 카드 (오행 지수 포함 · {ratio} PNG 저장)
            </p>
            <button
              type="button"
              onClick={onUnlockSajuCard}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-500 text-white text-xs font-extrabold hover:brightness-105 transition shadow"
            >
              {walletCoins >= coinCost
                ? `🥕 당근 ${coinCost}개로 바로 열기 (보유 ${walletCoins}개)`
                : "🥕 당근 충전하고 달토 사주 카드 저장하기"}
            </button>
          </div>
        </div>
      ) : (
        <>
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
                  src={ratio === "9:16" ? tierTheme.image916 : tierTheme.image}
                  alt={`${cardTier} 티어 달토 카드`}
                  className="w-full h-full object-cover object-center"
                />
                {/* 상단 가장자리 작은 배지 2개 */}
                <div className="absolute inset-x-0 top-0 px-3 pt-3 flex items-center justify-between gap-2 pointer-events-none">
                  <span className="inline-flex items-center gap-1 bg-white/88 backdrop-blur-sm border border-white rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#4b3880] shadow-xs whitespace-nowrap">
                    {nature.stemEmoji} {nature.stemShortName}
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

              {/* 2) 하단 컴팩트 사주 물상 & 오행 지수 패널 */}
              <div
                className={`shrink-0 px-3.5 py-2 space-y-1.5 border-t border-white/90 ${tierTheme.panelBg}`}
              >
                {/* 이름 + 일주 + 주된 기운 */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10.5px] font-extrabold ${tierTheme.accentText}`}>
                    {report.input.name} · {dayPillar.hangul}({dayPillar.hanja})일주
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-600 whitespace-nowrap">
                    {nature.dominantSummary}
                  </span>
                </div>

                {/* 자연 물상 핵심 문구 + 부족한 기운 설명 */}
                <div className="rounded-2xl bg-white/90 border border-white px-3 py-2 text-center shadow-2xs">
                  <h4
                    className={`font-serif font-black leading-snug break-keep text-balance text-[#2b2242] ${
                      ratio === "9:16" ? "text-[12.5px]" : "text-[11px]"
                    }`}
                  >
                    “{nature.cardHeadline}”
                  </h4>
                  <p
                    className={`text-slate-600 font-medium leading-snug break-keep text-balance mt-1 ${
                      ratio === "9:16" ? "text-[9.5px]" : "text-[8px]"
                    }`}
                  >
                    {nature.cardStorySub}
                  </p>
                </div>

                {/* 부족한 기운 보완 컬러·숫자 & 추천 사물 2칸 */}
                <div className="grid grid-cols-2 gap-1.5 text-left">
                  <div className="rounded-xl px-2.5 py-1.5 bg-[#fff7ef] border border-orange-200/60">
                    <span className="text-[8px] font-bold text-orange-600 block">
                      {nature.missingEmoji} 부족한 {nature.missingShortKo} 보완
                    </span>
                    <span className="text-[9.5px] font-extrabold text-slate-900 leading-snug break-keep block">
                      {nature.missingColorShort} · 숫자 {nature.missingNumbers}
                    </span>
                  </div>
                  <div className="rounded-xl px-2.5 py-1.5 bg-[#f5f3ff] border border-violet-200/60">
                    <span className="text-[8px] font-bold text-violet-700 block">
                      🎒 지닐 행운 사물
                    </span>
                    <span className="text-[9.5px] font-extrabold text-slate-900 leading-snug break-keep block">
                      {nature.missingCarryShort}
                    </span>
                  </div>
                </div>

                {/* 5원소 오행 지수 표기 (9:16 · 4:5 공통) */}
                <div className="grid grid-cols-5 gap-1">
                  {report.elements.map((el) => (
                    <div
                      key={el.key}
                      className={`rounded-lg border px-1 text-center ${
                        ratio === "9:16" ? "py-1" : "py-0.5"
                      } ${ELEMENT_CHIP_STYLES[el.key]}`}
                    >
                      <span className="block text-[8px] font-bold leading-tight">
                        {el.nameKo}({el.hanja})
                      </span>
                      <span className="block text-[9.5px] font-black leading-tight">
                        {el.percentage}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* 하단 워터마크 */}
                <div className="flex items-center justify-between gap-2 pt-0.5 text-[9.5px] text-[#55447a]">
                  <span className="flex items-center gap-1 font-bold break-keep leading-tight">
                    <Sparkles className="w-2.5 h-2.5 text-orange-500 shrink-0" />
                    {report.hashtags.slice(0, 2).join(" ")}
                  </span>
                  <span className="font-serif text-[11px] font-black tracking-[0.12em] shrink-0">
                    🐇 daltosaju.com
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
        </>
      )}

      {savedToast && (
        <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 shrink-0" />
          {savedToast}
        </p>
      )}
    </section>
  );
}
