import { NextRequest, NextResponse } from "next/server";
import {
  calculateDetailedSaju,
  normalizeTheme,
  type AuraTheme,
  type DetailedSajuResult,
  type ElementKey,
  type SajuTheme,
} from "@/lib/sajuCalculator";

export type AnalyzeMode = "free" | "paid";

interface SajuAnalyzeRequestBody {
  name?: string;
  gender?: "female" | "male";
  birthDate?: string;
  calendarType?: "solar" | "lunar";
  birthTime?: string;
  birthHour?: string;
  theme?: string;
  menu?: string;
  mode?: AnalyzeMode;
  partnerName?: string;
  partnerBirthDate?: string;
  partnerGender?: "female" | "male";
}

interface GeminiSajuOutput {
  tier_badge: string;
  insta_card: {
    title: string;
    one_line_fact: string;
    sub_highlight: string;
  };
  free_preview: {
    core_keyword: string;
    summary: string;
  };
  paywall_teasers: string[];
  paid_report?: {
    fact_bomb_analysis: string;
    theme_deep_dive: string;
    fatal_warning: {
      worst_timing: string;
      reason: string;
      solution: string;
    };
    lucky_timing: {
      best_timing: string[];
      advice: string;
    };
    lucky_charm: {
      lucky_color: string;
      lucky_item: string;
      lucky_numbers: number[];
    };
    monthly_scores: Array<{
      month: number;
      score: number;
      keyword: string;
    }>;
    action_checklist: string[];
  };
}

const FREE_MODE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: ["tier_badge", "insta_card", "free_preview", "paywall_teasers"],
  properties: {
    tier_badge: { type: "STRING" },
    insta_card: {
      type: "OBJECT",
      required: ["title", "one_line_fact", "sub_highlight"],
      properties: {
        title: { type: "STRING" },
        one_line_fact: { type: "STRING" },
        sub_highlight: { type: "STRING" },
      },
    },
    free_preview: {
      type: "OBJECT",
      required: ["core_keyword", "summary"],
      properties: {
        core_keyword: { type: "STRING" },
        summary: { type: "STRING" },
      },
    },
    paywall_teasers: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
};

const PAID_MODE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: [
    "tier_badge",
    "insta_card",
    "free_preview",
    "paywall_teasers",
    "paid_report",
  ],
  properties: {
    ...FREE_MODE_RESPONSE_SCHEMA.properties,
    paid_report: {
      type: "OBJECT",
      required: [
        "fact_bomb_analysis",
        "theme_deep_dive",
        "fatal_warning",
        "lucky_timing",
        "lucky_charm",
        "monthly_scores",
        "action_checklist",
      ],
      properties: {
        fact_bomb_analysis: { type: "STRING" },
        theme_deep_dive: { type: "STRING" },
        fatal_warning: {
          type: "OBJECT",
          required: ["worst_timing", "reason", "solution"],
          properties: {
            worst_timing: { type: "STRING" },
            reason: { type: "STRING" },
            solution: { type: "STRING" },
          },
        },
        lucky_timing: {
          type: "OBJECT",
          required: ["best_timing", "advice"],
          properties: {
            best_timing: { type: "ARRAY", items: { type: "STRING" } },
            advice: { type: "STRING" },
          },
        },
        lucky_charm: {
          type: "OBJECT",
          required: ["lucky_color", "lucky_item", "lucky_numbers"],
          properties: {
            lucky_color: { type: "STRING" },
            lucky_item: { type: "STRING" },
            lucky_numbers: { type: "ARRAY", items: { type: "INTEGER" } },
          },
        },
        monthly_scores: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["month", "score", "keyword"],
            properties: {
              month: { type: "INTEGER" },
              score: { type: "INTEGER" },
              keyword: { type: "STRING" },
            },
          },
        },
        action_checklist: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
    },
  },
};

