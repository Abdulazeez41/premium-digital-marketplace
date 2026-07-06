import Link from "next/link";

import { DownloadButton } from "@/components/dashboard/download-button";
import { LogoutButton } from "@/components/forms/logout-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  const overview = await getDashboardOverview(session!.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A1F2B]">
            Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Welcome back, {overview.user?.name}
          </h1>
        </div>
        <LogoutButton variant="outline">Sign out</LogoutButton>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-[#666666]">Total spend</p>
            <p className="text-3xl font-semibold">
              {formatPrice(overview.stats.spentCents)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-[#666666]">Products owned</p>
            <p className="text-3xl font-semibold">
              {overview.stats.productCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-[#666666]">Average course completion</p>
            <p className="text-3xl font-semibold">
              {overview.stats.courseCompletion}%
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent orders</h2>
              <Button asChild variant="outline">
                <Link href="/dashboard/orders">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {overview.orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-[#1F1F1F]">{order.id}</p>
                    <p className="text-[#666666]">{order.items.length} items</p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(order.totalCents, order.currency)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold">Downloads</h2>
            <div className="space-y-3">
              {overview.downloads.slice(0, 5).map((download) => (
                <div
                  key={download.id}
                  className="rounded-2xl bg-[#FAFAFA] px-4 py-4"
                >
                  <p className="font-medium text-[#1F1F1F]">
                    {download.product.title}
                  </p>
                  <p className="mt-1 text-sm text-[#666666]">
                    {download.media.fileName}
                  </p>
                  <div className="mt-3">
                    <DownloadButton productId={download.productId} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
