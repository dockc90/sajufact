"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Camera, Check, Sparkles } from "lucide-react";
import {
  ELEMENT_THEMES,
  GUARDIAN_BEAST_META,
  toShortCardFact,
} from "@/lib/saju-engine";
import type { ElementKey, SajuReport } from "@/lib/saju-types";
import { VermilionSealSvg } from "./OrientalArtSvg";

interface ShareCardStudioProps {
  report: SajuReport;
}

type CardRatio = "9:16" | "4:5";
export type CardEdition = "aura" | "baby" | "receipt";

export function ShareCardStudio({ report }: ShareCardStudioProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [edition, setEdition] = useState<CardEdition>("aura");
  const [ratio, setRatio] = useState<CardRatio>("9:16");
  const [activeElement, setActiveElement] = useState<ElementKey>(
    report.dominantElement
  );
  const [downloading, setDownloading] = useState<CardRatio | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const theme = ELEMENT_THEMES[activeElement];
  const guardian = GUARDIAN_BEAST_META[activeElement];
  const dayPillar =
    report.pillars.find((p) => p.label === "일주") ?? report.pillars[1];
  const bestMonth = [...report.monthlyFlow].sort((a, b) => b.score - a.score)[0];
  const worstMonth = [...report.monthlyFlow].sort((a, b) => a.score - b.score)[0];
  const shortFact = toShortCardFact(report.oneLineFact, 44);

  const wealthStat = Math.min(98, bestMonth.score);
  const charmStat = Math.min(
    96,
    72 + (report.elements.find((e) => e.key === "fire")?.percentage ?? 15)
  );
  const driveStat = Math.min(
    97,
    74 + (report.elements.find((e) => e.key === "wood")?.percentage ?? 14)
  );
  const shieldStat = Math.max(54, 100 - Math.round(worstMonth.score * 0.35));

  const isBabyMode = edition === "baby";
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

      setSavedToast(`${targetRatio} 수호신 카드가 고화질 PNG로 저장되었습니다!`);
      setTimeout(() => setSavedToast(null), 3000);
    } catch {
      setSavedToast("이미지 생성 중 잠시 오류가 발생했습니다. 다시 시도해 주세요.");
      setTimeout(() => setSavedToast(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
            <Camera className="w-3 h-3" />
            인스타 소장용 수호신 카드
          </span>
          <h3 className="font-serif text-base sm:text-lg font-extrabold text-slate-900 mt-1">
            {isBabyMode ? guardian.babyNameKo : guardian.nameKo} · {theme.nameKo}
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
          {theme.auraLabel}
        </span>
      </div>

      {/* 3종 컨셉 카드 탭 (신수 아르카나 제거 -> 영험한 신수 / 아기 신수 / 천명 감정서) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setEdition("aura")}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap ${
            edition === "aura"
              ? "bg-slate-900 text-amber-200 shadow-sm"
              : "text-slate-700 hover:bg-white/60"
          }`}
        >
          🐅 영험한 신수
        </button>
        <button
          type="button"
          onClick={() => setEdition("baby")}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap ${
            edition === "baby"
              ? "bg-slate-900 text-amber-200 shadow-sm"
              : "text-slate-700 hover:bg-white/60"
          }`}
        >
          🐾 아기 신수
        </button>
        <button
          type="button"
          onClick={() => setEdition("receipt")}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap ${
            edition === "receipt"
              ? "bg-slate-900 text-amber-200 shadow-sm"
              : "text-slate-700 hover:bg-white/60"
          }`}
        >
          📜 천명 감정서
        </button>
      </div>

      {/* 5대 수호 영물 선택 */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {(Object.keys(ELEMENT_THEMES) as ElementKey[]).map((elKey) => {
          const elGuardian = GUARDIAN_BEAST_META[elKey];
          const isAuto = elKey === report.dominantElement;
          const isActive = elKey === activeElement;
          return (
            <button
              key={elKey}
              type="button"
              onClick={() => setActiveElement(elKey)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition ${
                isActive
                  ? "bg-slate-900 text-amber-200 border-slate-900 shadow-sm"
                  : "bg-white/75 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              {isBabyMode ? elGuardian.babyNameKo : elGuardian.nameKo}
              {isAuto ? " ★" : ""}
            </button>
          );
        })}
      </div>

      {/* 비율 전환 탭 */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setRatio("9:16")}
          className={`py-1.5 rounded-xl text-xs font-bold transition ${
            ratio === "9:16"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          9:16 (스토리·릴스)
        </button>
        <button
          type="button"
          onClick={() => setRatio("4:5")}
          className={`py-1.5 rounded-xl text-xs font-bold transition ${
            ratio === "4:5"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          4:5 (피드용)
        </button>
      </div>

      {/* PNG 캡처 대상 카드 — 이미지 영역과 하단 정보 영역 완전 분리 (글자 겹침 0%) */}
      <div className="flex justify-center">
        {(edition === "aura" || edition === "baby") && (
          <div
            ref={cardRef}
            className={`${
              ratio === "9:16" ? "w-[324px] h-[576px]" : "w-[340px] h-[425px]"
            } rounded-[24px] overflow-hidden shadow-[0_24px_60px_rgba(10,8,24,0.34)] border border-amber-300/40 flex flex-col select-none transition-all duration-300 ${
              isBabyMode ? "bg-[#fff9f3] text-slate-900" : "bg-[#0d0c18] text-white"
            }`}
          >
            {/* 1) 상단 전용 수호신 이미지 영역 (가운데 그림 가리는 텍스트/도장 일절 없음) */}
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <img
                src={isBabyMode ? guardian.babyImage : guardian.image}
                alt={isBabyMode ? guardian.babyNameKo : guardian.nameKo}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-slate-950/75 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 px-3 pt-2.5 flex items-center justify-between gap-2">
                <span className="rounded-full bg-slate-950/65 backdrop-blur-sm border border-amber-200/35 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-200 whitespace-nowrap">
                  {isBabyMode ? guardian.babyNameKo : guardian.nameKo} · {guardian.hanja}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold whitespace-nowrap shadow ${theme.badgeBg}`}
                >
                  {report.tierBadge}
                </span>
              </div>
            </div>

            {/* 2) 하단 전용 정보 패널 (이미지와 완벽히 분리) */}
            <div
              className={`shrink-0 px-3.5 py-3 flex flex-col justify-between gap-2 border-t ${
                isBabyMode
                  ? "bg-gradient-to-b from-[#fff7ef] to-[#f8effa] border-amber-200/80"
                  : "bg-[#111020] border-amber-300/30"
              }`}
            >
              {/* 이름 + 일주 + 4주 한자 가로 미니 배지 */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10.5px] font-extrabold truncate ${
                    isBabyMode ? "text-amber-900" : "text-amber-300"
                  }`}
                >
                  {report.input.name} · {dayPillar.hangul}({dayPillar.hanja})일주
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {report.pillars.map((p) => (
                    <span
                      key={p.label}
                      className={`px-1 py-0.5 rounded text-[8.5px] font-serif font-bold border ${
                        isBabyMode
                          ? "bg-white border-amber-200 text-slate-700"
                          : "bg-white/10 border-white/15 text-amber-100"
                      }`}
                    >
                      {p.hanja}
                    </span>
                  ))}
                </div>
              </div>

              {/* 간결한 핵심 2줄 총평 */}
              <h4
                className={`font-serif text-center font-black leading-snug line-clamp-2 break-keep ${
                  ratio === "9:16" ? "text-[14px]" : "text-[13px]"
                } ${isBabyMode ? "text-slate-900" : "text-white"}`}
              >
                “{shortFact}”
              </h4>

              {/* 2칸 요약 지표 */}
              <div className="grid grid-cols-2 gap-1.5 text-left">
                <div
                  className={`rounded-xl px-2.5 py-1.5 border ${
                    isBabyMode
                      ? "bg-white/90 border-amber-200/70"
                      : "bg-white/10 border-white/15"
                  }`}
                >
                  <span
                    className={`text-[8px] font-bold block ${
                      isBabyMode ? "text-slate-500" : "text-amber-200/80"
                    }`}
                  >
                    💰 횡재 피크
                  </span>
                  <span className="text-[10px] font-extrabold whitespace-nowrap">
                    {bestMonth.label} ({bestMonth.score}점)
                  </span>
                </div>
                <div
                  className={`rounded-xl px-2.5 py-1.5 border ${
                    isBabyMode
                      ? "bg-white/90 border-amber-200/70"
                      : "bg-white/10 border-white/15"
                  }`}
                >
                  <span
                    className={`text-[8px] font-bold block ${
                      isBabyMode ? "text-slate-500" : "text-amber-200/80"
                    }`}
                  >
                    ⚠️ 주의 시기
                  </span>
                  <span className="text-[10px] font-extrabold whitespace-nowrap">
                    {shortDangerMonth}
                  </span>
                </div>
              </div>

              {/* 하단 워터마크 */}
              <div
                className={`flex items-center justify-between pt-1.5 border-t text-[9.5px] ${
                  isBabyMode
                    ? "border-amber-200/70 text-slate-600"
                    : "border-white/15 text-amber-100/80"
                }`}
              >
                <span className="flex items-center gap-1 truncate">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                  {report.hashtags.slice(0, 2).join(" ")}
                </span>
                <span
                  className={`font-serif text-[11px] font-black tracking-[0.18em] shrink-0 ${
                    isBabyMode ? "text-slate-900" : "text-amber-200"
                  }`}
                >
                  sajufact.kr
                </span>
              </div>
            </div>
          </div>
        )}

        {edition === "receipt" && (
          <div
            ref={cardRef}
            className={`${
              ratio === "9:16"
                ? "w-[324px] h-[576px] p-4.5"
                : "w-[340px] h-[425px] p-4"
            } rounded-[20px] bg-[#fdfaf2] text-slate-900 relative overflow-hidden shadow-[0_24px_60px_rgba(20,18,35,0.22)] border border-stone-300 flex flex-col justify-between select-none transition-all duration-300`}
          >
            {/* 상단 감정서 헤더 */}
            <div className="border-b-2 border-dashed border-slate-900/20 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-black tracking-tight">
                  천명(天命) 사주 감정서
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                  #{report.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                <span>
                  {report.input.name} ({dayPillar.hanja}일주)
                </span>
                <span>{guardian.nameKo} 수호</span>
              </div>
            </div>

            {/* 중앙: 수호신 초상(분리) + 4주 + 요약 */}
            <div className="my-auto space-y-2.5">
              <div className="flex items-center gap-2.5 bg-stone-100 border border-stone-300/80 rounded-xl p-2">
                <img
                  src={guardian.image}
                  alt={guardian.nameKo}
                  className="w-14 h-16 rounded-lg object-cover border border-amber-500/50 shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold text-amber-900 truncate">
                      {guardian.nameKo}({guardian.hanja})
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">
                      {theme.nameKo}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {report.pillars.map((p) => (
                      <div
                        key={p.label}
                        className="bg-white rounded py-0.5 border border-stone-200"
                      >
                        <span className="text-[7px] font-bold text-slate-400 block">
                          {p.label}
                        </span>
                        <span className="font-serif text-[11px] font-black text-slate-900">
                          {p.hanja}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-300 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <p className="font-serif text-[12px] font-black text-slate-900 leading-snug line-clamp-2 break-keep flex-1">
                  “{shortFact}”
                </p>
                <VermilionSealSvg label="천명印" className="w-8 h-8 shrink-0" />
              </div>

              <div className="space-y-1.5 font-mono text-[10px]">
                {[
                  { label: "재물·횡재력", val: wealthStat, color: "bg-emerald-600" },
                  { label: "도화·매력도", val: charmStat, color: "bg-rose-500" },
                  { label: "추진·결단력", val: driveStat, color: "bg-amber-600" },
                  { label: "직감·방어력", val: shieldStat, color: "bg-slate-900" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="w-20 font-bold text-slate-700 shrink-0">
                      {stat.label}
                    </span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color}`}
                        style={{ width: `${stat.val}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-extrabold">{stat.val}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 워터마크 */}
            <div className="pt-1.5 border-t border-dashed border-slate-900/20 flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-slate-500">
                BEST {bestMonth.label} · WARN {worstMonth.label}
              </span>
              <span className="font-serif text-[11px] font-black tracking-[0.2em]">
                sajufact.kr
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PNG 저장 버튼 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={downloading !== null}
          onClick={() => handleDownload("9:16")}
          className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === "9:16" ? "생성 중..." : "9:16 저장"}
        </button>
        <button
          type="button"
          disabled={downloading !== null}
          onClick={() => handleDownload("4:5")}
          className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === "4:5" ? "생성 중..." : "4:5 저장"}
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
