import { MediaKind } from "@prisma/client";
import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { uploadBuffer } from "@/lib/storage";

export async function GET() {
  try {
    await requireApiAdminSession();
    const media = await db.media.findMany({
      orderBy: { createdAt: "desc" },
      include: { uploadedBy: true },
    });
    return ok(media);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiAdminSession();
    const formData = await request.formData();
    const file = formData.get("file");
    const altText = formData.get("altText")?.toString() || null;

    if (!(file instanceof File)) return fail("File upload is required.", 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await uploadBuffer({
      fileName: file.name,
      contentType: file.type,
      buffer,
    });

    const kind = file.type.startsWith("image/")
      ? MediaKind.IMAGE
      : file.type.startsWith("video/")
        ? MediaKind.VIDEO
        : file.type.startsWith("audio/")
          ? MediaKind.AUDIO
          : MediaKind.DOCUMENT;

    const media = await db.media.create({
      data: {
        fileName: file.name,
        storageKey: uploaded.storageKey,
        url: uploaded.url,
        mimeType: file.type,
        kind,
        sizeBytes: file.size,
        altText,
        uploadedById: session.id,
      },
    });

    await createAuditLog({
      userId: session.id,
      action: "media.create",
      entityType: "Media",
      entityId: media.id,
    });
    return ok(media, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to upload media.",
      400,
    );
  }
}
