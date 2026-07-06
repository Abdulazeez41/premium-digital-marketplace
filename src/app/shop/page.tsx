import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCatalogProducts, getCategories } from "@/lib/services/catalog";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [categories, catalog] = await Promise.all([
    getCategories(),
    getCatalogProducts({
      query: typeof params.query === "string" ? params.query : undefined,
      category:
        typeof params.category === "string" ? params.category : undefined,
      sort: typeof params.sort === "string" ? (params.sort as any) : "newest",
      page: typeof params.page === "string" ? Number(params.page) : 1,
    }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Marketplace"
        title="Shop premium digital products"
        description="Filter by category, search by topic, and discover products designed for immediate practical value."
      />
      <Container className="space-y-8 py-12">
        <CatalogFilters categories={categories} />
        <ProductGrid products={catalog.products} />
      </Container>
    </>
  );
}
