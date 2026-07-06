"use client";

import { Category, Media, Product, ProductMedia } from "@prisma/client";
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

type ProductWithMedia = Product & {
  productMedia: (ProductMedia & { media: Media })[];
};

export function ProductEditorForm({
  product,
  categories,
}: {
  product?: ProductWithMedia | null;
  categories: Category[];
}) {
  const router = useRouter();
  const coverMedia = product?.productMedia.find(
    (entry) => entry.role === "COVER",
  );
  const downloadMediaIds =
    product?.productMedia
      .filter((entry) => entry.role === "DOWNLOAD")
      .map((entry) => entry.mediaId) || [];

  const form = useForm<any>({
    defaultValues: {
      title: product?.title || "",
      slug: product?.slug || "",
      excerpt: product?.excerpt || "",
      description: product?.description || "",
      type: product?.type || "EBOOK",
      status: product?.status || "DRAFT",
      sku: product?.sku || "",
      priceCents: product?.priceCents || 0,
      compareAtPriceCents: product?.compareAtPriceCents || null,
      categoryId: product?.categoryId || categories[0]?.id || "",
      featured: product?.featured || false,
      popularScore: product?.popularScore || 0,
      features: Array.isArray(product?.features)
        ? (product?.features as string[])
        : [],
      featuresText: Array.isArray(product?.features)
        ? (product?.features as string[]).join("\n")
        : "",
      coverMediaId: coverMedia?.mediaId || "",
      downloadMediaIds,
      downloadMediaIdsText: downloadMediaIds.join(", "),
      seoTitle: product?.seoTitle || "",
      seoDescription: product?.seoDescription || "",
    },
  });

  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const selectedType = useWatch({ control: form.control, name: "type" });
  const selectedStatus = useWatch({ control: form.control, name: "status" });

  const submit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      features: (values.featuresText || "")
        .split("\n")
        .map((item: string) => item.trim())
        .filter(Boolean),
      downloadMediaIds: (values.downloadMediaIdsText || "")
        .split(",")
        .map((item: string) => item.trim())
        .filter(Boolean),
      coverMediaId: values.coverMediaId || null,
    };

    const response = await fetch(
      product ? `/api/products/${product.id}` : "/api/products",
      {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.message || "Unable to save product.");
      return;
    }
    toast.success(product ? "Product updated." : "Product created.");
    router.push("/admin/products");
    router.refresh();
  });

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register("title")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...form.register("slug")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...form.register("sku")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            value={selectedCategoryId || ""}
            onValueChange={(value) => form.setValue("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label htmlFor="status">Status</Label>
          <Select
            value={selectedStatus || "DRAFT"}
            onValueChange={(value) => form.setValue("status", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {["DRAFT", "PUBLISHED", "ARCHIVED"].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceCents">Price (kobo/cents)</Label>
          <Input
            id="priceCents"
            type="number"
            {...form.register("priceCents", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compareAtPriceCents">Compare at price</Label>
          <Input
            id="compareAtPriceCents"
            type="number"
            {...form.register("compareAtPriceCents", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="popularScore">Popularity score</Label>
          <Input
            id="popularScore"
            type="number"
            {...form.register("popularScore", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverMediaId">Cover media ID</Label>
          <Input id="coverMediaId" {...form.register("coverMediaId")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" {...form.register("excerpt")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register("description")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="featuresText">Features (one per line)</Label>
          <Textarea id="featuresText" {...form.register("featuresText")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="downloadMediaIdsText">
            Download media IDs (comma separated)
          </Label>
          <Input
            id="downloadMediaIdsText"
            {...form.register("downloadMediaIdsText")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" {...form.register("seoTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input id="seoDescription" {...form.register("seoDescription")} />
        </div>
      </div>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? "Saving..."
          : product
            ? "Update product"
            : "Create product"}
      </Button>
    </form>
  );
}
