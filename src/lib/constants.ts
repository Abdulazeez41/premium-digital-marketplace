export const APP_NAME = "Premium Digital Marketplace";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "support@digitalmarketplace.dev";
export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "NGN";
export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/courses", label: "Courses" },
  { href: "/ebooks", label: "E-books" },
  { href: "/audiobooks", label: "Audiobooks" },
  { href: "/workbooks", label: "Workbooks" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
export const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/downloads", label: "Downloads" },
  { href: "/dashboard/courses", label: "Courses" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
];
export const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/homepage", label: "Homepage CMS" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/settings", label: "Settings" },
];
export const PRODUCT_TYPES = [
  "EBOOK",
  "AUDIOBOOK",
  "WORKBOOK",
  "COURSE",
] as const;
