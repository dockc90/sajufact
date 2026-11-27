"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Edit3,
  FolderOpen,
  HeartHandshake,
  Lock,
  MessageCircleHeart,
  Plus,
  Sparkles,
  Sun,
  Ticket,
  User,
  Users,
} from "lucide-react";
import {
  BENCHMARK_REVIEWS,
  BIRTH_HOUR_OPTIONS,
  CORE_SEVEN_MENUS,
  ELEMENT_THEMES,
  GUARDIAN_BEAST_META,
  MENU_ITEMS,
  generateSajuReport,
  getKst23ResetCycleKey,
  getNext23KstCountdown,
} from "@/lib/saju-engine";
import type {
  CalendarType,
  ElementKey,
  GenderType,
  MenuCategory,
  PaymentPlan,
  SajuInput,
  SajuReport,
  WalletProfile,
  WalletState,
} from "@/lib/saju-types";
import { AuraBackground } from "@/components/AuraBackground";
import { AnalyzingView } from "@/components/AnalyzingView";
import {
  ArchiveModal,
  loadLocalArchive,
  upsertLocalArchive,
} from "@/components/ArchiveModal";
import { ResultView } from "@/components/ResultView";
import { SajuChatDrawer } from "@/components/SajuChatDrawer";
import { TarotModal } from "@/components/TarotModal";
import { WalletChargeModal } from "@/components/WalletChargeModal";
import { VermilionSealSvg } from "@/components/OrientalArtSvg";
import type { CardEdition } from "@/components/ShareCardStudio";

type ScreenPhase = "home" | "analyzing" | "result";

const WALLET_STORAGE_KEY = "sajufact_wallet_v1";
const RECENT_PROFILES_KEY = "sajufact_recent_profiles_v1";

function buildWalletId(profile: WalletProfile): string {
  const cleanName = (profile.name || "guest").trim().toLowerCase();
  return `w_${cleanName}_${profile.birthDate}_${profile.birthHour}`;
}

