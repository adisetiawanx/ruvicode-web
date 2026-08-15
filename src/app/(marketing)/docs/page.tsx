import { redirect } from "next/navigation";
import { getAllDocs } from "@/lib/content/docs";

export default function DocsIndexPage() {
  // Always land on the quickstart: it is the first doc in the Getting
  // Started section and the natural entry point. Previously this fell back
  // to getAllDocs()[0], which after the section reorder pointed at an
  // API Reference page.
  const docs = getAllDocs();
  const quickstart = docs.find((d) => d.slug === "quickstart");
  redirect(quickstart ? `/docs/quickstart` : docs[0] ? `/docs/${docs[0].slug}` : "/docs/quickstart");
}
