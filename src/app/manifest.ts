import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "사주팩트 (SajuFact) — AI 사주·타로 팩트폭격",
    short_name: "사주팩트",
    description:
      "위로 대신 뼈 때리는 AI 사주·타로 플랫폼 및 오행 오라(Aura) 운명 카드",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ef",
    theme_color: "#0f172a",
    lang: "ko",
  };
}
