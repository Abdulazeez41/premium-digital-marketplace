import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCategoryBySlug } from "@/lib/services/catalog";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={category.description}
      />
      <Container className="py-12">
        <ProductGrid products={category.products as any} />
      </Container>
    </>
  );
}
