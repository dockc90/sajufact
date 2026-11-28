import type { ElementKey, PillarInfo, SajuReport, TodayFortuneReport } from "./saju-types";

export interface StemNatureMeta {
  emoji: string;
  objectName: string;
  shortName: string;
  headline: string;
  metaphorDesc: string;
  strengthNote: string;
  cautionNote: string;
}

export interface ElementNatureMeta {
  key: ElementKey;
  emoji: string;
  nameKo: string;
  shortKo: string;
  naturalObject: string;
  luckyNumbers: string;
  luckyColorShort: string;
  carryItemsShort: string;
  carryItemsFull: string;
  carryActionTip: string;
}

export interface PillarReading {
  label: string;
  roleTitle: string;
  hanja: string;
  hangul: string;
  isUnknown: boolean;
  summary: string;
}

export interface NatureStoryProfile {
  stemEmoji: string;
  stemObjectName: string;
  stemShortName: string;
  cardHeadline: string;
  metaphorDesc: string;
  strengthNote: string;
  cautionNote: string;
  dominantNameKo: string;
  dominantShortKo: string;
  dominantPct: number;
  dominantObject: string;
  dominantSummary: string;
  missingKey: ElementKey;
  missingEmoji: string;
  missingNameKo: string;
  missingShortKo: string;
  missingPct: number;
  missingNumbers: string;
  missingColorShort: string;
  missingCarryShort: string;
  missingCarryFull: string;
  balanceStory: string;
  cardStorySub: string;
  carryAdviceOneLine: string;
  carryAdviceLong: string;
  pillarReadings: PillarReading[];
}

