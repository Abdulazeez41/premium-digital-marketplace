import "server-only";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getEnv } from "@/lib/env";

export async function createSignedUrl(storageKey: string) {
  const env = getEnv();
  const client = new S3Client({
    region: env.STORAGE_REGION,
    endpoint: env.STORAGE_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
    },
  });

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: storageKey,
    }),
    { expiresIn: 60 * 10 },
  );
}
