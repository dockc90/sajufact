"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  Camera,
  Check,
  Clock,
  Coins,
  Compass,
  Copy,
  FolderOpen,
  Heart,
  Link2,
  Lock,
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sun,
  Ticket,
  TrendingUp,
} from "lucide-react";
import {
  ELEMENT_THEMES,
  GUARDIAN_BEAST_META,
  MENU_ITEMS,
  buildCompatibilityReport,
  calculateTodayFortune,
  toShortCardFact,
} from "@/lib/saju-engine";
import type { PaymentPlan, SajuReport } from "@/lib/saju-types";
import { upsertLocalArchive } from "./ArchiveModal";
import { PaymentModal } from "./PaymentModal";
import { ShareCardStudio } from "./ShareCardStudio";
import {
  FiveElementRadarSvg,
  TalismanSealSvg,
  VermilionSealSvg,
} from "./OrientalArtSvg";

interface ResultViewProps {
  initialReport: SajuReport;
  initialPaidPlan?: PaymentPlan | null;
  initialPhone?: string;
  isInvitedFriendMode?: boolean;
  walletCoins?: number;
  freeChatTickets?: number;
  onUnlockWithCoins?: (reportId: string, coinCost: number) => boolean;
  onOpenChargeModal?: () => void;
  onOpenChat?: (contextText?: string) => void;
  onPaidPlanChange?: (plan: PaymentPlan, phone?: string) => void;
  onOpenArchive?: () => void;
  onResetHome: () => void;
}

type MainTab = "deep" | "today" | "core" | "card";
type DeepSubTab =
  | "risk"
  | "temperament"
  | "health"
  | "flow"
  | "compat"
  | "daeun"
  | "yeonun"
  | "taekil"
  | "love";