const STEM_NATURE_MAP: Record<string, StemNatureMeta> = {
  甲: {
    emoji: "🌳",
    objectName: "하늘로 뻗는 커다란 소나무",
    shortName: "큰 소나무",
    headline: "하늘로 곧게 뻗는 거대한 소나무 팔자",
    metaphorDesc:
      "굽히기보다 곧게 위로 자라나며 주변의 그늘이 되어주는 우직한 거목의 기운을 타고났어요.",
    strengthNote:
      "한 번 마음을 먹으면 누구보다 뚝심 있게 판을 열고 앞장서는 개척자 에너지가 강해요.",
    cautionNote:
      "바람이 거세거나 땅이 메마를 때 부러지지 않으려면 고집을 살짝 꺾는 유연함이 필요해요.",
  },
  乙: {
    emoji: "🌿",
    objectName: "바람에도 꺾이지 않는 유연한 들꽃",
    shortName: "들꽃·덩굴",
    headline: "어디서든 뿌리내리는 유연한 들꽃 팔자",
    metaphorDesc:
      "부드럽고 섬세해 보이지만 바위 틈에서도 기어이 꽃을 피워내는 끈질긴 생명력의 기운이에요.",
    strengthNote:
      "상황 적응력이 뛰어나고 사람 마음을 부드럽게 열어 원하는 결과를 얻어내는 힘이 있어요.",
    cautionNote:
      "주변 눈치를 보느라 내 에너지를 지나치게 나눠주면 정작 내 뿌리가 지칠 수 있어요.",
  },
  丙: {
    emoji: "☀️",
    objectName: "세상을 환하게 비추는 뜨거운 태양",
    shortName: "뜨거운 태양",
    headline: "어디서나 빛나는 뜨거운 태양 팔자",
    metaphorDesc:
      "존재 자체만으로 주변을 밝히고 사람들의 시선과 활력을 끌어당기는 커다란 태양의 기운이에요.",
    strengthNote:
      "추진력과 솔직한 매력이 넘쳐 모임이나 프로젝트의 중심이 될 때 가장 크게 빛나요.",
    cautionNote:
      "열기가 과해지면 사소한 일에도 금방 달아오르고 체력이 방전되기 쉬워 식혀줄 여유가 필요해요.",
  },
  丁: {
    emoji: "🕯️",
    objectName: "어둠을 밝히는 은은한 촛불",
    shortName: "은은한 촛불",
    headline: "밤을 지키는 섬세한 촛불 팔자",
    metaphorDesc:
      "요란하진 않지만 한 사람과 한 분야를 깊이 비추며 따뜻한 온기를 전하는 등불의 기운이에요.",
    strengthNote:
      "직관과 집중력이 남달라 디테일을 살리는 전문 영역이나 섬세한 관계에서 빛을 발해요.",
    cautionNote:
      "혼자 밤새 생각을 곱씹다 심지가 타버리지 않도록 감정을 비우는 시간이 꼭 필요해요.",
  },
  戊: {
    emoji: "⛰️",
    objectName: "흔들림 없이 묵직한 거대한 태산",
    shortName: "웅장한 태산",
    headline: "태풍에도 꿈쩍 않는 거대한 산 팔자",
    metaphorDesc:
      "넓은 품으로 사람과 재물을 모으고 어떤 변수에도 중심을 잡아주는 든든한 큰 산의 기운이에요.",
    strengthNote:
      "신뢰감이 두텁고 위기 상황에서 버티는 힘이 강해 시간이 지날수록 자산과 평판이 쌓여요.",
    cautionNote:
      "변화가 필요한 순간에도 너무 신중해 움직임이 늦어질 수 있어 가끔 가벼운 시도가 좋아요.",
  },
  己: {
    emoji: "🌾",
    objectName: "만물을 키워내는 비옥한 대지",
    shortName: "비옥한 대지",
    headline: "씨앗을 열매로 키우는 비옥한 정원 팔자",
    metaphorDesc:
      "겉으로 튀지 않지만 실속을 챙기며 차곡차곡 결실을 길러내는 따뜻한 논밭과 정원의 기운이에요.",
    strengthNote:
      "현실 감각이 뛰어나고 사람과 자원을 조율해 안정적인 수익과 결과를 만드는 능력이 탁월해요.",
    cautionNote:
      "사소한 걱정이 흙처럼 쌓여 행동이 무거워질 수 있으니 작은 성취부터 바로 실행해 보세요.",
  },
  庚: {
    emoji: "⚔️",
    objectName: "단단하게 제련된 원석과 강철",
    shortName: "단단한 강철",
    headline: "결단으로 판을 가르는 단단한 강철 팔자",
    metaphorDesc:
      "불필요한 것을 단칼에 쳐내고 본질만 남기는 강인한 금속과 바위 원석의 기운을 타고났어요.",
    strengthNote:
      "공과 사가 분명하고 위기 때 결단력이 빨라 승부처에서 확실한 성과를 만들어내요.",
    cautionNote:
      "칼날이 지나치게 날카로우면 가까운 사람과도 부딪히기 쉬워 따뜻한 여유를 곁들이면 좋아요.",
  },
  辛: {
    emoji: "💎",
    objectName: "빛을 받아 반짝이는 영롱한 보석",
    shortName: "영롱한 보석",
    headline: "섬세하게 빛나는 영롱한 보석 팔자",
    metaphorDesc:
      "1mm의 흠집도 허용하지 않는 높은 안목과 고유의 아름다움을 지닌 세공된 보석의 기운이에요.",
    strengthNote:
      "취향과 디테일 감각이 뛰어나 자신만의 브랜드나 전문성을 세울 때 가치가 크게 올라가요.",
    cautionNote:
      "스스로에게 거는 기준이 너무 높으면 예민해지기 쉬우니 완벽주의를 살짝 내려놓아 보세요.",
  },
  壬: {
    emoji: "🌊",
    objectName: "끝없이 흐르는 드넓은 바다",
    shortName: "드넓은 바다",
    headline: "세상을 품고 흐르는 드넓은 바다 팔자",
    metaphorDesc:
      "어디에도 갇히지 않고 새로운 정보와 기회를 받아들이며 거침없이 흐르는 큰 물의 기운이에요.",
    strengthNote:
      "두뇌 회전이 빠르고 스케일이 커서 변화가 빠른 환경에서 큰 기회와 횡재를 잘 포착해요.",
    cautionNote:
      "물길이 사방으로 흩어지면 집중력이 분산될 수 있어 한 번에 하나씩 중심을 잡는 게 좋아요.",
  },
  癸: {
    emoji: "💧",
    objectName: "대지를 적시는 맑은 봄비와 이슬",
    shortName: "맑은 봄비",
    headline: "조용히 스며들어 살리는 맑은 봄비 팔자",
    metaphorDesc:
      "보이지 않는 곳에서 사람의 마음을 읽고 메마른 상황을 촉촉하게 풀어주는 지혜로운 물의 기운이에요.",
    strengthNote:
      "공감 능력과 통찰력이 뛰어나고 부드러운 설득력으로 어려운 문제를 조용히 해결해요.",
    cautionNote:
      "생각이 너무 깊어져 혼자 불안에 잠기지 않도록 몸을 움직여 기운을 환기해 주세요.",
  },
};

