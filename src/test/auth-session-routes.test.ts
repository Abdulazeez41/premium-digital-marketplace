import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: {
    clearSessionCookie: vi.fn(),
    getSession: vi.fn(),
  },
  db: {
    emailVerificationToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/session', () => mocks.session);
vi.mock('@/lib/db', () => ({ db: mocks.db }));

import { POST as logoutPOST } from '@/app/api/auth/logout/route';
import { GET as meGET } from '@/app/api/auth/me/route';
import { GET as verifyEmailGET } from '@/app/api/auth/verify-email/route';

function makeNextRequest(url: string) {
  return {
    url,
    nextUrl: new URL(url),
  } as any;
}

describe('auth session and verification routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.clearSessionCookie.mockResolvedValue(undefined);
    mocks.session.getSession.mockResolvedValue(null);
    mocks.db.emailVerificationToken.findUnique.mockResolvedValue(null);
    mocks.db.emailVerificationToken.delete.mockResolvedValue(undefined);
    mocks.db.user.update.mockResolvedValue(undefined);
  });

  it('logs out the current session', async () => {
    const response = await logoutPOST();

    expect(mocks.session.clearSessionCookie).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: { loggedOut: true } });
  });

  it('returns unauthorized when /me has no session', async () => {
    const response = await meGET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, message: 'Unauthorized' });
  });

  it('returns the active session from /me', async () => {
    mocks.session.getSession.mockResolvedValue({
      id: 'user_1',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      role: 'CUSTOMER',
    });

    const response = await meGET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        id: 'user_1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        role: 'CUSTOMER',
      },
    });
  });

  it('redirects when verify-email is missing a token', async () => {
    const response = await verifyEmailGET(makeNextRequest('http://localhost/api/auth/verify-email'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login?error=missing-token');
  });

  it('redirects when verify-email token is invalid or expired', async () => {
    mocks.db.emailVerificationToken.findUnique.mockResolvedValue({
      token: 'expired-token',
      userId: 'user_1',
      expiresAt: new Date(Date.now() - 60_000),
    });

    const response = await verifyEmailGET(
      makeNextRequest('http://localhost/api/auth/verify-email?token=expired-token'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login?error=invalid-token');
    expect(mocks.db.user.update).not.toHaveBeenCalled();
    expect(mocks.db.emailVerificationToken.delete).not.toHaveBeenCalled();
  });

  it('verifies the user email and deletes the token when valid', async () => {
    mocks.db.emailVerificationToken.findUnique.mockResolvedValue({
      token: 'valid-token',
      userId: 'user_1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    const response = await verifyEmailGET(
      makeNextRequest('http://localhost/api/auth/verify-email?token=valid-token'),
    );

    expect(mocks.db.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { emailVerifiedAt: expect.any(Date) },
    });
    expect(mocks.db.emailVerificationToken.delete).toHaveBeenCalledWith({ where: { token: 'valid-token' } });
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login?verified=true');
  });
});
