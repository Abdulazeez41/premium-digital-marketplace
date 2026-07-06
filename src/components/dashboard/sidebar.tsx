import Link from "next/link";

import { DASHBOARD_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DashboardSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="rounded-[28px] border border-[#ECECEC] bg-white p-4 shadow-sm">
      <nav className="grid gap-2">
        {DASHBOARD_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-[#7A1F2B] text-white"
                : "text-[#1F1F1F] hover:bg-[#F4F4F5]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
