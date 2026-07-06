import { ProfileForm } from "@/components/forms/profile-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/lib/services/catalog";

export default async function DashboardProfilePage() {
  const session = await getSession();
  const overview = await getDashboardOverview(session!.id);
  if (!overview.user) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">Profile</h1>
        <ProfileForm user={overview.user} />
      </CardContent>
    </Card>
  );
}
