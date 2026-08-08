import type { MetadataRoute } from "next";

/**
 * Robots.txt — allows public paths, disallows private/auth paths.
 * Per ADR-011 §6.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/*",
        "/api",
        "/api/*",
        "/register",
        "/register/*",
        "/login",
      ],
    },
    sitemap: "https://ruvicode.com/sitemap.xml",
    host: "https://ruvicode.com",
  };
}
