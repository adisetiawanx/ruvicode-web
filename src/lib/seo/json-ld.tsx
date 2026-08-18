import type {
  Organization,
  WebSite,
  BreadcrumbList,
  Product,
  FAQPage,
  WithContext,
} from "schema-dts";

const BASE_URL = "https://ruvicode.com";

/**
 * JSON-LD structured data helpers (ADR-011 §7).
 * Type-safe via schema-dts — no manual JSON objects.
 * Each function returns a WithContext object ready for JSON.stringify().
 * and injection via <script type="application/ld+json">.
 */

export function organizationJsonLd(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ruvicode",
    url: BASE_URL,
    description:
      "Transparent AI API gateway with unified access to 20+ AI models.",
  };
}

export function websiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ruvicode",
    url: BASE_URL,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function productJsonLd(opts: {
  name: string;
  description: string;
  price?: string;
}): WithContext<Product> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    brand: { "@type": "Brand", name: "Ruvicode" },
    offers: opts.price
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          price: opts.price,
        }
      : undefined,
  };
}

export function faqJsonLd(
  faqs: Array<{ q: string; a: string }>,
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * Render JSON-LD as a <script> tag.
 * Safe because JSON.stringify escapes dangerous characters.
 */
export function JsonLdScript({
  data,
}: {
  data: WithContext<Organization | WebSite | BreadcrumbList | Product | FAQPage>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
