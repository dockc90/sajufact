"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Camera, Check, Sparkles } from "lucide-react";
import { ELEMENT_THEMES } from "@/lib/saju-engine";
import type { ElementKey, SajuReport } from "@/lib/saju-types";
import {
  OrientalCardFrameSvg,
  OrientalElementArt,
  VermilionSealSvg,
} from "./OrientalArtSvg";

interface ShareCardStudioProps {
  report: SajuReport;
}

type CardRatio = "9:16" | "4:5";
export type CardEdition = "aura" | "receipt" | "tarot";

const ARCHETYPE_BY_ELEMENT: Record<ElementKey, string> = {
  wood: "꺾이지 않는 기획자 · 청룡의 결",
  fire: "무대 위 불도저 · 주작의 결",
  earth: "판을 쥐는 실세 · 황룡의 결",
  metal: "서늘한 팩트 칼잡이 · 백호의 결",
  water: "속을 읽는 전략가 · 현무의 결",
};

export function ShareCardStudio({ report }: ShareCardStudioProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [edition, setEdition] = useState<CardEdition>("aura");
  const [ratio, setRatio] = useState<CardRatio>("9:16");
  const [activeElement, setActiveElement] = useState<ElementKey>(report.dominantElement);
  const [downloading, setDownloading] = useState<CardRatio | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const theme = ELEMENT_THEMES[activeElement];
  const dayPillar = report.pillars.find((p) => p.label === "일주") ?? report.pillars[1];
  const bestMonth = [...report.monthlyFlow].sort((a, b) => b.score - a.score)[0];
  const worstMonth = [...report.monthlyFlow].sort((a, b) => a.score - b.score)[0];
  const shortOrgan = report.healthReport.vulnerableOrgans.split("·")[0]?.trim() || "자율신경";

  // 4대 능력치 (영수증 에디션 시각화용)
  const wealthStat = Math.min(98, bestMonth.score);
  const charmStat = Math.min(96, 72 + (report.elements.find((e) => e.key === "fire")?.percentage ?? 15));
  const mentalStat = Math.max(48, 100 - Math.round(worstMonth.score * 0.35));
  const factStat = 99;

  const handleDownload = async (targetRatio: CardRatio) => {
    setRatio(targetRatio);
    setDownloading(targetRatio);

    await new Promise((r) => setTimeout(r, 140));

    if (!cardRef.current) {
      setDownloading(null);
      return;
    }

    const fileName = `sajufact_${report.input.name}_${edition}_${targetRatio.replace(":", "x")}.png`;

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

      setSavedToast(`${targetRatio} 에디션 카드가 고화질 PNG로 저장되었습니다!`);
      setTimeout(() => setSavedToast(null), 3000);
    } catch {
      setSavedToast("이미지 생성 중 잠시 오류가 발생했습니다. 다시 시도해 주세요.");
      setTimeout(() => setSavedToast(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <section className="glass-card rounded-3xl p-5 space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full shrink-0">
            <Camera className="w-3 h-3" />
            인스타그램 소장용 결과 카드
          </span>
          <span className="text-[11px] font-semibold text-slate-500 truncate">
            {edition === "receipt" ? "FACT RECEIPT" : theme.auraLabel}
          </span>
        </div>
        <h3 className="font-serif text-lg font-extrabold text-slate-900 mt-1.5 break-keep">
          나의 오라(Aura) 운명 카드
        </h3>
      </div>

      {/* 3종 컨셉 스킨(Edition) 선택 */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setEdition("aura")}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition ${
            edition === "aura"
              ? "bg-slate-900 text-amber-200 shadow-sm"
              : "text-slate-700 hover:bg-white/60"
          }`}
        >
          ✨ 오라 동양화
        </button>
        <button
          type="button"
          onClick={() => setEdition("receipt")}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition ${
            edition === "receipt"
              ? "bg-slate-900 text-amber-200 shadow-sm"
              : "text-slate-700 hover:bg-white/60"
          }`}
        >
          🧾 팩폭 영수증
        </button>
        <button
          type="button"
          onClick={() => setEdition("tarot")}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition ${
            edition === "tarot"
              ? "bg-slate-900 text-amber-200 shadow-sm"
              : "text-slate-700 hover:bg-white/60"
          }`}
        >
          🌙 홀로그램 타로
        </button>
      </div>

      {/* 오행 컬러 팔레트 선택 (오라/타로 스킨에서 활용) */}
      {edition !== "receipt" && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {(Object.keys(ELEMENT_THEMES) as ElementKey[]).map((elKey) => {
            const elTheme = ELEMENT_THEMES[elKey];
            const isAuto = elKey === report.dominantElement;
            const isActive = elKey === activeElement;
            return (
              <button
                key={elKey}
                type="button"
                onClick={() => setActiveElement(elKey)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white/75 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                {elTheme.nameKo} {isAuto ? "· 내 오라" : ""}
              </button>
            );
          })}
        </div>
      )}

      {/* 비율 전환 탭 */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setRatio("9:16")}
          className={`py-2 rounded-xl text-xs font-bold transition ${
            ratio === "9:16"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          9:16 (스토리·릴스용)
        </button>
        <button
          type="button"
          onClick={() => setRatio("4:5")}
          className={`py-2 rounded-xl text-xs font-bold transition ${
            ratio === "4:5"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          4:5 (피드용)
        </button>
      </div>

      {/* 실제 PNG 캡처 대상 카드 */}
      <div className="flex justify-center">
        {edition === "aura" && (
          <div
            ref={cardRef}
            style={{
              background: theme.cardBgStyle,
              color: theme.textOnCard,
            }}
            className={`${
              ratio === "9:16"
                ? "w-[324px] h-[576px] p-5"
                : "w-[340px] h-[425px] p-4"
            } rounded-[26px] relative overflow-hidden shadow-[0_24px_60px_rgba(20,18,35,0.24)] flex flex-col justify-between select-none transition-all duration-300`}
          >
            {/* 다층 오라 글로우 */}
            <div
              className="absolute -top-14 -right-14 w-52 h-52 rounded-full blur-2xl opacity-55 pointer-events-none"
              style={{ background: theme.goldPrimary }}
            />
            <div
              className="absolute -bottom-16 -left-14 w-56 h-56 rounded-full blur-2xl opacity-35 pointer-events-none"
              style={{ background: theme.accentColor }}
            />
            <OrientalCardFrameSvg color={theme.goldPrimary} />

            {/* 상단 에디토리얼 바 */}
            <div className="relative z-10 flex items-center justify-between pt-1 px-1">
              <div>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-75 block">
                  SAJUFACT · 2027 EDITION
                </span>
                <span className="text-[10px] font-extrabold tracking-tight">
                  {ARCHETYPE_BY_ELEMENT[activeElement]}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide shadow-sm ${theme.badgeBg}`}
              >
                {report.tierBadge}
              </span>
            </div>

            {/* 중앙 일러스트 + 좌우 명식 + 팩트폭격 */}
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="relative flex items-center justify-center w-full">
                <OrientalElementArt
                  element={activeElement}
                  goldPrimary={theme.goldPrimary}
                  goldSecondary={theme.goldSecondary}
                  dayMasterHanja={report.dayMasterHanja}
                  className={ratio === "9:16" ? "w-36 h-36" : "w-24 h-24"}
                  idPrefix="aura-ed"
                />
                {/* 좌측 4주 8자 미니 세로 인장 */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 text-[9px] font-serif font-bold opacity-80">
                  {report.pillars.map((p) => (
                    <span
                      key={p.label}
                      className="px-1.5 py-0.5 rounded border border-current/20 bg-white/15 backdrop-blur-sm"
                    >
                      {p.hanja}
                    </span>
                  ))}
                </div>
                {/* 우측 주홍 낙관 */}
                <div className="absolute right-1 bottom-1">
                  <VermilionSealSvg label="팩트印" className="w-9 h-9 opacity-90" />
                </div>
              </div>

              <p
                className="text-[11px] font-bold tracking-wide mt-1"
                style={{ color: theme.subTextOnCard }}
              >
                {report.input.name} · {dayPillar.hangul}({dayPillar.hanja})일주
              </p>

              <h4
                className={`font-serif leading-snug font-black mt-1 px-2 break-keep ${
                  ratio === "9:16" ? "text-[16px]" : "text-[14px]"
                }`}
              >
                “{report.oneLineFact}”
              </h4>

              {/* 2027 핵심 시그널 4칸 그리드 */}
              <div
                className={`w-full grid grid-cols-2 gap-1.5 text-left ${
                  ratio === "9:16" ? "mt-3.5" : "mt-2"
                }`}
              >
                <div
                  className="rounded-xl px-2.5 py-1.5 border border-current/10"
                  style={{
                    backgroundColor: theme.isDarkCard
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.55)",
                  }}
                >
                  <span className="text-[8px] font-bold opacity-70 block">💰 횡재 피크</span>
                  <span className="text-[10px] font-extrabold">
                    2027년 {bestMonth.label} ({bestMonth.score}점)
                  </span>
                </div>
                <div
                  className="rounded-xl px-2.5 py-1.5 border border-current/10"
                  style={{
                    backgroundColor: theme.isDarkCard
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.55)",
                  }}
                >
                  <span className="text-[8px] font-bold opacity-70 block">⚠️ 절대 주의</span>
                  <span className="text-[10px] font-extrabold">
                    2027년 4월 & {worstMonth.label}
                  </span>
                </div>
                <div
                  className="rounded-xl px-2.5 py-1.5 border border-current/10"
                  style={{
                    backgroundColor: theme.isDarkCard
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.55)",
                  }}
                >
                  <span className="text-[8px] font-bold opacity-70 block">🩺 취약 체질</span>
                  <span className="text-[10px] font-extrabold truncate block">
                    {shortOrgan}
                  </span>
                </div>
                <div
                  className="rounded-xl px-2.5 py-1.5 border border-current/10"
                  style={{
                    backgroundColor: theme.isDarkCard
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.55)",
                  }}
                >
                  <span className="text-[8px] font-bold opacity-70 block">✨ 개운 컬러</span>
                  <span className="text-[10px] font-extrabold truncate block">
                    {report.talisman.luckyColor.split("&")[0].trim()}
                  </span>
                </div>
              </div>

              {/* 오행 스펙트럼 */}
              <div className={`w-full grid grid-cols-5 gap-1.5 text-center ${ratio === "9:16" ? "mt-3" : "mt-2"}`}>
                {report.elements.map((el) => (
                  <div key={el.key} className="flex flex-col items-center">
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden mb-0.5"
                      style={{
                        backgroundColor: theme.isDarkCard
                          ? "rgba(255,255,255,0.16)"
                          : "rgba(15,23,42,0.12)",
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(14, el.percentage)}%`,
                          backgroundColor: theme.goldPrimary,
                        }}
                      />
                    </div>
                    <span className="text-[8.5px] font-bold opacity-85">
                      {el.nameKo} {el.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 워터마크 */}
            <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-current/15 px-1">
              <span className="text-[9.5px] opacity-80 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {report.hashtags.slice(0, 2).join(" ")}
              </span>
              <span className="font-serif text-[11px] font-black tracking-[0.2em]">
                sajufact.kr
              </span>
            </div>
          </div>
        )}

        {edition === "receipt" && (
          <div
            ref={cardRef}
            className={`${
              ratio === "9:16"
                ? "w-[324px] h-[576px] p-5"
                : "w-[340px] h-[425px] p-4"
            } rounded-[20px] bg-[#fdfaf2] text-slate-900 relative overflow-hidden shadow-[0_24px_60px_rgba(20,18,35,0.22)] border border-stone-300 flex flex-col justify-between select-none transition-all duration-300`}
          >
            {/* 상단 영수증 헤더 */}
            <div className="border-b-2 border-dashed border-slate-900/25 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-black tracking-tight">
                  SAJUFACT RECEIPT
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                  #{report.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                <span>OWNER: {report.input.name} ({dayPillar.hanja}일주)</span>
                <span>{report.tierBadge}</span>
              </div>
            </div>

            {/* 사주 원국 스탬프 & 능력치 */}
            <div className="my-auto space-y-2.5">
              {/* 4주 바 */}
              <div className="grid grid-cols-4 gap-1.5 text-center bg-stone-200/60 p-1.5 rounded-xl">
                {report.pillars.map((p) => (
                  <div key={p.label} className="bg-white rounded-lg py-1">
                    <span className="text-[8px] font-bold text-slate-400 block">{p.label}</span>
                    <span className="font-serif text-xs font-black text-slate-900">{p.hanja}</span>
                  </div>
                ))}
              </div>

              {/* 뼈 때리는 처방 문구 */}
              <div className="relative bg-white border border-stone-300 rounded-xl p-3 shadow-sm">
                <span className="text-[9px] font-mono font-bold text-rose-600 block mb-0.5">
                  [FACT PRESCRIPTION · 팩트 처방전]
                </span>
                <p
                  className={`font-serif font-black text-slate-900 leading-snug break-keep ${
                    ratio === "9:16" ? "text-[15px]" : "text-[13.5px]"
                  }`}
                >
                  “{report.oneLineFact}”
                </p>
                <div className="absolute -right-1 -bottom-2 rotate-[-8deg]">
                  <VermilionSealSvg label="팩폭印" className="w-10 h-10" />
                </div>
              </div>

              {/* 4대 운세 스탯 바 */}
              <div className="space-y-1.5 font-mono text-[10px]">
                {[
                  { label: "재물·횡재운", val: wealthStat, color: "bg-emerald-600" },
                  { label: "도화·매력지수", val: charmStat, color: "bg-rose-500" },
                  { label: "멘탈·체력방어", val: mentalStat, color: "bg-amber-600" },
                  { label: "팩폭 적중률", val: factStat, color: "bg-slate-900" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="w-24 font-bold text-slate-700 shrink-0">{stat.label}</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color}`} style={{ width: `${stat.val}%` }} />
                    </div>
                    <span className="w-8 text-right font-extrabold">{stat.val}%</span>
                  </div>
                ))}
              </div>

              {/* 영수증 상세 품목 테이블 */}
              <div className="border-t border-b border-dashed border-slate-900/25 py-2 space-y-1 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">01. 2027 대박 피크</span>
                  <span className="font-bold text-emerald-700">{bestMonth.label} ({bestMonth.tag})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">02. 절대 주의 고비</span>
                  <span className="font-bold text-rose-600">4월 & {worstMonth.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">03. 취약 건강 부위</span>
                  <span className="font-bold text-slate-900">{shortOrgan}</span>
                </div>
                {ratio === "9:16" && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">04. 액땜 행운 숫자</span>
                    <span className="font-bold text-slate-900">NO. {report.talisman.luckyNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 하단 바코드 & 워터마크 */}
            <div className="pt-1 flex items-end justify-between">
              <div className="flex items-end gap-[1.5px] h-6 opacity-80">
                {[3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2].map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-900 h-full inline-block"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-400 block">
                  TOTAL: FACT ONLY
                </span>
                <span className="font-serif text-[11px] font-black tracking-[0.2em]">
                  sajufact.kr
                </span>
              </div>
            </div>
          </div>
        )}

        {edition === "tarot" && (
          <div
            ref={cardRef}
            style={{
              background:
                "radial-gradient(circle at 25% 20%, #3b2667 0%, #16112b 48%, #090714 100%)",
            }}
            className={`${
              ratio === "9:16"
                ? "w-[324px] h-[576px] p-5"
                : "w-[340px] h-[425px] p-4"
            } rounded-[26px] text-[#f9f3e3] relative overflow-hidden shadow-[0_24px_60px_rgba(10,8,28,0.45)] border border-amber-300/40 flex flex-col justify-between select-none transition-all duration-300`}
          >
            {/* 홀로그램 프리즘 광채 */}
            <div className="absolute -top-20 -left-16 w-56 h-56 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-16 w-56 h-56 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
            <OrientalCardFrameSvg color="#f0d285" />

            {/* 상단 아르카나 타이틀 */}
            <div className="relative z-10 text-center pt-1">
              <span className="text-[9px] font-bold tracking-[0.28em] text-amber-300/85 uppercase">
                ARCANA {dayPillar.hanja} · {report.tierBadge}
              </span>
              <p className="font-serif text-xs font-extrabold text-amber-100 mt-0.5">
                {report.input.name}님의 운명 타로 · {ARCHETYPE_BY_ELEMENT[activeElement]}
              </p>
            </div>

            {/* 중앙 금박 만다라 + 팩폭 */}
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <OrientalElementArt
                element={activeElement}
                goldPrimary="#f5db94"
                goldSecondary="#b8892c"
                dayMasterHanja={report.dayMasterHanja}
                className={ratio === "9:16" ? "w-40 h-40" : "w-24 h-24"}
                idPrefix="tarot-ed"
              />

              <h4
                className={`font-serif leading-snug font-black text-amber-50 mt-1.5 px-2 break-keep ${
                  ratio === "9:16" ? "text-[16px]" : "text-[14px]"
                }`}
              >
                “{report.oneLineFact}”
              </h4>

              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {report.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-300/15 border border-amber-300/35 text-amber-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 타로 카드 하단 운명 요약 바 */}
              <div
                className={`w-full grid grid-cols-3 gap-1.5 text-center ${
                  ratio === "9:16" ? "mt-4" : "mt-2.5"
                }`}
              >
                <div className="rounded-xl bg-white/5 border border-amber-200/20 py-1.5 px-1">
                  <span className="text-[8px] text-amber-200/70 block">횡재 달</span>
                  <span className="text-[10px] font-extrabold text-emerald-300">
                    {bestMonth.label}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 border border-amber-200/20 py-1.5 px-1">
                  <span className="text-[8px] text-amber-200/70 block">조심 달</span>
                  <span className="text-[10px] font-extrabold text-rose-300">
                    4월·{worstMonth.label}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 border border-amber-200/20 py-1.5 px-1">
                  <span className="text-[8px] text-amber-200/70 block">수호 부적</span>
                  <span className="text-[10px] font-extrabold text-amber-200 truncate block px-0.5">
                    {report.talisman.talismanTitle.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* 하단 워터마크 */}
            <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-amber-200/20 px-1 text-amber-200/80">
              <span className="text-[9.5px]">{theme.guardianName}</span>
              <span className="font-serif text-[11px] font-black tracking-[0.2em] text-amber-200">
                sajufact.kr
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PNG 저장 버튼 2개 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={downloading !== null}
          onClick={() => handleDownload("9:16")}
          className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === "9:16" ? "생성 중..." : "9:16 저장 (스토리·릴스)"}
        </button>
        <button
          type="button"
          disabled={downloading !== null}
          onClick={() => handleDownload("4:5")}
          className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === "4:5" ? "생성 중..." : "4:5 저장 (피드용)"}
        </button>
      </div>

      {savedToast && (
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3">
          <Check className="w-4 h-4" />
          {savedToast}
        </div>
      )}
    </section>
  );
}
