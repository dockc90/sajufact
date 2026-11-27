import { NextRequest, NextResponse } from "next/server";
import { generateSajuReport } from "@/lib/saju-engine";
import { calculateDetailedSaju } from "@/lib/sajuCalculator";
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

    // 1단계: 만세력 0원 계산 + 정밀 사주 전처리
    const baseReport = generateSajuReport(input);
    const detailedCalc = calculateDetailedSaju({
      name: input.name,
      gender: input.gender,
      birthDate: input.birthDate,
      calendarType: input.calendarType,
      birthTime: input.birthHour,
      partnerName: input.partnerName,
      partnerBirthDate: input.partnerBirthDate,
      partnerGender: input.partnerGender,
    });

    // 2단계: GEMINI_API_KEY가 설정되어 있을 경우 Gemini Strict JSON Schema(0.85 temperature + 모델 폴백)로 문구 고도화
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const topMonths = [...baseReport.monthlyFlow]
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map((m) => `${m.label}(${m.score}점)`)
        .join(", ");
      const lowMonths = [...baseReport.monthlyFlow]
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
        .map((m) => `${m.label}(${m.score}점)`)
        .join(", ");

      const prompt = `당신은 '달토사주(SajuFact)'의 예리하고 성심성의껏 깊이 상담하는 AI 명리학 마스터입니다.
"노력하면 잘 될 것이다", "건강 조심하라" 같은 뻔하고 추상적인 덕담은 100% 금지하며, 계산된 원국·오행·십성·월별 점수 근거를 구체적으로 녹여 사용자가 '돈이 전혀 아깝지 않다'고 느낄 만큼 밀도 높게 작성하세요.
유저: ${baseReport.input.name} (${input.gender === "male" ? "남성" : "여성"})
원국: ${detailedCalc.saju_summary.pillars}
일간: ${detailedCalc.saju_summary.day_master} (${detailedCalc.strengthLabel})
오행 비율: 목 ${detailedCalc.saju_summary.five_elements_ratio.wood}%, 화 ${detailedCalc.saju_summary.five_elements_ratio.fire}%, 토 ${detailedCalc.saju_summary.five_elements_ratio.earth}%, 금 ${detailedCalc.saju_summary.five_elements_ratio.metal}%, 수 ${detailedCalc.saju_summary.five_elements_ratio.water}%
최강/결핍 오행: ${detailedCalc.saju_summary.dominant_element} 최강 / ${detailedCalc.saju_summary.missing_element} 결핍
십성 요약: ${detailedCalc.tenGodsSummary}
2027 정미년 세운: ${detailedCalc.seun2027Summary}
주의 달: ${baseReport.criticalMistake2027.dangerMonth} (최저 점수 월: ${lowMonths})
횡재수 달: ${baseReport.windfallTiming.bestMonth} (최고 점수 월: ${topMonths})
선택 테마: ${input.menu}, 세부 포커스: ${input.worry}`;

      const schema = {
        type: "OBJECT",
        required: [
          "oneLineFact",
          "mistakeTitle",
          "dangerDetail",
          "dangerActionRule",
          "moneyDetail",
          "temperamentDetail",
          "moneyLeakDetail",
          "healthDetail",
          "lovePrescription",
          "todayHeadline",
        ],
        properties: {
          oneLineFact: { type: "STRING" },
          mistakeTitle: { type: "STRING" },
          dangerDetail: { type: "STRING" },
          dangerActionRule: { type: "STRING" },
          moneyDetail: { type: "STRING" },
          temperamentDetail: { type: "STRING" },
          moneyLeakDetail: { type: "STRING" },
          healthDetail: { type: "STRING" },
          lovePrescription: { type: "STRING" },
          todayHeadline: { type: "STRING" },
        },
      };

      const candidateModels = Array.from(
        new Set([
          process.env.GEMINI_MODEL || "gemini-2.5-flash",
          "gemini-2.0-flash",
        ])
      );

      for (const modelName of candidateModels) {
        let succeeded = false;
        try {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 16000);
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                systemInstruction: {
                  parts: [
                    {
                      text: "oneLineFact는 공백 포함 18자 이내로 간결하게 쓰고, 나머지 상세 필드(dangerDetail, moneyDetail, temperamentDetail, moneyLeakDetail, healthDetail)는 각 2~4문장(160~280자)으로 구체적인 월(Month)·원국·실전 행동 지침을 담아 정성껏 작성하라.",
                    },
                  ],
                },
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.85,
                  responseMimeType: "application/json",
                  responseSchema: schema,
                },
              }),
            }
          );
          clearTimeout(tid);

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text) as {
                oneLineFact?: string;
                mistakeTitle?: string;
                dangerDetail?: string;
                dangerActionRule?: string;
                moneyDetail?: string;
                temperamentDetail?: string;
                moneyLeakDetail?: string;
                healthDetail?: string;
                lovePrescription?: string;
                todayHeadline?: string;
              };
              if (parsed.oneLineFact) baseReport.oneLineFact = parsed.oneLineFact;
              if (parsed.mistakeTitle) baseReport.criticalMistake2027.title = parsed.mistakeTitle;
              if (parsed.dangerDetail) baseReport.criticalMistake2027.detail = parsed.dangerDetail;
              if (parsed.dangerActionRule) baseReport.criticalMistake2027.actionRule = parsed.dangerActionRule;
              if (parsed.moneyDetail) baseReport.windfallTiming.detail = parsed.moneyDetail;
              if (parsed.temperamentDetail) baseReport.coreFactReport.temperament = parsed.temperamentDetail;
              if (parsed.moneyLeakDetail) baseReport.coreFactReport.moneyLeakHabit = parsed.moneyLeakDetail;
              if (parsed.healthDetail) baseReport.healthReport.burnoutPattern = parsed.healthDetail;
              if (parsed.lovePrescription && baseReport.loveReport) {
                baseReport.loveReport.lovePrescription = parsed.lovePrescription;
              }
              if (parsed.todayHeadline && baseReport.todayReport) {
                baseReport.todayReport.headline = parsed.todayHeadline;
              }
              succeeded = true;
            }
          } else {
            const errBody = await geminiRes.text().catch(() => "");
            console.warn(`[Analyze] ${modelName} HTTP ${geminiRes.status}: ${errBody.slice(0, 200)}`);
          }
        } catch (err) {
          console.warn(`[Analyze] ${modelName} failed:`, err);
        }
        if (succeeded) break;
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
