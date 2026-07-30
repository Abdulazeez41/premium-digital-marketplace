import { z } from "zod";

const mailFromSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (z.string().email().safeParse(value).success) return true;

      const displayNameAddress = value.match(/^.+\s<([^<>\s]+)>$/);
      return Boolean(
        displayNameAddress &&
        z.string().email().safeParse(displayNameAddress[1]).success,
      );
    },
    {
      message:
        "MAIL_FROM must be an email address or a display name followed by <email@example.com>.",
    },
  );

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_CURRENCY: z.string().default("NGN"),
  JWT_SECRET: z.string().min(32),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  // Nodemailer accepts both `no-reply@example.com` and
  // `Premium Marketplace <no-reply@example.com>`.
  MAIL_FROM: mailFromSchema,
  STORAGE_DRIVER: z
    .enum(["r2", "supabase", "filesystem"])
    .default("filesystem"),
  STORAGE_BUCKET: z.string().optional().default(""),
  STORAGE_REGION: z.string().optional().default("auto"),
  STORAGE_ENDPOINT: z.string().optional().default(""),
  STORAGE_ACCESS_KEY_ID: z.string().optional().default(""),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional().default(""),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().optional().default(""),
  SUPPORT_EMAIL: z.string().email().default("support@digitalmarketplace.dev"),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
