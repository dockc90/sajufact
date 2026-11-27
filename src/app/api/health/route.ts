import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "sajufact",
    domain: process.env.NEXT_PUBLIC_SITE_URL || "https://sajufact.kr",
    region: process.env.VERCEL_REGION || "local",
    env: {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      portoneConfigured: Boolean(
        process.env.NEXT_PUBLIC_PORTONE_STORE_ID &&
          process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY
      ),
    },
  });
}
