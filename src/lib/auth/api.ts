import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    throw new NextResponse(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return session;
}

export async function requireApiAdminSession() {
  const session = await requireApiSession();
  if (session.role !== "ADMIN") {
    throw new NextResponse(
      JSON.stringify({ success: false, message: "Forbidden" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return session;
}
