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
export type PastelAuraMood = "lavender" | "mooncream" | "element";

const AURA_MOODS: Record<
  PastelAuraMood,
  {
    label: string;
    bg: string;
    orbA: string;
    orbB: string;
    accentPill: string;
    accentText: string;
  }
> = {
  lavender: {
    label: "🌸 라벤더 피치",
    bg: "from-[#f6e8ff] via-[#fff0eb] to-[#fce7f3]",
    orbA: "bg-[#f8b4a0]/55",
    orbB: "bg-[#c8b2fa]/55",
    accentPill: "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white",
    accentText: "text-[#5b3d99]",
  },
  mooncream: {
    label: "🌙 달빛 크림",
    bg: "from-[#fff6e5] via-[#fff2ec] to-[#f4ecff]",
    orbA: "bg-[#fcd39d]/55",
    orbB: "bg-[#d8c4f8]/50",
    accentPill: "bg-gradient-to-r from-[#f97316] to-[#f43f5e] text-white",
    accentText: "text-[#9a4616]",
  },
  element: {
    label: "✨ 오행 맞춤",
    bg: "from-[#eef7ff] via-[#f7ecff] to-[#fff1ee]",
    orbA: "bg-[#a5d8ff]/55",
    orbB: "bg-[#f3b8d8]/55",
    accentPill: "bg-gradient-to-r from-[#6366f1] to-[#ec4899] text-white",
    accentText: "text-[#4338ca]",
  },
};

const ELEMENT_PASTEL_BARS: Record<ElementKey, string> = {
  wood: "bg-[#8fd9a8]",
  fire: "bg-[#ffa89b]",
  earth: "bg-[#f7d08a]",
  metal: "bg-[#b8cff8]",
  water: "bg-[#c3b2f6]",
};

