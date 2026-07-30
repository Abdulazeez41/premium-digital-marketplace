import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  db: {
    product: {
      findMany: vi.fn(),
    },
    coupon: {
      findUnique: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  audit: {
    createAuditLog: vi.fn(),
  },
  mailer: {
    sendReceiptEmail: vi.fn(),
  },
  utils: {
    createReference: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({ db: mocks.db }));
vi.mock('@/lib/audit', () => mocks.audit);
vi.mock('@/lib/email/mailer', () => mocks.mailer);
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils')>('@/lib/utils');
  return {
    ...actual,
    createReference: mocks.utils.createReference,
  };
});

import { createPendingOrder, grantOrderAccess } from '@/lib/services/checkout';
import type { CheckoutPayload } from '@/types';

const basePayload: CheckoutPayload = {
  items: [
    {
      productId: 'prod_ebook',
      title: 'Premium Ebook',
      slug: 'premium-ebook',
      coverImage: 'https://example.com/ebook.jpg',
      priceCents: 125_000,
      type: 'EBOOK',
      quantity: 1,
    },
    {
      productId: 'prod_course',
      title: 'Premium Course',
      slug: 'premium-course',
      coverImage: 'https://example.com/course.jpg',
      priceCents: 300_000,
      type: 'COURSE',
      quantity: 1,
    },
  ],
  billingName: 'Ada Lovelace',
  billingEmail: 'ada@example.com',
  billingPhone: '+2348000000000',
  billingAddress: {
    line1: '10 Market Street',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
  },
  couponCode: 'WELCOME10',
};

describe('checkout service integration logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.utils.createReference.mockReturnValue('paystack_ref_123');
    mocks.audit.createAuditLog.mockResolvedValue(undefined);
    mocks.mailer.sendReceiptEmail.mockResolvedValue(undefined);
  });

  it('creates a pending order with validated products, discount, and initialized payment', async () => {
    mocks.db.product.findMany.mockResolvedValue([
      {
        id: 'prod_ebook',
        title: 'Premium Ebook',
        priceCents: 125_000,
        productMedia: [],
      },
      {
        id: 'prod_course',
        title: 'Premium Course',
        priceCents: 300_000,
        productMedia: [],
      },
    ]);
    mocks.db.coupon.findUnique.mockResolvedValue({
      code: 'WELCOME10',
      active: true,
      startsAt: null,
      endsAt: null,
      minOrderCents: null,
      usageLimit: 100,
      usedCount: 2,
      type: 'PERCENTAGE',
      value: 10,
      maxDiscountCents: null,
    });
    mocks.db.order.create.mockResolvedValue({
      id: 'order_1',
      items: [
        { productId: 'prod_ebook', titleSnapshot: 'Premium Ebook', priceCents: 125_000 },
        { productId: 'prod_course', titleSnapshot: 'Premium Course', priceCents: 300_000 },
      ],
      totalCents: 382_500,
      paystackReference: 'paystack_ref_123',
    });

    const result = await createPendingOrder('user_1', basePayload);

    expect(mocks.db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['prod_ebook', 'prod_course'] },
          status: 'PUBLISHED',
        }),
      }),
    );
    expect(mocks.db.coupon.findUnique).toHaveBeenCalledWith({ where: { code: 'WELCOME10' } });
    expect(mocks.db.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user_1',
          subtotalCents: 425_000,
          discountCents: 42_500,
          totalCents: 382_500,
          couponCode: 'WELCOME10',
          paystackReference: 'paystack_ref_123',
          payments: {
            create: expect.objectContaining({
              provider: 'paystack',
              reference: 'paystack_ref_123',
              amountCents: 382_500,
              status: 'INITIALIZED',
            }),
          },
        }),
      }),
    );
    expect(result.order.id).toBe('order_1');
    expect(result.discountCents).toBe(42_500);
  });

  it('grants downloads, course access, payment updates, and fulfillment side effects for a paid order', async () => {
    const transaction = {
      order: { update: vi.fn().mockResolvedValue(undefined) },
      payment: { updateMany: vi.fn().mockResolvedValue(undefined) },
      coupon: { update: vi.fn().mockResolvedValue(undefined) },
      download: { upsert: vi.fn().mockResolvedValue(undefined) },
      courseProgress: { upsert: vi.fn().mockResolvedValue(undefined) },
    };

    mocks.db.order.findUnique.mockResolvedValue({
      id: 'order_paid_1',
      userId: 'user_1',
      status: 'PENDING',
      couponCode: 'WELCOME10',
      billingEmail: 'ada@example.com',
      items: [
        {
          product: {
            id: 'prod_ebook',
            productMedia: [
              { role: 'DOWNLOAD', mediaId: 'media_pdf' },
              { role: 'COVER', mediaId: 'media_cover' },
            ],
            course: null,
          },
        },
        {
          product: {
            id: 'prod_course',
            productMedia: [{ role: 'DOWNLOAD', mediaId: 'media_zip' }],
            course: { id: 'course_1', lessons: [{ id: 'lesson_1' }] },
          },
        },
      ],
      payments: [],
      user: { id: 'user_1' },
    });
    mocks.db.$transaction.mockImplementation(async (callback: (tx: typeof transaction) => Promise<void>) => callback(transaction));

    const paystackPayload = { event: 'charge.success', data: { reference: 'paystack_ref_123', status: 'success' } };
    const order = await grantOrderAccess('order_paid_1', paystackPayload);

    expect(mocks.db.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order_paid_1' },
      }),
    );
    expect(transaction.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order_paid_1' },
        data: expect.objectContaining({ status: 'PAID' }),
      }),
    );
    expect(transaction.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: 'order_paid_1' },
        data: expect.objectContaining({ status: 'SUCCESS', rawPayload: paystackPayload }),
      }),
    );
    expect(transaction.coupon.update).toHaveBeenCalledWith({
      where: { code: 'WELCOME10' },
      data: { usedCount: { increment: 1 } },
    });
    expect(transaction.download.upsert).toHaveBeenCalledTimes(2);
    expect(transaction.download.upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          userId_productId_mediaId: {
            userId: 'user_1',
            productId: 'prod_ebook',
            mediaId: 'media_pdf',
          },
        },
      }),
    );
    expect(transaction.download.upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          userId_productId_mediaId: {
            userId: 'user_1',
            productId: 'prod_course',
            mediaId: 'media_zip',
          },
        },
      }),
    );
    expect(transaction.courseProgress.upsert).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: 'user_1', courseId: 'course_1' } },
      update: {},
      create: { userId: 'user_1', courseId: 'course_1' },
    });
    expect(mocks.audit.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        action: 'order.paid',
        entityType: 'Order',
        entityId: 'order_paid_1',
      }),
    );
    expect(mocks.mailer.sendReceiptEmail).toHaveBeenCalledWith('ada@example.com', 'order_paid_1');
    expect(order.id).toBe('order_paid_1');
  });

  it('returns early for already-paid orders without duplicating fulfillment', async () => {
    mocks.db.order.findUnique.mockResolvedValue({
      id: 'order_already_paid',
      userId: 'user_1',
      status: 'PAID',
      couponCode: null,
      billingEmail: 'ada@example.com',
      items: [],
      payments: [],
      user: { id: 'user_1' },
    });

    const order = await grantOrderAccess('order_already_paid', { event: 'charge.success' });

    expect(mocks.db.$transaction).not.toHaveBeenCalled();
    expect(mocks.audit.createAuditLog).not.toHaveBeenCalled();
    expect(mocks.mailer.sendReceiptEmail).not.toHaveBeenCalled();
    expect(order.status).toBe('PAID');
  });
});
