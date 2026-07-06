import Link from "next/link";

import { DeleteResourceButton } from "@/components/forms/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductsForAdmin } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getProductsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>
      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[#1F1F1F]">
                  {product.title}
                </p>
                <p className="text-sm text-[#666666]">
                  {product.type} · {product.status} ·{" "}
                  {formatPrice(product.priceCents, product.currency)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>
                <DeleteResourceButton
                  endpoint={`/api/products/${product.id}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
