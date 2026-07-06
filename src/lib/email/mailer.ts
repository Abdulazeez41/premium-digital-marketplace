import "server-only";

import nodemailer from "nodemailer";

import { APP_NAME, APP_URL } from "@/lib/constants";
import { getEnv } from "@/lib/env";

function getTransport() {
  const env = getEnv();

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const env = getEnv();
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  await getTransport().sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html: `<p>Welcome to ${APP_NAME}.</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const env = getEnv();
  const resetUrl = `${APP_URL}/forgot-password?token=${token}`;

  await getTransport().sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: `<p>You requested a password reset.</p><p>Complete it here:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}

export async function sendReceiptEmail(email: string, orderNumber: string) {
  const env = getEnv();
  const orderUrl = `${APP_URL}/dashboard/orders`;
  await getTransport().sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: `Your receipt for order ${orderNumber}`,
    html: `<p>Your payment has been verified and your products are now available in your dashboard.</p><p>View your order: <a href=\"${orderUrl}\">${orderUrl}</a></p>`,
  });
}

export async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const env = getEnv();
  await getTransport().sendMail({
    from: env.MAIL_FROM,
    to: env.SUPPORT_EMAIL,
    replyTo: input.email,
    subject: `Contact form: ${input.subject}`,
    html: `<p><strong>Name:</strong> ${input.name}</p><p><strong>Email:</strong> ${input.email}</p><p>${input.message}</p>`,
  });
}

export async function sendNewsletterNotification(email: string) {
  const env = getEnv();
  await getTransport().sendMail({
    from: env.MAIL_FROM,
    to: env.SUPPORT_EMAIL,
    subject: "New newsletter signup",
    html: `<p>${email} subscribed to the newsletter.</p>`,
  });
}
