"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Camera, Check, Sparkles } from "lucide-react";
import { ELEMENT_THEMES, GUARDIAN_BEAST_META } from "@/lib/saju-engine";
import type { ElementKey, SajuReport } from "@/lib/saju-types";
import {
  OrientalCardFrameSvg,
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
  const guardian = GUARDIAN_BEAST_META[activeElement];
  const dayPillar = report.pillars.find((p) => p.label === "일주") ?? report.pillars[1];
  const bestMonth = [...report.monthlyFlow].sort((a, b) => b.score - a.score)[0];
  const worstMonth = [...report.monthlyFlow].sort((a, b) => a.score - b.score)[0];
  const shortOrgan = report.healthReport.vulnerableOrgans.split("·")[0]?.trim() || "자율신경";

  // 4대 능력치 (천명 감정서 시각화용)
  const wealthStat = Math.min(98, bestMonth.score);
  const charmStat = Math.min(96, 72 + (report.elements.find((e) => e.key === "fire")?.percentage ?? 15));
  const driveStat = Math.min(97, 74 + (report.elements.find((e) => e.key === "wood")?.percentage ?? 14));
  const shieldStat = Math.max(54, 100 - Math.round(worstMonth.score * 0.35));

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
            인스타그램 소장용 수호 영물 카드
          </span>
          <span className="text-[11px] font-semibold text-slate-500 truncate">
            {edition === "receipt" ? "DESTINY DOSSIER" : `${guardian.nameKo}(${guardian.hanja}) · ${theme.auraLabel}`}
          </span>
        </div>
        <h3 className="font-serif text-lg font-extrabold text-slate-900 mt-1.5 break-keep">
          나의 수호신 · 오라(Aura) 운명 카드
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
          🐅 수호 영물 화보
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
          🌙 신수 아르카나
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
          📜 천명 감정서
        </button>
      </div>

      {/* 수호 영물 / 오행 컬러 선택 */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {(Object.keys(ELEMENT_THEMES) as ElementKey[]).map((elKey) => {
          const elTheme = ELEMENT_THEMES[elKey];
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
              {elGuardian.nameKo}({elTheme.nameKo}) {isAuto ? "★내 신수" : ""}
            </button>
          );
        })}
      </div>

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
            className={`${
              ratio === "9:16"
                ? "w-[324px] h-[576px] p-4.5"
                : "w-[340px] h-[425px] p-4"
            } rounded-[26px] bg-slate-950 text-white relative overflow-hidden shadow-[0_24px_60px_rgba(10,8,24,0.38)] flex flex-col justify-between select-none transition-all duration-300`}
          >
            {/* 풀블리드 수호 영물 화보 배경 + 다크 비네팅 */}
            <img
              src={guardian.image}
              alt={guardian.nameKo}
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/15 to-slate-950/95 pointer-events-none" />
            <div
              className="absolute inset-0 opacity-25 pointer-events-none mix-blend-screen"
              style={{ background: theme.cardBgStyle }}
            />
            <OrientalCardFrameSvg color={theme.goldPrimary} />

            {/* 상단 에디토리얼 헤더 */}
            <div className="relative z-10 flex items-start justify-between pt-1 px-1">
              <div>
                <span className="text-[9px] font-bold tracking-[0.22em] text-amber-200/90 uppercase block">
                  GUARDIAN {guardian.hanja} · {theme.nameKo}({theme.hanja})
                </span>
                <span className="font-serif text-xs font-black text-white drop-shadow">
                  {guardian.nameKo} — {guardian.epithet}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide shadow-md ${theme.badgeBg}`}
              >
                {report.tierBadge}
              </span>
            </div>

            {/* 좌측 세로 4주 인장 & 우측 천명 낙관 */}
            <div className="relative z-10 flex items-end justify-between my-auto px-0.5">
              <div className="flex flex-col gap-1 text-[9px] font-serif font-bold text-amber-100/90">
                {report.pillars.map((p) => (
                  <span
                    key={p.label}
                    className="px-1.5 py-0.5 rounded border border-amber-200/35 bg-slate-950/60 backdrop-blur-sm"
                  >
                    {p.hanja}
                  </span>
                ))}
              </div>
              <VermilionSealSvg label="수호印" className="w-9 h-9 opacity-95 drop-shadow-lg" />
            </div>

            {/* 하단 핵심 운명 캡션 + 4대 시그널 + 워터마크 */}
            <div className="relative z-10 space-y-2">
              <div className="rounded-2xl bg-slate-950/75 backdrop-blur-md border border-amber-200/30 p-3 text-center">
                <p className="text-[10px] font-bold text-amber-300 tracking-wide">
                  {report.input.name} · {dayPillar.hangul}({dayPillar.hanja})일주 · {ARCHETYPE_BY_ELEMENT[activeElement]}
                </p>
                <h4
                  className={`font-serif leading-snug font-black text-white mt-1 break-keep ${
                    ratio === "9:16" ? "text-[14.5px]" : "text-[13px]"
                  }`}
                >
                  “{report.oneLineFact}”
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-left">
                <div className="rounded-xl px-2.5 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15">
                  <span className="text-[8px] font-bold text-amber-200/80 block">💰 횡재 피크</span>
                  <span className="text-[10px] font-extrabold text-white">
                    2027년 {bestMonth.label} ({bestMonth.score}점)
                  </span>
                </div>
                <div className="rounded-xl px-2.5 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15">
                  <span className="text-[8px] font-bold text-amber-200/80 block">⚠️ 절대 주의</span>
                  <span className="text-[10px] font-extrabold text-white">
                    {report.criticalMistake2027.dangerMonth.split("(")[0].trim()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/15 px-1">
                <span className="text-[9.5px] text-amber-100/85 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  {report.hashtags.slice(0, 2).join(" ")}
                </span>
                <span className="font-serif text-[11px] font-black tracking-[0.2em] text-amber-200">
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
            {/* 상단 천명 감정서 헤더 */}
            <div className="border-b-2 border-dashed border-slate-900/25 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-black tracking-tight">
                  천명(天命) 사주 감정서
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                  #{report.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                <span>성명: {report.input.name} ({dayPillar.hanja}일주)</span>
                <span>{guardian.nameKo}({guardian.hanja}) 수호</span>
              </div>
            </div>

            {/* 수호 영물 초상 + 4주 원국 */}
            <div className="my-auto space-y-2">
              <div className="flex items-center gap-2.5 bg-stone-100/90 border border-stone-300/80 rounded-xl p-2">
                <img
                  src={guardian.image}
                  alt={guardian.nameKo}
                  className="w-14 h-16 rounded-lg object-cover border border-amber-500/50 shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-amber-900">
                      {guardian.nameKo}({guardian.hanja})의 결
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{report.tierBadge}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {report.pillars.map((p) => (
                      <div key={p.label} className="bg-white rounded py-0.5 border border-stone-200">
                        <span className="text-[7px] font-bold text-slate-400 block">{p.label}</span>
                        <span className="font-serif text-[11px] font-black text-slate-900">{p.hanja}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 핵심 처방 문구 */}
              <div className="relative bg-white border border-stone-300 rounded-xl p-3 shadow-sm">
                <span className="text-[9px] font-mono font-bold text-rose-700 block mb-0.5">
                  [SAJUFACT READING · 핵심 명리 총평]
                </span>
                <p
                  className={`font-serif font-black text-slate-900 leading-snug break-keep ${
                    ratio === "9:16" ? "text-[13.5px]" : "text-[12.5px]"
                  }`}
                >
                  “{report.oneLineFact}”
                </p>
                <div className="absolute -right-1 -bottom-2 rotate-[-8deg]">
                  <VermilionSealSvg label="천명印" className="w-9 h-9" />
                </div>
              </div>

              {/* 4대 운세 스탯 바 */}
              <div className="space-y-1.5 font-mono text-[10px]">
                {[
                  { label: "재물·횡재력", val: wealthStat, color: "bg-emerald-600" },
                  { label: "도화·매력도", val: charmStat, color: "bg-rose-500" },
                  { label: "추진·결단력", val: driveStat, color: "bg-amber-600" },
                  { label: "직감·방어력", val: shieldStat, color: "bg-slate-900" },
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

              {/* 감정서 요약 */}
              <div className="border-t border-b border-dashed border-slate-900/25 py-1.5 space-y-1 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">01. 2027 대박 피크</span>
                  <span className="font-bold text-emerald-700">{bestMonth.label} ({bestMonth.tag})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">02. 절대 주의 고비</span>
                  <span className="font-bold text-rose-600">{worstMonth.label} ({worstMonth.tag})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">03. 취약 건강 부위</span>
                  <span className="font-bold text-slate-900">{shortOrgan}</span>
                </div>
              </div>
            </div>

            {/* 하단 바코드 & 워터마크 */}
            <div className="pt-1 flex items-end justify-between">
              <div className="flex items-end gap-[1.5px] h-5 opacity-80">
                {[3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2].map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-900 h-full inline-block"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <div className="text-right">
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
                ? "w-[324px] h-[576px] p-4.5"
                : "w-[340px] h-[425px] p-4"
            } rounded-[26px] text-[#f9f3e3] relative overflow-hidden shadow-[0_24px_60px_rgba(10,8,28,0.45)] border border-amber-300/45 flex flex-col justify-between select-none transition-all duration-300`}
          >
            <div className="absolute -top-20 -left-16 w-56 h-56 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-16 w-56 h-56 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
            <OrientalCardFrameSvg color="#f0d285" />

            {/* 상단 아르카나 타이틀 */}
            <div className="relative z-10 text-center pt-1">
              <span className="text-[9px] font-bold tracking-[0.26em] text-amber-300/90 uppercase">
                ARCANA {dayPillar.hanja} · {report.tierBadge}
              </span>
              <p className="font-serif text-xs font-extrabold text-amber-100 mt-0.5">
                {report.input.name}의 수호신 · {guardian.nameKo}({guardian.hanja})
              </p>
            </div>

            {/* 아치형 신수 초상 프레임 + 신탁 문구 */}
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div
                className={`overflow-hidden rounded-t-full rounded-b-2xl border-2 border-amber-300/75 shadow-[0_0_28px_rgba(245,219,148,0.3)] ${
                  ratio === "9:16" ? "w-44 h-56" : "w-32 h-36"
                }`}
              >
                <img
                  src={guardian.image}
                  alt={guardian.nameKo}
                  className="w-full h-full object-cover"
                />
              </div>

              <h4
                className={`font-serif leading-snug font-black text-amber-50 mt-3 px-2 break-keep ${
                  ratio === "9:16" ? "text-[14.5px]" : "text-[13px]"
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

              <div
                className={`w-full grid grid-cols-3 gap-1.5 text-center ${
                  ratio === "9:16" ? "mt-3" : "mt-2"
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
                    {worstMonth.label}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 border border-amber-200/20 py-1.5 px-1">
                  <span className="text-[8px] text-amber-200/70 block">개운 방향</span>
                  <span className="text-[10px] font-extrabold text-amber-200 truncate block px-0.5">
                    {report.talisman.luckyDirection}
                  </span>
                </div>
              </div>
            </div>

            {/* 하단 워터마크 */}
            <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-amber-200/20 px-1 text-amber-200/80">
              <span className="text-[9px] truncate">{guardian.epithet}</span>
              <span className="font-serif text-[11px] font-black tracking-[0.2em] text-amber-200 shrink-0">
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
