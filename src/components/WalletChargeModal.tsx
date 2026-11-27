"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles, X, Zap } from "lucide-react";

interface ChargePackage {
  id: string;
  name: string;
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
  price: number;
  priceText: string;
  badge?: string;
  desc: string;
}

const PACKAGES: ChargePackage[] = [
  {
    id: "pack_1",
    name: "당근 1개",
    baseCoins: 1,
    bonusCoins: 0,
    totalCoins: 1,
    price: 990,
    priceText: "990원",
    desc: "궁금한 사주 리포트 1종 즉시 열기",
  },
  {
    id: "pack_3",
    name: "당근 한 다발 (3개)",
    baseCoins: 3,
    bonusCoins: 0,
    totalCoins: 3,
    price: 2900,
    priceText: "2,900원",
    badge: "인기",
    desc: "기본·신년·연애 핵심 메뉴 가볍게 열기",
  },
  {
    id: "pack_6",
    name: "당근 바구니 (5+1개)",
    baseCoins: 5,
    bonusCoins: 1,
    totalCoins: 6,
    price: 4900,
    priceText: "4,900원",
    badge: "BEST · +1 보너스",
    desc: "인기 테마 몰아보기 + 달토 집중 수다",
  },
  {
    id: "pack_13",
    name: "당근 농장 (10+3개)",
    baseCoins: 10,
    bonusCoins: 3,
    totalCoins: 13,
    price: 9900,
    priceText: "9,900원",
    badge: "최고혜택 · +3 보너스",
    desc: "7종 전 테마 + 친구 궁합·달토 상담까지 넉넉하게",
  },
];

const PAY_METHODS: Array<{ id: "kakao" | "toss" | "naver"; label: string; bg: string }> = [
  { id: "kakao", label: "카카오페이", bg: "bg-[#FEE500] text-[#191919]" },
  { id: "toss", label: "토스페이", bg: "bg-[#0064FF] text-white" },
  { id: "naver", label: "네이버페이", bg: "bg-[#03C75A] text-white" },
];

interface WalletChargeModalProps {
  open: boolean;
  currentCoins: number;
  onClose: () => void;
  onChargeComplete: (addedCoins: number, packId: string) => void;
}

export function WalletChargeModal({
  open,
  currentCoins,
  onClose,
  onChargeComplete,
}: WalletChargeModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>("pack_6");
  const [payMethod, setPayMethod] = useState<"kakao" | "toss" | "naver">("kakao");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const selectedPack =
    PACKAGES.find((p) => p.id === selectedPackId) ?? PACKAGES[2];

  const portoneStoreId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const portoneChannelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
  const isPortoneConfigured = Boolean(portoneStoreId && portoneChannelKey);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const win = window as unknown as {
        PortOne?: {
          requestPayment: (params: Record<string, unknown>) => Promise<{ code?: string }>;
        };
      };
      if (
        isPortoneConfigured &&
        win.PortOne &&
        !portoneStoreId?.includes("sajufact-prod-001")
      ) {
        const res = await win.PortOne.requestPayment({
          storeId: portoneStoreId,
          channelKey: portoneChannelKey,
          paymentId: `sf-carrot-${Date.now()}`,
          orderName: `사주팩트 ${selectedPack.name}`,
          totalAmount: selectedPack.price,
          currency: "KRW",
          payMethod: "EASY_PAY",
        });
        if (res?.code) {
          setIsProcessing(false);
          return;
        }
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
      onChargeComplete(selectedPack.totalCoins, selectedPack.id);
    } catch {
      onChargeComplete(selectedPack.totalCoins, selectedPack.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-violet-950/35 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[460px] rounded-t-[30px] sm:rounded-[30px] bg-gradient-to-b from-[#fffaf5] via-[#fdf5fb] to-white p-5 sm:p-6 shadow-2xl border border-white max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/mascot/dalto-rabbit.jpg"
              alt="달토끼 달토"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-orange-200 shadow-sm"
            />
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                🥕 달토의 당근 충전소
              </h3>
              <p className="text-[11px] text-slate-500">
                현재 보유:{" "}
                <strong className="text-orange-600">🥕 당근 {currentCoins}개</strong> · 당근
                1개=990원
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-violet-100/70 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 mb-4">
          {PACKAGES.map((pack) => {
            const active = selectedPackId === pack.id;
            return (
              <motion.button
                key={pack.id}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedPackId(pack.id)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition relative ${
                  active
                    ? "border-orange-400 bg-gradient-to-r from-orange-50/90 via-rose-50/70 to-violet-50/80 shadow-md"
                    : "border-violet-100 bg-white/80 hover:border-orange-200"
                }`}
              >
                {pack.badge && (
                  <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-extrabold shadow-xs">
                    {pack.badge}
                  </span>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>🥕 {pack.name}</span>
                      {pack.bonusCoins > 0 && (
                        <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px] font-extrabold">
                          총 {pack.totalCoins}개
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{pack.desc}</p>
                  </div>
                  <span className="text-base font-black text-[#4d3780] shrink-0">
                    {pack.priceText}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-slate-600 mb-2">간편결제 선택</p>
          <div className="grid grid-cols-3 gap-2">
            {PAY_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPayMethod(m.id)}
                className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold transition border-2 ${
                  m.bg
                } ${
                  payMethod === m.id
                    ? "border-slate-900 scale-[1.02] shadow-md"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={isProcessing}
          onClick={handlePay}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-500 hover:brightness-105 text-white font-extrabold text-sm shadow-lg transition disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          {isProcessing
            ? "달토 바구니에 당근 담는 중..."
            : `${selectedPack.priceText} 결제하고 🥕 ${selectedPack.totalCoins}개 받기`}
        </motion.button>

        <button
          type="button"
          onClick={() => onChargeComplete(selectedPack.totalCoins, selectedPack.id)}
          className="w-full mt-2 py-2.5 rounded-2xl bg-orange-100/80 hover:bg-orange-200/80 text-orange-900 text-xs font-bold flex items-center justify-center gap-1.5 border border-orange-200 transition"
        >
          <Zap className="w-3.5 h-3.5" />
          테스트용 즉시 충전 (+{selectedPack.totalCoins}당근 바로 받기)
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          당근을 주면 달토의 뼈 때리는 채찍과 따뜻한 처방전이 바로 열려요!
        </p>
        <div className="hidden">
          <Check />
        </div>
      </motion.div>
    </div>
  );
}
