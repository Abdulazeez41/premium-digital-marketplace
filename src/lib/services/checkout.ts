import "server-only";

import { PaymentStatus, ProductMediaRole } from "@prisma/client";

import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { sendReceiptEmail } from "@/lib/email/mailer";
import { computeDiscountCents } from "@/lib/payments/helpers";
import { createReference } from "@/lib/utils";
import type { CheckoutPayload } from "@/types";

export async function buildValidatedCart(payload: CheckoutPayload) {
  const products = await db.product.findMany({
    where: {
      id: { in: payload.items.map((item) => item.productId) },
      status: "PUBLISHED",
    },
    include: { productMedia: { include: { media: true } } },
  });

  if (products.length !== payload.items.length) {
    throw new Error("Some products are unavailable.");
  }

  const items = products.map((product) => ({
    product,
    quantity: 1,
    priceCents: product.priceCents,
  }));

  const subtotalCents = items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );

  return { items, subtotalCents };
}

export async function resolveCoupon(
  code: string | undefined,
  subtotalCents: number,
) {
  if (!code) return { coupon: null, discountCents: 0 };

  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!coupon || !coupon.active) return { coupon: null, discountCents: 0 };
  if (coupon.startsAt && coupon.startsAt > new Date())
    return { coupon: null, discountCents: 0 };
  if (coupon.endsAt && coupon.endsAt < new Date())
    return { coupon: null, discountCents: 0 };
  if (coupon.minOrderCents && subtotalCents < coupon.minOrderCents)
    return { coupon: null, discountCents: 0 };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    return { coupon: null, discountCents: 0 };

  const discountCents = computeDiscountCents(subtotalCents, coupon);

  return { coupon, discountCents };
}

export async function createPendingOrder(
  userId: string,
  payload: CheckoutPayload,
) {
  const { items, subtotalCents } = await buildValidatedCart(payload);
  const { coupon, discountCents } = await resolveCoupon(
    payload.couponCode,
    subtotalCents,
  );
  const totalCents = Math.max(subtotalCents - discountCents, 0);
  const reference = createReference("paystack");

  const order = await db.order.create({
    data: {
      userId,
      subtotalCents,
      discountCents,
      totalCents,
      currency: "NGN",
      couponCode: coupon?.code,
      paystackReference: reference,
      billingName: payload.billingName,
      billingEmail: payload.billingEmail,
      billingPhone: payload.billingPhone,
      billingAddressJson: payload.billingAddress,
      items: {
        create: items.map((item) => ({
          productId: item.product.id,
          titleSnapshot: item.product.title,
          priceCents: item.priceCents,
        })),
      },
      payments: {
        create: {
          provider: "paystack",
          reference,
          amountCents: totalCents,
          currency: "NGN",
          status: PaymentStatus.INITIALIZED,
        },
      },
    },
    include: { items: true },
  });

  return { order, items, coupon, discountCents };
}

export async function grantOrderAccess(
  orderId: string,
  paystackPayload?: Record<string, unknown>,
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              productMedia: { include: { media: true } },
              course: { include: { lessons: true } },
            },
          },
        },
      },
      payments: true,
      user: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === "PAID") return order;

  await db.$transaction(async (transaction) => {
    await transaction.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentVerifiedAt: new Date(),
      },
    });

    await transaction.payment.updateMany({
      where: { orderId: order.id },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        rawPayload: paystackPayload as any,
      },
    });

    if (order.couponCode) {
      await transaction.coupon.update({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    for (const item of order.items) {
      const downloadableMedia = item.product.productMedia.filter(
        (media) => media.role === ProductMediaRole.DOWNLOAD,
      );

      for (const entry of downloadableMedia) {
        await transaction.download.upsert({
          where: {
            userId_productId_mediaId: {
              userId: order.userId,
              productId: item.product.id,
              mediaId: entry.mediaId,
            },
          },
          update: {},
          create: {
            userId: order.userId,
            productId: item.product.id,
            orderId: order.id,
            mediaId: entry.mediaId,
          },
        });
      }

      if (item.product.course) {
        await transaction.courseProgress.upsert({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: item.product.course.id,
            },
          },
          update: {},
          create: { userId: order.userId, courseId: item.product.course.id },
        });
      }
    }
  });

  await createAuditLog({
    userId: order.userId,
    action: "order.paid",
    entityType: "Order",
    entityId: order.id,
    details: { paystackPayload } as any,
  });

  await sendReceiptEmail(order.billingEmail, order.id);

  return order;
}
