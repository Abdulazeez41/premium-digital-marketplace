import Link from 'next/link';

import { LogoutButton } from '@/components/forms/logout-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAdminOverview } from '@/lib/services/catalog';
import { formatPrice } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A1F2B]">Admin dashboard</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Marketplace overview</h1></div>
        <LogoutButton variant="outline">Sign out</LogoutButton>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        <Card><CardContent className="space-y-2 p-6"><p className="text-sm text-[#666666]">Revenue</p><p className="text-3xl font-semibold">{formatPrice(overview.revenue)}</p></CardContent></Card>
        <Card><CardContent className="space-y-2 p-6"><p className="text-sm text-[#666666]">Orders</p><p className="text-3xl font-semibold">{overview.orders}</p></CardContent></Card>
        <Card><CardContent className="space-y-2 p-6"><p className="text-sm text-[#666666]">Users</p><p className="text-3xl font-semibold">{overview.users}</p></CardContent></Card>
        <Card><CardContent className="space-y-2 p-6"><p className="text-sm text-[#666666]">Products</p><p className="text-3xl font-semibold">{overview.products}</p></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card><CardContent className="space-y-4 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Top products</h2><Button asChild variant="outline"><Link href="/admin/products">Manage</Link></Button></div>{overview.topProducts.map((product) => <div key={product.id} className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm"><div><p className="font-medium text-[#1F1F1F]">{product.title}</p><p className="text-[#666666]">{product.conversion}% of orders</p></div><p className="font-semibold">{product.sales} sales</p></div>)}</CardContent></Card>
        <Card><CardContent className="space-y-4 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Latest payments</h2><Button asChild variant="outline"><Link href="/admin/payments">View all</Link></Button></div>{overview.payments.map((payment) => <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm"><div><p className="font-medium text-[#1F1F1F]">{payment.reference}</p><p className="text-[#666666]">Order {payment.orderId}</p></div><p className="font-semibold">{formatPrice(payment.amountCents, payment.currency)}</p></div>)}</CardContent></Card>
      </div>
    </div>
  );
}
