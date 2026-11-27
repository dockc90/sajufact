export type MenuCategory =
  | "newyear2027"
  | "lifetime"
  | "wealth"
  | "compatibility"
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

export interface SajuReport {
  id: string;
  createdAt: string;
  input: SajuInput;
  pillars: PillarInfo[];
  dayMasterHanja: string;
  dayMasterHangul: string;
  elements: ElementStat[];
  dominantElement: ElementKey;
  weakestElement: ElementKey;
  elementDiagnosis: string;
  tierBadge: string;
  percentileText: string;
  oneLineFact: string;
  subHook: string;
  hashtags: string[];
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
