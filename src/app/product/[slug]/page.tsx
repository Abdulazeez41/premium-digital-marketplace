import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/shop/product-grid";
import { AddToCartButton } from "@/components/shop/product-cta";
import { ShareButton } from "@/components/shop/share-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId,
  );
  const cover =
    product.productMedia.find((entry) => entry.role === "COVER")?.media.url ||
    "/next.svg";

  return (
    <Container className="space-y-14 py-12">
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/shop", label: "Shop" },
            {
              href: `/category/${product.category.slug}`,
              label: product.category.name,
            },
            { label: product.title },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="overflow-hidden rounded-[36px] border border-[#ECECEC] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={product.title}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge>{product.type.replace("_", " ")}</Badge>
              <Badge variant="warning">Instant access</Badge>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-[#1F1F1F] sm:text-5xl">
                {product.title}
              </h1>
              <p className="text-lg leading-8 text-[#666666]">
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[#666666]">
              {(product.features as string[]).map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-[#ECECEC] bg-white px-4 py-2"
                >
                  {feature}
                </span>
              ))}
            </div>

            <Card>
              <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-3xl font-semibold text-[#1F1F1F]">
                    {formatPrice(product.priceCents, product.currency)}
                  </p>
                  {product.compareAtPriceCents ? (
                    <p className="mt-2 text-sm text-[#999999] line-through">
                      {formatPrice(
                        product.compareAtPriceCents,
                        product.currency,
                      )}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
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
                  />
                  <ShareButton title={product.title} />
                </div>
              </CardContent>
            </Card>

            {product.course?.lessons?.length ? (
              <Card>
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold text-[#1F1F1F]">
                    Course curriculum preview
                  </h2>
                  <div className="grid gap-3">
                    {product.course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm text-[#666666]"
                      >
                        {lesson.title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7A1F2B]">
            Related products
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Continue exploring
          </h2>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </Container>
  );
}
