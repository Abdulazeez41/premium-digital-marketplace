import { Product, ProductMedia, Media, Category } from "@prisma/client";

import { ProductCard } from "@/components/shop/product-card";

type ProductWithMedia = Product & {
  category: Category;
  productMedia: (ProductMedia & { media: Media })[];
};

export function ProductGrid({ products }: { products: ProductWithMedia[] }) {
  if (!products.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#D7D7D7] bg-white p-10 text-center text-sm text-[#666666]">
        No products matched your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
