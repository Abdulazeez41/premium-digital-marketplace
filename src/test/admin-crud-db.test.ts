import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  CouponType,
  MediaKind,
  ProductMediaRole,
  ProductStatus,
  ProductType,
  UserRole,
  type Category,
  type Coupon,
  type Faq,
  type Media,
  type Product,
  type Testimonial,
  type User,
} from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  requireApiAdminSession: vi.fn(),
  requireApiSession: vi.fn(),
}));

vi.mock('@/lib/auth/api', () => ({
  requireApiAdminSession: authState.requireApiAdminSession,
  requireApiSession: authState.requireApiSession,
}));

import { GET as getCategories, POST as postCategory } from '@/app/api/categories/route';
import { DELETE as deleteCategory, GET as getCategoryById, PATCH as patchCategory } from '@/app/api/categories/[id]/route';
import { GET as getCoupons, POST as postCoupon } from '@/app/api/coupons/route';
import { DELETE as deleteCoupon, GET as getCouponById, PATCH as patchCoupon } from '@/app/api/coupons/[id]/route';
import { GET as getFaqs, POST as postFaq } from '@/app/api/faqs/route';
import { DELETE as deleteFaq, PATCH as patchFaq } from '@/app/api/faqs/[id]/route';
import { GET as getMedia, POST as postMedia } from '@/app/api/media/route';
import { DELETE as deleteMedia, GET as getMediaById, PATCH as patchMedia } from '@/app/api/media/[id]/route';
import { GET as getProducts, POST as postProduct } from '@/app/api/products/route';
import { DELETE as deleteProduct, GET as getProductById, PATCH as patchProduct } from '@/app/api/products/[id]/route';
import { GET as getTestimonials, POST as postTestimonial } from '@/app/api/testimonials/route';
import { DELETE as deleteTestimonial, PATCH as patchTestimonial } from '@/app/api/testimonials/[id]/route';
import { GET as getUserById, PATCH as patchUser } from '@/app/api/users/[id]/route';
import { GET as getUsers } from '@/app/api/users/route';
import { db } from '@/lib/db';
import { resetDatabase } from '@/test/helpers/db';

