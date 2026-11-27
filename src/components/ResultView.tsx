"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
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
  TrendingUp,
} from "lucide-react";
import {
  ELEMENT_THEMES,
  GUARDIAN_BEAST_META,
  MENU_ITEMS,
  buildCompatibilityReport,
  calculateTodayFortune,
} from "@/lib/saju-engine";
import type { MenuCategory, PaymentPlan, SajuReport } from "@/lib/saju-types";
import { upsertLocalArchive } from "./ArchiveModal";
import { PaymentModal } from "./PaymentModal";
import { ShareCardStudio } from "./ShareCardStudio";
import {
  FiveElementRadarSvg,
  OrientalCardFrameSvg,
  TalismanSealSvg,
  VermilionSealSvg,
} from "./OrientalArtSvg";

interface ResultViewProps {
  initialReport: SajuReport;
  initialPaidPlan?: PaymentPlan | null;
  initialPhone?: string;
  isInvitedFriendMode?: boolean;
  onPaidPlanChange?: (plan: PaymentPlan, phone?: string) => void;
  onOpenArchive?: () => void;
  onResetHome: () => void;
}

export function ResultView({
  initialReport,
  initialPaidPlan = null,
  initialPhone = "",
  isInvitedFriendMode = false,
  onPaidPlanChange,
  onOpenArchive,
  onResetHome,
}: ResultViewProps) {
  const [report, setReport] = useState<SajuReport>(initialReport);
  const [paidPlan, setPaidPlan] = useState<PaymentPlan | null>(initialPaidPlan);
  const [keeperPhone, setKeeperPhone] = useState<string>(initialPhone);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [modalInitialPlan, setModalInitialPlan] = useState<PaymentPlan>("allinone");
  const [selectedMonth, setSelectedMonth] = useState<number>(4);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 올인원 구매자가 궁합 스캔 1회권을 즉석 사용할 수 있는 상태
  const [extraPartnerName, setExtraPartnerName] = useState("");
  const [extraPartnerBirth, setExtraPartnerBirth] = useState("1995-08-20");

  const theme = ELEMENT_THEMES[report.dominantElement];
  const guardian = GUARDIAN_BEAST_META[report.dominantElement];
  const activeMenuMeta =
    MENU_ITEMS.find((m) => m.id === report.input.menu) ?? MENU_ITEMS[0];
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

    // Supabase DB에도 결제 등급·휴대폰 보관 정보·결제 내역 비동기 반영
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
        ? "차액 1,910원 결제로 올인원 패키지 업그레이드가 완료되었습니다!"
        : plan === "allinone"
        ? "올인원 패키지 잠금이 해제되었습니다! (12개월 그래프·부적 포함)"
        : "단건 테마 리포트 잠금이 해제되었습니다!"
    );
  };

  const handleCopyInviteLink = async () => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://sajufact.kr";
    const url = `${base}/?inviter=${encodeURIComponent(
      report.input.name
    )}&inviterBirth=${encodeURIComponent(report.input.birthDate)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("궁합 초대 링크가 복사되었습니다! 친구에게 보내보세요.");
    } catch {
      showToast(`초대 링크: ${url}`);
    }
  };

  const handleCopyPermanentUrl = async () => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://sajufact.kr";
    const url = `${base}/?saved=${encodeURIComponent(report.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("내 결과 평생 보관 URL이 클립보드에 복사되었습니다.");
    } catch {
      showToast("결과가 현재 브라우저에 안전하게 보관되었습니다.");
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
    report.monthlyFlow.find((m) => m.month === selectedMonth) ?? report.monthlyFlow[3];

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 lg:pt-8 pb-20 space-y-5">
      {/* 상단 서브 네비게이션 + 빠른 점프 탭바 */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onResetHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold text-slate-700 hover:bg-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            다시 입력하기
          </button>
          <div className="flex items-center gap-2">
            {onOpenArchive && (
              <button
                type="button"
                onClick={onOpenArchive}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                내 보관함
              </button>
            )}
            <span className="hidden sm:inline text-xs font-bold text-slate-500">
              {report.input.name}님의 사주 팩트 리포트
            </span>
          </div>
        </div>

        {/* 섹션 퀵 점프 바 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "section-summary", label: "⚡ 핵심 총평" },
            { id: "section-today", label: "☀️ 오늘의 일진" },
            { id: "section-deep", label: "💣 상세 운세·횡재" },
            { id: "section-card", label: "🐅 수호신 카드" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                document
                  .getElementById(tab.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="shrink-0 rounded-full bg-white/80 hover:bg-slate-900 hover:text-white border border-slate-200/80 px-3 py-1 text-[11px] font-bold text-slate-700 transition"
            >
              {tab.label}
            </button>
          ))}
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

      {/* 반응형 2단 그리드 (모바일: 1열, PC: 7:5 2단 대시보드) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* 좌측 컬럼: 무료 맛보기 + 블러 페이월 / 상세 리포트 */}
        <div className="lg:col-span-7 space-y-5">
          {/* 친구 초대 링크 또는 연애·궁합 스캔 선택 시: 무료 궁합 점수 우선 공개 */}
          {(isInvitedFriendMode || report.input.menu === "compatibility") &&
            report.compatibility && (
              <section className="glass-card rounded-3xl p-5 border-2 border-pink-300/80 bg-gradient-to-br from-pink-50/90 to-rose-50/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[11px] font-bold">
                    {isInvitedFriendMode ? "💌 초대 궁합 무료 스캔" : "💕 연애·궁합 스캔 결과"}
                  </span>
                  <span className="text-xs font-bold text-pink-700">
                    {report.input.name} × {report.compatibility.partnerName}
                  </span>
                </div>
                <div className="flex items-end gap-3 my-2">
                  <span className="text-4xl font-black text-rose-600">
                    {report.compatibility.score}점
                  </span>
                  <span className="text-xs font-bold text-slate-700 pb-1.5">
                    {report.compatibility.gradeLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  두 분의 속마음·갈등 지뢰밭·솔루션 상세 풀이는 아래 990원 잠금 해제로 바로 확인할 수 있습니다.
                </p>
              </section>
            )}

          {/* ① 무료 맛보기 영역 (상단) */}
          <section
            id="section-summary"
            className="glass-card rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden scroll-mt-20"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-amber-200 text-[11px] font-extrabold">
                  {activeMenuMeta.emoji} {activeMenuMeta.title}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-sm ${theme.badgeBg}`}
                >
                  {report.tierBadge}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {report.percentileText}
                </span>
              </div>
              <VermilionSealSvg label="사주印" className="w-9 h-9 shrink-0" />
            </div>

            {/* 핵심 총평 타이틀 */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">
                {report.input.name}님의 사주 핵심 총평 · {report.dayMasterHangul}({report.dayMasterHanja}) 일간 · {guardian.nameKo}({guardian.hanja}) 수호
              </p>
              <h1 className="font-serif text-[21px] sm:text-2xl leading-snug font-black text-slate-900 break-keep">
                “{report.oneLineFact}”
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed">
                {report.subHook}
              </p>
            </div>

            {/* 사주 4주 8자 원국 표 */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {report.pillars.map((pillar) => {
                const stemTheme = ELEMENT_THEMES[pillar.stemElement];
                return (
                  <div
                    key={pillar.label}
                    className="rounded-2xl bg-white/80 border border-white py-2.5 px-1 text-center shadow-sm relative overflow-hidden"
                  >
                    <p className="text-[10px] font-bold text-slate-400">{pillar.label}</p>
                    <p className="font-serif text-lg sm:text-xl font-extrabold text-slate-900 tracking-wider mt-0.5">
                      {pillar.hanja}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-600">
                      {pillar.hangul}
                    </p>
                    <span
                      className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={{
                        background: stemTheme.cardBgStyle,
                        color: stemTheme.textOnCard,
                      }}
                    >
                      {stemTheme.nameKo}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 오행 비율 레이더 + 바 차트 듀얼 뷰 */}
            <div className="rounded-2xl bg-white/70 border border-white/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-slate-800">
                  내 사주 오행(木·火·土·金·水) 밸런스 & 레이더 분석
                </h2>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  핵심 오행: {theme.nameKo}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5 flex justify-center">
                  <FiveElementRadarSvg
                    elements={report.elements}
                    strokeColor={theme.goldPrimary}
                    fillColor={`${theme.goldPrimary}40`}
                    className="w-40 h-40"
                  />
                </div>

                <div className="sm:col-span-7 space-y-2">
                  {report.elements.map((el) => {
                    const elTheme = ELEMENT_THEMES[el.key];
                    return (
                      <div key={el.key} className="flex items-center gap-2.5">
                        <span className="w-11 text-[11px] font-bold text-slate-700 shrink-0">
                          {el.nameKo}({el.hanja})
                        </span>
                        <div className="flex-1 h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(6, el.percentage)}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${elTheme.barColor}`}
                          />
                        </div>
                        <span className="w-9 text-right text-[11px] font-extrabold text-slate-800">
                          {el.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60">
                {report.elementDiagnosis}
              </p>
            </div>
          </section>

          {/* ☀️ 오늘의 일진 운세 (매일 자동 리셋 무료 데일리 섹션) */}
          <section
            id="section-today"
            className="glass-card rounded-3xl p-5 space-y-4 border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white/80 to-orange-50/50 scroll-mt-20"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-extrabold text-amber-700">
                    오늘의 일진 운세 · {liveToday.dateLabel}
                  </span>
                </div>
                <h3 className="font-serif text-base font-black text-slate-900 mt-1">
                  오늘 일진 {liveToday.todayGanZhiHangul}({liveToday.todayGanZhiHanja}) ·{" "}
                  <span className="text-amber-700">{liveToday.relationBadge}</span>
                </h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500">오늘 운세 지수</span>
                <span className="text-2xl font-black text-slate-900">
                  {liveToday.score}
                  <span className="text-xs font-bold text-slate-500">점</span>
                </span>
              </div>
            </div>

            <p className="rounded-2xl bg-white/90 border border-amber-200/70 px-3.5 py-3 text-[13px] font-bold text-slate-900 leading-relaxed">
              “{liveToday.headline}”
            </p>

            {/* 4대 오늘 시그널 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className="rounded-2xl bg-white/85 border border-slate-200/70 p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-slate-500">{title}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
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
                  <p className="text-[11px] text-slate-700 leading-snug">{item.summary}</p>
                </div>
              ))}
            </div>

            {/* 시간대별 흐름 */}
            <div className="space-y-1.5 text-xs">
              <div className="rounded-xl bg-white/80 px-3 py-2 border border-white flex items-start gap-2">
                <span className="shrink-0 font-extrabold text-amber-700">🌅 오전</span>
                <span className="text-slate-700">{liveToday.timeFlow.morning}</span>
              </div>
              <div className="rounded-xl bg-white/80 px-3 py-2 border border-white flex items-start gap-2">
                <span className="shrink-0 font-extrabold text-orange-700">☀️ 오후</span>
                <span className="text-slate-700">{liveToday.timeFlow.afternoon}</span>
              </div>
              <div className="rounded-xl bg-white/80 px-3 py-2 border border-white flex items-start gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700">🌙 밤</span>
                <span className="text-slate-700">{liveToday.timeFlow.evening}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-xl bg-slate-900 text-white px-3 py-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>골든타임: {liveToday.luckyTime}</span>
              </div>
              <div className="rounded-xl bg-slate-900 text-white px-3 py-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>행운 방위: {liveToday.luckyDirection}</span>
              </div>
              <div className="rounded-xl bg-rose-100/90 text-rose-900 px-3 py-2 font-bold">
                🚫 오늘 금지: {liveToday.avoidAction}
              </div>
            </div>
          </section>

          {/* ② 블러(Blur) 잠금 페이월 또는 해제된 전체 리포트 */}
          <div id="section-deep" className="scroll-mt-20">
          {!paidPlan ? (
            <section className="relative rounded-3xl overflow-hidden">
              {/* 실제 리포트 미리보기 (은은한 블러 처리) */}
              <div className="glass-card rounded-3xl p-5 space-y-4 blur-[6px] select-none pointer-events-none opacity-75">
                <div className="rounded-2xl bg-rose-50/90 p-4 border border-rose-200">
                  <h3 className="font-bold text-sm text-rose-900">
                    {report.criticalMistake2027.dangerMonth}, 절대 피해야 할 치명적 실수
                  </h3>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    {report.criticalMistake2027.detail}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50/90 p-4 border border-emerald-200">
                  <h3 className="font-bold text-sm text-emerald-900">
                    내 사주에 숨겨진 뜻밖의 횡재수 타이밍
                  </h3>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    {report.windfallTiming.detail}
                  </p>
                </div>
                <div className="h-44 rounded-2xl bg-indigo-50/80 p-4 border border-indigo-200">
                  <h3 className="font-bold text-sm text-indigo-900">
                    12개월 월별 운세 흐름 & 오라 카드 저장
                  </h3>
                  <p className="text-xs text-slate-600 mt-2">
                    {report.coreFactReport.moneyLeakHabit}
                  </p>
                </div>
              </div>

              {/* 잠금 페이월 오버레이 카드 */}
              {(() => {
                const paywallCopyByMenu: Record<
                  MenuCategory,
                  { headline: string; bullets: string[] }
                > = {
                  today: {
                    headline: `${report.input.name}님의 오늘(${liveToday.todayGanZhiHangul}일진) 심층 행동 전략과 리스크가 잠겨 있습니다`,
                    bullets: [
                      `“오늘 ${liveToday.todayGanZhiHangul}일진 10성 기준, 피해야 할 실수 & 승부수 타이밍”`,
                      `“${report.criticalMistake2027.dangerMonth}, 절대 피해야 할 치명적 실수”`,
                      `“${report.windfallTiming.bestMonth} 횡재수 루트 & 소비 누수 진단”`,
                      "“내 수호 영물 화보(청룡·주작·황룡·백호·현무) 고화질 저장”",
                    ],
                  },
                  wealth: {
                    headline: `${report.input.name}님의 돈 버는 천직 루트와 횡재수 피크가 숨겨져 있습니다`,
                    bullets: [
                      `“${report.windfallTiming.bestMonth} 뜻밖의 횡재수 & 수익화 루트 정밀 공개”`,
                      "“통장 잔고가 매달 증발하는 결정적 소비 습관 진단”",
                      `“${report.criticalMistake2027.dangerMonth}, 돈·계약 관련 절대 주의보”`,
                      "“내 수호 영물 화보 & 천명 감정서 카드 고화질 저장”",
                    ],
                  },
                  lifetime: {
                    headline: `${report.input.name}님의 타고난 본성과 평생 피해야 할 악연 리스트가 잠겨 있습니다`,
                    bullets: [
                      `“${report.dayMasterHangul}${report.dayBranchHangul ?? ""} 일주의 숨겨진 가면과 진짜 본성”`,
                      "“돈이 줄줄 새는 고질적 소비 패턴 & 평생 조심해야 할 인간관계”",
                      `“${report.criticalMistake2027.dangerMonth} 주의보 & ${report.windfallTiming.bestMonth} 횡재수”`,
                      "“내 수호 영물 화보 & 신수 아르카나 카드 고화질 저장”",
                    ],
                  },
                  compatibility: {
                    headline: `${report.input.name} × ${report.compatibility?.partnerName || "상대방"}님의 속마음과 갈등 지뢰밭이 잠겨 있습니다`,
                    bullets: [
                      "“둘 사이의 진짜 갑을 역학 & 상대방이 속으로 뜨끔하는 포인트”",
                      "“절대 건드리면 안 되는 최악의 갈등 지뢰밭 & 해결 1줄 팁”",
                      "“연애·인간관계에서 독이 되는 상극 유형 정밀 진단”",
                      "“내 수호 영물 화보 카드 3종 고화질 저장”",
                    ],
                  },
                  health: {
                    headline: `${report.input.name}님의 취약 장기·번아웃 신호와 2027 건강 처방전이 잠겨 있습니다`,
                    bullets: [
                      "“오행 결핍으로 가장 먼저 무너지는 신체 부위 & 번아웃 패턴”",
                      "“2027 정미년 화기 과열 시기 건강 절대 주의보 & 데일리 처방”",
                      `“멘탈 방전과 겹치기 쉬운 ${report.criticalMistake2027.dangerMonth} 실수 방어 룰”`,
                      "“인스타그램 공유용 ‘나의 오라 운명 카드’ 고화질 저장”",
                    ],
                  },
                  newyear2027: {
                    headline: `${report.input.name}님의 치명적 약점과 2027 횡재수 타이밍이 숨겨져 있습니다`,
                    bullets: [
                      `“${report.criticalMistake2027.dangerMonth}, 절대 피해야 할 치명적 실수 1가지”`,
                      "“내 사주에 숨겨진 뜻밖의 횡재수 타이밍 & 돈 버는 루트”",
                      "“내 사주 오행으로 본 타고난 취약 장기 & 2027 번아웃 주의보”",
                      "“인스타그램 공유용 ‘나의 오라 운명 카드’ 고화질 저장”",
                    ],
                  },
                  tarot: {
                    headline: `${report.input.name}님의 치명적 약점과 횡재수 타이밍이 숨겨져 있습니다`,
                    bullets: [
                      `“${report.criticalMistake2027.dangerMonth}, 절대 피해야 할 치명적 실수 1가지”`,
                      "“내 사주에 숨겨진 뜻밖의 횡재수 타이밍 & 돈 버는 루트”",
                      "“내 사주 오행으로 본 타고난 취약 장기 & 2027 번아웃 주의보”",
                      "“인스타그램 공유용 ‘나의 오라 운명 카드’ 고화질 저장”",
                    ],
                  },
                };
                const pCopy =
                  paywallCopyByMenu[report.input.menu] ?? paywallCopyByMenu.newyear2027;
                return (
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-b from-white/30 via-white/75 to-white/95">
                <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-amber-200/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.16)] space-y-4">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold mb-2">
                      <Lock className="w-3 h-3" />
                      {activeMenuMeta.emoji} {activeMenuMeta.title} 상세 리포트 잠금됨
                    </span>
                    <h3 className="font-serif text-lg font-black text-slate-900 break-keep">
                      {pCopy.headline}
                    </h3>
                  </div>

                  <ul className="space-y-2 text-xs font-semibold text-slate-800 bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70">
                    {pCopy.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>🔒</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => openPayModal("allinone")}
                      className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl flex items-center justify-between transition group"
                    >
                      <div className="text-left">
                        <span className="inline-block text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full mb-0.5">
                          BEST 주력 · 12개월 그래프 + 궁합권 + 부적
                        </span>
                        <p className="text-sm font-extrabold">
                          올인원 패키지 전체 열기
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] line-through text-slate-400 block">
                          5,900원
                        </span>
                        <span className="text-base font-black text-amber-300">
                          2,900원 →
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPayModal("single")}
                      className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 flex items-center justify-between transition"
                    >
                      <span className="text-xs font-bold">
                        단건 테마 리포트 (전체 풀이 + 수호 영물 카드)
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        990원 →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
                );
              })()}
            </section>
          ) : (
            /* ③ 결제 완료 후 해제된 전체 리포트 (선택 메뉴 우선 배치) */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {(() => {
                const menu = report.input.menu;
                const focusBadge = (
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-200">
                    🎯 선택한 [{activeMenuMeta.title}] 핵심
                  </span>
                );

                const deepTodaySection = (
                  <section
                    key="deep-today"
                    className="glass-card rounded-3xl p-5 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-white space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-amber-700">
                        <Sun className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-extrabold">
                          오늘({liveToday.todayGanZhiHangul}일진 · {liveToday.relationBadge}) 심층 행동 지침
                        </span>
                      </div>
                      {menu === "today" && focusBadge}
                    </div>
                    <h3 className="font-serif text-base font-black text-slate-900">
                      오늘 {report.input.name}님의 승부수 & 절대 금기 룰
                    </h3>
                    <div className="space-y-2 text-[13px] text-slate-700 leading-relaxed">
                      <p>
                        <strong className="text-slate-900">💰 오늘 금전:</strong>{" "}
                        {liveToday.signals.wealth.summary}
                      </p>
                      <p>
                        <strong className="text-slate-900">💼 일·커리어:</strong>{" "}
                        {liveToday.signals.work.summary}
                      </p>
                      <p>
                        <strong className="text-slate-900">💘 연애·대인:</strong>{" "}
                        {liveToday.signals.love.summary}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 text-amber-100 p-3 text-xs font-bold">
                      ⏰ 골든타임 {liveToday.luckyTime} · 🧭 {liveToday.luckyDirection} · 🚫 금지: {liveToday.avoidAction}
                    </div>
                  </section>
                );

                const mistakeSection = (
                  <section
                    key="deep-mistake"
                    className="glass-card rounded-3xl p-5 border-l-4 border-l-rose-500 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-rose-700">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-extrabold">
                          {report.criticalMistake2027.dangerMonth} 절대 주의보
                        </span>
                      </div>
                      {menu === "newyear2027" && focusBadge}
                    </div>
                    <h3 className="font-serif text-base font-black text-slate-900">
                      {report.criticalMistake2027.title}
                    </h3>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      {report.criticalMistake2027.detail}
                    </p>
                    <div className="rounded-2xl bg-rose-50/90 border border-rose-200/80 p-3 text-xs font-bold text-rose-900">
                      💡 방어 룰: {report.criticalMistake2027.actionRule}
                    </div>
                  </section>
                );

                const windfallSection = (
                  <section
                    key="deep-windfall"
                    className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-500 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Coins className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-extrabold">
                          횡재수 피크: {report.windfallTiming.bestMonth}
                        </span>
                      </div>
                      {menu === "wealth" && focusBadge}
                    </div>
                    <h3 className="font-serif text-base font-black text-slate-900">
                      추천 수익화 루트: {report.windfallTiming.moneyRoute}
                    </h3>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      {report.windfallTiming.detail}
                    </p>
                  </section>
                );

                const coreFactSection = (
                  <section key="deep-core" className="glass-card rounded-3xl p-5 space-y-3.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        {report.input.name}님 정밀 사주 리포트
                      </h3>
                      {menu === "lifetime" && focusBadge}
                    </div>
                    <div className="space-y-2.5 text-[13px] text-slate-700 leading-relaxed">
                      <div className="p-3.5 rounded-2xl bg-white/70 border border-white">
                        <p className="text-xs font-extrabold text-slate-900 mb-1">
                          1. 타고난 본성 & 가면
                        </p>
                        <p>{report.coreFactReport.temperament}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/70 border border-white">
                        <p className="text-xs font-extrabold text-slate-900 mb-1">
                          2. 통장 잔고가 새는 결정적 습관
                        </p>
                        <p>{report.coreFactReport.moneyLeakHabit}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/70 border border-white">
                        <p className="text-xs font-extrabold text-slate-900 mb-1">
                          3. 평생 손절해야 할 인간관계 유형
                        </p>
                        <p>{report.coreFactReport.toxicRelationWarning}</p>
                      </div>
                    </div>
                  </section>
                );

                const healthSection = (
                  <section
                    key="deep-health"
                    className="glass-card rounded-3xl p-5 border-l-4 border-l-teal-500 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-600" />
                        타고난 오행 체질 & 2027 건강·번아웃 진단
                      </h3>
                      {menu === "health" ? (
                        focusBadge
                      ) : (
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                          건강 스캔
                        </span>
                      )}
                    </div>

                    <div className="rounded-2xl bg-teal-50/90 border border-teal-200/80 p-3.5 space-y-1">
                      <p className="text-[11px] font-extrabold text-teal-800">
                        🩺 가장 취약한 신체 부위
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        {report.healthReport.vulnerableOrgans}
                      </p>
                    </div>

                    <div className="space-y-2 text-[13px] text-slate-700 leading-relaxed">
                      <p>
                        <strong className="text-slate-900">⚡ 번아웃 패턴:</strong>{" "}
                        {report.healthReport.burnoutPattern}
                      </p>
                      <p>
                        <strong className="text-slate-900">📅 2027 건강 주의 시기:</strong>{" "}
                        {report.healthReport.cautionSeason2027}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/80 border border-teal-200/70 p-3 text-xs font-semibold text-slate-800">
                      💊 팩트 처방전: {report.healthReport.dailyPrescription}
                    </div>
                  </section>
                );

                const compatDetailSection = report.compatibility ? (
                  <section
                    key="deep-compat"
                    className="glass-card rounded-3xl p-5 border-l-4 border-l-pink-500 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        연애·궁합 정밀 스캔 ({report.input.name} × {report.compatibility.partnerName})
                      </h3>
                      {menu === "compatibility" && focusBadge}
                    </div>
                    <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700">
                          {report.compatibility.gradeLabel}
                        </span>
                        <span className="text-2xl font-black text-rose-600">
                          {report.compatibility.score}점
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900 mt-1">
                        {report.compatibility.headline}
                      </p>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      <strong>⚡ 갑을·에너지 역학:</strong> {report.compatibility.dynamicRole}
                    </p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      <strong>💣 최대 지뢰밭:</strong> {report.compatibility.conflictPoint}
                    </p>
                    <p className="text-xs font-bold text-rose-900 bg-rose-50 p-3 rounded-xl">
                      💘 해결 팁: {report.compatibility.solutionTip}
                    </p>
                  </section>
                ) : null;

                if (menu === "today") {
                  return [deepTodaySection, mistakeSection, windfallSection, coreFactSection, healthSection];
                }
                if (menu === "wealth") {
                  return [windfallSection, coreFactSection, mistakeSection, healthSection];
                }
                if (menu === "lifetime") {
                  return [coreFactSection, mistakeSection, windfallSection, healthSection];
                }
                if (menu === "health") {
                  return [healthSection, mistakeSection, coreFactSection, windfallSection];
                }
                if (menu === "compatibility") {
                  return [compatDetailSection, coreFactSection, mistakeSection, windfallSection, healthSection];
                }
                return [mistakeSection, windfallSection, coreFactSection, healthSection];
              })()}

              {/* 올인원 패키지 전용 영역 (12개월 그래프 + 궁합 스캔 + 액땜 부적) */}
              {paidPlan === "allinone" ? (
                <>
                  {/* 12개월 월별 운세 그래프 */}
                  <section className="glass-card rounded-3xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                          ALL-IN-ONE 전용
                        </span>
                        <h3 className="font-serif text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          2027년 12개월 월별 운세 그래프
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        월을 눌러 상세 보기
                      </span>
                    </div>

                    {/* 바 차트 */}
                    <div className="grid grid-cols-12 gap-1.5 items-end h-32 pt-4 pb-1 px-1 bg-white/60 rounded-2xl border border-white">
                      {report.monthlyFlow.map((m) => {
                        const isSelected = m.month === selectedMonth;
                        const barColor =
                          m.score >= 85
                            ? "bg-emerald-500"
                            : m.score <= 50
                            ? "bg-rose-500"
                            : "bg-slate-800";
                        return (
                          <button
                            key={m.month}
                            type="button"
                            onClick={() => setSelectedMonth(m.month)}
                            className="flex flex-col items-center justify-end h-full group"
                          >
                            <span className="text-[9px] font-bold text-slate-600 mb-1">
                              {m.score}
                            </span>
                            <div
                              style={{ height: `${Math.max(18, m.score * 0.72)}%` }}
                              className={`w-full rounded-t-md transition-all ${barColor} ${
                                isSelected
                                  ? "ring-2 ring-amber-400 scale-x-110"
                                  : "opacity-75 group-hover:opacity-100"
                              }`}
                            />
                            <span
                              className={`text-[10px] mt-1 font-bold ${
                                isSelected ? "text-slate-950" : "text-slate-500"
                              }`}
                            >
                              {m.month}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-300">
                          2027년 {activeMonthObj.label} · {activeMonthObj.tag}
                        </span>
                        <span className="font-bold">운세 지수 {activeMonthObj.score}점</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {activeMonthObj.note}
                      </p>
                    </div>
                  </section>

                  {/* 연애·궁합 스캔 1회권 섹션 (상단에 이미 표시된 궁합 메뉴는 중복 숨김) */}
                  {(report.input.menu !== "compatibility" || !report.compatibility) && (
                  <section className="glass-card rounded-3xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        연애·궁합 정밀 스캔
                      </h3>
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                        올인원 1회권 포함
                      </span>
                    </div>

                    {report.compatibility ? (
                      <div className="space-y-3">
                        <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-700">
                              {report.input.name} × {report.compatibility.partnerName}
                            </span>
                            <span className="text-2xl font-black text-rose-600">
                              {report.compatibility.score}점
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 mt-1">
                            {report.compatibility.headline}
                          </p>
                        </div>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          <strong>⚡ 갑을·에너지 역학:</strong> {report.compatibility.dynamicRole}
                        </p>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          <strong>💣 최대 지뢰밭:</strong> {report.compatibility.conflictPoint}
                        </p>
                        <p className="text-xs font-bold text-rose-900 bg-rose-50 p-3 rounded-xl">
                          💘 해결 팁: {report.compatibility.solutionTip}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <p className="text-xs text-slate-600">
                          올인원 패키지에 포함된 <strong>연애/궁합 스캔 1회권</strong>으로 썸남·연인·상사와의 케미를 바로 확인하세요.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="상대방 이름"
                            value={extraPartnerName}
                            onChange={(e) => setExtraPartnerName(e.target.value)}
                            className="px-3 py-2.5 rounded-xl bg-white/85 border border-slate-200 text-xs font-semibold"
                          />
                          <input
                            type="date"
                            value={extraPartnerBirth}
                            onChange={(e) => setExtraPartnerBirth(e.target.value)}
                            className="px-3 py-2.5 rounded-xl bg-white/85 border border-slate-200 text-xs font-semibold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRunFreeCompatTicket}
                          className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition"
                        >
                          1회권 사용하여 궁합 스캔하기
                        </button>
                      </div>
                    )}
                  </section>
                  )}

                  {/* 맞춤형 액땜 행운 부적 */}
                  <section className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-[#1f1c38] to-slate-900 text-white shadow-xl border border-amber-300/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                          CUSTOM TALISMAN
                        </span>
                        <h3 className="font-serif text-lg font-extrabold text-amber-100 mt-0.5">
                          {report.talisman.talismanTitle}
                        </h3>
                      </div>
                      <TalismanSealSvg
                        hanja={ELEMENT_THEMES[report.talisman.missingElement].hanja}
                        className="w-16 h-16 shrink-0"
                      />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      부족한 <strong className="text-amber-300">{report.talisman.missingElementKo}</strong> 기운을 채워{" "}
                      {report.talisman.talismanMantra}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="rounded-xl bg-white/10 p-2.5">
                        <span className="text-amber-200/80 block">행운 컬러</span>
                        <strong className="text-white">{report.talisman.luckyColor}</strong>
                      </div>
                      <div className="rounded-xl bg-white/10 p-2.5">
                        <span className="text-amber-200/80 block">개운 방향 · 숫자</span>
                        <strong className="text-white">
                          {report.talisman.luckyDirection} · {report.talisman.luckyNumber}
                        </strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-200/90">
                      ✨ 추천 아이템: {report.talisman.luckyItem}
                    </p>
                  </section>
                </>
              ) : (
                /* 단건 결제자용 업그레이드 안내 (차액 1,910원) */
                <div className="rounded-3xl p-4 bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 mb-1">
                      990원 기결제 적용 · 차액 결제
                    </span>
                    <p className="text-xs font-extrabold text-amber-950">
                      12개월 월별 그래프 + 궁합 스캔 + 액땜 부적도 궁금하다면?
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      기존 990원을 뺀 <strong className="text-rose-700">차액 1,910원만</strong> 결제하고 올인원 열기
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openPayModal("allinone")}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 text-xs font-extrabold shrink-0 transition"
                  >
                    1,910원 업그레이드
                  </button>
                </div>
              )}
            </motion.div>
          )}
          </div>
        </div>

        {/* 우측 컬럼 (PC 스티키 사이드바 / 모바일 하단): 오라 카드 스튜디오 + 바이럴 훅 */}
        <div id="section-card" className="lg:col-span-5 lg:sticky lg:top-24 space-y-5 scroll-mt-20">
          {paidPlan ? (
            <ShareCardStudio report={report} />
          ) : (
            /* PC 화면에서 결제 전에도 우측 균형을 잡아주는 수호 영물 화보 블러 티저 */
            <section className="hidden lg:block glass-card rounded-3xl p-5 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                  <Camera className="w-3 h-3" />
                  나의 수호 영물 카드 미리보기
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {guardian.nameKo}({guardian.hanja}) · {theme.auraLabel}
                </span>
              </div>

              <div className="w-full h-[380px] rounded-2xl bg-slate-950 text-white relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                <img
                  src={guardian.image}
                  alt={guardian.nameKo}
                  className="absolute inset-0 w-full h-full object-cover blur-[5px] scale-105 opacity-80 pointer-events-none select-none"
                />
                <OrientalCardFrameSvg color={theme.goldPrimary} />

                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] flex flex-col items-center justify-center p-5 text-white">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/50 text-amber-200 text-[10px] font-extrabold mb-2">
                    내 수호신 · {guardian.nameKo}({guardian.hanja})
                  </span>
                  <Lock className="w-6 h-6 text-amber-300 mb-2" />
                  <p className="font-serif text-base font-extrabold">
                    수호 영물 결과 카드 3종 잠금됨
                  </p>
                  <p className="text-xs text-white/85 mt-1 mb-3">
                    🐅 수호 영물 화보 · 🌙 신수 아르카나 · 📜 천명 감정서
                  </p>
                  <button
                    type="button"
                    onClick={() => openPayModal("allinone")}
                    className="px-4 py-2 rounded-xl bg-amber-300 text-slate-950 text-xs font-extrabold hover:bg-amber-200 transition shadow-lg"
                  >
                    잠금 해제하고 PNG 저장하기
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ④ 하단 바이럴 & 리텐션 훅 (궁합 초대 + 평생 보관) */}
          <section className="glass-card rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <h3 className="font-serif text-base font-black text-slate-900">
                친구랑 궁합 점수 무료로 스캔하기
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              “나랑 찰떡궁합인 친구는 누구?” 링크를 보내 친구가 생년월일을 입력하면 두 사람의{" "}
              <strong className="text-slate-900">궁합 점수</strong>를 무료로 바로 확인할 수 있습니다.
            </p>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Link2 className="w-4 h-4" />
              궁합 초대 링크 복사해서 친구에게 보내기
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  showToast("카카오톡 나에게 보내기용 결과 요약 카드가 준비되었습니다!")
                }
                className="py-2.5 px-3 rounded-xl bg-[#FEE500] hover:brightness-95 text-[#191919] text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                카톡 나에게 보내기
              </button>
              <button
                type="button"
                onClick={handleCopyPermanentUrl}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                결과 URL 평생 보관
              </button>
            </div>

            <button
              type="button"
              onClick={onResetHome}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              다른 테마 / 다른 사람 사주 보러 가기
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
