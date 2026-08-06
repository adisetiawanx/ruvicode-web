import type { MetadataRoute } from "next";
import { getAllActiveModels } from "@/lib/db/queries/models";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Model detail pages
  const models = await getAllActiveModels();
  const modelPages = models.map((m) => ({
    url: `${baseUrl}/models/${m.model}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...modelPages];
}
