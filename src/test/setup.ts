process.env.DATABASE_URL ??=
  "postgresql://neondb_owner:npg_yBWL0ZI8njOf@ep-sparkling-wildflower-aheq892y-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.NEXT_PUBLIC_CURRENCY ??= "NGN";
process.env.JWT_SECRET ??=
  "test-jwt-secret-that-is-at-least-thirty-two-characters";
process.env.PAYSTACK_SECRET_KEY ??= "sk_test_placeholder";
process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ??= "pk_test_placeholder";
process.env.PAYSTACK_WEBHOOK_SECRET ??= "test_webhook_secret";
process.env.SMTP_HOST ??= "localhost";
process.env.SMTP_PORT ??= "1025";
process.env.SMTP_USER ??= "";
process.env.SMTP_PASS ??= "";
process.env.MAIL_FROM ??= "no-reply@example.com";
process.env.STORAGE_DRIVER ??= "filesystem";
process.env.STORAGE_BUCKET ??= "";
process.env.STORAGE_REGION ??= "auto";
process.env.STORAGE_ENDPOINT ??= "";
process.env.STORAGE_ACCESS_KEY_ID ??= "";
process.env.STORAGE_SECRET_ACCESS_KEY ??= "";
process.env.SUPABASE_URL ??= "";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "";
process.env.SUPABASE_STORAGE_BUCKET ??= "";
process.env.SUPPORT_EMAIL ??= "support@example.com";
