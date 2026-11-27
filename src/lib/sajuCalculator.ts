import { Lunar, Solar } from "lunar-javascript";

export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";
export type AuraTheme =
  | "mint_gold"
  | "peach_lavender"
  | "beige_champagne"
  | "silver_ice"
  | "indigo_violet";

export type SajuTheme =
  | "2027_newyear"
  | "lifetime_fact"
  | "wealth_career"
  | "love_match"
  | "today"
  | "health";

export interface SajuCalcInput {
  name?: string;
  gender: "female" | "male";
  birthDate: string; // YYYY-MM-DD
  calendarType: "solar" | "lunar";
  birthTime: string; // "unknown" | "0".."23" | "HH:mm"
  partnerName?: string;
  partnerBirthDate?: string;
  partnerGender?: "female" | "male";
}

export interface FiveElementsRatio {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface DetailedSajuResult {
  saju_summary: {
    pillars: string;
    day_master: string;
    dominant_element: string;
    missing_element: string;
    five_elements_ratio: FiveElementsRatio;
  };
  aura_theme: AuraTheme;
  dominantKey: ElementKey;
  missingKey: ElementKey;
  dayMasterHanja: string;
  dayMasterHangul: string;
  dayBranchHanja: string;
  dayIlju: string;
  strengthLabel: "신강" | "중화" | "신약";
  tenGodsCounts: {
    bigyeop: number; // 비겁 (비견·겁재)
    siksang: number; // 식상 (식신·상관)
    jaeseong: number; // 재성 (편재·정재)
    gwanseong: number; // 관성 (편관·정관)
    inseong: number; // 인성 (편인·정인)
  };
  tenGodsSummary: string;
  seun2027Relations: string[];
  seun2027Summary: string;
  rarityTierHint: string;
  partnerSummary?: {
    name: string;
    pillars: string;
    day_master: string;
    dominant_element: string;
    matchScore: number;
    interactionSummary: string;
  };
}

const HANJA_TO_HANGUL: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

const CHAR_ELEMENT: Record<string, ElementKey> = {
  甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire",
  戊: "earth", 己: "earth", 庚: "metal", 辛: "metal",
  壬: "water", 癸: "water",
  寅: "wood", 卯: "wood", 巳: "fire", 午: "fire",
  辰: "earth", 戌: "earth", 丑: "earth", 未: "earth",
  申: "metal", 酉: "metal", 亥: "water", 子: "water",
};

// 지지 지장간 정기(本氣) 천간 매핑 (십성 정밀 연산용)
const BRANCH_MAIN_STEM: Record<string, string> = {
  子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙",
  午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬",
};

const STEM_YANG = new Set(["甲", "丙", "戊", "庚", "壬"]);

const DAY_MASTER_DESCRIPTIONS: Record<string, string> = {
  甲: "갑목(甲木) - 거대한 소나무",
  乙: "을목(乙木) - 끈질긴 덩굴과 화초",
  丙: "병화(丙火) - 타오르는 태양",
  丁: "정화(丁火) - 어둠을 밝히는 촛불",
  戊: "무토(戊土) - 흔들리지 않는 태산",
  己: "기토(己土) - 비옥한 옥토와 정원",
  庚: "경금(庚金) - 단련된 무쇠와 원석",
  辛: "신금(辛金) - 제련된 보석과 칼날",
  壬: "임수(壬水) - 거침없는 바다와 대하",
  癸: "계수(癸水) - 스며드는 봄비와 이슬",
};

const ELEMENT_KO_LABEL: Record<ElementKey, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

const AURA_THEME_BY_ELEMENT: Record<ElementKey, AuraTheme> = {
  wood: "mint_gold",
  fire: "peach_lavender",
  earth: "beige_champagne",
  metal: "silver_ice",
  water: "indigo_violet",
};

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

function toHangul(hanja: string): string {
  return hanja
    .split("")
    .map((ch) => HANJA_TO_HANGUL[ch] ?? ch)
    .join("");
}

function parseBirthHour(birthTime: string): number | "unknown" {
  const trimmed = (birthTime || "").trim().toLowerCase();
  if (!trimmed || trimmed === "unknown" || trimmed === "모름") return "unknown";
  if (trimmed.includes(":")) {
    const h = Number(trimmed.split(":")[0]);
    if (!Number.isNaN(h)) return Math.min(23, Math.max(0, h));
  }
  const num = Number(trimmed);
  if (!Number.isNaN(num)) return Math.min(23, Math.max(0, num));
  return "unknown";
}

function classifyTenGod(
  dayStem: string,
  targetStem: string
): "bigyeop" | "siksang" | "jaeseong" | "gwanseong" | "inseong" {
  const myEl = CHAR_ELEMENT[dayStem] ?? "wood";
  const otherEl = CHAR_ELEMENT[targetStem] ?? "earth";
  if (myEl === otherEl) return "bigyeop";
  if (GENERATES[myEl] === otherEl) return "siksang";
  if (CONTROLS[myEl] === otherEl) return "jaeseong";
  if (CONTROLS[otherEl] === myEl) return "gwanseong";
  return "inseong";
}

function computeEightChar(
  birthDate: string,
  calendarType: "solar" | "lunar",
  birthTime: string
) {
  const [yStr, mStr, dStr] = (birthDate || "1996-05-14").split("-");
  const year = Math.min(2026, Math.max(1940, Number(yStr) || 1996));
  const month = Math.min(12, Math.max(1, Number(mStr) || 5));
  const day = Math.min(31, Math.max(1, Number(dStr) || 14));
  const parsedHour = parseBirthHour(birthTime);
  const calcHour = parsedHour === "unknown" ? 12 : parsedHour;

  try {
    if (calendarType === "lunar") {
      return {
        ec: Lunar.fromYmdHms(year, month, Math.min(29, day), calcHour, 0, 0).getEightChar(),
        isHourUnknown: parsedHour === "unknown",
      };
    }
    return {
      ec: Solar.fromYmdHms(year, month, day, calcHour, 0, 0).getLunar().getEightChar(),
      isHourUnknown: parsedHour === "unknown",
    };
  } catch {
    return {
      ec: Solar.fromYmdHms(year, month, Math.min(28, day), calcHour, 0, 0)
        .getLunar()
        .getEightChar(),
      isHourUnknown: parsedHour === "unknown",
    };
  }
}

export function normalizeTheme(theme?: string): SajuTheme {
  switch (theme) {
    case "2027_newyear":
    case "newyear2027":
      return "2027_newyear";
    case "lifetime_fact":
    case "lifetime":
      return "lifetime_fact";
    case "wealth_career":
    case "wealth":
      return "wealth_career";
    case "love_match":
    case "compatibility":
      return "love_match";
    case "today":
      return "today";
    case "health":
      return "health";
    default:
      return "2027_newyear";
  }
}

export function calculateDetailedSaju(input: SajuCalcInput): DetailedSajuResult {
  const { ec, isHourUnknown } = computeEightChar(
    input.birthDate,
    input.calendarType,
    input.birthTime
  );

  const yearGz = ec.getYear();
  const monthGz = ec.getMonth();
  const dayGz = ec.getDay();
  const timeGz = isHourUnknown ? "" : ec.getTime();

  const pillarsText = isHourUnknown
    ? `${toHangul(yearGz)}(${yearGz})년 ${toHangul(monthGz)}(${monthGz})월 ${toHangul(dayGz)}(${dayGz})일 (시주 미상)`
    : `${toHangul(yearGz)}(${yearGz})년 ${toHangul(monthGz)}(${monthGz})월 ${toHangul(dayGz)}(${dayGz})일 ${toHangul(timeGz)}(${timeGz})시`;

  const dayStem = dayGz[0] || "甲";
  const dayBranch = dayGz[1] || "子";
  const yearBranch = yearGz[1] || "午";
  const monthBranch = monthGz[1] || "戌";

  const activePillars = isHourUnknown
    ? [yearGz, monthGz, dayGz]
    : [yearGz, monthGz, dayGz, timeGz];

  // 오행 가중 분포 계산 (일간 1.4, 월지 1.3 가중치 반영)
  const weights: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  activePillars.forEach((gz, idx) => {
    const s = gz[0];
    const b = gz[1];
    const sEl = CHAR_ELEMENT[s] ?? "earth";
    const bEl = CHAR_ELEMENT[b] ?? "earth";
    const isDay = gz === dayGz && idx === 2;
    const isMonth = gz === monthGz && idx === 1;
    weights[sEl] += isDay ? 1.4 : 1;
    weights[bEl] += isMonth ? 1.3 : 1;
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const elementKeys: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];
  const floored = elementKeys.map((k) => {
    const exact = (weights[k] / totalWeight) * 100;
    return { key: k, floor: Math.floor(exact), rem: exact - Math.floor(exact) };
  });
  const remSum = 100 - floored.reduce((acc, x) => acc + x.floor, 0);
  const byRem = [...floored].sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < remSum; i++) byRem[i].floor += 1;

  const five_elements_ratio: FiveElementsRatio = {
    wood: floored.find((x) => x.key === "wood")!.floor,
    fire: floored.find((x) => x.key === "fire")!.floor,
    earth: floored.find((x) => x.key === "earth")!.floor,
    metal: floored.find((x) => x.key === "metal")!.floor,
    water: floored.find((x) => x.key === "water")!.floor,
  };

  const sortedEls = [...elementKeys].sort(
    (a, b) => five_elements_ratio[b] - five_elements_ratio[a]
  );
  const dominantKey = sortedEls[0];
  const missingKey = sortedEls[sortedEls.length - 1];

  // 십성 분포 계산 (일간 자신 제외 천간 + 모든 지지 정기)
  const tenGodsCounts = {
    bigyeop: 0,
    siksang: 0,
    jaeseong: 0,
    gwanseong: 0,
    inseong: 0,
  };

  activePillars.forEach((gz, idx) => {
    const stem = gz[0];
    const branch = gz[1];
    if (!(idx === 2 && gz === dayGz)) {
      tenGodsCounts[classifyTenGod(dayStem, stem)] += 1;
    }
    const branchMain = BRANCH_MAIN_STEM[branch];
    if (branchMain) {
      tenGodsCounts[classifyTenGod(dayStem, branchMain)] += 1;
    }
  });

  // 일간 강약 (월지 득령 + 비겁·인성 비율)
  const myEl = CHAR_ELEMENT[dayStem] ?? "wood";
  const monthEl = CHAR_ELEMENT[monthBranch] ?? "earth";
  const isMonthSupport = monthEl === myEl || GENERATES[monthEl] === myEl;
  const supportScore =
    tenGodsCounts.bigyeop + tenGodsCounts.inseong + (isMonthSupport ? 1.5 : 0);
  const strengthLabel: "신강" | "중화" | "신약" =
    supportScore >= 4 ? "신강" : supportScore <= 2 ? "신약" : "중화";

  const tenGodNotes: string[] = [];
  tenGodNotes.push(
    tenGodsCounts.jaeseong >= 2
      ? `재성(재물·현실감각 ${tenGodsCounts.jaeseong}개)이 뚜렷해 돈의 흐름을 읽는 감각이 강함`
      : tenGodsCounts.jaeseong === 1
      ? "재성(재물운)이 1개 자리해 꾸준한 실속·본업 축적형"
      : "원국에 재성이 드러나지 않아(무재성) 전문성·식상/관성 우회 루트로 벌어야 함"
  );
  tenGodNotes.push(
    tenGodsCounts.gwanseong >= 2
      ? `관성(직장·명예 ${tenGodsCounts.gwanseong}개)이 강해 조직 내 책임·압박과 승진 기운이 큼`
      : tenGodsCounts.gwanseong === 1
      ? "관성(직장운)이 적정히 잡혀 커리어 궤도가 안정적"
      : "원국에 관성이 약해(무관성) 상사 눈치 보는 조직보다 독립·전문직·프리랜서 적성이 높음"
  );
  tenGodNotes.push(
    tenGodsCounts.siksang >= 2
      ? `식상(실행력·표현력 ${tenGodsCounts.siksang}개)이 왕성해 기획·아이디어·말발로 판을 여는 구조`
      : tenGodsCounts.siksang === 1
      ? "식상(실행력)이 1개 작동해 필요한 순간 행동으로 옮김"
      : "식상(실행력)이 부족해 생각과 시뮬레이션은 많으나 첫 실행 스타트가 늦어지기 쉬움"
  );

  // 2027 정미년(丁未年) 세운 상호작용 정밀 대조
  const seun2027Relations: string[] = [];
  const checkBranches = [
    { label: "일지", char: dayBranch },
    { label: "년지", char: yearBranch },
  ];

  for (const target of checkBranches) {
    if (target.char === "午") seun2027Relations.push(`${target.label}(午)-미(未) 육합(오미합)`);
    if (target.char === "丑") seun2027Relations.push(`${target.label}(丑)-미(未) 축미충(沖)`);
    if (target.char === "戌") seun2027Relations.push(`${target.label}(戌)-미(未) 술미형(刑)`);
    if (target.char === "子") seun2027Relations.push(`${target.label}(子)-미(未) 자미 원진살`);
    if (target.char === "亥" || target.char === "卯") {
      seun2027Relations.push(`${target.label}(${target.char})-미(未) 해묘미 삼합 반합`);
    }
    if (target.char === "巳") seun2027Relations.push(`${target.label}(巳)-미(未) 사오미 화국 방합`);
    if (target.char === "未") seun2027Relations.push(`${target.label}(未)-미(未) 복음·병존`);
  }
  if (dayStem === "甲" || dayStem === "戊" || dayStem === "庚") {
    seun2027Relations.push(`${toHangul(dayStem)}일간(甲/戊/庚) 2027년 미토 천을귀인(天乙貴人) 입성`);
  }
  if (seun2027Relations.length === 0) {
    seun2027Relations.push("정미년 정화(丁火)·미토(未土) 기운과 무난한 중립 교류");
  }

  const uniqueRelations = Array.from(new Set(seun2027Relations));
  const stemTenGod2027 = classifyTenGod(dayStem, "丁");
  const tenGodLabel2027: Record<typeof stemTenGod2027, string> = {
    bigyeop: "비겁운(경쟁·독립·자존심 충돌)",
    siksang: "식상운(표현력·창작·부업 실행 폭발)",
    jaeseong: "재성운(현금 유입·횡재·소비 동시 상승)",
    gwanseong: "관성운(승진·이직·책임 확대 및 압박)",
    inseong: "인성운(문서·자격·부동산·귀인 조력)",
  };

  const seun2027Summary = `2027 정미년 천간 정화(丁火)는 일간 기준 '${tenGodLabel2027[stemTenGod2027]}'으로 들어오며, 지지 상호작용은 [${uniqueRelations.join(", ")}] 흐름을 형성합니다. 가장 강한 ${ELEMENT_KO_LABEL[dominantKey]}(${five_elements_ratio[dominantKey]}%)와 부족한 ${ELEMENT_KO_LABEL[missingKey]}(${five_elements_ratio[missingKey]}%)의 불균형이 정미년 화토(火土) 기운을 만나 상반기 변동성과 하반기 기회로 교차합니다.`;

  // 희귀도/강도 기반 티어 힌트
  const spread = five_elements_ratio[dominantKey] - five_elements_ratio[missingKey];
  const hasNoble = uniqueRelations.some((r) => r.includes("천을귀인") || r.includes("합"));
  const rarityTierHint =
    spread >= 32 || (hasNoble && STEM_YANG.has(dayStem))
      ? "TIER: SSR · 상위 3%"
      : spread >= 22 || hasNoble
      ? "TIER: SR · 상위 8%"
      : spread >= 15
      ? "TIER: S · 상위 18%"
      : "TIER: A · 상위 32%";

  // 상대방 생년월일 제공 시 궁합 전처리
  let partnerSummary: DetailedSajuResult["partnerSummary"];
  if (input.partnerBirthDate) {
    const pCalc = computeEightChar(
      input.partnerBirthDate,
      "solar",
      "unknown"
    );
    const pYearGz = pCalc.ec.getYear();
    const pMonthGz = pCalc.ec.getMonth();
    const pDayGz = pCalc.ec.getDay();
    const pStem = pDayGz[0] || "丙";
    const pBranch = pDayGz[1] || "午";
    const pEl = CHAR_ELEMENT[pStem] ?? "fire";

    const clashSet = new Set([
      "子午", "午子", "丑未", "未丑", "寅申", "申寅",
      "卯酉", "酉卯", "辰戌", "戌辰", "巳亥", "亥巳",
    ]);
    const harmonySet = new Set([
      "子丑", "丑子", "寅亥", "亥寅", "卯戌", "戌卯",
      "辰酉", "酉辰", "巳申", "申巳", "午未", "未午",
    ]);
    const pairBranch = `${dayBranch}${pBranch}`;
    const isBranchHarmony = harmonySet.has(pairBranch);
    const isBranchClash = clashSet.has(pairBranch);
    const isStemGen = GENERATES[myEl] === pEl || GENERATES[pEl] === myEl;
    const isStemControl = CONTROLS[myEl] === pEl || CONTROLS[pEl] === myEl;

    let matchScore = 76;
    if (isBranchHarmony) matchScore += 14;
    if (isStemGen) matchScore += 8;
    if (isBranchClash) matchScore -= 9;
    if (isStemControl) matchScore -= 4;
    matchScore = Math.min(97, Math.max(54, matchScore));

    const branchDesc = isBranchHarmony
      ? `일지 ${dayBranch}-${pBranch} 육합(끌림과 속궁합 최상)`
      : isBranchClash
      ? `일지 ${dayBranch}-${pBranch} 충(자존심·생활리듬 정면 충돌 주의)`
      : `일지 ${dayBranch}-${pBranch} 중립 교류`;
    const stemDesc =
      GENERATES[myEl] === pEl
        ? `내가 상대를 생(生)해줘 챙기다 지치기 쉬운 구조`
        : GENERATES[pEl] === myEl
        ? `상대가 나를 생(生)해줘 내가 주도권을 쥐는 구조`
        : CONTROLS[myEl] === pEl
        ? `내가 상대를 통제·리드하려 드는 갑을 구도`
        : CONTROLS[pEl] === myEl
        ? `상대 말에 내가 눈치 보며 맞춰주기 쉬운 구도`
        : `동질 오행 비견(서로 양보 없는 자존심 대결)`;

    partnerSummary = {
      name: input.partnerName?.trim() || "상대방",
      pillars: `${toHangul(pYearGz)}(${pYearGz})년 ${toHangul(pMonthGz)}(${pMonthGz})월 ${toHangul(pDayGz)}(${pDayGz})일`,
      day_master: DAY_MASTER_DESCRIPTIONS[pStem] ?? `${toHangul(pStem)}(${pStem})`,
      dominant_element: ELEMENT_KO_LABEL[pEl],
      matchScore,
      interactionSummary: `${branchDesc} · ${stemDesc}`,
    };
  }

  return {
    saju_summary: {
      pillars: pillarsText,
      day_master: DAY_MASTER_DESCRIPTIONS[dayStem] ?? `${toHangul(dayStem)}(${dayStem})`,
      dominant_element: ELEMENT_KO_LABEL[dominantKey],
      missing_element: ELEMENT_KO_LABEL[missingKey],
      five_elements_ratio,
    },
    aura_theme: AURA_THEME_BY_ELEMENT[dominantKey],
    dominantKey,
    missingKey,
    dayMasterHanja: dayStem,
    dayMasterHangul: toHangul(dayStem),
    dayBranchHanja: dayBranch,
    dayIlju: `${toHangul(dayGz)}(${dayGz})`,
    strengthLabel,
    tenGodsCounts,
    tenGodsSummary: tenGodNotes.join(" / "),
    seun2027Relations: uniqueRelations,
    seun2027Summary,
    rarityTierHint,
    partnerSummary,
  };
}
