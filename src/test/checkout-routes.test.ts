import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: {
    requireApiSession: vi.fn(),
  },
  db: {
    order: {
      findUnique: vi.fn(),
    },
  },
  audit: {
    createAuditLog: vi.fn(),
  },
  paystack: {
    verifyPaystackTransaction: vi.fn(),
    verifyPaystackSignature: vi.fn(),
  },
  checkout: {
    grantOrderAccess: vi.fn(),
  },
}));

vi.mock('@/lib/auth/api', () => mocks.auth);
vi.mock('@/lib/db', () => ({ db: mocks.db }));
vi.mock('@/lib/audit', () => mocks.audit);
vi.mock('@/lib/payments/paystack', () => mocks.paystack);
vi.mock('@/lib/services/checkout', () => mocks.checkout);

import { POST as verifyCheckoutPOST } from '@/app/api/checkout/verify/route';
import { POST as paystackWebhookPOST } from '@/app/api/paystack/webhook/route';

function makeJsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('checkout verification and webhook routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.requireApiSession.mockResolvedValue({ id: 'user_1', role: 'CUSTOMER' });
    mocks.audit.createAuditLog.mockResolvedValue(undefined);
    mocks.checkout.grantOrderAccess.mockResolvedValue(undefined);
    mocks.paystack.verifyPaystackTransaction.mockResolvedValue({
      data: {
        status: 'success',
        reference: 'paystack_ref_123',
        amount: 125_000,
      },
    });
    mocks.paystack.verifyPaystackSignature.mockReturnValue(true);
  });

  it('verifies checkout payments and grants access to the order owner', async () => {
    mocks.db.order.findUnique.mockResolvedValue({
      id: 'order_1',
      userId: 'user_1',
      paystackReference: 'paystack_ref_123',
    });

    const response = await verifyCheckoutPOST(
      makeJsonRequest('http://localhost/api/checkout/verify', { reference: 'paystack_ref_123' }) as any,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: { verified: true, orderId: 'order_1' } });
    expect(mocks.paystack.verifyPaystackTransaction).toHaveBeenCalledWith('paystack_ref_123');
    expect(mocks.checkout.grantOrderAccess).toHaveBeenCalledWith(
      'order_1',
      expect.objectContaining({ reference: 'paystack_ref_123', status: 'success' }),
    );
    expect(mocks.audit.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        action: 'checkout.verify',
        entityType: 'Order',
        entityId: 'order_1',
      }),
    );
  });

  it('rejects verification when a different customer owns the order', async () => {
    mocks.db.order.findUnique.mockResolvedValue({
      id: 'order_2',
      userId: 'someone_else',
      paystackReference: 'paystack_ref_123',
    });

    const response = await verifyCheckoutPOST(
      makeJsonRequest('http://localhost/api/checkout/verify', { reference: 'paystack_ref_123' }) as any,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ success: false, message: 'Forbidden' });
    expect(mocks.checkout.grantOrderAccess).not.toHaveBeenCalled();
  });

  it('rejects webhook calls with invalid signatures', async () => {
    mocks.paystack.verifyPaystackSignature.mockReturnValue(false);

    const response = await paystackWebhookPOST(
      new Request('http://localhost/api/paystack/webhook', {
        method: 'POST',
        body: JSON.stringify({ event: 'charge.success' }),
      }) as any,
    );

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Invalid signature');
  });

  it('grants access for successful signed webhook events', async () => {
    mocks.db.order.findUnique.mockResolvedValue({
      id: 'order_3',
      paystackReference: 'paystack_ref_123',
    });

    const response = await paystackWebhookPOST(
      new Request('http://localhost/api/paystack/webhook', {
        method: 'POST',
        headers: {
          'x-paystack-signature': 'valid-signature',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          event: 'charge.success',
          data: {
            reference: 'paystack_ref_123',
            status: 'success',
          },
        }),
      }) as any,
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('ok');
    expect(mocks.paystack.verifyPaystackSignature).toHaveBeenCalled();
    expect(mocks.checkout.grantOrderAccess).toHaveBeenCalledWith(
      'order_3',
      expect.objectContaining({
        event: 'charge.success',
        data: expect.objectContaining({ reference: 'paystack_ref_123', status: 'success' }),
      }),
    );
  });

  it('returns 400 for malformed webhook JSON payloads', async () => {
    const response = await paystackWebhookPOST(
      new Request('http://localhost/api/paystack/webhook', {
        method: 'POST',
        headers: { 'x-paystack-signature': 'valid-signature' },
        body: '{"event":',
      }) as any,
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Invalid payload');
  });
});
