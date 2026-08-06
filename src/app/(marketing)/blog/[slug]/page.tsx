import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { BlogPosting, BreadcrumbList, WithContext } from "schema-dts";
import { getAllPosts, getPostBySlug } from "@/lib/content/blog";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mdxComponents } from "@/components/shared/mdx-components";

/** SECURITY: validate the slug is a real post BEFORE rendering */
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Ruvicode Blog`,
    description: post.description,
    alternates: { canonical: `https://ruvicode.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://ruvicode.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: [...post.tags],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const blogPostingJsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Ruvicode",
      url: "https://ruvicode.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ruvicode.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ruvicode.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://ruvicode.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://ruvicode.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Container size="prose" className="py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
          <Link
            href="/"
            className="transition-colors hover:text-text-secondary"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/blog"
            className="transition-colors hover:text-text-secondary"
          >
            Blog
          </Link>
          <span>/</span>
          <span className="text-text-secondary">{post.category}</span>
        </nav>

        {/* Article header */}
        <article>
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline">{post.category}</Badge>
            <span className="text-xs text-text-muted">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-muted">{post.readingTime}</span>
          </div>

          <h1 className="mb-4 text-h1 font-bold">{post.title}</h1>
          <p className="mb-8 text-lg text-text-secondary">
            {post.description}
          </p>

          {/* Tags */}
          <div className="mb-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer transition-colors hover:border-accent/30"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>

          {/* MDX content */}
          <div className="border-t border-border-subtle pt-8">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 rounded-lg border-2 border-accent bg-accent-subtle p-8 text-center">
          <h3 className="mb-2 text-h3 font-semibold">
            Ready to start building?
          </h3>
          <p className="mb-4 text-text-secondary">
            Get your API key in under 2 minutes.
          </p>
          <Button
            variant="primary"
            size="lg"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Get Started Free →
          </Button>
        </div>

        {/* Author bio */}
        <div className="mt-8 flex items-center gap-4 border-t border-border-subtle pt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
            <span className="font-semibold text-accent">
              {post.author.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold">{post.author}</p>
            <p className="text-sm text-text-secondary">Ruvicode Team</p>
          </div>
        </div>
      </Container>
    </>
  );
}
