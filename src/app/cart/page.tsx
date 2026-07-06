import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CartView } from "@/components/shop/cart-view";

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Cart"
        title="Review your selections"
        description="Check your items before proceeding to secure checkout."
      />
      <Container className="py-12">
        <CartView />
      </Container>
    </>
  );
}
