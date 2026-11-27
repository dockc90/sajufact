import { Lunar, Solar } from "lunar-javascript";
import type {
  CalendarType,
  CompatibilityReport,
  DaeunDecadeItem,
  DailyCatcherDraw,
  ElementKey,
  ElementStat,
  ElementTheme,
  LoveReport,
  MenuCategory,
  MonthlyScore,
  PillarInfo,
  SajuInput,
  SajuReport,
  SavedSajuProfile,
  TaekilDateItem,
  TarotCardData,
  TodayFortuneReport,
  TodaySignalItem,
  WorryTopic,
  YeonunYearItem,
} from "./saju-types";

export const MENU_ITEMS: Array<{
  id: MenuCategory;
  badge: string;
  badgeStyle: string;
  title: string;
  subtitle: string;
  emoji: string;
  coinCost: number;
  highlight?: boolean;
}> = [
  {
    id: "lifetime",
    badge: "기본 사주 · 1개",
    badgeStyle: "bg-slate-900 text-amber-200",
    title: "기본 사주 원국",
    subtitle: "타고난 기질, 돈 새는 습관, 피해야 할 인연",
    emoji: "⚡",
    coinCost: 1,
  },
  {
    id: "newyear2027",
    badge: "HOT · 1개",
    badgeStyle: "bg-rose-500/90 text-white",
    title: "2027 정미년 신년운세",
    subtitle: "월별 재물·이직·피해야 할 시기 정밀 분석",
    emoji: "🔥",
    coinCost: 1,
    highlight: true,
  },
  {
    id: "love",
    badge: "솔로·연애 · 1개",
    badgeStyle: "bg-pink-500/90 text-white",
    title: "내 사주 연애운",
    subtitle: "끌리는 이성 유형, 도화살 시기, 연애 처방",
    emoji: "💘",
    coinCost: 1,
  },
  {
    id: "compatibility",
    badge: "바이럴 1위 · 1개",
    badgeStyle: "bg-rose-600/90 text-white",
    title: "연애·인간 궁합 스캔",
    subtitle: "썸·연인·직장상사 속마음 & 관계 역학 스캔",
    emoji: "💕",
    coinCost: 1,
  },
  {
    id: "daeun",
    badge: "인생 10년 · 2개",
    badgeStyle: "bg-amber-600/95 text-white",
    title: "인생 10년 대운 풀이",
    subtitle: "10년마다 바뀌는 황금 대운 & 인생 전성기",
    emoji: "🌌",
    coinCost: 2,
  },
  {
    id: "yeonun",
    badge: "3년 흐름 · 1개",
    badgeStyle: "bg-indigo-600/90 text-white",
    title: "2026~2028 연운 스캔",
    subtitle: "올해·내년·후년 3년간 커리어·재물 상승곡선",
    emoji: "📆",
    coinCost: 1,
  },
  {
    id: "taekil",
    badge: "길일 추천 · 1개",
    badgeStyle: "bg-emerald-700/90 text-white",
    title: "계약·이직·연애 택일",
    subtitle: "계약·면접·고백·이사하기 가장 좋은 대박 길일",
    emoji: "🗓️",
    coinCost: 1,
  },
  {
    id: "wealth",
    badge: "재물·이직 · 1개",
    badgeStyle: "bg-amber-700/90 text-white",
    title: "재물·직업·천직운",
    subtitle: "월급 vs 사업 루트, 연봉 점프 타이밍",
    emoji: "💰",
    coinCost: 1,
  },
  {
    id: "health",
    badge: "체질·멘탈 · 1개",
    badgeStyle: "bg-teal-600/90 text-white",
    title: "건강·체력·번아웃",
    subtitle: "타고난 취약 장기, 멘탈 번아웃 신호, 개운 루틴",
    emoji: "💪",
    coinCost: 1,
  },
  {
    id: "today",
    badge: "무료 · 매일 리셋",
    badgeStyle: "bg-amber-500/95 text-white",
    title: "오늘의 일진 운세",
    subtitle: "오늘 일진 간지와 시간대별 흐름·행동 지침",
    emoji: "☀️",
    coinCost: 0,
  },
  {
    id: "tarot",
    badge: "100% FREE",
    badgeStyle: "bg-violet-600/90 text-white",
    title: "오늘의 1장 타로",
    subtitle: "카드 1장으로 보는 오늘의 핵심 메시지",
    emoji: "🃏",
    coinCost: 0,
  },
];

export const CORE_SEVEN_MENUS: MenuCategory[] = [
  "lifetime",
  "newyear2027",
  "love",
  "compatibility",
  "daeun",
  "yeonun",
  "taekil",
];

export const BENCHMARK_REVIEWS = [
  {
    user: "김*연 · 28세 직장인",
    tag: "2027 신년운세 + 달토 수다방",
    text: "빈말 없이 4월 계약서 조심하라고 뼈 때려주고 바로 따뜻한 처방전 주는 거 진짜 눈물 남… 달토랑 톡하다 시간 순삭됐어요 🐇",
  },
  {
    user: "박*준 · 32세 마케터",
    tag: "10년 대운 + 파스텔 오라 카드",
    text: "당근 바구니 하나 충전해 두니 궁금할 때마다 1클릭으로 열리고, 라벤더 피치 9:16 오라 카드 인스타 스토리 올리자마자 DM 폭주함ㅋㅋ",
  },
  {
    user: "이*은 · 26세 프리랜서",
    tag: "연애·궁합 스캔",
    text: "썸남이랑 궁합 봤는데 누가 을인지 1초 만에 짚어줌ㅋㅋ 밤 11시마다 무료수다권 들어와서 자기 전에 달토 만나러 매일 와요.",
  },
  {
    user: "최*훈 · 34세 개발자",
    tag: "계약·이직 택일",
    text: "기계적인 복붙 답장이 아니라 내 원국이랑 십성 비율 짚어가면서 연봉 협상 날짜까지 딱 찍어주니까 신뢰도가 다름.",
  },
  {
    user: "정*아 · 30세 디자이너",
    tag: "기본 사주 + 4:5 오라 피드",
    text: "파스텔 톤 몽글몽글해서 UI가 너무 귀엽고, 달토 채찍 맞고도 기분 좋아지는 현실 처방전이라 4:5 오라 카드 바로 저장했어요 🥕✨",
  },
];