export default function HomePage() {
  const [phase, setPhase] = useState<ScreenPhase>("home");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<GenderType>("female");
  const [birthDate, setBirthDate] = useState("1996-05-14");
  const [birthQuickInput, setBirthQuickInput] = useState("19960514");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthHour, setBirthHour] = useState<string>("10");

  // 프로필 저장 여부 (저장 시 콤팩트 카드로 접혀서 대시보드 7종 메뉴를 원클릭 실행 가능)
  const [profileConfirmed, setProfileConfirmed] = useState(false);

  // 궁합 스캔 상대방 정보
  const [compatSheetOpen, setCompatSheetOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("1995-08-20");
  const [inviterBanner, setInviterBanner] = useState<{
    name: string;
    birth: string;
  } | null>(null);

  // 지갑 상태 (복주머니 코인 + 매일 밤 11시 무료 수다권 1장)
  const [wallet, setWallet] = useState<WalletState>({
    walletId: "w_guest_1996-05-14_10",
    profile: {
      name: "",
      gender: "female",
      birthDate: "1996-05-14",
      calendarType: "solar",
      birthHour: "10",
    },
    coins: 1, // 첫 방문 웰컴 보너스 복주머니 1개
    freeChatTickets: 1, // 매일 밤 11시 리셋 무료 수다권 1장
    lastFreeResetKey: "",
    unlockedReportIds: [],
  });
  const [countdownLabel, setCountdownLabel] = useState("매일 밤 11시 충전");

  const [report, setReport] = useState<SajuReport | null>(null);
  const [paidPlan, setPaidPlan] = useState<PaymentPlan | null>(null);
  const [keeperPhone, setKeeperPhone] = useState<string>("");
  const [tarotOpen, setTarotOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<string | undefined>(undefined);
  const [isRestoringUrl, setIsRestoringUrl] = useState(false);
  const [recentProfiles, setRecentProfiles] = useState<SajuInput[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // 쇼케이스 프리뷰 상태 (영험한 신수 / 아기 신수 / 천명 감정서)
  const [showcaseEdition, setShowcaseEdition] = useState<CardEdition>("aura");
  const [showcaseElement, setShowcaseElement] = useState<ElementKey>("metal");

  const applyBirthDate = (isoDate: string) => {
    setBirthDate(isoDate);
    setBirthQuickInput(isoDate.replace(/-/g, ""));
  };

  const syncWallet = (nextWallet: WalletState) => {
    setWallet(nextWallet);
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(nextWallet));
    } catch {
      // ignore storage quota
    }
    void fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextWallet),
    }).catch(() => {});
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || typeof window === "undefined") return;

      // 1) 로컬 지갑 & 매일 밤 11시 무료 수다권 자동 충전 체크
      const currentCycle = getKst23ResetCycleKey();
      setCountdownLabel(getNext23KstCountdown());
      try {
        const rawWallet = localStorage.getItem(WALLET_STORAGE_KEY);
        if (rawWallet) {
          const parsed = JSON.parse(rawWallet) as WalletState;
          if (parsed?.profile) {
            const resetTickets =
              parsed.lastFreeResetKey !== currentCycle
                ? Math.max(1, parsed.freeChatTickets)
                : parsed.freeChatTickets;
            const restored: WalletState = {
              ...parsed,
              freeChatTickets: resetTickets,
              lastFreeResetKey: currentCycle,
            };
            setWallet(restored);
            if (restored.profile.name) {
              setName(restored.profile.name);
              setGender(restored.profile.gender);
              applyBirthDate(restored.profile.birthDate);
              setCalendarType(restored.profile.calendarType);
              setBirthHour(restored.profile.birthHour);
              setProfileConfirmed(true);
            }
          }
        }
      } catch {
        // ignore invalid wallet storage
      }

      // 2) 최근 프로필 로드
      try {
        const rawProfiles = localStorage.getItem(RECENT_PROFILES_KEY);
        if (rawProfiles) {
          const parsedProfiles = JSON.parse(rawProfiles) as SajuInput[];
          if (Array.isArray(parsedProfiles)) {
            setRecentProfiles(parsedProfiles.slice(0, 4));
          }
        }
      } catch {
        // ignore invalid profiles
      }

      // 3) URL 파라미터(?inviter= / ?saved=) 복원
      const params = new URLSearchParams(window.location.search);
      const inviter = params.get("inviter");
      const inviterBirth = params.get("inviterBirth");
      const savedId = params.get("saved");

      if (inviter && inviterBirth) {
        setInviterBanner({ name: inviter, birth: inviterBirth });
        setPartnerName(inviter);
        setPartnerBirthDate(inviterBirth);
        setCompatSheetOpen(true);
      } else if (savedId) {
        setIsRestoringUrl(true);
        const localHit = loadLocalArchive().find((x) => x.report.id === savedId);
        if (localHit) {
          setReport(localHit.report);
          setPaidPlan(localHit.paidPlan);
          setKeeperPhone(localHit.keeperPhone ?? "");
          setPhase("result");
        }

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

  const ensureValidProfile = (): WalletProfile | null => {
    const clean = name.trim();
    if (!clean) {
      setFormError("복고양이가 이름을 알 수 있게 이름(닉네임)을 입력해 주세요.");
      setProfileConfirmed(false);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return null;
    }
    if (!birthDate) {
      setFormError("생년월일을 입력해 주세요.");
      setProfileConfirmed(false);
      return null;
    }
    setFormError(null);

    const nextProfile: WalletProfile = {
      name: clean,
      gender,
      birthDate,
      calendarType,
      birthHour,
    };
    const nextWalletId = buildWalletId(nextProfile);
    if (wallet.walletId !== nextWalletId || wallet.profile.name !== clean) {
      syncWallet({
        ...wallet,
        walletId: nextWalletId,
        profile: nextProfile,
      });
    }
    setProfileConfirmed(true);
    return nextProfile;
  };

  const handleSaveProfileOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const prof = ensureValidProfile();
    if (!prof) return;
    // 최근 프로필 갱신
    const item: SajuInput = {
      ...prof,
      worry: "wealth",
      menu: "newyear2027",
    };
    const nextProfiles = [
      item,
      ...recentProfiles.filter(
        (p) => !(p.name === prof.name && p.birthDate === prof.birthDate)
      ),
    ].slice(0, 4);
    setRecentProfiles(nextProfiles);
    try {
      localStorage.setItem(RECENT_PROFILES_KEY, JSON.stringify(nextProfiles));
    } catch {}
  };

  const runAnalysis = async (menu: MenuCategory) => {
    if (menu === "tarot") {
      setTarotOpen(true);
      return;
    }

    const prof = ensureValidProfile();
    if (!prof) return;

    if (menu === "compatibility" && !compatSheetOpen && !inviterBanner) {
      setCompatSheetOpen(true);
      return;
    }

    const worryByMenu: Record<MenuCategory, SajuInput["worry"]> = {
      newyear2027: "wealth",
      today: "wealth",
      lifetime: "relationship",
      wealth: "wealth",
      love: "love",
      compatibility: "love",
      daeun: "career",
      yeonun: "wealth",
      taekil: "career",
      health: "health",
      tarot: "wealth",
    };

    const payload: SajuInput = {
      ...prof,
      worry: worryByMenu[menu],
      menu,
      partnerName:
        menu === "compatibility"
          ? partnerName.trim() || inviterBanner?.name || "그 사람"
          : undefined,
      partnerBirthDate:
        menu === "compatibility"
          ? partnerBirthDate || inviterBanner?.birth || "1995-08-20"
          : undefined,
    };

    setPhase("analyzing");

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 2600));
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

    const existingLocal = loadLocalArchive().find(
      (x) => x.report.id === computedReport.id
    );
    const isUnlockedInWallet = wallet.unlockedReportIds.includes(computedReport.id);
    const restoredPlan: PaymentPlan | null =
      existingLocal?.paidPlan ?? (isUnlockedInWallet ? "allinone" : null);

    upsertLocalArchive(
      computedReport,
      restoredPlan,
      existingLocal?.keeperPhone
    );
    try {
      window.history.replaceState(
        null,
        "",
        `/?saved=${encodeURIComponent(computedReport.id)}`
      );
    } catch {}

    setReport(computedReport);
    setPaidPlan(restoredPlan);
    setCompatSheetOpen(false);
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenChat = (contextText?: string) => {
    const prof = ensureValidProfile();
    if (!prof) return;
    setChatContext(contextText);
    setChatOpen(true);
  };

  const handleConsumeForChat = (): boolean => {
    if (wallet.freeChatTickets > 0) {
      syncWallet({
        ...wallet,
        freeChatTickets: wallet.freeChatTickets - 1,
      });
      return true;
    }
    if (wallet.coins > 0) {
      syncWallet({
        ...wallet,
        coins: wallet.coins - 1,
      });
      return true;
    }
    return false;
  };

  const handleUnlockReportWithCoins = (
    reportId: string,
    coinCost: number
  ): boolean => {
    if (wallet.unlockedReportIds.includes(reportId)) return true;
    if (wallet.coins < coinCost) return false;
    syncWallet({
      ...wallet,
      coins: wallet.coins - coinCost,
      unlockedReportIds: Array.from(new Set([...wallet.unlockedReportIds, reportId])),
    });
    return true;
  };

  const sevenGridMenus = CORE_SEVEN_MENUS.map(
    (id) => MENU_ITEMS.find((m) => m.id === id)!
  );

  return (
    <>
      <AuraBackground
        element={phase === "result" && report ? report.dominantElement : "default"}
      />

      {/* 상단 고정 GNB — 복주머니 잔액 · 무료 수다권 · 내 보관함 */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/75 border-b border-white/80">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setPhase("home");
              try {
                window.history.replaceState(null, "", "/");
              } catch {}
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 text-left shrink-0"
          >
            <img
              src="/mascot/lucky-cat.jpg"
              alt="복고양이"
              className="w-7 h-7 rounded-full object-cover border border-amber-300"
            />
            <span className="font-serif text-base sm:text-lg font-black tracking-tight text-slate-900">
              사주팩트
            </span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setChargeOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200/80 border border-amber-300 text-amber-950 text-[11px] font-extrabold transition whitespace-nowrap"
            >
              <span>👝 {wallet.coins}개</span>
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenChat()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200/80 border border-rose-200 text-rose-800 text-[11px] font-extrabold transition whitespace-nowrap"
            >
              <Ticket className="w-3 h-3" />
              <span>수다권 {wallet.freeChatTickets}</span>
            </button>
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold transition whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">보관함</span>
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
          walletCoins={wallet.coins}
          freeChatTickets={wallet.freeChatTickets}
          onUnlockWithCoins={handleUnlockReportWithCoins}
          onOpenChargeModal={() => setChargeOpen(true)}
          onOpenChat={handleOpenChat}
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
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-5 pb-16 space-y-6">
          {/* ① 복고양이 환영 히어로 + 3초 간편 프로필 */}
          <section className="glass-card rounded-3xl p-4 sm:p-6 border border-amber-200/80 bg-gradient-to-br from-[#fffaf5]/95 via-white/90 to-[#fdf2f8]/80 space-y-4">
            <div className="flex items-center gap-3.5 sm:gap-5">
              <img
                src="/mascot/lucky-cat.jpg"
                alt="복고양이 도사"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0"
              />
              <div className="text-left space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-[10px] font-extrabold">
                  🎁 첫 방문 웰컴 보너스: 복주머니 1개 + 매일 무료 수다권 1장
                </span>
                <h1 className="font-serif text-lg sm:text-2xl font-black text-slate-900 leading-snug break-keep">
                  “듣고 싶은 빈말 말고 진짜 사주, 복고양이가 딱 짚어줄게!”
                </h1>
                <p className="text-xs text-slate-600">
                  아닌 건 솔직히 짚고, 내 편에서 현실 처방까지 주는 AI 사주 상담소
                </p>
              </div>
            </div>

            {inviterBanner && (
              <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 flex items-center gap-2 text-xs font-bold">
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>
                  {inviterBanner.name}님이 궁합을 요청했어요! 본인 정보 입력 후 궁합 스캔을 눌러보세요.
                </span>
              </div>
            )}

            {/* 3초 프로필: 확정되면 콤팩트 바, 아니면 입력 폼 */}
            {profileConfirmed && name.trim() ? (
              <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 text-left">
                  <span className="text-[10px] font-bold text-amber-300 block">
                    내 사주 원국 프로필 설정됨 · 아래 메뉴를 누르면 바로 열려요
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold truncate mt-0.5">
                    {name} · {gender === "female" ? "여성" : "남성"} · {birthDate} (
                    {calendarType === "solar" ? "양력" : "음력"} ·{" "}
                    {BIRTH_HOUR_OPTIONS.find((o) => o.value === birthHour)?.label.split(" ")[0] ??
                      "시간"}
                    )
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileConfirmed(false)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  변경
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSaveProfileOnly}
                className="rounded-2xl bg-white/90 border border-amber-200/80 p-4 space-y-3"
              >
                {recentProfiles.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    <span className="text-[10px] font-extrabold text-amber-800 shrink-0">
                      ⚡ 최근:
                    </span>
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
                        }}
                        className="shrink-0 rounded-full bg-amber-50 hover:bg-slate-900 hover:text-white border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 transition"
                      >
                        {prof.name} ({prof.birthDate.slice(2).replace(/-/g, ".")})
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-3 text-left">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" />
                      이름 (닉네임)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 김민지"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 text-left">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      성별
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                      {(["female", "male"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition ${
                            gender === g
                              ? "bg-slate-900 text-white"
                              : "text-slate-600"
                          }`}
                        >
                          {g === "female" ? "여" : "남"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-4 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        생년월일 (8자리)
                      </label>
                      <div className="flex gap-1 text-[10px] font-bold">
                        {(["solar", "lunar"] as const).map((cal) => (
                          <button
                            key={cal}
                            type="button"
                            onClick={() => setCalendarType(cal)}
                            className={`px-1.5 py-0.5 rounded ${
                              calendarType === cal
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 bg-slate-100"
                            }`}
                          >
                            {cal === "solar" ? "양력" : "음력"}
                          </button>
                        ))}
                      </div>
                    </div>
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
                          if (
                            Number(m) >= 1 &&
                            Number(m) <= 12 &&
                            Number(d) >= 1 &&
                            Number(d) <= 31
                          ) {
                            setBirthDate(`${y}-${m}-${d}`);
                          }
                        }
                      }}
                      placeholder="19960514"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 text-left">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      태어난 시간
                    </label>
                    <select
                      value={birthHour}
                      onChange={(e) => setBirthHour(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                    >
                      {BIRTH_HOUR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formError && (
                  <p className="text-xs font-bold text-rose-600">{formError}</p>
                )}

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] text-slate-500">
                    프로필 저장 시 7종 메뉴와 수다방을 바로 이용할 수 있어요.
                  </span>
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 px-4 py-2 text-xs font-extrabold transition"
                  >
                    프로필 저장 →
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* ② 매일 리텐션 2단 배너: 복고양이 AI 수다방 + 오늘의 무료 일진/타로 */}
          <section className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <button
              type="button"
              onClick={() => handleOpenChat()}
              className="sm:col-span-7 text-left rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-[#251c3d] to-slate-900 text-white shadow-xl border border-amber-300/35 hover:scale-[1.01] transition flex items-center justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    매일 밤 11시 무료 1장
                  </span>
                  <span className="text-[10px] font-bold text-amber-200">
                    {countdownLabel}
                  </span>
                </div>
                <h2 className="font-serif text-base sm:text-lg font-black text-white">
                  💬 복고양이에게 무엇이든 물어보세요
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  내 만세력을 기억한 AI 도사와 1:1 사주 채팅 (현재 무료 수다권{" "}
                  <strong className="text-amber-300">{wallet.freeChatTickets}장</strong>)
                </p>
              </div>
              <MessageCircleHeart className="w-9 h-9 text-amber-300 shrink-0" />
            </button>

            <div className="sm:col-span-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => void runAnalysis("today")}
                className="text-left glass-card rounded-3xl p-4 border border-amber-200/80 hover:border-amber-400 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">☀️</span>
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-extrabold">
                    FREE
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                    오늘의 일진
                  </p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    오늘 점수 · 금지 행동
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTarotOpen(true)}
                className="text-left glass-card rounded-3xl p-4 border border-indigo-200/80 hover:border-indigo-400 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🃏</span>
                  <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-extrabold">
                    FREE
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                    오늘의 타로
                  </p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    직감으로 1장 뽑기
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* ③ 초세분화 7종 메뉴 아이콘 그리드 + Coming Soon */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                복주머니로 열어보는 7종 정밀 사주 메뉴
              </h2>
              <button
                type="button"
                onClick={() => setChargeOpen(true)}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                복주머니 충전하기 →
              </button>
            </div>

            {/* 궁합 상대방 입력 시트 (궁합 카드 선택 시 확장) */}
            {compatSheetOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-pink-50/90 border-2 border-pink-300 p-4 space-y-2.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-pink-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    상대방 정보를 입력하고 궁합 스캔하기 (썸·연인·상사)
                  </p>
                  <button
                    type="button"
                    onClick={() => setCompatSheetOpen(false)}
                    className="text-[11px] font-bold text-slate-500"
                  >
                    닫기
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  <button
                    type="button"
                    onClick={() => void runAnalysis("compatibility")}
                    className="py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition"
                  >
                    궁합 스캔 시작 →
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sevenGridMenus.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void runAnalysis(item.id)}
                  className={`text-left glass-card rounded-2xl p-3.5 sm:p-4 transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between gap-2 border ${
                    item.highlight
                      ? "border-rose-300/90 bg-gradient-to-br from-rose-50/90 to-white"
                      : "border-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold whitespace-nowrap ${item.badgeStyle}`}
                    >
                      👝 {item.coinCost}개
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              ))}

              {/* Coming Soon 카드 */}
              <div className="text-left rounded-2xl p-3.5 sm:p-4 border border-dashed border-slate-300 bg-white/45 flex flex-col justify-between gap-2 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🎓</span>
                  <span className="rounded-full bg-slate-200 text-slate-600 px-2 py-0.5 text-[9.5px] font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    SOON
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-700">
                    시험·합격·작명운
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                    12월 신규 오픈 예정
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ④ 실제 감성 찐후기 롤링 배너 */}
          <section className="space-y-2.5 overflow-hidden">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-800">
                💬 사주팩트 유저들의 솔직한 찐후기
              </span>
              <span className="text-[11px] text-slate-500">
                실시간 누적 스캔 148,200+
              </span>
            </div>

            <div className="relative overflow-hidden py-1">
              <div className="animate-marquee flex gap-3">
                {[...BENCHMARK_REVIEWS, ...BENCHMARK_REVIEWS].map((rev, idx) => (
                  <div
                    key={`${rev.user}-${idx}`}
                    className="w-[270px] sm:w-[300px] shrink-0 glass-card rounded-2xl p-3.5 text-left space-y-1.5 border border-white/80"
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-extrabold text-slate-900">{rev.user}</span>
                      <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 font-bold">
                        {rev.tag}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed line-clamp-3">
                      “{rev.text}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ⑤ 사주팩트만의 무기: 수호 영물 & 아기 신수 카드 쇼케이스 */}
          {(() => {
            const scTheme = ELEMENT_THEMES[showcaseElement];
            const scGuardian = GUARDIAN_BEAST_META[showcaseElement];
            const scIsBaby = showcaseEdition === "baby";
            return (
              <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3 border border-amber-200/70">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold tracking-widest text-rose-600 uppercase">
                      SAJUFACT EXCLUSIVE
                    </span>
                    <h2 className="font-serif text-sm sm:text-base font-black text-slate-900">
                      리포트마다 함께 받는 내 사주 수호 영물 카드 3종
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
                  <div className="sm:col-span-6 flex justify-center">
                    {(showcaseEdition === "aura" || showcaseEdition === "baby") && (
                      <div
                        className={`w-full max-w-[245px] h-[325px] rounded-2xl overflow-hidden shadow-2xl border border-amber-300/45 flex flex-col ${
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
                        </div>
                      </div>
                    )}

                    {showcaseEdition === "receipt" && (
                      <div className="w-full max-w-[245px] h-[325px] rounded-2xl p-3.5 bg-[#fdfaf2] text-slate-900 border border-stone-300 shadow-xl flex flex-col justify-between">
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

                  <div className="sm:col-span-6 space-y-2.5 text-left">
                    <div className="rounded-2xl bg-white/80 border border-white p-3 space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        🐅 1. 복주머니 1개로 풀이 + 인스타 수호신 카드까지
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        내 오행에 맞는 청룡·주작·황룡·백호·현무 화보(영험/아기 버전)를 9:16 스토리·4:5 피드로 즉시 저장하세요.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 border border-white p-3 space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        🐱 2. 읽다가 궁금하면 복고양이 수다방에서 바로 질문
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        리포트에 담긴 내 사주 데이터를 기억한 채로 연애·이직·재물 꼬리 질문에 끝까지 답해줍니다.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          <footer className="pt-4 border-t border-slate-300/50 text-center text-[11px] text-slate-400 space-y-1">
            <p className="font-serif tracking-widest text-slate-500">sajufact.kr</p>
            <p>사주팩트 (SajuFact) · 복고양이 AI 사주·수다방 플랫폼</p>
          </footer>
        </div>
      )}

      <TarotModal
        open={tarotOpen}
        onClose={() => setTarotOpen(false)}
        onConvertToSaju={() => {
          setTarotOpen(false);
          void runAnalysis("newyear2027");
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

      <WalletChargeModal
        open={chargeOpen}
        currentCoins={wallet.coins}
        onClose={() => setChargeOpen(false)}
        onChargeComplete={(addedCoins) => {
          syncWallet({
            ...wallet,
            coins: wallet.coins + addedCoins,
          });
          setChargeOpen(false);
        }}
      />

      <SajuChatDrawer
        open={chatOpen}
        walletId={wallet.walletId}
        profile={{
          name: name.trim() || wallet.profile.name || "회원",
          gender,
          birthDate,
          calendarType,
          birthHour,
        }}
        coins={wallet.coins}
        freeChatTickets={wallet.freeChatTickets}
        initialContext={chatContext}
        onClose={() => setChatOpen(false)}
        onConsumeForChat={handleConsumeForChat}
        onOpenChargeModal={() => {
          setChatOpen(false);
          setChargeOpen(true);
        }}
      />
    </>
  );
}
