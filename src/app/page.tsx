"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Flame,
  FolderOpen,
  HeartHandshake,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  BIRTH_HOUR_OPTIONS,
  ELEMENT_THEMES,
  GUARDIAN_BEAST_META,
  MENU_ITEMS,
  WORRY_OPTIONS,
  generateSajuReport,
} from "@/lib/saju-engine";
import type {
  CalendarType,
  ElementKey,
  GenderType,
  MenuCategory,
  PaymentPlan,
  SajuInput,
  SajuReport,
  WorryTopic,
} from "@/lib/saju-types";
import { AuraBackground } from "@/components/AuraBackground";
import { AnalyzingView } from "@/components/AnalyzingView";
import {
  ArchiveModal,
  loadLocalArchive,
  upsertLocalArchive,
} from "@/components/ArchiveModal";
import { ResultView } from "@/components/ResultView";
import { TarotModal } from "@/components/TarotModal";
import { VermilionSealSvg } from "@/components/OrientalArtSvg";
import type { CardEdition } from "@/components/ShareCardStudio";

type ScreenPhase = "home" | "analyzing" | "result";

const RECENT_PROFILES_KEY = "sajufact_recent_profiles_v1";

const MENU_SUB_FOCUS: Record<
  MenuCategory,
  {
    sectionTitle: string;
    lockedMessage?: string;
    options: Array<{ value: WorryTopic; label: string; emoji: string }>;
  }
> = {
  newyear2027: {
    sectionTitle: "🔥 2027 정미년에서 가장 궁금한 핵심 분야 (1개)",
    options: [
      { value: "wealth", label: "2027 재물·횡재", emoji: "💸" },
      { value: "love", label: "2027 연애·결혼", emoji: "💘" },
      { value: "career", label: "2027 이직·승진", emoji: "🚀" },
      { value: "relationship", label: "2027 귀인·구설", emoji: "🗡️" },
      { value: "health", label: "2027 건강·액땜", emoji: "🏥" },
    ],
  },
  today: {
    sectionTitle: "☀️ 오늘의 일진에서 먼저 보고 싶은 포인트 (1개)",
    options: [
      { value: "wealth", label: "오늘 금전·결제운", emoji: "💸" },
      { value: "love", label: "오늘 연애·연락운", emoji: "💘" },
      { value: "career", label: "오늘 업무·미팅운", emoji: "💼" },
      { value: "relationship", label: "오늘 대인·말조심", emoji: "🗡️" },
      { value: "health", label: "오늘 컨디션·체력", emoji: "🔋" },
    ],
  },
  lifetime: {
    sectionTitle: "⚡ 평생 사주 원국에서 깊게 파고들 영역 (1개)",
    options: [
      { value: "relationship", label: "타고난 기질·악연", emoji: "⚡" },
      { value: "wealth", label: "평생 재물그릇·소비", emoji: "💰" },
      { value: "career", label: "천직·커리어 팔자", emoji: "🚀" },
      { value: "love", label: "평생 연애·배우자복", emoji: "💘" },
      { value: "health", label: "타고난 오행 체질", emoji: "🏥" },
    ],
  },
  wealth: {
    sectionTitle: "💰 재물·직업·이직운 세부 포커스 선택",
    options: [
      { value: "wealth", label: "돈 버는 루트 & 횡재수", emoji: "💸" },
      { value: "career", label: "이직 타이밍 & 연봉 점프", emoji: "🚀" },
    ],
  },
  compatibility: {
    sectionTitle: "💕 어떤 관계의 궁합을 스캔할까요?",
    options: [
      { value: "love", label: "썸·연인·배우자 애정 궁합", emoji: "💘" },
      { value: "relationship", label: "직장상사·동료·비즈니스 궁합", emoji: "🗡️" },
    ],
  },
  health: {
    sectionTitle: "💪 건강·체력·번아웃 정밀 스캔 항목",
    lockedMessage: "🏥 오행 취약 장기 · 멘탈 번아웃 신호 · 2027 주의 계절 · 데일리 처방전 일괄 스캔",
    options: [{ value: "health", label: "건강·번아웃 전체 스캔", emoji: "🏥" }],
  },
  tarot: {
    sectionTitle: "지금 가장 집중해서 볼 고민 (1개)",
    options: WORRY_OPTIONS,
  },
};

