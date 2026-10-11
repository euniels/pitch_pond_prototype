import type { MetadataRoute } from "next";
const routes = [
  "",
  "/how-it-works",
  "/founder-studio",
  "/evidence-vault",
  "/matching",
  "/institutions",
  "/pricing",
  "/pilot",
  "/responsible-ai",
  "/privacy",
  "/terms",
  "/accessibility",
];
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchpondprototype.vercel.app";
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-10-11"),
    changeFrequency: route ? "monthly" : "weekly",
    priority: route ? 0.7 : 1,
  }));
}
