import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

export function PageHero({
  eyebrow,
  title,
  description,
  index,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  index?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#ECECEC] bg-[#FBF7F2] py-14 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(122,31,43,0.04) 40px)",
        }}
      />
      <Container className="relative space-y-5">
        <div className="flex items-center gap-3">
          {index ? (
            <span className="font-mono text-xs tracking-[0.18em] text-[#B7A896]">
              {index} —
            </span>
          ) : null}
          {eyebrow ? (
            <Badge className="rounded-[3px] border border-[#7A1F2B]/15 bg-[#F4EBED] font-mono text-[10px] uppercase tracking-[0.2em] text-[#7A1F2B]">
              {eyebrow}
            </Badge>
          ) : null}
        </div>
        <div className="max-w-3xl space-y-3">
          <h1
            className="font-serif text-4xl font-medium tracking-tight text-[#1F1F1F] sm:text-5xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {title}
          </h1>
          <p className="text-base leading-8 text-[#666666] sm:text-lg">
            {description}
          </p>
        </div>
        <div className="h-px w-24 bg-[#7A1F2B]/30" />
      </Container>
    </section>
  );
}
