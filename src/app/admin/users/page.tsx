import { Card, CardContent } from "@/components/ui/card";
import { getUsersForAdmin } from "@/lib/services/catalog";

export default async function AdminUsersPage() {
  const users = await getUsersForAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
      <div className="grid gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-[#1F1F1F]">{user.name}</p>
                <p className="text-sm text-[#666666]">{user.email}</p>
              </div>
              <p className="text-sm font-medium text-[#7A1F2B]">{user.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