// 매일 밤 11시(23:00 KST) 기준 리셋 사이클 키 반환
export function getKst23ResetCycleKey(now = new Date()): string {
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  // 23시(밤 11시) 이전이면 전날 밤 11시 사이클에 속함
  if (kst.getUTCHours() < 23) {
    kst.setUTCDate(kst.getUTCDate() - 1);
  }
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}-23h`;
}

export function getNext23KstCountdown(now = new Date()): string {
  const kstNowMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstNowMs);
  const next = new Date(kstNowMs);
  next.setUTCHours(23, 0, 0, 0);
  if (kst.getUTCHours() >= 23) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  const diffMin = Math.max(1, Math.floor((next.getTime() - kstNowMs) / 60000));
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `${h}시간 ${m}분 후 밤 11시 충전`;
}

export const BIRTH_HOUR_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "unknown", label: "시간 모름 (삼주 분석)" },
  { value: "0", label: "자시 (23:30 ~ 01:29)" },
  { value: "2", label: "축시 (01:30 ~ 03:29)" },
  { value: "4", label: "인시 (03:30 ~ 05:29)" },
  { value: "6", label: "묘시 (05:30 ~ 07:29)" },
  { value: "8", label: "진시 (07:30 ~ 09:29)" },
  { value: "10", label: "사시 (09:30 ~ 11:29)" },
  { value: "12", label: "오시 (11:30 ~ 13:29)" },
  { value: "14", label: "미시 (13:30 ~ 15:29)" },
  { value: "16", label: "신시 (15:30 ~ 17:29)" },
  { value: "18", label: "유시 (17:30 ~ 19:29)" },
  { value: "20", label: "술시 (19:30 ~ 21:29)" },
  { value: "22", label: "해시 (21:30 ~ 23:29)" },
];

export const WORRY_OPTIONS: Array<{ value: WorryTopic; label: string; emoji: string }> = [
  { value: "wealth", label: "재물·횡재", emoji: "💸" },
  { value: "love", label: "연애·결혼", emoji: "💘" },
  { value: "career", label: "이직·커리어", emoji: "🚀" },
  { value: "relationship", label: "인간관계·구설", emoji: "🗡️" },
  { value: "health", label: "건강·번아웃", emoji: "🏥" },
];

export const GUARDIAN_BEAST_META: Record<
  ElementKey,
  {
    nameKo: string;
    hanja: string;
    epithet: string;
    image: string;
    spiritQuote: string;
    babyNameKo: string;
    babyEpithet: string;
    babyImage: string;
    babyQuote: string;
  }
> = {
  wood: {
    nameKo: "청룡",
    hanja: "靑龍",
    epithet: "새 판을 여는 푸른 수호신",
    image: "/guardians/wood-guardian.jpg",
    spiritQuote: "막힌 운을 뚫고 도약하는 성장의 신수",
    babyNameKo: "아기 청룡",
    babyEpithet: "여의주를 품은 행운 새싹",
    babyImage: "/guardians/wood-baby.jpg",
    babyQuote: "작은 시작이 큰 복으로 쑥쑥 자라나는 기운",
  },
  fire: {
    nameKo: "주작",
    hanja: "朱雀",
    epithet: "빛과 명예를 부르는 불사조",
    image: "/guardians/fire-guardian.jpg",
    spiritQuote: "존재감과 인기를 끌어당기는 태양의 신수",
    babyNameKo: "아기 주작",
    babyEpithet: "반짝이는 불꽃 애교 요정",
    babyImage: "/guardians/fire-baby.jpg",
    babyQuote: "어디서나 사랑받고 주인공이 되는 따뜻한 기운",
  },
  earth: {
    nameKo: "황룡 기린",
    hanja: "黃龍 麒麟",
    epithet: "만금을 품은 황금 대지 수호신",
    image: "/guardians/earth-guardian.jpg",
    spiritQuote: "재물과 인연을 지켜주는 재고(財庫)의 신수",
    babyNameKo: "아기 황룡",
    babyEpithet: "황금 구름 위 복덩이",
    babyImage: "/guardians/earth-baby.jpg",
    babyQuote: "통장과 마음을 든든하게 채워주는 복록의 기운",
  },
  metal: {
    nameKo: "백호",
    hanja: "白虎",
    epithet: "결단으로 승부하는 은빛 맹호",
    image: "/guardians/metal-guardian.jpg",
    spiritQuote: "악연을 끊고 정상을 쟁취하는 승부의 신수",
    babyNameKo: "아기 백호",
    babyEpithet: "금방울 찬 똑똑한 맹호",
    babyImage: "/guardians/metal-baby.jpg",
    babyQuote: "잡음은 막아주고 딱 필요한 행운만 무는 기운",
  },
  water: {
    nameKo: "현무",
    hanja: "玄武",
    epithet: "심연과 별빛의 지혜 수호신",
    image: "/guardians/water-guardian.jpg",
    spiritQuote: "숨은 기회와 횡재수를 읽는 지혜의 신수",
    babyNameKo: "아기 현무",
    babyEpithet: "별빛 물방울을 모으는 밤 지킴이",
    babyImage: "/guardians/water-baby.jpg",
    babyQuote: "조용히 횡재와 귀인을 끌어당기는 영리한 기운",
  },
};

export function toShortCardFact(fact: string, maxLen = 40): string {
  const cleaned = fact
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/^[^—]+—\s*/, "")
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

export const ELEMENT_THEMES: Record<ElementKey, ElementTheme> = {
  wood: {
    key: "wood",
    nameKo: "목(木)",
    hanja: "木",
    auraLabel: "에메랄드 민트 · 골드 오라",
    guardianName: "청룡(靑龍)의 성장 기운",
    gradientBg: "from-emerald-200/85 via-teal-100/75 to-amber-100/85",
    cardBgStyle:
      "linear-gradient(145deg, #d7f5e8 0%, #c6eee4 42%, #f4ebd0 100%)",
    accentColor: "#0f766e",
    badgeBg: "bg-emerald-900/90 text-amber-200",
    barColor: "from-emerald-500 to-teal-400",
    goldPrimary: "#c59b38",
    goldSecondary: "#8c681c",
    textOnCard: "#0f2e28",
    subTextOnCard: "#2b594e",
    isDarkCard: false,
  },
  fire: {
    key: "fire",
    nameKo: "화(火)",
    hanja: "火",
    auraLabel: "피치 로즈 · 라벤더 오라",
    guardianName: "주작(朱雀)의 발산 기운",
    gradientBg: "from-rose-200/85 via-orange-100/80 to-purple-200/85",
    cardBgStyle:
      "linear-gradient(145deg, #ffd8d2 0%, #ffe6d5 44%, #e8d7ff 100%)",
    accentColor: "#be123c",
    badgeBg: "bg-rose-950/90 text-amber-200",
    barColor: "from-rose-500 to-amber-400",
    goldPrimary: "#c4943a",
    goldSecondary: "#966524",
    textOnCard: "#38121f",
    subTextOnCard: "#6f3347",
    isDarkCard: false,
  },
  earth: {
    key: "earth",
    nameKo: "토(土)",
    hanja: "土",
    auraLabel: "웜 베이지 · 샴페인 골드 오라",
    guardianName: "황룡(黃龍)의 중심 기운",
    gradientBg: "from-amber-200/85 via-stone-100/80 to-yellow-100/85",
    cardBgStyle:
      "linear-gradient(145deg, #f3e4cd 0%, #f7f0e4 46%, #ebd29d 100%)",
    accentColor: "#92400e",
    badgeBg: "bg-stone-900/90 text-amber-200",
    barColor: "from-amber-500 to-yellow-500",
    goldPrimary: "#b38328",
    goldSecondary: "#7d5714",
    textOnCard: "#2f2213",
    subTextOnCard: "#664e32",
    isDarkCard: false,
  },
  metal: {
    key: "metal",
    nameKo: "금(金)",
    hanja: "金",
    auraLabel: "실버 펄 · 아이스블루 오라",
    guardianName: "백호(白虎)의 결단 기운",
    gradientBg: "from-slate-200/90 via-sky-100/80 to-indigo-100/85",
    cardBgStyle:
      "linear-gradient(145deg, #e7edf5 0%, #f5f7fb 45%, #d6e7fa 100%)",
    accentColor: "#1e3a8a",
    badgeBg: "bg-slate-900/90 text-sky-100",
    barColor: "from-slate-500 to-sky-400",
    goldPrimary: "#b59449",
    goldSecondary: "#7a6636",
    textOnCard: "#111b2e",
    subTextOnCard: "#3d4d6b",
    isDarkCard: false,
  },
  water: {
    key: "water",
    nameKo: "수(水)",
    hanja: "水",
    auraLabel: "미드나잇 인디고 · 바이올렛 오라",
    guardianName: "현무(玄武)의 지혜 기운",
    gradientBg: "from-indigo-300/85 via-purple-200/80 to-slate-300/85",
    cardBgStyle:
      "linear-gradient(145deg, #1b1f44 0%, #2d255b 48%, #472d6e 100%)",
    accentColor: "#c4b5fd",
    badgeBg: "bg-amber-300/95 text-slate-950",
    barColor: "from-indigo-500 to-violet-400",
    goldPrimary: "#f0d285",
    goldSecondary: "#c49c42",
    textOnCard: "#f8f5ff",
    subTextOnCard: "#cbc3e8",
    isDarkCard: true,
  },
};

const HANJA_TO_HANGUL: Record<string, string> = {
  // 천간
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
  // 지지
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

const CHAR_ELEMENT_MAP: Record<string, ElementKey> = {
  // 천간 오행
  甲: "wood", 乙: "wood",
  丙: "fire", 丁: "fire",
  戊: "earth", 己: "earth",
  庚: "metal", 辛: "metal",
  壬: "water", 癸: "water",
  // 지지 오행
  寅: "wood", 卯: "wood",
  巳: "fire", 午: "fire",
  辰: "earth", 戌: "earth", 丑: "earth", 未: "earth",
  申: "metal", 酉: "metal",
  亥: "water", 子: "water",
};

const ELEMENT_META: Record<ElementKey, { nameKo: string; hanja: string }> = {
  wood: { nameKo: "목", hanja: "木" },
  fire: { nameKo: "화", hanja: "火" },
  earth: { nameKo: "토", hanja: "土" },
  metal: { nameKo: "금", hanja: "金" },
  water: { nameKo: "수", hanja: "水" },
};

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function toHangul(hanja: string): string {
  return hanja
    .split("")
    .map((ch) => HANJA_TO_HANGUL[ch] ?? ch)
    .join("");
}

function calculatePillars(input: SajuInput): {
  pillars: PillarInfo[];
  dayMasterHanja: string;
  dayMasterHangul: string;
  dayBranchHanja: string;
  dayBranchHangul: string;
  elements: ElementStat[];
  dominantElement: ElementKey;
  weakestElement: ElementKey;
} {
  const [yStr, mStr, dStr] = (input.birthDate || "1996-05-14").split("-");
  const year = Math.min(2026, Math.max(1940, Number(yStr) || 1996));
  const month = Math.min(12, Math.max(1, Number(mStr) || 5));
  const day = Math.min(31, Math.max(1, Number(dStr) || 14));
  const hour =
    input.birthHour === "unknown" ? 12 : Math.min(23, Math.max(0, Number(input.birthHour) || 12));

  let ec;
  try {
    if (input.calendarType === "lunar") {
      ec = Lunar.fromYmdHms(year, month, Math.min(29, day), hour, 0, 0).getEightChar();
    } else {
      ec = Solar.fromYmdHms(year, month, day, hour, 0, 0).getLunar().getEightChar();
    }
  } catch {
    ec = Solar.fromYmdHms(year, month, Math.min(28, day), hour, 0, 0).getLunar().getEightChar();
  }

  const rawPillars = [
    { label: "시주", hanja: input.birthHour === "unknown" ? "미상" : ec.getTime() },
    { label: "일주", hanja: ec.getDay() },
    { label: "월주", hanja: ec.getMonth() },
    { label: "연주", hanja: ec.getYear() },
  ];

  const counts: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  const pillars: PillarInfo[] = rawPillars.map((p) => {
    if (p.hanja === "미상") {
      return {
        label: p.label,
        hanja: "未詳",
        hangul: "미상",
        stemElement: "earth",
        branchElement: "earth",
      };
    }
    const stem = p.hanja[0];
    const branch = p.hanja[1];
    const stemEl = CHAR_ELEMENT_MAP[stem] ?? "earth";
    const branchEl = CHAR_ELEMENT_MAP[branch] ?? "earth";
    // 일간(본원)에 가중치 1.4, 월지(계절 기운)에 가중치 1.3 부여해 실전 사주 강약과 유사하게 반영
    counts[stemEl] += p.label === "일주" ? 1.4 : 1;
    counts[branchEl] += p.label === "월주" ? 1.3 : 1;

    return {
      label: p.label,
      hanja: p.hanja,
      hangul: toHangul(p.hanja),
      stemElement: stemEl,
      branchElement: branchEl,
    };
  });

  const total = Object.values(counts).reduce((acc, v) => acc + v, 0) || 1;
  const keys: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

  const rawPercentages = keys.map((k) => ({
    key: k,
    exact: (counts[k] / total) * 100,
    count: Math.round(counts[k] * 10) / 10,
  }));

  // 합계 100% 보정
  let sumFloor = 0;
  const floored = rawPercentages.map((item) => {
    const f = Math.floor(item.exact);
    sumFloor += f;
    return { ...item, floor: f, rem: item.exact - f };
  });
  const remainder = 100 - sumFloor;
  const sortedByRem = [...floored].sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < remainder; i++) {
    sortedByRem[i].floor += 1;
  }

  const elements: ElementStat[] = keys.map((k) => {
    const found = sortedByRem.find((x) => x.key === k)!;
    return {
      key: k,
      nameKo: ELEMENT_META[k].nameKo,
      hanja: ELEMENT_META[k].hanja,
      percentage: found.floor,
      count: found.count,
    };
  });

  const sortedByStrength = [...elements].sort((a, b) => b.percentage - a.percentage);
  const dominantElement = sortedByStrength[0].key;
  const weakestElement = sortedByStrength[sortedByStrength.length - 1].key;

  const dayHanja = ec.getDay()[0] || "丙";
  const dayBranchHanja = ec.getDay()[1] || "午";

  return {
    pillars,
    dayMasterHanja: dayHanja,
    dayMasterHangul: HANJA_TO_HANGUL[dayHanja] ?? "병",
    dayBranchHanja,
    dayBranchHangul: HANJA_TO_HANGUL[dayBranchHanja] ?? "오",
    elements,
    dominantElement,
    weakestElement,
  };
}

const ONE_LINE_FACTS: Record<ElementKey, Record<WorryTopic, string[]>> = {
  wood: {
    wealth: [
      "아이디어는 대박인데 실행 직전에 남 좋은 일만 시키는 팔자",
      "돈은 잘 버는데 '가치 소비'라는 명분으로 통장이 텅 비는 타입",
    ],
    love: [
      "상대방 성장시켜주다 정작 본인은 지쳐서 손절 치는 연애 패턴",
      "다정한 척하지만 선 넘으면 0.1초 만에 마음의 문 닫는 철벽러",
    ],
    career: [
      "남 밑에서 시키는 일만 하면 3년 안에 번아웃 와서 사표 쓰는 기질",
      "기획력·추진력은 상위 5%인데 정치질에 휘말려 손해 보는 타입",
    ],
    relationship: [
      "속으로 다 참다가 한 번 터지면 상대가 꼼짝 못 하게 정곡을 찌르는 스타일",
      "만만한 호구로 보이기 싫어서 괜히 센 척하다 피곤해지는 팔자",
    ],
    health: [
      "체력은 이미 방전인데 오기와 카페인으로 버티다 한 번에 눕는 팔자",
      "화병과 눈·어깨 뭉침을 달고 살면서 '아직 괜찮아'로 버티는 고집불통",
    ],
  },
  fire: {
    wealth: [
      "기분 좋으면 지갑부터 열고, 스트레스 받으면 결제부터 누르는 팔자",
      "한 방 크게 벌 운은 넘치는데 현금으로 묶어두지 않으면 다 새는 구조",
    ],
    love: [
      "금사빠에 올인하다가 상대가 식는 순간 혼자 화상 입는 연애 스타일",
      "매력은 넘쳐서 꼬이는 사람은 많은데 정작 내 속을 채워줄 사람은 1%",
    ],
    career: [
      "주목받는 무대 체질이라 묵묵한 실무만 시키면 재능 썩는 타입",
      "시작할 땐 불도저인데 6개월만 지나면 흥미 떨어져서 이직 고민하는 팔자",
    ],
    relationship: [
      "표정 관리가 0%라 싫은 사람 앞에서도 얼굴에 다 티 나서 손해 보는 타입",
      "화려한 인맥은 넓은데 막상 새벽 2시에 전화할 진짜 내 편은 두 명뿐",
    ],
    health: [
      "낮엔 텐션 폭발하다가 밤 12시만 넘으면 불면증·과열로 뇌가 안 꺼지는 타입",
      "심박수·혈압부터 수면 리듬까지 감정 기복에 몸이 그대로 망가지는 체질",
    ],
  },
  earth: {
    wealth: [
      "남들 코인·주식 쫓을 때 묵묵히 부동산·현금 흐름으로 결국 이기는 팔자",
      "안정 추구하다 대박 타이밍 두 번 놓칠 뻔한 신중파, 2027년엔 질러야 산다",
    ],
    love: [
      "연애를 사업 검토하듯 재다가 괜찮은 사람 다 놓치는 고집불통 타입",
      "한 번 내 사람이다 싶으면 끝까지 책임지다 오히려 상대가 당연하게 여기는 팔자",
    ],
    career: [
      "조직에서 '없으면 안 되는 핵심 실세'인데 막상 승진·보상은 남이 챙기는 구조",
      "버티는 힘은 최고지만 이미 썩은 동아줄도 의리 때문에 못 놓는 게 독",
    ],
    relationship: [
      "모든 사람 고민 다 들어주는 감정 쓰레기통 역할을 자처해서 병나는 타입",
      "겉으론 온화해 보여도 속으론 이미 손절 리스트 10명쯤 작성해 둔 냉혈한",
    ],
    health: [
      "스트레스 받으면 바로 위장·식도염·폭식으로 보복당하는 전형적 소화기 취약형",
      "생각이 너무 많아 밤에 야식 땡기고, 붓기와 만성 피로가 몸에 쌓이는 사주",
    ],
  },
  metal: {
    wealth: [
      "손익 계산은 귀신같은데 결정적인 순간에 자존심 때문에 돈 되는 제안을 차는 팔자",
      "소소한 지출은 칼같이 막으면서 체면 치레에 한 번에 크게 쓰는 타입",
    ],
    love: [
      "기준치가 너무 높아서 '저 정도면 괜찮지'가 절대 안 되는 깐깐한 연애관",
      "차도남·차도녀 포스 때문에 다가오는 사람이 쫄아서 도망가는 팔자",
    ],
    career: [
      "일은 제일 깔끔하게 잘하는데 직설적인 말투 때문에 상사 눈 밖에 나기 쉬운 타입",
      "전문직·프리랜서·독립 구조로 가야 몸값이 최소 2배 뛰는 칼잡이 사주",
    ],
    relationship: [
      "맞는 말만 골라 하는데 톤이 너무 차가워서 차도남·차도녀 소리 듣는 스타일",
      "앞뒤 다른 인간 극혐해서 스스로 인간관계 80%를 쳐내는 고독한 완벽주의자",
    ],
    health: [
      "예민함 MAX라 환절기 비염·피부 트러블·기관지염이 제일 먼저 찾아오는 체질",
      "긴장을 놓지 못해 목·승모근이 돌처럼 굳고 두통·대장 예민증으로 고생하는 타입",
    ],
  },
  water: {
    wealth: [
      "머리는 천재급인데 생각이 너무 많아 실행이 늦어 남이 먼저 돈 버는 걸 구경하는 타입",
      "정보력·눈치로 돈 버는 팔자라 2027년 흐름만 타면 횡재수 터지는 구조",
    ],
    love: [
      "상대방 속마음 다 읽고도 모른 척 맞춰주다 혼자 지쳐 잠수 이별하는 타입",
      "묘한 분위기와 섹시함이 무기인데 정작 본인은 속을 절대 안 보여주는 미스터리",
    ],
    career: [
      "단순 반복 업무는 질색, 전략·콘텐츠·기획·IT 쪽에서 판 깔아주면 날아다니는 뇌섹 기질",
      "겉으론 순응하는 척하지만 이미 머릿속엔 플랜 B·C·이직 시나리오까지 완비",
    ],
    relationship: [
      "적은 안 만드는데 그렇다고 속마음을 100% 여는 상대도 없는 외로운 전략가",
      "사람 마음을 꿰뚫어 봐서 오히려 인간관계에 환멸을 빨리 느끼는 팔자",
    ],
    health: [
      "물·햇빛 부족에 야행성 패턴이 겹쳐 부종·수족냉증·멘탈 방전이 반복되는 체질",
      "겉은 멀쩡해 보여도 호르몬·신장·생식기 피로가 조용히 누적되는 유리 체력",
    ],
  },
};

const TIER_LIST = [
  { tier: "TIER: SSR · 상위 3%", desc: "2027 정미년 대운 정중앙 적중" },
  { tier: "TIER: SR · 상위 8%", desc: "한 번 터지면 판을 뒤집는 기질" },
  { tier: "TIER: S · 상위 18%", desc: "실리와 타이밍만 잡으면 급상승" },
  { tier: "TIER: A · 상위 32%", desc: "든든한 내실과 대기만성 잠재력" },
];

const TALISMAN_MAP: Record<ElementKey, Omit<SajuReport["talisman"], "missingElement" | "missingElementKo">> = {
  wood: {
    luckyColor: "에메랄드 그린 & 올리브",
    luckyItem: "원목 액세서리, 관엽식물, 그린 계열 카드지갑",
    luckyDirection: "동쪽(東)",
    luckyNumber: 3,
    talismanTitle: "청룡 생기(生氣) 발아부",
    talismanMantra: "막힌 운을 뚫고 새로운 기회와 귀인을 불러들이는 성장의 기운",
  },
  fire: {
    luckyColor: "코랄 피치 & 샴페인 로즈",
    luckyItem: "캔들, 선글라스, 골드 포인트 주얼리",
    luckyDirection: "남쪽(南)",
    luckyNumber: 7,
    talismanTitle: "주작 명예(名譽) 점화부",
    talismanMantra: "식어가는 열정과 매력을 되살려 존재감과 인기를 끌어올리는 기운",
  },
  earth: {
    luckyColor: "웜 베이지 & 테라코타 골드",
    luckyItem: "도자기 머그컵, 가죽 벨트, 호박(Amber) 원석",
    luckyDirection: "중앙 · 남서쪽",
    luckyNumber: 5,
    talismanTitle: "황룡 재고(財庫) 수호부",
    talismanMantra: "새는 돈을 틀어막고 부동산·현금 자산을 단단히 고정하는 기운",
  },
  metal: {
    luckyColor: "실버 펄 & 아이스 화이트",
    luckyItem: "메탈 워치, 실버 링, 만년필",
    luckyDirection: "서쪽(西)",
    luckyNumber: 4,
    talismanTitle: "백호 결단(決斷) 파쇄부",
    talismanMantra: "우유부단함과 악연을 단칼에 끊어내고 승부수를 완성하는 기운",
  },
  water: {
    luckyColor: "미드나잇 네이비 & 바이올렛",
    luckyItem: "아쿠아마린 원석, 향수, 유리 물병",
    luckyDirection: "북쪽(北)",
    luckyNumber: 1,
    talismanTitle: "현무 지혜(智慧) 횡재부",
    talismanMantra: "구설수를 잠재우고 남보다 한 발 앞선 정보와 횡재수를 잡는 기운",
  },
};

interface StemTrait {
  symbol: string;
  polarity: "yang" | "yin";
  outerMask: string;
  innerDrive: string;
  moneyHabitAngle: string;
  relationTrigger: string;
  jeongMi2027Note: string;
}

const STEM_TRAITS: Record<string, StemTrait> = {
  甲: {
    symbol: "거목(巨木)",
    polarity: "yang",
    outerMask: "직진 본능을 숨긴 묵직한 개척자",
    innerDrive: "한 번 꽂히면 끝까지 자기 방식대로 밀어붙여야 직성이 풀리는 성격",
    moneyHabitAngle: "명분과 자존심이 걸리면 가격표를 안 보고 시원하게 긁어버리는 패턴",
    relationTrigger: "뒤에서 꼼수 부리거나 약속을 슬쩍 바꾸는 사람",
    jeongMi2027Note: "목생화(木生火) 상관 기운이 강해져 아이디어·표현력이 폭발하지만 말실수 경계",
  },
  乙: {
    symbol: "덩굴·화초",
    polarity: "yin",
    outerMask: "유연한 미소 뒤에 계산을 마친 전략가",
    innerDrive: "겉으론 져주는 척하지만 끝까지 살아남아 판을 먹는 끈기파",
    moneyHabitAngle: "푼돈은 꼼꼼히 아끼다가 분위기·감정에 취해 고가 소비로 한 방에 털리는 습관",
    relationTrigger: "은근히 자기 말만 맞다고 가르치려 드는 꼰대 성향",
    jeongMi2027Note: "정화(丁火) 식신이 살아나 브랜딩·부업·인맥 수익이 열리는 해",
  },
  丙: {
    symbol: "태양",
    polarity: "yang",
    outerMask: "숨겨도 티가 나는 에너지 센터",
    innerDrive: "주목받지 못하는 자리에선 10분도 못 버티고 시들어버리는 열정 체질",
    moneyHabitAngle: "기분 좋으면 한턱 쏘고 우울하면 플렉스로 기분 전환하는 감정 결제 루프",
    relationTrigger: "내 열정에 찬물 끼얹거나 매사에 부정적으로 깎아내리는 사람",
    jeongMi2027Note: "겁재·화기 과열 구간이라 동업·보증·충동 투자만 막아도 절반은 성공",
  },
  丁: {
    symbol: "촛불·등불",
    polarity: "yin",
    outerMask: "조용해 보이지만 속내는 불타는 디테일 장인",
    innerDrive: "작은 뉘앙스 하나도 다 읽고 혼자 밤새 곱씹는 초고감도 레이더",
    moneyHabitAngle: "특정 취향·디바이스·자기계발에 꽂히면 한도 없이 몰빵하는 소비",
    relationTrigger: "예의 없이 선 넘으면서 '장난인데 왜 예민해?'라고 하는 타입",
    jeongMi2027Note: "정미년 천간과 동일 기운이 겹쳐 라이벌 경쟁·몸값 재평가 승부수 발생",
  },
  戊: {
    symbol: "태산(泰山)",
    polarity: "yang",
    outerMask: "웬만한 변수엔 꿈쩍도 안 하는 바위 가면",
    innerDrive: "속으론 불안해도 절대 약한 모습 안 보이고 혼자 짊어지는 대장 기질",
    moneyHabitAngle: "평소엔 굳게 닫혀 있다가 '가족·내 사람' 명분 앞엔 통장 비밀번호까지 여는 스타일",
    relationTrigger: "책임감 없이 일 벌려놓고 나한테 뒷수습 떠넘기는 무임승차러",
    jeongMi2027Note: "화생토(火生土) 인성이 밀어주니 부동산·자격증·문서 계약에서 큰 결실",
  },
  己: {
    symbol: "옥토·정원",
    polarity: "yin",
    outerMask: "만만해 보이지만 속셈이 가장 치밀한 실리파",
    innerDrive: "모든 변수를 엑셀처럼 정리한 뒤에야 겨우 발을 떼는 신중파",
    moneyHabitAngle: "잔잔한 배달·구독·소소한 생활 누수가 눈덩이처럼 불어나 현금을 갉아먹는 구조",
    relationTrigger: "내 배려를 권리로 착각하고 점점 무리한 부탁을 늘리는 사람",
    jeongMi2027Note: "문서·학업·자격·전문성 인증 운이 열려 커리어 껍질을 깨기 좋은 흐름",
  },
  庚: {
    symbol: "원석·강철",
    polarity: "yang",
    outerMask: "타협 없는 기준을 세워둔 차가운 승부사",
    innerDrive: "내가 옳다고 믿는 원칙이 무너지면 인간관계도 당장 잘라내는 결단력",
    moneyHabitAngle: "가성비 따지다 정작 큰 판에서 자존심 때문에 실속 있는 제안을 거절하는 경향",
    relationTrigger: "핑계 대며 본질을 흐리고 결론을 미루는 우유부단한 상대",
    jeongMi2027Note: "화극금(火克金) 정관 압박이 강해 조직 내 승진·책임 확대 또는 이직 갈림길",
  },
  辛: {
    symbol: "보석·세공 칼날",
    polarity: "yin",
    outerMask: "세련된 취향 뒤에 1mm의 흠집도 못 참는 완벽주의",
    innerDrive: "남들 기준엔 충분해도 내 기준에 안 차면 스스로를 깎아먹는 예민함",
    moneyHabitAngle: "스트레스 풀이용 미용·패션·인테리어·감성 소비에서 월급의 25%가 증발",
    relationTrigger: "무신경하고 촌스러운 태도로 내 자존심을 은근히 긁는 사람",
    jeongMi2027Note: "정미년 불길이 보석을 단련하는 해라 실력 검증·브랜드 가치 급상승",
  },
  壬: {
    symbol: "대하·바다",
    polarity: "yang",
    outerMask: "어디로 튈지 모르는 유쾌한 속물 천재",
    innerDrive: "고여 있으면 썩는 체질이라 끊임없이 새 판·새 정보·이직 기회를 탐색",
    moneyHabitAngle: "수익원 하나에 만족 못 하고 레버리지·신사업·투자에 흩뿌리다 현금 동맥경화",
    relationTrigger: "작은 규칙으로 나를 가두고 통제하려 드는 마이크로매니저",
    jeongMi2027Note: "수극화(水克火) 재물성이 정면으로 들어와 큰돈이 오가는 대형 프로젝트 승부",
  },
  癸: {
    symbol: "봄비·이슬",
    polarity: "yin",
    outerMask: "순해 보이지만 사람 속을 다 꿰뚫어 보는 관찰자",
    innerDrive: "상황 파악은 1등인데 머릿속 시뮬레이션이 너무 길어 타이밍을 놓치기 쉬움",
    moneyHabitAngle: "미래 불안에 저축하면서도 정작 검증 안 된 지인 추천에 흔들려 목돈 유출",
    relationTrigger: "앞에선 웃고 뒤에선 계산기 두드리는 이중적인 인간",
    jeongMi2027Note: "정재·편재 기운과 만나 현금 흐름이 다각화되는 대신 체력 안배가 핵심",
  },
};

interface BranchTrait {
  nameKo: string;
  innerEngine: string;
  jeongMiRelationBadge: string;
  jeongMiImpact: string;
  dangerMonthOffset: number;
  windfallStyle: string;
}

const BRANCH_TRAITS: Record<string, BranchTrait> = {
  子: {
    nameKo: "자수(子)",
    innerEngine: "속내를 절대 쉽게 안 열고 밤에 혼자 작전을 짜는 치밀함",
    jeongMiRelationBadge: "자미 원진(子未怨嗔)",
    jeongMiImpact: "믿었던 지인·연인·동료와 감정의 앙금이 폭발해 인간관계 재편이 일어납니다.",
    dangerMonthOffset: 7,
    windfallStyle: "비공개 정보·데이터·혼자 묵묵히 쌓은 세컨드 파이프라인",
  },
  丑: {
    nameKo: "축토(丑)",
    innerEngine: "한 번 버티기로 마음먹으면 몇 년이고 참고 때를 기다리는 뚝심",
    jeongMiRelationBadge: "축미충(丑未沖)",
    jeongMiImpact: "직장·주거·계약에서 정면 충돌이 걸려 판을 갈아엎어야 직성이 풀립니다.",
    dangerMonthOffset: 4,
    windfallStyle: "이사·이직·포지션 전환 등 환경 리셋 직후 들어오는 보상금",
  },
  寅: {
    nameKo: "인목(寅)",
    innerEngine: "가만히 있으면 병나는 추진력, 새 판을 깔아야 살아나는 승부욕",
    jeongMiRelationBadge: "목화 통명(木火通明)",
    jeongMiImpact: "아이디어가 바로 돈과 스카우트 제안으로 연결되지만 과속 리스크가 큽니다.",
    dangerMonthOffset: 8,
    windfallStyle: "신규 런칭·기획 주도권 확보·팀 리딩 성과급",
  },
  卯: {
    nameKo: "묘목(卯)",
    innerEngine: "눈치와 감각이 9단이라 트렌드·사람 마음을 먼저 읽는 센스",
    jeongMiRelationBadge: "묘미 반합(卯未半合)",
    jeongMiImpact: "외부 귀인과 손잡고 판이 커지지만 조건을 문서화 안 하면 뒷탈이 납니다.",
    dangerMonthOffset: 9,
    windfallStyle: "콜라보·커뮤니티·브랜드 협업 수익",
  },
  辰: {
    nameKo: "진토(辰)",
    innerEngine: "겉으론 쿨해 보여도 스케일 큰 야망을 품고 타이밍을 노리는 배포",
    jeongMiRelationBadge: "화개 재고(華蓋財庫)",
    jeongMiImpact: "오래 묵힌 자산·경력 창고가 열리지만 쓸데없는 자존심 싸움을 조심해야 합니다.",
    dangerMonthOffset: 10,
    windfallStyle: "기존 포트폴리오 재평가·자산 리밸런싱 차익",
  },
  巳: {
    nameKo: "사화(巳)",
    innerEngine: "계산이 빠르고 표정 변화 없이 손익을 정확히 가르는 승부사 본능",
    jeongMiRelationBadge: "사오미 방합(巳午未)",
    jeongMiImpact: "활동 반경과 인맥이 폭발적으로 팽창하는 대신 돈·체력 소모가 극심해집니다.",
    dangerMonthOffset: 5,
    windfallStyle: "영업·협상·빠른 실행력으로 낚아채는 단기 고수익 딜",
  },
  午: {
    nameKo: "오화(午)",
    innerEngine: "체면과 자존심이 꺾이면 손해를 보더라도 판을 뒤집는 화끈함",
    jeongMiRelationBadge: "오미육합(午未六合)",
    jeongMiImpact: "모든 시선과 기회가 집중되는 중심운이지만 감정 기복이 곧 지갑 손실로 이어집니다.",
    dangerMonthOffset: 6,
    windfallStyle: "퍼스널 브랜딩·주목도 상승에 따른 스카우트 및 인세",
  },
  未: {
    nameKo: "미토(未)",
    innerEngine: "겉으론 온화하고 수용적이지만 속엔 절대 안 꺾이는 고집의 핵",
    jeongMiRelationBadge: "복음·병존(未未)",
    jeongMiImpact: "내 주관이 두 배로 강해져 주변과 마찰이 생기고 건강·소화기 과부하가 옵니다.",
    dangerMonthOffset: 7,
    windfallStyle: "한 우물 전문성 심화·단골/기존 고객 기반 반복 수익",
  },
  申: {
    nameKo: "신금(申)",
    innerEngine: "상황 전환이 빠르고 꼼수·빈틈을 1초 만에 잡아내는 예리함",
    jeongMiRelationBadge: "화금 단련(火金鍛鍊)",
    jeongMiImpact: "압박이 거세질수록 실력이 검증돼 몸값이 뛰는 반면 번아웃 경계선이 아슬아슬합니다.",
    dangerMonthOffset: 3,
    windfallStyle: "기술·자격·솔루션 제공 기반 고단가 프리랜스·이직",
  },
  酉: {
    nameKo: "유금(酉)",
    innerEngine: "디테일 집착과 선 긋기 능력, 아닌 건 죽어도 아니라고 말하는 칼날",
    jeongMiRelationBadge: "조열 단련(燥熱鍛鍊)",
    jeongMiImpact: "감정적 말 한마디가 구설로 번지기 쉽지만, 일 처리 퀄리티 하나로 압승하는 해입니다.",
    dangerMonthOffset: 9,
    windfallStyle: "검증된 전문 영역·프리미엄 단가 인상",
  },
  戌: {
    nameKo: "술토(戌)",
    innerEngine: "한 번 내 사람이라 여기면 끝까지 의리를 지키는 묵직한 신의",
    jeongMiRelationBadge: "술미형(戌未刑)",
    jeongMiImpact: "계약서·세금·법적 문서나 믿었던 사람과의 시비가 걸리기 쉬워 확인이 필수입니다.",
    dangerMonthOffset: 10,
    windfallStyle: "계약 조건 재협상·지분·로열티 구조 설계",
  },
  亥: {
    nameKo: "해수(亥)",
    innerEngine: "속마음을 안 들키면서도 필요한 정보·사람은 귀신같이 끌어오는 흡입력",
    jeongMiRelationBadge: "해미 암합(亥未暗合)",
    jeongMiImpact: "남모르게 진행하던 사이드 프로젝트나 물밑 제안이 생각보다 크게 터집니다.",
    dangerMonthOffset: 11,
    windfallStyle: "조용히 키운 N잡·해외/온라인 채널·비대면 수익",
  },
};

const MISTAKE_ARCHETYPES: Array<{
  id: string;
  titleTemplate: (b: BranchTrait, domKo: string) => string;
  detailTemplate: (ctx: {
    name: string;
    dayIlju: string;
    domKo: string;
    weakKo: string;
    stemTrait: StemTrait;
    branchTrait: BranchTrait;
    month: number;
    worryLabel: string;
  }) => string;
  ruleTemplate: (month: number, branchTrait: BranchTrait) => string;
}> = [
  {
    id: "impulse_deal",
    titleTemplate: (b) => `${b.jeongMiRelationBadge} 발동 · 지인발 달콤한 제안 & 계약 오판`,
    detailTemplate: ({ name, dayIlju, domKo, stemTrait, branchTrait, month }) =>
      `${name}님(${dayIlju} 일주)은 평소엔 ${stemTrait.outerMask} 면모로 실수를 안 하지만, 2027년 ${month}월 전후 ${branchTrait.jeongMiRelationBadge} 압력이 걸리면 판단 브레이크가 순간 풀립니다. 특히 ${domKo} 기운이 과열되며 '이번만 예외로 믿어보자'고 넘긴 동업·투자·금전 거래가 연말까지 발목을 잡을 위험이 큽니다.`,
    ruleTemplate: (month) =>
      `2027년 ${month}월에는 '지인 추천·단독 특가·마감 임박' 3가지 키워드가 붙은 제안은 무조건 72시간 숙려 후 서명하세요.`,
  },
  {
    id: "pride_burn",
    titleTemplate: (b, domKo) => `${domKo} 과부하 · 자존심 때문에 먼저 던지는 이별·사표`,
    detailTemplate: ({ name, dayIlju, stemTrait, branchTrait, month, worryLabel }) =>
      `${dayIlju} 일주를 타고난 ${name}님은 겉으론 차분해도 ${stemTrait.innerDrive}. 2027년 ${month}월엔 ${branchTrait.jeongMiImpact} 특히 ${worryLabel} 영역에서 상대방의 무례한 한마디에 홧김으로 판을 엎으면, 유리했던 협상 카드까지 내 손으로 버리는 꼴이 됩니다.`,
    ruleTemplate: (month) =>
      `${month}월 한 달 동안은 밤 10시 이후 카톡 장문 답장, 즉시 퇴사 통보, 감정적 손절 선언을 절대 금지하세요.`,
  },
  {
    id: "mouth_rumor",
    titleTemplate: () => `구설·말실수 주의보 · 무심코 내뱉은 솔직함이 독이 되는 달`,
    detailTemplate: ({ name, dayIlju, domKo, weakKo, branchTrait, month }) =>
      `${name}님의 ${dayIlju} 원국은 ${domKo} 비중이 높고 ${weakKo} 기운이 상대적으로 비어 있어, 에너지가 떨어지면 필터링 없이 팩트를 직격하는 경향이 있습니다. 2027년 ${month}월(${branchTrait.jeongMiRelationBadge})엔 농담이나 뒷담화가 부메랑으로 돌아와 핵심 귀인 한 명을 잃을 수 있습니다.`,
    ruleTemplate: (month) =>
      `${month}월 모임·단톡방에선 남 이야기 평가를 0%로 줄이고, 중요한 보고·갈등은 구두 대신 한 줄 메신저로만 남기세요.`,
  },
  {
    id: "money_leak",
    titleTemplate: (_, domKo) => `${domKo} 편중 리스크 · 체면·보상 소비로 목돈이 증발하는 함정`,
    detailTemplate: ({ name, dayIlju, stemTrait, branchTrait, month }) =>
      `${name}님(${dayIlju} 일주)은 ${stemTrait.moneyHabitAngle} 경향이 짙습니다. 2027년 ${month}월엔 ${branchTrait.jeongMiImpact} 스트레스를 풀겠다고 긁은 할부·선물·과시 지출이 하반기 진짜 큰 기회(횡재수)에서 쓸 종잣돈을 갉아먹게 됩니다.`,
    ruleTemplate: (month) =>
      `${month}월 첫날 바로 여유 자금의 30%를 해지 불가 예·적금이나 별도 파킹 계좌로 격리해 결제 한도를 잠그세요.`,
  },
  {
    id: "burnout_drop",
    titleTemplate: (b) => `체력·멘탈 방전 경보 · ${b.nameKo} 리듬 붕괴로 인한 연쇄 실수`,
    detailTemplate: ({ name, dayIlju, weakKo, stemTrait, month }) =>
      `2027년 정미년의 화기(火氣)가 강하게 들어오면 ${name}님(${dayIlju} 일주)에게 부족한 ${weakKo} 기운부터 바닥납니다. ${stemTrait.innerDrive} 성격 탓에 무리하다 ${month}월 전후 한 번에 집중력이 무너지면 다 잡은 계약·썸·평가에서 어이없는 실수를 저지릅니다.`,
    ruleTemplate: (month) =>
      `${month}월엔 신규 일정 수락을 평소 대비 30% 줄이고, 주 2회 이상 밤 11시 반 이전 취침으로 판단력을 사수하세요.`,
  },
  {
    id: "doc_oversight",
    titleTemplate: () => `문서·약속 누락 · '대충 괜찮겠지' 하고 넘긴 조항의 역습`,
    detailTemplate: ({ name, dayIlju, branchTrait, stemTrait, month }) =>
      `${name}님(${dayIlju})에게 2027년 ${month}월은 ${branchTrait.jeongMiRelationBadge} 영향권이라 세금·연봉·전월세·업무 R&R 같은 문서 이슈가 터지기 쉽습니다. 특히 ${stemTrait.relationTrigger}과의 구두 약속만 믿고 서류를 대충 훑으면 뒤늦게 손해를 떠안게 됩니다.`,
    ruleTemplate: (month, b) =>
      `${month}월(${b.jeongMiRelationBadge})의 모든 돈·일 약속은 크기가 작아도 '금액·기한·책임 범위' 3줄 메모를 카톡으로 남겨 증빙하세요.`,
  },
];

const CORE_TEMPERAMENT_ENDINGS: string[] = [
  "남들 눈엔 여유 있어 보여도 실은 손해 보는 계산만큼은 0.1초 만에 끝내고 선을 긋는 실속파입니다.",
  "겉으로는 잘 웃고 맞춰주지만 속에서는 이미 상대의 급과 진정성을 냉정하게 채점하고 있습니다.",
  "한번 믿으면 끝까지 의리를 지키지만, 내 기준에서 '선의'를 악용하는 순간 뒤도 안 돌아보고 셔터를 내립니다.",
  "위기 상황일수록 오히려 머리가 차가워지며 남들이 못 보는 돌파구를 제일 먼저 찾아내는 타입입니다.",
];

const TOXIC_ACTION_ADVICE: string[] = [
  "첫 만남부터 과하게 친한 척하며 내 시간과 인맥을 공짜로 쓰려는 사람은 두 번째 약속 없이 바로 정리하세요.",
  "내 고민엔 무관심하면서 본인 힘든 일만 1시간씩 쏟아내는 '감정 쓰레기통 제조기'와 거리를 두는 게 최고의 개운법입니다.",
  "조언을 가장해 은근히 내 자존감을 깎아내리는 말엔 웃어넘기지 말고 그 자리에서 정색하며 선을 긋는 훈련이 필요합니다.",
  "공짜 호의를 당연하게 여기고 고마움조차 표시 안 하는 상대에겐 2027년 상반기 안에 연락 빈도를 절반으로 줄이세요.",
];

function getTodayKstInfo(targetDate?: Date) {
  const kstMs = (targetDate ? targetDate.getTime() : Date.now()) + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[kst.getUTCDay()];
  const ec = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar().getEightChar();
  const ganZhiHanja = ec.getDay() || "戊申";
  return {
    dateLabel: `${year}년 ${month}월 ${day}일 (${weekday})`,
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    ganZhiHanja,
    ganZhiHangul: toHangul(ganZhiHanja),
  };
}

const GENERATES: Record<ElementKey, ElementKey> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const CONTROLS: Record<ElementKey, ElementKey> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

const CLASH_PAIRS = new Set([
  "子午", "午子", "丑未", "未丑", "寅申", "申寅",
  "卯酉", "酉卯", "辰戌", "戌辰", "巳亥", "亥巳",
]);

const HARMONY_PAIRS = new Set([
  "子丑", "丑子", "寅亥", "亥寅", "卯戌", "戌卯",
  "辰酉", "酉辰", "巳申", "申巳", "午未", "未午",
]);

function getTenGodRelation(dayStem: string, otherStem: string): {
  name: string;
  badge: string;
  biasScore: number;
  summaryTone: "push" | "wealth" | "pressure" | "support" | "peer";
} {
  const myEl = CHAR_ELEMENT_MAP[dayStem] ?? "fire";
  const otherEl = CHAR_ELEMENT_MAP[otherStem] ?? "earth";
  const myPol = STEM_TRAITS[dayStem]?.polarity ?? "yang";
  const otherPol = STEM_TRAITS[otherStem]?.polarity ?? "yang";
  const samePol = myPol === otherPol;

  if (myEl === otherEl) {
    return samePol
      ? { name: "비견(比肩)", badge: "비견 · 마이웨이 승부", biasScore: 3, summaryTone: "peer" }
      : { name: "겁재(劫財)", badge: "겁재 · 지갑 방어 필수", biasScore: -4, summaryTone: "peer" };
  }
  if (GENERATES[myEl] === otherEl) {
    return samePol
      ? { name: "식신(食神)", badge: "식신 · 실행력·복록 상승", biasScore: 10, summaryTone: "push" }
      : { name: "상관(傷官)", badge: "상관 · 사이다 직언주의", biasScore: 4, summaryTone: "push" };
  }
  if (CONTROLS[myEl] === otherEl) {
    return samePol
      ? { name: "편재(偏財)", badge: "편재 · 뜻밖의 횡재·기회", biasScore: 11, summaryTone: "wealth" }
      : { name: "정재(正財)", badge: "정재 · 실속·결제운 상승", biasScore: 9, summaryTone: "wealth" };
  }
  if (CONTROLS[otherEl] === myEl) {
    return samePol
      ? { name: "편관(偏官)", badge: "편관 · 압박 돌파 미션", biasScore: -5, summaryTone: "pressure" }
      : { name: "정관(正官)", badge: "정관 · 인정·신뢰 획득", biasScore: 7, summaryTone: "pressure" };
  }
  return samePol
    ? { name: "편인(偏印)", badge: "편인 · 직감·예지력 만렙", biasScore: 5, summaryTone: "support" }
    : { name: "정인(正印)", badge: "정인 · 귀인·문서 합격운", biasScore: 10, summaryTone: "support" };
}

export function calculateTodayFortune(
  input: SajuInput,
  dayMasterHanja: string,
  dayBranchHanja: string,
  weakestElement: ElementKey,
  targetDate?: Date
): TodayFortuneReport {
  const cleanName = input.name.trim() || "익명";
  const today = getTodayKstInfo(targetDate);
  const tStem = today.ganZhiHanja[0] || "戊";
  const tBranch = today.ganZhiHanja[1] || "申";
  const tenGod = getTenGodRelation(dayMasterHanja, tStem);

  const pair = `${dayBranchHanja}${tBranch}`;
  const isClash = CLASH_PAIRS.has(pair);
  const isHarmony = HARMONY_PAIRS.has(pair);

  const dailySeed = hashSeed(`${cleanName}|${input.birthDate}|${today.dateKey}|${today.ganZhiHanja}`);
  const branchBonus = isHarmony ? 9 : isClash ? -8 : 2;
  const score = Math.min(97, Math.max(48, 72 + tenGod.biasScore + branchBonus + ((dailySeed % 9) - 4)));

  const branchTag = isHarmony ? "일지 합(合)" : isClash ? "일지 충(沖)" : "안정 흐름";
  const relationBadge = `${tenGod.badge} · ${branchTag}`;

  const headlinesByTone: Record<typeof tenGod.summaryTone, string[]> = {
    wealth: [
      `오늘 ${today.ganZhiHangul}일진은 ${cleanName}님에게 돈과 기회가 먼저 줄 서는 실속형 데이입니다.`,
      `움직이는 만큼 바로 숫자로 돌아오는 날! 망설이던 결제·협상을 오늘 끝내는 게 이득입니다.`,
    ],
    push: [
      `아이디어와 말발이 칼날처럼 서는 날. 단, 지나치게 직설적으로 말하면 분위기가 얼 수 있으니 완급 조절하세요.`,
      `미뤄둔 일 처리 속도가 평소 2배로 붙는 날! 오전 안에 핵심 메일·제안을 먼저 던지세요.`,
    ],
    support: [
      `혼자 끙끙대던 문제에 의외의 귀인이나 딱 맞는 해결 힌트가 톡 떨어지는 날입니다.`,
      `서두르기보다 판을 정리하고 문서·조건을 챙길수록 내 편이 늘어나는 하루입니다.`,
    ],
    pressure: [
      `주변 요구나 돌발 변수로 신경 쓰일 수 있지만, 정공법으로 깔끔히 처리하면 평판이 수직 상승합니다.`,
      `감정적으로 맞서기보다 데이터·팩트 1장 들고 조용히 누르면 상대를 100% 제압하는 날입니다.`,
    ],
    peer: [
      `내 페이스를 지키면 90점, 남과 비교하며 조급해지면 지출만 늘어나는 호불호 명확한 하루입니다.`,
      `비슷한 사람들과 경쟁·부딪힘이 생길 수 있으니 내 패는 마지막까지 숨기는 게 상책입니다.`,
    ],
  };

  const headline = isClash
    ? `오늘은 ${today.ganZhiHangul}일진과 일지가 부딪히는 날! 급발진 답장·충동 결제만 피하면 오히려 반전이 터집니다.`
    : pick(headlinesByTone[tenGod.summaryTone], dailySeed, 1);

  const morningPool = [
    "오전엔 톡·메일 답장을 바로 하지 말고 10분 템포를 늦추세요. 먼저 움직이는 쪽이 패를 들킵니다.",
    "출근/기상 직후 할 일 3개만 우선순위로 묶어두면 오전 컨디션과 일 처리 효율이 최상으로 올라갑니다.",
    "오전 중 예상치 못한 연락이나 일정 변경이 들어올 수 있으나 오히려 유리한 방향으로 꺾입니다.",
  ];
  const afternoonPool = [
    "오후 1~4시가 오늘의 골든타임. 미뤄뒀던 제안·요청·금전 정산은 이 시간대에 밀어붙이세요.",
    "점심 이후 집중력이 잠시 흔들릴 수 있으니 15분 산책이나 따뜻한 차 한 잔으로 과열을 식히세요.",
    "오후엔 남 부탁 들어주느라 내 일 밀리기 딱 좋습니다. 정중하지만 단호하게 일정 선을 그으세요.",
  ];
  const eveningPool = [
    "저녁엔 기분 풀기용 충동 쇼핑·배달 폭식을 조심! 내일 쓸 체력을 아껴두는 게 돈 버는 길입니다.",
    "퇴근 후 지인과의 가벼운 대화나 우연한 정보 속에서 꽤 쓸만한 꿀팁 하나를 건지게 됩니다.",
    "밤 10시 이후엔 감정 스위치가 예민해지니 연애·관계 관련 중대 대화는 내일로 미루세요.",
  ];

  const makeSignal = (
    offset: number,
    goodLabels: string[],
    cautionLabels: string[],
    goodText: string,
    cautionText: string,
    warnText: string
  ): TodaySignalItem => {
    const val = (score + ((dailySeed >> offset) % 17) - 8);
    if (val >= 78) return { label: pick(goodLabels, dailySeed, offset), tone: "good", summary: goodText };
    if (val >= 62) return { label: pick(cautionLabels, dailySeed, offset), tone: "caution", summary: cautionText };
    return { label: "방어 모드", tone: "warn", summary: warnText };
  };

  const talisman = TALISMAN_MAP[weakestElement];
  const luckyTimes = ["오전 10:30 ~ 12:00", "오후 13:30 ~ 15:30", "오후 16:00 ~ 17:30", "저녁 19:30 ~ 21:00"];
  const avoidPool = [
    "기분 탓에 장바구니 결제 버튼 바로 누르기",
    "단톡방·회의에서 남 실수 즉석 지적하기",
    "확인 안 된 정보만 믿고 바로 약속·계약 잡기",
    "새벽까지 스마트폰 보며 과거 후회 곱씹기",
  ];

  return {
    dateLabel: today.dateLabel,
    todayGanZhiHangul: today.ganZhiHangul,
    todayGanZhiHanja: today.ganZhiHanja,
    relationBadge,
    score,
    headline,
    timeFlow: {
      morning: pick(morningPool, dailySeed, 2),
      afternoon: pick(afternoonPool, dailySeed, 3),
      evening: pick(eveningPool, dailySeed, 4),
    },
    signals: {
      wealth: makeSignal(
        2,
        ["횡재·실속", "수익 청신호"],
        ["현상 유지", "소지출 주의"],
        "작은 보너스·할인·정산 이득이 따르는 날. 필요한 실속 소비는 OK.",
        "큰 돈 나갈 일은 없으나 커피·택시·구독 누수가 은근히 큽니다.",
        "충동 지출·보증·투자 입금은 오늘 하루 무조건 일시 정지하세요."
      ),
      love: makeSignal(
        4,
        ["매력 UP", "호감 상승"],
        ["밀당 온도차", "눈치게임"],
        "자연스러운 한마디가 상대 마음을 훅 당기는 날. 먼저 가볍게 톡 보내보세요.",
        "내 기분이 말투에 묻어 오해를 살 수 있으니 이모티콘 하나 더 붙이세요.",
        "자존심 싸움으로 말꼬리 잡기 쉬운 날. 오늘은 한 발 물러서는 게 승자입니다."
      ),
      work: makeSignal(
        6,
        ["일잘러 각성", "인정 획득"],
        ["무난한 루틴", "꼼꼼 체크"],
        "막혔던 일의 핵심을 짚어내 상사·클라이언트 호평을 끌어내는 흐름입니다.",
        "속도보다 실수 방지가 우선! 보낸 파일·숫자 한 번 더 검수하세요.",
        "남의 업무 덤터기 쓰기 딱 좋은 날. 안 되는 건 일찍 불가능하다고 말하세요."
      ),
      condition: makeSignal(
        8,
        ["텐션 최상", "회복 탄력"],
        ["수분·휴식", "눈·어깨 주의"],
        "몸과 머리가 가볍고 직감이 잘 맞아떨어집니다. 가벼운 유산소 강추.",
        "카페인 과다로 오후 후반 급격히 방전될 수 있으니 물 챙겨 마시세요.",
        "수면 부족·예민함 경보. 오늘 밤은 무조건 디지털 디톡스 후 일찍 눕기!"
      ),
    },
    luckyTime: pick(luckyTimes, dailySeed, 5),
    luckyDirection: talisman.luckyDirection,
    avoidAction: pick(avoidPool, dailySeed, 7),
  };
}

function buildMonthlyFlow(
  seed: number,
  dominant: ElementKey,
  dayBranchHanja: string,
  worry: WorryTopic
): MonthlyScore[] {
  const monthVariants: Array<{
    tags: [string, string];
    notes: [string, string];
  }> = [
    {
      tags: ["신년 시동", "판짜기 시작"],
      notes: [
        "묵은 인간관계·구독 지출을 정리하고 연초 예산 룰을 새로 깔아야 하는 달",
        "작년에 질질 끌던 일을 1월 안에 끊어내야 2027년 상반기 자리가 비는 시동 구간",
      ],
    },
    {
      tags: ["귀인 출현", "정보 포착"],
      notes: [
        "생각지 못한 지인·선배의 짧은 안부 속에 돈과 이직으로 이어지는 힌트가 숨어 있음",
        "사람 만나는 자리에서 우연히 주운 정보 하나가 상반기 승부수로 바뀌는 달",
      ],
    },
    {
      tags: ["지출 경보", "속도 조절"],
      notes: [
        "감정적 소비와 충동 결제 경보! 계약서·견적서 도장은 최소 하루 묵혔다 찍을 것",
        "기분 풀려고 긁은 카드값이 발목을 잡기 쉬운 달. 고정비 다이어트 필수",
      ],
    },
    {
      tags: ["언행 주의", "고비 돌파"],
      notes: [
        "솔직한 한마디가 오해로 번지기 쉬운 달. 4월은 무조건 입 무겁게 관망이 최선",
        "남의 편 들어주다 나만 욕먹기 딱 좋은 구간. 중립 기어 넣고 내 실속만 챙기세요",
      ],
    },
    {
      tags: ["반등 시작", "기류 전환"],
      notes: [
        "답답하게 막혔던 프로젝트와 연락 기류가 풀리며 숨통이 확 트이는 전환점",
        "묵혀뒀던 기획이나 지원서가 예상보다 좋은 반응으로 돌아오기 시작하는 달",
      ],
    },
    {
      tags: ["커리어 피크", "몸값 점프"],
      notes: [
        "이직·연봉 협상·사이드 프로젝트 런칭에 최적의 추진력과 주목도가 붙는 시기",
        "그동안 뒤에서 갈아넣은 실력이 윗선 눈에 띄며 주도권을 쥐게 되는 승부 달",
      ],
    },
    {
      tags: ["과열 경계", "컨디션 사수"],
      notes: [
        "한여름 화기 과열로 체력·집중력이 급감할 수 있음. 무리한 투자·밤샘 작업 금지",
        "예민함이 올라와 가까운 사람에게 날 선 말을 던지기 쉬우니 휴가·휴식이 보약",
      ],
    },
    {
      tags: ["횡재수 도래", "현금 유입"],
      notes: [
        "올해 금전 흐름이 가장 뜨겁게 도는 달! 성과급·보너스·추가 수익 정산 기대",
        "예상 못 한 루트에서 목돈이나 고단가 제안이 들어오니 절대 값 깎아주지 말 것",
      ],
    },
    {
      tags: ["인연 정리", "옥석 가리기"],
      notes: [
        "내 에너지를 야금야금 갉아먹던 인연과 자연스럽게 거리 두기에 성공하는 달",
        "거절 못 해 떠안았던 일거리를 쳐내고 진짜 내 편 2~3명만 남기는 정돈기",
      ],
    },
    {
      tags: ["결실 수확", "숫자 확정"],
      notes: [
        "상반기에 뿌려둔 씨앗이 매출·승진·통장 잔고라는 확실한 숫자로 찍히는 시기",
        "문서·자격·계약 마무리에 최적인 달. 유리한 조항 하나라도 더 얹어 도장 찍기",
      ],
    },
    {
      tags: ["이동운 상승", "판 확장"],
      notes: [
        "이사·부서 이동·해외·여행 등 물리적 환경에 변화를 주면 막혔던 운이 뻥 뚫림",
        "같은 자리에 고여 있지 말고 새로운 커뮤니티·시장으로 발을 넓힐수록 수익 확대",
      ],
    },
    {
      tags: ["연말 정산", "자산 굳히기"],
      notes: [
        "1년간 굴려온 결과물을 현금성 자산으로 잠그고 다음 해 대운을 준비하는 안정기",
        "무리한 막판 베팅만 피하면 올 한 해 최고 등급 성적표로 기분 좋게 마감하는 달",
      ],
    },
  ];

  const branchTrait = BRANCH_TRAITS[dayBranchHanja] ?? BRANCH_TRAITS["午"];
  const dominantBias: Record<ElementKey, number[]> = {
    wood: [68, 76, 61, 52, 82, 88, 64, 84, 72, 86, 78, 82],
    fire: [72, 74, 58, 49, 85, 91, 59, 89, 70, 81, 75, 84],
    earth: [70, 72, 65, 55, 76, 82, 69, 88, 79, 91, 80, 87],
    metal: [74, 79, 60, 51, 78, 86, 66, 92, 73, 88, 82, 85],
    water: [69, 82, 61, 54, 80, 84, 65, 91, 77, 85, 86, 89],
  };

  const worryBonusMonth: Record<WorryTopic, number> = {
    wealth: 7, // 8월
    love: 4, // 5월
    career: 5, // 6월
    relationship: 8, // 9월
    health: 9, // 10월
  };

  return Array.from({ length: 12 }, (_, idx) => {
    const jitter = ((seed >> (idx % 10)) % 11) - 5;
    let rawScore = dominantBias[dominant][idx] + jitter;
    // 일지 기반 정미년 주의월에 실제 점수 하향 반영해 개인별 최저점 월이 다르게 나타나도록 설계
    if (idx + 1 === branchTrait.dangerMonthOffset) rawScore -= 14;
    if (idx === worryBonusMonth[worry]) rawScore += 6;

    const score = Math.min(97, Math.max(38, rawScore));
    const variantIdx = (seed + idx) % 2;
    return {
      month: idx + 1,
      label: `${idx + 1}월`,
      score,
      tag: monthVariants[idx].tags[variantIdx],
      note: monthVariants[idx].notes[variantIdx],
    };
  });
}

export function buildCompatibilityReport(
  userName: string,
  userBirth: string,
  partnerName: string,
  partnerBirth: string,
  dominantEl: ElementKey
): CompatibilityReport {
  const partnerCleanName = partnerName.trim() || "상대방";
  const partnerInput: SajuInput = {
    name: partnerCleanName,
    gender: "male",
    birthDate: partnerBirth || "1995-08-20",
    calendarType: "solar",
    birthHour: "unknown",
    worry: "love",
    menu: "compatibility",
  };
  const partnerCalc = calculatePillars(partnerInput);
  const seed = hashSeed(`${userBirth}-${partnerBirth}-${userName}-${partnerCleanName}`);

  const pairKey = `${dominantEl}-${partnerCalc.dominantElement}`;
  const synergyMap: Record<string, number> = {
    "wood-fire": 92, "fire-wood": 91,
    "fire-earth": 89, "earth-fire": 88,
    "earth-metal": 90, "metal-earth": 89,
    "metal-water": 93, "water-metal": 92,
    "water-wood": 94, "wood-water": 93,
  };
  const baseScore = synergyMap[pairKey] ?? (dominantEl === partnerCalc.dominantElement ? 82 : 73);
  const score = Math.min(98, Math.max(58, baseScore + (seed % 7) - 3));

  const gradeLabel =
    score >= 90
      ? "도화살 폭발 · 전생 인연급 케미"
      : score >= 80
      ? "티격태격해도 결국 붙어 있는 자석 궁합"
      : "매력은 강하지만 룰을 안 정하면 피 터지는 관계";

  const headline =
    score >= 88
      ? `${userName}님이 주도권을 쥐고 ${partnerCleanName}님이 스며드는 상생 시너지`
      : `${userName}님의 팩트 폭격에 ${partnerCleanName}님이 속으로 뜨끔해하는 긴장감`;

  const dynamicRole = `${userName}님은 ${ELEMENT_META[dominantEl].nameKo}(${ELEMENT_META[dominantEl].hanja}) 기운이 강해 상황을 먼저 읽고 판을 짜는 쪽이고, ${partnerCleanName}님은 ${ELEMENT_META[partnerCalc.dominantElement].nameKo}(${ELEMENT_META[partnerCalc.dominantElement].hanja}) 기운이 중심이라 반응 속도와 리듬이 다릅니다. 한쪽이 조급해질수록 다른 한쪽은 입을 닫는 패턴이 반복됩니다.`;

  const conflictPoint =
    score >= 85
      ? "둘 다 자존심이 은근히 세서 사소한 서운함을 '괜찮아'로 넘기다 한 달 뒤에 몰아서 터뜨리는 게 최대 지뢰밭입니다."
      : "연락 템포와 돈·시간을 쓰는 우선순위가 정반대입니다. 말투가 조금만 날카로워져도 상대방은 '날 무시하나?'로 오해할 확률이 높습니다.";

  const solutionTip =
    "감정이 올라온 밤 11시 이후에는 절대 카톡으로 긴 싸움을 하지 마세요. 주 1회 15분만 솔직하게 요구사항을 1문장으로 정리하면 궁합 점수가 15점 이상 수직 상승합니다.";

  return {
    partnerName: partnerCleanName,
    score,
    gradeLabel,
    headline,
    dynamicRole,
    conflictPoint,
    solutionTip,
  };
}

export function generateSajuReport(input: SajuInput, targetDate?: Date): SajuReport {
  const cleanName = input.name.trim() || "익명";
  const calc = calculatePillars(input);
  const seed = hashSeed(
    `${cleanName}|${input.birthDate}|${input.birthHour}|${input.calendarType}|${input.worry}|${input.menu}|${calc.dayMasterHanja}${calc.dayBranchHanja}`
  );

  const domTheme = ELEMENT_THEMES[calc.dominantElement];
  const weakTheme = ELEMENT_THEMES[calc.weakestElement];
  const stemTrait = STEM_TRAITS[calc.dayMasterHanja] ?? STEM_TRAITS["丙"];
  const branchTrait = BRANCH_TRAITS[calc.dayBranchHanja] ?? BRANCH_TRAITS["午"];
  const dayIlju = `${calc.dayMasterHangul}${calc.dayBranchHangul}(${calc.dayMasterHanja}${calc.dayBranchHanja})`;
  const worryLabel = WORRY_OPTIONS.find((w) => w.value === input.worry)?.label ?? "핵심 운세";

  const tierObj = pick(TIER_LIST, seed, 2);
  const baseOneLine = pick(ONE_LINE_FACTS[calc.dominantElement][input.worry], seed, 1);

  const HEALTH_PROFILE_MAP: Record<
    ElementKey,
    {
      vulnerableOrgans: string;
      burnoutPattern: string;
      cautionSeason2027: string;
      dailyPrescription: string;
    }
  > = {
    wood: {
      vulnerableOrgans: "간·담낭 · 눈 피로 · 목/어깨 근육 · 자율신경계",
      burnoutPattern:
        "할 일을 머릿속에 10개씩 쌓아두고 완벽하게 해내려다 뇌 과부하가 옵니다. 참을성이 바닥나면 갑자기 무기력해지고 시력 저하·편두통·어깨 결림이 한꺼번에 터집니다.",
      cautionSeason2027: "2027년 3~4월 봄 환절기 & 7월 한여름(화기 과열로 간·신경 피로 급증)",
      dailyPrescription:
        "오후 4시 이후 카페인 컷, 하루 20분 초록 숲길 걷기·스트레칭, 녹황색 채소와 충분한 수면(최소 6.5시간)이 보약입니다.",
    },
    fire: {
      vulnerableOrgans: "심혈관 · 수면 리듬 · 두피 열감 · 감정성 화병",
      burnoutPattern:
        "텐션이 오를 땐 밥 안 먹고도 밤새 달리지만, 한 번 식으면 침대 밖으로 못 나오는 극단적 에너지 소모형입니다. 억울한 일을 겪으면 가슴이 답답하고 잠을 설치는 증상이 바로 옵니다.",
      cautionSeason2027: "2027년 5~7월 정미년 화기(火氣) 절정기(심박 항진·수면 부족 주의)",
      dailyPrescription:
        "자기 전 1시간 스마트폰 블루라이트 차단, 4-7-8 호흡법 3분, 찬 음료 대신 미지근한 허브티(캐모마일·국화차)로 심열을 식히세요.",
    },
    earth: {
      vulnerableOrgans: "위장·십이지장 · 역류성 식도염 · 비장 · 하체 부종",
      burnoutPattern:
        "남들 기분 맞추고 고민 들어주느라 속으로 삭히다 위장부터 탈이 납니다. 스트레스를 매운 음식·단 음식·야식으로 풀려는 습관만 끊어도 체력의 40%가 살아납니다.",
      cautionSeason2027: "2027년 4월·7월·10월 환절기(소화기 정체 및 급격한 피로 누적)",
      dailyPrescription:
        "취침 3시간 전 금식, 식사 시간 20분 이상 천천히 씹기, 점심 식후 15분 햇볕 산책으로 묵직한 습담(濕痰)을 털어내세요.",
    },
    metal: {
      vulnerableOrgans: "호흡기·폐·기관지 · 피부 장벽 · 대장(과민성 장)",
      burnoutPattern:
        "스스로 기준이 높고 예민해 작은 변수에도 신경이 날카로워집니다. 겉으로 티를 안 내도 속으로 긴장이 풀리지 않아 건조성 피부 트러블·비염·장 트러블로 신호가 옵니다.",
      cautionSeason2027: "2027년 6~8월 여름 과열기 & 10~11월 건조한 가을(기관지·피부 주의)",
      dailyPrescription:
        "실내 습도 50% 유지, 유산소 호흡 운동(수영·러닝·요가), 도라지·배 등 흰색(백색) 식재료와 유산균 루틴이 필수입니다.",
    },
    water: {
      vulnerableOrgans: "신장·방광 · 수족냉증 · 호르몬 밸런스 · 허리/관절",
      burnoutPattern:
        "밤늦게까지 생각이 꼬리를 물고 이어져 낮밤이 바뀌기 쉽습니다. 움직임이 줄어들면 혈액순환이 급격히 막히면서 아침 부종·만성 저체온·멘탈 다운이 연쇄적으로 찾아옵니다.",
      cautionSeason2027: "2027년 1~2월 한겨울 & 11~12월 연말(면역력 저하 및 냉증 주의)",
      dailyPrescription:
        "기상 직후 따뜻한 물 1잔, 주 3회 반신욕 또는 하체 근력 운동(스쿼트), 하루 물 1.5L 수분 섭취로 순환을 강제로 돌려야 합니다.",
    },
  };

  const todayReport = calculateTodayFortune(
    { ...input, name: cleanName },
    calc.dayMasterHanja,
    calc.dayBranchHanja,
    calc.weakestElement,
    targetDate
  );

  const menuSubHooks: Record<MenuCategory, string> = {
    newyear2027: `2027 정미년(丁未年)과 ${cleanName}님의 ${dayIlju} 일주가 만나 '${branchTrait.jeongMiRelationBadge}' 흐름을 만듭니다.`,
    today: `${todayReport.dateLabel} 오늘의 ${todayReport.todayGanZhiHangul}(${todayReport.todayGanZhiHanja}) 일진과 ${cleanName}님 원국의 정밀 스캔 결과입니다.`,
    lifetime: `${cleanName}님의 타고난 ${dayIlju} 일주와 ${stemTrait.symbol} 기질을 뼈대까지 분해한 정밀 리포트입니다.`,
    wealth: `${cleanName}님(${dayIlju})에게 맞는 돈 버는 루트(${branchTrait.windfallStyle})를 돈 되는 기준 100%로 스캔했습니다.`,
    love: `${cleanName}님의 ${dayIlju} 일주 도화살 시기와 끌리는 인연 패턴을 정밀 분석했습니다.`,
    compatibility: `${cleanName}님과 ${input.partnerName?.trim() || "상대방"}님의 사주 기운 충돌과 끌림을 정밀 스캔했습니다.`,
    daeun: `${cleanName}님의 10년 단위 대운 흐름과 인생 최고의 황금 전성기 나이대를 산출했습니다.`,
    yeonun: `${cleanName}님의 2026~2028년 3개년 세운 상승·주의 곡선을 대조했습니다.`,
    taekil: `${cleanName}님의 ${dayIlju} 일주와 가장 잘 맞는 계약·이직·연애 대박 길일을 선별했습니다.`,
    health: `${cleanName}님의 오행 과다(${domTheme.nameKo})·결핍(${weakTheme.nameKo}) 데이터로 취약 장기와 멘탈 번아웃 신호를 정밀 스캔했습니다.`,
    tarot: `오늘의 타로 기운과 ${cleanName}님의 타고난 오행 흐름을 교차 검증한 결과입니다.`,
  };

  const hashtagsByEl: Record<ElementKey, string[]> = {
    wood: ["#기획력천재", "#호구조심", "#청룡오라"],
    fire: ["#매력부자", "#금사빠주의", "#주작오라"],
    earth: ["#묵직한실세", "#후반역전", "#황룡오라"],
    metal: ["#예리한직관", "#독립체질", "#백호수호"],
    water: ["#뇌섹전략가", "#직감만렙", "#현무오라"],
  };

  const monthlyFlow = buildMonthlyFlow(seed, calc.dominantElement, calc.dayBranchHanja, input.worry);
  const worstMonth = [...monthlyFlow].sort((a, b) => a.score - b.score)[0];
  const bestMonth = [...monthlyFlow].sort((a, b) => b.score - a.score)[0];

  // 사람마다 서로 다른 6종 아키타입 중 선택해 제목·본문·방어룰이 겹치지 않게 생성
  const mistakeArchetype = pick(MISTAKE_ARCHETYPES, seed, Math.floor(seed / 7));
  const criticalMistake2027 = {
    dangerMonth: `2027년 ${worstMonth.month}월 (${branchTrait.jeongMiRelationBadge})`,
    title: mistakeArchetype.titleTemplate(branchTrait, domTheme.nameKo),
    detail: mistakeArchetype.detailTemplate({
      name: cleanName,
      dayIlju,
      domKo: domTheme.nameKo,
      weakKo: weakTheme.nameKo,
      stemTrait,
      branchTrait,
      month: worstMonth.month,
      worryLabel,
    }),
    actionRule: mistakeArchetype.ruleTemplate(worstMonth.month, branchTrait),
  };

  const windfallDetails: Record<WorryTopic, string> = {
    wealth: `${cleanName}님(${dayIlju})은 ${stemTrait.jeongMi2027Note}. 특히 ${bestMonth.month}월엔 '${branchTrait.windfallStyle}' 루트에서 기대 이상의 현금 흐름이 열리니, 평소 다져둔 인맥·포트폴리오의 단가를 과감히 올리세요.`,
    career: `직무·포지션 전환운이 가장 강한 ${bestMonth.month}월은 ${cleanName}님의 ${domTheme.nameKo} 강점이 시장에서 최고 대우를 받는 시점입니다. '${branchTrait.windfallStyle}'을 앞세워 연봉·직급 레버리지를 당기세요.`,
    love: `${bestMonth.month}월엔 관계운이 돈과 연결되는 흐름입니다. ${dayIlju} 특유의 매력이 정점을 찍으면서 귀인형 파트너나 협업 제안이 동시에 들어오는 시너지 구간입니다.`,
    relationship: `사람으로 돈이 들어오는 ${bestMonth.month}월! 단, 쓸데없는 인맥 정리가 먼저 끝나야 '${branchTrait.windfallStyle}' 기회를 쥔 핵심 인물이 ${cleanName}님 쪽으로 붙습니다.`,
    health: `컨디션과 집중력이 최고치를 찍는 ${bestMonth.month}월엔 일 처리 효율이 2배로 뛰며 보너스·부가 수입까지 따라붙습니다. 상반기 체력 관리가 곧 하반기 잔고입니다.`,
  };

  const windfallRouteByMatrix: Record<ElementKey, string[]> = {
    wood: ["콘텐츠·기획 IP & 사이드 프로젝트(N잡)", "스카우트 이직 & 신규 팀 리딩 수익"],
    fire: ["퍼스널 브랜딩·세일즈 & 주목도 수익", "콜라보·커머스 & 단기 고수익 딜"],
    earth: ["본업 핵심 실세 포지션 & 우량 자산 축적", "자격·문서 계약 & 부동산/장기 현금흐름"],
    metal: ["고단가 전문 기술·컨설팅 & 연봉 점프", "프리랜서 독립 & 검증 기반 프리미엄 수주"],
    water: ["정보 차익·데이터 분석 & 비대면 파이프라인", "해외/온라인 채널 & 조용한 다중 수익원"],
  };

  const talismanBase = TALISMAN_MAP[calc.weakestElement];

  const compatibility =
    input.menu === "compatibility" || (input.partnerBirthDate && input.partnerName)
      ? buildCompatibilityReport(
          cleanName,
          input.birthDate,
          input.partnerName || "그 사람",
          input.partnerBirthDate || "1995-08-20",
          calc.dominantElement
        )
      : undefined;

  const todayFocusLineByWorry: Record<WorryTopic, string> = {
    wealth: todayReport.signals.wealth.summary,
    love: todayReport.signals.love.summary,
    career: todayReport.signals.work.summary,
    relationship: todayReport.signals.love.summary,
    health: todayReport.signals.condition.summary,
  };

  const oneLineByMenu: Record<MenuCategory, string> = {
    today: `[오늘 ${todayReport.todayGanZhiHangul}일진 ${todayReport.score}점] ${todayReport.relationBadge} — ${todayFocusLineByWorry[input.worry]}`,
    newyear2027: `[2027 ${branchTrait.jeongMiRelationBadge}] ${bestMonth.month}월 대운 상승 · ${worstMonth.month}월 주의 — ${baseOneLine}`,
    lifetime: `${dayIlju} 타고난 ${stemTrait.symbol} 팔자 — ${stemTrait.outerMask}, ${baseOneLine}`,
    wealth: `${dayIlju} 재물·천직 스캔 — '${branchTrait.windfallStyle}'로 ${bestMonth.month}월 몸값 터지는 구조`,
    love: `${dayIlju} 연애 사주 — 겉으론 쿨해도 내 사람에겐 올인하다 상처받기 쉬운 팔자`,
    compatibility: `${cleanName} × ${compatibility?.partnerName || "상대방"} 궁합 ${compatibility?.score ?? 84}점 — ${compatibility?.gradeLabel || "끌림과 긴장이 공존하는 케미"}`,
    daeun: `${cleanName}님의 황금 대운은 ${seed % 2 === 0 ? "30대 중반~40대" : "20대 후반~30대 후반"}에 정점을 찍습니다`,
    yeonun: `2026~2028년 3년 운세 — 2027년 ${bestMonth.month}월을 기점으로 우상향 급등 구간 진입`,
    taekil: `${dayIlju} 맞춤 길일 스캔 완료 — 중요 계약·이직·고백에 딱 맞는 대박 날짜 3선`,
    health: `${domTheme.nameKo} 과열·${weakTheme.nameKo} 결핍 체질 — ${pick(ONE_LINE_FACTS[calc.dominantElement].health, seed, 1)}`,
    tarot: `${stemTrait.symbol} 기질의 ${baseOneLine}`,
  };
  const oneLineFact = oneLineByMenu[input.menu] || `${stemTrait.symbol} 기질의 ${baseOneLine}`;

  // 대운 / 연운 / 택일 / 연애 전용 리포트 생성
  const ageLabels = ["10대 (12~21세)", "20대 (22~31세)", "30대 (32~41세)", "40대 (42~51세)", "50대 (52~61세)"];
  const daeunGanZhis = ["갑자(甲子)", "을축(乙丑)", "병인(丙寅)", "정묘(丁卯)", "무진(戊辰)", "기사(己巳)", "경오(庚午)", "신미(辛未)"];
  const daeunElements = ["수(水)", "토(土)", "목(木)", "목(木)", "토(土)", "토(土)", "화(火)", "토(土)"];
  const daeunDecades: DaeunDecadeItem[] = ageLabels.map((ageRange, idx) => {
    const gzIdx = (seed + idx) % daeunGanZhis.length;
    const score = Math.min(96, Math.max(58, 70 + (((seed >> idx) % 24) - 6) + (idx === 2 ? 10 : 0)));
    return {
      ageRange,
      ganZhi: daeunGanZhis[gzIdx],
      elementKo: daeunElements[gzIdx],
      score,
      keyword: score >= 85 ? "황금 대운" : score >= 75 ? "상승 기반" : "내공 축적",
      summary:
        score >= 85
          ? `${daeunGanZhis[gzIdx]} 대운으로 ${branchTrait.windfallStyle} 기회가 크게 열리며 자산과 커리어 급이 달라지는 시기입니다.`
          : `${stemTrait.outerMask} 기질이 단단해지며 사람·경력을 걸러내고 다음 도약을 준비하는 10년입니다.`,
    };
  });
  const bestDecade = [...daeunDecades].sort((a, b) => b.score - a.score)[0];

  const yeonunYears: YeonunYearItem[] = [
    {
      year: 2026,
      ganZhi: "병오(丙午)",
      score: Math.min(92, Math.max(62, 74 + (seed % 14) - 5)),
      badge: "판 짜기 · 준비",
      summary: "변화의 전조가 들어오며 기존 관계·직무에서 비효율을 걷어내고 새 무대를 고르는 해입니다.",
    },
    {
      year: 2027,
      ganZhi: "정미(丁未)",
      score: bestMonth.score,
      badge: branchTrait.jeongMiRelationBadge,
      summary: `${stemTrait.jeongMi2027Note} 특히 ${bestMonth.month}월 전후 결정적 제안과 수익 기회가 집중됩니다.`,
    },
    {
      year: 2028,
      ganZhi: "무신(戊申)",
      score: Math.min(96, Math.max(68, 81 + (seed % 12) - 3)),
      badge: "결실 · 확장",
      summary: "2027년에 뿌린 씨앗이 안정적 캐시카우와 명예·지위 상승으로 굳어지는 수확기입니다.",
    },
  ];

  // 실제 KST 기준 향후 60일 중 만세력 길일 3개 선별
  const kstNowMs = (targetDate ? targetDate.getTime() : Date.now()) + 9 * 60 * 60 * 1000;
  const recommendedDates: TaekilDateItem[] = [];
  const purposes = ["계약 · 연봉 협상 · 이직 지원", "고백 · 소개팅 · 중요한 만남", "목돈 정산 · 이사 · 새 프로젝트 시작"];
  for (let offsetDays = 3; offsetDays <= 55 && recommendedDates.length < 3; offsetDays += 11) {
    const dObj = new Date(kstNowMs + offsetDays * 86400000);
    const y = dObj.getUTCFullYear();
    const m = dObj.getUTCMonth() + 1;
    const d = dObj.getUTCDate();
    const gz = Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar().getEightChar().getDay() || "丙寅";
    if (!CLASH_PAIRS.has(`${calc.dayBranchHanja}${gz[1]}`)) {
      const idx = recommendedDates.length;
      recommendedDates.push({
        dateLabel: `${y}년 ${m}월 ${d}일`,
        ganZhi: `${toHangul(gz)}(${gz})일`,
        purpose: purposes[idx],
        reason: `${cleanName}님의 일주(${dayIlju})와 충돌 없이 ${domTheme.nameKo}·${weakTheme.nameKo} 균형을 보태주는 길일입니다.`,
      });
    }
  }

  const loveReport: LoveReport = {
    patternTitle: `${dayIlju} 일주의 연애 본성: '${stemTrait.outerMask}'`,
    attractionTrigger: `겉으로는 무덤덤해 보여도, 내 ${stemTrait.innerDrive} 기질을 알아봐 주고 말 한마디를 섬세하게 기억해 주는 상대에게 무장해제됩니다.`,
    goldenTiming: `2027년 ${bestMonth.month}월과 ${((bestMonth.month + 4) % 12) + 1}월에 도화·인연운이 가장 강하게 열립니다.`,
    lovePrescription: `상대방 비위를 맞추다 지쳐 혼자 잠수 타는 습관만 버리세요. 서운함은 다음 날 낮 1시 전에 담백한 1문장으로 말해야 오래 갑니다.`,
  };

  const elementDiagnosis = `${dayIlju} 일주 기준, 가장 강한 기운은 ${domTheme.nameKo}(${calc.elements.find((e) => e.key === calc.dominantElement)?.percentage}%)이며 보완할 기운은 ${weakTheme.nameKo}(${calc.elements.find((e) => e.key === calc.weakestElement)?.percentage}%)입니다.`;

  return {
    id: `sf-${seed.toString(36)}`,
    createdAt: new Date().toISOString(),
    input: { ...input, name: cleanName },
    pillars: calc.pillars,
    dayMasterHanja: calc.dayMasterHanja,
    dayMasterHangul: calc.dayMasterHangul,
    dayBranchHanja: calc.dayBranchHanja,
    dayBranchHangul: calc.dayBranchHangul,
    relation2027Label: branchTrait.jeongMiRelationBadge,
    elements: calc.elements,
    dominantElement: calc.dominantElement,
    weakestElement: calc.weakestElement,
    elementDiagnosis,
    tierBadge: tierObj.tier,
    percentileText: tierObj.desc,
    oneLineFact,
    subHook: menuSubHooks[input.menu],
    hashtags: hashtagsByEl[calc.dominantElement],
    todayReport,
    criticalMistake2027,
    windfallTiming: {
      bestMonth: `2027년 ${bestMonth.month}월 (운세 점수 ${bestMonth.score}점)`,
      moneyRoute: `${pick(windfallRouteByMatrix[calc.dominantElement], seed, 4)} · ${branchTrait.windfallStyle}`,
      detail: windfallDetails[input.worry],
    },
    coreFactReport: {
      temperament: `${cleanName}님은 ${dayIlju} 일주로 '${stemTrait.outerMask}' 성향과 ${branchTrait.nameKo} 특유의 '${branchTrait.innerEngine}'이 결합된 타입입니다. ${pick(CORE_TEMPERAMENT_ENDINGS, seed, 3)}`,
      moneyLeakHabit: `${stemTrait.moneyHabitAngle} 패턴이 반복되는 가운데, 특히 ${weakTheme.nameKo} 기운이 허해지는 ${worstMonth.month}월 전후엔 기준 없이 결제 금액이 커집니다. 월급일 다음날 선저축 자동이체부터 잠가야 잔고가 쌓입니다.`,
      toxicRelationWarning: `${cleanName}님이 가장 피해야 할 상극 유형은 '${stemTrait.relationTrigger}'입니다. ${pick(TOXIC_ACTION_ADVICE, seed, 5)}`,
    },
    healthReport: {
      vulnerableOrgans: `${HEALTH_PROFILE_MAP[calc.weakestElement].vulnerableOrgans} (보완 필요: ${weakTheme.nameKo})`,
      burnoutPattern: `${cleanName}님(${dayIlju})은 ${HEALTH_PROFILE_MAP[calc.dominantElement].burnoutPattern}`,
      cautionSeason2027: `${HEALTH_PROFILE_MAP[calc.weakestElement].cautionSeason2027} · ${branchTrait.jeongMiRelationBadge} 시기`,
      dailyPrescription: HEALTH_PROFILE_MAP[calc.weakestElement].dailyPrescription,
    },
    daeunReport: {
      goldenAge: bestDecade.ageRange,
      headline: `${cleanName}님의 10년 대운 중 '${bestDecade.ageRange} ${bestDecade.ganZhi}' 구간이 가장 강한 황금기입니다.`,
      decades: daeunDecades,
    },
    yeonunReport: {
      headline: "2026년 준비 → 2027년 정미년 돌파 → 2028년 결실로 이어지는 3개년 운세 곡선입니다.",
      years: yeonunYears,
    },
    taekilReport: {
      headline: `${cleanName}님의 일주(${dayIlju})와 상충 없이 합을 이루는 향후 60일 내 최적의 길일 3선입니다.`,
      avoidDatesNote: `일지(${calc.dayBranchHanja})와 정면 충돌(충)하는 날과 2027년 ${worstMonth.month}월 큰돈 계약은 피하세요.`,
      recommendedDates,
    },
    loveReport,
    monthlyFlow,
    talisman: {
      missingElement: calc.weakestElement,
      missingElementKo: weakTheme.nameKo,
      ...talismanBase,
    },
    compatibility,
  };
}

export function previewFourPillars(
  birthDate: string,
  calendarType: CalendarType,
  birthHour: string
): PillarInfo[] {
  const calc = calculatePillars({
    name: "미리보기",
    gender: "female",
    birthDate: birthDate || "1996-05-14",
    calendarType,
    birthHour: birthHour || "unknown",
    worry: "wealth",
    menu: "lifetime",
  });
  return calc.pillars;
}

const CATCHER_POETIC_QUOTES: Array<{ quote: string; sub: string }> = [
  { quote: "고요한 물이 깊다.", sub: "덴마크 속담" },
  { quote: "작은 친절이 큰 운을 데려온다.", sub: "오늘의 길운 문장" },
  { quote: "서두르지 않는 발걸음이 가장 멀리 간다.", sub: "달토의 한 줄" },
  { quote: "오늘 웃은 만큼 내일의 복이 자란다.", sub: "동양 명리 격언" },
  { quote: "같은 마음이 아닐 땐 내 편부터 챙기자.", sub: "달토의 따뜻한 직언" },
  { quote: "빈 손에 쥔 당근 하나가 내일 황금이 된다.", sub: "달빛 격언" },
];

export function generateDailyCatcherDraw(
  profile: SavedSajuProfile,
  targetDate?: Date
): DailyCatcherDraw {
  const report = generateSajuReport(
    {
      name: profile.name,
      gender: profile.gender,
      birthDate: profile.birthDate,
      calendarType: profile.calendarType,
      birthHour: profile.birthHour,
      worry: "wealth",
      menu: "today",
    },
    targetDate
  );

  const todayInfo = getTodayKstInfo(targetDate);
  const shortMonthDay = todayInfo.dateLabel.replace(/^\d{4}년\s*/, "");
  const score = report.todayReport?.score ?? 78;
  const seed = hashSeed(`${profile.id}|${profile.birthDate}|${todayInfo.dateKey}`);
  const poetic = CATCHER_POETIC_QUOTES[seed % CATCHER_POETIC_QUOTES.length];

  return {
    dateKey: todayInfo.dateKey,
    dateDisplay: shortMonthDay,
    profileId: profile.id,
    profileName: profile.name,
    score,
    quote: poetic.quote,
    quoteSub: poetic.sub,
    luckyNumber: report.talisman.luckyNumber,
    luckyColor: report.talisman.luckyColor.split(/[·&,]/)[0].trim(),
    luckyItem: report.talisman.luckyItem.split(/[·&,]/)[0].trim(),
  };
}

export const TAROT_DECK: TarotCardData[] = [
  {
    id: 0,
    nameKo: "THE SUN · 태양",
    nameEn: "The Sun",
    roman: "XIX",
    keyword: "압도적 주목 · 정면 돌파",
    factSummary:
      "눈치 보며 뒷걸음질 칠 때가 아닙니다. 오늘 당신이 숨기지 않고 당당하게 던진 한마디가 판을 뒤집습니다.",
    actionAdvice: "미뤄뒀던 연락이나 제안을 오후 3시 전에 먼저 꺼내세요. 승률 85% 이상입니다.",
    luckyBoost: "골드 포인트 액세서리 & 따뜻한 아메리카노",
    element: "fire",
  },
  {
    id: 1,
    nameKo: "THE EMPRESS · 여황제",
    nameEn: "The Empress",
    roman: "III",
    keyword: "풍요와 매력 · 횡재 기운",
    factSummary:
      "애써 쫓아가지 않아도 사람이든 돈이든 내 쪽으로 끌려오는 날. 단, 공짜로 호의 베풀면 호구 잡힙니다.",
    actionAdvice: "오늘 지갑을 열 땐 철저히 '나를 업그레이드하는 투자'에만 사용하세요.",
    luckyBoost: "실크 스카프 또는 향수 레이어링",
    element: "wood",
  },
  {
    id: 2,
    nameKo: "WHEEL OF FORTUNE · 운명의 수레바퀴",
    nameEn: "Wheel of Fortune",
    roman: "X",
    keyword: "예상 밖 반전 · 타이밍",
    factSummary:
      "지루하던 일상에 갑자기 변수가 떨어집니다. 피하지 말고 올라타면 3개월 뒤 웃는 쪽은 당신입니다.",
    actionAdvice: "평소와 다른 출퇴근 루트나 새로운 점심 메뉴를 선택해 작은 변화를 주세요.",
    luckyBoost: "숫자 7이 들어간 시각에 중요 결정하기",
    element: "water",
  },
  {
    id: 3,
    nameKo: "THE HIGH PRIESTESS · 여사제",
    nameEn: "The High Priestess",
    roman: "II",
    keyword: "서늘한 직감 · 침묵의 힘",
    factSummary:
      "지금 쎄한 느낌이 드는 그 사람, 그 직감이 100% 맞습니다. 섣불리 속마음을 털어놓지 마세요.",
    actionAdvice: "오늘은 말수를 평소보다 30% 줄이고, 상대가 무슨 패를 쥐고 있는지 관찰만 하세요.",
    luckyBoost: "네이비·인디고 계열 착장 & 혼자만의 15분 산책",
    element: "metal",
  },
  {
    id: 4,
    nameKo: "THE STAR · 별",
    nameEn: "The Star",
    roman: "XVII",
    keyword: "희망의 청사진 · 귀인",
    factSummary:
      "답답했던 안개가 걷히고 진짜 가야 할 방향이 보이기 시작합니다. 조급함만 버리면 다 내 것이 됩니다.",
    actionAdvice: "올해 꼭 이루고 싶은 목표 1가지를 메모장에 적고, 관련 인물에게 가볍게 안부를 건네세요.",
    luckyBoost: "아이스블루 톤 아이템 & 밤 10시 이후 디지털 디톡스",
    element: "earth",
  },
];