const ELEMENT_NATURE_MAP: Record<ElementKey, ElementNatureMeta> = {
  wood: {
    key: "wood",
    emoji: "🌳",
    nameKo: "목(木)",
    shortKo: "나무(목)",
    naturalObject: "커다란 나무",
    luckyNumbers: "3 · 8",
    luckyColorShort: "에메랄드 그린",
    carryItemsShort: "우드 키링·그린 지갑",
    carryItemsFull: "원목 액세서리, 그린 계열 카드지갑, 작은 식물 소품",
    carryActionTip:
      "숫자 3·8이나 에메랄드 그린 컬러의 우드 소품·그린 카드지갑을 몸에 지니면 막힌 운이 시원하게 뻗어 나가요.",
  },
  fire: {
    key: "fire",
    emoji: "☀️",
    nameKo: "화(火)",
    shortKo: "불(화)",
    naturalObject: "타오르는 태양",
    luckyNumbers: "2 · 7",
    luckyColorShort: "코랄 피치·레드",
    carryItemsShort: "골드 주얼리·캔들",
    carryItemsFull: "골드·로즈골드 주얼리, 코랄 포인트 소품, 따스한 향초",
    carryActionTip:
      "숫자 2·7이나 코랄·로즈골드 컬러의 반지·립스틱·따뜻한 색감 소품을 가까이 두면 존재감과 생기가 살아나요.",
  },
  earth: {
    key: "earth",
    emoji: "⛰️",
    nameKo: "토(土)",
    shortKo: "땅(토)",
    naturalObject: "단단한 태산",
    luckyNumbers: "5 · 0",
    luckyColorShort: "웜 베이지·옐로우",
    carryItemsShort: "가죽 벨트·호박 원석",
    carryItemsFull: "베이지·브라운 가죽 지갑, 도자기 머그컵, 호박(Amber) 원석",
    carryActionTip:
      "숫자 5·0이나 웜 베이지·브라운 가죽 소품과 도자기·원석을 지니면 흔들리던 재물과 마음이 단단히 자리 잡아요.",
  },
  metal: {
    key: "metal",
    emoji: "💎",
    nameKo: "금(金)",
    shortKo: "쇠(금)",
    naturalObject: "빛나는 보석·강철",
    luckyNumbers: "4 · 9",
    luckyColorShort: "실버·화이트",
    carryItemsShort: "실버 링·메탈 시계",
    carryItemsFull: "실버 반지·목걸이, 메탈 손목시계, 화이트 만년필·메탈 키링",
    carryActionTip:
      "숫자 4·9나 실버·화이트 컬러의 메탈 시계·은반지·금속 키링을 들고 다니면 결단력과 맺고 끊음이 또렷해져요.",
  },
  water: {
    key: "water",
    emoji: "🌊",
    nameKo: "수(水)",
    shortKo: "물(수)",
    naturalObject: "깊고 넓은 바다",
    luckyNumbers: "1 · 6",
    luckyColorShort: "미드나잇 네이비",
    carryItemsShort: "유리 물병·향수·네이비",
    carryItemsFull: "네이비 소품, 아쿠아마린 원석, 맑은 유리 물병, 시원한 향수",
    carryActionTip:
      "숫자 1·6이나 미드나잇 네이비·블랙 소품, 유리 물병·아쿠아마린 원석을 들고 다니면 과열된 기운이 식고 지혜가 맑아져요.",
  },
};

const PILLAR_ROLE_META: Record<
  string,
  { roleTitle: string; lifeStage: string }
> = {
  년주: {
    roleTitle: "년주(年柱) · 초년운과 타고난 배경",
    lifeStage: "어린 시절의 뿌리이자 남들에게 처음 비치는 인상과 가문의 기운",
  },
  연주: {
    roleTitle: "연주(年柱) · 초년운과 타고난 배경",
    lifeStage: "어린 시절의 뿌리이자 남들에게 처음 비치는 인상과 가문의 기운",
  },
  월주: {
    roleTitle: "월주(月柱) · 청년운과 사회·직장 무대",
    lifeStage: "일과 커리어, 사회생활에서 실제로 실력을 펼치는 주력 무대",
  },
  일주: {
    roleTitle: "일주(日柱) · 나 자신의 본체와 연애·배우자",
    lifeStage: "사주에서 '나' 그 자체이자 속마음, 연애·결혼의 핵심 성향",
  },
  시주: {
    roleTitle: "시주(時柱) · 말년운과 숨겨진 잠재력",
    lifeStage: "인생 후반부의 결실, 자식·취미·미래를 여는 숨은 열쇠",
  },
};

