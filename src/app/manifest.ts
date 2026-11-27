import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "사주팩트 (SajuFact) — AI 명리 사주·수호 영물",
    short_name: "사주팩트",
    description:
      "내 사주 오행 수호 영물 화보와 정밀 AI 사주·타로 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ef",
    theme_color: "#0f172a",
    lang: "ko",
  };
}
