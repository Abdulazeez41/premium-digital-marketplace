import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-[#666666]"
    >
      {items.map((item, index) => (
        <span
          key={`${item.label}-${index}`}
          className="inline-flex items-center gap-2"
        >
          {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-[#7A1F2B]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1F1F1F]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