function buildBalanceStory(
  strong: ElementNatureMeta,
  weak: ElementNatureMeta,
  strongPct: number,
  weakPct: number,
  stemObjectName: string
): string {
  if (strong.key === weak.key) {
    return `${stemObjectName} 기운이 고르게 퍼져 있어, ${weak.luckyColorShort} 컬러와 숫자 ${weak.luckyNumbers} 소품으로 리듬만 지켜줘도 균형이 빛나요.`;
  }

  const pairStories: Partial<Record<`${ElementKey}_${ElementKey}`, string>> = {
    wood_water: `${strong.naturalObject}(${strong.nameKo} ${strongPct}%)가 마르지 않고 울창하게 자라려면 뿌리를 적셔줄 맑은 물(${weak.nameKo} ${weakPct}%)의 기운이 꼭 필요해요.`,
    wood_fire: `${strong.naturalObject}(${strong.nameKo} ${strongPct}%)가 무성하게 뻗은 만큼, 따뜻한 태양빛(${weak.nameKo} ${weakPct}%)이 비춰야 멋진 꽃과 열매가 열려요.`,
    wood_earth: `키가 큰 ${strong.naturalObject}(${strong.nameKo} ${strongPct}%)가 바람에 흔들리지 않으려면 뿌리를 붙잡아줄 단단한 땅(${weak.nameKo} ${weakPct}%)을 다져야 해요.`,
    wood_metal: `가지가 무성한 ${strong.naturalObject}(${strong.nameKo} ${strongPct}%)는 쇠(${weak.nameKo} ${weakPct}%)로 불필요한 가지를 다듬어 줄수록 더 귀한 재목으로 빛나요.`,
    fire_water: `불꽃(${strong.nameKo} ${strongPct}%)이 활활 타오르는 사주라 열기가 과열되기 쉬워, 식혀주고 균형을 잡는 물(${weak.nameKo} ${weakPct}%)의 기운이 보약이에요.`,
    fire_earth: `뜨거운 태양(${strong.nameKo} ${strongPct}%)의 에너지가 흩어지지 않고 재물로 쌓이려면, 열기를 담아줄 묵직한 대지(${weak.nameKo} ${weakPct}%)가 필요해요.`,
    fire_metal: `열정이 넘치는 태양(${strong.nameKo} ${strongPct}%) 사주는 냉철한 결단과 실속을 챙겨주는 보석·강철(${weak.nameKo} ${weakPct}%) 기운을 보완할 때 완성돼요.`,
    fire_wood: `타오르는 불꽃(${strong.nameKo} ${strongPct}%)이 오래 꺼지지 않고 꾸준히 타오르려면 땔감이 되어줄 나무(${weak.nameKo} ${weakPct}%) 기운을 채워야 해요.`,
    earth_wood: `넓은 땅(${strong.nameKo} ${strongPct}%)이 답답하게 굳지 않고 살아 숨 쉬려면, 흙을 뚫고 올라오는 싱그러운 나무(${weak.nameKo} ${weakPct}%)가 필요해요.`,
    earth_water: `단단하고 마른 태산(${strong.nameKo} ${strongPct}%)에 생명력과 현금 흐름이 돌게 하려면 촉촉한 물(${weak.nameKo} ${weakPct}%)의 기운을 더해줘야 해요.`,
    earth_metal: `큰 산(${strong.nameKo} ${strongPct}%) 속에 묻힌 재능이 밖으로 빛을 발하려면 보석을 캐내는 쇠(${weak.nameKo} ${weakPct}%) 기운이 꼭 필요해요.`,
    earth_fire: `묵직한 대지(${strong.nameKo} ${strongPct}%)가 차갑게 식지 않고 풍요로운 결실을 맺으려면 따뜻한 태양(${weak.nameKo} ${weakPct}%)의 온기가 필요해요.`,
    metal_fire: `단단한 보석과 강철(${strong.nameKo} ${strongPct}%)이 차갑게 굳어 있지 않고 빛나려면, 녹이고 다듬어줄 따뜻한 불(${weak.nameKo} ${weakPct}%) 기운이 필요해요.`,
    metal_water: `날카롭고 단단한 강철(${strong.nameKo} ${strongPct}%) 사주는 유연함과 지혜를 불어넣어 주는 맑은 물(${weak.nameKo} ${weakPct}%)을 만나야 크게 풀려요.`,
    metal_wood: `단단한 금속(${strong.nameKo} ${strongPct}%)의 결단력이 실제 성장과 수익으로 이어지려면 생명력 넘치는 나무(${weak.nameKo} ${weakPct}%) 기운이 짝을 이뤄야 해요.`,
    metal_earth: `날선 보석(${strong.nameKo} ${strongPct}%)이 상처 입지 않고 오래 보호받으려면 품어주는 따뜻한 흙(${weak.nameKo} ${weakPct}%) 기운을 곁에 둬야 해요.`,
    water_fire: `차갑고 깊은 물(${strong.nameKo} ${strongPct}%)의 기운이 강해 생각이 깊어지기 쉬우니, 추진력과 온기를 더해줄 태양(${weak.nameKo} ${weakPct}%) 기운이 꼭 필요해요.`,
    water_earth: `끝없이 흐르는 큰 물(${strong.nameKo} ${strongPct}%)이 사방으로 흩어지지 않고 재물로 고이려면 물길을 잡아주는 튼튼한 둑·땅(${weak.nameKo} ${weakPct}%)이 필요해요.`,
    water_wood: `고여 있기 쉬운 깊은 물(${strong.nameKo} ${strongPct}%)의 지혜가 현실 성과로 뻗어 나가려면 물을 빨아올려 꽃피우는 나무(${weak.nameKo} ${weakPct}%) 기운이 좋아요.`,
    water_metal: `맑은 물(${strong.nameKo} ${strongPct}%)이 흐려지지 않고 마르지 않는 샘이 되려면 깨끗한 원천인 보석·쇠(${weak.nameKo} ${weakPct}%) 기운을 채워야 해요.`,
  };

  return (
    pairStories[`${strong.key}_${weak.key}`] ??
    `내 사주에서 ${strong.naturalObject}(${strong.nameKo} ${strongPct}%) 기운이 가장 크게 자리 잡은 만큼, 비어 있는 ${weak.shortKo}(${weakPct}%) 기운을 보완할 때 운의 균형이 가장 아름답게 살아나요.`
  );
}

