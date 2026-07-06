import { ProductEditorForm } from "@/components/forms/product-editor-form";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories } from "@/lib/services/catalog";

export default async function AdminNewProductPage() {
  const categories = await getCategories();
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Create product
        </h1>
        <ProductEditorForm categories={categories} />
      </CardContent>
    </Card>
  );
}
