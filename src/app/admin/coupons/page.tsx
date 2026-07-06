import Link from "next/link";

import { DeleteResourceButton } from "@/components/forms/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCouponsForAdmin } from "@/lib/services/catalog";

export default async function AdminCouponsPage() {
  const coupons = await getCouponsForAdmin();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Coupons</h1>
        <Button asChild>
          <Link href="/admin/coupons/new">New coupon</Link>
        </Button>
      </div>
      <div className="grid gap-6">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[#1F1F1F]">
                  {coupon.code}
                </p>
                <p className="text-sm text-[#666666]">
                  {coupon.description || "No description"} · {coupon.type} ·{" "}
                  {coupon.value}
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/coupons/${coupon.id}`}>Edit</Link>
                </Button>
                <DeleteResourceButton endpoint={`/api/coupons/${coupon.id}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