function buildPillarReading(pillar: PillarInfo): PillarReading {
  const roleMeta = PILLAR_ROLE_META[pillar.label] ?? {
    roleTitle: `${pillar.label}`,
    lifeStage: "사주의 한 축을 이루는 기운",
  };

  if (pillar.hanja === "未詳") {
    return {
      label: pillar.label,
      roleTitle: roleMeta.roleTitle,
      hanja: pillar.hanja,
      hangul: pillar.hangul,
      isUnknown: true,
      summary:
        "태어난 시간 정보가 없어 비워둔 자리예요. 년·월·일 6글자만으로도 핵심 성향과 올해 운의 흐름은 충분히 읽어낼 수 있어요.",
    };
  }

  const stemEl = ELEMENT_NATURE_MAP[pillar.stemElement];
  const branchEl = ELEMENT_NATURE_MAP[pillar.branchElement];
  const sameEl = stemEl.key === branchEl.key;

  const summary = sameEl
    ? `${roleMeta.lifeStage}이에요. 위아래가 모두 ${stemEl.naturalObject}(${stemEl.nameKo}) 기운으로 뭉쳐 있어 이 시기에 ${stemEl.shortKo} 특유의 에너지가 아주 선명하게 드러납니다.`
    : `${roleMeta.lifeStage}이에요. 겉(천간)으로는 ${stemEl.naturalObject}(${stemEl.nameKo}), 속(지지)으로는 ${branchEl.naturalObject}(${branchEl.nameKo}) 기운이 맞물려 균형을 이룹니다.`;

  return {
    label: pillar.label,
    roleTitle: roleMeta.roleTitle,
    hanja: pillar.hanja,
    hangul: pillar.hangul,
    isUnknown: false,
    summary,
  };
}

export function getStemNatureMeta(stemHanja: string): StemNatureMeta {
  return STEM_NATURE_MAP[stemHanja] ?? STEM_NATURE_MAP["甲"];
}

export function getElementNatureMeta(element: ElementKey): ElementNatureMeta {
  return ELEMENT_NATURE_MAP[element];
}

export function buildNatureStory(report: SajuReport): NatureStoryProfile {
  const stem = getStemNatureMeta(report.dayMasterHanja);
  const domEl = getElementNatureMeta(report.dominantElement);
  const weakEl = getElementNatureMeta(report.weakestElement);

  const domPct =
    report.elements.find((e) => e.key === report.dominantElement)?.percentage ??
    35;
  const weakPct =
    report.elements.find((e) => e.key === report.weakestElement)?.percentage ??
    0;

  const balanceStory = buildBalanceStory(
    domEl,
    weakEl,
    domPct,
    weakPct,
    stem.objectName
  );

  const cardStorySub = `${domEl.nameKo}(${domPct}%)이 강한 '${stem.shortName}' 사주예요. ${balanceStory}`;
  const carryAdviceOneLine = `부족한 ${weakEl.shortKo} 보완: ${weakEl.luckyColorShort} · 숫자 ${weakEl.luckyNumbers} (${weakEl.carryItemsShort})`;
  const carryAdviceLong = `내 사주에서 ${weakEl.nameKo} 기운이 ${weakPct}%로 부족하므로, 행운 숫자(${weakEl.luckyNumbers})나 ${weakEl.luckyColorShort} 계열의 ${weakEl.carryItemsFull}을(를) 평소 가방이나 손에 지니고 다니면 기운의 빈틈이 자연스럽게 채워져요.`;

  return {
    stemEmoji: stem.emoji,
    stemObjectName: stem.objectName,
    stemShortName: stem.shortName,
    cardHeadline: stem.headline,
    metaphorDesc: stem.metaphorDesc,
    strengthNote: stem.strengthNote,
    cautionNote: stem.cautionNote,
    dominantNameKo: domEl.nameKo,
    dominantShortKo: domEl.shortKo,
    dominantPct: domPct,
    dominantObject: domEl.naturalObject,
    dominantSummary: `${domEl.nameKo} ${domPct}% 강세`,
    missingKey: weakEl.key,
    missingEmoji: weakEl.emoji,
    missingNameKo: weakEl.nameKo,
    missingShortKo: weakEl.shortKo,
    missingPct: weakPct,
    missingNumbers: weakEl.luckyNumbers,
    missingColorShort: weakEl.luckyColorShort,
    missingCarryShort: weakEl.carryItemsShort,
    missingCarryFull: weakEl.carryItemsFull,
    balanceStory,
    cardStorySub,
    carryAdviceOneLine,
    carryAdviceLong,
    pillarReadings: report.pillars.map(buildPillarReading),
  };
}

