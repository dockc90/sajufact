import { NextRequest, NextResponse } from "next/server";
import { getChatPersona } from "@/lib/chat-personas";
import { generateSajuReport } from "@/lib/saju-engine";
import type { ChatPersonaId, SajuReport } from "@/lib/saju-types";
import {
  calculateDetailedSaju,
  type DetailedSajuResult,
} from "@/lib/sajuCalculator";

interface ChatRequestBody {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  profile?: {
    name?: string;
    gender?: "female" | "male";
    birthDate?: string;
    calendarType?: "solar" | "lunar";
    birthHour?: string;
  };
  reportContext?: string;
  personaId?: ChatPersonaId;
  topicCategory?: string;
  topicDetail?: string;
}

interface GeminiChatOutput {
  reply: string;
  suggestions: string[];
}

const CHAT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: ["reply", "suggestions"],
  properties: {
    reply: { type: "STRING" },
    suggestions: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
};

type ChatIntent =
  | "avoid_month"
  | "lucky_month"
  | "love"
  | "wealth"
  | "career"
  | "relationship"
  | "health"
  | "daeun"
  | "today_talisman"
  | "general";

function detectIntent(
  message: string,
  historyText: string,
  combinedTopic: string
): ChatIntent {
  const msg = message.toLowerCase();
  const ctx = `${msg} ${combinedTopic} ${historyText.slice(-260)}`.toLowerCase();

  if (
    /피해야|피할|조심|주의|나쁜\s*달|안\s*좋|최악|흉한|합충|충돌|망하는|손해/.test(
      msg
    ) ||
    (/몇\s*월|어느\s*달|무슨\s*달/.test(msg) &&
      /피해야|피할|조심|주의|나쁜|안\s*좋|흉/.test(ctx))
  ) {
    return "avoid_month";
  }

  if (
    /좋은\s*달|대박|횡재|길일|택일|계약|날짜|언제.*좋|타이밍|승률|몇\s*월|어느\s*달/.test(
      msg
    )
  ) {
    return "lucky_month";
  }

  if (/연애|썸|재회|전\s*남|전\s*여|결혼|배우자|애인|사랑|이별|고백|도화|속마음/.test(ctx)) {
    return "love";
  }
  if (/돈|재물|투자|주식|코인|부업|저축|소비|지출|통장|연봉|재테크|금전|부동산/.test(ctx)) {
    return "wealth";
  }
  if (/이직|퇴사|직장|회사|승진|진로|적성|창업|사업|시험|합격|취업|천직/.test(ctx)) {
    return "career";
  }
  if (/사람|인간관계|상사|동료|친구|가족|부모|귀인|상극|구설|갈등|인복/.test(ctx)) {
    return "relationship";
  }
  if (/건강|번아웃|피곤|우울|불안|멘탈|스트레스|수면|체질|몸|아프|에너지/.test(ctx)) {
    return "health";
  }
  if (/대운|평생|그릇|본성|성향|성격|강점|단점|황금기|전성기|원국/.test(ctx)) {
    return "daeun";
  }
  if (/개운|행운|루틴|부적|컬러|색깔|아이템|오늘|일진/.test(ctx)) {
    return "today_talisman";
  }
  return "general";
}

function wrapByPersonaTone(
  personaId: ChatPersonaId,
  name: string,
  dayIlju: string,
  sections: {
    factLead: string;
    masterLead: string;
    warmLead: string;
    strategistLead: string;
    coreBody: string;
    actionTail: string;
  }
): string {
  switch (personaId) {
    case "master":
      return `${sections.masterLead}\n\n${sections.coreBody}\n\n📌 달도사의 간명 결론: ${sections.actionTail} (${name}님 ${dayIlju} 명식 기준) 🌕`;
    case "warm":
      return `${sections.warmLead}\n\n${sections.coreBody}\n\n🌷 달토의 따뜻한 처방: ${sections.actionTail} 🌙🥕`;
    case "strategist":
      return `${sections.strategistLead}\n\n${sections.coreBody}\n\n✅ 바로 실행할 전략: ${sections.actionTail} 🥕✨`;
    case "fact":
    default:
      return `${sections.factLead}\n\n${sections.coreBody}\n\n💊 달토의 현실 처방전: ${sections.actionTail} 🐇🥕`;
  }
}

