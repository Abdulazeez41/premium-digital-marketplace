import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacy policy"
        description="How we collect, use, store, and protect data across the marketplace."
      />
      <Container className="max-w-4xl space-y-8 py-12 text-sm leading-8 text-[#666666]">
        <section>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Information we collect
          </h2>
          <p>
            We collect account details, billing information, purchase history,
            and product engagement data required to operate the service, process
            transactions, prevent fraud, and improve the product experience.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            How data is used
          </h2>
          <p>
            Data is used to authenticate users, verify payments, deliver
            purchased content, send transactional emails, support customers, and
            improve product quality. We do not sell personal information.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Security and retention
          </h2>
          <p>
            We use secure sessions, password hashing, server-side validation,
            and role-based access controls. Data is retained only as long as
            necessary to provide the service and comply with legal obligations.
          </p>
        </section>
      </Container>
    </>
  );
}
