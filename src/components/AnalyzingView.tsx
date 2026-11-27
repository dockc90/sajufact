"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  {
    step: "01",
    title: "만세력 8글자 절구에 담아 곱게 빻는 중...",
    sub: "양력/음력 절기 오차까지 0.01초 단위로 보정하고 있어요",
  },
  {
    step: "02",
    title: "오행 비율 & 2027 정미년 운기를 체에 거르는 중...",
    sub: "타고난 기운의 과다·결핍과 재물·인연 타이밍을 정밀 추출해요",
  },
  {
    step: "03",
    title: "달토의 뼈 때리는 채찍 + 따뜻한 처방전 완성! 🐇✨",
    sub: "결과 리포트와 파스텔 오라 인스타 카드를 예쁘게 포장하고 있어요",
  },
];

export function AnalyzingView({ userName }: { userName: string }) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStageIdx(1), 950);
    const t2 = setTimeout(() => setStageIdx(2), 1950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const current = STAGES[stageIdx];

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center px-5 py-10 text-center relative">
      {/* 달토끼 달토 절구 찧기 일러스트 & 몽글몽글 파스텔 오라 */}
      <div className="relative flex items-center justify-center mb-7">
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#f8c4b4]/55 via-[#fde6b8]/60 to-[#d9c2f8]/55 blur-2xl animate-pulse" />

        {/* 둥실둥실 떠다니는 미니 당근 & 달 */}
        <motion.span
          animate={{ y: [0, -8, 0], rotate: [-8, 8, -8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-3 -left-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-base shadow-md border border-orange-200"
        >
          🥕
        </motion.span>
        <motion.span
          animate={{ y: [0, 7, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 -right-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-base shadow-md border border-violet-200"
        >
          🌕
        </motion.span>

        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-[36px] overflow-hidden border-4 border-white/90 shadow-[0_20px_50px_rgba(139,92,246,0.22)] bg-[#fdf6f0]"
        >
          <img
            src="/mascot/dalto-mortar.jpg"
            alt="절구 찧는 달토끼 달토"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="absolute -bottom-3 z-20">
          <span className="inline-flex items-center gap-1.5 font-serif text-xs sm:text-sm font-black tracking-wide text-[#523e88] bg-white/95 px-4 py-1.5 rounded-full shadow-md border border-violet-200/80 whitespace-nowrap">
            🐇 {userName || "당신"}의 원국 절구 찧는 중
          </span>
        </div>
      </div>

      {/* 단계별 안내 카드 */}
      <div className="w-full max-w-md glass-card rounded-3xl p-6 space-y-3 border border-white/90">
        <p className="font-serif text-base sm:text-lg font-black text-[#3b2d66]">
          달토가 달에서 절구 찧으며 사주 분석 중... 🐇🌕
        </p>

        <div className="flex items-center justify-center gap-2">
          {STAGES.map((s, idx) => (
            <span
              key={s.step}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx <= stageIdx
                  ? "w-9 bg-gradient-to-r from-violet-400 via-rose-400 to-orange-400"
                  : "w-3 bg-violet-100"
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
            className="bg-white/75 rounded-2xl p-3.5 border border-violet-100/80"
          >
            <p className="text-[11px] font-extrabold tracking-widest text-orange-500 mb-1">
              DALTO SCANNING · {current.step} / 03
            </p>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug mb-1">
              {current.title}
            </h2>
            <p className="text-xs text-slate-600">{current.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