const NAV_LABELS: Record<MenuCategory, string> = {
  newyear2027: "2027 신년운세",
  today: "오늘의 운세",
  lifetime: "평생 사주 풀이",
  wealth: "재물·이직운",
  compatibility: "연애·궁합 스캔",
  health: "건강·번아웃",
  tarot: "오늘의 무료 타로",
};

export default function HomePage() {
  const [phase, setPhase] = useState<ScreenPhase>("home");
  const [selectedMenu, setSelectedMenu] = useState<MenuCategory>("newyear2027");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<GenderType>("female");
  const [birthDate, setBirthDate] = useState("1996-05-14");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthHour, setBirthHour] = useState<string>("10");
  const [worry, setWorry] = useState<WorryTopic>("wealth");

  // 연애·궁합 스캔 및 초대 링크용 상대방 정보
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("1995-08-20");
  const [inviterBanner, setInviterBanner] = useState<{
    name: string;
    birth: string;
  } | null>(null);

  const [report, setReport] = useState<SajuReport | null>(null);
  const [paidPlan, setPaidPlan] = useState<PaymentPlan | null>(null);
  const [keeperPhone, setKeeperPhone] = useState<string>("");
  const [tarotOpen, setTarotOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isRestoringUrl, setIsRestoringUrl] = useState(false);
  const [recentProfiles, setRecentProfiles] = useState<SajuInput[]>([]);
  const [birthQuickInput, setBirthQuickInput] = useState("19960514");
  const [formError, setFormError] = useState<string | null>(null);
  const [showcaseEdition, setShowcaseEdition] = useState<CardEdition>("aura");
  const [showcaseElement, setShowcaseElement] = useState<ElementKey>("metal");

  const applyBirthDate = (isoDate: string) => {
    setBirthDate(isoDate);
    setBirthQuickInput(isoDate.replace(/-/g, ""));
  };

  // URL 쿼리 파라미터(궁합 초대 링크 / 저장된 리포트 복원) 및 최근 프로필 불러오기
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || typeof window === "undefined") return;

      try {
        const rawProfiles = localStorage.getItem(RECENT_PROFILES_KEY);
        if (rawProfiles) {
          const parsedProfiles = JSON.parse(rawProfiles) as SajuInput[];
          if (Array.isArray(parsedProfiles)) {
            setRecentProfiles(parsedProfiles.slice(0, 4));
          }
        }
      } catch {
        // ignore invalid recent profiles
      }

      const params = new URLSearchParams(window.location.search);
      const inviter = params.get("inviter");
      const inviterBirth = params.get("inviterBirth");
      const savedId = params.get("saved");

      if (inviter && inviterBirth) {
        setInviterBanner({ name: inviter, birth: inviterBirth });
        setPartnerName(inviter);
        setPartnerBirthDate(inviterBirth);
        setSelectedMenu("compatibility");
        setWorry("love");
      } else if (savedId) {
        setIsRestoringUrl(true);

        // 1차: 로컬 보관함/스토리지에서 즉시 복원 시도
        const localHit = loadLocalArchive().find((x) => x.report.id === savedId);
        if (localHit) {
          setReport(localHit.report);
          setPaidPlan(localHit.paidPlan);
          setKeeperPhone(localHit.keeperPhone ?? "");
          setPhase("result");
        } else {
          try {
            const raw = localStorage.getItem(`sajufact_report_${savedId}`);
            if (raw) {
              const parsed = JSON.parse(raw) as {
                report: SajuReport;
                plan?: PaymentPlan | null;
                phone?: string;
              };
              if (parsed?.report) {
                setReport(parsed.report);
                setPaidPlan(parsed.plan ?? null);
                setKeeperPhone(parsed.phone ?? "");
                setPhase("result");
              }
            }
          } catch {
            // ignore invalid storage
          }
        }

        // 2차: 다른 기기/카카오톡 인앱에서도 열리도록 Supabase API에서 영구 결과 동기화
        fetch(`/api/reports?id=${encodeURIComponent(savedId)}`)
          .then(async (res) => {
            if (!res.ok) return null;
            return (await res.json()) as {
              ok: boolean;
              report?: SajuReport;
              paidPlan?: PaymentPlan | null;
              keeperPhone?: string;
            };
          })
          .then((data) => {
            if (!active || !data?.ok || !data.report) return;
            setReport(data.report);
            setPaidPlan((prev) => data.paidPlan ?? prev ?? null);
            if (data.keeperPhone) setKeeperPhone(data.keeperPhone);
            upsertLocalArchive(
              data.report,
              data.paidPlan ?? localHit?.paidPlan ?? null,
              data.keeperPhone ?? localHit?.keeperPhone
            );
            setPhase("result");
          })
          .catch(() => {})
          .finally(() => {
            if (active) setIsRestoringUrl(false);
          });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleMenuClick = (id: MenuCategory) => {
    if (id === "tarot") {
      setTarotOpen(true);
      return;
    }
    setSelectedMenu(id);
    if (phase !== "home") {
      setPhase("home");
    }
    if (id === "compatibility") {
      setWorry("love");
    } else if (id === "wealth" || id === "newyear2027" || id === "today") {
      setWorry("wealth");
    } else if (id === "lifetime") {
      setWorry("relationship");
    } else if (id === "health") {
      setWorry("health");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("이름 또는 닉네임을 입력해 주세요.");
      return;
    }
    if (!birthDate) {
      setFormError("생년월일을 선택해 주세요.");
      return;
    }
    setFormError(null);

    const payload: SajuInput = {
      name: name.trim(),
      gender,
      birthDate,
      calendarType,
      birthHour,
      worry,
      menu: selectedMenu,
      partnerName:
        selectedMenu === "compatibility"
          ? partnerName.trim() || inviterBanner?.name || "그 사람"
          : undefined,
      partnerBirthDate:
        selectedMenu === "compatibility"
          ? partnerBirthDate || inviterBanner?.birth
          : undefined,
    };

    setPhase("analyzing");

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 3000));
    const apiPromise = fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("API error");
        const data = (await res.json()) as { report: SajuReport };
        return data.report;
      })
      .catch(() => generateSajuReport(payload));

    const [, computedReport] = await Promise.all([minDelayPromise, apiPromise]);

    // 최근 입력 프로필 저장 (1초 재입력용)
    const nextProfiles = [
      payload,
      ...recentProfiles.filter(
        (p) => !(p.name === payload.name && p.birthDate === payload.birthDate)
      ),
    ].slice(0, 4);
    setRecentProfiles(nextProfiles);
    try {
      localStorage.setItem(RECENT_PROFILES_KEY, JSON.stringify(nextProfiles));
    } catch {
      // ignore storage quota
    }

    // 기존 결제 상태 확인 + 로컬 자동 보관 + 영구 URL(?saved=...) 반영
    const existingLocal = loadLocalArchive().find(
      (x) => x.report.id === computedReport.id
    );
    const restoredPlan = existingLocal?.paidPlan ?? null;
    const restoredPhone = existingLocal?.keeperPhone ?? "";
    upsertLocalArchive(computedReport, restoredPlan, restoredPhone || undefined);
    try {
      window.history.replaceState(
        null,
        "",
        `/?saved=${encodeURIComponent(computedReport.id)}`
      );
    } catch {
      // ignore history error
    }

    setReport(computedReport);
    setPaidPlan(restoredPlan);
    setKeeperPhone(restoredPhone);
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AuraBackground
        element={phase === "result" && report ? report.dominantElement : "default"}
      />

      {/* PC + 모바일 공용 웹사이트 GNB 헤더 */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/60 border-b border-white/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setPhase("home");
              try {
                window.history.replaceState(null, "", "/");
              } catch {}
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 text-left shrink-0"
          >
            <span className="font-serif text-lg sm:text-xl font-black tracking-tight text-slate-900">
              사주팩트{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-rose-600 to-indigo-700">
                SajuFact
              </span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-serif font-bold tracking-widest text-slate-500 border border-slate-300/80 rounded-full px-2 py-0.5">
              sajufact.kr
            </span>
          </button>

          {/* PC 전용 퀵 메뉴 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {MENU_ITEMS.map((item) => {
              const active = phase === "home" && selectedMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuClick(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    item.id === "tarot"
                      ? "text-indigo-700 hover:bg-indigo-50"
                      : active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  {NAV_LABELS[item.id]}
                </button>
              );
            })}
          </nav>

          {/* 우측 보관함 버튼 & 실시간 카운터 & 모바일 타로 바로가기 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 hover:bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold shadow-sm transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>내 보관함</span>
            </button>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-slate-700">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              오늘 14,820명 스캔 중
            </span>
            <button
              type="button"
              onClick={() => setTarotOpen(true)}
              className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold shadow-sm"
            >
              🃏 타로
            </button>
          </div>
        </div>
      </header>

      {isRestoringUrl && phase === "home" && (
        <div className="max-w-md mx-auto mt-16 px-4">
          <div className="glass-card rounded-3xl p-8 text-center space-y-3">
            <Sparkles className="w-7 h-7 text-amber-500 mx-auto animate-spin" />
            <p className="font-serif text-base font-black text-slate-900">
              저장된 사주 리포트를 불러오는 중...
            </p>
            <p className="text-xs text-slate-500">
              영구 보관 URL에서 회원님의 결과와 오늘의 일진을 복원하고 있습니다.
            </p>
          </div>
        </div>
      )}

      {phase === "analyzing" && <AnalyzingView userName={name.trim() || "당신"} />}

      {phase === "result" && report && (
        <ResultView
          key={`${report.id}-${paidPlan ?? "free"}`}
          initialReport={report}
          initialPaidPlan={paidPlan}
          initialPhone={keeperPhone}
          isInvitedFriendMode={Boolean(inviterBanner)}
          onPaidPlanChange={(plan, phone) => {
            setPaidPlan(plan);
            if (phone) setKeeperPhone(phone);
          }}
          onOpenArchive={() => setArchiveOpen(true)}
          onResetHome={() => {
            setPhase("home");
            try {
              window.history.replaceState(null, "", "/");
            } catch {}
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {phase === "home" && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* 좌측 영역 (모바일: 상단 / PC: 히어로 + 5대 메뉴 + 오라 미리보기) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 히어로 섹션 */}
              <div className="text-center lg:text-left space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-slate-700 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  모바일·PC 웹 즉시 실행 · 로그인 없이 10초 스캔
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight break-keep">
                  빈말 대신 정확히 짚어주는{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-rose-600 to-indigo-700">
                    AI 명리 사주·수호 영물 스캔
                  </span>
                </h1>

                <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed break-keep">
                  만세력 사주 원국 정밀 분석부터 나를 지켜주는{" "}
                  <strong className="text-slate-900">오행 수호 영물 화보 카드</strong>까지 한 번에 확인하세요.
                </p>
              </div>

              {/* 궁합 초대 배너 (초대 링크 유입 시) */}
              {inviterBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-pink-500/90 to-rose-500/90 text-white p-4 shadow-lg"
                >
                  <div className="flex items-center gap-2 text-xs font-extrabold mb-1">
                    <HeartHandshake className="w-4 h-4" />
                    {inviterBanner.name}님이 궁합 스캔을 요청했어요!
                  </div>
                  <p className="text-[11px] text-white/90">
                    생년월일만 입력하면 두 분의 궁합 점수를{" "}
                    <strong>무료</strong>로 즉시 확인할 수 있습니다.
                  </p>
                </motion.div>
              )}

              {/* 수호 영물 화보 시그니처 카드 쇼케이스 */}
              {(() => {
                const scTheme = ELEMENT_THEMES[showcaseElement];
                const scGuardian = GUARDIAN_BEAST_META[showcaseElement];
                const scIsBaby = showcaseEdition === "baby";
                return (
              <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3 border border-amber-200/70">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold tracking-widest text-rose-600 uppercase">
                      SACRED GUARDIAN CARD
                    </span>
                    <h2 className="font-serif text-sm sm:text-base font-black text-slate-900">
                      영험한 신수 · 아기 신수 결과 카드 미리보기
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900/10 p-1 rounded-xl">
                    {[
                      { id: "aura" as const, label: "🐅 영험한 신수" },
                      { id: "baby" as const, label: "🐾 아기 신수" },
                      { id: "receipt" as const, label: "📜 천명 감정서" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setShowcaseEdition(tab.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition whitespace-nowrap ${
                          showcaseEdition === tab.id
                            ? "bg-slate-900 text-amber-200 shadow-sm"
                            : "text-slate-700 hover:bg-white/60"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5대 수호 영물 선택 미리보기 칩 */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {(
                    [
                      { key: "metal" as const, emoji: "🐅", name: "백호", baby: "아기 백호" },
                      { key: "wood" as const, emoji: "🐉", name: "청룡", baby: "아기 청룡" },
                      { key: "fire" as const, emoji: "🦅", name: "주작", baby: "아기 주작" },
                      { key: "earth" as const, emoji: "🦌", name: "황룡", baby: "아기 황룡" },
                      { key: "water" as const, emoji: "🐺", name: "현무", baby: "아기 현무" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setShowcaseElement(item.key)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold border transition whitespace-nowrap ${
                        showcaseElement === item.key
                          ? "bg-slate-900 text-amber-200 border-slate-900 shadow-sm"
                          : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      {item.emoji} {scIsBaby ? item.baby : item.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* 좌측 수호 영물 카드 프리뷰 (이미지/텍스트 완벽 분리) */}
                  <div className="sm:col-span-6 flex justify-center">
                    {(showcaseEdition === "aura" || showcaseEdition === "baby") && (
                      <div
                        className={`w-full max-w-[250px] h-[340px] rounded-2xl overflow-hidden shadow-2xl border border-amber-300/45 flex flex-col ${
                          scIsBaby ? "bg-[#fff9f3] text-slate-900" : "bg-[#0d0c18] text-white"
                        }`}
                      >
                        <div className="relative flex-1 min-h-0 overflow-hidden">
                          <img
                            src={scIsBaby ? scGuardian.babyImage : scGuardian.image}
                            alt={scIsBaby ? scGuardian.babyNameKo : scGuardian.nameKo}
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute inset-x-0 top-0 px-2.5 pt-2 flex items-center justify-between gap-1">
                            <span className="rounded-full bg-slate-950/65 backdrop-blur-sm border border-amber-200/35 px-2 py-0.5 text-[9px] font-extrabold text-amber-200 whitespace-nowrap">
                              {scIsBaby ? scGuardian.babyNameKo : scGuardian.nameKo}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold whitespace-nowrap ${scTheme.badgeBg}`}
                            >
                              TIER: SSR
                            </span>
                          </div>
                        </div>

                        <div
                          className={`shrink-0 px-3 py-2.5 space-y-1.5 border-t ${
                            scIsBaby
                              ? "bg-gradient-to-b from-[#fff7ef] to-[#f8effa] border-amber-200/80"
                              : "bg-[#111020] border-amber-300/30"
                          }`}
                        >
                          <p
                            className={`text-[9.5px] font-bold text-center ${
                              scIsBaby ? "text-amber-900" : "text-amber-300"
                            }`}
                          >
                            {scIsBaby ? scGuardian.babyEpithet : scGuardian.epithet}
                          </p>
                          <p className="font-serif text-[11.5px] font-black text-center leading-snug line-clamp-2 break-keep">
                            “{scIsBaby ? scGuardian.babyQuote : scGuardian.spiritQuote}”
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
                            <div
                              className={`rounded-lg py-1 px-1.5 border ${
                                scIsBaby
                                  ? "bg-white border-amber-200/70 text-slate-800"
                                  : "bg-white/10 border-white/10 text-white"
                              }`}
                            >
                              💰 8월 횡재
                            </div>
                            <div
                              className={`rounded-lg py-1 px-1.5 border ${
                                scIsBaby
                                  ? "bg-white border-amber-200/70 text-slate-800"
                                  : "bg-white/10 border-white/10 text-white"
                              }`}
                            >
                              ⚠️ 4월 주의
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {showcaseEdition === "receipt" && (
                      <div className="w-full max-w-[250px] h-[340px] rounded-2xl p-3.5 bg-[#fdfaf2] text-slate-900 border border-stone-300 shadow-xl flex flex-col justify-between">
                        <div className="flex justify-between items-center border-b border-dashed border-slate-400 pb-1.5">
                          <span className="font-serif text-xs font-black">천명(天命) 감정서</span>
                          <span className="text-[9px] font-mono bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded">
                            #SSR-04
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-2 border border-stone-200">
                          <img
                            src={scGuardian.image}
                            alt={scGuardian.nameKo}
                            className="w-12 h-14 rounded-lg object-cover border border-amber-500/50 shrink-0"
                          />
                          <div className="text-left min-w-0">
                            <p className="text-[10px] font-extrabold text-amber-900">
                              {scGuardian.nameKo}({scGuardian.hanja})
                            </p>
                            <p className="text-[9px] text-slate-600 line-clamp-2 leading-snug">
                              {scGuardian.epithet}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-between gap-1.5">
                          <p className="font-serif text-[10.5px] font-black leading-snug line-clamp-2 break-keep">
                            “{scGuardian.spiritQuote}”
                          </p>
                          <VermilionSealSvg label="천명印" className="w-7 h-7 shrink-0" />
                        </div>
                        <div className="space-y-1 text-[9px] font-mono">
                          <div className="flex justify-between">
                            <span>재물·횡재력</span>
                            <span className="font-bold text-emerald-700">91%</span>
                          </div>
                          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 w-[91%]" />
                          </div>
                          <div className="flex justify-between pt-0.5">
                            <span>직감·방어력</span>
                            <span className="font-bold">94%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 우측 핵심 차별점 리스트 (간결화) */}
                  <div className="sm:col-span-6 space-y-2.5 text-left">
                    <div className="rounded-2xl bg-white/80 border border-white p-3 space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        🐅 1. 영험한 신수 & 🐾 귀여운 아기 신수 2종 제공
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        내 사주 오행에 맞는 수호신(청룡·주작·황룡·백호·현무)을 영험한 버전과 아기 버전 모두로 저장하세요.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 border border-white p-3 space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        ✨ 2. 글자와 겹치지 않는 깔끔한 PNG 카드
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        인스타 스토리(9:16)와 피드(4:5) 비율에 맞춰 이미지와 요약 정보를 깔끔히 분리했습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
                );
              })()}

              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">
                    1. 어떤 운세를 확인해 볼까요?
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    사계절 범용 운세 플랫폼
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MENU_ITEMS.map((item) => {
                    const isSelected = selectedMenu === item.id;
                    const isSeasonMain = item.id === "newyear2027";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                          isSeasonMain ? "sm:col-span-2" : ""
                        } ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] scale-[1.01]"
                            : "glass-card hover:bg-white/85 text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                              isSelected ? "bg-white/15" : "bg-white/80 shadow-sm"
                            }`}
                          >
                            {item.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-sm">
                                {item.title}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeStyle}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] mt-0.5 line-clamp-1 ${
                                isSelected ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-amber-300 bg-amber-300 text-slate-950"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-slate-950" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* PC 전용: 오행별 오라(Aura) 카드 테마 안내 스트립 */}
              <section className="hidden lg:block glass-card rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-800">
                    ✨ 내 사주 오행에 따라 자동 매칭되는 5가지 오라(Aura) 결과 카드
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    9:16 스토리 & 4:5 피드 PNG 저장 지원
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {(Object.keys(ELEMENT_THEMES) as ElementKey[]).map((key) => {
                    const t = ELEMENT_THEMES[key];
                    return (
                      <div
                        key={key}
                        style={{
                          background: t.cardBgStyle,
                          color: t.textOnCard,
                        }}
                        className="rounded-2xl p-3 border border-white/70 shadow-sm text-center"
                      >
                        <p className="font-serif text-base font-black">{t.hanja}</p>
                        <p className="text-[11px] font-extrabold mt-0.5">{t.nameKo}</p>
                        <p className="text-[9px] opacity-75 mt-0.5 line-clamp-1">
                          {t.auraLabel.replace(" 오라", "")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* 우측 영역 (모바일: 하단 / PC: 스티키 원페이지 입력 폼) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <form
                onSubmit={handleSubmit}
                className="glass-card rounded-3xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">
                    2. 내 사주 정보 입력 (10초 완료)
                  </h2>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    만세력 정밀 분석
                  </span>
                </div>

                {/* 현재 상단에서 선택한 테마 고정 배지 */}
                {(() => {
                  const activeMenuMeta =
                    MENU_ITEMS.find((m) => m.id === selectedMenu) ?? MENU_ITEMS[0];
                  return (
                    <div className="rounded-2xl bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{activeMenuMeta.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-amber-300">
                            선택된 분석 테마
                          </p>
                          <p className="text-xs font-extrabold truncate">
                            {activeMenuMeta.title}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                        결과에 최우선 반영
                      </span>
                    </div>
                  );
                })()}

                {/* 최근 입력 프로필 1초 자동 완성 칩 */}
                {recentProfiles.length > 0 && (
                  <div className="rounded-2xl bg-amber-50/75 border border-amber-200/70 p-2.5 space-y-1.5">
                    <p className="text-[10px] font-extrabold text-amber-900">
                      ⚡ 최근 본 프로필 1초 불러오기
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentProfiles.map((prof, idx) => (
                        <button
                          key={`${prof.name}-${prof.birthDate}-${idx}`}
                          type="button"
                          onClick={() => {
                            setName(prof.name);
                            setGender(prof.gender);
                            applyBirthDate(prof.birthDate);
                            setCalendarType(prof.calendarType);
                            setBirthHour(prof.birthHour);
                            setWorry(prof.worry);
                          }}
                          className="rounded-full bg-white hover:bg-slate-900 hover:text-white border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-slate-800 transition shadow-xs"
                        >
                          {prof.name} ({prof.birthDate.slice(2).replace(/-/g, ".")})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 이름 + 성별 */}
                <div className="grid grid-cols-5 gap-2.5">
                  <div className="col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" />
                      이름 (닉네임)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 김민지"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      성별
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-white/75 border border-slate-200/80 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          gender === "female"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600"
                        }`}
                      >
                        여성
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          gender === "male"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600"
                        }`}
                      >
                        남성
                      </button>
                    </div>
                  </div>
                </div>

                {/* 생년월일 + 양력/음력 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      생년월일
                    </label>
                    <div className="flex items-center gap-1 bg-white/75 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCalendarType("solar")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                          calendarType === "solar"
                            ? "bg-slate-900 text-white"
                            : "text-slate-500"
                        }`}
                      >
                        양력
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarType("lunar")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                          calendarType === "lunar"
                            ? "bg-slate-900 text-white"
                            : "text-slate-500"
                        }`}
                      >
                        음력
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        value={birthQuickInput}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                          setBirthQuickInput(digits);
                          if (digits.length === 8) {
                            const y = digits.slice(0, 4);
                            const m = digits.slice(4, 6);
                            const d = digits.slice(6, 8);
                            if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
                              setBirthDate(`${y}-${m}-${d}`);
                            }
                          }
                        }}
                        placeholder="숫자 8자리 (예: 19960514)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        8자리 빠른입력
                      </span>
                    </div>
                    <input
                      type="date"
                      value={birthDate}
                      max="2026-12-31"
                      min="1940-01-01"
                      onChange={(e) => applyBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* 태어난 시간 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      태어난 시간
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={birthHour === "unknown"}
                        onChange={(e) =>
                          setBirthHour(e.target.checked ? "unknown" : "10")
                        }
                        className="rounded accent-slate-900"
                      />
                      시간 모름
                    </label>
                  </div>
                  <select
                    value={birthHour}
                    onChange={(e) => setBirthHour(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {BIRTH_HOUR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 연애·궁합 스캔 선택 시 상대방 정보 자동 확장 */}
                {selectedMenu === "compatibility" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-2xl bg-pink-50/80 border border-pink-200 p-3.5 space-y-2.5"
                  >
                    <p className="text-[11px] font-extrabold text-pink-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      상대방 생년월일 입력 (썸·연인·상사)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="상대방 이름"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold"
                      />
                      <input
                        type="date"
                        value={partnerBirthDate}
                        onChange={(e) => setPartnerBirthDate(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold"
                      />
                    </div>
                  </motion.div>
                )}

                {/* 선택한 상단 테마에 연동되는 세부 포커스 선택 */}
                {(() => {
                  const subFocus = MENU_SUB_FOCUS[selectedMenu] ?? MENU_SUB_FOCUS.newyear2027;
                  const activeMenuMeta =
                    MENU_ITEMS.find((m) => m.id === selectedMenu) ?? MENU_ITEMS[0];
                  return (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          {subFocus.sectionTitle}
                        </label>
                        {subFocus.lockedMessage ? (
                          <div className="rounded-xl bg-teal-50/90 border border-teal-200 px-3.5 py-3 text-xs font-bold text-teal-900">
                            {subFocus.lockedMessage}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {subFocus.options.map((opt, idx) => {
                              const active = worry === opt.value;
                              const spanTwo =
                                subFocus.options.length === 5 && idx === 4
                                  ? "col-span-2"
                                  : "";
                              return (
                                <button
                                  key={`${selectedMenu}-${opt.value}`}
                                  type="button"
                                  onClick={() => setWorry(opt.value)}
                                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${spanTwo} ${
                                    active
                                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                      : "bg-white/75 text-slate-700 border-slate-200 hover:bg-white"
                                  }`}
                                >
                                  <span>{opt.emoji}</span>
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {formError && (
                        <p className="text-xs font-bold text-rose-600 text-center">
                          {formError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#221d3a] to-slate-900 hover:brightness-110 text-white font-extrabold text-sm shadow-[0_14px_30px_rgba(15,23,42,0.28)] flex items-center justify-center gap-2 transition"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        [{activeMenuMeta.title}] 무료 사주 스캔하기
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}

                <p className="text-[11px] text-slate-500 text-center">
                  오행 차트 · 핵심 한 줄 총평 · 수호 영물 등급(TIER)은 100% 무료로 바로 공개됩니다
                </p>
              </form>
            </div>
          </div>

          {/* 하단 웹사이트 푸터 */}
          <footer className="mt-12 pt-6 border-t border-slate-300/50 text-center text-[11px] text-slate-400 space-y-1">
            <p className="font-serif tracking-widest text-slate-500">sajufact.kr</p>
            <p>사주팩트 (SajuFact) · PC·모바일 반응형 AI 사주·타로 웹서비스</p>
          </footer>
        </div>
      )}

      <TarotModal
        open={tarotOpen}
        onClose={() => setTarotOpen(false)}
        onConvertToSaju={() => {
          setPhase("home");
          setSelectedMenu("newyear2027");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <ArchiveModal
        open={archiveOpen}
        currentReportId={report?.id}
        onClose={() => setArchiveOpen(false)}
        onSelectReport={(selectedReport, selectedPlan, selectedPhone) => {
          setReport(selectedReport);
          setPaidPlan(selectedPlan);
          setKeeperPhone(selectedPhone ?? "");
          setPhase("result");
          try {
            window.history.replaceState(
              null,
              "",
              `/?saved=${encodeURIComponent(selectedReport.id)}`
            );
          } catch {}
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
