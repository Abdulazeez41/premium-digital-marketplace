import { Card, CardContent } from "@/components/ui/card";
import { getOrdersForAdmin } from "@/lib/services/catalog";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getOrdersForAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-[#1F1F1F]">{order.id}</p>
                <p className="text-sm text-[#666666]">
                  {order.user.name} · {formatDate(order.createdAt)} ·{" "}
                  {order.status}
                </p>
              </div>
              <p className="font-semibold">
                {formatPrice(order.totalCents, order.currency)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
