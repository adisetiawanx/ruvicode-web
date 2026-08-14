import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getAllTags } from "@/lib/content/blog";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

export const metadata: Metadata = {
  title: "Blog — AI API Guides, Tutorials & Comparisons",
  description:
    "Learn how to use AI APIs effectively. Comparison guides, pricing analysis, tutorials for Claude, GPT, GLM, DeepSeek and more.",
  alternates: { canonical: "https://ruvicode.com/blog" },
  openGraph: {
    title: "Ruvicode Blog",
    description: "AI API guides, tutorials, and comparisons.",
    url: "https://ruvicode.com/blog",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <Container size="wide" className="py-12">
      <PageEntrance>
        <PageEntranceItem>
          <h1 className="mb-2 text-h1 font-semibold">Blog</h1>
          <p className="mb-8 text-text-secondary">
            Guides, tutorials, and comparisons.
          </p>
        </PageEntranceItem>

        {/* Featured post */}
        {featured && (
          <PageEntranceItem>
            <Link
              href={`/blog/${featured.slug}`}
              className="mb-12 block rounded-lg border border-border-default bg-surface p-8 transition-colors hover:border-accent/30"
            >
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="outline">Featured</Badge>
                <span className="text-xs text-text-muted">
                  {featured.readingTime}
                </span>
              </div>
              <h2 className="mb-3 text-h2 font-semibold">{featured.title}</h2>
              <p className="mb-4 text-text-secondary">{featured.description}</p>
              <span className="text-sm text-accent">Read more →</span>
            </Link>
          </PageEntranceItem>
        )}

        {/* Tag filter */}
        <PageEntranceItem>
          <div className="mb-8 flex flex-wrap gap-2">
            <Badge variant="default">All</Badge>
            {tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer transition-colors hover:border-accent/30"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </PageEntranceItem>

        {/* Post grid */}
        <PageEntranceItem>
          <div className="grid gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-border-default bg-surface p-6 transition-colors hover:border-accent/30"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
                  <span>{post.category}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <h3 className="mb-2 font-semibold">{post.title}</h3>
                <p className="line-clamp-2 text-sm text-text-secondary">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </PageEntranceItem>
      </PageEntrance>
    </Container>
  );
}
