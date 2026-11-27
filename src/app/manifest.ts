import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "사주팩트 (SajuFact) — 달토끼 달토 AI 사주 · 파스텔 오라",
    short_name: "사주팩트",
    description:
      "달토끼 달토가 짚어주는 AI 사주 상담 & 파스텔 오라 인스타그램 공유 카드",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6f0",
    theme_color: "#8b5cf6",
    lang: "ko",
  };
}
