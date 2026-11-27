import { NextRequest, NextResponse } from "next/server";
import { getChatPersona } from "@/lib/chat-personas";
import type { ChatPersonaId } from "@/lib/saju-types";
import { calculateDetailedSaju } from "@/lib/sajuCalculator";

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

function buildPersonaFallbackReply(
  personaId: ChatPersonaId,
  name: string,
  dayIlju: string,
  dom: string,
  pct: number,
  miss: string,
  seunRel: string,
  topicLabel: string
): string {
  const topicText = topicLabel ? ` '${topicLabel}' 고민은` : " 질문하신 고민은";

  switch (personaId) {
    case "master":
      return `${name}님의 명식(${dayIlju})을 놓고 보면 ${dom}의 기운이 ${pct}%로 중심을 잡고 있으나 ${miss} 기운이 다소 비어 있소. 지금${topicText} 바로 이 비어 있는 ${miss} 자리가 흔들리며 조급함이 올라온 탓이오. 허나 2027 정미년 세운이 [${seunRel}]으로 들어오니, 상반기에는 무리한 확장보다 내실을 다지고 하반기 흐름이 열릴 때 움직이는 것이 35년 간명상 가장 이로운 길이라 보오. 🌕`;
    case "warm":
      return `${name}님(${dayIlju}), 그동안 혼자 속으로 많이 끙끙 앓으셨겠어요. 원국에서 ${dom} 기운이 ${pct}%나 되다 보니 남들 앞에선 괜찮은 척 웃어도, ${miss} 기운이 비는 날엔 유독 마음이 지치기 쉬워요. 지금${topicText} ${name}님이 부족해서가 아니라 잠시 숨 고르기가 필요한 신호예요. 2027년 [${seunRel}] 흐름이 서서히 온기를 데려다줄 테니 오늘은 스스로에게 "충분히 잘하고 있어" 한마디 꼭 건네주세요. 🌙🥕`;
    case "strategist":
      return `${name}님(${dayIlju}) 판세 요약입니다. ① 핵심 원인: ${dom}(${pct}%) 과다 + ${miss} 결핍으로${topicText} 선택 기준이 흔들리는 구간이에요. ② Do: 2027년 [${seunRel}] 기운이 붙는 하반기를 승부 타이밍으로 잡고, 당장 1주일 안에 결정 기준 3가지를 메모해 두세요. ③ Don't: 감정 올라온 날 즉흥 결제·이직 통보·답장 독촉은 금물입니다! 기준표 하나만 세워도 승률이 확 올라갈 거예요. 🥕✨`;
    case "fact":
    default:
      return `${name}님 원국(${dayIlju})을 달에서 펼쳐보니 ${dom} 기운이 ${pct}%로 강해서 속마음이 여린데도 겉으론 괜히 센 척 참는 편이네요. 지금${topicText} ${miss} 기운이 비어 있는 틈에 혼자 머릿속 시뮬레이션만 돌리다 지쳐서 생긴 거예요. 2027년엔 [${seunRel}] 흐름 덕분에 상반기 말실수·충동 결정만 피하면 하반기엔 ${name}님 편으로 판이 확 기우니까 너무 자책하지 마세요! 오늘은 따뜻한 차 한 잔 마시고 큰 결정 1가지만 내일로 미뤄두는 게 달토의 처방전이에요 🐇🥕`;
  }
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
      birthHour: body.profile?.birthHour || "10",
    };

    const calc = calculateDetailedSaju({
      name: profile.name,
      gender: profile.gender,
      birthDate: profile.birthDate,
      calendarType: profile.calendarType,
      birthTime: profile.birthHour,
    });

    const systemInstruction = `너는 달토사주(SajuFact)의 사주 상담사 '${persona.name}' (${persona.badge})다.
[상담사 페르소나 & 말투]
${persona.systemPromptStyle}

[대화 원칙]
1. 선택한 상담사 캐릭터의 말투·시선·깊이를 끝까지 일관되게 유지하라.
2. 반드시 아래 만세력 원국, 오행 비율, 십성, 2027 정미년 세운 데이터를 자연스럽게 1~2개 이상 인용해서 '내 사주를 정확히 읽고 대답한다'는 신뢰감을 줘라.
3. 사용자가 고른 포괄 주제 및 세부 고민(있을 경우)의 맥락을 정확히 짚고, 막연한 덕담 대신 오늘부터 실행할 수 있는 현실 처방/해법을 1가지 이상 제시하라.
4. 답변은 모바일 채팅창에서 읽기 좋게 공백 포함 240~380자(4~6문장) 내외로 간결하고 몰입감 있게 작성하라.
5. suggestions에는 현재 상담사 톤앤매너에 어울리는 꼬리 질문 2개(각 20자 이내)를 반환하라.

[내담자 만세력 정보]
- 이름/성별: ${profile.name} (${profile.gender === "male" ? "남성" : "여성"})
- 사주 원국: ${calc.saju_summary.pillars}
- 일간/강약: ${calc.saju_summary.day_master} (${calc.strengthLabel})
- 오행 분포: 목 ${calc.saju_summary.five_elements_ratio.wood}%, 화 ${calc.saju_summary.five_elements_ratio.fire}%, 토 ${calc.saju_summary.five_elements_ratio.earth}%, 금 ${calc.saju_summary.five_elements_ratio.metal}%, 수 ${calc.saju_summary.five_elements_ratio.water}%
- 최강/결핍 오행: ${calc.saju_summary.dominant_element} 최강 / ${calc.saju_summary.missing_element} 결핍
- 십성 요약: ${calc.tenGodsSummary}
- 2027 정미년 흐름: ${calc.seun2027Summary}${
      combinedTopic ? `\n- 내담자가 선택한 상담 주제: ${combinedTopic}` : ""
    }${
      body.reportContext ? `\n- 직전에 본 리포트 요약: ${body.reportContext}` : ""
    }`;

    const historyText = (body.history || [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "내담자" : persona.shortName}: ${m.content}`)
      .join("\n");

    const prompt = historyText
      ? `[이전 대화]\n${historyText}\n\n[내담자의 새 질문]\n${message}`
      : `[내담자의 질문]\n${message}`;

    const apiKey = process.env.GEMINI_API_KEY;
    let engine = "manseryeok-fallback";
    let result: GeminiChatOutput | null = null;

    if (apiKey) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 15000);
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
                responseMimeType: "application/json",
                responseSchema: CHAT_RESPONSE_SCHEMA,
              },
            }),
          });
          clearTimeout(tid);
          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              result = JSON.parse(rawText) as GeminiChatOutput;
              engine = "gemini-3.8-flash";
              break;
            }
          }
        } catch (err) {
          clearTimeout(tid);
          console.warn(`[SajuChat] attempt ${attempt}/2 failed:`, err);
          if (attempt < 2) await new Promise((r) => setTimeout(r, 350));
        }
      }
    }

    if (!result) {
      const dom = calc.saju_summary.dominant_element;
      const miss = calc.saju_summary.missing_element;
      const pct = calc.saju_summary.five_elements_ratio[calc.dominantKey];
      result = {
        reply: buildPersonaFallbackReply(
          persona.id,
          profile.name,
          calc.dayIlju,
          dom,
          pct,
          miss,
          calc.seun2027Relations[0] || "변화와 도약",
          combinedTopic || topicCategory
        ),
        suggestions: persona.defaultSuggestions,
      };
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
