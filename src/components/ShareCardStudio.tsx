"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Camera, Check, Sparkles } from "lucide-react";
import { ELEMENT_THEMES } from "@/lib/saju-engine";
import type { ElementKey, SajuReport } from "@/lib/saju-types";
import { OrientalElementArt } from "./OrientalArtSvg";

interface ShareCardStudioProps {
  report: SajuReport;
}

type CardRatio = "9:16" | "4:5";

export function ShareCardStudio({ report }: ShareCardStudioProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<CardRatio>("9:16");
  const [activeElement, setActiveElement] = useState<ElementKey>(report.dominantElement);
  const [downloading, setDownloading] = useState<CardRatio | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const theme = ELEMENT_THEMES[activeElement];

  const handleDownload = async (targetRatio: CardRatio) => {
    setRatio(targetRatio);
    setDownloading(targetRatio);

    // 비율 변경 렌더링이 반영되도록 한 프레임 대기
    await new Promise((r) => setTimeout(r, 120));

    if (!cardRef.current) {
      setDownloading(null);
      return;
    }

    const fileName = `sajufact_${report.input.name}_${targetRatio.replace(":", "x")}.png`;

    try {
      let dataUrl: string;
      try {
        dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        });
      } catch {
        // 외부 폰트 CORS 제한 환경 대비 폴백
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

      setSavedToast(`${targetRatio} 인스타 카드가 PNG로 저장되었습니다!`);
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
            인스타그램 공유 카드
          </span>
          <span className="text-[11px] font-semibold text-slate-500 truncate">
            {theme.auraLabel}
          </span>
        </div>
        <h3 className="font-serif text-lg font-extrabold text-slate-900 mt-1.5 break-keep">
          나의 오라(Aura) 운명 카드
        </h3>
      </div>

      {/* 오행 오라 컬러 프리셋 선택 (자동 매칭 기본값 + 미리보기 전환) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(Object.keys(ELEMENT_THEMES) as ElementKey[]).map((elKey) => {
          const elTheme = ELEMENT_THEMES[elKey];
          const isAuto = elKey === report.dominantElement;
          const isActive = elKey === activeElement;
          return (
            <button
              key={elKey}
              type="button"
              onClick={() => setActiveElement(elKey)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition ${
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

      {/* 실제 PNG 캡처 대상 카드 (중앙 4:5 세이프존 설계) */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          style={{
            background: theme.cardBgStyle,
            color: theme.textOnCard,
          }}
          className={`${
            ratio === "9:16"
              ? "w-[315px] h-[560px] p-5"
              : "w-[340px] h-[425px] p-5"
          } rounded-[28px] relative overflow-hidden shadow-[0_20px_50px_rgba(20,18,35,0.22)] border border-white/60 flex flex-col justify-between select-none transition-all duration-300`}
        >
          {/* 카드 내부 오라 광채 */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl opacity-50 pointer-events-none"
            style={{ background: theme.goldPrimary }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-2xl opacity-35 pointer-events-none"
            style={{ background: theme.accentColor }}
          />
          {/* 금선 프레임 */}
          <div
            className="absolute inset-3 rounded-[20px] pointer-events-none"
            style={{ border: `1px solid ${theme.goldPrimary}55` }}
          />

          {/* 상단 여백 / 9:16 전용 헤더 */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-bold tracking-[0.18em] uppercase opacity-80 pt-1">
            <span>SAJUFACT · 2027</span>
            <span>{theme.guardianName}</span>
          </div>

          {/* 중앙 4:5 세이프존 (핵심 일러스트 + 팩트폭격 + 오행) */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider shadow-sm mb-2 ${theme.badgeBg}`}
            >
              {report.tierBadge}
            </span>

            <OrientalElementArt
              element={activeElement}
              goldPrimary={theme.goldPrimary}
              goldSecondary={theme.goldSecondary}
              className={ratio === "9:16" ? "w-40 h-40 my-1" : "w-24 h-24 my-0"}
              idPrefix="share-card"
            />

            <p
              className="text-[11px] font-bold tracking-wide mt-1"
              style={{ color: theme.subTextOnCard }}
            >
              {report.input.name}님의 사주 원국 · {report.dayMasterHangul}(
              {report.dayMasterHanja}) 일간
            </p>

            <h4
              className={`font-serif leading-snug font-black mt-1.5 px-2 break-keep ${
                ratio === "9:16" ? "text-[17px]" : "text-[15px]"
              }`}
            >
              “{report.oneLineFact}”
            </h4>

            {/* 해시태그 */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {report.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: theme.isDarkCard
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.62)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 오행 미니 바 */}
            <div className="w-full max-w-[240px] mt-4 grid grid-cols-5 gap-1.5 text-center">
              {report.elements.map((el) => (
                <div key={el.key} className="flex flex-col items-center">
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden mb-1"
                    style={{
                      backgroundColor: theme.isDarkCard
                        ? "rgba(255,255,255,0.16)"
                        : "rgba(15,23,42,0.1)",
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(12, el.percentage)}%`,
                        backgroundColor: theme.goldPrimary,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-bold opacity-85">
                    {el.nameKo} {el.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 고정 세리프 워터마크 */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-current/10">
            <span className="text-[10px] opacity-75 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              위로 빼고 팩트만
            </span>
            <span className="font-serif text-xs font-bold tracking-[0.2em]">
              sajufact.kr
            </span>
          </div>
        </div>
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
