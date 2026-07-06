import { CouponEditorForm } from "@/components/forms/coupon-editor-form";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminNewCouponPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Create coupon
        </h1>
        <CouponEditorForm />
      </CardContent>
    </Card>
  );
}