export type TodayScoreTierKey = "SSR" | "SR" | "S" | "A";

export function resolveTodayScoreTier(score: number): TodayScoreTierKey {
  if (score >= 88) return "SSR";
  if (score >= 78) return "SR";
  if (score >= 66) return "S";
  return "A";
}

const STEM_TO_ELEMENT: Record<string, ElementKey> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

interface TodayPairStoryMeta {
  titleSuffix: string;
  growthLine: string;
  checkTip: string;
  cautionTip: string;
}

const TODAY_PAIR_STORIES: Record<`${ElementKey}_${ElementKey}`, TodayPairStoryMeta> = {
  wood_water: {
    titleSuffix: "맑은 물을 만나 쑥쑥 자라는 날",
    growthLine: "뿌리까지 단비가 스며들어 막힘없이 쑥쑥 자랄 수 있는 날이에요!",
    checkTip: "오전 중 미뤄둔 기획·제안 먼저 던지기",
    cautionTip: "욕심내서 일만 벌리고 휴식 거르지 않기",
  },
  wood_wood: {
    titleSuffix: "숲을 이루며 속도가 붙는 날",
    growthLine: "비슷한 결의 지원군이 모여 추진력이 2배로 살아나는 날이에요.",
    checkTip: "함께 일할 동료·지인과 아이디어 나누기",
    cautionTip: "내 방식만 고집하다 주변과 부딪히지 않기",
  },
  wood_fire: {
    titleSuffix: "햇빛을 받아 꽃피우는 날",
    growthLine: "안에 품었던 재능과 아이디어가 밖으로 환하게 드러나는 날이에요.",
    checkTip: "회의·SNS·대면 자리에서 존재감 드러내기",
    cautionTip: "텐션 올라 말실수·충동 결제 조심하기",
  },
  wood_earth: {
    titleSuffix: "깊은 땅에 뿌리를 단단히 내리는 날",
    growthLine: "흔들리던 계획과 자금이 차분하게 제자리를 찾아 굳어지는 날이에요.",
    checkTip: "재정 정리·계약 조건·체크리스트 점검하기",
    cautionTip: "너무 신중하게 재다가 좋은 타이밍 놓치지 않기",
  },
  wood_metal: {
    titleSuffix: "가지치기 후 더 단단해지는 날",
    growthLine: "불필요한 잡음을 쳐내고 진짜 핵심만 남기면 크게 성장하는 날이에요.",
    checkTip: "우선순위 낮은 일 과감히 정리·거절하기",
    cautionTip: "날 선 말이나 깐깐한 지적에 예민해지지 않기",
  },
  fire_wood: {
    titleSuffix: "땔감을 얻어 환하게 타오르는 날",
    growthLine: "마음속 열정이 다시 불붙으며 새로운 기회와 영감이 밀려오는 날이에요.",
    checkTip: "새 프로젝트 시작·연락 망설이던 곳 톡하기",
    cautionTip: "초반에 에너지 다 써서 오후에 방전되지 않기",
  },
  fire_fire: {
    titleSuffix: "태양처럼 스포트라이트 받는 날",
    growthLine: "존재감과 매력이 최고치에 달해 주변 시선이 나에게 모이는 날이에요.",
    checkTip: "주목받는 발표·만남·셀프 브랜딩 실행하기",
    cautionTip: "과열된 감정으로 욱하거나 지갑 열지 않기",
  },
  fire_earth: {
    titleSuffix: "뜨거운 열기를 결실로 굳히는 날",
    growthLine: "바쁘게 뛴 노력이 실제 수익과 평판으로 차곡차곡 쌓이는 날이에요.",
    checkTip: "정산·문서 마감·수익화 작업 끝맺기",
    cautionTip: "속으로 참다 소화기·피로 신호 놓치지 않기",
  },
  fire_metal: {
    titleSuffix: "빛으로 보석을 세공해 빛나는 날",
    growthLine: "날카로운 실속과 꼼꼼한 검증이 더해져 승부수가 완성되는 날이에요.",
    checkTip: "숫자·계약서·디테일 한 번 더 검수하기",
    cautionTip: "자존심 싸움으로 말꼬리 잡지 않기",
  },
  fire_water: {
    titleSuffix: "열기를 식히고 지혜가 맑아지는 날",
    growthLine: "지나치던 속도를 한 템포 늦추니 오히려 숨은 해법이 보이는 날이에요.",
    checkTip: "물 챙겨 마시며 조용히 핵심 전략 세우기",
    cautionTip: "기분 다운된다고 밤늦게 결정 내리지 않기",
  },
  earth_fire: {
    titleSuffix: "따뜻한 온기를 품어 풍요로워지는 날",
    growthLine: "주변의 지지와 온기가 모여 든든한 몫과 결실을 챙기는 날이에요.",
    checkTip: "윗사람·귀인의 조언을 기분 좋게 받아들이기",
    cautionTip: "미루기 습관 버리고 오후 골든타임 잡기",
  },
  earth_earth: {
    titleSuffix: "태산처럼 흔들림 없이 쌓이는 날",
    growthLine: "묵묵히 지켜온 기준이 빛을 발하며 자산과 신뢰가 단단해지는 날이에요.",
    checkTip: "루틴 유지·저축·장기 계획 점검하기",
    cautionTip: "남의 고민까지 떠안아 속 답답해지지 않기",
  },
  earth_metal: {
    titleSuffix: "품고 있던 보석을 꺼내 보이는 날",
    growthLine: "묵혀둔 실력과 준비가 깔끔한 결과물로 세상에 드러나는 날이에요.",
    checkTip: "포트폴리오 공유·협상에서 단호하게 요구하기",
    cautionTip: "완벽하려다 마감 시간 늦어지지 않기",
  },
  earth_water: {
    titleSuffix: "마른 대지에 재물 물길이 열리는 날",
    growthLine: "고여 있던 흐름이 촉촉하게 풀리며 현금과 정보 운이 도는 날이에요.",
    checkTip: "새로운 정보 탐색·유연한 제안 수락하기",
    cautionTip: "사소한 구독·배달 등 잔지출 새지 않게 막기",
  },
  earth_wood: {
    titleSuffix: "새싹을 틔우며 답답함이 뚫리는 날",
    growthLine: "정체됐던 일에 신선한 자극이 들어와 판이 새롭게 열리는 날이에요.",
    checkTip: "평소와 다른 루트·새 방식 한 가지 시도하기",
    cautionTip: "변화에 겁먹어 무조건 거절부터 하지 않기",
  },
  metal_earth: {
    titleSuffix: "단단한 보호 속에 빛이 짙어지는 날",
    growthLine: "실속과 안정감이 받쳐주어 내 가치가 한 단계 올라가는 날이에요.",
    checkTip: "기반 다지기·신뢰할 만한 사람과 손잡기",
    cautionTip: "작은 실수 하나에 지나치게 예민해지지 않기",
  },
  metal_metal: {
    titleSuffix: "칼날처럼 예리하게 승부 가르는 날",
    growthLine: "결단력과 집중력이 최고조로 올라 깔끔하게 결과를 따내는 날이에요.",
    checkTip: "질질 끌던 선택 오늘 안에 마침표 찍기",
    cautionTip: "직설적인 말투로 가까운 사람 상처 주지 않기",
  },
  metal_water: {
    titleSuffix: "보석이 맑은 물에 씻겨 영롱해지는 날",
    growthLine: "머리가 맑아지고 직관이 정확해져 한 수 앞을 내다보는 날이에요.",
    checkTip: "아이디어 메모·조용한 분석 후 움직이기",
    cautionTip: "생각만 너무 오래 하다 실행 늦추지 않기",
  },
  metal_wood: {
    titleSuffix: "목표를 정확히 겨눠 수확하는 날",
    growthLine: "실행력과 결단력이 맞물려 눈에 보이는 실적을 거두는 날이에요.",
    checkTip: "수익·성과로 직결되는 핵심 업무 먼저 처리하기",
    cautionTip: "상대 사정 안 보고 몰아붙이지 않기",
  },
  metal_fire: {
    titleSuffix: "뜨거운 담금질로 완성도가 뛰는 날",
    growthLine: "압박이 살짝 있어도 정면 돌파하면 몸값이 수직 상승하는 날이에요.",
    checkTip: "어려운 미션일수록 데이터·팩트로 깔끔히 풀기",
    cautionTip: "환절기 컨디션·목·어깨 긴장 풀고 쉬기",
  },
  water_metal: {
    titleSuffix: "맑은 샘물이 솟아 지혜가 채워지는 날",
    growthLine: "생각이 또렷해지고 나를 도와줄 귀한 정보와 귀인이 붙는 날이에요.",
    checkTip: "중요한 판단·공부·문서 검토 오전 중 끝내기",
    cautionTip: "혼자만의 기준에 갇혀 벽 세우지 않기",
  },
  water_water: {
    titleSuffix: "큰 물줄기가 합쳐져 스케일이 커지는 날",
    growthLine: "눈치와 정보력이 극대화되어 숨은 기회를 가장 먼저 잡는 날이에요.",
    checkTip: "정보 수집·인맥 안부·플랜 B 점검하기",
    cautionTip: "감정이 깊어져 밤늦게 불안 곱씹지 않기",
  },
  water_wood: {
    titleSuffix: "흐름을 타고 뻗어 나가며 꽃피우는 날",
    growthLine: "머릿속 아이디어가 실제 실행과 성과로 시원하게 뻗어 나가는 날이에요.",
    checkTip: "생각만 하던 일 오늘 바로 첫 행동 옮기기",
    cautionTip: "이것저것 손대다 집중력 흩어지지 않게 주의",
  },
  water_fire: {
    titleSuffix: "어둠을 밝히며 반전 기회가 켜지는 날",
    growthLine: "적극적으로 나설수록 막혔던 수익과 인연 운이 뜨겁게 풀리는 날이에요.",
    checkTip: "주저하던 연락·프레젠테이션 먼저 꺼내기",
    cautionTip: "낮과 밤 온도차에 컨디션 급방전 조심하기",
  },
  water_earth: {
    titleSuffix: "물길을 모아 재물로 가두는 날",
    growthLine: "사방으로 흩어지던 집중력과 돈이 튼튼한 그릇에 차곡차곡 모이는 날이에요.",
    checkTip: "예산·목표 1가지만 정해 끝까지 밀고 가기",
    cautionTip: "완벽한 타이밍 기다리다 발목 잡히지 않기",
  },
};

