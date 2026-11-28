"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Clover,
  FolderOpen,
  HeartHandshake,
  Home,
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
import {
  TIER_CARD_THEMES,
  type CardTierKey,
} from "@/components/ShareCardStudio";

type ScreenPhase = "home" | "analyzing" | "result";

const WALLET_STORAGE_KEY = "sajufact_wallet_v1";
const PROFILES_STORAGE_KEY = "sajufact_saved_profiles_v1";
const ACTIVE_PROFILE_STORAGE_KEY = "sajufact_active_profile_id_v1";
const SESSION_STORAGE_KEY = "sajufact_account_session_v1";
const DAILY_DRAW_STORAGE_KEY = "sajufact_daily_draw_v1";

const SAJU_CATALOG_ITEMS: Array<{
  id: MenuCategory;
  category: "basic" | "love" | "timing";
  title: string;
  subtitle: string;
  cardTag: string;
  coinCost: number;
  image: string;
  badge?: "BEST" | "NEW" | "인기";
}> = [
  {
    id: "lifetime",
    category: "basic",
    title: "내 사주 원국 풀이",
    subtitle: "타고난 자연 물상 · 기질 · 재물 · 개운 사물 총정리",
    cardTag: "🎴 사주 카드 포함",
    coinCost: 1,
    badge: "BEST",
    image: "/mascot/dalto-basic.jpg",
  },
  {
    id: "newyear2027",
    category: "basic",
    title: "2027 정미년 신년운세",
    subtitle: "월별 상승·주의 흐름과 올해 황금 타이밍",
    cardTag: "🎴 사주 카드 포함",
    coinCost: 1,
    badge: "NEW",
    image: "/mascot/dalto-newyear2027.jpg",
  },
  {
    id: "love",
    category: "love",
    title: "연애·도화살 운세",
    subtitle: "끌리는 인연 유형, 썸·결혼·재회 흐름",
    cardTag: "🎴 사주 카드 포함",
    coinCost: 1,
    image: "/mascot/dalto-love.jpg",
  },
  {
    id: "compatibility",
    category: "love",
    title: "너와 나의 오행 궁합",
    subtitle: "우리 기운은 상생일까 상극일까? 관계 역학 분석",
    cardTag: "🎴 궁합 점수 포함",
    coinCost: 1,
    badge: "인기",
    image: "/mascot/dalto-compat.jpg",
  },
  {
    id: "daeun",
    category: "timing",
    title: "인생 10년 대운",
    subtitle: "10년 주기 인생 전성기와 전환점 스캔",
    cardTag: "🎴 사주 카드 포함",
    coinCost: 2,
    image: "/mascot/dalto-mortar.jpg",
  },
  {
    id: "yeonun",
    category: "timing",
    title: "2026~2028 3년 흐름",
    subtitle: "3개년 커리어·재물 상승곡선 비교",
    cardTag: "🎴 사주 카드 포함",
    coinCost: 1,
    image: "/mascot/dalto-party.jpg",
  },
  {
    id: "taekil",
    category: "timing",
    title: "계약·이직·고백 길일",
    subtitle: "내 일주와 합이 맞는 대박 날짜 3선",
    cardTag: "🎴 사주 카드 포함",
    coinCost: 1,
    image: "/mascot/dalto-mortar.jpg",
  },
];

