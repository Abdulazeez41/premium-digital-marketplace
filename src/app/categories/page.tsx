import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories } from "@/lib/services/catalog";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHero
        eyebrow="Categories"
        title="Browse every category"
        description="Navigate the catalog by skill set, product type, or learning objective."
      />
      <Container className="grid gap-6 py-12 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <Card className="h-full">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7A1F2B]">
                  {category.type || "Mixed"}
                </p>
                <h2 className="text-xl font-semibold text-[#1F1F1F]">
                  {category.name}
                </h2>
                <p className="text-sm leading-7 text-[#666666]">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Container>
    </>
  );
}
