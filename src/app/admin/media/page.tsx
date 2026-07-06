import Image from "next/image";
import Link from "next/link";

import { DeleteResourceButton } from "@/components/forms/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMediaForAdmin } from "@/lib/services/catalog";

export default async function AdminMediaPage() {
  const media = await getMediaForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Media library</h1>
        <Button asChild>
          <Link href="/admin/media/upload">Upload media</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {media.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                {item.kind === "IMAGE" ? (
                  <Image
                    src={item.url}
                    alt={item.altText || item.fileName}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F4F4F5] text-xs font-medium text-[#666666]">
                    {item.kind}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-[#1F1F1F]">
                    {item.fileName}
                  </p>
                  <p className="text-sm text-[#666666]">ID: {item.id}</p>
                </div>
              </div>

              <DeleteResourceButton endpoint={`/api/media/${item.id}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
