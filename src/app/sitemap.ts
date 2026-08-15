import type { MetadataRoute } from "next";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { getAllPosts } from "@/lib/content/blog";
import { getAllDocs } from "@/lib/content/docs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Render per request: the build container has no database and would
  // otherwise freeze the static fallback model list into the sitemap.
  const { connection } = await import("next/server");
  await connection();

  const baseUrl = "https://ruvicode.com";

  const staticPages = [
    "",
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

  // Blog posts
  const posts = getAllPosts();
  const blogPages = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Blog tags
  const tags = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  const tagPages = Array.from(tags).map((t) => ({
    url: `${baseUrl}/blog/tag/${t}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  // Doc pages
  const docs = getAllDocs();
  const docPages = docs.map((d) => ({
    url: `${baseUrl}/docs/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...modelPages, ...blogPages, ...tagPages, ...docPages];
}