export interface TodayCardStory {
  score: number;
  scoreTier: TodayScoreTierKey;
  scoreGradeLabel: string;
  todayDateShort: string;
  todayGanZhiLabel: string;
  todayElement: ElementKey;
  todayElementEmoji: string;
  todayElementNameKo: string;
  todayElementShortKo: string;
  todayElementTag: string;
  myShortName: string;
  cardTitle: string;
  storyBody: string;
  checkText: string;
  cautionText: string;
}

export function buildTodayCardStory(
  report: SajuReport,
  today: TodayFortuneReport
): TodayCardStory {
  const stemMeta = getStemNatureMeta(report.dayMasterHanja);
  const myElement = STEM_TO_ELEMENT[report.dayMasterHanja] ?? report.dominantElement;
  const todayStemHanja = today.todayGanZhiHanja?.[0] || "壬";
  const todayElement = STEM_TO_ELEMENT[todayStemHanja] ?? "water";
  const todayElMeta = getElementNatureMeta(todayElement);

  const score = today.score;
  const scoreTier = resolveTodayScoreTier(score);
  const scoreGradeLabel =
    score >= 88
      ? "대길 · 최상 행운일"
      : score >= 78
      ? "상승 · 길운 가득"
      : score >= 66
      ? "순항 · 잔잔한 행운"
      : "충전 · 숨 고르는 날";

  const todayDateShort = today.dateLabel.replace(/^\d{4}년\s*/, "");
  const todayGanZhiLabel = `${today.todayGanZhiHangul}(${today.todayGanZhiHanja})일`;

  const pairMeta = TODAY_PAIR_STORIES[`${myElement}_${todayElement}`];
  const cardTitle = `${stemMeta.shortName} · ${pairMeta.titleSuffix}`;
  const storyBody = `나는 ${stemMeta.shortName}인데 오늘은 ${todayElMeta.nameKo}의 날이에요. ${pairMeta.growthLine}`;

  const shortAvoid = today.avoidAction
    .replace(/하기$/, "")
    .replace(/누르기$/, "누르지 않기");
  const checkText = `${pairMeta.checkTip} (${today.luckyTime})`;
  const cautionText = `${pairMeta.cautionTip} · ${shortAvoid}`;

  return {
    score,
    scoreTier,
    scoreGradeLabel,
    todayDateShort,
    todayGanZhiLabel,
    todayElement,
    todayElementEmoji: todayElMeta.emoji,
    todayElementNameKo: todayElMeta.nameKo,
    todayElementShortKo: todayElMeta.shortKo,
    todayElementTag: `${todayElMeta.nameKo.charAt(0)}의날`,
    myShortName: stemMeta.shortName,
    cardTitle,
    storyBody,
    checkText,
    cautionText,
  };
}
