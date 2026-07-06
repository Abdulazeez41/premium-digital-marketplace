import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCatalogProducts } from "@/lib/services/catalog";

export default async function EbooksPage() {
  const catalog = await getCatalogProducts({ type: "EBOOK", sort: "popular" });
  return (
    <>
      {" "}
      <PageHero
        eyebrow="E-books"
        title="Read and implement faster"
        description="Premium playbooks, frameworks, and operating manuals for ambitious teams."
      />
      <Container className="py-12">
        <ProductGrid products={catalog.products} />
      </Container>
    </>
  );
}