const HOME_FAQ_ITEMS = [
  {
    q: "달토사주는 다른 사주 사이트와 무엇이 다른가요?",
    a: "딱딱한 한자 풀이 대신 내 사주가 큰 소나무·태양·보석 중 어떤 자연 물상인지, 부족한 오행을 채울 행운 숫자·컬러·사물이 무엇인지 스토리텔링해 드리고 9:16·4:5 달토 사주 카드와 오늘의 카드로 소장할 수 있습니다.",
  },
  {
    q: "태어난 시간을 몰라도 이용할 수 있나요?",
    a: "네, 가능합니다. '시간 모름 (삼주 분석)' 상태에서도 년주·월주·일주 6글자를 기준으로 오행 분포, 2027 정미년 세운, 달토 사주 카드 및 오늘의 카드를 정밀하게 생성해 드립니다.",
  },
  {
    q: "달빛 톡권은 언제 충전되나요?",
    a: "매일 자정(00:00 KST, 새로운 일진이 시작되는 자시)에 달빛 톡권 1장이 자동 충전됩니다. 당근 1개(990원) 또는 달빛 톡권 1장은 꼬리질문 3개로 교환되어 궁금한 점을 3회까지 이어서 질문할 수 있어요.",
  },
  {
    q: "환불 규정은 어떻게 되나요?",
    a: "사용하지 않은 미사용 당근 패키지는 결제일로부터 7일 이내 고객센터(dawn-corp@naver.com / 070-4519-8604)로 요청 시 전액 환불 가능합니다. 이미 당근을 사용해 열람한 디지털 사주 리포트는 콘텐츠 특성상 환불이 제한됩니다.",
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
    chatFollowUpCredits: 0,
    lastFreeResetKey: "",
    unlockedReportIds: [],
  });
  const [countdownLabel, setCountdownLabel] = useState("매일 자정 충전");
  const [catalogFilter, setCatalogFilter] = useState<
    "all" | "basic" | "love" | "timing"
  >("all");

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

  // 파스텔 오라 인스타 카드 쇼케이스 프리뷰 상태 (티어별 SSR/SR/S/A)
  const [showcaseTier, setShowcaseTier] = useState<CardTierKey>("SSR");
  const [showcaseRatio, setShowcaseRatio] = useState<"9:16" | "4:5">("9:16");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [policyModal, setPolicyModal] = useState<"terms" | "privacy" | null>(null);

  const uiDepth =
    (phase !== "home" ? 1 : 0) +
    (policyModal !== null ? 1 : 0) +
    (chargeOpen ? 1 : 0) +
    (archiveOpen ? 1 : 0) +
    (tarotOpen ? 1 : 0) +
    (catcherModalOpen ? 1 : 0) +
    (socialLoginOpen ? 1 : 0) +
    (profileModalOpen ? 1 : 0) +
    (chatOpen ? 1 : 0) +
    (compatSheetOpen ? 1 : 0);

  const pushedDepthRef = useRef(0);
  const ignorePopCountRef = useRef(0);
  const isHandlingPopRef = useRef(false);
  const navStateRef = useRef({
    phase,
    policyModal,
    chargeOpen,
    archiveOpen,
    tarotOpen,
    catcherModalOpen,
    socialLoginOpen,
    profileModalOpen,
    chatOpen,
    compatSheetOpen,
  });

  useEffect(() => {
    navStateRef.current = {
      phase,
      policyModal,
      chargeOpen,
      archiveOpen,
      tarotOpen,
      catcherModalOpen,
      socialLoginOpen,
      profileModalOpen,
      chatOpen,
      compatSheetOpen,
    };
  });

  useEffect(() => {
    const handlePopState = () => {
      if (ignorePopCountRef.current > 0) {
        ignorePopCountRef.current -= 1;
        return;
      }

      pushedDepthRef.current = Math.max(0, pushedDepthRef.current - 1);
      isHandlingPopRef.current = true;

      const cur = navStateRef.current;
      if (cur.policyModal !== null) {
        setPolicyModal(null);
      } else if (cur.chargeOpen) {
        setChargeOpen(false);
      } else if (cur.archiveOpen) {
        setArchiveOpen(false);
      } else if (cur.tarotOpen) {
        setTarotOpen(false);
      } else if (cur.catcherModalOpen) {
        setCatcherModalOpen(false);
      } else if (cur.socialLoginOpen) {
        setSocialLoginOpen(false);
      } else if (cur.profileModalOpen) {
        setProfileModalOpen(false);
        setProfileInitialForm(false);
        setPendingAction(null);
      } else if (cur.chatOpen) {
        setChatOpen(false);
      } else if (cur.compatSheetOpen) {
        setCompatSheetOpen(false);
      } else if (cur.phase !== "home") {
        setPhase("home");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isHandlingPopRef.current) {
      isHandlingPopRef.current = false;
      if (
        uiDepth === 0 &&
        phase === "home" &&
        window.location.search.includes("saved=")
      ) {
        try {
          window.history.replaceState(window.history.state, "", "/");
        } catch {}
      }
      return;
    }

    if (uiDepth > pushedDepthRef.current) {
      const nextUrl =
        phase === "result" && report?.id
          ? `/?saved=${encodeURIComponent(report.id)}`
          : `${window.location.pathname}${window.location.search}`;
      for (let d = pushedDepthRef.current + 1; d <= uiDepth; d += 1) {
        try {
          window.history.pushState({ daltoNav: true, depth: d }, "", nextUrl);
        } catch {}
      }
      pushedDepthRef.current = uiDepth;
    } else if (uiDepth < pushedDepthRef.current) {
      const diff = pushedDepthRef.current - uiDepth;
      pushedDepthRef.current = uiDepth;
      ignorePopCountRef.current += 1;
      window.history.go(-diff);
    } else if (phase === "result" && report?.id) {
      try {
        window.history.replaceState(
          window.history.state,
          "",
          `/?saved=${encodeURIComponent(report.id)}`
        );
      } catch {}
    } else if (
      uiDepth === 0 &&
      phase === "home" &&
      window.location.search.includes("saved=")
    ) {
      try {
        window.history.replaceState(window.history.state, "", "/");
      } catch {}
    }
  }, [uiDepth, phase, report?.id]);

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
    const followUps = wallet.chatFollowUpCredits ?? 0;
    if (followUps > 0) {
      syncWallet({
        ...wallet,
        chatFollowUpCredits: followUps - 1,
      });
      return true;
    }
    if (wallet.freeChatTickets > 0) {
      syncWallet({
        ...wallet,
        freeChatTickets: wallet.freeChatTickets - 1,
        chatFollowUpCredits: 2,
      });
      return true;
    }
    if (wallet.coins > 0) {
      syncWallet({
        ...wallet,
        coins: wallet.coins - 1,
        chatFollowUpCredits: 2,
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
            aria-label="달토사주 홈으로 이동"
            title="홈으로 이동"
            className="group flex items-center gap-2 text-left shrink-0"
          >
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2b1e4c] via-[#4a327a] to-[#7951a3] border border-violet-300/60 shadow-sm flex items-center justify-center p-0.5 group-hover:scale-105 active:scale-95 transition">
              <img
                src="/logo/dalto-logo.png"
                alt="달토사주 로고"
                className="w-8 h-8 object-contain scale-110 brightness-110 contrast-125 saturate-150 drop-shadow-[0_0_5px_rgba(255,225,248,0.7)]"
              />
            </span>
            <span className="font-serif text-base sm:text-lg font-black tracking-tight text-[#1c1b22]">
              달토사주
            </span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-violet-50 border border-violet-100 text-[11px] font-bold text-slate-700 transition whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              보관함
            </button>
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
                title="달빛 톡권으로 1:1 상담 열기"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-rose-100/70 text-rose-700 transition whitespace-nowrap"
              >
                <Ticket className="w-3 h-3 text-rose-500" />
                <span>톡권 {wallet.freeChatTickets}</span>
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
                  <span className="max-w-[116px] sm:max-w-[160px] truncate">
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
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {phase === "home" && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-5 pb-28 space-y-6 relative">
          {/* ① 달토 문라이트 카드 퍼스트 히어로 — 왼쪽: 오늘의 달빛 지수·스토리 / 오른쪽: 인터랙티브 달토 사주 카드 */}
          <section className="moonlight-atelier-bg rounded-[32px] p-5 sm:p-7 text-white shadow-[0_24px_60px_rgba(32,20,68,0.28)] border border-violet-300/20 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* 왼쪽: 브랜드 카피 + 개인화된 오늘의 운세/행동 패널 */}
              <div className="md:col-span-7 text-left space-y-4">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/12 border border-white/20 px-3 py-1 text-[10.5px] font-extrabold text-amber-200">
                    ✨ 오행 물상 사주 · 달토 사주 카드
                  </span>
                  {activeProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingAction(null);
                        setProfileInitialForm(false);
                        setProfileModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-white/95 hover:bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-[#2a1d4f] transition"
                    >
                      <span>
                        🐇 {activeProfile.name} (
                        {activeProfile.customRelation || activeProfile.relation})
                      </span>
                      <span className="text-violet-600">전환</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-black leading-tight text-white tracking-tight">
                    내 사주를 한 장의{" "}
                    <span className="text-amber-200">달토 사주 카드</span>로
                    소장해요
                  </h1>
                  <p className="text-xs sm:text-sm text-violet-100/90 leading-relaxed break-keep">
                    큰 소나무 · 뜨거운 태양 · 영롱한 보석까지—타고난 자연 물상과
                    부족한 기운을 채우는 색·숫자·사물을{" "}
                    <strong className="text-white">9:16·4:5 카드</strong>로
                    담아드려요.
                  </p>
                </div>

                {/* 로그인 / 오늘의 달빛 지수 상태별 인터랙션 카드 */}
                {!accountSession?.loggedIn && !activeProfile ? (
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <FortuneCatcherDevice
                          mode="off"
                          size="sm"
                          onPress={() => setSocialLoginOpen(true)}
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-black text-white">
                          생년월일 한 번 입력하면 바로 완성!
                        </p>
                        <p className="text-[11px] text-violet-100/85 leading-snug break-keep">
                          오늘의 카드(무료)와 나만의 달토 사주 카드를 즉시 만들어
                          보세요.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSocialLoginOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff7a90] to-[#f97316] hover:brightness-105 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        3초 시작 · 내 사주 카드 만들기
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialLoginOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-extrabold transition"
                      >
                        🌕 오늘의 달빛 지수 확인
                      </button>
                    </div>
                  </div>
                ) : !currentProfileDraw || !activeProfile ? (
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <FortuneCatcherDevice
                          mode="idle"
                          size="sm"
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
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-black text-amber-200">
                          {activeProfile?.name || "회원"}님, 오늘의 달빛 지수가
                          열렸어요
                        </p>
                        <p className="text-[11px] text-violet-100/85 leading-snug break-keep">
                          보름달을 눌러 오늘 점수와 부족한 기운을 채울 행운
                          사물을 확인해 보세요.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff7a90] to-[#a855f7] hover:brightness-105 text-white text-xs font-black shadow-md transition"
                      >
                        🌕 오늘의 달빛 지수 뽑기
                      </button>
                      <button
                        type="button"
                        onClick={() => void runAnalysis("lifetime")}
                        className="py-2.5 px-4 rounded-xl bg-white text-[#2a1d4f] hover:bg-amber-50 text-xs font-black transition"
                      >
                        🎴 내 사주 카드 만들기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-200">
                          🍀 {currentProfileDraw.dateDisplay} · 행운지수{" "}
                          {currentProfileDraw.score}점
                        </div>
                        <p className="text-sm sm:text-base font-black text-white leading-snug break-keep">
                          &ldquo;{currentProfileDraw.quote}&rdquo;
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-white/15 border border-white/20 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-100">
                            🎨 {currentProfileDraw.luckyColor.split(/[·&,]/)[0].trim()}
                          </span>
                          <span className="rounded-full bg-white/15 border border-white/20 px-2.5 py-0.5 text-[10.5px] font-bold text-violet-100">
                            🎒 {currentProfileDraw.luckyItem.split(/[·&,]/)[0].trim()}
                          </span>
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
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => void runAnalysis("today", activeProfile)}
                        className="py-2.5 px-3 rounded-xl bg-white text-[#2a1d4f] hover:bg-amber-50 text-xs font-black transition"
                      >
                        ☀️ 오늘의 카드 보기
                      </button>
                      <button
                        type="button"
                        onClick={() => void runAnalysis("lifetime", activeProfile)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ff7a90] to-[#f97316] hover:brightness-105 text-white text-xs font-black transition"
                      >
                        🎴 내 사주 카드 보기
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 오른쪽: 실시간 인터랙티브 달토 사주 카드 쇼케이스 */}
              <div className="md:col-span-5 flex flex-col items-center gap-2.5">
                <div className="flex items-center justify-between gap-1.5 w-full max-w-[276px]">
                  <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
                    {(["SSR", "SR", "S", "A"] as CardTierKey[]).map((tKey) => (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => setShowcaseTier(tKey)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition whitespace-nowrap ${
                          showcaseTier === tKey
                            ? "bg-white text-[#2a1d4f] shadow-xs"
                            : "text-violet-100/80 hover:text-white"
                        }`}
                      >
                        {tKey}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 bg-white/10 p-1 rounded-xl border border-white/15">
                    {(["9:16", "4:5"] as const).map((rId) => (
                      <button
                        key={rId}
                        type="button"
                        onClick={() => setShowcaseRatio(rId)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition whitespace-nowrap ${
                          showcaseRatio === rId
                            ? "bg-amber-300 text-[#2a1d4f]"
                            : "text-violet-100/80 hover:text-white"
                        }`}
                      >
                        {rId}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const previewTheme = TIER_CARD_THEMES[showcaseTier];
                  return (
                    <div
                      className={`${
                        showcaseRatio === "9:16"
                          ? "w-[248px] h-[424px]"
                          : "w-[268px] h-[335px]"
                      } rounded-[24px] relative overflow-hidden border-2 border-white/95 shadow-[0_20px_50px_rgba(12,8,30,0.45)] flex flex-col text-[#2b2242] transition-all duration-300 bg-gradient-to-br ${previewTheme.bg}`}
                    >
                      <div className="relative flex-1 min-h-0 overflow-hidden">
                        <img
                          src={
                            showcaseRatio === "9:16"
                              ? previewTheme.image916
                              : previewTheme.image
                          }
                          alt={`${showcaseTier} 티어 달토 카드 예시`}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="inset-x-0 top-0 px-2.5 pt-2.5 flex items-center justify-between gap-1 pointer-events-none absolute">
                          <span className="inline-flex items-center gap-1 bg-white/92 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold text-[#4b3880] shadow-2xs">
                            💎 영롱한 보석 · 예시
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold shadow-2xs ${previewTheme.accentPill}`}
                          >
                            {previewTheme.sampleBadge}
                          </span>
                        </div>
                        <div
                          className={`absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t ${previewTheme.fadeColor} to-transparent pointer-events-none`}
                        />
                      </div>

                      <div
                        className={`shrink-0 px-2.5 py-2 space-y-1 border-t border-white ${previewTheme.panelBg}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-extrabold ${previewTheme.accentText}`}
                          >
                            예시) 김민지 · 신해(辛亥)일주
                          </span>
                          <span className="text-[8px] font-bold text-slate-500">
                            금(金) 38% 강세
                          </span>
                        </div>
                        <div className="rounded-xl bg-white/92 border border-white px-2 py-1 text-center">
                          <p className="font-serif text-[10px] font-black leading-snug break-keep">
                            “섬세하게 빛나는 영롱한 보석 팔자”
                          </p>
                          <p className="text-[8px] text-slate-600 font-medium leading-snug break-keep mt-0.5">
                            보석이 빛나려면 따뜻한 불(화 6%) 기운을 보완해야
                            빛나요.
                          </p>
                        </div>
                        <div className="grid grid-cols-5 gap-0.5 text-center">
                          {[
                            {
                              label: "목(木)",
                              pct: "18%",
                              cls: "bg-[#eaf9f0] border-[#a7e6c0] text-[#11643b]",
                            },
                            {
                              label: "화(火)",
                              pct: "6%",
                              cls: "bg-[#fff0ee] border-[#ffc1b8] text-[#9b271c]",
                            },
                            {
                              label: "토(土)",
                              pct: "22%",
                              cls: "bg-[#fff7e5] border-[#f4d794] text-[#7c5009]",
                            },
                            {
                              label: "금(金)",
                              pct: "38%",
                              cls: "bg-[#eff5ff] border-[#bed6fb] text-[#1f4287]",
                            },
                            {
                              label: "수(水)",
                              pct: "16%",
                              cls: "bg-[#f3efff] border-[#cfc1fb] text-[#4c2889]",
                            },
                          ].map((el) => (
                            <div
                              key={el.label}
                              className={`rounded-md border px-0.5 py-0.5 ${el.cls}`}
                            >
                              <span className="block text-[6.5px] font-bold leading-tight">
                                {el.label}
                              </span>
                              <span className="block text-[7.5px] font-black leading-tight">
                                {el.pct}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-bold text-[#55447a]">
                          <span>#달토사주카드 #개운사물</span>
                          <span className="font-serif font-black tracking-wider">
                            🐇 daltosaju.com
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* ② 매일 무료 데일리 허브 (오늘의 카드 · 오늘의 타로 · 달토 1:1 상담실) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => void runAnalysis("today")}
              className="text-left glass-card rounded-2xl p-4 border border-amber-200/80 hover:border-amber-300 hover:shadow-md transition flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">☀️</span>
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-black">
                    무료
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900">
                  오늘의 카드 &amp; 일진
                </p>
                <p className="text-[11px] text-slate-500 leading-snug break-keep">
                  점수별 달토 카드 · 오늘 체크/주의
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setTarotOpen(true)}
              className="text-left glass-card rounded-2xl p-4 border border-violet-200/80 hover:border-violet-300 hover:shadow-md transition flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🃏</span>
                  <span className="rounded-full bg-violet-100 text-violet-800 px-2 py-0.5 text-[10px] font-black">
                    무료
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900">
                  오늘의 직감 타로
                </p>
                <p className="text-[11px] text-slate-500 leading-snug break-keep">
                  카드 1장으로 보는 오늘의 핵심 힌트
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-600 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenChat()}
              className="text-left rounded-2xl p-4 bg-gradient-to-r from-[#5c489b] to-[#c96a8b] text-white shadow-md hover:brightness-105 transition flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black text-white">
                    톡권 {wallet.freeChatTickets}장
                  </span>
                  <span className="text-[10px] font-bold text-amber-200">
                    {countdownLabel}
                  </span>
                </div>
                <p className="text-sm font-black text-white">
                  💬 달토 1:1 상담실
                </p>
                <p className="text-[11px] text-white/85 leading-snug break-keep">
                  톡권 1장 · 꼬리질문 3회 상담
                </p>
              </div>
              <MessageCircleHeart className="w-6 h-6 text-amber-200 shrink-0" />
            </button>
          </section>

          {/* ③ 달토 정밀 사주 리포트 카탈로그 (에디토리얼 가로형 카드 + 카테고리 필터) */}
          <section className="space-y-3.5">
            {inviterBanner && (
              <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 flex items-center gap-2 text-xs font-bold shadow-sm">
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>
                  {inviterBanner.name}님이 궁합을 요청했어요! 아래 &lsquo;너와
                  나의 오행 궁합&rsquo;을 눌러 바로 확인해 보세요.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-left">
                <h2 className="font-serif text-lg sm:text-xl font-black text-[#2b2242]">
                  달토 정밀 사주 리포트
                </h2>
                <p className="text-xs text-slate-500">
                  각 리포트마다 오행 분석 풀이와 전용 달토 사주 카드(9:16 · 4:5)가 함께 제공됩니다
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/90 border border-violet-100 p-1 rounded-xl">
                {(
                  [
                    { id: "all", label: "전체" },
                    { id: "basic", label: "기본·신년" },
                    { id: "love", label: "연애·궁합" },
                    { id: "timing", label: "대운·택일" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCatalogFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition whitespace-nowrap ${
                      catalogFilter === f.id
                        ? "bg-[#2a1d4f] text-white shadow-xs"
                        : "text-slate-600 hover:bg-violet-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5">
              {SAJU_CATALOG_ITEMS.filter(
                (item) =>
                  catalogFilter === "all" || item.category === catalogFilter
              ).map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void runAnalysis(item.id)}
                  className="text-left rounded-[24px] bg-white/95 border border-violet-100 hover:border-violet-300 p-2.5 sm:p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-2.5"
                >
                  <div className="relative aspect-square w-full rounded-[18px] overflow-hidden bg-violet-50 border border-violet-100/80">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center"
                    />
                    {item.badge && (
                      <span
                        className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9.5px] font-black text-white shadow-sm ${
                          item.badge === "BEST"
                            ? "bg-rose-500"
                            : item.badge === "NEW"
                            ? "bg-violet-600"
                            : "bg-pink-500"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="px-0.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-[13.5px] sm:text-sm font-black text-slate-900 leading-snug break-keep">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-snug break-keep line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <span className="text-[9.5px] font-bold text-violet-700 truncate">
                        {item.cardTag}
                      </span>
                      <span className="shrink-0 rounded-full bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 text-[10px] font-black">
                        🥕 {item.coinCost} · {(item.coinCost * 990).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}

              {/* Coming Soon 카드 */}
              {catalogFilter === "all" && (
                <div className="text-left rounded-[24px] bg-[#f5f2fb] border border-dashed border-violet-200 p-2.5 sm:p-3 flex flex-col justify-between gap-2.5">
                  <div className="relative aspect-square w-full rounded-[18px] overflow-hidden bg-white">
                    <img
                      src="/mascot/dalto-rabbit.jpg"
                      alt="시험·합격운 준비 중"
                      className="w-full h-full object-cover opacity-55 grayscale-[25%]"
                    />
                    <span className="absolute inset-0 bg-violet-950/20 flex items-center justify-center">
                      <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-black text-violet-700 shadow-xs">
                        SOON
                      </span>
                    </span>
                  </div>
                  <div className="px-0.5 space-y-1 flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-[13.5px] sm:text-sm font-black text-slate-700 leading-snug">
                        시험·합격운
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug break-keep line-clamp-2">
                        수능·자격증·이직 시험 합격 타이밍 스캔 준비 중
                      </p>
                    </div>
                    <span className="inline-block w-fit rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[9.5px] font-extrabold">
                      12월 오픈
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 궁합 상대방 입력 시트 (너와 나의 오행 궁합 선택 시 확장) */}
            {compatSheetOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-pink-50/95 border-2 border-pink-200 p-4 space-y-2.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-pink-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    상대방 정보를 입력하고 오행 궁합 스캔하기 (썸·연인·상사)
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

          {/* ④ 달토사주만의 3단계 오행 스토리텔링 */}
          <section className="glass-card rounded-3xl p-4 sm:p-5 border border-white/95 space-y-3 text-left">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-violet-600 uppercase">
                  HOW IT WORKS
                </span>
                <h2 className="font-serif text-sm sm:text-base font-black text-[#2b2242]">
                  달토사주에서만 만나는 3단계 사주 경험
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void runAnalysis("lifetime")}
                className="text-xs font-extrabold text-violet-700 hover:underline"
              >
                내 사주 물상 바로 보기 →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  step: "01",
                  title: "만세력 오행 정밀 스캔",
                  desc: "생년월일시로 4기둥 한자·한글과 목·화·토·금·수 5원소 비율을 즉시 산출해요.",
                },
                {
                  step: "02",
                  title: "자연 물상 & 보완 사물",
                  desc: "내 일주가 어떤 자연(큰 소나무·태양 등)인지와 부족한 오행을 채울 색·숫자·사물을 알려드려요.",
                },
                {
                  step: "03",
                  title: "9:16·4:5 달토 카드 소장",
                  desc: "점수별 오늘의 카드와 오행 지수가 담긴 사주 카드를 PNG로 저장해 소장·공유하세요.",
                },
              ].map((g) => (
                <div
                  key={g.step}
                  className="rounded-2xl bg-white/90 border border-violet-100/80 p-3.5 space-y-1"
                >
                  <span className="inline-block rounded-full bg-violet-100 text-violet-800 px-2 py-0.5 text-[10px] font-black">
                    STEP {g.step}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    {g.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed break-keep">
                    {g.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ⑤ 달토사주 이용자 후기 롤링 배너 */}
          <section className="space-y-2.5 overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  💬 달토사주 이용자 후기
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 px-2.5 py-0.5 text-[10.5px] font-extrabold">
                  ⭐ 만족도 4.9/5.0
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                누적 사주 카드 생성 148,200+
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
                    <p className="text-[11.5px] text-slate-700 leading-relaxed break-keep">
                      “{rev.text}”
                    </p>
                  </div>
                ))}
              </div>
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
                상호명: 주식회사 새벽시간 | 대표자: 김갑수 | 사업자등록번호: 826-81-02447
              </p>
              <p>
                사업장 소재지: 경기도 남양주시 진접읍 해밀예당1로 50-47, 506호 에이59(리첸타워)
              </p>
              <p>
                고객센터: 070-4519-8604 | 이메일: dawn-corp@naver.com
              </p>
            </div>
            <p className="font-serif tracking-widest text-violet-700 font-bold">
              🐇 daltosaju.com · © 주식회사 새벽시간 All rights reserved.
            </p>
          </footer>

          {/* 모바일 전용 풀폭 라벨 하단 네비게이션 */}
          <nav
            aria-label="모바일 하단 메뉴"
            className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xl border-t border-violet-100/90 shadow-[0_-6px_24px_rgba(42,29,79,0.08)] grid grid-cols-5 py-2 sm:hidden"
          >
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex flex-col items-center justify-center gap-0.5 text-[#2a1d4f]"
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px] font-extrabold">홈</span>
            </button>
            <button
              type="button"
              onClick={() => void runAnalysis("today")}
              className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-amber-600"
            >
              <Clover className="w-4 h-4" />
              <span className="text-[10px] font-bold">오늘 카드</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenChat()}
              className="relative flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-rose-600"
            >
              <MessageCircle className="w-4 h-4" />
              {wallet.freeChatTickets > 0 && (
                <span className="absolute top-0 right-3.5 min-w-[14px] h-3.5 px-1 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                  {wallet.freeChatTickets}
                </span>
              )}
              <span className="text-[10px] font-bold">달토 톡</span>
            </button>
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-violet-700"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-[10px] font-bold">보관함</span>
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
              className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-violet-700"
            >
              <UserRound className="w-4 h-4" />
              <span className="text-[10px] font-bold">내 사주</span>
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
                SAJU_CATALOG_ITEMS.find((c) => c.id === pendingAction.menu)
                  ?.title ?? "오늘의 운세"
              } 보기`
            : pendingAction?.type === "chat"
            ? "달토 1:1 상담실 입장하기"
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
        followUpCredits={wallet.chatFollowUpCredits ?? 0}
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
                {policyModal === "terms" ? "달토사주 이용약관" : "개인정보처리방침"}
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
                    1. 본 서비스(달토사주, 운영사: 주식회사 새벽시간)는 입력하신 생년월일시를 바탕으로 만세력 명리 분석 리포트 및 AI 사주 상담을 제공합니다.
                  </p>
                  <p>
                    2. 유료 재화(당근)는 구매일로부터 7일 이내 미사용 잔여 수량에 한해 전액 환불 가능하며, 이미 당근을 사용하여 열람한 디지털 콘텐츠는 청약철회가 제한됩니다.
                  </p>
                  <p>
                    3. 고객센터 문의: dawn-corp@naver.com / 070-4519-8604
                  </p>
                </>
              ) : (
                <>
                  <p>
                    1. 수집 항목: 이름(닉네임), 성별, 생년월일, 태어난 시간, 지갑 식별 키 및 이용 기록.
                  </p>
                  <p>
                    2. 이용 목적: 정밀 만세력 계산, 당근/달빛 톡권 잔액 동기화, 보관함 리포트 복원 및 고객 문의 응대.
                  </p>
                  <p>
                    3. 보관 및 파기: 이용자의 삭제 요청 또는 서비스 종료 시 지체 없이 파기합니다.
                  </p>
                  <p>
                    4. 개인정보 보호책임자: 김갑수 (문의: dawn-corp@naver.com / 070-4519-8604)
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
