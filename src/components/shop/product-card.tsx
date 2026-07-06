import Link from "next/link";
import { Product, ProductMedia, Media, Category } from "@prisma/client";
import { ArrowRight, Star } from "lucide-react";

import { AddToCartButton } from "@/components/shop/product-cta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

type ProductWithMedia = Product & {
  category: Category;
  productMedia: (ProductMedia & { media: Media })[];
};

export function ProductCard({ product }: { product: ProductWithMedia }) {
  const cover =
    product.productMedia.find((entry) => entry.role === "COVER")?.media.url ||
    "/next.svg";

  return (
    <Card className="group overflow-hidden rounded-[28px] transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-[#F4EBED]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge>{product.type.replace("_", " ")}</Badge>
          <div className="inline-flex items-center gap-1 text-xs text-[#666666]">
            <Star className="h-3.5 w-3.5 fill-[#A52B3A] text-[#A52B3A]" />
            {Math.max(4.7, product.popularScore / 20).toFixed(1)}
          </div>
        </div>
        <div className="space-y-2">
          <Link
            href={`/product/${product.slug}`}
            className="block text-xl font-semibold tracking-tight text-[#1F1F1F] transition-colors hover:text-[#7A1F2B]"
          >
            {product.title}
          </Link>
          <p className="line-clamp-2 text-sm leading-7 text-[#666666]">
            {product.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[#1F1F1F]">
              {formatPrice(product.priceCents, product.currency)}
            </p>
            {product.compareAtPriceCents ? (
              <p className="text-sm text-[#999999] line-through">
                {formatPrice(product.compareAtPriceCents, product.currency)}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <AddToCartButton
              item={{
                productId: product.id,
                title: product.title,
                slug: product.slug,
                coverImage: cover,
                priceCents: product.priceCents,
                type: product.type,
                quantity: 1,
              }}
              iconOnly
            />
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECECEC] text-[#1F1F1F] transition-colors hover:border-[#7A1F2B]/30 hover:text-[#7A1F2B]"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
