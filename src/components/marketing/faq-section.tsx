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
  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="content">
        <h2 className="mb-16 text-center text-3xl font-semibold">
          Frequently Asked Questions
        </h2>
        <Accordion defaultValue={["0"]} className="mx-auto max-w-2xl">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={String(i)}
              className="mb-3 overflow-hidden rounded-lg border border-border-default bg-surface"
            >
              <AccordionTrigger className="px-5 py-5 text-left text-base font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-text-secondary">
                <div className="pt-2">{faq.a}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
