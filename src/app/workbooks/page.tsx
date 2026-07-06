import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCatalogProducts } from "@/lib/services/catalog";

export default async function WorkbooksPage() {
  const catalog = await getCatalogProducts({
    type: "WORKBOOK",
    sort: "popular",
  });
  return (
    <>
      <PageHero
        eyebrow="Workbooks"
        title="Turn ideas into operating systems"
        description="Action-focused templates, worksheets, and planning systems for hands-on teams."
      />
      <Container className="py-12">
        <ProductGrid products={catalog.products} />
      </Container>
    </>
  );
}
