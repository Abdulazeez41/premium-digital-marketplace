import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms"
        title="Terms of service"
        description="The rules governing purchases, access, usage rights, and acceptable use of the platform."
      />
      <Container className="max-w-4xl space-y-8 py-12 text-sm leading-8 text-[#666666]">
        <section>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Digital access
          </h2>
          <p>
            Purchased products are licensed for the buyer’s own use unless
            otherwise stated. Access is granted after payment verification and
            may be revoked in cases of fraud or abuse.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Payments and refunds
          </h2>
          <p>
            Payments are processed by approved third-party providers. Refund
            requests are reviewed according to product type, access usage, and
            applicable laws.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Acceptable use
          </h2>
          <p>
            Users may not redistribute licensed materials, attempt to bypass
            security, abuse the platform, or violate intellectual property
            rights.
          </p>
        </section>
      </Container>
    </>
  );
}