export function ResultView({
  initialReport,
  initialPaidPlan = null,
  initialPhone = "",
  isInvitedFriendMode = false,
  walletCoins = 1,
  freeChatTickets = 1,
  onUnlockWithCoins,
  onOpenChargeModal,
  onOpenChat,
  onPaidPlanChange,
  onOpenArchive,
  onResetHome,
}: ResultViewProps) {
  const [report, setReport] = useState<SajuReport>(initialReport);
  const [paidPlan, setPaidPlan] = useState<PaymentPlan | null>(initialPaidPlan);
  const [keeperPhone, setKeeperPhone] = useState<string>(initialPhone);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [modalInitialPlan, setModalInitialPlan] = useState<PaymentPlan>("allinone");

  const getInitialSubTab = (): DeepSubTab => {
    switch (initialReport.input.menu) {
      case "daeun":
        return "daeun";
      case "yeonun":
        return "yeonun";
      case "taekil":
        return "taekil";
      case "love":
        return "love";
      case "health":
        return "health";
      case "lifetime":
        return "temperament";
      case "compatibility":
        return "compat";
      default:
        return "risk";
    }
  };

  const [activeTab, setActiveTab] = useState<MainTab>(
    initialReport.input.menu === "today" ? "today" : "deep"
  );
  const [deepSubTab, setDeepSubTab] = useState<DeepSubTab>(getInitialSubTab);
  const [previewBabyThumb, setPreviewBabyThumb] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(4);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [extraPartnerName, setExtraPartnerName] = useState("");
  const [extraPartnerBirth, setExtraPartnerBirth] = useState("1995-08-20");

  const theme = ELEMENT_THEMES[report.dominantElement];
  const guardian = GUARDIAN_BEAST_META[report.dominantElement];
  const activeMenuMeta =
    MENU_ITEMS.find((m) => m.id === report.input.menu) ?? MENU_ITEMS[1];
  const coinCost = Math.max(1, activeMenuMeta.coinCost || 1);

  const liveToday =
    report.todayReport ??
    calculateTodayFortune(
      report.input,
      report.dayMasterHanja,
      report.dayBranchHanja || "午",
      report.weakestElement
    );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const openPayModal = (plan: PaymentPlan) => {
    setModalInitialPlan(plan);
    setPayModalOpen(true);
  };

  const handleUnlockByCoins = () => {
    if (!onUnlockWithCoins) {
      openPayModal("allinone");
      return;
    }
    const unlocked = onUnlockWithCoins(report.id, coinCost);
    if (!unlocked) {
      onOpenChargeModal?.();
      return;
    }
    setPaidPlan("allinone");
    onPaidPlanChange?.("allinone", keeperPhone || undefined);
    upsertLocalArchive(report, "allinone", keeperPhone || undefined);
    void fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: report.id,
        paidPlan: "allinone",
        keeperPhone: keeperPhone || null,
        report,
      }),
    }).catch(() => {});
    showToast(`👝 복주머니 ${coinCost}개로 전체 리포트 & 수호신 카드가 열렸습니다!`);
  };

  const handlePaymentComplete = (
    plan: PaymentPlan,
    phone?: string,
    paidAmount?: 990 | 1910 | 2900,
    payMethod?: "kakao" | "toss" | "naver" | "card"
  ) => {
    setPaidPlan(plan);
    if (phone) setKeeperPhone(phone);
    setPayModalOpen(false);
    onPaidPlanChange?.(plan, phone);

    const nextPhone = phone || keeperPhone || undefined;
    upsertLocalArchive(report, plan, nextPhone);
    try {
      localStorage.setItem(
        `sajufact_report_${report.id}`,
        JSON.stringify({ report, plan, phone: nextPhone })
      );
    } catch {
      // ignore storage quota
    }

    const amount: 990 | 1910 | 2900 =
      paidAmount ?? (plan === "allinone" ? 2900 : 990);
    void fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: report.id,
        paidPlan: plan,
        keeperPhone: nextPhone ?? null,
        report,
        payment: {
          plan,
          amount,
          payMethod: payMethod ?? "kakao",
          merchantUid: `sf-${report.id}-${Date.now()}`,
        },
      }),
    }).catch(() => {});

    showToast(
      amount === 1910
        ? "차액 1,910원 결제로 올인원 업그레이드가 완료되었습니다!"
        : "전체 리포트 잠금이 해제되었습니다!"
    );
  };

  const handleCopyInviteLink = async () => {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://sajufact.kr";
    const url = `${base}/?inviter=${encodeURIComponent(
      report.input.name
    )}&inviterBirth=${encodeURIComponent(report.input.birthDate)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("궁합 초대 링크가 복사되었습니다!");
    } catch {
      showToast(`초대 링크: ${url}`);
    }
  };

  const handleCopyPermanentUrl = async () => {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://sajufact.kr";
    const url = `${base}/?saved=${encodeURIComponent(report.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("평생 보관 URL이 클립보드에 복사되었습니다.");
    } catch {
      showToast("결과가 안전하게 보관되었습니다.");
    }
  };

  const handleRunFreeCompatTicket = () => {
    if (!extraPartnerName.trim()) {
      showToast("상대방 이름을 입력해 주세요.");
      return;
    }
    const compat = buildCompatibilityReport(
      report.input.name,
      report.input.birthDate,
      extraPartnerName,
      extraPartnerBirth,
      report.dominantElement
    );
    setReport((prev) => ({ ...prev, compatibility: compat }));
    showToast(`${compat.partnerName}님과의 정밀 궁합 스캔이 완료되었습니다!`);
  };

  const activeMonthObj =
    report.monthlyFlow.find((m) => m.month === selectedMonth) ??
    report.monthlyFlow[3];
  const shortSummaryFact = toShortCardFact(report.oneLineFact, 56);
  const previewSnippet =
    report.input.menu === "daeun" && report.daeunReport
      ? report.daeunReport.headline
      : report.input.menu === "yeonun" && report.yeonunReport
      ? report.yeonunReport.headline
      : report.input.menu === "taekil" && report.taekilReport
      ? report.taekilReport.headline
      : report.input.menu === "love" && report.loveReport
      ? report.loveReport.patternTitle
      : report.criticalMistake2027.detail.slice(0, 75) + "…";

  const renderTeaserCard = (mobileVisible = false) => (
    <section
      className={`${
        mobileVisible ? "block" : "hidden lg:block"
      } glass-card rounded-3xl p-4 sm:p-5 space-y-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full whitespace-nowrap">
          <Camera className="w-3 h-3" />
          수호 영물 결과 카드
        </span>
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
          {guardian.nameKo} · {theme.nameKo}
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-amber-200/80 bg-slate-950 text-white shadow-lg">
        <div className="relative h-52 overflow-hidden">
          <img
            src={previewBabyThumb ? guardian.babyImage : guardian.image}
            alt={guardian.nameKo}
            className="w-full h-full object-cover blur-[3px] scale-105 opacity-85"
          />
          <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center p-4 text-center">
            <Lock className="w-6 h-6 text-amber-300 mb-1.5" />
            <p className="font-serif text-sm font-black">
              {guardian.nameKo} · 아기 신수 · 천명서 3종 잠금됨
            </p>
          </div>
        </div>
        <div className="p-3.5 bg-[#121122] text-center space-y-2.5">
          <p className="text-xs text-amber-100/90 font-semibold">
            🐅 영험한 신수 · 🐾 아기 신수 · 📜 천명 감정서
          </p>
          <button
            type="button"
            onClick={handleUnlockByCoins}
            className="w-full py-2.5 rounded-xl bg-amber-300 text-slate-950 text-xs font-extrabold hover:bg-amber-200 transition shadow"
          >
            {walletCoins >= coinCost
              ? `👝 복주머니 ${coinCost}개로 바로 열기 (보유 ${walletCoins}개)`
              : `👝 복주머니 충전하고 카드 저장하기`}
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 lg:pt-7 pb-16 space-y-4">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onResetHome}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold text-slate-700 hover:bg-white transition whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          홈 대시보드
        </button>
        <div className="flex items-center gap-2">
          {onOpenArchive && (
            <button
              type="button"
              onClick={onOpenArchive}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/85 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              내 보관함
            </button>
          )}
        </div>
      </div>

      {/* 토스트 알림 */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-40 rounded-2xl bg-slate-900 text-white text-xs font-bold px-4 py-3 shadow-xl flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </motion.div>
      )}

      {/* 반응형 2단 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
        <div className="lg:col-span-7 space-y-4">
          {/* ① 상단 히어로 요약 카드 */}
          <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-200 text-[11px] font-extrabold whitespace-nowrap">
                  {activeMenuMeta.emoji} {activeMenuMeta.title}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold whitespace-nowrap ${theme.badgeBg}`}
                >
                  {report.tierBadge}
                </span>
              </div>
              <VermilionSealSvg label="사주印" className="w-7 h-7 shrink-0" />
            </div>

            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setPreviewBabyThumb((v) => !v)}
                title="클릭해 영험한 신수 / 아기 신수 전환"
                className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-300/70 shrink-0 shadow-md group"
              >
                <img
                  src={previewBabyThumb ? guardian.babyImage : guardian.image}
                  alt={previewBabyThumb ? guardian.babyNameKo : guardian.nameKo}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <span className="absolute inset-x-0 bottom-0 bg-slate-950/75 text-[9px] font-bold text-amber-200 py-0.5 text-center">
                  {previewBabyThumb ? "🐾 아기" : "🐅 신수"}
                </span>
              </button>

              <div className="min-w-0 flex-1 text-left space-y-1">
                <p className="text-[11px] font-bold text-slate-500">
                  {report.input.name} · {report.dayMasterHangul}
                  {report.dayBranchHangul ?? ""}(
                  {report.dayMasterHanja}
                  {report.dayBranchHanja ?? ""})일주 ·{" "}
                  <span className="text-slate-800">
                    {previewBabyThumb ? guardian.babyNameKo : guardian.nameKo} 수호
                  </span>
                </p>
                <h1 className="font-serif text-base sm:text-xl font-black text-slate-900 leading-snug break-keep">
                  “{shortSummaryFact}”
                </h1>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {report.subHook}
                </p>
              </div>
            </div>

            {(isInvitedFriendMode || report.input.menu === "compatibility") &&
              report.compatibility && (
                <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-extrabold text-pink-700 block">
                      💕 {report.input.name} × {report.compatibility.partnerName} 궁합
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate block">
                      {report.compatibility.gradeLabel}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-rose-600 shrink-0">
                    {report.compatibility.score}점
                  </span>
                </div>
              )}

            {/* 복고양이 수다방 락인 CTA */}
            {onOpenChat && (
              <button
                type="button"
                onClick={() =>
                  onOpenChat(`[${activeMenuMeta.title}] ${report.oneLineFact}`)
                }
                className="w-full rounded-2xl bg-gradient-to-r from-amber-100/90 via-rose-50 to-amber-50 border border-amber-300/80 px-3.5 py-2.5 flex items-center justify-between gap-2 hover:brightness-98 transition"
              >
                <div className="flex items-center gap-2 min-w-0 text-left">
                  <img
                    src="/mascot/lucky-cat.jpg"
                    alt="복고양이"
                    className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      🐱 복고양이에게 이 결과로 꼬리 질문하기
                    </p>
                    <p className="text-[10.5px] text-slate-600 truncate">
                      내 원국을 기억한 채 직언+처방 상담 (무료 수다권 우선 사용)
                    </p>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-900 text-amber-200 px-2.5 py-1 text-[10px] font-extrabold whitespace-nowrap">
                  <Ticket className="w-3 h-3" />
                  {freeChatTickets > 0 ? `무료 ${freeChatTickets}장` : "수다방"}
                </span>
              </button>
            )}
          </section>

          {/* ② 메인 4탭 바 */}
          <div className="sticky top-[58px] sm:top-[66px] z-20 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/80 p-1.5 shadow-sm grid grid-cols-4 gap-1">
            {(
              [
                { id: "deep", label: "🎯 핵심 풀이" },
                { id: "today", label: "☀️ 오늘 일진" },
                { id: "core", label: "🧭 사주·오행" },
                { id: "card", label: "🐾 신수 카드" },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-extrabold transition whitespace-nowrap ${
                    active
                      ? "bg-slate-900 text-amber-200 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ③ 탭별 콘텐츠 영역 */}
          {activeTab === "deep" && (
            <div className="space-y-4">
              {!paidPlan ? (
                /* 앞부분 20% 무료 티저 + 복주머니 코인 1클릭 잠금 해제 */
                <section className="glass-card rounded-3xl p-5 space-y-4 border border-amber-200/80 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold">
                        <Lock className="w-3 h-3" />
                        20% 무료 미리보기
                      </span>
                      <span className="text-[11px] font-bold text-amber-800">
                        보유 복주머니 👝 {walletCoins}개
                      </span>
                    </div>
                    <h2 className="font-serif text-base sm:text-lg font-black text-slate-900">
                      {activeMenuMeta.emoji} {activeMenuMeta.title} 핵심 미리보기
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white/85 rounded-2xl p-3 border border-white">
                      {previewSnippet}
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-xs font-semibold text-slate-800 bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70">
                    <li className="flex items-center gap-2">
                      <span>🔒</span>
                      <span>
                        {report.criticalMistake2027.dangerMonth} 주의보 & 횡재 타이밍 전체 공개
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🔒</span>
                      <span>대운·연운·택일·12개월 흐름 & 맞춤형 액땜 부적</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🔒</span>
                      <span>
                        {guardian.nameKo} · {guardian.babyNameKo} PNG 결과 카드 3종 저장
                      </span>
                    </li>
                  </ul>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleUnlockByCoins}
                      className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl flex items-center justify-between transition"
                    >
                      <div className="text-left">
                        <span className="inline-block text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full mb-0.5">
                          {walletCoins >= coinCost
                            ? "즉시 1클릭 잠금 해제"
                            : "복주머니 충전 필요"}
                        </span>
                        <p className="text-sm font-extrabold">
                          👝 복주머니 {coinCost}개로 전체 열기
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-amber-300 shrink-0">
                        {walletCoins >= coinCost
                          ? `보유 ${walletCoins}개 →`
                          : "충전하기 →"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPayModal("single")}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between text-xs font-bold transition"
                    >
                      <span>단건 카드 결제로 바로 열기</span>
                      <span className="text-slate-900 font-extrabold">990원 →</span>
                    </button>
                  </div>
                </section>
              ) : (
                /* 해제된 상세 풀이 — 세부 서브탭 */
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {[
                      ...(report.input.menu === "daeun"
                        ? [{ id: "daeun" as const, label: "🌌 10년 대운" }]
                        : []),
                      ...(report.input.menu === "yeonun"
                        ? [{ id: "yeonun" as const, label: "📆 3년 연운" }]
                        : []),
                      ...(report.input.menu === "taekil"
                        ? [{ id: "taekil" as const, label: "🗓️ 대박 길일" }]
                        : []),
                      ...(report.input.menu === "love"
                        ? [{ id: "love" as const, label: "💘 연애운" }]
                        : []),
                      { id: "risk" as const, label: "⚠️ 주의·횡재" },
                      { id: "temperament" as const, label: "⚡ 본성·관계" },
                      { id: "health" as const, label: "🩺 체질·건강" },
                      ...(report.compatibility
                        ? [{ id: "compat" as const, label: "💕 궁합 상세" }]
                        : []),
                      { id: "flow" as const, label: "📈 12개월·부적" },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setDeepSubTab(sub.id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition whitespace-nowrap ${
                          deepSubTab === sub.id
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  {deepSubTab === "daeun" && report.daeunReport && (
                    <section className="glass-card rounded-3xl p-5 space-y-3 text-left">
                      <h3 className="font-serif text-base font-black text-slate-900">
                        🌌 인생 10년 대운 흐름 · 황금기 {report.daeunReport.goldenAge}
                      </h3>
                      <p className="text-xs font-semibold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        {report.daeunReport.headline}
                      </p>
                      <div className="space-y-2">
                        {report.daeunReport.decades.map((d) => (
                          <div
                            key={d.ageRange}
                            className="rounded-2xl bg-white/85 border border-slate-200/70 p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs font-extrabold">
                              <span className="text-slate-900">
                                {d.ageRange} · {d.ganZhi} ({d.elementKo})
                              </span>
                              <span className="rounded-full bg-slate-900 text-amber-200 px-2 py-0.5 text-[10px]">
                                {d.keyword} {d.score}점
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {d.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {deepSubTab === "yeonun" && report.yeonunReport && (
                    <section className="glass-card rounded-3xl p-5 space-y-3 text-left">
                      <h3 className="font-serif text-base font-black text-slate-900">
                        📆 2026~2028 3년 연운 스캔
                      </h3>
                      <p className="text-xs text-slate-600">{report.yeonunReport.headline}</p>
                      <div className="space-y-2.5">
                        {report.yeonunReport.years.map((y) => (
                          <div
                            key={y.year}
                            className="rounded-2xl bg-white/85 border border-slate-200/70 p-3.5 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-slate-900">
                                {y.year}년 {y.ganZhi}
                              </span>
                              <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-[11px] font-bold">
                                {y.badge} · {y.score}점
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {y.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {deepSubTab === "taekil" && report.taekilReport && (
                    <section className="glass-card rounded-3xl p-5 space-y-3 text-left">
                      <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-emerald-600" />
                        중요 계약·이직·연애 대박 길일
                      </h3>
                      <p className="text-xs text-slate-600">{report.taekilReport.headline}</p>
                      <div className="space-y-2.5">
                        {report.taekilReport.recommendedDates.map((item) => (
                          <div
                            key={item.dateLabel}
                            className="rounded-2xl bg-emerald-50/75 border border-emerald-200 p-3.5 space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs font-extrabold">
                              <span className="text-emerald-900">
                                {item.dateLabel} ({item.ganZhi})
                              </span>
                              <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px]">
                                {item.purpose}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {item.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-900">
                        ⚠️ 피할 날: {report.taekilReport.avoidDatesNote}
                      </p>
                    </section>
                  )}

                  {deepSubTab === "love" && report.loveReport && (
                    <section className="glass-card rounded-3xl p-5 border-l-4 border-l-pink-500 space-y-3 text-left">
                      <h3 className="font-serif text-base font-black text-slate-900">
                        💘 {report.loveReport.patternTitle}
                      </h3>
                      <p className="text-[13px] text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">✨ 끌리는 포인트:</strong>{" "}
                        {report.loveReport.attractionTrigger}
                      </p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">📅 도화 타이밍:</strong>{" "}
                        {report.loveReport.goldenTiming}
                      </p>
                      <div className="rounded-xl bg-pink-50 border border-pink-200 p-3 text-xs font-bold text-rose-900">
                        💌 복고양이 연애 처방: {report.loveReport.lovePrescription}
                      </div>
                    </section>
                  )}

                  {deepSubTab === "risk" && (
                    <div className="space-y-3">
                      <section className="glass-card rounded-3xl p-5 border-l-4 border-l-rose-500 space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-rose-700 text-xs font-extrabold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{report.criticalMistake2027.dangerMonth} 주의보</span>
                        </div>
                        <h3 className="font-serif text-base font-black text-slate-900">
                          {report.criticalMistake2027.title}
                        </h3>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          {report.criticalMistake2027.detail}
                        </p>
                        <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs font-bold text-rose-900">
                          💡 {report.criticalMistake2027.actionRule}
                        </div>
                      </section>

                      <section className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-500 space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold">
                          <Coins className="w-4 h-4 shrink-0" />
                          <span>횡재 피크: {report.windfallTiming.bestMonth}</span>
                        </div>
                        <h3 className="font-serif text-base font-black text-slate-900">
                          {report.windfallTiming.moneyRoute}
                        </h3>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          {report.windfallTiming.detail}
                        </p>
                      </section>
                    </div>
                  )}

                  {deepSubTab === "temperament" && (
                    <section className="glass-card rounded-3xl p-5 space-y-3 text-left">
                      <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        타고난 본성 · 소비 습관 · 인간관계
                      </h3>
                      <div className="space-y-2.5 text-[13px] text-slate-700 leading-relaxed">
                        <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                          <p className="text-xs font-extrabold text-slate-900 mb-1">
                            1. 본성 & 기질
                          </p>
                          <p>{report.coreFactReport.temperament}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                          <p className="text-xs font-extrabold text-slate-900 mb-1">
                            2. 돈 새는 소비 습관
                          </p>
                          <p>{report.coreFactReport.moneyLeakHabit}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                          <p className="text-xs font-extrabold text-slate-900 mb-1">
                            3. 피해야 할 상극 유형
                          </p>
                          <p>{report.coreFactReport.toxicRelationWarning}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {deepSubTab === "health" && (
                    <section className="glass-card rounded-3xl p-5 border-l-4 border-l-teal-500 space-y-3 text-left">
                      <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-600" />
                        오행 체질 & 2027 건강·번아웃 진단
                      </h3>
                      <div className="rounded-2xl bg-teal-50 border border-teal-200/80 p-3 space-y-1">
                        <p className="text-[11px] font-extrabold text-teal-800">
                          🩺 취약 신체 부위
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          {report.healthReport.vulnerableOrgans}
                        </p>
                      </div>
                      <p className="text-[13px] text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">⚡ 번아웃 신호:</strong>{" "}
                        {report.healthReport.burnoutPattern}
                      </p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">📅 주의 시기:</strong>{" "}
                        {report.healthReport.cautionSeason2027}
                      </p>
                      <div className="rounded-xl bg-white/90 border border-teal-200/70 p-3 text-xs font-semibold text-slate-800">
                        💊 처방전: {report.healthReport.dailyPrescription}
                      </div>
                    </section>
                  )}

                  {deepSubTab === "compat" && report.compatibility && (
                    <section className="glass-card rounded-3xl p-5 border-l-4 border-l-pink-500 space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-rose-500" />
                          {report.input.name} × {report.compatibility.partnerName} 정밀 궁합
                        </h3>
                        <span className="text-xl font-black text-rose-600">
                          {report.compatibility.score}점
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 bg-rose-50/80 p-3 rounded-xl">
                        {report.compatibility.headline}
                      </p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">
                        <strong>⚡ 에너지 역학:</strong> {report.compatibility.dynamicRole}
                      </p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">
                        <strong>💣 갈등 지뢰밭:</strong> {report.compatibility.conflictPoint}
                      </p>
                      <div className="rounded-xl bg-white/90 border border-pink-200 p-3 text-xs font-bold text-rose-900">
                        💘 솔루션: {report.compatibility.solutionTip}
                      </div>
                    </section>
                  )}

                  {deepSubTab === "flow" && (
                    <>
                      {paidPlan === "allinone" ? (
                        <div className="space-y-4">
                          <section className="glass-card rounded-3xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-indigo-600" />
                                2027년 12개월 운세 흐름
                              </h3>
                              <span className="text-[11px] text-slate-500">월 클릭</span>
                            </div>

                            <div className="grid grid-cols-12 gap-1.5 items-end h-28 pt-3 pb-1 px-1 bg-white/60 rounded-2xl border border-white">
                              {report.monthlyFlow.map((m) => {
                                const isSelected = m.month === selectedMonth;
                                const barColor =
                                  m.score >= 85
                                    ? "bg-emerald-500"
                                    : m.score <= 55
                                    ? "bg-rose-500"
                                    : "bg-slate-800";
                                return (
                                  <button
                                    key={m.month}
                                    type="button"
                                    onClick={() => setSelectedMonth(m.month)}
                                    className="flex flex-col items-center justify-end h-full"
                                  >
                                    <span className="text-[9px] font-bold text-slate-600 mb-0.5">
                                      {m.score}
                                    </span>
                                    <div
                                      style={{ height: `${Math.max(18, m.score * 0.72)}%` }}
                                      className={`w-full rounded-t-md transition-all ${barColor} ${
                                        isSelected ? "ring-2 ring-amber-400" : "opacity-80"
                                      }`}
                                    />
                                    <span className="text-[10px] mt-1 font-bold text-slate-700">
                                      {m.month}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="rounded-2xl bg-slate-900 text-white p-3.5 text-left space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-amber-300">
                                  2027년 {activeMonthObj.label} · {activeMonthObj.tag}
                                </span>
                                <span className="font-bold">{activeMonthObj.score}점</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed">
                                {activeMonthObj.note}
                              </p>
                            </div>
                          </section>

                          <section className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-[#1f1c38] to-slate-900 text-white shadow-xl border border-amber-300/30 space-y-3 text-left">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                                  CUSTOM TALISMAN
                                </span>
                                <h3 className="font-serif text-base font-extrabold text-amber-100 mt-0.5">
                                  {report.talisman.talismanTitle}
                                </h3>
                              </div>
                              <TalismanSealSvg
                                hanja={ELEMENT_THEMES[report.talisman.missingElement].hanja}
                                className="w-12 h-12 shrink-0"
                              />
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              부족한{" "}
                              <strong className="text-amber-300">
                                {report.talisman.missingElementKo}
                              </strong>{" "}
                              기운을 채워 {report.talisman.talismanMantra}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="rounded-xl bg-white/10 p-2.5">
                                <span className="text-amber-200/80 block">행운 컬러</span>
                                <strong>{report.talisman.luckyColor}</strong>
                              </div>
                              <div className="rounded-xl bg-white/10 p-2.5">
                                <span className="text-amber-200/80 block">방위 · 숫자</span>
                                <strong>
                                  {report.talisman.luckyDirection} ·{" "}
                                  {report.talisman.luckyNumber}
                                </strong>
                              </div>
                            </div>
                          </section>

                          {!report.compatibility && (
                            <section className="glass-card rounded-3xl p-4 space-y-2.5 text-left">
                              <p className="text-xs font-extrabold text-slate-900">
                                💕 올인원 궁합 스캔 1회권 사용하기
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="상대방 이름"
                                  value={extraPartnerName}
                                  onChange={(e) => setExtraPartnerName(e.target.value)}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                                />
                                <input
                                  type="date"
                                  value={extraPartnerBirth}
                                  onChange={(e) => setExtraPartnerBirth(e.target.value)}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleRunFreeCompatTicket}
                                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition"
                              >
                                궁합 스캔하기
                              </button>
                            </section>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-3xl p-5 bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-3 text-left">
                          <div>
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 mb-1">
                              990원 기결제 적용 · 차액 결제
                            </span>
                            <p className="text-xs font-extrabold text-amber-950">
                              12개월 그래프 · 궁합 스캔 · 액땜 부적 열기
                            </p>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              차액{" "}
                              <strong className="text-rose-700">1,910원만</strong>{" "}
                              결제하면 즉시 업그레이드됩니다.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openPayModal("allinone")}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-amber-200 text-xs font-extrabold shrink-0"
                          >
                            1,910원 업그레이드
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "today" && (
            <section className="glass-card rounded-3xl p-5 space-y-4 border border-amber-200/80 bg-gradient-to-br from-amber-50/75 via-white/90 to-orange-50/50 text-left">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-700 text-xs font-extrabold">
                    <Sun className="w-4 h-4" />
                    <span>{liveToday.dateLabel}</span>
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    오늘 일진 {liveToday.todayGanZhiHangul}({liveToday.todayGanZhiHanja}) ·{" "}
                    <span className="text-amber-700">{liveToday.relationBadge}</span>
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    오늘 지수
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    {liveToday.score}점
                  </span>
                </div>
              </div>

              <p className="rounded-2xl bg-white border border-amber-200/70 px-3.5 py-2.5 text-[13px] font-bold text-slate-900 leading-relaxed">
                “{liveToday.headline}”
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { title: "재물", item: liveToday.signals.wealth },
                    { title: "연애·대인", item: liveToday.signals.love },
                    { title: "일·직장", item: liveToday.signals.work },
                    { title: "컨디션", item: liveToday.signals.condition },
                  ] as const
                ).map(({ title, item }) => (
                  <div
                    key={title}
                    className="rounded-2xl bg-white/90 border border-slate-200/70 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-500">
                        {title}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${
                          item.tone === "good"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.tone === "caution"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-snug">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="rounded-xl bg-white/85 px-3 py-2 border border-white flex gap-2">
                  <span className="shrink-0 font-extrabold text-amber-700">🌅 오전</span>
                  <span className="text-slate-700">{liveToday.timeFlow.morning}</span>
                </div>
                <div className="rounded-xl bg-white/85 px-3 py-2 border border-white flex gap-2">
                  <span className="shrink-0 font-extrabold text-orange-700">☀️ 오후</span>
                  <span className="text-slate-700">{liveToday.timeFlow.afternoon}</span>
                </div>
                <div className="rounded-xl bg-white/85 px-3 py-2 border border-white flex gap-2">
                  <span className="shrink-0 font-extrabold text-indigo-700">🌙 밤</span>
                  <span className="text-slate-700">{liveToday.timeFlow.evening}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-xl bg-slate-900 text-white px-3 py-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{liveToday.luckyTime}</span>
                </div>
                <div className="rounded-xl bg-slate-900 text-white px-3 py-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>{liveToday.luckyDirection}</span>
                </div>
                <div className="rounded-xl bg-rose-100 text-rose-900 px-3 py-2 font-bold">
                  🚫 {liveToday.avoidAction}
                </div>
              </div>
            </section>
          )}

          {activeTab === "core" && (
            <section className="glass-card rounded-3xl p-5 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-base font-black text-slate-900">
                  만세력 사주 원국 & 오행 비율
                </h2>
                <div className="flex flex-wrap gap-1">
                  {report.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {report.pillars.map((p) => (
                  <div
                    key={p.label}
                    className="rounded-2xl bg-white/85 border border-white py-2.5 px-1 shadow-xs"
                  >
                    <span className="block text-[10px] font-semibold text-slate-400">
                      {p.label}
                    </span>
                    <span className="block font-serif text-lg font-extrabold text-slate-900 mt-0.5">
                      {p.hanja}
                    </span>
                    <span className="block text-[11px] font-bold text-slate-500">
                      {p.hangul}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white/60 rounded-2xl p-3.5 border border-white">
                <div className="sm:col-span-5 flex justify-center">
                  <FiveElementRadarSvg
                    elements={report.elements}
                    strokeColor={theme.goldPrimary}
                    fillColor={`${theme.goldPrimary}40`}
                    className="w-36 h-36"
                  />
                </div>
                <div className="sm:col-span-7 space-y-2">
                  {report.elements.map((el) => {
                    const elTheme = ELEMENT_THEMES[el.key];
                    return (
                      <div key={el.key} className="flex items-center gap-2">
                        <span className="w-12 text-[11px] font-bold text-slate-700 shrink-0">
                          {el.nameKo}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            style={{ width: `${Math.max(6, el.percentage)}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${elTheme.barColor}`}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] font-extrabold text-slate-800">
                          {el.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {report.elementDiagnosis}
              </p>
            </section>
          )}

          {activeTab === "card" && (
            <div>
              {paidPlan ? (
                <ShareCardStudio report={report} />
              ) : (
                renderTeaserCard(true)
              )}
            </div>
          )}
        </div>

        {/* 우측 스티키 컬럼 */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="hidden lg:block">
            {paidPlan ? (
              <ShareCardStudio report={report} />
            ) : (
              renderTeaserCard(false)
            )}
          </div>

          <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
              <h3 className="font-serif text-sm sm:text-base font-black text-slate-900">
                친구 궁합 무료 스캔 & 결과 평생 보관
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Link2 className="w-4 h-4" />
              궁합 초대 링크 복사해서 친구에게 보내기
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  showToast("카카오톡 나에게 보내기용 요약이 준비되었습니다!")
                }
                className="py-2.5 px-3 rounded-xl bg-[#FEE500] hover:brightness-95 text-[#191919] text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                카톡 나에게 저장
              </button>
              <button
                type="button"
                onClick={handleCopyPermanentUrl}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                결과 URL 복사
              </button>
            </div>

            <button
              type="button"
              onClick={onResetHome}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              홈에서 다른 7종 운세 보기
            </button>
          </section>
        </div>
      </div>

      <PaymentModal
        key={`${payModalOpen}-${modalInitialPlan}-${paidPlan ?? "free"}`}
        open={payModalOpen}
        initialPlan={modalInitialPlan}
        currentPaidPlan={paidPlan}
        defaultPhone={keeperPhone}
        onClose={() => setPayModalOpen(false)}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
