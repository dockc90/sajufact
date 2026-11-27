"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, RotateCcw } from "lucide-react";
import { TAROT_DECK, ELEMENT_THEMES } from "@/lib/saju-engine";
import type { TarotCardData } from "@/lib/saju-types";
import { OrientalElementArt } from "./OrientalArtSvg";

interface TarotModalProps {
  open: boolean;
  onClose: () => void;
  onConvertToSaju: () => void;
}

export function TarotModal({ open, onClose, onConvertToSaju }: TarotModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [drawnCard, setDrawnCard] = useState<TarotCardData | null>(null);
  const [deckSeed, setDeckSeed] = useState(0);

  if (!open) return null;

  const handlePick = (idx: number) => {
    if (drawnCard) return;
    setSelectedIndex(idx);
    const picked = TAROT_DECK[(idx + deckSeed) % TAROT_DECK.length];
    setTimeout(() => {
      setDrawnCard(picked);
    }, 320);
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setDrawnCard(null);
    setDeckSeed((prev) => prev + 2);
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-sm p-0 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="w-full max-w-[460px] rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#fffdf9] to-[#f4eef8] p-6 shadow-2xl border border-white/80 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-600 text-white">
                100% FREE
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                오늘의 1장 팩트 타로
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-600"
              aria-label="타로 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!drawnCard ? (
            <div>
              <p className="text-sm text-slate-600 mb-5">
                오늘 당신에게 가장 필요한 팩트폭격 카드를 직감으로{" "}
                <strong className="text-slate-900">1장</strong> 골라주세요.
              </p>

              <div className="grid grid-cols-5 gap-2.5 py-4">
                {[0, 1, 2, 3, 4].map((idx) => {
                  const isPicked = selectedIndex === idx;
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isPicked ? { y: -14, scale: 1.06 } : {}}
                      onClick={() => handlePick(idx)}
                      className="aspect-[2/3.2] rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 border border-amber-300/60 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group"
                    >
                      <div className="absolute inset-1.5 rounded-lg border border-amber-300/35 pointer-events-none" />
                      <Sparkles className="w-4 h-4 text-amber-300/80 mb-1 group-hover:scale-110 transition" />
                      <span className="text-[10px] font-serif text-amber-200/80 tracking-widest">
                        FACT
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-center text-xs text-slate-500 mt-2">
                매일 자정 기운이 초기화됩니다 · 무료 무제한 확인
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div
                className="rounded-2xl p-5 border border-amber-200/80 shadow-md relative overflow-hidden"
                style={{
                  background: ELEMENT_THEMES[drawnCard.element].cardBgStyle,
                  color: ELEMENT_THEMES[drawnCard.element].textOnCard,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-widest opacity-75">
                      ARCANA {drawnCard.roman}
                    </span>
                    <h4 className="font-serif text-xl font-extrabold mt-0.5">
                      {drawnCard.nameKo}
                    </h4>
                    <p className="text-xs font-semibold opacity-80 mt-0.5">
                      {drawnCard.keyword}
                    </p>
                  </div>
                  <OrientalElementArt
                    element={drawnCard.element}
                    goldPrimary={ELEMENT_THEMES[drawnCard.element].goldPrimary}
                    goldSecondary={ELEMENT_THEMES[drawnCard.element].goldSecondary}
                    className="w-20 h-20 shrink-0"
                    idPrefix="tarot"
                  />
                </div>

                <div className="mt-4 pt-3.5 border-t border-black/10 space-y-2 text-sm leading-relaxed">
                  <p className="font-bold">⚡ 오늘의 팩트폭격</p>
                  <p className="text-[13px] opacity-90">{drawnCard.factSummary}</p>
                  <p className="text-[13px] font-semibold pt-1">
                    👉 행동 지침: {drawnCard.actionAdvice}
                  </p>
                  <p className="text-xs opacity-80">
                    ✨ 행운 부스트: {drawnCard.luckyBoost}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-3 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white/70 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  다시 뽑기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onConvertToSaju();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 shadow-lg break-keep"
                >
                  2027 내 사주 원국까지 스캔
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
