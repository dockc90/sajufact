"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { generateDailyCatcherDraw } from "@/lib/saju-engine";
import type { DailyCatcherDraw, SavedSajuProfile } from "@/lib/saju-types";
import { FortuneCatcherDevice } from "./FortuneCatcherDevice";

interface FortuneCatcherModalProps {
  open: boolean;
  profile: SavedSajuProfile | null;
  initialDraw: DailyCatcherDraw | null;
  onClose: () => void;
  onDrawComplete: (draw: DailyCatcherDraw) => void;
  onViewMore: () => void;
}

export function FortuneCatcherModal({
  open,
  profile,
  initialDraw,
  onClose,
  onDrawComplete,
  onViewMore,
}: FortuneCatcherModalProps) {
  const [stage, setStage] = useState<"ready" | "loading" | "result">("ready");
  const [progress, setProgress] = useState(0);
  const [draw, setDraw] = useState<DailyCatcherDraw | null>(null);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (initialDraw) {
        setDraw(initialDraw);
        setStage("result");
        setProgress(100);
      } else {
        setDraw(null);
        setStage("ready");
        setProgress(0);
      }
      setShareToast(false);
    });
  }, [open, initialDraw]);

  if (!open || !profile) return null;

  const startDraw = () => {
    if (stage === "loading") return;
    setStage("loading");
    setProgress(8);

    const nextDraw = generateDailyCatcherDraw(profile);
    const startAt = Date.now();
    const duration = 1450;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startAt;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setDraw(nextDraw);
        setStage("result");
        onDrawComplete(nextDraw);
      }
    }, 55);
  };

  const handleShare = async () => {
    if (!draw) return;
    const text = `[사주팩트 달토 포춘캐처] ${profile.name}님의 ${draw.dateDisplay} 행운점수 ${draw.score}점! "${draw.quote}" (#${draw.luckyNumber} / ${draw.luckyColor} / ${draw.luckyItem})`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "달토 포춘 캐처 오늘의 행운점수",
          text,
          url: window.location.origin,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      }
    } catch {
      // ignore cancelled share sheet
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 gingham-pastel-bg flex flex-col items-center justify-center px-5 py-8 overflow-y-auto"
    >
      {/* 장식용 파스텔 별들 */}
      <span className="fixed top-12 left-8 text-2xl opacity-75 pointer-events-none select-none">
        ⭐
      </span>
      <span className="fixed top-20 right-14 text-xl opacity-70 pointer-events-none select-none">
        🌟
      </span>
      <span className="fixed bottom-24 left-10 text-2xl opacity-65 pointer-events-none select-none">
        ✨
      </span>
      <span className="fixed bottom-16 right-8 text-2xl opacity-75 pointer-events-none select-none">
        🥕
      </span>

      {/* 우상단 닫기 버튼 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="fixed top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/95 border border-amber-200/70 shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-5 relative z-10">
        {stage === "ready" && (
          <>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-rose-600 shadow-2xs">
                <Sparkles className="w-3 h-3" />
                {profile.name}님의 오늘 운세
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                오늘의 운세를 뽑아보라토! 🐇
              </h2>
            </div>

            <FortuneCatcherDevice mode="idle" size="lg" onPress={startDraw} />

            <button
              type="button"
              onClick={startDraw}
              className="rounded-full bg-gradient-to-r from-[#ff6a7b] to-[#ec4899] text-white px-7 py-3 text-sm font-black shadow-lg hover:brightness-105 transition"
            >
              버튼 눌러서 운세 뽑기! ✨
            </button>
          </>
        )}

        {stage === "loading" && (
          <>
            <div className="space-y-1">
              <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-violet-700 shadow-2xs">
                만세력 오늘 일진 매칭 중
              </span>
              <h2 className="text-xl font-black text-slate-900">
                달토가 오늘 기운을 뽑는 중... 🐇✨
              </h2>
            </div>

            <FortuneCatcherDevice mode="loading" size="lg" />

            {/* 로딩 게이지 바 */}
            <div className="w-full max-w-[270px] space-y-2 bg-white/90 rounded-2xl p-3.5 shadow-sm border border-white">
              <div className="h-3.5 w-full rounded-full bg-rose-100 overflow-hidden p-0.5">
                <motion.div
                  style={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 via-rose-500 to-violet-500 transition-all duration-75"
                />
              </div>
              <p className="text-xs font-black text-[#5c3c88]">
                행운점수 &amp; 오늘의 키워드 추출 중 {progress}%
              </p>
            </div>
          </>
        )}

        {stage === "result" && draw && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className="text-xs font-extrabold text-emerald-700">
                🍀 {draw.dateDisplay} · {profile.name}님
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-keep text-balance">
                “{draw.quote}”
              </h2>
              <p className="text-xs font-bold text-slate-500">— {draw.quoteSub}</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <FortuneCatcherDevice
                mode="result"
                score={draw.score}
                size="lg"
                onPress={startDraw}
              />
            </motion.div>

            {/* 행운 숫자 / 행운 컬러 / 행운 아이템 3칸 */}
            <div className="w-full grid grid-cols-[0.75fr_1.1fr_1.15fr] items-center rounded-2xl bg-white/95 border border-amber-200/70 shadow-sm divide-x divide-amber-100 py-3 px-1">
              <div className="px-1.5 space-y-0.5">
                <span className="block text-[10px] font-bold text-amber-600">
                  # 행운 숫자
                </span>
                <span className="block text-sm font-black text-slate-900">
                  {draw.luckyNumber}
                </span>
              </div>
              <div className="px-1.5 space-y-0.5">
                <span className="block text-[10px] font-bold text-rose-500">
                  🎨 행운 컬러
                </span>
                <span className="block text-xs sm:text-sm font-black text-slate-900 leading-snug break-keep text-balance">
                  {draw.luckyColor.split(/[·&,]/)[0].trim()}
                </span>
              </div>
              <div className="px-1.5 space-y-0.5">
                <span className="block text-[10px] font-bold text-emerald-600">
                  🍀 행운 아이템
                </span>
                <span className="block text-xs sm:text-sm font-black text-slate-900 leading-snug break-keep text-balance">
                  {draw.luckyItem.split(/[·&,]/)[0].trim()}
                </span>
              </div>
            </div>

            {shareToast && (
              <p className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-extrabold">
                <Check className="w-3.5 h-3.5" />
                오늘의 행운점수 카드가 복사되었어요!
              </p>
            )}

            {/* 하단 공유하기 & 운세 더보기 */}
            <div className="w-full grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => void handleShare()}
                className="py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-black shadow-xs transition"
              >
                공유하기
              </button>
              <button
                type="button"
                onClick={onViewMore}
                className="py-3.5 rounded-full bg-[#e35b96] hover:brightness-105 text-white text-sm font-black shadow-md transition"
              >
                운세 더보기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
