import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  published: boolean;
  featured: boolean;
  readingTime: string;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(".mdx", "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data, content } = matter(raw);
    const stats = readingTime(content);

    return {
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? "",
      date: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      author: (data.author as string) ?? "Ruvicode",
      tags: (data.tags as string[]) ?? [],
      category: (data.category as string) ?? "General",
      published: (data.published as boolean) ?? false,
      featured: (data.featured as boolean) ?? false,
      readingTime: stats.text,
      content,
    };
  });

  return posts
    .filter((p) => p.published)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

export function getPostBySlug(slug: string): BlogPost | null {
  // SECURITY: Validate slug format — allow alphanumeric, hyphens, and dots
  // (for model names like glm-5.2). Prevents path traversal (../../../etc/passwd).
  if (!/^[a-z0-9.-]+$/.test(slug) || slug.includes("..")) return null;

  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    author: (data.author as string) ?? "Ruvicode",
    tags: (data.tags as string[]) ?? [],
    category: (data.category as string) ?? "General",
    published: (data.published as boolean) ?? false,
    featured: (data.featured as boolean) ?? false,
    readingTime: stats.text,
    content,
  };
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) =>
    p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}
