import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCatalogProducts } from "@/lib/services/catalog";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const catalog = await getCatalogProducts({ query, sort: "popular" });

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search the marketplace"}
        description="Explore the full catalog using topic-based search."
      />
      <Container className="py-12">
        <ProductGrid products={catalog.products} />
      </Container>
    </>
  );
}
