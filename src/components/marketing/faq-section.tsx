import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { FAQS } from "@/lib/constants";

interface FaqItem {
  q: string;
  a: string;
}

export function FaqSection({ faqs = FAQS }: { faqs?: readonly FaqItem[] }) {
  const half = Math.ceil(faqs.length / 2);
  const left = faqs.slice(0, half);
  const right = faqs.slice(half);
  const renderCol = (items: readonly FaqItem[], offset: number) =>
    items.map((faq, i) => (
      <AccordionItem
        key={offset + i}
        value={String(offset + i)}
        className="mb-3 overflow-hidden rounded-lg border border-border-default bg-surface"
      >
        <AccordionTrigger className="px-5 py-5 text-left text-base font-medium hover:no-underline">
          {faq.q}
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5 pt-0 text-text-secondary">
          <div className="pt-2">{faq.a}</div>
        </AccordionContent>
      </AccordionItem>
    ));

  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="wide">
        <h2 className="mb-16 text-center text-3xl font-semibold">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
          <Accordion defaultValue={["0"]}>
            {renderCol(left, 0)}
          </Accordion>
          <Accordion defaultValue={[]}>
            {renderCol(right, half)}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
