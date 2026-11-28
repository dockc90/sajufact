import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "달토사주 (DaltoSaju) — 오행 물상 사주 · 달토 사주 카드",
    short_name: "달토사주",
    description:
      "내 사주 오행 물상 풀이와 오늘의 카드·사주 카드를 소장하는 달토사주",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8ff",
    theme_color: "#2a1d4f",
    lang: "ko",
  };
}
