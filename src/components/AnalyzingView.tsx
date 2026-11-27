"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyzingMandalaSvg } from "./OrientalArtSvg";

const STAGES = [
  {
    step: "01",
    title: "만세력 천간·지지 8자 원국 배열 중...",
    sub: "양력/음력 절기 오차까지 0.01초 단위로 보정하고 있습니다",
  },
  {
    step: "02",
    title: "오행(목·화·토·금·수) 비율 & 2027 정미년 대운 대조 중...",
    sub: "타고난 기운의 과다·결핍과 충돌 시기를 정밀 추출합니다",
  },
  {
    step: "03",
    title: "위로 빼고 뼈 때리는 핵심 팩트폭격 생성 완료!",
    sub: "결과 리포트와 나만의 오라 카드를 렌더링하고 있습니다",
  },
];

export function AnalyzingView({ userName }: { userName: string }) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStageIdx(1), 1000);
    const t2 = setTimeout(() => setStageIdx(2), 2050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const current = STAGES[stageIdx];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center relative">
      {/* 회전하는 오라 만다라 */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-rose-300/40 via-amber-200/45 to-indigo-300/40 blur-2xl animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <AnalyzingMandalaSvg className="w-48 h-48 drop-shadow-[0_0_24px_rgba(212,175,55,0.35)]" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-lg font-bold tracking-widest text-amber-900 bg-white/85 px-3 py-1 rounded-full shadow-sm border border-amber-200/70">
            {userName || "당신"}의 원국
          </span>
        </div>
      </div>

      {/* 단계별 텍스트 */}
      <div className="w-full max-w-sm glass-card rounded-3xl p-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          {STAGES.map((s, idx) => (
            <span
              key={s.step}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx <= stageIdx ? "w-8 bg-slate-900" : "w-3 bg-slate-300"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xs font-bold tracking-widest text-amber-700 mb-1.5">
              FACT SCANNING · {current.step} / 03
            </p>
            <h2 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
              {current.title}
            </h2>
            <p className="text-xs text-slate-600">{current.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