async function responseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function jsonRequest(url: string, method: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function routeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function seedAdminUser(): Promise<User> {
  return db.user.create({
    data: {
      id: 'admin_test_user',
      name: 'Admin Tester',
      email: 'admin@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  });
}

async function seedCategory(overrides: Partial<Category> = {}): Promise<Category> {
  return db.category.create({
    data: {
      id: overrides.id ?? `cat_${Math.random().toString(36).slice(2, 8)}`,
      name: overrides.name ?? 'Business Books',
      slug: overrides.slug ?? `business-books-${Math.random().toString(36).slice(2, 6)}`,
      description: overrides.description ?? 'A category for premium business education downloads.',
      imageUrl: overrides.imageUrl ?? null,
      type: overrides.type ?? ProductType.EBOOK,
    },
  });
}

async function seedMedia(overrides: Partial<Media> = {}): Promise<Media> {
  return db.media.create({
    data: {
      id: overrides.id ?? `media_${Math.random().toString(36).slice(2, 8)}`,
      fileName: overrides.fileName ?? 'asset.pdf',
      storageKey: overrides.storageKey ?? `uploads/${Math.random().toString(36).slice(2, 10)}`,
      url: overrides.url ?? `https://cdn.example.com/${Math.random().toString(36).slice(2, 10)}`,
      mimeType: overrides.mimeType ?? 'application/pdf',
      kind: overrides.kind ?? MediaKind.DOCUMENT,
      sizeBytes: overrides.sizeBytes ?? 2048,
      width: overrides.width ?? null,
      height: overrides.height ?? null,
      altText: overrides.altText ?? null,
      uploadedById: overrides.uploadedById ?? 'admin_test_user',
    },
  });
}

type ProductSeedInput = {
  categoryId: string;
  coverMediaId?: string;
  downloadMediaIds?: string[];
  type?: ProductType;
  status?: ProductStatus;
  title?: string;
  slug?: string;
  sku?: string;
};

async function seedProduct(input: ProductSeedInput): Promise<Product> {
  const product = await db.product.create({
    data: {
      title: input.title ?? 'Advanced Growth Playbook',
      slug: input.slug ?? `advanced-growth-playbook-${Math.random().toString(36).slice(2, 6)}`,
      excerpt: 'A concise premium guide for operators building predictable digital growth systems.',
      description:
        'This premium guide explains audience research, positioning, offer design, retention, measurement, and channel execution for sustainable digital growth teams.',
      type: input.type ?? ProductType.EBOOK,
      status: input.status ?? ProductStatus.PUBLISHED,
      sku: input.sku ?? `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      priceCents: 45000,
      compareAtPriceCents: 60000,
      currency: 'NGN',
      categoryId: input.categoryId,
      featured: true,
      popularScore: 72,
      publishedAt: new Date('2026-02-01T00:00:00.000Z'),
      features: ['Actionable frameworks', 'Templates', 'Case studies'],
      productMedia: {
        create: [
          ...(input.coverMediaId
            ? [{ mediaId: input.coverMediaId, role: ProductMediaRole.COVER, sortOrder: 0, isPrimary: true }]
            : []),
          ...(input.downloadMediaIds ?? []).map((mediaId, index) => ({
            mediaId,
            role: ProductMediaRole.DOWNLOAD,
            sortOrder: index + 1,
            isPrimary: false,
          })),
        ],
      },
    },
  });

  return product;
}

async function seedCustomerUser(overrides: Partial<User> = {}): Promise<User> {
  return db.user.create({
    data: {
      id: overrides.id ?? `user_${Math.random().toString(36).slice(2, 8)}`,
      name: overrides.name ?? 'Customer User',
      email: overrides.email ?? `customer-${Math.random().toString(36).slice(2, 8)}@example.com`,
      passwordHash: overrides.passwordHash ?? 'hashed-password',
      role: overrides.role ?? UserRole.CUSTOMER,
      avatarUrl: overrides.avatarUrl ?? null,
      emailVerifiedAt: overrides.emailVerifiedAt ?? new Date('2026-01-02T00:00:00.000Z'),
    },
  });
}

async function removeUploadedFile(storageKey: string) {
  await fs.rm(path.join(process.cwd(), 'public', 'uploads', storageKey), { force: true });
}

function adminForbiddenResponse() {
  return new NextResponse(JSON.stringify({ success: false, message: 'Forbidden' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('admin CRUD API routes with Prisma/PostgreSQL', () => {
  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDatabase();
    const admin = await seedAdminUser();

    const session = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    authState.requireApiAdminSession.mockResolvedValue(session);
    authState.requireApiSession.mockResolvedValue(session);
  });

  describe('categories', () => {
    it('lists categories and embedded product relations from PostgreSQL', async () => {
      const categoryA = await seedCategory({ name: 'Analytics', slug: 'analytics', type: ProductType.COURSE });
      const categoryB = await seedCategory({ name: 'Branding', slug: 'branding', type: ProductType.WORKBOOK });
      await seedProduct({ categoryId: categoryB.id, type: ProductType.WORKBOOK, title: 'Brand Sprint Workbook' });

      const response = await getCategories();
      const payload = await responseJson<{ success: boolean; data: Array<Category & { products: Product[] }> }>(response);

      expect(response.status).toBe(200);
      expect(payload.success).toBe(true);
      expect(payload.data.map((category) => category.name)).toEqual(['Analytics', 'Branding']);
      expect(payload.data.find((category) => category.id === categoryA.id)?.products).toHaveLength(0);
      expect(payload.data.find((category) => category.id === categoryB.id)?.products).toHaveLength(1);
    });

    it('creates, updates, retrieves, and deletes a category using the real database', async () => {
      const createResponse = await postCategory(
        jsonRequest('http://localhost/api/categories', 'POST', {
          name: 'Leadership Audio',
          slug: 'leadership-audio',
          description: 'High-conviction leadership lessons for managers and founders.',
          imageUrl: 'https://cdn.example.com/categories/leadership-audio.jpg',
          type: 'AUDIOBOOK',
        }),
      );
      const created = await responseJson<{ success: boolean; data: Category }>(createResponse);

      expect(createResponse.status).toBe(201);
      expect(created.data.slug).toBe('leadership-audio');

      const auditAfterCreate = await db.auditLog.findFirst({ where: { action: 'category.create', entityId: created.data.id } });
      expect(auditAfterCreate?.userId).toBe('admin_test_user');

      const getResponse = await getCategoryById(jsonRequest('http://localhost/api/categories/id', 'GET'), routeContext(created.data.id));
      const fetched = await responseJson<{ success: boolean; data: Category & { products: Product[] } }>(getResponse);
      expect(fetched.data.id).toBe(created.data.id);
      expect(fetched.data.products).toHaveLength(0);

      const patchResponse = await patchCategory(
        jsonRequest('http://localhost/api/categories/id', 'PATCH', {
          name: 'Leadership Audio Library',
          slug: 'leadership-audio-library',
          description: 'Expanded leadership audio lessons for executives and operators.',
          imageUrl: '',
          type: 'AUDIOBOOK',
        }),
        routeContext(created.data.id),
      );
      const updated = await responseJson<{ success: boolean; data: Category }>(patchResponse);

      expect(updated.data.name).toBe('Leadership Audio Library');
      expect(updated.data.imageUrl).toBeNull();

      const storedCategory = await db.category.findUniqueOrThrow({ where: { id: created.data.id } });
      expect(storedCategory.slug).toBe('leadership-audio-library');
      expect(storedCategory.imageUrl).toBeNull();

      const deleteResponse = await deleteCategory(jsonRequest('http://localhost/api/categories/id', 'DELETE'), routeContext(created.data.id));
      const deleted = await responseJson<{ success: boolean; data: { deleted: boolean } }>(deleteResponse);

      expect(deleted.data.deleted).toBe(true);
      expect(await db.category.findUnique({ where: { id: created.data.id } })).toBeNull();
      expect(await db.auditLog.findFirst({ where: { action: 'category.delete', entityId: created.data.id } })).not.toBeNull();
    });
  });

  describe('products', () => {
    it('filters published products by query, type, and category using real Prisma queries', async () => {
      const analytics = await seedCategory({ name: 'Analytics', slug: 'analytics', type: ProductType.COURSE });
      const writing = await seedCategory({ name: 'Writing', slug: 'writing', type: ProductType.EBOOK });
      await seedProduct({
        categoryId: analytics.id,
        type: ProductType.COURSE,
        title: 'Mastering Analytics Ops',
        slug: 'mastering-analytics-ops',
        sku: 'ANALYTICS-OPS',
      });
      await seedProduct({
        categoryId: writing.id,
        type: ProductType.EBOOK,
        title: 'Writing Better Offers',
        slug: 'writing-better-offers',
        sku: 'WRITING-OFFERS',
      });

      const response = await getProducts(
        jsonRequest(
          `http://localhost/api/products?query=${encodeURIComponent('analytics')}&type=COURSE&category=${analytics.id}`,
          'GET',
        ),
      );
      const payload = await responseJson<{ success: boolean; data: Array<Product & { category: Category }> }>(response);

      expect(response.status).toBe(200);
      expect(payload.data).toHaveLength(1);
      expect(payload.data[0]?.title).toBe('Mastering Analytics Ops');
      expect(payload.data[0]?.category.id).toBe(analytics.id);
    });

    it('creates, updates, retrieves, and deletes products with media links in PostgreSQL', async () => {
      const category = await seedCategory({ name: 'Courses', slug: 'courses', type: ProductType.COURSE });
      const coverA = await seedMedia({ id: 'media_cover_a', fileName: 'cover-a.jpg', mimeType: 'image/jpeg', kind: MediaKind.IMAGE });
      const coverB = await seedMedia({ id: 'media_cover_b', fileName: 'cover-b.jpg', mimeType: 'image/jpeg', kind: MediaKind.IMAGE });
      const downloadA = await seedMedia({ id: 'media_download_a', fileName: 'course-a.zip', mimeType: 'application/zip' });
      const downloadB = await seedMedia({ id: 'media_download_b', fileName: 'course-b.zip', mimeType: 'application/zip' });

      const createResponse = await postProduct(
        jsonRequest('http://localhost/api/products', 'POST', {
          title: 'Growth Engine Intensive',
          slug: 'growth-engine-intensive',
          excerpt: 'A practical intensive for teams building reliable acquisition and retention engines.',
          description:
            'A deep operational course covering messaging, funnel design, retention programs, growth loops, measurement strategy, and execution workflows for fast-moving teams.',
          type: 'COURSE',
          status: 'PUBLISHED',
          sku: 'GROWTH-INTENSIVE',
          priceCents: 125000,
          compareAtPriceCents: 165000,
          categoryId: category.id,
          featured: true,
          popularScore: 90,
          features: ['Playbooks', 'Templates', 'Worksheets'],
          coverMediaId: coverA.id,
          downloadMediaIds: [downloadA.id],
          seoTitle: 'Growth Engine Intensive',
          seoDescription: 'Premium growth systems course for operators.',
        }),
      );
      const created = await responseJson<{
        success: boolean;
        data: Product & { productMedia: Array<{ mediaId: string; role: ProductMediaRole }>; category: Category };
      }>(createResponse);

      expect(createResponse.status).toBe(201);
      expect(created.data.category.id).toBe(category.id);
      expect(created.data.productMedia.map((item) => [item.mediaId, item.role])).toEqual([
        [coverA.id, ProductMediaRole.COVER],
        [downloadA.id, ProductMediaRole.DOWNLOAD],
      ]);
      expect(await db.auditLog.findFirst({ where: { action: 'product.create', entityId: created.data.id } })).not.toBeNull();

      const getResponse = await getProductById(jsonRequest('http://localhost/api/products/id', 'GET'), routeContext(created.data.id));
      const fetched = await responseJson<{
        success: boolean;
        data: Product & { productMedia: Array<{ mediaId: string; role: ProductMediaRole }>; category: Category };
      }>(getResponse);
      expect(fetched.data.id).toBe(created.data.id);
      expect(fetched.data.productMedia).toHaveLength(2);

      const patchResponse = await patchProduct(
        jsonRequest('http://localhost/api/products/id', 'PATCH', {
          title: 'Growth Engine Intensive 2.0',
          slug: 'growth-engine-intensive-2',
          excerpt: 'An upgraded intensive for teams building acquisition, activation, and retention systems.',
          description:
            'An upgraded operational course with advanced modules on channel testing, analytics instrumentation, offer iteration, retention design, and team operating cadences.',
          type: 'COURSE',
          status: 'PUBLISHED',
          sku: 'GROWTH-INTENSIVE-2',
          priceCents: 149000,
          compareAtPriceCents: 189000,
          categoryId: category.id,
          featured: false,
          popularScore: 95,
          features: ['Advanced playbooks', 'Dashboards', 'Templates'],
          coverMediaId: coverB.id,
          downloadMediaIds: [downloadB.id],
          seoTitle: 'Growth Engine Intensive 2.0',
          seoDescription: 'Upgraded premium growth systems course.',
        }),
        routeContext(created.data.id),
      );
      const updated = await responseJson<{
        success: boolean;
        data: Product & { productMedia: Array<{ mediaId: string; role: ProductMediaRole }> };
      }>(patchResponse);

      expect(updated.data.title).toBe('Growth Engine Intensive 2.0');
      expect(updated.data.productMedia.map((item) => [item.mediaId, item.role])).toEqual([
        [coverB.id, ProductMediaRole.COVER],
        [downloadB.id, ProductMediaRole.DOWNLOAD],
      ]);

      const storedMedia = await db.productMedia.findMany({
        where: { productId: created.data.id },
        orderBy: [{ sortOrder: 'asc' }, { role: 'asc' }],
      });
      expect(storedMedia.map((item) => [item.mediaId, item.role])).toEqual([
        [coverB.id, ProductMediaRole.COVER],
        [downloadB.id, ProductMediaRole.DOWNLOAD],
      ]);

      const deleteResponse = await deleteProduct(jsonRequest('http://localhost/api/products/id', 'DELETE'), routeContext(created.data.id));
      const deleted = await responseJson<{ success: boolean; data: { deleted: boolean } }>(deleteResponse);

      expect(deleted.data.deleted).toBe(true);
      expect(await db.product.findUnique({ where: { id: created.data.id } })).toBeNull();
      expect(await db.auditLog.findFirst({ where: { action: 'product.delete', entityId: created.data.id } })).not.toBeNull();
    });
  });

  describe('coupons', () => {
    it('lists coupons from PostgreSQL in reverse-chronological order', async () => {
      const older = await db.coupon.create({
        data: {
          id: 'coupon_older',
          code: 'OLDER10',
          type: CouponType.PERCENTAGE,
          value: 10,
          active: true,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      });
      const newer = await db.coupon.create({
        data: {
          id: 'coupon_newer',
          code: 'NEWER20',
          type: CouponType.FIXED,
          value: 2000,
          active: true,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      });

      const response = await getCoupons();
      const payload = await responseJson<{ success: boolean; data: Coupon[] }>(response);

      expect(response.status).toBe(200);
      expect(payload.data.map((coupon) => coupon.id)).toEqual([newer.id, older.id]);
    });

    it('creates, updates, retrieves, and deletes coupons with normalized values and audit logs', async () => {
      const createResponse = await postCoupon(
        jsonRequest('http://localhost/api/coupons', 'POST', {
          code: 'launch25',
          description: 'Launch discount for first-time buyers.',
          type: 'PERCENTAGE',
          value: 25,
          maxDiscountCents: 15000,
          minOrderCents: 50000,
          usageLimit: 100,
          startsAt: '2026-04-01T00:00:00.000Z',
          endsAt: '2026-04-30T23:59:59.000Z',
          active: true,
        }),
      );
      const created = await responseJson<{ success: boolean; data: Coupon }>(createResponse);

      expect(createResponse.status).toBe(201);
      expect(created.data.code).toBe('LAUNCH25');
      expect(await db.auditLog.findFirst({ where: { action: 'coupon.create', entityId: created.data.id } })).not.toBeNull();

      const getResponse = await getCouponById(jsonRequest('http://localhost/api/coupons/id', 'GET'), routeContext(created.data.id));
      const fetched = await responseJson<{ success: boolean; data: Coupon }>(getResponse);
      expect(fetched.data.id).toBe(created.data.id);

      const patchResponse = await patchCoupon(
        jsonRequest('http://localhost/api/coupons/id', 'PATCH', {
          code: 'launch50',
          description: 'Expanded launch discount.',
          type: 'FIXED',
          value: 5000,
          maxDiscountCents: null,
          minOrderCents: 75000,
          usageLimit: 25,
          startsAt: '2026-05-01T00:00:00.000Z',
          endsAt: '2026-05-31T23:59:59.000Z',
          active: false,
        }),
        routeContext(created.data.id),
      );
      const updated = await responseJson<{ success: boolean; data: Coupon }>(patchResponse);

      expect(updated.data.code).toBe('LAUNCH50');
      expect(updated.data.type).toBe(CouponType.FIXED);
      expect(updated.data.active).toBe(false);

      const storedCoupon = await db.coupon.findUniqueOrThrow({ where: { id: created.data.id } });
      expect(storedCoupon.code).toBe('LAUNCH50');
      expect(storedCoupon.type).toBe(CouponType.FIXED);
      expect(storedCoupon.startsAt?.toISOString()).toBe('2026-05-01T00:00:00.000Z');
      expect(storedCoupon.endsAt?.toISOString()).toBe('2026-05-31T23:59:59.000Z');

      const deleteResponse = await deleteCoupon(jsonRequest('http://localhost/api/coupons/id', 'DELETE'), routeContext(created.data.id));
      const deleted = await responseJson<{ success: boolean; data: { deleted: boolean } }>(deleteResponse);

      expect(deleted.data.deleted).toBe(true);
      expect(await db.coupon.findUnique({ where: { id: created.data.id } })).toBeNull();
      expect(await db.auditLog.findFirst({ where: { action: 'coupon.delete', entityId: created.data.id } })).not.toBeNull();
    });

    it('returns forbidden when admin access is denied', async () => {
      authState.requireApiAdminSession.mockRejectedValueOnce(adminForbiddenResponse());

      const response = await postCoupon(
        jsonRequest('http://localhost/api/coupons', 'POST', {
          code: 'blocked',
          type: 'FIXED',
          value: 1000,
          active: true,
        }),
      );
      const payload = await responseJson<{ success: boolean; message: string }>(response);

      expect(response.status).toBe(403);
      expect(payload.message).toBe('Forbidden');
      expect(await db.coupon.count()).toBe(0);
    });
  });

  describe('media', () => {
    it('uploads, lists, retrieves, updates, and deletes media with real filesystem storage', async () => {
      const file = new File(['hello media integration'], 'integration-media.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.set('file', file);
      formData.set('altText', 'Integration upload');

      const createResponse = await postMedia(
        new NextRequest('http://localhost/api/media', {
          method: 'POST',
          body: formData,
        }),
      );
      const created = await responseJson<{ success: boolean; data: Media }>(createResponse);

      expect(createResponse.status).toBe(201);
      expect(created.data.kind).toBe(MediaKind.DOCUMENT);
      expect(created.data.url).toContain('/uploads/');
      expect(await db.auditLog.findFirst({ where: { action: 'media.create', entityId: created.data.id } })).not.toBeNull();

      const listResponse = await getMedia();
      const listed = await responseJson<{ success: boolean; data: Array<Media & { uploadedBy: User | null }> }>(listResponse);
      expect(listed.data).toHaveLength(1);
      expect(listed.data[0]?.uploadedBy?.id).toBe('admin_test_user');

      const getResponse = await getMediaById(jsonRequest('http://localhost/api/media/id', 'GET'), routeContext(created.data.id));
      const fetched = await responseJson<{ success: boolean; data: Media & { uploadedBy: User | null } }>(getResponse);
      expect(fetched.data.id).toBe(created.data.id);

      const patchResponse = await patchMedia(
        jsonRequest('http://localhost/api/media/id', 'PATCH', {
          fileName: 'integration-media-renamed.txt',
          altText: 'Updated integration upload',
        }),
        routeContext(created.data.id),
      );
      const updated = await responseJson<{ success: boolean; data: Media }>(patchResponse);
      expect(updated.data.fileName).toBe('integration-media-renamed.txt');
      expect(updated.data.altText).toBe('Updated integration upload');

      const deleteResponse = await deleteMedia(jsonRequest('http://localhost/api/media/id', 'DELETE'), routeContext(created.data.id));
      const deleted = await responseJson<{ success: boolean; data: { deleted: boolean } }>(deleteResponse);
      expect(deleted.data.deleted).toBe(true);
      expect(await db.media.findUnique({ where: { id: created.data.id } })).toBeNull();

      await removeUploadedFile(created.data.storageKey);
    });
  });

  describe('users', () => {
    it('lists users with orders/downloads and allows admin profile updates using PostgreSQL', async () => {
      const category = await seedCategory({ name: 'User Assets', slug: 'user-assets', type: ProductType.EBOOK });
      const media = await seedMedia({ id: 'media_user_download' });
      const customer = await seedCustomerUser({ name: 'Aisha Bello', email: 'aisha@example.com' });
      const product = await seedProduct({ categoryId: category.id, downloadMediaIds: [media.id] });
      const order = await db.order.create({
        data: {
          userId: customer.id,
          status: 'PAID',
          subtotalCents: 45000,
          discountCents: 0,
          totalCents: 45000,
          currency: 'NGN',
          billingName: customer.name,
          billingEmail: customer.email,
          billingPhone: '+2348000000001',
          billingAddressJson: { line1: '1 Admin Street', city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
          items: {
            create: [{ productId: product.id, titleSnapshot: product.title, priceCents: product.priceCents }],
          },
        },
      });
      await db.download.create({
        data: {
          userId: customer.id,
          productId: product.id,
          orderId: order.id,
          mediaId: media.id,
        },
      });

      const listResponse = await getUsers();
      const listed = await responseJson<{ success: boolean; data: Array<User & { orders: unknown[]; downloads: unknown[] }> }>(listResponse);
      const listedCustomer = listed.data.find((user) => user.id === customer.id);

      expect(listResponse.status).toBe(200);
      expect(listedCustomer?.orders).toHaveLength(1);
      expect(listedCustomer?.downloads).toHaveLength(1);

      const getResponse = await getUserById(jsonRequest('http://localhost/api/users/id', 'GET'), routeContext(customer.id));
      const fetched = await responseJson<{ success: boolean; data: User & { orders: unknown[]; downloads: unknown[]; courseProgress: unknown[] } }>(getResponse);
      expect(fetched.data.id).toBe(customer.id);
      expect(fetched.data.orders).toHaveLength(1);

      const patchResponse = await patchUser(
        jsonRequest('http://localhost/api/users/id', 'PATCH', {
          name: 'Aisha Bello Updated',
          avatarUrl: 'https://cdn.example.com/avatars/aisha.jpg',
          role: 'ADMIN',
        }),
        routeContext(customer.id),
      );
      const updated = await responseJson<{ success: boolean; data: User }>(patchResponse);
      expect(updated.data.name).toBe('Aisha Bello Updated');
      expect(updated.data.role).toBe(UserRole.ADMIN);
      expect(await db.auditLog.findFirst({ where: { action: 'user.update', entityId: customer.id } })).not.toBeNull();
    });
  });

  describe('faqs', () => {
    it('lists, creates, updates, and deletes FAQs in PostgreSQL', async () => {
      await db.faq.create({
        data: {
          question: 'How do I access my downloads?',
          answer: 'You can access downloads from your dashboard after payment verification.',
          category: 'Downloads',
          sortOrder: 1,
          published: true,
        },
      });

      const listResponse = await getFaqs();
      const listed = await responseJson<{ success: boolean; data: Faq[] }>(listResponse);
      expect(listed.data).toHaveLength(1);

      const createResponse = await postFaq(
        jsonRequest('http://localhost/api/faqs', 'POST', {
          question: 'Do courses include updates?',
          answer: 'Yes. Active course owners receive future lesson and workbook updates.',
          category: 'Courses',
          sortOrder: 2,
          published: true,
        }),
      );
      const created = await responseJson<{ success: boolean; data: Faq }>(createResponse);
      expect(createResponse.status).toBe(201);

      const patchResponse = await patchFaq(
        jsonRequest('http://localhost/api/faqs/id', 'PATCH', {
          question: 'Do courses include lifetime updates?',
          answer: 'Yes. Active course owners receive future lesson, worksheet, and template updates.',
          category: 'Courses',
          sortOrder: 3,
          published: false,
        }),
        routeContext(created.data.id),
      );
      const updated = await responseJson<{ success: boolean; data: Faq }>(patchResponse);
      expect(updated.data.published).toBe(false);
      expect(updated.data.sortOrder).toBe(3);

      const deleteResponse = await deleteFaq(jsonRequest('http://localhost/api/faqs/id', 'DELETE'), routeContext(created.data.id));
      const deleted = await responseJson<{ success: boolean; data: { deleted: boolean } }>(deleteResponse);
      expect(deleted.data.deleted).toBe(true);
      expect(await db.faq.findUnique({ where: { id: created.data.id } })).toBeNull();
      expect(await db.auditLog.findFirst({ where: { action: 'faq.delete', entityId: created.data.id } })).not.toBeNull();
    });
  });

  describe('testimonials', () => {
    it('lists, creates, updates, and deletes testimonials in PostgreSQL', async () => {
      await db.testimonial.create({
        data: {
          name: 'Initial Customer',
          role: 'Founder',
          company: 'Acme Labs',
          quote: 'The starter library helped us turn our expertise into a premium digital catalog.',
          rating: 5,
          featured: true,
          sortOrder: 1,
        },
      });

      const listResponse = await getTestimonials();
      const listed = await responseJson<{ success: boolean; data: Testimonial[] }>(listResponse);
      expect(listed.data).toHaveLength(1);

      const createResponse = await postTestimonial(
        jsonRequest('http://localhost/api/testimonials', 'POST', {
          name: 'Monica Ade',
          role: 'COO',
          company: 'Northstar Studio',
          quote: 'The course systems and templates saved our team weeks of execution time.',
          rating: 5,
          avatarUrl: 'https://cdn.example.com/avatars/monica.jpg',
          featured: true,
          sortOrder: 2,
        }),
      );
      const created = await responseJson<{ success: boolean; data: Testimonial }>(createResponse);
      expect(createResponse.status).toBe(201);

      const patchResponse = await patchTestimonial(
        jsonRequest('http://localhost/api/testimonials/id', 'PATCH', {
          name: 'Monica Ade',
          role: 'Chief Operating Officer',
          company: 'Northstar Studio',
          quote: 'The course systems, dashboards, and templates saved our team weeks of execution time.',
          rating: 4,
          avatarUrl: 'https://cdn.example.com/avatars/monica-new.jpg',
          featured: false,
          sortOrder: 5,
        }),
        routeContext(created.data.id),
      );
      const updated = await responseJson<{ success: boolean; data: Testimonial }>(patchResponse);
      expect(updated.data.role).toBe('Chief Operating Officer');
      expect(updated.data.featured).toBe(false);

      const deleteResponse = await deleteTestimonial(
        jsonRequest('http://localhost/api/testimonials/id', 'DELETE'),
        routeContext(created.data.id),
      );
      const deleted = await responseJson<{ success: boolean; data: { deleted: boolean } }>(deleteResponse);
      expect(deleted.data.deleted).toBe(true);
      expect(await db.testimonial.findUnique({ where: { id: created.data.id } })).toBeNull();
      expect(await db.auditLog.findFirst({ where: { action: 'testimonial.delete', entityId: created.data.id } })).not.toBeNull();
    });
  });
});
