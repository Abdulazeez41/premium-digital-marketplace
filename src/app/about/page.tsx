import { Container } from '@/components/layout/container';
import { PageHero } from '@/components/layout/page-hero';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title="A premium marketplace for high-value digital products" description="We built the platform to make premium learning products feel as polished and trustworthy as the best modern SaaS tools." />
      <Container className="grid gap-6 py-12 md:grid-cols-3">
        {[
          ['Curated quality', 'Every product is designed to be useful in real work, not just theoretically interesting.'],
          ['Elegant delivery', 'From checkout to dashboard access, every step is optimized for clarity and confidence.'],
          ['Long-term value', 'Many products include updates so the learning compounds over time.'],
        ].map(([title, description]) => (
          <Card key={title}><CardContent className="space-y-3 p-6"><h2 className="text-xl font-semibold text-[#1F1F1F]">{title}</h2><p className="text-sm leading-7 text-[#666666]">{description}</p></CardContent></Card>
        ))}
      </Container>
    </>
  );
}
