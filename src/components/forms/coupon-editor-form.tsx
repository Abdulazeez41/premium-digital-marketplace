"use client";

import { Coupon } from "@prisma/client";
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

export function CouponEditorForm({ coupon }: { coupon?: Coupon | null }) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      code: coupon?.code || "",
      description: coupon?.description || "",
      type: coupon?.type || "PERCENTAGE",
      value: coupon?.value || 10,
      maxDiscountCents: coupon?.maxDiscountCents || "",
      minOrderCents: coupon?.minOrderCents || "",
      usageLimit: coupon?.usageLimit || "",
      startsAt: coupon?.startsAt
        ? new Date(coupon.startsAt).toISOString().slice(0, 16)
        : "",
      endsAt: coupon?.endsAt
        ? new Date(coupon.endsAt).toISOString().slice(0, 16)
        : "",
      active: coupon?.active ?? true,
    },
  });
  const selectedType = useWatch({ control: form.control, name: "type" });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        const response = await fetch(
          coupon ? `/api/coupons/${coupon.id}` : "/api/coupons",
          {
            method: coupon ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          },
        );
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to save coupon.");
          return;
        }
        toast.success(coupon ? "Coupon updated." : "Coupon created.");
        router.push("/admin/coupons");
        router.refresh();
      })}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" {...form.register("code")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={selectedType || "PERCENTAGE"}
            onValueChange={(value) => form.setValue("type", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input id="value" type="number" {...form.register("value")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage limit</Label>
          <Input
            id="usageLimit"
            type="number"
            {...form.register("usageLimit")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minOrderCents">Minimum order</Label>
          <Input
            id="minOrderCents"
            type="number"
            {...form.register("minOrderCents")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDiscountCents">Maximum discount</Label>
          <Input
            id="maxDiscountCents"
            type="number"
            {...form.register("maxDiscountCents")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts at</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            {...form.register("startsAt")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Ends at</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            {...form.register("endsAt")}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...form.register("description")} />
        </div>
      </div>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? "Saving..."
          : coupon
            ? "Update coupon"
            : "Create coupon"}
      </Button>
    </form>
  );
}
