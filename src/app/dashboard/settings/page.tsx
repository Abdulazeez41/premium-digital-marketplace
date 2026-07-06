import { SecurityForm } from "@/components/forms/security-form";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardSettingsPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Security settings
        </h1>
        <SecurityForm />
      </CardContent>
    </Card>
  );
}
