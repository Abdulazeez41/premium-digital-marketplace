"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CatalogFilters({
  categories = [],
}: {
  categories?: { slug: string; name: string }[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("query") || "");

  const selectedSort = searchParams.get("sort") || "newest";
  const selectedCategory = searchParams.get("category") || "all";

  const update = useMemo(
    () => (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set("page", "1");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="grid gap-4 rounded-[28px] border border-[#ECECEC] bg-white p-5 shadow-sm lg:grid-cols-[2fr_1fr_1fr]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") update("query", query);
          }}
          className="pl-11"
          placeholder="Search premium products"
        />
      </div>
      <Select
        value={selectedCategory}
        onValueChange={(value) => update("category", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.slug} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedSort}
        onValueChange={(value) => update("sort", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="popular">Popular</SelectItem>
          <SelectItem value="price-asc">Price: low to high</SelectItem>
          <SelectItem value="price-desc">Price: high to low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
