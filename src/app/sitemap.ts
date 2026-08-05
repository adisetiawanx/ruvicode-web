import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ruvicode.com";

  const staticPages = [
    "",
    "/pricing",
    "/models",
    "/playground",
    "/calculator",
    "/docs",
    "/blog",
    "/integrations",
    "/status",
    "/legal/privacy",
    "/legal/terms",
    "/legal/refund",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  // Blog posts will be added here once content/ is populated (ADR blog ADR)
  return [...staticPages];
}
