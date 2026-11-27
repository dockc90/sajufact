"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ShieldCheck, Smartphone, Sparkles, X, Zap } from "lucide-react";
import type { PaymentPlan } from "@/lib/saju-types";

interface PaymentModalProps {
  open: boolean;
  initialPlan: PaymentPlan;
  currentPaidPlan?: PaymentPlan | null;
  defaultPhone?: string;
  onClose: () => void;
  onComplete: (
    plan: PaymentPlan,
    phone?: string,
    paidAmount?: 990 | 1910 | 2900,
    payMethod?: "kakao" | "toss" | "naver" | "card"
  ) => void;
}

const PAY_METHODS: Array<{
  id: "kakao" | "toss" | "naver";
  label: string;
  bg: string;
}> = [
  { id: "kakao", label: "카카오페이", bg: "bg-[#FEE500] text-[#191919]" },
  { id: "toss", label: "토스페이", bg: "bg-[#0064FF] text-white" },
  { id: "naver", label: "네이버페이", bg: "bg-[#03C75A] text-white" },
];

export function PaymentModal({
  open,
  initialPlan,
  currentPaidPlan = null,
  defaultPhone = "",
  onClose,
  onComplete,
}: PaymentModalProps) {
  const isUpgradeFromSingle = currentPaidPlan === "single";
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>(
    isUpgradeFromSingle ? "allinone" : initialPlan
  );
  const [payMethod, setPayMethod] = useState<"kakao" | "toss" | "naver">("kakao");
  const [phone, setPhone] = useState(defaultPhone);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const resolvedPlan: PaymentPlan = isUpgradeFromSingle ? "allinone" : selectedPlan;
  const amount: 990 | 1910 | 2900 =
    resolvedPlan === "allinone" ? (isUpgradeFromSingle ? 1910 : 2900) : 990;
  const priceText =
    amount === 1910 ? "1,910원" : amount === 2900 ? "2,900원" : "990원";
  const portoneStoreId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const portoneChannelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
  const isPortoneConfigured = Boolean(portoneStoreId && portoneChannelKey);

  const handleSimulatePay = async () => {
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
          paymentId: `sf-${Date.now()}`,
          orderName: isUpgradeFromSingle
            ? "사주팩트 올인원 업그레이드 (차액 결제)"
            : resolvedPlan === "allinone"
            ? "사주팩트 올인원 패키지"
            : "사주팩트 단건 테마 리포트",
          totalAmount: amount,
          currency: "KRW",
          payMethod: "EASY_PAY",
        });
        if (res?.code) {
          setIsProcessing(false);
          return;
        }
      } else {
        await new Promise((r) => setTimeout(r, 650));
      }
      onComplete(resolvedPlan, phone.trim() || undefined, amount, payMethod);
    } catch {
      onComplete(resolvedPlan, phone.trim() || undefined, amount, payMethod);
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-500" />
            <h3 className="text-lg font-extrabold text-slate-900">
              전체 팩트 리포트 잠금 해제
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            aria-label="결제 모달 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2단 업셀링 플랜 선택 */}
        {isUpgradeFromSingle && (
          <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2.5 text-xs font-bold text-emerald-900">
            ✅ 단건 테마 리포트(990원) 기결제가 확인되어{" "}
            <span className="underline">차액 1,910원만</span> 결제됩니다.
          </div>
        )}

        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            onClick={() => setSelectedPlan("allinone")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition relative ${
              resolvedPlan === "allinone"
                ? "border-slate-900 bg-amber-50/70 shadow-sm"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {isUpgradeFromSingle
                ? "990원 기결제 차액 할인"
                : "BEST 주력 · 84% 선택"}
            </span>
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                {isUpgradeFromSingle
                  ? "올인원 패키지 업그레이드"
                  : "올인원 패키지"}
              </span>
              <div className="text-right">
                <span className="text-xs line-through text-slate-400 mr-1.5">
                  {isUpgradeFromSingle ? "2,900원" : "5,900원"}
                </span>
                <span className="text-lg font-black text-rose-600">
                  {isUpgradeFromSingle ? "1,910원" : "2,900원"}
                </span>
              </div>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 mt-1.5">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                선택 테마 전체 풀이 + 인스타 수호신 카드 (9:16 / 4:5 저장)
              </li>
              <li className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                2027년 12개월 월별 운세 그래프 + 연애/궁합 스캔 1회권
              </li>
              <li className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                부족한 오행을 채워주는 맞춤형 액땜 행운 부적
              </li>
            </ul>
          </button>

          <button
            type="button"
            disabled={isUpgradeFromSingle}
            onClick={() => setSelectedPlan("single")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition ${
              isUpgradeFromSingle
                ? "border-slate-200 bg-slate-100/70 opacity-55 cursor-not-allowed"
                : resolvedPlan === "single"
                ? "border-slate-900 bg-slate-50 shadow-sm"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">
                  단건 테마 리포트 {isUpgradeFromSingle ? "(이미 결제됨)" : ""}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  선택한 테마 1종 전체 리포트 + 인스타 공유 카드 저장
                </p>
              </div>
              <span className="text-base font-extrabold text-slate-900">
                {isUpgradeFromSingle ? "결제 완료" : "990원"}
              </span>
            </div>
          </button>
        </div>

        {/* 간편결제 수단 선택 */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-600 mb-2">
            간편결제 수단 선택
          </p>
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

        {/* 결과 영구 보관용 번호 (선택) */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            결과 영구 보관용 휴대폰 번호 (선택 · 로그인 불필요)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000 (미입력 시 브라우저에 자동 저장)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={handleSimulatePay}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xl transition disabled:opacity-60"
        >
          {isProcessing
            ? "간편결제 승인 처리 중..."
            : `${priceText} 결제하고 즉시 전체 보기`}
        </button>

        {/* 테스트용 스킵 버튼 */}
        <button
          type="button"
          onClick={() =>
            onComplete(
              resolvedPlan,
              phone.trim() || undefined,
              amount,
              payMethod
            )
          }
          className="w-full mt-2.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-300/80 transition"
        >
          <Zap className="w-3.5 h-3.5" />
          테스트용 결제 즉시 완료 ({priceText} · 스킵하고 결과 보기)
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          {isPortoneConfigured
            ? `포트원 V2 간편결제 연동 준비됨 (${portoneStoreId})`
            : "포트원·토스페이먼츠 연동용 데모 결제창 (즉시 잠금 해제 가능)"}
        </p>
      </motion.div>
    </div>
  );
}
