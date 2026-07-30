import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    emailVerificationToken: {
      create: vi.fn(),
    },
    passwordResetToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
  rateLimit: {
    assertAuthRateLimit: vi.fn(),
    recordAuthAttempt: vi.fn(),
  },
  mailer: {
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  },
  password: {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  },
  env: {
    getEnv: vi.fn(),
  },
  session: {
    createSessionCookie: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ db: mocks.db }));
vi.mock("@/lib/auth/rate-limit", () => mocks.rateLimit);
vi.mock("@/lib/email/mailer", () => mocks.mailer);
vi.mock("@/lib/auth/password", () => mocks.password);
vi.mock("@/lib/auth/session", () => mocks.session);
vi.mock("@/lib/env", () => mocks.env);

import { POST as forgotPasswordPOST } from "@/app/api/auth/forgot-password/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as resetPasswordPOST } from "@/app/api/auth/reset-password/route";

function makeJsonRequest(
  url: string,
  body: unknown,
  headers?: Record<string, string>,
) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

describe("auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.rateLimit.assertAuthRateLimit.mockResolvedValue(undefined);
    mocks.rateLimit.recordAuthAttempt.mockResolvedValue(undefined);
    mocks.mailer.sendVerificationEmail.mockResolvedValue(undefined);
    mocks.mailer.sendPasswordResetEmail.mockResolvedValue(undefined);
    mocks.password.hashPassword.mockResolvedValue("hashed-password");
    mocks.password.verifyPassword.mockResolvedValue(true);
    mocks.session.createSessionCookie.mockResolvedValue(undefined);
    mocks.env.getEnv.mockReturnValue({});
  });

  it("registers a new user and creates a verification token", async () => {
    mocks.db.user.findUnique.mockResolvedValue(null);
    mocks.db.user.create.mockResolvedValue({
      id: "user_1",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
    mocks.db.emailVerificationToken.create.mockResolvedValue({ id: "evt_1" });

    const response = await registerPOST(
      makeJsonRequest(
        "http://localhost/api/auth/register",
        {
          name: "Ada Lovelace",
          email: "ada@example.com",
          password: "StrongPass!2026",
        },
        { "x-forwarded-for": "203.0.113.10" },
      ) as any,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { id: "user_1" },
    });
    expect(mocks.db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "ada@example.com",
          passwordHash: "hashed-password",
        }),
      }),
    );

    const verificationToken =
      mocks.db.emailVerificationToken.create.mock.calls[0]?.[0]?.data?.token;
    expect(verificationToken).toEqual(expect.any(String));
    expect(mocks.db.emailVerificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: verificationToken,
          userId: "user_1",
        }),
      }),
    );

    expect(mocks.mailer.sendVerificationEmail).toHaveBeenCalledWith(
      "ada@example.com",
      verificationToken,
    );
    expect(mocks.rateLimit.recordAuthAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: "203.0.113.10",
        action: "register",
        email: "ada@example.com",
        success: true,
        userId: "user_1",
      }),
    );
  });

  it("rejects duplicate registration emails", async () => {
    mocks.db.user.findUnique.mockResolvedValue({ id: "existing_user" });

    const response = await registerPOST(
      makeJsonRequest("http://localhost/api/auth/register", {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "StrongPass!2026",
      }) as any,
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "An account with this email already exists.",
    });
    expect(mocks.db.user.create).not.toHaveBeenCalled();
  });

  it("does not create an account when email configuration is invalid", async () => {
    mocks.env.getEnv.mockImplementation(() => {
      throw new Error("Invalid MAIL_FROM");
    });

    const response = await registerPOST(
      makeJsonRequest("http://localhost/api/auth/register", {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "StrongPass!2026",
      }) as any,
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      message:
        "Registration is temporarily unavailable because email is not configured correctly.",
    });
    expect(mocks.db.user.create).not.toHaveBeenCalled();
  });

  it("logs in a verified admin user and returns the admin redirect", async () => {
    mocks.db.user.findUnique.mockResolvedValue({
      id: "admin_1",
      name: "Grace Hopper",
      email: "grace@example.com",
      passwordHash: "stored-hash",
      role: "ADMIN",
      emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await loginPOST(
      makeJsonRequest(
        "http://localhost/api/auth/login",
        {
          email: "grace@example.com",
          password: "StrongPass!2026",
        },
        { "x-forwarded-for": "198.51.100.20" },
      ) as any,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { redirectTo: "/admin" },
    });
    expect(mocks.session.createSessionCookie).toHaveBeenCalledWith({
      id: "admin_1",
      email: "grace@example.com",
      name: "Grace Hopper",
      role: "ADMIN",
    });
    expect(mocks.rateLimit.recordAuthAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "login",
        email: "grace@example.com",
        success: true,
        userId: "admin_1",
      }),
    );
  });

  it("blocks login when email is not verified", async () => {
    mocks.db.user.findUnique.mockResolvedValue({
      id: "user_2",
      name: "Unverified User",
      email: "user@example.com",
      passwordHash: "stored-hash",
      role: "CUSTOMER",
      emailVerifiedAt: null,
    });

    const response = await loginPOST(
      makeJsonRequest("http://localhost/api/auth/login", {
        email: "user@example.com",
        password: "StrongPass!2026",
      }) as any,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Please verify your email before signing in.",
    });
    expect(mocks.session.createSessionCookie).not.toHaveBeenCalled();
  });

  it("creates and emails a reset token for known users", async () => {
    mocks.db.user.findUnique.mockResolvedValue({
      id: "user_3",
      email: "ada@example.com",
    });
    mocks.db.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });
    mocks.db.passwordResetToken.create.mockResolvedValue({ id: "prt_1" });

    const response = await forgotPasswordPOST(
      makeJsonRequest(
        "http://localhost/api/auth/forgot-password",
        {
          email: "ada@example.com",
        },
        { "x-forwarded-for": "192.0.2.55" },
      ) as any,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { sent: true },
    });
    expect(mocks.db.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_3" },
    });

    const resetToken =
      mocks.db.passwordResetToken.create.mock.calls[0]?.[0]?.data?.token;
    expect(resetToken).toEqual(expect.any(String));
    expect(mocks.db.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ token: resetToken, userId: "user_3" }),
      }),
    );
    expect(mocks.mailer.sendPasswordResetEmail).toHaveBeenCalledWith(
      "ada@example.com",
      resetToken,
    );
  });

  it("returns success for unknown forgot-password emails without sending mail", async () => {
    mocks.db.user.findUnique.mockResolvedValue(null);

    const response = await forgotPasswordPOST(
      makeJsonRequest("http://localhost/api/auth/forgot-password", {
        email: "missing@example.com",
      }) as any,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { sent: true },
    });
    expect(mocks.db.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mocks.mailer.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("resets the password when the token is valid", async () => {
    mocks.db.passwordResetToken.findUnique.mockResolvedValue({
      token: "reset_token",
      userId: "user_4",
      expiresAt: new Date(Date.now() + 60_000),
    });
    mocks.db.user.update.mockResolvedValue({ id: "user_4" });
    mocks.db.passwordResetToken.delete.mockResolvedValue({
      token: "reset_token",
    });

    const response = await resetPasswordPOST(
      makeJsonRequest("http://localhost/api/auth/reset-password", {
        token: "reset_token",
        password: "NewStrongPass!2026",
      }) as any,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { updated: true },
    });
    expect(mocks.db.user.update).toHaveBeenCalledWith({
      where: { id: "user_4" },
      data: { passwordHash: "hashed-password" },
    });
    expect(mocks.db.passwordResetToken.delete).toHaveBeenCalledWith({
      where: { token: "reset_token" },
    });
  });

  it("rejects expired reset tokens", async () => {
    mocks.db.passwordResetToken.findUnique.mockResolvedValue({
      token: "expired_token",
      userId: "user_5",
      expiresAt: new Date(Date.now() - 60_000),
    });

    const response = await resetPasswordPOST(
      makeJsonRequest("http://localhost/api/auth/reset-password", {
        token: "expired_token",
        password: "NewStrongPass!2026",
      }) as any,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Reset link is invalid or expired.",
    });
    expect(mocks.db.user.update).not.toHaveBeenCalled();
  });
});
