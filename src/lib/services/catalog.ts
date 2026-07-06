import "server-only";

import { Prisma, ProductType, UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { calculatePercentage } from "@/lib/utils";

export type ProductFilters = {
  type?: ProductType;
  category?: string;
  query?: string;
  sort?: "newest" | "popular" | "price-asc" | "price-desc";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

const productInclude = {
  category: true,
  productMedia: {
    include: { media: true },
    orderBy: { sortOrder: "asc" as const },
  },
  course: {
    include: {
      lessons: {
        orderBy: { position: "asc" as const },
      },
    },
  },
} satisfies Prisma.ProductInclude;

export async function getHomepageContent(key: string) {
  return db.homepageContent.findUnique({ where: { key } });
}

export async function getHomepageCollection() {
  const [
    hero,
    whyChooseUs,
    newsletter,
    footer,
    seo,
    testimonials,
    faqs,
    featuredProducts,
    latestProducts,
    categories,
    featuredCourse,
  ] = await Promise.all([
    db.homepageContent.findUnique({ where: { key: "hero" } }),
    db.homepageContent.findUnique({ where: { key: "why-choose-us" } }),
    db.homepageContent.findUnique({ where: { key: "newsletter" } }),
    db.homepageContent.findUnique({ where: { key: "footer" } }),
    db.homepageContent.findUnique({ where: { key: "seo" } }),
    db.testimonial.findMany({
      where: { featured: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.faq.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: productInclude,
      take: 4,
      orderBy: [{ popularScore: "desc" }, { publishedAt: "desc" }],
    }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      include: productInclude,
      take: 8,
      orderBy: { publishedAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
    getFeaturedCourse(),
  ]);

  return {
    hero,
    whyChooseUs,
    newsletter,
    footer,
    seo,
    testimonials,
    faqs,
    featuredProducts,
    latestProducts,
    categories,
    featuredCourse,
  };
}

export async function getCatalogProducts(filters: ProductFilters = {}) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.category ? { category: { slug: filters.category } } : {}),
    ...(filters.query
      ? {
          OR: [
            { title: { contains: filters.query, mode: "insensitive" } },
            { excerpt: { contains: filters.query, mode: "insensitive" } },
            { description: { contains: filters.query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.minPrice || filters.maxPrice
      ? {
          priceCents: {
            ...(filters.minPrice ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.sort === "price-asc"
      ? [{ priceCents: "asc" }]
      : filters.sort === "price-desc"
        ? [{ priceCents: "desc" }]
        : filters.sort === "popular"
          ? [{ popularScore: "desc" }, { publishedAt: "desc" }]
          : [{ publishedAt: "desc" }];

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: productInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({ where: { slug }, include: productInclude });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
) {
  return db.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      status: "PUBLISHED",
    },
    include: productInclude,
    take: 4,
    orderBy: [{ popularScore: "desc" }, { publishedAt: "desc" }],
  });
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: { products: { include: productInclude } },
  });
}

export async function getFeaturedCourse() {
  return db.product.findFirst({
    where: { type: "COURSE", status: "PUBLISHED", featured: true },
    include: productInclude,
    orderBy: [{ popularScore: "desc" }, { publishedAt: "desc" }],
  });
}

export async function getDashboardOverview(userId: string) {
  const [orders, downloads, progress, user] = await Promise.all([
    db.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    }),
    db.download.findMany({
      where: { userId },
      include: { product: true, media: true },
      orderBy: { createdAt: "desc" },
    }),
    db.courseProgress.findMany({
      where: { userId },
      include: { course: { include: { product: true, lessons: true } } },
    }),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  return {
    user,
    orders,
    downloads,
    progress,
    stats: {
      spentCents: orders.reduce((total, order) => total + order.totalCents, 0),
      productCount: downloads.length,
      courseCompletion: progress.length
        ? Math.round(
            progress.reduce((sum, item) => sum + item.completionRate, 0) /
              progress.length,
          )
        : 0,
    },
  };
}

export async function getAdminOverview() {
  const [
    users,
    products,
    orders,
    revenue,
    payments,
    testimonials,
    faqs,
    settings,
  ] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.order.count(),
    db.order.aggregate({
      _sum: { totalCents: true },
      where: { status: "PAID" },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { order: true },
    }),
    db.testimonial.count(),
    db.faq.count(),
    db.siteSetting.findMany({ orderBy: { key: "asc" } }),
  ]);

  const productRows = await db.product.findMany({
    where: { status: "PUBLISHED" },
    include: { orderItems: true },
  });

  const topProducts = productRows
    .map((product) => ({
      id: product.id,
      title: product.title,
      sales: product.orderItems.length,
      conversion: calculatePercentage(
        product.orderItems.length,
        Math.max(1, orders),
      ),
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return {
    users,
    products,
    orders,
    revenue: revenue._sum.totalCents || 0,
    payments,
    testimonials,
    faqs,
    settings,
    topProducts,
  };
}

export async function getUsersForAdmin() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: true, downloads: true },
  });
}

export async function getOrdersForAdmin() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: { include: { product: true } },
      payments: true,
    },
  });
}

export async function getProductsForAdmin() {
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });
}

export async function getCouponsForAdmin() {
  return db.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getMediaForAdmin() {
  return db.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: true },
  });
}

export async function isAdminEmail(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  return user?.role === UserRole.ADMIN;
}
