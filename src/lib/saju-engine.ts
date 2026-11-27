import { Lunar, Solar } from "lunar-javascript";
import type {
  CompatibilityReport,
  ElementKey,
  ElementStat,
  ElementTheme,
  MenuCategory,
  MonthlyScore,
  PillarInfo,
  SajuInput,
  SajuReport,
  TarotCardData,
  WorryTopic,
} from "./saju-types";

export const MENU_ITEMS: Array<{
  id: MenuCategory;
  badge: string;
  badgeStyle: string;
  title: string;
  subtitle: string;
  emoji: string;
  highlight?: boolean;
}> = [
  {
    id: "newyear2027",
    badge: "HOT · 12~2월 폭주",
    badgeStyle: "bg-rose-500/90 text-white",
    title: "2027 정미년 신년운세",
    subtitle: "월별 재물·이직·절대 피할 시기 팩폭",
    emoji: "🔥",
    highlight: true,
  },
  {
    id: "lifetime",
    badge: "상시 BEST",
    badgeStyle: "bg-slate-900 text-amber-200",
    title: "평생 사주 팩폭",
    subtitle: "타고난 기질, 돈 새는 습관, 독이 되는 인연",
    emoji: "⚡",
  },
  {
    id: "wealth",
    badge: "커리어·재물",
    badgeStyle: "bg-emerald-700/90 text-white",
    title: "재물·직업·이직운",
    subtitle: "월급 vs 사업 루트, 이직·횡재수 타이밍",
    emoji: "💰",
  },
  {
    id: "compatibility",
    badge: "바이럴 1위",
    badgeStyle: "bg-pink-500/90 text-white",
    title: "연애·궁합 스캔",
    subtitle: "썸·연인·직장상사 속마음 & 갑을관계 스캔",
    emoji: "💕",
  },
  {
    id: "tarot",
    badge: "100% FREE",
    badgeStyle: "bg-indigo-600/90 text-white",
    title: "오늘의 1장 타로",
    subtitle: "카드 1장으로 뽑는 오늘의 팩트 체크",
    emoji: "🃏",
  },
];

export const BIRTH_HOUR_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "unknown", label: "태어난 시간 모름 (삼주 분석)" },
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
];

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

  return {
    pillars,
    dayMasterHanja: dayHanja,
    dayMasterHangul: HANJA_TO_HANGUL[dayHanja] ?? "병",
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
      "속으로 다 참다가 한 번 터지면 상대방 뼈도 못 추리게 팩폭하는 스타일",
      "만만한 호구로 보이기 싫어서 괜히 센 척하다 피곤해지는 팔자",
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
      "맞는 말만 골라 하는데 톤이 너무 차가워서 팩폭러·독설가 소리 듣는 스타일",
      "앞뒤 다른 인간 극혐해서 스스로 인간관계 80%를 쳐내는 고독한 완벽주의자",
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
  },
};

