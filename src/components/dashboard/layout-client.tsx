"use client";

import { usePathname } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <DashboardSidebar pathname={pathname} />
      <div>{children}</div>
    </div>
  );
}
