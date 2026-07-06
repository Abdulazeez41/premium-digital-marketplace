import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { requireUserPageSession } from "@/lib/auth/guards";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUserPageSession();
  const params = await searchParams;
  const reference =
    typeof params.reference === "string" ? params.reference : undefined;

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Complete your purchase"
        description="Payments are processed securely and access is granted only after backend verification."
      />
      <Container className="py-12">
        <CheckoutForm reference={reference} />
      </Container>
    </>
  );
}
