import { Container } from "@/components/layout/container";
import { AdminLayoutClient } from "@/components/admin/layout-client";
import { requireAdminPageSession } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPageSession();
  return (
    <Container className="py-12">
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Container>
  );
}
