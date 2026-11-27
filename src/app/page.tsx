"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Clover,
  HeartHandshake,
  Home,
  Lock,
  MessageCircle,
  MessageCircleHeart,
  Plus,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  BENCHMARK_REVIEWS,
  generateSajuReport,
  getKst23ResetCycleKey,
  getNext23KstCountdown,
} from "@/lib/saju-engine";
import type {
  AccountSession,
  DailyCatcherDraw,
  MenuCategory,
  PaymentPlan,
  SajuInput,
  SajuReport,
  SavedSajuProfile,
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
import { FortuneCatcherDevice } from "@/components/FortuneCatcherDevice";
import { FortuneCatcherModal } from "@/components/FortuneCatcherModal";
import {
  ProfileManagerModal,
  createProfileId,
} from "@/components/ProfileManagerModal";
import { ResultView } from "@/components/ResultView";
import { SajuChatDrawer } from "@/components/SajuChatDrawer";
import { SocialLoginModal } from "@/components/SocialLoginModal";
import { TarotModal } from "@/components/TarotModal";
import { WalletChargeModal } from "@/components/WalletChargeModal";
import type { PastelAuraMood } from "@/components/ShareCardStudio";

type ScreenPhase = "home" | "analyzing" | "result";

const WALLET_STORAGE_KEY = "sajufact_wallet_v1";
const PROFILES_STORAGE_KEY = "sajufact_saved_profiles_v1";
const ACTIVE_PROFILE_STORAGE_KEY = "sajufact_active_profile_id_v1";
const SESSION_STORAGE_KEY = "sajufact_account_session_v1";
const DAILY_DRAW_STORAGE_KEY = "sajufact_daily_draw_v1";

const CHUNKY_MENU_CARDS: Array<{
  id: MenuCategory;
  title: string;
  subtitle: string;
  coinCost: number;
  cardBg: string;
  image: string;
  clipId?: string;
  badge?: "BEST" | "NEW";
}> = [
  {
    id: "lifetime",
    title: "990원 사주",
    subtitle: "용하다고 소문난 사주 해설",
    coinCost: 1,
    badge: "BEST",
    cardBg: "bg-[#fff8d2]",
    image: "/mascot/dalto-basic.jpg",
  },
  {
    id: "newyear2027",
    title: "신년운세",
    subtitle: "2027년엔 대박난다",
    coinCost: 1,
    badge: "NEW",
    cardBg: "bg-[#fde7ee]",
    image: "/mascot/dalto-newyear2027.jpg",
  },
  {
    id: "love",
    title: "연애운",
    subtitle: "썸, 결혼운, 재회운까지",
    coinCost: 1,
    cardBg: "bg-[#fff0f5]",
    image: "/mascot/dalto-party.jpg",
    clipId: "clip-heart",
  },
  {
    id: "compatibility",
    title: "990원 궁합",
    subtitle: "우리 사이는 몇 점?",
    coinCost: 1,
    cardBg: "bg-[#eef8c6]",
    image: "/mascot/dalto-rabbit.jpg",
    clipId: "clip-tulip",
  },
  {
    id: "daeun",
    title: "10년 대운",
    subtitle: "내 인생 황금기 언제?",
    coinCost: 2,
    cardBg: "bg-[#e1f1fd]",
    image: "/mascot/dalto-mortar.jpg",
    clipId: "clip-star",
  },
  {
    id: "yeonun",
    title: "3년 연운",
    subtitle: "2026~2028 상승곡선",
    coinCost: 1,
    cardBg: "bg-[#efe7fc]",
    image: "/mascot/dalto-party.jpg",
    clipId: "clip-cloud",
  },
  {
    id: "taekil",
    title: "길일 택일",
    subtitle: "계약·면접·고백 대박날",
    coinCost: 1,
    cardBg: "bg-[#ffefe0]",
    image: "/mascot/dalto-mortar.jpg",
  },
];

const HOME_FAQ_ITEMS = [
  {
    q: "정말 당근 1개(990원)인가요?",
    a: "네! 사주팩트는 당근 1개(990원)부터 필요한 사주 테마만 골라서 부담 없이 열어볼 수 있으며, 당근 한 다발/바구니/농장 패키지로 충전 시 보너스 당근까지 지급됩니다.",
  },
  {
    q: "태어난 시간을 몰라도 볼 수 있나요?",
    a: "물론입니다. 태어난 시간 드롭다운 기본값인 '시간 모름 (삼주 분석)' 상태로도 년주·월주·일주 6글자와 2027 정미년 세운, 오행 분포를 정밀하게 계산해 드립니다.",
  },
  {
    q: "무료 수다권은 언제 충전되나요?",
    a: "매일 밤 11시(23:00 KST)가 되면 달토와 1:1 대화를 나눌 수 있는 무료 수다권이 자동으로 1장씩 채워집니다.",
  },
  {
    q: "환불 규정은 어떻게 되나요?",
    a: "사용하지 않은 미사용 당근 패키지는 결제일로부터 7일 이내 고객센터(help@sajufact.kr)로 요청 시 전액 환불 가능합니다. 이미 당근을 사용해 열람한 디지털 사주 리포트는 콘텐츠 특성상 환불이 제한됩니다.",
  },
];

function buildWalletId(profile: WalletProfile): string {
  const cleanName = (profile.name || "guest").trim().toLowerCase();
  return `w_${cleanName}_${profile.birthDate}_${profile.birthHour}`;
}

type PendingAction =
  | { type: "menu"; menu: MenuCategory }
  | { type: "chat"; context?: string }
  | null;

export default function HomePage() {
  const [phase, setPhase] = useState<ScreenPhase>("home");

  // 저장된 다중 사주 프로필 & 로그인 세션 (본인·가족·연인·친구·지인·직장동료)
  const [savedProfiles, setSavedProfiles] = useState<SavedSajuProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [accountSession, setAccountSession] = useState<AccountSession | null>(
    null
  );
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // 궁합 스캔 상대방 정보
  const [compatSheetOpen, setCompatSheetOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("1995-08-20");
  const [inviterBanner, setInviterBanner] = useState<{
    name: string;
    birth: string;
  } | null>(null);

  // 지갑 상태 (당근 코인 + 매일 밤 11시 무료수다권 1장)
  const [wallet, setWallet] = useState<WalletState>({
    walletId: "w_guest_1996-05-14_unknown",
    profile: {
      name: "",
      gender: "female",
      birthDate: "1996-05-14",
      calendarType: "solar",
      birthHour: "unknown",
    },
    coins: 0,
    freeChatTickets: 1,
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
  const [socialLoginOpen, setSocialLoginOpen] = useState(false);
  const [profileInitialForm, setProfileInitialForm] = useState(false);
  const [catcherModalOpen, setCatcherModalOpen] = useState(false);
  const [dailyDraw, setDailyDraw] = useState<DailyCatcherDraw | null>(null);

  // 파스텔 오라 인스타 카드 쇼케이스 프리뷰 상태
  const [showcaseMood, setShowcaseMood] = useState<PastelAuraMood>("party");
  const [showcaseRatio, setShowcaseRatio] = useState<"9:16" | "4:5">("9:16");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [policyModal, setPolicyModal] = useState<"terms" | "privacy" | null>(null);

  const activeProfile =
    savedProfiles.find((p) => p.id === activeProfileId) ??
    savedProfiles[0] ??
    null;

  const currentProfileDraw =
    dailyDraw && activeProfile && dailyDraw.profileId === activeProfile.id
      ? dailyDraw
      : null;

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
            setWallet({
              ...parsed,
              freeChatTickets: resetTickets,
              lastFreeResetKey: currentCycle,
            });
          }
        }
      } catch {
        // ignore invalid wallet storage
      }

      // 2) 저장된 프로필 수첩 & 로그인 세션 로드
      try {
        const rawProfs = localStorage.getItem(PROFILES_STORAGE_KEY);
        if (rawProfs) {
          const parsedProfs = JSON.parse(rawProfs) as SavedSajuProfile[];
          if (Array.isArray(parsedProfs)) {
            setSavedProfiles(parsedProfs);
          }
        }
        const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
        if (savedActiveId) setActiveProfileId(savedActiveId);

        const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (rawSession) {
          const parsedSession = JSON.parse(rawSession) as AccountSession;
          if (parsedSession?.loggedIn) setAccountSession(parsedSession);
        }

        const kst = new Date(Date.now() + 9 * 3600000);
        const todayKey = `${kst.getUTCFullYear()}-${String(
          kst.getUTCMonth() + 1
        ).padStart(2, "0")}-${String(kst.getUTCDate()).padStart(2, "0")}`;
        const rawDaily = localStorage.getItem(DAILY_DRAW_STORAGE_KEY);
        if (rawDaily) {
          const parsedDaily = JSON.parse(rawDaily) as DailyCatcherDraw;
          if (parsedDaily?.dateKey === todayKey) {
            setDailyDraw(parsedDaily);
          }
        }
      } catch {
        // ignore invalid saved profiles
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

  const activateSavedProfile = (prof: SavedSajuProfile) => {
    setActiveProfileId(prof.id);
    try {
      localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, prof.id);
    } catch {}

    const walletProfile: WalletProfile = {
      name: prof.name,
      gender: prof.gender,
      birthDate: prof.birthDate,
      calendarType: prof.calendarType,
      birthHour: prof.birthHour,
    };
    const nextWalletId = buildWalletId(walletProfile);
    syncWallet({
      ...wallet,
      walletId: nextWalletId,
      profile: walletProfile,
    });
  };

  const runAnalysis = async (
    menu: MenuCategory,
    overrideProfile?: SavedSajuProfile
  ) => {
    if (menu === "tarot") {
      setTarotOpen(true);
      return;
    }

    const targetProf = overrideProfile ?? activeProfile;
    if (!targetProf || !targetProf.name.trim()) {
      setPendingAction({ type: "menu", menu });
      if (!accountSession?.loggedIn) {
        setSocialLoginOpen(true);
      } else {
        setProfileInitialForm(true);
        setProfileModalOpen(true);
      }
      return;
    }

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
      name: targetProf.name,
      gender: targetProf.gender,
      birthDate: targetProf.birthDate,
      calendarType: targetProf.calendarType,
      birthHour: targetProf.birthHour,
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

  const handleOpenChat = (
    contextText?: string,
    overrideProfile?: SavedSajuProfile
  ) => {
    const targetProf = overrideProfile ?? activeProfile;
    if (!targetProf || !targetProf.name.trim()) {
      setPendingAction({ type: "chat", context: contextText });
      if (!accountSession?.loggedIn) {
        setSocialLoginOpen(true);
      } else {
        setProfileInitialForm(true);
        setProfileModalOpen(true);
      }
      return;
    }
    setChatContext(contextText);
    setChatOpen(true);
  };

  const runPendingWithProfile = (prof: SavedSajuProfile) => {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;
    if (action.type === "menu") {
      void runAnalysis(action.menu, prof);
    } else if (action.type === "chat") {
      handleOpenChat(action.context, prof);
    }
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

  const handleGoHome = () => {
    setPhase("home");
    setProfileModalOpen(false);
    setProfileInitialForm(false);
    setSocialLoginOpen(false);
    setCatcherModalOpen(false);
    setTarotOpen(false);
    setArchiveOpen(false);
    setChargeOpen(false);
    setChatOpen(false);
    setCompatSheetOpen(false);
    setPolicyModal(null);
    setPendingAction(null);
    try {
      window.history.replaceState(null, "", "/");
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AuraBackground
        element={phase === "result" && report ? report.dominantElement : "default"}
      />

      {/* 상단 고정 GNB — [ 🥕 당근 0 | 🎟️ 무료수다권 1 ] · 보관함 */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/75 border-b border-white/90">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleGoHome}
            aria-label="사주팩트 홈으로 이동"
            title="홈으로 이동"
            className="group flex items-center gap-2 text-left shrink-0"
          >
            <span className="w-8 h-8 rounded-2xl bg-white/95 border border-slate-200/80 shadow-2xs flex items-center justify-center group-hover:scale-105 active:scale-95 transition">
              <svg
                viewBox="0 0 32 32"
                className="w-5 h-5 text-[#141418]"
                fill="currentColor"
                aria-hidden="true"
              >
                {/* 토끼 발가락 4개 (아치형 길쭉한 타원) */}
                <ellipse cx="8.2" cy="12.2" rx="2.3" ry="3.7" transform="rotate(-20 8.2 12.2)" />
                <ellipse cx="13.2" cy="8.8" rx="2.4" ry="4.2" transform="rotate(-7 13.2 8.8)" />
                <ellipse cx="18.8" cy="8.8" rx="2.4" ry="4.2" transform="rotate(7 18.8 8.8)" />
                <ellipse cx="23.8" cy="12.2" rx="2.3" ry="3.7" transform="rotate(20 23.8 12.2)" />
                {/* 토끼 뒷꿈치 도톰한 하트-타원 패드 */}
                <path d="M 16 14.5 C 12.4 14.5 9.2 17.5 9.4 21.4 C 9.5 24.4 12.0 26.2 14.3 25.5 C 15.2 25.2 15.6 24.7 16 24.7 C 16.4 24.7 16.8 25.2 17.7 25.5 C 20.0 26.2 22.5 24.4 22.6 21.4 C 22.8 17.5 19.6 14.5 16 14.5 Z" />
              </svg>
            </span>
            <span className="font-serif text-base sm:text-lg font-black tracking-tight text-[#1c1b22]">
              사주팩트
            </span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-[#fff5eb] via-white to-[#fdf0f6] border border-orange-200/80 shadow-xs p-0.5 text-[11px] font-extrabold">
              <button
                type="button"
                onClick={() => setChargeOpen(true)}
                aria-label="당근 충전하기"
                title="클릭해서 당근 충전하기"
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full hover:bg-orange-100/80 text-orange-800 transition whitespace-nowrap"
              >
                <span>🥕 당근 {wallet.coins}</span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white shadow-2xs">
                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              </button>
              <span className="text-violet-200 select-none px-0.5">|</span>
              <button
                type="button"
                onClick={() => handleOpenChat()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-rose-100/70 text-rose-700 transition whitespace-nowrap"
              >
                <Ticket className="w-3 h-3 text-rose-500" />
                <span>{wallet.freeChatTickets}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingAction(null);
                if (!accountSession?.loggedIn && !activeProfile) {
                  setSocialLoginOpen(true);
                } else {
                  setProfileInitialForm(false);
                  setProfileModalOpen(true);
                }
              }}
              className={
                accountSession?.loggedIn || activeProfile
                  ? "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/95 hover:bg-violet-50 border border-violet-200 text-[#4c3787] text-[11px] font-extrabold transition whitespace-nowrap shadow-2xs"
                  : "inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#ffe46b] hover:bg-[#ffd93d] text-slate-900 text-[11px] font-black transition whitespace-nowrap shadow-2xs"
              }
            >
              {accountSession?.loggedIn || activeProfile ? (
                <>
                  <UserRound className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="max-w-[84px] truncate">
                    {activeProfile
                      ? `${activeProfile.name}(${activeProfile.relation})`
                      : accountSession?.label}
                  </span>
                </>
              ) : (
                <span>로그인</span>
              )}
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

      {phase === "analyzing" && (
        <AnalyzingView userName={activeProfile?.name || "당신"} />
      )}

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
        <div className="max-w-2xl mx-auto w-full px-3.5 sm:px-5 pt-4 pb-28 space-y-5 relative">
          {/* 인라인 SVG 클립패스 마스크 (하트 · 튤립 · 별 · 구름) */}
          <svg
            aria-hidden="true"
            className="absolute w-0 h-0 pointer-events-none"
            width="0"
            height="0"
          >
            <defs>
              <clipPath id="clip-heart" clipPathUnits="objectBoundingBox">
                <path d="M 0.5,0.92 C 0.16,0.72 0.03,0.48 0.03,0.30 C 0.03,0.14 0.16,0.04 0.31,0.04 C 0.41,0.04 0.47,0.10 0.50,0.16 C 0.53,0.10 0.59,0.04 0.69,0.04 C 0.84,0.04 0.97,0.14 0.97,0.30 C 0.97,0.48 0.84,0.72 0.50,0.92 Z" />
              </clipPath>
              <clipPath id="clip-tulip" clipPathUnits="objectBoundingBox">
                <path d="M 0.50,0.96 C 0.15,0.94 0.04,0.68 0.06,0.36 C 0.07,0.16 0.17,0.05 0.25,0.10 C 0.31,0.14 0.35,0.23 0.38,0.23 C 0.41,0.23 0.44,0.05 0.50,0.05 C 0.56,0.05 0.59,0.23 0.62,0.23 C 0.65,0.23 0.69,0.14 0.75,0.10 C 0.83,0.05 0.93,0.16 0.94,0.36 C 0.96,0.68 0.85,0.94 0.50,0.96 Z" />
              </clipPath>
              <clipPath id="clip-star" clipPathUnits="objectBoundingBox">
                <path d="M 0.50,0.04 C 0.58,0.04 0.62,0.24 0.69,0.28 C 0.76,0.32 0.94,0.24 0.97,0.33 C 1.00,0.42 0.82,0.54 0.82,0.62 C 0.82,0.70 0.94,0.88 0.86,0.94 C 0.78,1.00 0.62,0.84 0.50,0.84 C 0.38,0.84 0.22,1.00 0.14,0.94 C 0.06,0.88 0.18,0.70 0.18,0.62 C 0.18,0.54 0.00,0.42 0.03,0.33 C 0.06,0.24 0.24,0.32 0.31,0.28 C 0.38,0.24 0.42,0.04 0.50,0.04 Z" />
              </clipPath>
              <clipPath id="clip-cloud" clipPathUnits="objectBoundingBox">
                <path d="M 0.30,0.95 C 0.12,0.95 0.04,0.80 0.10,0.66 C 0.02,0.56 0.04,0.38 0.16,0.32 C 0.14,0.16 0.26,0.05 0.42,0.09 C 0.52,0.02 0.68,0.04 0.74,0.16 C 0.88,0.14 0.97,0.28 0.92,0.44 C 0.99,0.56 0.95,0.74 0.82,0.80 C 0.84,0.92 0.68,0.98 0.56,0.92 C 0.48,0.97 0.38,0.97 0.30,0.95 Z" />
              </clipPath>
            </defs>
          </svg>

          {/* ① 최상단 달토 포춘 캐처 히어로 (미로그인 → 3초 로그인 → 오늘의 운세 뽑기 → 뽑기 완료 요약) */}
          <section className="rounded-b-[32px] -mx-3.5 sm:-mx-5 -mt-4 px-5 pt-6 pb-9 gingham-pastel-bg relative overflow-hidden text-center">
            {!accountSession?.loggedIn && !activeProfile ? (
              <div className="max-w-md mx-auto space-y-3">
                <h1 className="text-lg sm:text-xl font-black text-[#2b2242] tracking-tight">
                  내 운세를 보려면 로그인해 달라토!
                </h1>
                <div className="flex justify-center">
                  <FortuneCatcherDevice
                    mode="off"
                    size="lg"
                    onPress={() => setSocialLoginOpen(true)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSocialLoginOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700 hover:text-violet-700 transition"
                >
                  ⬆ 로그인하면 기기가 켜진다토!
                </button>
              </div>
            ) : !currentProfileDraw || !activeProfile ? (
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAction(null);
                      setProfileInitialForm(false);
                      setProfileModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/90 hover:bg-white border border-violet-200 px-3 py-1 text-[11px] font-extrabold text-[#3d2d66] shadow-2xs transition"
                  >
                    <span>
                      🐇{" "}
                      {activeProfile
                        ? `${activeProfile.name} (${
                            activeProfile.customRelation || activeProfile.relation
                          })`
                        : accountSession?.label || "내 사주"}
                    </span>
                    <span className="text-violet-600">· 전환 +</span>
                  </button>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-[#2b2242] tracking-tight">
                  오늘의 운세를 뽑아보라토! 🐇
                </h1>
                <div className="flex justify-center">
                  <FortuneCatcherDevice
                    mode="idle"
                    size="lg"
                    onPress={() => {
                      if (!activeProfile) {
                        setProfileInitialForm(true);
                        setProfileModalOpen(true);
                      } else {
                        setCatcherModalOpen(true);
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!activeProfile) {
                      setProfileInitialForm(true);
                      setProfileModalOpen(true);
                    } else {
                      setCatcherModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700 hover:text-violet-700 transition"
                >
                  ⬆ 버튼 눌러서 오늘 운세 뽑기!
                </button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto flex items-center justify-between gap-3 sm:gap-5 text-left">
                <div className="flex-1 min-w-0 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAction(null);
                      setProfileInitialForm(false);
                      setProfileModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/85 hover:bg-white border border-white px-2.5 py-1 shadow-2xs transition max-w-full"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      {activeProfile.name.slice(0, 1)}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 truncate">
                      {activeProfile.name} · {currentProfileDraw.dateDisplay}
                    </span>
                    <span className="text-[10px] font-bold text-violet-600 shrink-0">
                      전환
                    </span>
                  </button>

                  <p className="text-sm sm:text-base font-black text-[#2b2242] leading-snug line-clamp-2">
                    &ldquo;{currentProfileDraw.quote}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-white/95 border border-white px-2.5 py-1 text-[11px] font-extrabold text-slate-700 shadow-2xs">
                      # {currentProfileDraw.luckyNumber}
                    </span>
                    <span className="rounded-full bg-white/95 border border-white px-2.5 py-1 text-[11px] font-extrabold text-slate-700 shadow-2xs">
                      🎨 {currentProfileDraw.luckyColor}
                    </span>
                    <span className="rounded-full bg-white/95 border border-white px-2.5 py-1 text-[11px] font-extrabold text-slate-700 shadow-2xs">
                      🍀 {currentProfileDraw.luckyItem}
                    </span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => void runAnalysis("today", activeProfile)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#ff85a2] hover:bg-[#ff6f91] text-white px-4 py-1.5 text-xs font-black shadow-sm transition"
                    >
                      <span>운세 더보기 &gt;</span>
                    </button>
                  </div>
                </div>

                <div className="shrink-0">
                  <FortuneCatcherDevice
                    mode="result"
                    score={currentProfileDraw.score}
                    size="sm"
                    onPress={() => setCatcherModalOpen(true)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* ② 화이트 둥근 시트: 무료 수다권 도착 배너 + 2열 달토끼 포토 카드 */}
          <div className="rounded-t-[30px] -mt-5 relative z-10 bg-white/95 p-3.5 sm:p-4 space-y-4 shadow-[0_-8px_30px_rgba(60,40,120,0.06)]">
            {inviterBanner && (
              <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 flex items-center gap-2 text-xs font-bold shadow-sm">
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>
                  {inviterBanner.name}님이 궁합을 요청했어요! 아래에서 내 이름 입력 후 990원 궁합을 눌러보세요.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleOpenChat()}
              className="w-full rounded-2xl bg-gradient-to-r from-[#fff8fb] via-white to-[#fff5f8] hover:from-rose-50 hover:to-pink-50 border border-pink-100/90 px-4 py-3 flex items-center justify-between gap-3 shadow-2xs transition text-left"
            >
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm sm:text-[15px] font-black text-slate-900 truncate">
                  <span className="text-rose-500">무료 수다권</span>이 도착했어요!
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  매일 밤 11시에 1장 자동 충전돼요
                </p>
              </div>
              <div className="shrink-0 relative flex items-center">
                <div className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-pink-200 to-rose-200 border border-pink-300/80 px-3 py-1.5 shadow-2xs">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-300 text-[11px] font-black text-amber-950 shadow-2xs">
                    {wallet.freeChatTickets}
                  </span>
                  <Ticket className="w-4 h-4 text-rose-600" />
                </div>
              </div>
            </button>

            <section className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {CHUNKY_MENU_CARDS.map((card) => {
                const isBest = card.badge === "BEST";
                const isNew = card.badge === "NEW";
                const pricePillClass =
                  card.coinCost >= 2
                    ? "bg-violet-100 text-violet-700 border border-violet-200/90"
                    : "bg-white text-orange-600 border border-orange-200/90";

                return (
                  <motion.button
                    key={card.id}
                    type="button"
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void runAnalysis(card.id)}
                    className={`relative text-left rounded-[28px] p-3 sm:p-3.5 shadow-sm border border-white/95 hover:shadow-md transition flex flex-col justify-between gap-2.5 ${card.cardBg}`}
                  >
                    {/* 상단 왕큰 달토끼 사진 영역 */}
                    <div className="relative aspect-square w-full">
                      <div
                        style={
                          card.clipId
                            ? { clipPath: `url(#${card.clipId})` }
                            : undefined
                        }
                        className={`w-full h-full overflow-hidden ${
                          card.clipId ? "" : "rounded-[22px]"
                        }`}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      {(isBest || isNew) && (
                        <span
                          className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide text-white shadow-sm ${
                            isBest
                              ? "bg-rose-500"
                              : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                          }`}
                        >
                          {card.badge}
                        </span>
                      )}
                    </div>

                    {/* 하단 큰 타이틀 + 당근 가격 배지 */}
                    <div className="px-0.5 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-[15px] sm:text-base font-black text-slate-900 tracking-tight truncate">
                          {card.title}
                        </h3>
                        <span
                          className={`shrink-0 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-black shadow-2xs ${pricePillClass}`}
                        >
                          🥕 {card.coinCost}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-600 truncate">
                        {card.subtitle}
                      </p>
                    </div>
                  </motion.button>
                );
              })}

              {/* 8번째 카드: Coming Soon */}
              <div className="relative text-left rounded-[28px] p-3 sm:p-3.5 shadow-sm border border-dashed border-violet-200 bg-[#f3f0fa] flex flex-col justify-between gap-2.5">
                <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-white/60">
                  <img
                    src="/mascot/dalto-rabbit.jpg"
                    alt="시험·합격운 준비 중"
                    className="w-full h-full object-cover opacity-55 grayscale-[25%]"
                  />
                  <div className="absolute inset-0 bg-violet-950/20 flex flex-col items-center justify-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10.5px] font-black text-violet-700 shadow-sm">
                      <Lock className="w-3 h-3" />
                      SOON
                    </span>
                  </div>
                </div>
                <div className="px-0.5 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-[15px] sm:text-base font-black text-slate-700 tracking-tight truncate">
                      시험·합격운
                    </h3>
                    <span className="shrink-0 rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[10px] font-extrabold">
                      12월
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                    오픈 준비 중이에요
                  </p>
                </div>
              </div>
            </div>

            {/* 궁합 상대방 입력 시트 (990원 궁합 선택 시 확장) */}
            {compatSheetOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-pink-50/95 border-2 border-pink-200 p-4 space-y-2.5 text-left"
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
                {savedProfiles.filter((p) => p.id !== activeProfile?.id).length >
                  0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    <span className="text-[10px] font-extrabold text-pink-700 shrink-0">
                      ⚡ 저장된 사람:
                    </span>
                    {savedProfiles
                      .filter((p) => p.id !== activeProfile?.id)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPartnerName(p.name);
                            setPartnerBirthDate(p.birthDate);
                          }}
                          className="shrink-0 rounded-full bg-white border border-pink-200 hover:bg-pink-500 hover:text-white px-2.5 py-0.5 text-[11px] font-bold text-pink-800 transition"
                        >
                          {p.name} ({p.relation})
                        </button>
                      ))}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="상대방 이름"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="상대방 생년월일 (예: 1995-08-20)"
                    value={partnerBirthDate}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                      const formatted =
                        digits.length <= 4
                          ? digits
                          : digits.length <= 6
                          ? `${digits.slice(0, 4)}-${digits.slice(4)}`
                          : `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
                      setPartnerBirthDate(formatted);
                    }}
                    className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => void runAnalysis("compatibility")}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-105 text-white text-xs font-extrabold transition"
                  >
                    궁합 스캔 시작 →
                  </button>
                </div>
              </motion.div>
            )}
          </section>
          </div>

          {/* ② 매일 리텐션 2단 배너: 달토 AI 수다방 + 오늘의 무료 일진/타로 */}
          <section className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleOpenChat()}
              className="sm:col-span-7 text-left rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#5c489b] via-[#8b5fbf] to-[#e6849c] text-white shadow-xl border border-white/40 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/mascot/dalto-party.jpg"
                  alt="달토"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white/80 shrink-0 shadow-md"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-white/25 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                      매일 밤 11시 무료 1장
                    </span>
                    <span className="text-[10px] font-bold text-amber-100">
                      {countdownLabel}
                    </span>
                  </div>
                  <h2 className="font-serif text-base font-black text-white truncate">
                    💬 달토에게 무엇이든 물어보세요
                  </h2>
                  <p className="text-xs text-white/90 truncate">
                    1:1 사주 수다방 (무료수다권{" "}
                    <strong className="text-amber-200">{wallet.freeChatTickets}장</strong>)
                  </p>
                </div>
              </div>
              <MessageCircleHeart className="w-7 h-7 text-amber-200 shrink-0 hidden sm:block" />
            </motion.button>

            <div className="sm:col-span-5 grid grid-cols-2 gap-2.5">
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => void runAnalysis("today")}
                className="text-left glass-card rounded-3xl p-4 border border-orange-200/80 hover:border-orange-300 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">☀️</span>
                  <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-0.5 text-[10px] font-extrabold">
                    FREE
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                    오늘의 일진
                  </p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    오늘 점수 · 주의
                  </p>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTarotOpen(true)}
                className="text-left glass-card rounded-3xl p-4 border border-violet-200/80 hover:border-violet-300 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🃏</span>
                  <span className="rounded-full bg-violet-100 text-violet-800 px-2 py-0.5 text-[10px] font-extrabold">
                    FREE
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                    오늘의 타로
                  </p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    직감으로 1장
                  </p>
                </div>
              </motion.button>
            </div>
          </section>

          {/* ④ 실제 감성 찐후기 롤링 배너 */}
          <section className="space-y-2.5 overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  💬 사주팩트 유저들의 솔직한 찐후기
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 px-2.5 py-0.5 text-[10.5px] font-extrabold">
                  ⭐ 만족도 4.9/5.0
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                실시간 누적 스캔 148,200+
              </span>
            </div>

            <div className="relative overflow-hidden py-1">
              <div className="animate-marquee flex gap-3">
                {[...BENCHMARK_REVIEWS, ...BENCHMARK_REVIEWS].map((rev, idx) => (
                  <div
                    key={`${rev.user}-${idx}`}
                    className="w-[270px] sm:w-[300px] shrink-0 glass-card rounded-3xl p-3.5 text-left space-y-1.5 border border-white/90"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-amber-400 text-xs tracking-tight leading-none">
                        ★★★★★
                      </span>
                      <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-0.5 text-[10px] font-bold">
                        {rev.tag}
                      </span>
                    </div>
                    <p className="text-[10.5px] font-extrabold text-slate-900">
                      {rev.user}
                    </p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed line-clamp-3">
                      “{rev.text}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ⑤ 풀블리드 달토 파스텔 오라 인스타그램 공유 카드 쇼케이스 (예시 & 기능 안내) */}
          <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3.5 border border-white/95">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-left space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-700 px-2.5 py-0.5 text-[10px] font-black tracking-wide uppercase">
                  ✨ 예시 미리보기 · SAMPLE
                </span>
                <h2 className="font-serif text-sm sm:text-base font-black text-[#2b2242]">
                  사주 풀이 시 함께 받는 파스텔 오라 인스타 카드 (예시)
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-violet-100/70 p-1 rounded-2xl">
                {(
                  [
                    { id: "party", label: "🎀 실사 파티 달토" },
                    { id: "carrot", label: "🥕 당근 달토" },
                    { id: "moon", label: "🌕 절구 달토" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setShowcaseMood(tab.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-extrabold transition whitespace-nowrap ${
                      showcaseMood === tab.id
                        ? "bg-white text-[#4c3787] shadow-xs"
                        : "text-slate-600 hover:bg-white/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#f8f3ff] via-[#fff5f0] to-[#fff8fc] border border-violet-100 p-3.5 text-left space-y-1">
              <p className="text-xs font-black text-[#4b3880]">
                📌 어떤 기능에서 만들 수 있나요?
              </p>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                상단의 <strong className="text-slate-900">7종 사주 메뉴(990원 사주·신년운세·연애운·궁합 등)</strong>를 열어보면, 결과 화면의 <strong className="text-violet-700">[✨ 오라 카드]</strong> 탭에서 내 사주에 맞춘 나만의 카드를 9:16 스토리·4:5 피드 PNG로 바로 저장할 수 있어요!{" "}
                <span className="text-slate-500 font-semibold">(아래는 예시 이미지입니다)</span>
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1 bg-orange-100/70 p-1 rounded-2xl">
                {(
                  [
                    { id: "9:16", label: "9:16 (스토리·릴스 PNG)" },
                    { id: "4:5", label: "4:5 (인스타 피드 PNG)" },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setShowcaseRatio(r.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold transition whitespace-nowrap ${
                      showcaseRatio === r.id
                        ? "bg-white text-orange-700 shadow-xs"
                        : "text-slate-600 hover:bg-white/60"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                얼굴 가림 0% · 고화질 PNG 1클릭 저장
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div
                className={`${
                  showcaseRatio === "9:16" ? "w-[260px] h-[440px]" : "w-[276px] h-[345px]"
                } rounded-[26px] relative overflow-hidden border-2 border-white shadow-xl flex flex-col text-[#2b2242] transition-all duration-300 bg-[#fff8fc]`}
              >
                {/* 상단 풀블리드 달토 사진 */}
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <img
                    src={
                      showcaseMood === "party"
                        ? "/mascot/dalto-party.jpg"
                        : showcaseMood === "carrot"
                        ? "/mascot/dalto-rabbit.jpg"
                        : "/mascot/dalto-mortar.jpg"
                    }
                    alt="달토끼 달토"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-x-0 top-0 px-2.5 pt-2.5 flex items-center justify-between gap-1 pointer-events-none">
                    <span className="inline-flex items-center gap-1 bg-white/90 rounded-full px-2 py-0.5 text-[9px] font-extrabold text-[#4b3880] shadow-2xs">
                      🐇 예시 카드 · SAMPLE
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white px-2 py-0.5 text-[8.5px] font-extrabold shadow-2xs">
                      TIER: S · 상위 8%
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#fff8fc] to-transparent pointer-events-none" />
                </div>

                {/* 하단 컴팩트 파스텔 정보 패널 */}
                <div className="shrink-0 px-3 py-2.5 space-y-1.5 bg-gradient-to-b from-[#fff8fc] to-[#fdf4ff] border-t border-white">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9.5px] font-extrabold text-[#832d68]">
                      예시) 김민지 · 신해(辛亥)일주
                    </span>
                    <div className="flex gap-0.5">
                      {["庚午", "庚辰", "辛亥", "癸巳"].map((gz) => (
                        <span
                          key={gz}
                          className="px-1 py-0.5 rounded bg-white border border-violet-100 text-[8px] font-serif font-black"
                        >
                          {gz}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="rounded-xl bg-white/90 border border-white px-2.5 py-1.5 font-serif text-[11px] font-black leading-snug break-keep text-center">
                    “겉은 무덤덤해도 속은 불꽃, 결정타 한 방이 있는 팔자”
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[8.5px] text-left">
                    <div className="rounded-lg bg-[#fff7ef] px-2 py-1 border border-orange-100">
                      <span className="block text-[7.5px] font-bold text-orange-600">
                        🥕 횡재 피크
                      </span>
                      <span className="font-extrabold">9월 (94점)</span>
                    </div>
                    <div className="rounded-lg bg-[#fff1f4] px-2 py-1 border border-rose-100">
                      <span className="block text-[7.5px] font-bold text-rose-600">
                        ⚠️ 주의 시기
                      </span>
                      <span className="font-extrabold">2027년 4월</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[8.5px] font-bold text-[#55447a]">
                    <span>#파스텔오라 #달토처방</span>
                    <span className="font-serif font-black tracking-widest">
                      🐇 sajufact.kr
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void runAnalysis("lifetime")}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#5c489b] via-[#c96a8b] to-[#f97316] hover:brightness-105 text-white text-xs sm:text-sm font-black shadow-md transition"
              >
                🥕 990원 사주 보고 내 오라 카드 만들기 →
              </button>
            </div>
          </section>

          {/* ⑥ 자주 묻는 질문 (FAQ 아코디언) */}
          <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3 border border-white/95 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-violet-600 uppercase">
                  FAQ
                </span>
                <h2 className="font-serif text-sm sm:text-base font-black text-[#2b2242]">
                  자주 묻는 질문
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                달토 이용 안내 🐇
              </span>
            </div>

            <div className="space-y-2">
              {HOME_FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={item.q}
                    className="rounded-2xl bg-white/85 border border-violet-100/80 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left text-xs sm:text-sm font-extrabold text-slate-900 hover:bg-violet-50/40 transition"
                    >
                      <span>Q. {item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-violet-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-0.5 text-xs text-slate-600 leading-relaxed border-t border-violet-100/60">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 결제 심사용 사업자 정보 & 약관 푸터 */}
          <footer className="pt-5 pb-4 border-t border-violet-200/60 text-center text-[11px] text-slate-500 space-y-2.5">
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setPolicyModal("terms")}
                className="hover:text-violet-700 underline underline-offset-2"
              >
                이용약관
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setPolicyModal("privacy")}
                className="hover:text-violet-700 underline underline-offset-2 font-extrabold"
              >
                개인정보처리방침
              </button>
            </div>
            <div className="text-[10.5px] text-slate-400 leading-relaxed space-y-0.5 max-w-xl mx-auto">
              <p>
                상호명: 주식회사 사주팩트 | 대표자: 홍길동 | 사업자등록번호: 000-00-00000
              </p>
              <p>
                통신판매업신고번호: 제 2026-서울강남-00000호 | 고객센터: help@sajufact.kr
              </p>
            </div>
            <p className="font-serif tracking-widest text-violet-700 font-bold">
              🐇 sajufact.kr · © SajuFact All rights reserved.
            </p>
          </footer>

          {/* 플로팅 하단 알약 네비게이션 독 */}
          <nav
            aria-label="하단 빠른 메뉴"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-xl border border-violet-100/90 shadow-[0_12px_35px_rgba(60,40,120,0.16)] rounded-full px-6 py-2.5 flex items-center gap-7 sm:gap-9"
          >
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="홈"
              className="flex flex-col items-center gap-0.5 text-slate-900 hover:text-violet-700 transition"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenChat()}
              aria-label="달토 수다방"
              className="relative flex flex-col items-center gap-0.5 text-slate-400 hover:text-rose-500 transition"
            >
              <MessageCircle className="w-5 h-5" />
              {wallet.freeChatTickets > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-2xs">
                  {wallet.freeChatTickets}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => void runAnalysis("today")}
              aria-label="오늘 운세"
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-orange-500 transition"
            >
              <Clover className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingAction(null);
                if (!accountSession?.loggedIn && !activeProfile) {
                  setSocialLoginOpen(true);
                } else {
                  setProfileInitialForm(false);
                  setProfileModalOpen(true);
                }
              }}
              aria-label="로그인 및 내 사주 프로필"
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-violet-600 transition"
            >
              <UserRound className="w-5 h-5" />
            </button>
          </nav>
        </div>
      )}

      <ProfileManagerModal
        open={profileModalOpen}
        session={accountSession}
        profiles={savedProfiles}
        activeProfileId={activeProfile?.id ?? null}
        initialOpenForm={profileInitialForm}
        pendingActionLabel={
          pendingAction?.type === "menu"
            ? `${
                CHUNKY_MENU_CARDS.find((c) => c.id === pendingAction.menu)?.title ??
                "오늘의 운세"
              } 보기`
            : pendingAction?.type === "chat"
            ? "달토 수다방 입장하기"
            : undefined
        }
        onClose={() => {
          setProfileModalOpen(false);
          setProfileInitialForm(false);
          setPendingAction(null);
        }}
        onLogin={(provider, label) => {
          const nextSession: AccountSession = {
            loggedIn: true,
            provider,
            label: label || "달토 회원",
            accountKey: `${provider}_user`,
          };
          setAccountSession(nextSession);
          try {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
          } catch {}
        }}
        onLogout={() => {
          setAccountSession(null);
          try {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          } catch {}
        }}
        onSelectProfile={(prof) => {
          activateSavedProfile(prof);
          setProfileModalOpen(false);
          setProfileInitialForm(false);
          runPendingWithProfile(prof);
        }}
        onSaveProfile={(input) => {
          const nextId = input.id || createProfileId();
          const savedItem: SavedSajuProfile = {
            id: nextId,
            name: input.name,
            relation: input.relation,
            customRelation: input.customRelation,
            gender: input.gender,
            birthDate: input.birthDate,
            calendarType: input.calendarType,
            birthHour: input.birthHour,
            exactTime: input.exactTime,
            birthCity: input.birthCity,
          };
          const nextList = input.id
            ? savedProfiles.map((p) => (p.id === nextId ? savedItem : p))
            : [savedItem, ...savedProfiles];
          setSavedProfiles(nextList);
          try {
            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(nextList));
          } catch {}

          if (!accountSession?.loggedIn) {
            const quickSession: AccountSession = {
              loggedIn: true,
              provider: "quick",
              label: `${savedItem.name}님 수첩`,
              accountKey: `quick_${savedItem.id}`,
            };
            setAccountSession(quickSession);
            try {
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(quickSession));
            } catch {}
          }

          activateSavedProfile(savedItem);
          setProfileModalOpen(false);
          setProfileInitialForm(false);
          runPendingWithProfile(savedItem);
        }}
        onDeleteProfile={(id) => {
          const nextList = savedProfiles.filter((p) => p.id !== id);
          setSavedProfiles(nextList);
          try {
            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(nextList));
          } catch {}
          if (activeProfileId === id) {
            const fallbackId = nextList[0]?.id ?? null;
            setActiveProfileId(fallbackId);
            try {
              if (fallbackId) {
                localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, fallbackId);
              } else {
                localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
              }
            } catch {}
          }
        }}
        onOpenArchive={() => setArchiveOpen(true)}
      />

      <SocialLoginModal
        open={socialLoginOpen}
        onClose={() => setSocialLoginOpen(false)}
        onSelectProvider={(provider, label) => {
          const nextSession: AccountSession = {
            loggedIn: true,
            provider,
            label,
            accountKey: `${provider}_user`,
          };
          setAccountSession(nextSession);
          try {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
          } catch {}
          setSocialLoginOpen(false);

          if (savedProfiles.length === 0) {
            setProfileInitialForm(true);
            setProfileModalOpen(true);
          } else {
            const currentProf =
              savedProfiles.find((p) => p.id === activeProfileId) ??
              savedProfiles[0];
            if (currentProf) {
              runPendingWithProfile(currentProf);
            }
          }
        }}
      />

      <FortuneCatcherModal
        open={catcherModalOpen}
        profile={activeProfile}
        initialDraw={currentProfileDraw}
        onClose={() => setCatcherModalOpen(false)}
        onDrawComplete={(draw) => {
          setDailyDraw(draw);
          try {
            localStorage.setItem(DAILY_DRAW_STORAGE_KEY, JSON.stringify(draw));
          } catch {}
        }}
        onViewMore={() => {
          setCatcherModalOpen(false);
          if (activeProfile) {
            void runAnalysis("today", activeProfile);
          }
        }}
      />

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
          name: activeProfile?.name || wallet.profile.name || "회원",
          gender: activeProfile?.gender || wallet.profile.gender,
          birthDate: activeProfile?.birthDate || wallet.profile.birthDate,
          calendarType: activeProfile?.calendarType || wallet.profile.calendarType,
          birthHour: activeProfile?.birthHour || wallet.profile.birthHour,
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

      {policyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/35 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-violet-100 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-black text-slate-900">
                {policyModal === "terms" ? "사주팩트 이용약관" : "개인정보처리방침"}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2 max-h-64 overflow-y-auto pr-1">
              {policyModal === "terms" ? (
                <>
                  <p>
                    1. 본 서비스(사주팩트)는 입력하신 생년월일시를 바탕으로 만세력 명리 분석 리포트 및 AI 사주 상담을 제공합니다.
                  </p>
                  <p>
                    2. 유료 재화(당근)는 구매일로부터 7일 이내 미사용 잔여 수량에 한해 전액 환불 가능하며, 이미 당근을 사용하여 열람한 디지털 콘텐츠는 청약철회가 제한됩니다.
                  </p>
                  <p>
                    3. 고객센터 문의: help@sajufact.kr
                  </p>
                </>
              ) : (
                <>
                  <p>
                    1. 수집 항목: 이름(닉네임), 성별, 생년월일, 태어난 시간, 지갑 식별 키 및 이용 기록.
                  </p>
                  <p>
                    2. 이용 목적: 정밀 만세력 계산, 당근/무료수다권 잔액 동기화, 보관함 리포트 복원 및 고객 문의 응대.
                  </p>
                  <p>
                    3. 보관 및 파기: 이용자의 삭제 요청 또는 서비스 종료 시 지체 없이 파기합니다.
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPolicyModal(null)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#5c489b] to-[#d96b8a] text-white text-xs font-extrabold"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
