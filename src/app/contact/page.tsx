import { Container } from '@/components/layout/container';
import { PageHero } from '@/components/layout/page-hero';
import { ContactForm } from '@/components/forms/contact-form';
import { Card, CardContent } from '@/components/ui/card';
import { SUPPORT_EMAIL } from '@/lib/constants';

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to our team" description="Need product guidance, enterprise access, or help with a purchase? Reach out and we will get back to you promptly." />
      <Container className="grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Card><CardContent className="space-y-4 p-6"><h2 className="text-xl font-semibold text-[#1F1F1F]">Support</h2><p className="text-sm leading-7 text-[#666666]">For order issues, access questions, or product recommendations, contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#7A1F2B]">{SUPPORT_EMAIL}</a>.</p></CardContent></Card>
        <Card><CardContent className="p-6"><ContactForm /></CardContent></Card>
      </Container>
    </>
  );
}
