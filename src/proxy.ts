import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "pdm_session";

async function getSessionPayload(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
  const { payload } = await jwtVerify(token, secret);
  return payload as { role?: string };
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url),
    );
  }

  try {
    const session = await getSessionPayload(token);
    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
