import { Container } from "@/components/layout/container";
import { STATS } from "@/lib/constants";

/**
 * Static stat bar — NO count-up animation.
 * Per PAGES.md §5.4: "Financial numbers ... appear instantly, never count-up."
 */
export function StatBar() {
  return (
    <section className="border-y border-border-subtle bg-surface/50">
      <Container size="wide" className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-mono text-4xl font-bold tabular text-text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
