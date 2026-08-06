import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  section: string;
  order: number;
  content: string;
}

export function getAllDocs(): DocPage[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".mdx"));

  const docs = files.map((filename) => {
    const slug = filename.replace(".mdx", "");
    const raw = fs.readFileSync(path.join(DOCS_DIR, filename), "utf-8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? "",
      section: (data.section as string) ?? "General",
      order: (data.order as number) ?? 99,
      content,
    };
  });

  return docs.sort((a, b) => {
    if (a.section !== b.section) return a.section.localeCompare(b.section);
    return a.order - b.order;
  });
}

export function getDocBySlug(slug: string): DocPage | null {
  // SECURITY: Same path traversal protection as blog.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const fullPath = path.join(DOCS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    section: (data.section as string) ?? "General",
    order: (data.order as number) ?? 99,
    content,
  };
}

// Build sidebar nav structure grouped by section
export function getDocsNav(): Array<{ section: string; items: DocPage[] }> {
  const docs = getAllDocs();
  const sections: Record<string, DocPage[]> = {};

  for (const doc of docs) {
    if (!sections[doc.section]) sections[doc.section] = [];
    sections[doc.section]!.push(doc);
  }

  return Object.entries(sections).map(([section, items]) => ({
    section,
    items,
  }));
}
