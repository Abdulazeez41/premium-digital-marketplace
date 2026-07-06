import { DownloadButton } from "@/components/dashboard/download-button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/lib/services/catalog";

export default async function DashboardDownloadsPage() {
  const session = await getSession();
  const overview = await getDashboardOverview(session!.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Downloads</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {overview.downloads.map((download) => (
          <Card key={download.id}>
            <CardContent className="space-y-4 p-6">
              <p className="text-lg font-semibold text-[#1F1F1F]">
                {download.product.title}
              </p>
              <p className="text-sm text-[#666666]">
                {download.media.fileName}
              </p>
              <DownloadButton productId={download.productId} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
