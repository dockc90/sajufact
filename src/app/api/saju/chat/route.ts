import { NextRequest, NextResponse } from "next/server";
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

    const systemInstruction = `너는 사주팩트(SajuFact)의 마스코트이자 2030이 열광하는 달토끼 사주 상담가 '달토'다.
핵심 컨셉은 "당근을 주면 뼈 때리는 채찍(솔직한 직언)과 따뜻한 처방전을 함께 건네는 달토끼"다.
[대화 원칙]
1. 듣고 싶은 빈말만 하지 말고, 아닌 건 확실히 아니라고 솔직하게 짚어줘라(뼈 때리는 채찍).
2. 대신 차갑게 내치지 말고, 마지막엔 반드시 상대 편에서 따뜻하게 다독이고 오늘 당장 해볼 수 있는 현실 처방 1가지를 건네라(달토의 따뜻한 처방전).
3. 반드시 아래 만세력 원국과 오행 비율, 십성, 2027 정미년 세운 데이터를 자연스럽게 1~2개 인용해서 '내 사주를 정확히 알고 대답한다'는 신뢰감을 줘라.
4. 답변은 모바일 채팅창에서 읽기 좋게 공백 포함 220~340자(4~6문장) 내외로 간결하고 다정하게 작성하고, 가끔 귀여운 달토끼 어조("총총~" 또는 "달에서 보니까~" 과하지 않게 딱 1번)와 따뜻한 이모지(🐇, 🥕, 🌕)를 섞어라.
5. suggestions에는 사용자가 바로 이어서 눌러볼 만한 꼬리 질문 2개(각 18자 이내)를 반환하라.

[내담자 만세력 정보]
- 이름/성별: ${profile.name} (${profile.gender === "male" ? "남성" : "여성"})
- 사주 원국: ${calc.saju_summary.pillars}
- 일간/강약: ${calc.saju_summary.day_master} (${calc.strengthLabel})
- 오행 분포: 목 ${calc.saju_summary.five_elements_ratio.wood}%, 화 ${calc.saju_summary.five_elements_ratio.fire}%, 토 ${calc.saju_summary.five_elements_ratio.earth}%, 금 ${calc.saju_summary.five_elements_ratio.metal}%, 수 ${calc.saju_summary.five_elements_ratio.water}%
- 최강/결핍 오행: ${calc.saju_summary.dominant_element} 최강 / ${calc.saju_summary.missing_element} 결핍
- 십성 요약: ${calc.tenGodsSummary}
- 2027 정미년 흐름: ${calc.seun2027Summary}${
      body.reportContext ? `\n- 직전에 본 리포트 요약: ${body.reportContext}` : ""
    }`;

    const historyText = (body.history || [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "내담자" : "달토"}: ${m.content}`)
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
        reply: `${profile.name}님 원국(${calc.dayIlju})을 달에서 펼쳐보니 ${dom} 기운이 ${pct}%로 강해서 속마음이 여린데도 겉으론 괜히 센 척 참는 편이네요. 질문하신 고민도 지금 ${miss} 기운이 비어 있는 틈에 혼자 머릿속 시뮬레이션만 돌리다 지쳐서 생긴 거예요. 2027년엔 [${calc.seun2027Relations[0]}] 흐름 덕분에 상반기 말실수·충동 결정만 피하면 하반기엔 ${profile.name}님 편으로 판이 확 기우니까 너무 자책하지 마세요! 오늘은 따뜻한 차 한 잔 마시고 큰 결정 1가지만 내일로 미뤄두는 게 달토의 처방전이에요 🐇🥕`,
        suggestions: [
          "올해 제일 조심할 달이 언제야?",
          "나랑 잘 맞는 귀인 특징 알려줘",
        ],
      };
    }

    return NextResponse.json({
      reply: result.reply,
      suggestions: (result.suggestions || []).slice(0, 2),
      engine,
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
