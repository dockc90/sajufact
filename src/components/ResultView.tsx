"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  Coins,
  Copy,
  Heart,
  Link2,
  Lock,
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  ELEMENT_THEMES,
  buildCompatibilityReport,
} from "@/lib/saju-engine";
import type { PaymentPlan, SajuReport } from "@/lib/saju-types";
import { PaymentModal } from "./PaymentModal";
import { ShareCardStudio } from "./ShareCardStudio";
import { OrientalElementArt, TalismanSealSvg } from "./OrientalArtSvg";

interface ResultViewProps {
  initialReport: SajuReport;
  isInvitedFriendMode?: boolean;
  onResetHome: () => void;
}

export function ResultView({
  initialReport,
  isInvitedFriendMode = false,
  onResetHome,
}: ResultViewProps) {
  const [report, setReport] = useState<SajuReport>(initialReport);
  const [paidPlan, setPaidPlan] = useState<PaymentPlan | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [modalInitialPlan, setModalInitialPlan] = useState<PaymentPlan>("allinone");
  const [selectedMonth, setSelectedMonth] = useState<number>(4);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 올인원 구매자가 궁합 스캔 1회권을 즉석 사용할 수 있는 상태
  const [extraPartnerName, setExtraPartnerName] = useState("");
  const [extraPartnerBirth, setExtraPartnerBirth] = useState("1995-08-20");

  const theme = ELEMENT_THEMES[report.dominantElement];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const openPayModal = (plan: PaymentPlan) => {
    setModalInitialPlan(plan);
    setPayModalOpen(true);
  };

  const handlePaymentComplete = (plan: PaymentPlan, phone?: string) => {
    setPaidPlan(plan);
    setPayModalOpen(false);
    try {
      localStorage.setItem(
        `sajufact_report_${report.id}`,
        JSON.stringify({ report, plan, phone })
      );
    } catch {
      // ignore storage quota
    }
    showToast(
      plan === "allinone"
        ? "올인원 패키지 잠금이 해제되었습니다! (12개월 그래프·부적 포함)"
        : "단건 팩폭팩 잠금이 해제되었습니다!"
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
      {/* 상단 서브 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onResetHome}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold text-slate-700 hover:bg-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          다시 입력하기
        </button>
        <span className="text-xs font-bold text-slate-500">
          {report.input.name}님의 사주 팩트 리포트
        </span>
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
          {/* 친구 초대 링크를 타고 들어온 경우: 무료 궁합 점수 우선 공개 */}
          {isInvitedFriendMode && report.compatibility && (
            <section className="glass-card rounded-3xl p-5 border-2 border-pink-300/80 bg-gradient-to-br from-pink-50/90 to-rose-50/80">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[11px] font-bold">
                  💌 초대 궁합 무료 스캔
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
          <section className="glass-card rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-sm ${theme.badgeBg}`}
              >
                {report.tierBadge}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {report.percentileText}
              </span>
            </div>

            {/* 한 줄 팩폭 타이틀 */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">
                {report.input.name}님의 사주 팩트폭격 요약
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
              {report.pillars.map((pillar) => (
                <div
                  key={pillar.label}
                  className="rounded-2xl bg-white/75 border border-white py-2.5 px-1 text-center shadow-sm"
                >
                  <p className="text-[10px] font-bold text-slate-400">{pillar.label}</p>
                  <p className="font-serif text-lg sm:text-xl font-extrabold text-slate-900 tracking-wider mt-0.5">
                    {pillar.hanja}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600">
                    {pillar.hangul}
                  </p>
                </div>
              ))}
            </div>

            {/* 오행 비율 미니 차트 */}
            <div className="rounded-2xl bg-white/65 border border-white/80 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-slate-800">
                  내 사주 오행(木·火·土·金·水) 비율
                </h2>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  핵심 오행: {theme.nameKo}
                </span>
              </div>

              <div className="space-y-2">
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

              <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                {report.elementDiagnosis}
              </p>
            </div>
          </section>

          {/* ② 블러(Blur) 잠금 페이월 또는 해제된 전체 리포트 */}
          {!paidPlan ? (
            <section className="relative rounded-3xl overflow-hidden">
              {/* 실제 리포트 미리보기 (은은한 블러 처리) */}
              <div className="glass-card rounded-3xl p-5 space-y-4 blur-[6px] select-none pointer-events-none opacity-75">
                <div className="rounded-2xl bg-rose-50/90 p-4 border border-rose-200">
                  <h3 className="font-bold text-sm text-rose-900">
                    2027년 4월, 절대 피해야 할 치명적 실수 1가지
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
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-b from-white/30 via-white/75 to-white/95">
                <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-amber-200/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.16)] space-y-4">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold mb-2">
                      <Lock className="w-3 h-3" />
                      상세 팩트 리포트 잠금됨
                    </span>
                    <h3 className="font-serif text-lg font-black text-slate-900">
                      {report.input.name}님의 치명적 약점과
                      <br />
                      횡재수 타이밍이 숨겨져 있습니다
                    </h3>
                  </div>

                  <ul className="space-y-2 text-xs font-semibold text-slate-800 bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70">
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>“2027년 4월, 절대 피해야 할 치명적 실수 1가지”</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>“내 사주에 숨겨진 뜻밖의 횡재수 타이밍 & 돈 버는 루트”</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>“내 사주 오행으로 본 타고난 취약 장기 & 2027 번아웃 주의보”</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>“인스타그램 공유용 ‘나의 오라 운명 카드’ 고화질 저장”</span>
                    </li>
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
                        단건 팩폭팩 (테마 리포트 + 인스타 카드)
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        990원 →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* ③ 결제 완료 후 해제된 전체 리포트 */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* 치명적 실수 경고 */}
              <section className="glass-card rounded-3xl p-5 border-l-4 border-l-rose-500 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-extrabold">
                    {report.criticalMistake2027.dangerMonth} 절대 주의보
                  </span>
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

              {/* 횡재수 타이밍 & 돈 버는 루트 */}
              <section className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-500 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Coins className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-extrabold">
                    횡재수 피크: {report.windfallTiming.bestMonth}
                  </span>
                </div>
                <h3 className="font-serif text-base font-black text-slate-900">
                  추천 수익화 루트: {report.windfallTiming.moneyRoute}
                </h3>
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  {report.windfallTiming.detail}
                </p>
              </section>

              {/* 평생 기질 · 돈 새는 습관 · 독이 되는 인연 */}
              <section className="glass-card rounded-3xl p-5 space-y-3.5">
                <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  {report.input.name}님 정밀 팩폭 리포트
                </h3>
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

              {/* 건강 · 체질 · 번아웃 팩폭 */}
              <section className="glass-card rounded-3xl p-5 border-l-4 border-l-teal-500 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-serif text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    타고난 오행 체질 & 2027 건강·번아웃 팩폭
                  </h3>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                    건강 스캔
                  </span>
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

                  {/* 연애·궁합 스캔 1회권 섹션 */}
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
                /* 단건 결제자용 업그레이드 안내 */
                <div className="rounded-3xl p-4 bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold text-amber-950">
                      12개월 월별 그래프 + 궁합 스캔 + 액땜 부적도 궁금하다면?
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      올인원 패키지로 전체 기능을 열어보세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openPayModal("allinone")}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shrink-0"
                  >
                    업그레이드
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* 우측 컬럼 (PC 스티키 사이드바 / 모바일 하단): 오라 카드 스튜디오 + 바이럴 훅 */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          {paidPlan ? (
            <ShareCardStudio report={report} />
          ) : (
            /* PC 화면에서 결제 전에도 우측 균형을 잡아주는 오라 카드 블러 티저 */
            <section className="hidden lg:block glass-card rounded-3xl p-5 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                  <Camera className="w-3 h-3" />
                  인스타그램 공유 카드 미리보기
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {theme.auraLabel}
                </span>
              </div>

              <div
                style={{
                  background: theme.cardBgStyle,
                  color: theme.textOnCard,
                }}
                className="w-full h-[320px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="blur-[5px] opacity-80 flex flex-col items-center pointer-events-none select-none">
                  <OrientalElementArt
                    element={report.dominantElement}
                    goldPrimary={theme.goldPrimary}
                    goldSecondary={theme.goldSecondary}
                    className="w-32 h-32"
                    idPrefix="teaser"
                  />
                  <p className="font-serif text-base font-black mt-2">
                    “{report.oneLineFact}”
                  </p>
                </div>

                <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] flex flex-col items-center justify-center p-5 text-white">
                  <Lock className="w-6 h-6 text-amber-300 mb-2" />
                  <p className="font-serif text-base font-extrabold">
                    내 {theme.nameKo} 오라 운명 카드
                  </p>
                  <p className="text-xs text-white/85 mt-1 mb-3">
                    9:16 스토리 · 4:5 피드용 고화질 PNG 저장
                  </p>
                  <button
                    type="button"
                    onClick={() => openPayModal("allinone")}
                    className="px-4 py-2 rounded-xl bg-amber-300 text-slate-950 text-xs font-extrabold hover:bg-amber-200 transition shadow-lg"
                  >
                    잠금 해제하고 카드 저장하기
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
        open={payModalOpen}
        initialPlan={modalInitialPlan}
        onClose={() => setPayModalOpen(false)}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
