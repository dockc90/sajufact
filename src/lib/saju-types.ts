export type MenuCategory =
  | "newyear2027"
  | "today"
  | "lifetime"
  | "wealth"
  | "love"
  | "compatibility"
  | "daeun"
  | "yeonun"
  | "taekil"
  | "health"
  | "tarot";

export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

export type WorryTopic = "wealth" | "love" | "career" | "relationship" | "health";

export type CalendarType = "solar" | "lunar";

export type GenderType = "female" | "male";

export type PaymentPlan = "single" | "allinone";

export interface SajuInput {
  name: string;
  gender: GenderType;
  birthDate: string; // YYYY-MM-DD
  calendarType: CalendarType;
  birthHour: string; // "unknown" | "0".."23"
  worry: WorryTopic;
  menu: MenuCategory;
  partnerName?: string;
  partnerBirthDate?: string;
  partnerGender?: GenderType;
}

export interface PillarInfo {
  label: string;
  hanja: string;
  hangul: string;
  stemElement: ElementKey;
  branchElement: ElementKey;
}

export interface ElementStat {
  key: ElementKey;
  nameKo: string;
  hanja: string;
  percentage: number;
  count: number;
}

export interface ElementTheme {
  key: ElementKey;
  nameKo: string;
  hanja: string;
  auraLabel: string;
  guardianName: string;
  gradientBg: string;
  cardBgStyle: string;
  accentColor: string;
  badgeBg: string;
  barColor: string;
  goldPrimary: string;
  goldSecondary: string;
  textOnCard: string;
  subTextOnCard: string;
  isDarkCard: boolean;
}

export interface MonthlyScore {
  month: number;
  label: string;
  score: number;
  tag: string;
  note: string;
}

export interface LuckyTalisman {
  missingElement: ElementKey;
  missingElementKo: string;
  luckyColor: string;
  luckyItem: string;
  luckyDirection: string;
  luckyNumber: number;
  talismanTitle: string;
  talismanMantra: string;
}

export interface CompatibilityReport {
  partnerName: string;
  score: number;
  gradeLabel: string;
  headline: string;
  dynamicRole: string;
  conflictPoint: string;
  solutionTip: string;
}

export interface TodaySignalItem {
  label: string;
  tone: "good" | "caution" | "warn";
  summary: string;
}

export interface TodayFortuneReport {
  dateLabel: string;
  todayGanZhiHangul: string;
  todayGanZhiHanja: string;
  relationBadge: string;
  score: number;
  headline: string;
  timeFlow: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  signals: {
    wealth: TodaySignalItem;
    love: TodaySignalItem;
    work: TodaySignalItem;
    condition: TodaySignalItem;
  };
  luckyTime: string;
  luckyDirection: string;
  avoidAction: string;
}

export interface DaeunDecadeItem {
  ageRange: string;
  ganZhi: string;
  elementKo: string;
  score: number;
  keyword: string;
  summary: string;
}

export interface YeonunYearItem {
  year: number;
  ganZhi: string;
  score: number;
  badge: string;
  summary: string;
}

export interface TaekilDateItem {
  dateLabel: string;
  ganZhi: string;
  purpose: string;
  reason: string;
}

export interface LoveReport {
  patternTitle: string;
  attractionTrigger: string;
  goldenTiming: string;
  lovePrescription: string;
}

export interface WalletProfile {
  name: string;
  gender: GenderType;
  birthDate: string;
  calendarType: CalendarType;
  birthHour: string;
}

export interface WalletState {
  walletId: string;
  profile: WalletProfile;
  coins: number; // 복주머니 개수
  freeChatTickets: number; // 매일 밤 11시 리셋 무료 수다권
  lastFreeResetKey: string;
  unlockedReportIds: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  suggestions?: string[];
}

export interface SajuReport {
  id: string;
  createdAt: string;
  input: SajuInput;
  pillars: PillarInfo[];
  dayMasterHanja: string;
  dayMasterHangul: string;
  dayBranchHanja?: string;
  dayBranchHangul?: string;
  relation2027Label?: string;
  elements: ElementStat[];
  dominantElement: ElementKey;
  weakestElement: ElementKey;
  elementDiagnosis: string;
  tierBadge: string;
  percentileText: string;
  oneLineFact: string;
  subHook: string;
  hashtags: string[];
  todayReport?: TodayFortuneReport;
  // Paid sections
  criticalMistake2027: {
    dangerMonth: string;
    title: string;
    detail: string;
    actionRule: string;
  };
  windfallTiming: {
    bestMonth: string;
    moneyRoute: string;
    detail: string;
  };
  coreFactReport: {
    temperament: string;
    moneyLeakHabit: string;
    toxicRelationWarning: string;
  };
  healthReport: {
    vulnerableOrgans: string;
    burnoutPattern: string;
    cautionSeason2027: string;
    dailyPrescription: string;
  };
  daeunReport?: {
    goldenAge: string;
    headline: string;
    decades: DaeunDecadeItem[];
  };
  yeonunReport?: {
    headline: string;
    years: YeonunYearItem[];
  };
  taekilReport?: {
    headline: string;
    avoidDatesNote: string;
    recommendedDates: TaekilDateItem[];
  };
  loveReport?: LoveReport;
  // All-in-one sections
  monthlyFlow: MonthlyScore[];
  talisman: LuckyTalisman;
  compatibility?: CompatibilityReport;
}

export interface TarotCardData {
  id: number;
  nameKo: string;
  nameEn: string;
  roman: string;
  keyword: string;
  factSummary: string;
  actionAdvice: string;
  luckyBoost: string;
  element: ElementKey;
}
