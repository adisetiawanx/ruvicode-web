import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxRehypePlugins, mdxRemarkPlugins } from "@/lib/mdx";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllDocs, getDocBySlug } from "@/lib/content/docs";
import { mdxComponents } from "@/components/shared/mdx-components";

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  return {
    title: `${doc.title} - Docs`,
    description: doc.description,
    alternates: { canonical: `https://ruvicode.com/docs/${doc.slug}` },
    openGraph: {
      title: `${doc.title} - Docs`,
      description: doc.description,
      url: `https://ruvicode.com/docs/${doc.slug}`,
      siteName: "Ruvicode",
      type: "website",
      images: [
        {
          url: "https://ruvicode.com/og/ruvicode-default.png",
          width: 1200,
          height: 630,
          alt: `Ruvicode docs - ${doc.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${doc.title} - Docs`,
      description: doc.description,
      images: ["https://ruvicode.com/og/ruvicode-default.png"],
    },
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

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
        name: "Docs",
        item: "https://ruvicode.com/docs",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: doc.title,
        item: `https://ruvicode.com/docs/${doc.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article>
        <nav className="mb-6 text-sm text-text-muted">
          <Link href="/docs" className="hover:text-text-secondary">
            Docs
          </Link>{" "}
          / <span>{doc.section}</span>
        </nav>
        <h1 className="mb-4 text-h1 font-bold">{doc.title}</h1>
        <p className="mb-8 text-text-secondary">{doc.description}</p>
        <div className="border-t border-border-subtle pt-8">
          <MDXRemote
            source={doc.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [...mdxRemarkPlugins],
                rehypePlugins: [...mdxRehypePlugins],
              },
            }}
          />
        </div>
      </article>
    </>
  );
}
