import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await db.siteSetting.findMany({ orderBy: { key: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <div className="grid gap-6">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A1F2B]">
                {setting.key}
              </p>
              <p className="mt-2 text-sm text-[#666666] break-all">
                {setting.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
