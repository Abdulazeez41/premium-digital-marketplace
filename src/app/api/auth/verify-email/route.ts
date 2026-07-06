import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing-token", request.url),
    );
  }

  const record = await db.emailVerificationToken.findUnique({
    where: { token },
  });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", request.url),
    );
  }

  await db.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });
  await db.emailVerificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/login?verified=true", request.url));
}
