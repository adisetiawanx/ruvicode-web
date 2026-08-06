import { redirect } from "next/navigation";
import { getAllDocs } from "@/lib/content/docs";

export default function DocsIndexPage() {
  const docs = getAllDocs();
  if (docs.length > 0) {
    redirect(`/docs/${docs[0]!.slug}`);
  }
  redirect("/docs/quickstart");
}