function buildIntentAwareFallbackReply(
  personaId: ChatPersonaId,
  name: string,
  calc: DetailedSajuResult,
  report: SajuReport,
  message: string,
  historyText: string,
  combinedTopic: string
): { reply: string; suggestions: string[] } {
  const intent = detectIntent(message, historyText, combinedTopic);
  const dom = calc.saju_summary.dominant_element;
  const domPct = calc.saju_summary.five_elements_ratio[calc.dominantKey];
  const miss = calc.saju_summary.missing_element;
  const seunRel = calc.seun2027Relations[0] || "기운 교차";

  const sortedLow = [...report.monthlyFlow].sort((a, b) => a.score - b.score);
  const sortedHigh = [...report.monthlyFlow].sort((a, b) => b.score - a.score);
  const worst1 = sortedLow[0];
  const worst2 = sortedLow[1];
  const best1 = sortedHigh[0];
  const best2 = sortedHigh[1];

  const taekilList =
    report.taekilReport?.recommendedDates
      .map((d) => `${d.dateLabel}(${d.purpose})`)
      .join(", ") || `${best1.label}, ${best2.label}`;

  if (intent === "avoid_month") {
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju})! 애매하게 돌리지 않고 딱 몇 월을 피해야 하는지부터 짚어드릴게요.`,
        masterLead: `${name}님의 명식(${calc.dayIlju})과 2027 정미년 월운을 대조해 보니, 반드시 삼가야 할 달이 명확히 드러났소.`,
        warmLead: `${name}님(${calc.dayIlju}), 미리 조심할 달을 정확히 알아두면 불필요한 마음 고생을 크게 줄일 수 있어요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 2027년 리스크 방어 월별 브리핑입니다.`,
        coreBody:
          `1순위 주의할 달은 **${report.criticalMistake2027.dangerMonth}** (운세 ${worst1.score}점 · '${worst1.tag}')이고, 2순위는 **${worst2.label}** (${worst2.score}점 · '${worst2.tag}')입니다.\n` +
          `원국에서 ${dom}(${domPct}%) 기운이 강하고 ${miss}이 비어 있는 상태에서 [${seunRel}] 압력이 겹쳐, 이 시기에는 '${report.criticalMistake2027.title}' 위험이 커집니다. (${worst1.note})\n` +
          `반대로 **${best1.label}(${best1.score}점)**과 **${best2.label}(${best2.score}점)**에는 운기가 크게 반등하니, 이직·계약·큰 지출은 꼭 이 달로 넘기세요.`,
        actionTail: report.criticalMistake2027.actionRule,
      }),
      suggestions: [
        `${best1.label}에 잡아야 할 횡재·기회는?`,
        `${worst1.label}에 특히 조심할 인간관계는?`,
      ],
    };
  }

  if (intent === "lucky_month") {
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju}), 2027년에 돈·기회가 실제로 터지는 핵심 달만 딱 집어드릴게요.`,
        masterLead: `${name}님(${calc.dayIlju}) 명식에서 재성과 관성이 살아나는 길운의 달을 짚어드리겠소.`,
        warmLead: `${name}님(${calc.dayIlju}), 반짝이고 기분 좋은 소식이 찾아올 달을 먼저 알려드릴게요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 2027년 승부수 타이밍 리포트입니다.`,
        coreBody:
          `가장 흐름이 좋은 달은 **${best1.label}(${best1.score}점 · ${best1.tag})**과 **${best2.label}(${best2.score}점 · ${best2.tag})**이며, 횡재 피크는 **${report.windfallTiming.bestMonth}**입니다.\n` +
          `핵심 수익·성취 경로는 '${report.windfallTiming.moneyRoute}' 쪽으로 열립니다. 추천 길일은 **${taekilList}**입니다.\n` +
          `단, **${worst1.label}(${worst1.score}점)**에는 성급한 계약·지출을 반드시 피해야 좋은 달의 수익을 온전히 지킬 수 있습니다.`,
        actionTail: `${best1.label} 2주 전부터 포트폴리오·협상안·프로필을 미리 완성해 두고 제안이 오면 바로 잡으세요.`,
      }),
      suggestions: [
        `${worst1.label}에 조심할 점 더 자세히`,
        "내 사주에 맞는 수익 루트는?",
      ],
    };
  }

  if (intent === "love") {
    const love = report.loveReport;
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju}) 연애 패턴, 겉과 속이 달라서 자꾸 손해 보는 포인트부터 짚어볼게요.`,
        masterLead: `${name}님(${calc.dayIlju})의 일지와 도화·배우자궁 흐름을 살펴보니 연애의 결이 뚜렷하오.`,
        warmLead: `${name}님(${calc.dayIlju}), 사랑 앞에서는 유독 마음이 여려지고 혼자 애태우기 쉬운 사주예요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 연애·관계 주도권 전략입니다.`,
        coreBody:
          `타고난 연애 패턴은 **'${love?.patternTitle || "밀당보다 진심에 약한 타입"}'**입니다.\n` +
          `• 끌리는 포인트: ${love?.attractionTrigger || `${dom} 기운이 강해 첫인상 카리스마가 뚜렷함`}\n` +
          `• 도화·인연 피크: **${love?.goldenTiming || `${best1.label} · ${best2.label}`}** (가장 조심할 갈등 달은 **${worst1.label}**)\n` +
          `감정이 올라오는 날 밤늦게 서운함을 한꺼번에 터뜨리기보다, 원하는 기준 1가지만 차분히 말하는 편이 관계 유지에 훨씬 유리합니다.`,
        actionTail:
          love?.lovePrescription ||
          "이번 주엔 먼저 연락을 재촉하기보다 상대의 반응 속도와 행동을 3일만 관찰해 보세요.",
      }),
      suggestions: [
        `${best1.label} 인연운 자세히 알려줘`,
        "나랑 잘 맞는 상대 특징은?",
      ],
    };
  }

  if (intent === "wealth") {
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju}), 돈을 못 버는 사주가 아니라 새는 구멍이 딱 정해져 있는 사주예요.`,
        masterLead: `${name}님(${calc.dayIlju})의 재성(${calc.tenGodsSummary})과 월별 재물운을 짚어드리겠소.`,
        warmLead: `${name}님(${calc.dayIlju}), 열심히 살아온 만큼 통장이 든든하게 채워지길 바라는 마음이 느껴져요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 재물 누수 차단 & 수익 극대화 전략입니다.`,
        coreBody:
          `• 돈 새는 습관: ${report.coreFactReport.moneyLeakHabit}\n` +
          `• 재물·횡재 피크: **${report.windfallTiming.bestMonth}** (${best1.label} ${best1.score}점 · ${best2.label} ${best2.score}점) — ${report.windfallTiming.moneyRoute}\n` +
          `• 지출·손실 경계 달: **${worst1.label}(${worst1.score}점)**과 **${worst2.label}(${worst2.score}점)**에는 지인 투자 권유·충동 결제를 절대 피하세요.`,
        actionTail: `월급·수입 입금일 당일 15%를 별도 파킹 통장으로 자동이체하고, ${worst1.label} 큰 결제는 72시간 보류 규칙을 거세요.`,
      }),
      suggestions: [
        "직장인 vs 사업·부업 뭐가 맞아?",
        `${best1.label}에 재물운 키우는 법`,
      ],
    };
  }

  if (intent === "career") {
    const yearsStr =
      report.yeonunReport?.years
        .map((y) => `${y.year}년(${y.score}점·${y.badge})`)
        .join(" → ") || "2026~2028 상승 흐름";
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju}), 감정 때문에 홧김에 퇴사·이직하면 손해 보는 팔자라 타이밍이 생명입니다.`,
        masterLead: `${name}님(${calc.dayIlju})의 관성·식상 구조와 3년 연운 흐름으로 진로를 가늠해 보겠소.`,
        warmLead: `${name}님(${calc.dayIlju}), 지금 버텨야 할지 옮겨야 할지 고민이 깊으셨군요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 이직·커리어 승률 분석입니다.`,
        coreBody:
          `• 3년 연운 흐름: ${yearsStr}\n` +
          `• 10년 대운 황금기: **${report.daeunReport?.goldenAge || "30~40대 확장기"}**\n` +
          `• 최적 이동·협상 달: **${best1.label}(${best1.score}점)**, **${best2.label}(${best2.score}점)** / 추천 길일: ${taekilList}\n` +
          `• 피해야 할 이동 달: **${worst1.label}(${worst1.score}점)**에는 이직 후 조건 불일치나 업무 과부하가 걸리기 쉬우니 서류 확정 전 움직이지 마세요.`,
        actionTail:
          report.taekilReport?.avoidDatesNote ||
          `${best1.label} 타깃으로 이력서·포트폴리오를 미리 3군데 이상 비교해 조건표를 먼저 확보하세요.`,
      }),
      suggestions: [
        `${best1.label} 이직·연봉 협상 팁은?`,
        "내 사주에 딱 맞는 직무·천직은?",
      ],
    };
  }

  if (intent === "relationship") {
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju}), 남 눈치 챙기다 내 속만 곪는 관계 패턴을 끊어야 해요.`,
        masterLead: `${name}님(${calc.dayIlju}) 원국의 ${dom}(${domPct}%)과 비견·관성 작용을 짚어드리겠소.`,
        warmLead: `${name}님(${calc.dayIlju}), 사람에게 마음을 진심으로 주다 보니 상처도 깊게 받으셨을 거예요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 인간관계·귀인 선별 전략입니다.`,
        coreBody:
          `• 피해야 할 상극 유형: ${report.coreFactReport.toxicRelationWarning}\n` +
          `• 구설·오해 주의 달: **${worst1.label}(${worst1.score}점)**과 **${worst2.label}(${worst2.score}점)**에는 단체 톡방 말실수·뒷담화 연루를 각별히 조심하세요.\n` +
          `• 귀인이 붙는 달: **${best1.label}(${best1.score}점)**에는 부족한 ${miss} 기운을 채워주는 차분하고 실무에 강한 귀인이 연결됩니다.`,
        actionTail: "부탁이나 감정 하소연이 반복되는 사람과는 답장 간격을 하루 이상 두어 에너지 경계선을 치세요.",
      }),
      suggestions: [
        "나를 돕는 귀인의 특징은?",
        `${worst1.label} 직장 스트레스 대처법`,
      ],
    };
  }

  if (intent === "health") {
    const h = report.healthReport;
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju}), 몸이 신호를 보내는데도 "좀만 더 버티자" 하다 한 번에 퍼지는 타입이에요.`,
        masterLead: `${name}님(${calc.dayIlju})의 과다한 ${dom}(${domPct}%)과 부족한 ${miss} 오행으로 체질 균형을 살폈소.`,
        warmLead: `${name}님(${calc.dayIlju}), 몸과 마음이 동시에 지쳐 있다는 신호를 이제는 꼭 들어주셔야 해요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 번아웃·건강 리스크 관리 가이드입니다.`,
        coreBody:
          `• 취약 신체 부위: **${h.vulnerableOrgans}**\n` +
          `• 번아웃 패턴: ${h.burnoutPattern}\n` +
          `• 특히 조심할 시기: **${h.cautionSeason2027}** (컨디션 저하 달: **${worst1.label} ${worst1.score}점**)에는 야근·카페인·밤샘 고민을 줄이셔야 합니다.`,
        actionTail: h.dailyPrescription,
      }),
      suggestions: [
        "내 부족한 오행 채우는 습관은?",
        "멘탈 흔들릴 때 5분 처방전",
      ],
    };
  }

  if (intent === "daeun") {
    const decades =
      report.daeunReport?.decades
        .slice(0, 4)
        .map((d) => `${d.ageRange} ${d.ganZhi}(${d.score}점·${d.keyword})`)
        .join(" / ") || "";
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju})은 겉보기와 속마음의 온도 차가 엄청난 반전 매력과 승부근성을 가진 팔자예요.`,
        masterLead: `${name}님(${calc.dayIlju}) 명식의 본성과 10년 대운의 큰 물줄기를 풀어드리겠소.`,
        warmLead: `${name}님(${calc.dayIlju})이 타고난 고유의 빛과 전성기 흐름을 차분히 보여드릴게요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 평생 원국 & 대운 로드맵입니다.`,
        coreBody:
          `• 타고난 본성: ${report.coreFactReport.temperament}\n` +
          `• 인생 황금기(대운): **${report.daeunReport?.goldenAge || "도약기"}** (${decades})\n` +
          `• 2027년 핵심 포인트: **${best1.label}(${best1.score}점)**·**${best2.label}(${best2.score}점)** 상승 기회를 잡고, **${worst1.label}(${worst1.score}점)** 손실만 막아내면 대운의 판이 크게 열립니다.`,
        actionTail: `${dom}(${domPct}%)의 강점은 밀고, 부족한 ${miss} 기운(${report.talisman.luckyItem.split(",")[0]})을 곁에 두어 균형을 맞추세요.`,
      }),
      suggestions: [
        "2027년 가장 조심해야 할 달은?",
        "내 사주로 돈이 가장 잘 붙는 길은?",
      ],
    };
  }

  if (intent === "today_talisman") {
    const today = report.todayReport;
    return {
      reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
        factLead: `${name}님(${calc.dayIlju}), 오늘 하루 흐름과 기운을 끌어올리는 치트키만 쏙 뽑아드릴게요.`,
        masterLead: `${name}님(${calc.dayIlju}) 명식에 부족한 ${miss} 기운을 보완하는 개운 방책을 전하오.`,
        warmLead: `${name}님(${calc.dayIlju}), 오늘 하루가 한결 가볍고 행운이 잘 붙도록 도와드릴게요.`,
        strategistLead: `${name}님(${calc.dayIlju}) 오늘 일진 & 개운 치트시트입니다.`,
        coreBody:
          `• 오늘 일진 요약: ${today ? `${today.dateLabel} (${today.todayGanZhiHangul}) · ${today.score}점 — ${today.headline}` : report.oneLineFact}\n` +
          `• 부족한 ${miss} 채우는 개운 컬러/아이템: **${report.talisman.luckyColor}** / **${report.talisman.luckyItem}**\n` +
          `• 행운 숫자 & 방향: **#${report.talisman.luckyNumber}** · **${report.talisman.luckyDirection}**`,
        actionTail:
          today?.avoidAction ||
          report.talisman.talismanMantra,
      }),
      suggestions: [
        "2027년 꼭 피해야 할 달 몇 월?",
        "올해 횡재·기회가 오는 달은?",
      ],
    };
  }

  // general (포괄 질문일 때도 구체적 월/점수/핵심 포인트를 모두 담아 정성껏 답변)
  return {
    reply: wrapByPersonaTone(personaId, name, calc.dayIlju, {
      factLead: `${name}님(${calc.dayIlju}) 사주를 펼쳐 핵심만 빈틈없이 정리해 드릴게요.`,
      masterLead: `${name}님(${calc.dayIlju}) 명식과 2027 정미년 세운(${seunRel})의 요체를 짚어드리겠소.`,
      warmLead: `${name}님(${calc.dayIlju}), 지금 궁금하신 흐름이 한눈에 잡히도록 차근차근 풀어드릴게요.`,
      strategistLead: `${name}님(${calc.dayIlju}) 2027년 핵심 판세 요약입니다.`,
      coreBody:
        `원국에서 ${dom} 기운이 ${domPct}%로 강하고 ${miss} 기운이 비어 있는 ${calc.strengthLabel} 구조입니다.\n` +
        `• 가장 조심할 달: **${worst1.label}(${worst1.score}점)** · **${worst2.label}(${worst2.score}점)** — ${report.criticalMistake2027.title}\n` +
        `• 가장 좋은 달(횡재·도약): **${best1.label}(${best1.score}점)** · **${best2.label}(${best2.score}점)** — ${report.windfallTiming.moneyRoute}\n` +
        `• 핵심 성향 포인트: ${report.oneLineFact}`,
      actionTail: report.criticalMistake2027.actionRule,
    }),
    suggestions: [
      `${worst1.label}에 구체적으로 뭘 조심해?`,
      `${best1.label}에 꼭 잡아야 할 기회는?`,
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const message = (body.message || "").trim();
    if (!message) {
      return NextResponse.json(
        { error: "질문 내용을 입력해 주세요." },
        { status: 400 }
      );
    }

    const persona = getChatPersona(body.personaId);
    const topicCategory = (body.topicCategory || "").trim().slice(0, 60);
    const topicDetail = (body.topicDetail || "").trim().slice(0, 240);
    const combinedTopic = [topicCategory, topicDetail].filter(Boolean).join(" · ");

    const profile = {
      name: (body.profile?.name || "회원").trim().slice(0, 20) || "회원",
      gender: body.profile?.gender === "male" ? ("male" as const) : ("female" as const),
      birthDate: body.profile?.birthDate || "1996-05-14",
      calendarType:
        body.profile?.calendarType === "lunar" ? ("lunar" as const) : ("solar" as const),
      birthHour: body.profile?.birthHour || "unknown",
    };

    const calc = calculateDetailedSaju({
      name: profile.name,
      gender: profile.gender,
      birthDate: profile.birthDate,
      calendarType: profile.calendarType,
      birthTime: profile.birthHour,
    });

    const fullReport = generateSajuReport({
      name: profile.name,
      gender: profile.gender,
      birthDate: profile.birthDate,
      calendarType: profile.calendarType,
      birthHour: profile.birthHour,
      worry: "wealth",
      menu: "newyear2027",
    });

    const sortedLow = [...fullReport.monthlyFlow].sort((a, b) => a.score - b.score);
    const sortedHigh = [...fullReport.monthlyFlow].sort((a, b) => b.score - a.score);
    const monthlySummary = fullReport.monthlyFlow
      .map((m) => `${m.label}:${m.score}점(${m.tag})`)
      .join(", ");

    const systemInstruction = `너는 달토사주(SajuFact)의 사주 상담사 '${persona.name}' (${persona.badge})다.
사용자는 소중한 수다권/당근을 사용해 진심 어린 맞춤 상담을 요청했다. 절대 성의 없는 뻔한 말이나 추상적인 "상반기/하반기" 회피성 답변을 하지 말고, 사용자가 쓴 비용과 시간이 아깝지 않을 만큼 구체적이고 깊이 있는 답변을 작성하라.

[상담사 페르소나 & 말투]
${persona.systemPromptStyle}

[필수 답변 원칙]
1. **질문 직답 최우선**: 사용자가 "몇 월을 피해야 해?", "이직할까?", "재회 가능성?"처럼 구체적으로 물으면 첫 1~2문장에서 바로 정확한 달(예: ${sortedLow[0].label}, ${sortedHigh[0].label}), 점수, 예/아니오 또는 조건부 결론을 먼저 답하라. "상반기/하반기" 같은 두루뭉술한 표현으로 얼버무리지 마라.
2. **만세력·월운 근거 인용**: 아래 12개월 흐름, 원국 오행 비율, 십성, 2027 정미년 세운을 최소 2가지 이상 자연스럽게 녹여 '내 사주를 꿰뚫어 보고 답한다'는 신뢰감을 줘라.
3. **밀도 높은 구성**: 모바일에서 읽기 좋게 줄바꿈(2~3단락)을 활용해 공백 포함 **380~620자** 내외로 정성껏 작성하고, 마지막에는 오늘 당장 실행할 수 있는 현실 처방 1~2가지를 반드시 제시하라.
4. **꼬리 질문 추천**: suggestions에는 방금 답변에서 자연스럽게 이어지는 구체적 꼬리 질문 2개(각 22자 이내)를 반환하라.

[내담자 정밀 만세력 데이터]
- 이름/성별: ${profile.name} (${profile.gender === "male" ? "남성" : "여성"})
- 사주 원국: ${calc.saju_summary.pillars}
- 일간/강약: ${calc.saju_summary.day_master} (${calc.strengthLabel})
- 오행 분포: 목 ${calc.saju_summary.five_elements_ratio.wood}%, 화 ${calc.saju_summary.five_elements_ratio.fire}%, 토 ${calc.saju_summary.five_elements_ratio.earth}%, 금 ${calc.saju_summary.five_elements_ratio.metal}%, 수 ${calc.saju_summary.five_elements_ratio.water}%
- 최강/결핍 오행: ${calc.saju_summary.dominant_element} 최강 / ${calc.saju_summary.missing_element} 결핍
- 십성 요약: ${calc.tenGodsSummary}
- 2027 정미년 흐름: ${calc.seun2027Summary}
- 2027 월별 운세 점수: ${monthlySummary}
- 가장 조심할 달(최저): ${fullReport.criticalMistake2027.dangerMonth} (${sortedLow[0].label} ${sortedLow[0].score}점, 2순위 ${sortedLow[1].label} ${sortedLow[1].score}점) — ${fullReport.criticalMistake2027.title} / ${fullReport.criticalMistake2027.actionRule}
- 최고 상승/횡재 달: ${sortedHigh[0].label}(${sortedHigh[0].score}점), ${sortedHigh[1].label}(${sortedHigh[1].score}점) · ${fullReport.windfallTiming.bestMonth} (${fullReport.windfallTiming.moneyRoute})
- 대운 황금기: ${fullReport.daeunReport?.goldenAge || "확인"}
- 추천 길일(택일): ${fullReport.taekilReport?.recommendedDates.map((d) => `${d.dateLabel}(${d.purpose})`).join(", ") || "없음"}
- 취약 건강/처방: ${fullReport.healthReport.vulnerableOrgans} (${fullReport.healthReport.cautionSeason2027})
- 개운 컬러/아이템: ${fullReport.talisman.luckyColor} / ${fullReport.talisman.luckyItem}${
      combinedTopic ? `\n- 내담자가 선택한 상담 주제: ${combinedTopic}` : ""
    }${
      body.reportContext ? `\n- 직전에 본 리포트 요약: ${body.reportContext}` : ""
    }`;

    const historyText = (body.history || [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "내담자" : persona.shortName}: ${m.content}`)
      .join("\n");

    const prompt = historyText
      ? `[이전 대화]\n${historyText}\n\n[내담자의 새 질문 — 반드시 이 질문에 직접·구체적으로 답하라]\n${message}`
      : `[내담자의 질문 — 반드시 이 질문에 직접·구체적으로 답하라]\n${message}`;

    const apiKey = process.env.GEMINI_API_KEY;
    let engine = "manseryeok-fallback";
    let result: GeminiChatOutput | null = null;

    if (apiKey) {
      const candidateModels = Array.from(
        new Set([
          process.env.GEMINI_MODEL || "gemini-4-hydrogen",
          "gemini-3.8-flash",
        ])
      );

      for (const modelName of candidateModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 16000);
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.85,
                ...(modelName.includes("hydrogen")
                  ? { thinkingConfig: { thinkingLevel: "LOW" } }
                  : {}),
                responseMimeType: "application/json",
                responseSchema: CHAT_RESPONSE_SCHEMA,
              },
            }),
          });
          clearTimeout(tid);
          if (res.ok) {
            const data = await res.json();
            const parts = (data?.candidates?.[0]?.content?.parts ?? []) as Array<{
              text?: string;
              thought?: boolean;
            }>;
            const rawText =
              parts.find((p) => !p.thought && typeof p.text === "string")?.text ??
              parts[parts.length - 1]?.text;
            if (rawText) {
              result = JSON.parse(rawText) as GeminiChatOutput;
              engine = modelName;
              break;
            }
          } else {
            const errText = await res.text().catch(() => "");
            console.warn(
              `[SajuChat] ${modelName} HTTP ${res.status}: ${errText.slice(0, 200)}`
            );
          }
        } catch (err) {
          clearTimeout(tid);
          console.warn(`[SajuChat] ${modelName} failed:`, err);
        }
      }
    }

    if (!result) {
      result = buildIntentAwareFallbackReply(
        persona.id,
        profile.name,
        calc,
        fullReport,
        message,
        historyText,
        combinedTopic
      );
    }

    return NextResponse.json({
      reply: result.reply,
      suggestions: (result.suggestions || []).slice(0, 2),
      engine,
      personaId: persona.id,
      dayIlju: calc.dayIlju,
    });
  } catch (err) {
    console.error("[SajuChat] Unhandled error:", err);
    return NextResponse.json(
      { error: "달토가 달에서 절구 찧으며 잠시 생각 중이에요. 다시 한 번 질문해 주세요! 🐇" },
      { status: 400 }
    );
  }
}
