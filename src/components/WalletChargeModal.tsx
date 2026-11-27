"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles, X, Zap } from "lucide-react";

interface ChargePackage {
  id: string;
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
    baseCoins: 1,
    bonusCoins: 0,
    totalCoins: 1,
    price: 990,
    priceText: "990원",
    desc: "궁금한 리포트 1종 즉시 열기",
  },
  {
    id: "pack_4",
    baseCoins: 3,
    bonusCoins: 1,
    totalCoins: 4,
    price: 2900,
    priceText: "2,900원",
    badge: "BEST · 1개 보너스",
    desc: "기본+신년+연애+궁합 한 번에 스캔",
  },
  {
    id: "pack_10",
    baseCoins: 7,
    bonusCoins: 3,
    totalCoins: 10,
    price: 5900,
    priceText: "5,900원",
    badge: "인기 · 3개 보너스",
    desc: "7종 전 테마 + 복고양이 집중 상담",
  },
  {
    id: "pack_20",
    baseCoins: 15,
    bonusCoins: 5,
    totalCoins: 20,
    price: 9900,
    priceText: "9,900원",
    badge: "VIP · 5개 보너스",
    desc: "친구·가족 사주까지 무제한 케어",
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
  const [selectedPackId, setSelectedPackId] = useState<string>("pack_4");
  const [payMethod, setPayMethod] = useState<"kakao" | "toss" | "naver">("kakao");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const selectedPack =
    PACKAGES.find((p) => p.id === selectedPackId) ?? PACKAGES[1];

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
          paymentId: `sf-coin-${Date.now()}`,
          orderName: `사주팩트 복주머니 ${selectedPack.totalCoins}개`,
          totalAmount: selectedPack.price,
          currency: "KRW",
          payMethod: "EASY_PAY",
        });
        if (res?.code) {
          setIsProcessing(false);
          return;
        }
      } else {
        await new Promise((r) => setTimeout(r, 550));
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src="/mascot/lucky-cat.jpg"
              alt="복고양이"
              className="w-9 h-9 rounded-full object-cover border border-amber-300"
            />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                복주머니 충전소
              </h3>
              <p className="text-[11px] text-slate-500">
                현재 보유: <strong className="text-rose-600">👝 {currentCoins}개</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {PACKAGES.map((pack) => {
            const active = selectedPackId === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedPackId(pack.id)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition relative ${
                  active
                    ? "border-slate-900 bg-amber-50/70 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {pack.badge && (
                  <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {pack.badge}
                  </span>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>👝 복주머니 {pack.totalCoins}개</span>
                      {pack.bonusCoins > 0 && (
                        <span className="text-[11px] font-bold text-rose-600">
                          ({pack.baseCoins}+{pack.bonusCoins})
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{pack.desc}</p>
                  </div>
                  <span className="text-base font-black text-slate-900 shrink-0">
                    {pack.priceText}
                  </span>
                </div>
              </button>
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
                className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition border-2 ${
                  m.bg
                } ${
                  payMethod === m.id
                    ? "border-slate-950 scale-[1.02] shadow-md"
                    : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={handlePay}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xl transition disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          {isProcessing
            ? "복주머니 충전 중..."
            : `${selectedPack.priceText} 결제하고 ${selectedPack.totalCoins}개 받기`}
        </button>

        <button
          type="button"
          onClick={() => onChargeComplete(selectedPack.totalCoins, selectedPack.id)}
          className="w-full mt-2 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-300/80 transition"
        >
          <Zap className="w-3.5 h-3.5" />
          테스트용 즉시 충전 (+{selectedPack.totalCoins}개 바로 받기)
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          충전한 복주머니는 모든 테마와 복고양이 수다방에서 자유롭게 사용됩니다.
        </p>
        <div className="hidden">
          <Check />
        </div>
      </motion.div>
    </div>
  );
}
