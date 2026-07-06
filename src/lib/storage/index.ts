import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createSignedUrl } from "@/lib/storage/signed-url";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";

import { getEnv } from "@/lib/env";

function getS3Client() {
  const env = getEnv();
  return new S3Client({
    region: env.STORAGE_REGION,
    endpoint: env.STORAGE_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
    },
  });
}

function getSupabaseClient() {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export async function uploadBuffer(input: {
  fileName: string;
  contentType: string;
  buffer: Buffer;
}) {
  const env = getEnv();
  const storageKey = `${Date.now()}-${input.fileName}`;

  if (env.STORAGE_DRIVER === "r2") {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.contentType,
      }),
    );

    return { storageKey, url: await createSignedUrl(storageKey) };
  }

  if (env.STORAGE_DRIVER === "supabase") {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(storageKey, input.buffer, {
        contentType: input.contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(storageKey);
    return { storageKey, url: data.publicUrl };
  }

  const targetDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, storageKey), input.buffer);
  return { storageKey, url: `/uploads/${storageKey}` };
}

export async function getDownloadUrl(storageKey: string) {
  const env = getEnv();
  if (env.STORAGE_DRIVER === "r2") {
    return createSignedUrl(storageKey);
  }
  if (env.STORAGE_DRIVER === "supabase") {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(storageKey, 60 * 10);
    if (error) throw error;
    return data.signedUrl;
  }
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/uploads/${storageKey}`;
}
