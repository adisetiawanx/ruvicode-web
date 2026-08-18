import type { Metadata } from "next";
import Link from "next/link";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getPostsByTag } from "@/lib/content/blog";
import { Container } from "@/components/layout/container";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const url = `https://ruvicode.com/blog/tag/${tag}`;
  return {
    title: `Posts tagged "${tag}" - Blog`,
    description: `Browse all blog posts tagged ${tag}.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Posts tagged "${tag}" - Blog`,
      description: `Browse all blog posts tagged ${tag}.`,
      url,
      siteName: "Ruvicode",
      type: "website",
      images: [
        {
          url: "https://ruvicode.com/og/ruvicode-default.png",
          width: 1200,
          height: 630,
          alt: `Ruvicode blog posts tagged ${tag}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Posts tagged "${tag}" - Blog`,
      description: `Browse all blog posts tagged ${tag}.`,
      images: ["https://ruvicode.com/og/ruvicode-default.png"],
    },
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ruvicode.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://ruvicode.com/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: `#${tag}`,
        item: `https://ruvicode.com/blog/tag/${tag}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Container className="py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/blog" className="hover:text-text-secondary">
          Blog
        </Link>
        <span>/</span>
        <span className="text-text-secondary">#{tag}</span>
      </nav>

      <h1 className="mb-2 text-h1 font-semibold">
        Posts tagged <span className="text-accent">#{tag}</span>
      </h1>
      <p className="mb-8 text-text-secondary">
        {posts.length} post{posts.length !== 1 ? "s" : ""} found.
      </p>

      {posts.length === 0 ? (
        <p className="text-text-muted">
          No posts found for this tag.{" "}
          <Link href="/blog" className="text-accent">
            Browse all posts →
          </Link>
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
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
      )}
    </Container>
    </>
  );
}
