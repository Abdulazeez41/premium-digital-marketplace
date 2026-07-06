import Link from "next/link";

import { DeleteResourceButton } from "@/components/forms/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories } from "@/lib/services/catalog";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/new">New category</Link>
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-lg font-semibold text-[#1F1F1F]">
                  {category.name}
                </p>
                <p className="text-sm text-[#666666]">{category.description}</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/categories/${category.id}`}>Edit</Link>
                </Button>
                <DeleteResourceButton
                  endpoint={`/api/categories/${category.id}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
