import { notFound } from "next/navigation";

import { CategoryEditorForm } from "@/components/forms/category-editor-form";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) notFound();
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Edit category
        </h1>
        <CategoryEditorForm category={category} />
      </CardContent>
    </Card>
  );
}
