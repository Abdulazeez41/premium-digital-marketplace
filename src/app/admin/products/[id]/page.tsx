import { notFound } from "next/navigation";

import { ProductEditorForm } from "@/components/forms/product-editor-form";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getCategories } from "@/lib/services/catalog";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { productMedia: { include: { media: true } } },
    }),
    getCategories(),
  ]);
  if (!product) notFound();
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Edit product
        </h1>
        <ProductEditorForm product={product as any} categories={categories} />
      </CardContent>
    </Card>
  );
}
