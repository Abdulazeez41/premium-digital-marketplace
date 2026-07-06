import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 text-[#1F1F1F]">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7A1F2B] text-lg font-semibold text-white">
        PM
      </span>
      <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7A1F2B]">
        Premium Market
      </span>
    </Link>
  );
}
