import {
  CouponType,
  ProductType,
  UserRole,
  type Category,
  type User,
} from "@prisma/client";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const cookieState = vi.hoisted(() => {
  const values = new Map<string, string>();

  return {
    reset() {
      values.clear();
    },
    store: {
      get(name: string) {
        const value = values.get(name);
        return value ? { name, value } : undefined;
      },
      set(name: string, value: string) {
        values.set(name, value);
      },
      delete(name: string) {
        values.delete(name);
      },
    },
  };
});

vi.mock("next/headers", () => ({
  cookies: async () => cookieState.store,
}));

import { POST as postCategory } from "@/app/api/categories/route";
import { GET as getCoupons } from "@/app/api/coupons/route";
import { PATCH as patchUser } from "@/app/api/users/[id]/route";
import { db } from "@/lib/db";
import { clearSessionCookie, createSessionCookie } from "@/lib/auth/session";
import { resetDatabase } from "@/test/helpers/db";

function routeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function responseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function seedUser(input: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}): Promise<User> {
  return db.user.create({
    data: {
      id: input.id,
      name: input.name,
      email: input.email,
      passwordHash: "hashed-password",
      role: input.role,
      emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  });
}

describe("session/cookie-backed admin API access", () => {
  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    cookieState.reset();
    await resetDatabase();
  });

  it("returns 401 for admin coupon list requests without a valid session cookie", async () => {
    await db.coupon.create({
      data: {
        code: "NOSESSION",
        type: CouponType.FIXED,
        value: 1000,
        active: true,
      },
    });

    const response = await getCoupons();
    const payload = await responseJson<{ success: boolean; message: string }>(
      response,
    );

    expect(response.status).toBe(401);
    expect(payload.message).toBe("Unauthorized");
  });

  it("returns 403 for customer sessions on admin-only routes", async () => {
    const customer = await seedUser({
      id: "customer_cookie_user",
      name: "Cookie Customer",
      email: "customer-cookie@example.com",
      role: UserRole.CUSTOMER,
    });
    await createSessionCookie({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: customer.role,
    });

    const response = await getCoupons();
    const payload = await responseJson<{ success: boolean; message: string }>(
      response,
    );

    expect(response.status).toBe(403);
    expect(payload.message).toBe("Forbidden");
  });

  it("allows admin sessions to create categories through the real auth/session path", async () => {
    const admin = await seedUser({
      id: "admin_cookie_user",
      name: "Cookie Admin",
      email: "admin-cookie@example.com",
      role: UserRole.ADMIN,
    });
    await createSessionCookie({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    const response = await postCategory(
      new Request("http://localhost/api/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Cookie Protected Category",
          slug: "cookie-protected-category",
          description:
            "A category created through session-cookie-backed admin access.",
          imageUrl: "",
          type: "COURSE",
        }),
      }) as any,
    );
    const payload = await responseJson<{ success: boolean; data: Category }>(
      response,
    );

    expect(response.status).toBe(201);
    expect(payload.data.name).toBe("Cookie Protected Category");
    expect(payload.data.type).toBe(ProductType.COURSE);
    expect(
      await db.auditLog.findFirst({
        where: {
          action: "category.create",
          entityId: payload.data.id,
          userId: admin.id,
        },
      }),
    ).not.toBeNull();
  });

  it("allows admin sessions to elevate a user role through the real session cookie", async () => {
    const admin = await seedUser({
      id: "admin_cookie_patch",
      name: "Patch Admin",
      email: "patch-admin@example.com",
      role: UserRole.ADMIN,
    });
    const target = await seedUser({
      id: "target_cookie_patch",
      name: "Target User",
      email: "target-user@example.com",
      role: UserRole.CUSTOMER,
    });
    await createSessionCookie({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    const response = await patchUser(
      new Request("http://localhost/api/users/target_cookie_patch", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Target User Updated",
          role: "ADMIN",
          avatarUrl: "https://cdn.example.com/avatars/target-user.jpg",
        }),
      }) as any,
      routeContext(target.id),
    );
    const payload = await responseJson<{ success: boolean; data: User }>(
      response,
    );

    expect(response.status).toBe(200);
    expect(payload.data.role).toBe(UserRole.ADMIN);
    expect(payload.data.name).toBe("Target User Updated");
    expect(
      await db.auditLog.findFirst({
        where: { action: "user.update", entityId: target.id, userId: admin.id },
      }),
    ).not.toBeNull();
  });

  it("clears the session cookie and blocks subsequent admin access", async () => {
    const admin = await seedUser({
      id: "admin_cookie_clear",
      name: "Clear Admin",
      email: "clear-admin@example.com",
      role: UserRole.ADMIN,
    });
    await db.coupon.create({
      data: {
        code: "COOKIE20",
        type: CouponType.PERCENTAGE,
        value: 20,
        active: true,
      },
    });

    await createSessionCookie({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
    await clearSessionCookie();

    const response = await getCoupons();
    const payload = await responseJson<{ success: boolean; message: string }>(
      response,
    );

    expect(response.status).toBe(401);
    expect(payload.message).toBe("Unauthorized");
  });
});
