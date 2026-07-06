import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

export async function requireUserPageSession() {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }
  return session;
}

export async function requireAdminPageSession() {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/admin")}`);
  }
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}