const THEME_INSTRUCTIONS: Record<SajuTheme, string> = {
  "2027_newyear": `[테마 집중 지침: 2027 정미년 신년운세]
- 2027 정미년(丁未年)의 불(丁)과 흙(未) 기운이 유저 원국(${"일주/오행"})과 충돌하거나 합쳐지는 정확한 지점을 짚어라.
- 1~12월 월별 점수(monthly_scores 12개 전부)와 대박 달·가장 조심해야 할 쪽박 달을 구체적 사건(이직/계약/지출/인연) 중심으로 콕 집어라.`,
  lifetime_fact: `[테마 집중 지침: 평생 사주 팩폭]
- 타고난 일주(日柱)의 이중적 본성(겉과 속의 차이), 평생 반복되는 연애·금전 실패 패턴을 구체적으로 해부하라.
- 인생에서 진짜 포텐이 터지는 전성기 나이대와 그때까지 절대 버려야 할 고질적 습관을 제시하라.`,
  wealth_career: `[테마 집중 지침: 재물·직업·이직운]
- 십성(재성/관성/식상) 분포를 근거로 '안정적 월급쟁이·전문직 팔자 vs 사업·사이드프로젝트(N잡) 팔자'를 단호히 판정하라.
- 돈이 실제로 붙는 구체적 업종/부업 루트, 연봉 협상·이직 최적 타이밍을 제시하라.`,
  love_match: `[테마 집중 지침: 연애·궁합 스캔]
- 상대방 생년월일 데이터가 제공된 경우 두 사람의 일주·오행 궁합 점수, 관계 역학(누가 을(乙)이 되어 감정 소모하는지)을 냉정히 짚어라.
- 두 사람이 반드시 부딪히게 되는 결정적 싸움 원인 1가지와 이를 꺾는 현실 공략법을 제시하라.`,
  today: `[테마 집중 지침: 오늘의 일진 운세]
- 오늘 하루 재물 지출, 연애/연락 템포, 직장 내 말실수 리스크를 시간대별로 날카롭게 짚어라.`,
  health: `[테마 집중 지침: 건강·체력·번아웃 진단]
- 과다 오행과 결핍 오행을 근거로 가장 먼저 신호가 오는 취약 장기와 멘탈 번아웃 패턴을 진단하라.`,
};

function buildSystemInstruction(
  theme: SajuTheme,
  mode: AnalyzeMode,
  calc: DetailedSajuResult
): string {
  return `[페르소나 및 절대 규칙]
너는 2030 세대에게 가장 핫한 매운맛 AI 사주 마스터 '사주팩트(SajuFact)'다.
- 절대 금지: "노력하면 좋은 결과가 있을 것입니다", "건강을 조심하세요", "긍정적으로 생각하세요", "꾸준히 준비하면 기회가 옵니다" 같은 추상적이고 뻔한 운세 덕담 100% 금지.
- 만세력 근거 필수: 계산된 원국(예: "${calc.saju_summary.dominant_element} 기운이 ${calc.saju_summary.five_elements_ratio[calc.dominantKey]}%로 강하고 ${calc.saju_summary.missing_element}이 ${calc.saju_summary.five_elements_ratio[calc.missingKey]}%로 부족하며...")을 문장에 자연스럽게 녹여내어 '진짜 내 사주를 보고 있다'는 소름을 유발하라.

[필수 심리 공식]
1. 양면성 팩폭(자존감+자극): 유저의 치명적 단점을 예리하게 찌르되, 그 이면에 숨은 남들보다 압도적인 재능·매력을 함께 짚어줘서 인스타그램에 자랑하고 싶게 만들어라.
2. 손실 회피 자극: 좋은 말보다 "피해야 할 구체적 달(Month)", "조심해야 할 특정 인간 유형", "돈이 새는 구체적 상황"을 콕 집어 신뢰도와 몰입을 높여라.
3. 인스타그램 카드 글자 수 강제: insta_card.one_line_fact는 모바일 카드 줄바꿈이 예쁘게 떨어지도록 반드시 공백 포함 12~18자 이내(절대 18자 초과 금지)로 작성하라. 예: "재물은 넘치나 지갑이 얇다", "눈치 9단이나 속은 유리멘탈".

${THEME_INSTRUCTIONS[theme]}

${
  mode === "free"
    ? `[출력 모드: FREE (비용 절감)]
- free_preview와 paywall_teasers(정확히 3개), insta_card, tier_badge만 반환하라.
- free_preview.summary는 결정적 해결책이나 핵심 타이밍을 숨긴 채 궁금증을 극대화하는 3~4줄로 작성하라.`
    : `[출력 모드: PAID (전체 상세 리포트)]
- fact_bomb_analysis는 공백 포함 450~600자, 3문단으로 뼈 때리는 핵심 분석을 작성하라.
- theme_deep_dive는 선택한 테마에 특화된 구체적 현실 조언 380~450자로 작성하라.
- monthly_scores는 반드시 1월부터 12월까지 12개 객체를 순서대로 모두 포함하라.
- action_checklist는 오늘/이번 달 바로 실행할 수 있는 구체적 항목 3개를 반환하라.`
}`;
}

