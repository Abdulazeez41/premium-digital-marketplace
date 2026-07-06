import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/lib/services/catalog";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function DashboardOrdersPage() {
  const session = await getSession();
  const overview = await getDashboardOverview(session!.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Order history</h1>
      {overview.orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-[#1F1F1F]">Order {order.id}</p>
              <p className="text-sm text-[#666666]">
                {formatDate(order.createdAt)} · {order.items.length} items
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/api/orders/${order.id}?format=invoice`}
                className="rounded-full border border-[#ECECEC] px-4 py-2 text-sm"
              >
                Invoice
              </a>
              <p className="font-semibold">
                {formatPrice(order.totalCents, order.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
