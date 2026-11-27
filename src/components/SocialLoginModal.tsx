"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface SocialLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProvider: (provider: "naver" | "kakao" | "google", label: string) => void;
}

export function SocialLoginModal({
  open,
  onClose,
  onSelectProvider,
}: SocialLoginModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-violet-950/45 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[420px] rounded-t-[30px] sm:rounded-[30px] bg-gradient-to-b from-[#fffaf5] via-[#fdf5fb] to-white p-6 shadow-2xl border border-white space-y-5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <img
              src="/mascot/dalto-party.jpg"
              alt="달토끼 달토"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-200 shadow-sm shrink-0"
            />
            <div className="text-left">
              <span className="inline-block rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-extrabold mb-1">
                3초 간편 로그인
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                달토 포춘 캐처 켜기 🐇✨
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-full hover:bg-violet-100/70 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed text-left bg-white/85 rounded-2xl p-3.5 border border-violet-100">
          로그인하면 나만의 달토 보름달이 켜지고, 본인·가족·연인·친구·동료의 사주를 저장해 언제든 꺼내볼 수 있어요!
        </p>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => onSelectProvider("naver", "네이버 회원")}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#03C75A] hover:brightness-95 text-white text-sm font-black flex items-center justify-center gap-2 shadow-sm transition"
          >
            <span className="font-black text-base leading-none">N</span>
            <span>네이버로 시작하기</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectProvider("kakao", "카카오 회원")}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FEE500] hover:brightness-95 text-[#191919] text-sm font-black flex items-center justify-center gap-2 shadow-sm transition"
          >
            <span className="text-base leading-none">💬</span>
            <span>카카오로 3초 시작하기</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectProvider("google", "구글 회원")}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-black flex items-center justify-center gap-2 shadow-2xs transition"
          >
            <span className="font-black text-base text-[#4285F4] leading-none">G</span>
            <span>구글로 시작하기</span>
          </button>
        </div>

        <p className="text-[10.5px] text-slate-400 text-center">
          로그인 즉시 오늘의 행운점수 뽑기 & 매일 밤 11시 무료 수다권 1장이 제공됩니다.
        </p>
      </motion.div>
    </div>
  );
}
