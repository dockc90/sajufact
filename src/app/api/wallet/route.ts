import { NextRequest, NextResponse } from "next/server";
import { getKst23ResetCycleKey } from "@/lib/saju-engine";

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseKey };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletId = searchParams.get("walletId")?.trim();

  if (!walletId) {
    return NextResponse.json({ ok: false, error: "walletId is required" }, { status: 400 });
  }

  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: true, wallet: null });
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/saju_wallets?wallet_id=eq.${encodeURIComponent(walletId)}&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ ok: true, wallet: null });
    }

    const rows = (await res.json()) as Array<{
      wallet_id: string;
      user_name: string;
      birth_date: string;
      gender: "female" | "male";
      calendar_type: "solar" | "lunar";
      birth_hour: string;
      coins: number;
      free_chat_tickets: number;
      last_free_reset_key: string;
      unlocked_themes: string[];
    }>;

    if (!rows.length) {
      return NextResponse.json({ ok: true, wallet: null });
    }

    const row = rows[0];
    const currentCycle = getKst23ResetCycleKey();
    const needsReset = row.last_free_reset_key !== currentCycle;

    return NextResponse.json({
      ok: true,
      wallet: {
        walletId: row.wallet_id,
        profile: {
          name: row.user_name,
          birthDate: row.birth_date,
          gender: row.gender,
          calendarType: row.calendar_type,
          birthHour: row.birth_hour,
        },
        coins: row.coins,
        freeChatTickets: needsReset
          ? Math.max(1, row.free_chat_tickets)
          : row.free_chat_tickets,
        lastFreeResetKey: currentCycle,
        unlockedReportIds: row.unlocked_themes || [],
      },
    });
  } catch {
    return NextResponse.json({ ok: true, wallet: null });
  }
}

export async function POST(req: NextRequest) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: true, synced: false });
  }

  try {
    const body = (await req.json()) as {
      walletId?: string;
      profile?: {
        name?: string;
        birthDate?: string;
        gender?: "female" | "male";
        calendarType?: "solar" | "lunar";
        birthHour?: string;
      };
      coins?: number;
      freeChatTickets?: number;
      lastFreeResetKey?: string;
      unlockedReportIds?: string[];
    };

    if (!body.walletId || !body.profile?.birthDate) {
      return NextResponse.json({ ok: false, error: "Invalid wallet payload" }, { status: 400 });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/saju_wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        wallet_id: body.walletId,
        user_name: (body.profile.name || "익명").slice(0, 20),
        birth_date: body.profile.birthDate,
        gender: body.profile.gender === "male" ? "male" : "female",
        calendar_type: body.profile.calendarType === "lunar" ? "lunar" : "solar",
        birth_hour: body.profile.birthHour || "10",
        coins: Math.max(0, Number(body.coins ?? 0)),
        free_chat_tickets: Math.max(0, Number(body.freeChatTickets ?? 1)),
        last_free_reset_key: body.lastFreeResetKey || getKst23ResetCycleKey(),
        unlocked_themes: body.unlockedReportIds || [],
        updated_at: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ ok: true, synced: res.ok });
  } catch {
    return NextResponse.json({ ok: true, synced: false });
  }
}
