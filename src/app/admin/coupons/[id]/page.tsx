import { notFound } from "next/navigation";

import { CouponEditorForm } from "@/components/forms/coupon-editor-form";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminEditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Edit coupon
        </h1>
        <CouponEditorForm coupon={coupon} />
      </CardContent>
    </Card>
  );
}
