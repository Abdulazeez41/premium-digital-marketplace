import { CategoryEditorForm } from "@/components/forms/category-editor-form";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminNewCategoryPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Create category
        </h1>
        <CategoryEditorForm />
      </CardContent>
    </Card>
  );
}