export function ShareCardStudio({ report }: ShareCardStudioProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<PastelAuraMood>("lavender");
  const [ratio, setRatio] = useState<CardRatio>("9:16");
  const [downloading, setDownloading] = useState<CardRatio | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const theme = ELEMENT_THEMES[report.dominantElement];
  const auraStyle = AURA_MOODS[mood];
  const dayPillar =
    report.pillars.find((p) => p.label === "일주") ?? report.pillars[1];
  const bestMonth = [...report.monthlyFlow].sort((a, b) => b.score - a.score)[0];
  const shortFact = toShortCardFact(report.oneLineFact, 42);
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

    const fileName = `sajufact_${report.input.name}_pastel_aura_${targetRatio.replace(":", "x")}.png`;

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

      setSavedToast(`${targetRatio} 파스텔 오라 카드가 고화질 PNG로 저장되었습니다!`);
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
            파스텔 오라 인스타그램 공유 카드
          </span>
          <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 mt-1">
            {report.input.name}님의 달토 오라 카드 · {theme.nameKo}
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
          {theme.auraLabel}
        </span>
      </div>

      {/* 3종 파스텔 오라 무드 선택 */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-violet-100/70 rounded-2xl">
        {(Object.keys(AURA_MOODS) as PastelAuraMood[]).map((mKey) => (
          <button
            key={mKey}
            type="button"
            onClick={() => setMood(mKey)}
            className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap ${
              mood === mKey
                ? "bg-white text-[#4c3787] shadow-sm"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            {AURA_MOODS[mKey].label}
          </button>
        ))}
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

      {/* PNG 저장 캡처 영역 (몽글몽글 파스텔 오라 카드 · 귀여운 달토 주인공 · 글자 겹침 0%) */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className={`${
            ratio === "9:16" ? "w-[324px] h-[576px] p-3.5" : "w-[340px] h-[425px] p-3.5"
          } rounded-[28px] bg-gradient-to-br ${auraStyle.bg} text-[#2b2242] relative overflow-hidden shadow-[0_20px_50px_rgba(139,92,246,0.22)] border-2 border-white flex flex-col justify-between select-none transition-all duration-300`}
        >
          {/* 배경 파스텔 오라 오브 */}
          <div
            className={`absolute -top-12 -left-10 w-44 h-44 rounded-full blur-2xl pointer-events-none ${auraStyle.orbA}`}
          />
          <div
            className={`absolute -bottom-14 -right-10 w-48 h-48 rounded-full blur-2xl pointer-events-none ${auraStyle.orbB}`}
          />

          {/* 상단 달토 헤더 바 */}
          <div className="relative z-10 flex items-center justify-between gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 bg-white/85 backdrop-blur-sm border border-white rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#4b3880] shadow-2xs whitespace-nowrap">
              🐇 달토 오라 · {theme.nameKo}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold whitespace-nowrap shadow-xs ${auraStyle.accentPill}`}
            >
              {report.tierBadge}
            </span>
          </div>

          {/* 9:16 스토리 전용 — 중앙 상단 귀여운 달토 히어로 초상화 */}
          {ratio === "9:16" && (
            <div className="relative z-10 flex flex-col items-center justify-center my-1 shrink-0">
              <div className="relative">
                <div className="w-24 h-24 rounded-[26px] overflow-hidden border-[3px] border-white shadow-[0_12px_28px_rgba(139,92,246,0.25)] bg-[#fdf6f0]">
                  <img
                    src="/mascot/dalto-rabbit.jpg"
                    alt="달토끼 달토"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -top-1.5 -right-2 rounded-full bg-white border border-orange-200 px-1.5 py-0.5 text-[10px] shadow-xs">
                  🥕
                </span>
                <span className="absolute -bottom-1 -left-2 rounded-full bg-white border border-violet-200 px-1.5 py-0.5 text-[9px] font-extrabold text-violet-700 shadow-xs">
                  ✨ 달토
                </span>
              </div>
            </div>
          )}

          {/* 중앙 글래스모피즘 핵심 정보 카드 */}
          <div
            className={`relative z-10 bg-white/80 backdrop-blur-md border border-white/95 rounded-[24px] shadow-sm my-auto ${
              ratio === "9:16" ? "p-3 space-y-2" : "p-3 space-y-2"
            }`}
          >
            {ratio === "4:5" ? (
              /* 4:5 피드 전용 — 달토 포트레이트 + 일주/4주 컴팩트 상단 블록 */
              <div className="flex items-center gap-2.5">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-[#fdf6f0]">
                  <img
                    src="/mascot/dalto-rabbit.jpg"
                    alt="달토끼 달토"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-violet-900/65 text-[8px] font-extrabold text-white text-center py-0.5">
                    🥕 달토
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10.5px] font-extrabold truncate ${auraStyle.accentText}`}>
                      {report.input.name} · {dayPillar.hangul}({dayPillar.hanja})일주
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {report.pillars.map((p) => (
                      <div
                        key={p.label}
                        className="rounded-lg bg-[#fdf8ff] border border-violet-100/90 py-0.5 px-0.5"
                      >
                        <span className="block text-[7px] font-bold text-slate-400">
                          {p.label}
                        </span>
                        <span className="font-serif text-[11px] font-black text-[#2b2242]">
                          {p.hanja}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10.5px] font-extrabold truncate ${auraStyle.accentText}`}>
                    {report.input.name} · {dayPillar.hangul}({dayPillar.hanja})일주
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-400 shrink-0">
                    {auraStyle.label}
                  </span>
                </div>

                {/* 4주 미니 파스텔 타일 */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {report.pillars.map((p) => (
                    <div
                      key={p.label}
                      className="rounded-xl bg-[#fdf8ff] border border-violet-100/90 py-1 px-1"
                    >
                      <span className="block text-[7.5px] font-bold text-slate-400">
                        {p.label}
                      </span>
                      <span className="font-serif text-[11.5px] font-black text-[#2b2242]">
                        {p.hanja}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 달토 핵심 총평 */}
            <div className="rounded-2xl bg-gradient-to-br from-[#fffaf5] to-[#f8f0ff] border border-white p-2.5 text-center">
              <h4
                className={`font-serif font-black leading-snug line-clamp-2 break-keep text-[#2b2242] ${
                  ratio === "9:16" ? "text-[13px]" : "text-[12.5px]"
                }`}
              >
                “{shortFact}”
              </h4>
            </div>

            {/* 오행 파스텔 비율 바 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                <span>오행 파스텔 오라 밸런스</span>
                <span>
                  {theme.nameKo} 주도 · {report.elements.find((e) => e.key === report.dominantElement)?.percentage}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-100 border border-white">
                {report.elements.map((el) => (
                  <div
                    key={el.key}
                    style={{ width: `${Math.max(4, el.percentage)}%` }}
                    className={`h-full ${ELEMENT_PASTEL_BARS[el.key]}`}
                  />
                ))}
              </div>
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

            {/* 9:16 스토리 비율 전용 달토 따뜻한 처방 한 줄 */}
            {ratio === "9:16" && (
              <div className="rounded-xl bg-[#f7f2ff] border border-violet-200/60 px-2.5 py-1.5 text-left">
                <span className="text-[8.5px] font-extrabold text-violet-700 block">
                  💌 달토의 따뜻한 개운 처방
                </span>
                <p className="text-[9.5px] font-semibold text-slate-700 leading-snug line-clamp-2 break-keep">
                  {report.talisman.talismanMantra} · 개운 아이템: {report.talisman.luckyItem}
                </p>
              </div>
            )}
          </div>

          {/* 하단 워터마크 */}
          <div className="relative z-10 flex items-center justify-between pt-0.5 text-[9.5px] text-[#55447a] shrink-0">
            <span className="flex items-center gap-1 truncate font-bold">
              <Sparkles className="w-2.5 h-2.5 text-orange-500 shrink-0" />
              {report.hashtags.slice(0, 2).join(" ")}
            </span>
            <span className="font-serif text-[11px] font-black tracking-[0.16em] shrink-0">
              🐇 sajufact.kr
            </span>
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