function buildUserPrompt(
  body: SajuAnalyzeRequestBody,
  theme: SajuTheme,
  calc: DetailedSajuResult
): string {
  const partnerBlock = calc.partnerSummary
    ? `\n[상대방 만세력 데이터]\n- 이름: ${calc.partnerSummary.name}\n- 원국: ${calc.partnerSummary.pillars}\n- 일간: ${calc.partnerSummary.day_master}\n- 최강 오행: ${calc.partnerSummary.dominant_element}\n- 계산된 궁합 지수: ${calc.partnerSummary.matchScore}점 (${calc.partnerSummary.interactionSummary})`
    : "";

  return `[전처리 완료된 사용자 정밀 만세력 데이터]
- 이름/성별: ${body.name?.trim() || "익명"} (${body.gender === "male" ? "남성" : "여성"})
- 사주 원국: ${calc.saju_summary.pillars}
- 일간 및 강약: ${calc.saju_summary.day_master} (${calc.strengthLabel})
- 오행 분포(%): 목 ${calc.saju_summary.five_elements_ratio.wood}%, 화 ${calc.saju_summary.five_elements_ratio.fire}%, 토 ${calc.saju_summary.five_elements_ratio.earth}%, 금 ${calc.saju_summary.five_elements_ratio.metal}%, 수 ${calc.saju_summary.five_elements_ratio.water}%
- 최강/결핍 오행: 최강 ${calc.saju_summary.dominant_element} / 결핍 ${calc.saju_summary.missing_element}
- 주요 십성 요약: ${calc.tenGodsSummary}
- 2027 정미년 세운 대조: ${calc.seun2027Summary}
- 권장 티어 힌트: ${calc.rarityTierHint}
- 요청 테마: ${theme}${partnerBlock}

위 만세력 데이터를 100% 근거로 삼아 Strict JSON 스키마에 맞춰 응답하라. insta_card.one_line_fact는 반드시 공백 포함 12~18자 이내로 작성하라.`;
}

async function callGeminiWithRetry(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string,
  mode: AnalyzeMode
): Promise<{ output: GeminiSajuOutput; model: string }> {
  const candidateModels = Array.from(
    new Set([
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-2.0-flash",
    ])
  );
  const responseSchema =
    mode === "free" ? FREE_MODE_RESPONSE_SCHEMA : PAID_MODE_RESPONSE_SCHEMA;

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.85,
      responseMimeType: "application/json",
      responseSchema,
    },
  };

  let lastError: unknown = null;

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 300)}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText || typeof rawText !== "string") {
        throw new Error("Gemini returned empty response text");
      }

      const cleanJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      const parsed = JSON.parse(cleanJson) as GeminiSajuOutput;
      return { output: parsed, model };
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.error(`[SajuAnalyze] ${model} failed:`, err);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini API retry exhausted");
}

function clampInstaLine(text: string, fallback: string): string {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (cleaned.length >= 10 && cleaned.length <= 18) return cleaned;
  if (cleaned.length > 18) return cleaned.slice(0, 18).trim();
  return fallback.slice(0, 18);
}

