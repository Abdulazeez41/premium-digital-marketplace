import { Container } from "@/components/layout/container";
import { DashboardLayoutClient } from "@/components/dashboard/layout-client";
import { requireUserPageSession } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserPageSession();
  return (
    <Container className="py-12">
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Container>
  );
}
