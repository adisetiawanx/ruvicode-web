import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { getAllPosts, getAllTags } from "@/lib/content/blog";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

export const metadata: Metadata = {
  title: "Blog - AI API Guides, Tutorials & Comparisons",
  description:
    "Learn how to use AI APIs effectively. Comparison guides, pricing analysis, tutorials for Claude, GPT, GLM, DeepSeek and more.",
  alternates: { canonical: "https://ruvicode.com/blog" },
  openGraph: {
    title: "Ruvicode Blog",
    description: "AI API guides, tutorials, and comparisons.",
    url: "https://ruvicode.com/blog",
  },
};

/** Format a stored ISO date string as a readable "Aug 10, 2026". */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <Container size="wide" className="py-12">
      <PageEntrance>
        {/* Header */}
        <PageEntranceItem>
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-text">
              The Ruvicode Blog
            </p>
            <h1 className="mb-3 text-h1 font-semibold text-text-primary">
              Practical guides for building with AI APIs
            </h1>
            <p className="text-text-secondary">
              Comparisons, pricing breakdowns, and integration tutorials.
              Written for developers who ship.
            </p>
          </div>
        </PageEntranceItem>

        {/* Featured post */}
        {featured && (
          <PageEntranceItem>
            <Link
              href={`/blog/${featured.slug}`}
              className="group mb-10 block overflow-hidden rounded-xl border border-border-default bg-surface transition-all hover:border-accent/40 hover:shadow-card"
            >
              <div className="border-l-2 border-accent p-8">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs font-medium text-accent-text">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                  <Badge variant="outline">{featured.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {featured.readingTime}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatDate(featured.date)}
                  </span>
                </div>
                <h2 className="mb-3 text-h2 font-semibold text-text-primary transition-colors group-hover:text-accent-text">
                  {featured.title}
                </h2>
                <p className="mb-5 max-w-2xl text-text-secondary">
                  {featured.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent-text transition-transform group-hover:translate-x-0.5">
                  Read article
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </PageEntranceItem>
        )}

        {/* Tag filter */}
        {tags.length > 0 && (
          <PageEntranceItem>
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                Browse by topic
              </span>
              <Link
                href="/blog"
                className="rounded-full border border-accent/40 bg-accent-subtle px-3 py-1 text-xs text-accent-text transition-colors"
              >
                All
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="rounded-full border border-border-subtle px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-default hover:text-text-primary"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </PageEntranceItem>
        )}

        {/* Post grid */}
        <PageEntranceItem>
          {rest.length === 0 ? (
            <div className="rounded-lg border border-border-default bg-surface p-12 text-center text-text-muted">
              No more articles yet. New guides are on the way.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-border-default bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
                    <span className="font-medium text-text-secondary">
                      {post.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent-text">
                    {post.title}
                  </h3>
                  <p className="line-clamp-3 mb-4 text-sm text-text-secondary">
                    {post.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-3">
                    <span className="text-xs text-text-muted">
                      {formatDate(post.date)}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </PageEntranceItem>

        {/* Bottom CTA */}
        <PageEntranceItem>
          <div className="mt-12 rounded-xl border border-border-default bg-surface p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-text-primary">
              One API key, every model above
            </h2>
            <p className="mx-auto mb-5 max-w-md text-sm text-text-secondary">
              Everything we write about is one integration away. Top up,
              generate a key, and switch models without changing your code.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover"
              >
                Get started free
              </Link>
              <Link
                href="/models"
                className="inline-flex h-10 items-center rounded-md border border-border-default px-5 text-sm font-medium text-text-primary transition-colors hover:border-accent/40"
              >
                Browse models
              </Link>
            </div>
          </div>
        </PageEntranceItem>
      </PageEntrance>
    </Container>
  );
}
