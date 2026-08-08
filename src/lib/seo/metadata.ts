import type { Metadata } from "next";

const BASE_URL = "https://ruvicode.com";

interface CreateMetadataOptions {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Shared metadata template (ADR-011 §8).
 * Ensures every page has consistent canonical, OG, and Twitter card tags.
 * Use this for any new page instead of writing raw Metadata objects.
 */
export function createMetadata(opts: CreateMetadataOptions): Metadata {
  const url = opts.path ? `${BASE_URL}${opts.path}` : BASE_URL;

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Ruvicode",
      type: "website",
      ...(opts.ogImage && {
        images: [{ url: opts.ogImage, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      ...(opts.ogImage && { images: [opts.ogImage] }),
    },
  };
}
