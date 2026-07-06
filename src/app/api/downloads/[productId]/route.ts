import { NextRequest } from "next/server";

import { requireApiSession } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getDownloadUrl } from "@/lib/storage";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  const { productId } = await context.params;

  try {
    const session = await requireApiSession();
    const downloads = await db.download.findMany({
      where: { userId: session.id, productId },
      include: { media: true, product: true },
    });

    if (!downloads.length)
      return fail("You do not have access to this product.", 403);

    const signedDownloads = await Promise.all(
      downloads.map(async (download) => {
        await db.download.update({
          where: { id: download.id },
          data: {
            downloadCount: { increment: 1 },
            lastDownloadedAt: new Date(),
          },
        });

        return {
          id: download.id,
          fileName: download.media.fileName,
          url: await getDownloadUrl(download.media.storageKey),
        };
      }),
    );

    return ok(signedDownloads);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}