const TIER_LIST = [
  { tier: "TIER: SSR · 상위 3%", desc: "2027 정미년 대운 정중앙 적중" },
  { tier: "TIER: SSR · 상위 4%", desc: "타고난 역전 잠재력 최상위권" },
  { tier: "TIER: SR+ · 상위 7%", desc: "한 번 터지면 판을 뒤집는 기질" },
  { tier: "TIER: S · 상위 11%", desc: "실리와 타이밍만 잡으면 급상승" },
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

function buildMonthlyFlow(seed: number, dominant: ElementKey): MonthlyScore[] {
  const baseNotes: Array<{ tag: string; note: string }> = [
    { tag: "신년 시동", note: "묵은 인간관계를 정리하고 연초 예산을 재설계해야 하는 달" },
    { tag: "귀인 출현", note: "생각지 못한 지인·선배의 연락 속에 돈 되는 정보가 숨어 있음" },
    { tag: "지출 주의", note: "감정적 소비와 충동 결제 경보. 계약서 도장은 두 번 읽고 찍을 것" },
    { tag: "치명적 고비", note: "말실수와 오지랖이 화근이 되는 달. 4월은 무조건 입 무겁게 버티기" },
    { tag: "반등 시작", note: "막혔던 프로젝트와 연애 기류가 풀리며 숨통이 트이는 전환점" },
    { tag: "커리어 피크", note: "이직·연봉 협상·사이드 프로젝트 런칭에 최적의 추진력 발생" },
    { tag: "여름 과열", note: "체력 저하로 판단력이 흐려질 수 있음. 무리한 투자·야근 금지" },
    { tag: "횡재수 도래", note: "금전 흐름이 가장 뜨겁게 도는 시기. 보너스·성과급·부수입 기대" },
    { tag: "인연 정리", note: "내 에너지를 갉아먹는 사람과 자연스럽게 거리 두기 성공" },
    { tag: "결실 수확", note: "상반기에 뿌려둔 씨앗이 숫자(매출·통장 잔고)로 돌아오는 달" },
    { tag: "이동운 상승", note: "이사·부서 이동·여행 등 환경 변화를 주면 운이 크게 트임" },
    { tag: "연말 정산", note: "올 한 해 최고 등급의 안정기. 내년 대운을 위한 현금 확보 완료" },
  ];

  const dominantBias: Record<ElementKey, number[]> = {
    wood: [68, 76, 60, 46, 82, 88, 66, 84, 72, 86, 78, 82],
    fire: [72, 74, 58, 42, 85, 92, 62, 89, 70, 81, 75, 84],
    earth: [70, 72, 65, 48, 76, 82, 71, 88, 79, 91, 80, 87],
    metal: [74, 79, 62, 44, 78, 86, 68, 93, 74, 88, 82, 85],
    water: [69, 82, 61, 45, 80, 84, 65, 91, 77, 85, 86, 89],
  };

  return Array.from({ length: 12 }, (_, idx) => {
    const jitter = ((seed >> (idx % 8)) % 9) - 4;
    const rawScore = dominantBias[dominant][idx] + jitter;
    const score = Math.min(97, Math.max(38, rawScore));
    return {
      month: idx + 1,
      label: `${idx + 1}월`,
      score,
      tag: baseNotes[idx].tag,
      note: baseNotes[idx].note,
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

  // 오행 상생·상극 기반 궁합 점수 계산
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

export function generateSajuReport(input: SajuInput): SajuReport {
  const cleanName = input.name.trim() || "익명";
  const calc = calculatePillars(input);
  const seed = hashSeed(
    `${cleanName}|${input.birthDate}|${input.birthHour}|${input.calendarType}|${input.worry}|${input.menu}`
  );

  const domTheme = ELEMENT_THEMES[calc.dominantElement];
  const weakTheme = ELEMENT_THEMES[calc.weakestElement];
  const tierObj = pick(TIER_LIST, seed, 2);
  const oneLineFact = pick(ONE_LINE_FACTS[calc.dominantElement][input.worry], seed, 1);

  const menuSubHooks: Record<MenuCategory, string> = {
    newyear2027: `2027 정미년(丁未年) 불(火)의 해가 ${cleanName}님의 ${domTheme.nameKo} 원국을 정면으로 자극합니다.`,
    lifetime: `${cleanName}님의 평생 사주 원국(${calc.dayMasterHangul}일간)을 뼈대까지 분해한 냉정한 리포트입니다.`,
    wealth: `${cleanName}님의 재물 창고와 직업적 천직 루트를 돈 되는 기준 100%로 스캔했습니다.`,
    compatibility: `${cleanName}님과 ${input.partnerName?.trim() || "상대방"}님의 사주 기운 충돌과 끌림을 정밀 스캔했습니다.`,
    tarot: `오늘의 타로 기운과 ${cleanName}님의 타고난 오행 흐름을 교차 검증한 결과입니다.`,
  };

  const hashtagsByEl: Record<ElementKey, string[]> = {
    wood: ["#기획력천재", "#호구조심", "#청룡오라"],
    fire: ["#매력부자", "#금사빠주의", "#주작오라"],
    earth: ["#묵직한실세", "#후반역전", "#황룡오라"],
    metal: ["#팩트폭격기", "#독립체질", "#백호오라"],
    water: ["#뇌섹전략가", "#직감만렙", "#현무오라"],
  };

  const monthlyFlow = buildMonthlyFlow(seed, calc.dominantElement);
  const worstMonth = [...monthlyFlow].sort((a, b) => a.score - b.score)[0];
  const bestMonth = [...monthlyFlow].sort((a, b) => b.score - a.score)[0];

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

  const elementDiagnosis = `가장 강한 기운은 ${domTheme.nameKo}(${calc.elements.find((e) => e.key === calc.dominantElement)?.percentage}%)이며, 보완이 필요한 기운은 ${weakTheme.nameKo}(${calc.elements.find((e) => e.key === calc.weakestElement)?.percentage}%)입니다.`;

  return {
    id: `sf-${seed.toString(36)}`,
    createdAt: new Date().toISOString(),
    input: { ...input, name: cleanName },
    pillars: calc.pillars,
    dayMasterHanja: calc.dayMasterHanja,
    dayMasterHangul: calc.dayMasterHangul,
    elements: calc.elements,
    dominantElement: calc.dominantElement,
    weakestElement: calc.weakestElement,
    elementDiagnosis,
    tierBadge: tierObj.tier,
    percentileText: tierObj.desc,
    oneLineFact,
    subHook: menuSubHooks[input.menu],
    hashtags: hashtagsByEl[calc.dominantElement],
    criticalMistake2027: {
      dangerMonth: `2027년 ${worstMonth.month === 4 ? "4월" : `4월 & ${worstMonth.month}월`}`,
      title: "감정이 앞선 성급한 결정 & 사람에 대한 과한 신뢰",
      detail: `${cleanName}님의 사주는 ${domTheme.nameKo} 기운이 강해 평소엔 눈치가 빠르지만, 2027년 정미년의 화기(火氣)가 강하게 들어오는 봄철(특히 4월)엔 판단력이 급격히 흔들립니다. 지인의 달콤한 동업·투자 제안이나, 자존심 때문에 홧김에 던지는 사표·이별 통보는 100% 후회로 돌아옵니다.`,
      actionRule:
        "2027년 4월 한 달 동안은 '큰돈 이체·계약서 서명·감정적 손절' 3가지를 무조건 72시간 보류하세요. 그것만 지켜도 1년 치 액땜이 끝납니다.",
    },
    windfallTiming: {
      bestMonth: `2027년 ${bestMonth.month}월 (운세 점수 ${bestMonth.score}점)`,
      moneyRoute:
        calc.dominantElement === "wood" || calc.dominantElement === "fire"
          ? "콘텐츠·브랜딩·사이드 프로젝트(N잡) 기반 수익화"
          : calc.dominantElement === "metal" || calc.dominantElement === "water"
          ? "전문 기술·연봉 점프 이직·정보 차익 기반 수익화"
          : "안정적 본업 캐시카우 + 우량 자산 장기 스윙",
      detail: `${cleanName}님은 단순 월급만 모아서 부자가 되는 사주가 아닙니다. ${bestMonth.month}월 전후로 일의 판이 커지거나 몸값을 1.5배 이상 띄울 제안이 들어옵니다. 특히 그동안 소소하게 쌓아둔 기록·포트폴리오·인맥이 예상치 못한 보너스나 부수입(횡재수)으로 현금화되는 타이밍입니다.`,
    },
    coreFactReport: {
      temperament: `${calc.dayMasterHangul}(${calc.dayMasterHanja}) 일간 특유의 자존심과 고집이 겉으로 드러나는 순둥한 가면 뒤에 숨어 있습니다. 남들이 볼 땐 무난해 보이지만, 머릿속에선 이미 수십 번 계산을 끝낸 뒤 움직이는 실리주의자입니다.`,
      moneyLeakHabit: `정작 큰돈을 아끼려고 눈물겨운 절약을 해놓고, '나한테 주는 보상' 또는 '가까운 사람 챙기기' 명목으로 한 번에 몇십만 원씩 시원하게 날리는 소비 패턴이 반복됩니다. 자동이체 강제 저축 없이는 잔고가 제자리를 맴돕니다.`,
      toxicRelationWarning: `은근히 본인의 감정을 떠넘기며 '네가 이해해 줘야지'라고 가스라이팅하는 사람과 가장 상극입니다. ${cleanName}님은 거절을 미안해하다가 에너지가 다 빨리는 편이니, 첫 만남에서 무례한 선을 넘는 사람은 그 자리에서 컷하세요.`,
    },
    monthlyFlow,
    talisman: {
      missingElement: calc.weakestElement,
      missingElementKo: weakTheme.nameKo,
      ...talismanBase,
    },
    compatibility,
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
