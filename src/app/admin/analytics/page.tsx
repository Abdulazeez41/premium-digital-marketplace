import { Card, CardContent } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/services/catalog";

export default async function AdminAnalyticsPage() {
  const overview = await getAdminOverview();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {overview.topProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="space-y-2 p-6">
              <p className="text-lg font-semibold text-[#1F1F1F]">
                {product.title}
              </p>
              <p className="text-sm text-[#666666]">Sales: {product.sales}</p>
              <p className="text-sm text-[#666666]">
                Conversion proxy: {product.conversion}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
