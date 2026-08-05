import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api", "/dashboard/:path*"],
    },
    sitemap: "https://ruvicode.com/sitemap.xml",
  };
}
