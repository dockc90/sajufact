import { NextRequest, NextResponse } from "next/server";
import { generateSajuReport } from "@/lib/saju-engine";
import type { SajuInput } from "@/lib/saju-types";

async function saveReportToSupabase(
  report: ReturnType<typeof generateSajuReport>,
  input: SajuInput
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/saju_reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({
        id: report.id,
        user_name: report.input.name,
        gender: input.gender,
        birth_date: input.birthDate,
        calendar_type: input.calendarType,
        birth_hour: input.birthHour,
        worry: input.worry,
        menu: input.menu,
        dominant_element: report.dominantElement,
        report_json: report,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

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
일주: ${baseReport.dayMasterHangul}${baseReport.dayBranchHangul ?? ""}(${baseReport.dayMasterHanja}${baseReport.dayBranchHanja ?? ""}), 2027 정미년 관계: ${baseReport.relation2027Label ?? "일반 흐름"}
최강 오행: ${baseReport.dominantElement}, 부족 오행: ${baseReport.weakestElement}
주의해야 할 달: ${baseReport.criticalMistake2027.dangerMonth}, 횡재수 달: ${baseReport.windfallTiming.bestMonth}
선택 메뉴: ${input.menu}, 핵심 고민: ${input.worry}
다음 6개 필드만 한국어 JSON으로, 위 사람의 일주와 주의월을 반드시 반영해 기존 템플릿과 겹치지 않게 매운맛으로 작성해 주세요:
{"oneLineFact": "28자 이내 뼈 때리는 한줄 팩폭", "mistakeTitle": "22자 이내 주의보 제목", "dangerDetail": "${baseReport.criticalMistake2027.dangerMonth} 기준 절대 피할 실수 2문장", "moneyDetail": "재물/횡재수 루트 2문장", "healthDetail": "타고난 취약 장기와 번아웃 팩폭 2문장", "todayHeadline": "오늘 일진(${baseReport.todayReport?.todayGanZhiHangul ?? ""}) 기준 한줄 팩트"}`;

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
              mistakeTitle?: string;
              dangerDetail?: string;
              moneyDetail?: string;
              healthDetail?: string;
              todayHeadline?: string;
            };
            if (parsed.oneLineFact) baseReport.oneLineFact = parsed.oneLineFact;
            if (parsed.mistakeTitle) baseReport.criticalMistake2027.title = parsed.mistakeTitle;
            if (parsed.dangerDetail) baseReport.criticalMistake2027.detail = parsed.dangerDetail;
            if (parsed.moneyDetail) baseReport.windfallTiming.detail = parsed.moneyDetail;
            if (parsed.healthDetail) baseReport.healthReport.burnoutPattern = parsed.healthDetail;
            if (parsed.todayHeadline && baseReport.todayReport) {
              baseReport.todayReport.headline = parsed.todayHeadline;
            }
          }
        }
      } catch {
        // Gemini 호출 실패 시에도 0원 만세력 팩폭 리포트로 매끄럽게 폴백
      }
    }

    // 3단계: Supabase DB에 리포트 결과 비동기 캐싱 저장
    const savedToDb = await saveReportToSupabase(baseReport, input);

    return NextResponse.json({ report: baseReport, savedToDb });
  } catch {
    return NextResponse.json(
      { error: "사주 분석 중 오류가 발생했습니다. 입력값을 확인해 주세요." },
      { status: 400 }
    );
  }
}
