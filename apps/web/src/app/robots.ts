import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/workspace/", "/api/", "/invite/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchpond.vercel.app"}/sitemap.xml`,
  };
}
