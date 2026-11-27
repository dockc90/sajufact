"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
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
  X,
} from "lucide-react";
import {
  BENCHMARK_REVIEWS,
  BIRTH_HOUR_OPTIONS,
  CORE_SEVEN_MENUS,
  MENU_ITEMS,
  generateSajuReport,
  getKst23ResetCycleKey,
  getNext23KstCountdown,
} from "@/lib/saju-engine";
import type {
  CalendarType,
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
import type { PastelAuraMood } from "@/components/ShareCardStudio";

type ScreenPhase = "home" | "analyzing" | "result";

const WALLET_STORAGE_KEY = "sajufact_wallet_v1";
const RECENT_PROFILES_KEY = "sajufact_recent_profiles_v1";

const MENU_ICON_CIRCLE_BG: Partial<Record<MenuCategory, string>> = {
  lifetime: "bg-gradient-to-br from-[#f3ecff] to-[#fde8f3]",
  newyear2027: "bg-gradient-to-br from-[#ffede4] to-[#ffe4ef]",
  love: "bg-gradient-to-br from-[#ffe8f1] to-[#fff0f6]",
  compatibility: "bg-gradient-to-br from-[#fde7f3] to-[#f3e8ff]",
  daeun: "bg-gradient-to-br from-[#ede9fe] to-[#e0e7ff]",
  yeonun: "bg-gradient-to-br from-[#e8f4ff] to-[#ede9fe]",
  taekil: "bg-gradient-to-br from-[#fff5e4] to-[#ffede4]",
};

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

export default function HomePage() {
  const [phase, setPhase] = useState<ScreenPhase>("home");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<GenderType>("female");
  const [birthDate, setBirthDate] = useState("1996-05-14");
  const [birthQuickInput, setBirthQuickInput] = useState("19960514");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthHour, setBirthHour] = useState<string>("unknown");

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
    coins: 0, // 기본 당근 0개 (충전소에서 1개 990원부터 충전)
    freeChatTickets: 1, // 매일 밤 11시 리셋 무료수다권 1장
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

  // 파스텔 오라 인스타 카드 쇼케이스 프리뷰 상태
  const [showcaseMood, setShowcaseMood] = useState<PastelAuraMood>("lavender");
  const [showcaseRatio, setShowcaseRatio] = useState<"9:16" | "4:5">("9:16");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [policyModal, setPolicyModal] = useState<"terms" | "privacy" | null>(null);

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
      setFormError("달토가 이름을 알 수 있게 이름(닉네임)을 입력해 주세요.");
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
    setChatContext(undefined);
    setChatOpen(true);
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

      {/* 상단 고정 GNB — [ 🥕 당근 0 | 🎟️ 무료수다권 1 ] · 보관함 */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/75 border-b border-white/90">
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
              src="/mascot/dalto-rabbit.jpg"
              alt="달토끼 달토"
              className="w-8 h-8 rounded-2xl object-cover border border-orange-200 shadow-2xs"
            />
            <span className="font-serif text-base sm:text-lg font-black tracking-tight text-[#3d2d66]">
              사주팩트
            </span>
            <span className="hidden xs:inline-block rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[10px] font-extrabold">
              달토끼
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
                <span>무료수다권 {wallet.freeChatTickets}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-violet-50 border border-violet-100 text-slate-700 text-[11px] font-bold transition whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-violet-500" />
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
          {/* ① 달토끼 달토 환영 히어로 + 3초 간편 프로필 */}
          <section className="glass-card rounded-3xl p-4 sm:p-6 border border-white/95 bg-gradient-to-br from-[#fffaf6]/95 via-[#fdf5fc]/90 to-[#fff2ea]/90 space-y-4">
            <div className="flex items-center gap-3.5 sm:gap-5">
              <img
                src="/mascot/dalto-rabbit.jpg"
                alt="달토끼 달토"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-orange-200 shadow-md shrink-0 animate-dalto-float"
              />
              <div className="text-left space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 text-orange-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                  🥕 당근 주면 채찍 + 따뜻한 처방전 · 매일 밤 11시 무료수다권 1장
                </span>
                <h1 className="font-serif text-lg sm:text-2xl font-black text-[#2b2242] leading-snug break-keep">
                  “빈말은 사절! 당근 주면 뼈 때리는 채찍과 따뜻한 처방전을 주는 달토끼, 달토예요 🐇”
                </h1>
                <p className="text-xs text-slate-600">
                  아닌 건 솔직히 짚고, 내 편에서 현실 처방전까지 주는 달빛 사주 상담소
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

            {/* 3초 프로필: 확정되면 파스텔 콤팩트 바, 아니면 입력 폼 */}
            {profileConfirmed && name.trim() ? (
              <div className="rounded-2xl bg-gradient-to-r from-[#f4eeff] via-[#fff5ef] to-[#fdf0f6] border border-violet-200/80 text-slate-900 px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 text-left">
                  <span className="text-[10px] font-extrabold text-violet-700 block">
                    🐇 달토에게 내 원국 등록 완료 · 아래 메뉴를 누르면 바로 열려요
                  </span>
                  <p className="text-xs sm:text-sm font-black truncate mt-0.5 text-[#2b2242]">
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
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-white/90 hover:bg-white border border-violet-200 px-3 py-1.5 text-xs font-bold text-violet-700 transition shadow-2xs"
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

                <div className="pt-1 space-y-1.5">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5c489b] via-[#c96a8b] to-[#f97316] hover:brightness-105 text-white text-sm font-black shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <span>내 사주 스캔하고 무료 수다권 쓰기 →</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    프로필 저장 시 7종 메뉴와 달토 수다방을 바로 이용할 수 있어요.
                  </p>
                </div>
              </form>
            )}
          </section>

          {/* ② 매일 리텐션 2단 배너: 달토 AI 수다방 + 오늘의 무료 일진/타로 */}
          <section className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleOpenChat()}
              className="sm:col-span-7 text-left rounded-3xl p-5 bg-gradient-to-br from-[#5c489b] via-[#8b5fbf] to-[#e6849c] text-white shadow-xl border border-white/40 transition flex items-center justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/25 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    매일 밤 11시 무료 1장
                  </span>
                  <span className="text-[10px] font-bold text-amber-100">
                    {countdownLabel}
                  </span>
                </div>
                <h2 className="font-serif text-base sm:text-lg font-black text-white">
                  💬 달토에게 무엇이든 물어보세요
                </h2>
                <p className="text-xs text-white/90 leading-relaxed">
                  내 만세력을 기억한 달토와 1:1 사주 채팅 (현재 무료수다권{" "}
                  <strong className="text-amber-200">{wallet.freeChatTickets}장</strong>)
                </p>
              </div>
              <MessageCircleHeart className="w-9 h-9 text-amber-200 shrink-0" />
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
                    오늘 점수 · 금지 행동
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
                    직감으로 1장 뽑기
                  </p>
                </div>
              </motion.button>
            </div>
          </section>

          {/* ③ 초세분화 7종 메뉴 아이콘 그리드 + Coming Soon */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#3b2d66] flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-orange-500" />
                🥕 당근으로 열어보는 7종 정밀 사주 메뉴
              </h2>
              <button
                type="button"
                onClick={() => setChargeOpen(true)}
                className="text-[11px] font-bold text-orange-600 hover:underline"
              >
                당근 충전하기 →
              </button>
            </div>

            {/* 궁합 상대방 입력 시트 (궁합 카드 선택 시 확장) */}
            {compatSheetOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-pink-50/90 border-2 border-pink-200 p-4 space-y-2.5 text-left"
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
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-105 text-white text-xs font-extrabold transition"
                  >
                    궁합 스캔 시작 →
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sevenGridMenus.map((item) => {
                const isBest = item.id === "lifetime";
                const isNew = item.id === "newyear2027";
                const pricePillClass =
                  item.coinCost >= 2
                    ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200/90"
                    : "bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 border border-orange-200/90";
                const iconCircleBg =
                  MENU_ICON_CIRCLE_BG[item.id] ?? "bg-violet-50";

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void runAnalysis(item.id)}
                    className={`relative text-left glass-card rounded-3xl p-3.5 sm:p-4 transition hover:shadow-lg flex flex-col justify-between gap-2.5 border ${
                      isNew
                        ? "border-rose-200 bg-gradient-to-br from-[#fff5f5]/95 to-white"
                        : isBest
                        ? "border-violet-200 bg-gradient-to-br from-[#f8f3ff]/95 to-white"
                        : "border-white/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border border-white shadow-2xs shrink-0 ${iconCircleBg}`}
                      >
                        {item.emoji}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        {(isBest || isNew) && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide text-white shadow-2xs ${
                              isBest
                                ? "bg-rose-500"
                                : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            }`}
                          >
                            {isBest ? "BEST" : "NEW"}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${pricePillClass}`}
                        >
                          🥕 {item.coinCost}당근
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                        {item.subtitle}
                      </p>
                    </div>
                  </motion.button>
                );
              })}

              {/* Coming Soon 카드 */}
              <div className="text-left rounded-3xl p-3.5 sm:p-4 border border-dashed border-violet-200 bg-white/55 flex flex-col justify-between gap-2.5 opacity-80">
                <div className="flex items-start justify-between">
                  <span className="w-11 h-11 rounded-full bg-slate-100 border border-white flex items-center justify-center text-xl shadow-2xs">
                    🎓
                  </span>
                  <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[9.5px] font-bold flex items-center gap-0.5">
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

          {/* ⑤ 사주팩트만의 무기: 파스텔 오라 스타일 인스타그램 공유 카드 쇼케이스 */}
          <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3.5 border border-white/95">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-left">
                <span className="text-[10px] font-extrabold tracking-widest text-violet-600 uppercase">
                  PASTEL AURA CARD
                </span>
                <h2 className="font-serif text-sm sm:text-base font-black text-[#2b2242]">
                  리포트마다 함께 받는 파스텔 오라 인스타그램 공유 카드
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-violet-100/70 p-1 rounded-2xl">
                {(
                  [
                    { id: "lavender", label: "🌸 라벤더 피치" },
                    { id: "mooncream", label: "🌙 달빛 크림" },
                    { id: "element", label: "✨ 오행 맞춤" },
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
                글자 겹침 0% · 고화질 PNG 1클릭 저장
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6 flex justify-center">
                <div
                  className={`${
                    showcaseRatio === "9:16" ? "w-[238px] h-[365px]" : "w-[254px] h-[310px]"
                  } rounded-[26px] p-3 relative overflow-hidden border-2 border-white shadow-xl flex flex-col justify-between text-[#2b2242] transition-all duration-300 ${
                    showcaseMood === "lavender"
                      ? "bg-gradient-to-br from-[#f6e8ff] via-[#fff0eb] to-[#fce7f3]"
                      : showcaseMood === "mooncream"
                      ? "bg-gradient-to-br from-[#fff6e5] via-[#fff2ec] to-[#f4ecff]"
                      : "bg-gradient-to-br from-[#eef7ff] via-[#f7ecff] to-[#fff1ee]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 bg-white/85 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold text-[#4b3880] shadow-2xs">
                      🐇 달토 오라 카드
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white px-2 py-0.5 text-[8.5px] font-extrabold">
                      TIER: S · 상위 8%
                    </span>
                  </div>

                  {showcaseRatio === "9:16" && (
                    <div className="flex justify-center my-0.5">
                      <div className="relative">
                        <img
                          src="/mascot/dalto-rabbit.jpg"
                          alt="달토끼 달토"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                        />
                        <span className="absolute -top-1 -right-1.5 rounded-full bg-white border border-orange-200 px-1 text-[9px] shadow-xs">
                          🥕
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-white/82 backdrop-blur-md rounded-2xl border border-white p-2.5 space-y-1.5 shadow-2xs my-auto">
                    {showcaseRatio === "4:5" ? (
                      <div className="flex items-center gap-2">
                        <img
                          src="/mascot/dalto-rabbit.jpg"
                          alt="달토끼 달토"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-[9px] font-extrabold text-violet-700 text-left truncate">
                            김민지 · 신해(辛亥)일주
                          </p>
                          <div className="grid grid-cols-4 gap-0.5 text-center">
                            {["庚午", "庚辰", "辛亥", "癸巳"].map((gz) => (
                              <div
                                key={gz}
                                className="rounded bg-[#fdf8ff] border border-violet-100 py-0.5 text-[9px] font-serif font-black"
                              >
                                {gz}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-[9.5px] font-extrabold text-violet-700 text-left">
                          김민지 · 신해(辛亥)일주
                        </p>
                        <div className="grid grid-cols-4 gap-1 text-center">
                          {["庚午", "庚辰", "辛亥", "癸巳"].map((gz) => (
                            <div
                              key={gz}
                              className="rounded-lg bg-[#fdf8ff] border border-violet-100 py-0.5 text-[10px] font-serif font-black"
                            >
                              {gz}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <p className="font-serif text-[11px] font-black leading-snug break-keep text-center">
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
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-bold text-[#55447a]">
                    <span>#파스텔오라 #달토처방</span>
                    <span className="font-serif font-black tracking-widest">
                      🐇 sajufact.kr
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6 space-y-2.5 text-left">
                <div className="rounded-2xl bg-white/85 border border-white p-3.5 space-y-1 shadow-2xs">
                  <p className="text-xs font-extrabold text-slate-900">
                    🥕 1. 당근 1개로 리포트 + 파스텔 오라 인스타 카드까지
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    귀여운 달토와 몽글몽글한 라벤더·피치·크림 파스텔 오라 카드를 9:16 스토리·4:5 피드로 PNG 저장하세요.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/85 border border-white p-3.5 space-y-1 shadow-2xs">
                  <p className="text-xs font-extrabold text-slate-900">
                    🐇 2. 당근 주면 뼈 때리는 채찍 + 따뜻한 처방전까지
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    리포트에 담긴 내 원국을 기억한 채로 달토 수다방에서 연애·이직·재물 꼬리 질문에 끝까지 답해줍니다.
                  </p>
                </div>
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