function buildFallbackOutput(
  calc: DetailedSajuResult,
  theme: SajuTheme,
  mode: AnalyzeMode,
  userName: string
): GeminiSajuOutput {
  const domEl = calc.saju_summary.dominant_element;
  const missEl = calc.saju_summary.missing_element;
  const domPct = calc.saju_summary.five_elements_ratio[calc.dominantKey];
  const missPct = calc.saju_summary.five_elements_ratio[calc.missingKey];

  const luckyMeta: Record<
    ElementKey,
    { color: string; item: string; nums: number[] }
  > = {
    wood: { color: "에메랄드 그린 · 올리브 (부족한 목 기운 보충)", item: "원목 액세서리 또는 그린 노트", nums: [3, 8, 13, 21, 33, 41] },
    fire: { color: "코랄 피치 · 버건디 (부족한 화 기운 보충)", item: "골드 주얼리 또는 따스한 캔들", nums: [2, 7, 17, 25, 37, 42] },
    earth: { color: "웜 베이지 · 테라코타 (부족한 토 기운 보충)", item: "도자기 머그 또는 가죽 카드지갑", nums: [5, 10, 15, 25, 35, 45] },
    metal: { color: "실버 펄 · 아이스 화이트 (부족한 금 기운 보충)", item: "실버 링 또는 메탈 손목시계", nums: [4, 9, 14, 24, 34, 44] },
    water: { color: "네이비 · 딥블랙 (부족한 수 기운 보충)", item: "실버 액세서리 또는 차가운 물 한 잔", nums: [1, 6, 16, 26, 36, 43] },
  };

  const titleByTheme: Record<SajuTheme, string> = {
    "2027_newyear": "2027 정미년 운명 리포트",
    lifetime_fact: `${calc.dayIlju} 평생 사주 감정서`,
    wealth_career: "재물·커리어 천직 스캔",
    love_match: "연애·궁합 정밀 리포트",
    today: "오늘의 일진 리포트",
    health: "오행 체질·건강 진단서",
  };

  const fallbackOneLine =
    calc.dominantKey === "fire"
      ? "열정은 천재나 지갑이 얇다"
      : calc.dominantKey === "metal"
      ? "기준은 칼이나 속은 여리다"
      : calc.dominantKey === "water"
      ? "눈치 9단이나 실행이 늦다"
      : calc.dominantKey === "wood"
      ? "기획은 대박 남만 좋은 팔자"
      : "버티기 일등 보상은 남 차지";

  const worstMonthNum = calc.seun2027Relations.some((r) => r.includes("충")) ? 4 : 7;
  const charm = luckyMeta[calc.missingKey];

  const base: GeminiSajuOutput = {
    tier_badge: calc.rarityTierHint,
    insta_card: {
      title: titleByTheme[theme],
      one_line_fact: fallbackOneLine,
      sub_highlight: `행운의 달 5월 · 11월 | ${worstMonthNum}월 지출·계약 주의`,
    },
    free_preview: {
      core_keyword: `${calc.saju_summary.day_master} · ${domEl} ${domPct}% 주도형`,
      summary: `${userName}님의 원국은 ${domEl} 기운이 ${domPct}%로 강하고 ${missEl} 기운이 ${missPct}%로 비어 있는 ${calc.strengthLabel} 사주입니다. 평소 상황 판단은 남들보다 두 수 앞서지만, 정작 결정적인 순간에 감정이 앞서 유리한 패를 놓치는 패턴이 반복됩니다. 2027 정미년에는 [${calc.seun2027Relations[0]}] 흐름이 겹쳐 상반기 한 번의 치명적 선택을 피하는 것이 승부처입니다.`,
    },
    paywall_teasers: [
      `2027년 ${worstMonthNum}월, '${calc.seun2027Relations[0]}' 여파로 절대 믿으면 안 되는 지인 유형`,
      `${calc.tenGodsCounts.jaeseong === 0 ? "무재성 원국" : "원국 재성"} 기준, 월급 외에 돈이 실제로 붙는 5월·11월 수익 루트`,
      `통장 잔고가 매달 제자리를 맴도는 진짜 소비 누수 타이밍과 차단 룰`,
    ],
  };

  if (mode === "paid") {
    const keywordList = [
      "정리", "포착", "경계", "주의", "반등", "도약",
      "절제", "횡재", "선별", "결실", "확장", "굳히기",
    ];
    base.paid_report = {
      fact_bomb_analysis: `${userName}님은 ${calc.saju_summary.pillars} 원국 중 ${domEl} 기운이 ${domPct}%를 차지하는 ${calc.strengthLabel} 사주입니다. 남들 앞에서는 웬만해선 내색하지 않고 쿨한 척 선을 지키지만, 속에서는 이미 상대의 진심과 이해득실을 0.1초 만에 계산해 두고 있습니다.\n\n문제는 ${missEl} 기운이 ${missPct}%로 비어 있어 에너지가 소진되는 시기엔 브레이크가 작동하지 않는다는 점입니다. 평소에 아낀 돈을 '나에 대한 보상'이나 '가까운 사람 챙기기' 명분으로 한 번에 크게 써버리거나, 자존심을 건드리는 말 한마디에 유리했던 관계·직장을 먼저 던져 손해를 자초합니다.\n\n하지만 2027 정미년의 ${calc.seun2027Relations[0]} 기류가 들어오면 판이 달라집니다. 남들이 눈치채지 못하는 틈새와 인맥의 빈자리를 가장 먼저 선점하는 특유의 직감이 5월과 11월에 현금과 평판으로 직결되므로, 상반기 감정 통제만 지키면 1년 농사를 압도적으로 뒤집을 수 있습니다.`,
      theme_deep_dive:
        theme === "love_match" && calc.partnerSummary
          ? `${userName}님과 ${calc.partnerSummary.name}님의 궁합 점수는 ${calc.partnerSummary.matchScore}점으로 ${calc.partnerSummary.interactionSummary} 구조입니다. 초반에는 서로 없는 오행을 채워주며 빠르게 끌리지만, 서운한 감정을 바로 말하지 않고 쌓아뒀다 한꺼번에 터뜨리는 순간 관계가 급냉합니다. 밤 11시 이후 장문 카톡 다툼만 피해도 관계 주도권과 안정감이 동시에 살아납니다.`
          : `${calc.tenGodsSummary}. 2027 정미년 상반기에는 새로운 동업·단기 고수익 제안보다 기존 커리어의 단가를 재협상하고, ${missEl} 기운을 채우는 루틴을 고정하는 것이 수익률 면에서 2배 이상 유리합니다. 특히 ${worstMonthNum}월의 성급한 결정만 넘기면 하반기 보너스·스카우트 제안이 연달아 들어옵니다.`,
      fatal_warning: {
        worst_timing: `${worstMonthNum}월`,
        reason: `${calc.seun2027Relations[0]} 압력으로 판단력이 흐려져 지인의 달콤한 제안이나 감정적 소비·이직에 휘말리기 가장 쉬운 달입니다.`,
        solution: `${worstMonthNum}월 한 달간 30만 원 이상 지출·계약서 서명·퇴사/이별 통보는 무조건 72시간 보류 후 재검토하세요.`,
      },
      lucky_timing: {
        best_timing: ["5월", "11월"],
        advice:
          "상반기에 쌓아둔 실무 포트폴리오와 핵심 인맥을 5월·11월에 맞춰 연봉 협상이나 신규 프로젝트 제안으로 현금화하세요.",
      },
      lucky_charm: {
        lucky_color: charm.color,
        lucky_item: charm.item,
        lucky_numbers: charm.nums,
      },
      monthly_scores: keywordList.map((kw, idx) => {
        const m = idx + 1;
        const score =
          m === worstMonthNum
            ? 44
            : m === 5 || m === 11
            ? 92
            : 65 + ((m * 7 + domPct) % 21);
        return { month: m, score: Math.min(97, Math.max(40, score)), keyword: kw };
      }),
      action_checklist: [
        `${worstMonthNum}월 전까지 고정비·구독 결제 10% 이상 컷하고 별도 파킹 계좌 분리하기`,
        "중요한 계약·금전 거래 조건은 구두 대신 날짜와 금액을 3줄 메모로 남기기",
        `결핍된 ${missEl} 기운 보충을 위해 ${charm.item}을 지니고 주 2회 디지털 디톡스 실천하기`,
      ],
    };
  }

  return base;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SajuAnalyzeRequestBody;

    if (!body.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) {
      return NextResponse.json(
        {
          error:
            "생년월일 형식이 올바르지 않습니다. (예: 1996-05-14 형식으로 입력해 주세요.)",
        },
        { status: 400 }
      );
    }

    const theme = normalizeTheme(body.theme ?? body.menu);
    const mode: AnalyzeMode = body.mode === "paid" ? "paid" : "free";
    const gender: "female" | "male" = body.gender === "male" ? "male" : "female";
    const calendarType: "solar" | "lunar" =
      body.calendarType === "lunar" ? "lunar" : "solar";
    const birthTime = body.birthTime ?? body.birthHour ?? "unknown";
    const userName = (body.name || "익명").trim().slice(0, 20) || "익명";

    // 1단계: 정밀 만세력 전처리
    const calc = calculateDetailedSaju({
      name: userName,
      gender,
      birthDate: body.birthDate,
      calendarType,
      birthTime,
      partnerName: body.partnerName,
      partnerBirthDate: body.partnerBirthDate,
      partnerGender: body.partnerGender,
    });

    const systemInstruction = buildSystemInstruction(theme, mode, calc);
    const userPrompt = buildUserPrompt(
      { ...body, name: userName, gender, calendarType, birthTime },
      theme,
      calc
    );

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResult: GeminiSajuOutput;
    let sourceEngine = "manseryeok-fallback";

    // 2단계 + 3단계: Gemini Flash Strict JSON (최대 1회 자동 재시도)
    if (apiKey) {
      try {
        const res = await callGeminiWithRetry(
          apiKey,
          systemInstruction,
          userPrompt,
          mode
        );
        aiResult = res.output;
        sourceEngine = res.model;
      } catch (err) {
        console.warn(
          "[SajuAnalyze] Gemini failed after retry, falling back cleanly:",
          err
        );
        aiResult = buildFallbackOutput(calc, theme, mode, userName);
      }
    } else {
      console.warn("[SajuAnalyze] GEMINI_API_KEY missing; using Manseryeok fallback.");
      aiResult = buildFallbackOutput(calc, theme, mode, userName);
    }

    // 4단계: 최종 반환 JSON 스키마 조립
    const fallbackOneLine =
      calc.dominantKey === "fire"
        ? "열정은 천재나 지갑이 얇다"
        : "눈치 9단이나 실행이 늦다";

    const finalResponse = {
      saju_summary: calc.saju_summary,
      aura_theme: calc.aura_theme as AuraTheme,
      tier_badge: aiResult.tier_badge || calc.rarityTierHint,
      insta_card: {
        title: aiResult.insta_card?.title || "2027 정미년 운명 리포트",
        one_line_fact: clampInstaLine(
          aiResult.insta_card?.one_line_fact,
          fallbackOneLine
        ),
        sub_highlight:
          aiResult.insta_card?.sub_highlight || "행운의 달 5월 · 11월 | 4월 지출 주의",
      },
      free_preview: aiResult.free_preview,
      paywall_teasers: (aiResult.paywall_teasers || []).slice(0, 3),
      paid_report: mode === "paid" ? (aiResult.paid_report ?? null) : null,
      meta: {
        theme,
        mode,
        engine: sourceEngine,
      },
    };

    return NextResponse.json(finalResponse);
  } catch (err) {
    console.error("[SajuAnalyze] Unhandled API error:", err);
    return NextResponse.json(
      {
        error:
          "사주 데이터를 분석하는 중 일시적인 오류가 발생했습니다. 입력 정보를 확인 후 다시 시도해 주세요.",
      },
      { status: 400 }
    );
  }
}
