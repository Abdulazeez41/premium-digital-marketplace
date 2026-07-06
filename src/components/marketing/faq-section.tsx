import { Faq } from "@prisma/client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="rounded-[32px] border border-[#ECECEC] bg-white px-6 shadow-sm sm:px-8"
    >
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
