"use client";

import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <AdminSidebar pathname={pathname} />
      <div>{children}</div>
    </div>
  );
}
