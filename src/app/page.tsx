import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";
import { HeroSection } from "@/components/marketing/hero-section";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FaqSection } from "@/components/marketing/faq-section";
import { ProductGrid } from "@/components/shop/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getHomepageCollection } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";

// mono index - used sparingly, only where content is genuinely enumerable
const idx = (n: number) => String(n).padStart(2, "0");
type HomepageCollection = Awaited<ReturnType<typeof getHomepageCollection>> & {
  featuredCourse: any;
};

export default async function HomePage() {
  const data = (await getHomepageCollection()) as HomepageCollection;
  const whyChooseUs = (data.whyChooseUs?.content || {}) as {
    heading?: string;
    items?: { title: string; description: string }[];
  };
  const newsletter = (data.newsletter?.content || {}) as {
    heading?: string;
    description?: string;
  };

  return (
    <>
      <Container>
        <HeroSection hero={data.hero?.content as Record<string, any>} />
      </Container>

      <section className="py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Featured products"
            title="Premium resources built to move work forward"
            description="Every product is designed to deliver immediately useful frameworks, elegant learning experience, and long-term value."
          />
          <ProductGrid products={data.featuredProducts} />
        </Container>
      </section>

      {/* categories - styled as catalogue entries */}
      <section className="bg-white py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Popular categories"
            title="Browse by focus area"
            description="Find products by the domain you want to improve right now."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {data.categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative rounded-[4px] border border-[#ECECEC] bg-[#FBF7F2] p-6 transition-colors hover:border-[#7A1F2B]/30"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-[#B7A896]">
                    {idx(i + 1)} -
                  </span>
                  <Badge>{category.type || "All products"}</Badge>
                </div>
                <h3 className="mt-5 font-serif text-xl font-medium text-[#1F1F1F]">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#666666]">
                  {category.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A1F2B] opacity-0 transition-opacity group-hover:opacity-100">
                  View entry <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="space-y-10">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Latest products"
              title="New additions to the marketplace"
              description="Fresh releases across ebooks, workbooks, audiobooks, and courses."
            />
            <Button asChild variant="outline" className="hidden md:inline-flex">
              <Link href="/shop">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProductGrid products={data.latestProducts} />
        </Container>
      </section>

      {/* featured course - reframed as a case-file / dossier */}
      {data.featuredCourse ? (
        <section className="bg-white py-20">
          <Container>
            <div className="relative overflow-hidden rounded-[4px] border border-[#2A2A2A] bg-[#1F1F1F] p-8 text-white lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent, transparent 39px, #fff 40px)",
                }}
              />
              <div className="relative space-y-5">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#D9A5AC]">
                  <span>Dossier</span>
                  <span className="h-1 w-1 rounded-full bg-[#D9A5AC]/50" />
                  <span>Featured Course</span>
                </div>
                <h2 className="font-serif text-3xl font-medium tracking-tight lg:text-4xl">
                  {data.featuredCourse.title}
                </h2>
                <p className="text-sm leading-8 text-white/75">
                  {data.featuredCourse.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-white/80">
                  {(data.featuredCourse.features as string[]).map((feature) => (
                    <span
                      key={feature}
                      className="rounded-[3px] border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <p className="font-mono text-2xl font-semibold">
                    {formatPrice(
                      data.featuredCourse.priceCents,
                      data.featuredCourse.currency,
                    )}
                  </p>
                  <Button asChild variant="secondary">
                    <Link href={`/product/${data.featuredCourse.slug}`}>
                      Explore course
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:mt-0">
                {(data.featuredCourse.course?.outcomes as string[]).map(
                  (outcome, i) => (
                    <div
                      key={outcome}
                      className="rounded-[4px] border border-white/10 bg-white/[0.04] p-5"
                    >
                      <span className="font-mono text-xs text-[#D9A5AC]">
                        Outcome {idx(i + 1)}
                      </span>
                      <p className="mt-3 text-sm leading-7 text-white/85">
                        {outcome}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* why choose us - mono index instead of generic checkmark */}
      <section className="py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Why choose us"
            title={
              whyChooseUs.heading ||
              "Built for serious learners who value clarity over noise."
            }
            description="The platform combines premium design, instant digital delivery, and a dashboard experience crafted for repeat use."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {(whyChooseUs.items || []).map((item, i) => (
              <Card key={item.title} className="rounded-[4px]">
                <CardContent className="space-y-4 p-6">
                  <span className="font-mono text-sm font-semibold text-[#7A1F2B]">
                    {idx(i + 1)}
                  </span>
                  <h3 className="font-serif text-xl font-medium text-[#1F1F1F]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-7 text-[#666666]">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* testimonials - index-card treatment, echoing the hero ticket */}
      <section className="bg-white py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Testimonials"
            title="Trusted by founders, operators, and growth teams"
            description="Proof that premium content and seamless delivery create a better learning experience."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {data.testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="rounded-[4px] border-t-2 border-t-[#7A1F2B]"
              >
                <CardContent className="space-y-5 p-6">
                  <span className="font-serif text-4xl leading-none text-[#7A1F2B]/25">
                    “
                  </span>
                  <p className="-mt-4 text-sm leading-8 text-[#666666]">
                    {testimonial.quote}
                  </p>
                  <div className="border-t border-dotted border-[#E4D9CE] pt-4">
                    <p className="font-semibold text-[#1F1F1F]">
                      {testimonial.name}
                    </p>
                    <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#8A8A8A]">
                      {testimonial.role}
                      {testimonial.company ? `, ${testimonial.company}` : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* newsletter - styled as a subscription ticket */}
      <section className="py-20">
        <Container className="grid gap-10 rounded-[4px] border border-[#E4D9CE] bg-[#F4EBED] p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div className="space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#7A1F2B]">
              Dispatch - Weekly
            </span>
            <SectionHeading
              eyebrow=""
              title={newsletter.heading || "Get one sharp idea each week"}
              description={
                newsletter.description ||
                "Short, practical insights for digital product founders and operators."
              }
            />
          </div>
          <div className="flex items-center lg:justify-end">
            <NewsletterForm />
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Frequently asked questions"
            title="Everything you need to know before you buy"
            description="Clear answers about access, downloads, course updates, and support."
          />
          <FaqSection faqs={data.faqs} />
        </Container>
      </section>
    </>
  );
}
