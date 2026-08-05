import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { FAQS } from "@/lib/constants";

export function FaqSection() {
  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="content">
        <h2 className="mb-12 text-center text-3xl font-semibold">
          Frequently Asked Questions
        </h2>
        <Accordion defaultValue={["0"]} className="mx-auto max-w-2xl">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={String(i)}>
              <AccordionTrigger className="text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-text-secondary">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
