import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCatalogProducts } from "@/lib/services/catalog";

export default async function CoursesPage() {
  const catalog = await getCatalogProducts({ type: "COURSE", sort: "popular" });
  return (
    <>
      <PageHero
        eyebrow="Courses"
        title="Premium video courses"
        description="Structured lessons, practical systems, and lifetime access for modern operators and creators."
      />
      <Container className="py-12">
        <ProductGrid products={catalog.products} />
      </Container>
    </>
  );
}
