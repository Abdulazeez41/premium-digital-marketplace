import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import sanitizeHtml from "sanitize-html";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amountInCents: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

export function formatDate(date: Date | string, pattern = "PPP") {
  return format(new Date(date), pattern);
}

export function slugToTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt"],
      a: ["href", "target", "rel"],
    },
  });
}

export function createReference(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export function calculatePercentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
