import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCatalogProducts } from "@/lib/services/catalog";

export default async function AudiobooksPage() {
  const catalog = await getCatalogProducts({
    type: "AUDIOBOOK",
    sort: "popular",
  });
  return (
    <>
      <PageHero
        eyebrow="Audiobooks"
        title="Learn while you move"
        description="High-quality audio learning experiences for builders who prefer listening on the go."
      />
      <Container className="py-12">
        <ProductGrid products={catalog.products} />
      </Container>
    </>
  );
}
