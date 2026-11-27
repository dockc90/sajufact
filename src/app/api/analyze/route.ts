import { NextRequest, NextResponse } from "next/server";
import { generateSajuReport } from "@/lib/saju-engine";
import type { SajuInput } from "@/lib/saju-types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SajuInput>;

    const input: SajuInput = {
      name: (body.name || "익명").slice(0, 20),
      gender: body.gender === "male" ? "male" : "female",
      birthDate: body.birthDate || "1996-05-14",
      calendarType: body.calendarType === "lunar" ? "lunar" : "solar",
      birthHour: body.birthHour || "unknown",
      worry: body.worry || "wealth",
      menu: body.menu || "newyear2027",
      partnerName: body.partnerName?.slice(0, 20),
      partnerBirthDate: body.partnerBirthDate,
      partnerGender: body.partnerGender,
    };

    // 1단계: 만세력 0원 계산 + 정밀 팩트폭격 기본 리포트 생성
    const baseReport = generateSajuReport(input);

    // 2단계: GEMINI_API_KEY가 설정되어 있을 경우 Gemini Structured JSON Output으로 팩폭 문구 고도화
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `당신은 '사주팩트(SajuFact)'의 뼈 때리는 팩폭 AI 사주 전문가입니다.
유저 이름: ${baseReport.input.name}
일간: ${baseReport.dayMasterHangul}(${baseReport.dayMasterHanja}), 최강 오행: ${baseReport.dominantElement}, 부족 오행: ${baseReport.weakestElement}
선택 메뉴: ${input.menu}, 핵심 고민: ${input.worry}
다음 3개 필드만 한국어 JSON으로 간결하고 매운맛 있게 작성해 주세요:
{"oneLineFact": "25자 이내 뼈 때리는 한줄 팩폭", "dangerDetail": "2027년 4월 절대 피할 실수 2문장", "moneyDetail": "재물/횡재수 루트 2문장"}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text) as {
              oneLineFact?: string;
              dangerDetail?: string;
              moneyDetail?: string;
            };
            if (parsed.oneLineFact) baseReport.oneLineFact = parsed.oneLineFact;
            if (parsed.dangerDetail) baseReport.criticalMistake2027.detail = parsed.dangerDetail;
            if (parsed.moneyDetail) baseReport.windfallTiming.detail = parsed.moneyDetail;
          }
        }
      } catch {
        // Gemini 호출 실패 시에도 0원 만세력 팩폭 리포트로 매끄럽게 폴백
      }
    }

    return NextResponse.json({ report: baseReport });
  } catch {
    return NextResponse.json(
      { error: "사주 분석 중 오류가 발생했습니다. 입력값을 확인해 주세요." },
      { status: 400 }
    );
  }
}
