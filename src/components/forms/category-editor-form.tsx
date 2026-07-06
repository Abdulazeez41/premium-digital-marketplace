"use client";

import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CategoryEditorForm({
  category,
}: {
  category?: Category | null;
}) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      imageUrl: category?.imageUrl || "",
      type: category?.type || "EBOOK",
    },
  });
  const selectedType = useWatch({ control: form.control, name: "type" });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        const response = await fetch(
          category ? `/api/categories/${category.id}` : "/api/categories",
          {
            method: category ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          },
        );
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to save category.");
          return;
        }
        toast.success(category ? "Category updated." : "Category created.");
        router.push("/admin/categories");
        router.refresh();
      })}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...form.register("slug")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={selectedType || "EBOOK"}
            onValueChange={(value) => form.setValue("type", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {["EBOOK", "AUDIOBOOK", "WORKBOOK", "COURSE"].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" {...form.register("imageUrl")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register("description")} />
        </div>
      </div>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? "Saving..."
          : category
            ? "Update category"
            : "Create category"}
      </Button>
    </form>
  );
}
