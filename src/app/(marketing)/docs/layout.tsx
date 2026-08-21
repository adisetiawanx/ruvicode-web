import Link from "next/link";
import { getDocsNav } from "@/lib/content/docs";
import { MobileDocsNav } from "@/components/shared/mobile-docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = getDocsNav();

  return (
    <div className="mx-auto flex max-w-[1440px] gap-0 px-6 md:px-8">
      {/* Left sidebar — docs navigation (desktop only) */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-border-subtle p-4 lg:block">
        <nav className="space-y-6">
          {nav.map((group) => (
            <div key={group.section}>
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {group.section}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/docs/${item.slug}`}
                      className="block rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Center content */}
      <main className="min-w-0 flex-1 py-12">
        {/* Mobile docs navigation drawer */}
        <MobileDocsNav nav={nav} />
        <div className="mx-auto max-w-[680px]">{children}</div>
      </main>
    </div>
  );
}
