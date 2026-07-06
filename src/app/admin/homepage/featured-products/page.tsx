import { HomepageContentForm } from "@/components/forms/homepage-content-form";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminHomepageFeaturedProductsPage() {
  const content = await db.homepageContent.findUnique({
    where: { key: "why-choose-us" },
  });
  if (!content) return null;
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Edit featured / value props
        </h1>
        <HomepageContentForm content={content} />
      </CardContent>
    </Card>
  );
}
