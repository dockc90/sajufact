import { NextRequest, NextResponse } from "next/server";
import { calculateTodayFortune } from "@/lib/saju-engine";
import type { PaymentPlan, SajuReport } from "@/lib/saju-types";

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseKey };
}

function refreshReportDaily(report: SajuReport): SajuReport {
  try {
    const todayReport = calculateTodayFortune(
      report.input,
      report.dayMasterHanja,
      report.dayBranchHanja || "午",
      report.weakestElement
    );
    return { ...report, todayReport };
  } catch {
    return report;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  const userQuery = searchParams.get("user")?.trim();

  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  try {
    if (id) {
      const url = `${supabaseUrl}/rest/v1/saju_reports?id=eq.${encodeURIComponent(id)}&select=id,user_name,menu,dominant_element,report_json,paid_plan,keeper_phone,created_at&limit=1`;
      const res = await fetch(url, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: "리포트 조회에 실패했습니다." },
          { status: 500 }
        );
      }

      const rows = (await res.json()) as Array<{
        id: string;
        user_name: string;
        menu: string;
        dominant_element: string;
        report_json: SajuReport;
        paid_plan: PaymentPlan | null;
        keeper_phone: string | null;
        created_at: string;
      }>;

      if (!rows.length || !rows[0].report_json) {
        return NextResponse.json(
          { ok: false, error: "저장된 리포트를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      const row = rows[0];
      return NextResponse.json({
        ok: true,
        report: refreshReportDaily(row.report_json),
        paidPlan: row.paid_plan ?? null,
        keeperPhone: row.keeper_phone ?? "",
        createdAt: row.created_at,
      });
    }

    if (userQuery !== undefined && userQuery !== null) {
      const cleaned = userQuery.replace(/[,()*%]/g, "").trim();
      if (!cleaned) {
        return NextResponse.json({ ok: true, items: [] });
      }
      const filter = `or=(user_name.ilike.*${cleaned}*,keeper_phone.ilike.*${cleaned}*)`;
      const url = `${supabaseUrl}/rest/v1/saju_reports?${encodeURI(filter)}&select=id,user_name,birth_date,menu,dominant_element,paid_plan,keeper_phone,created_at,report_json&order=updated_at.desc&limit=20`;
      const res = await fetch(url, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: "보관함 검색에 실패했습니다." },
          { status: 500 }
        );
      }

      const rows = (await res.json()) as Array<{
        id: string;
        user_name: string;
        birth_date: string;
        menu: string;
        dominant_element: string;
        paid_plan: PaymentPlan | null;
        keeper_phone: string | null;
        created_at: string;
        report_json: SajuReport;
      }>;

      return NextResponse.json({
        ok: true,
        items: rows.map((r) => ({
          id: r.id,
          userName: r.user_name,
          birthDate: r.birth_date,
          menu: r.menu,
          dominantElement: r.dominant_element,
          paidPlan: r.paid_plan ?? null,
          keeperPhone: r.keeper_phone ?? "",
          createdAt: r.created_at,
          report: r.report_json ? refreshReportDaily(r.report_json) : null,
        })),
      });
    }

    return NextResponse.json(
      { ok: false, error: "id 또는 user 검색어를 입력해 주세요." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, skipped: true });
  }

  try {
    const body = (await req.json()) as {
      id?: string;
      paidPlan?: PaymentPlan | null;
      keeperPhone?: string;
      report?: SajuReport;
      payment?: {
        plan: PaymentPlan;
        amount: 990 | 1910 | 2900;
        payMethod: "kakao" | "toss" | "naver" | "card";
        merchantUid: string;
      };
    };

    if (!body.id) {
      return NextResponse.json({ ok: false, error: "Missing report id" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.paidPlan !== undefined) updatePayload.paid_plan = body.paidPlan;
    if (body.keeperPhone !== undefined) updatePayload.keeper_phone = body.keeperPhone;
    if (body.report !== undefined) updatePayload.report_json = body.report;

    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/saju_reports?id=eq.${encodeURIComponent(body.id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(updatePayload),
      }
    );

    let dbUpdated = false;
    if (patchRes.ok) {
      const updatedRows = (await patchRes.json()) as unknown[];
      dbUpdated = updatedRows.length > 0;
    }

    // row가 아직 없다면 report가 함께 온 경우 INSERT 폴백
    if (!dbUpdated && body.report) {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/saju_reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({
          id: body.id,
          user_name: body.report.input.name,
          gender: body.report.input.gender,
          birth_date: body.report.input.birthDate,
          calendar_type: body.report.input.calendarType,
          birth_hour: body.report.input.birthHour,
          worry: body.report.input.worry,
          menu: body.report.input.menu,
          dominant_element: body.report.dominantElement,
          report_json: body.report,
          paid_plan: body.paidPlan ?? null,
          keeper_phone: body.keeperPhone ?? null,
        }),
      });
      dbUpdated = insertRes.ok;
    }

    let paymentLogged = false;
    if (body.payment) {
      const payRes = await fetch(`${supabaseUrl}/rest/v1/saju_payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          report_id: body.id,
          merchant_uid: body.payment.merchantUid,
          plan: body.payment.plan,
          amount: body.payment.amount,
          pay_method: body.payment.payMethod,
          status: "paid",
        }),
      });
      paymentLogged = payRes.ok;
    }

    return NextResponse.json({
      ok: true,
      dbUpdated,
      paymentLogged,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "리포트 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
