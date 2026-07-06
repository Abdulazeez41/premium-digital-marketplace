import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Payments</h1>
      <div className="grid gap-6">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-[#1F1F1F]">
                  {payment.reference}
                </p>
                <p className="text-sm text-[#666666]">
                  {payment.status} · {formatDate(payment.createdAt)}
                </p>
              </div>
              <p className="font-semibold">
                {formatPrice(payment.amountCents, payment.currency)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
