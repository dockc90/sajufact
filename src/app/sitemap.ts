import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sajufact.kr";
  return [
    {
      url: baseUrl,
      lastModified: "2026-11-27",
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
