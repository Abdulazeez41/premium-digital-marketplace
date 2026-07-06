import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";
import { db } from "@/lib/db";

export async function Footer() {
  const footerContent = await db.homepageContent.findUnique({
    where: { key: "footer" },
  });
  const content = (footerContent?.content || {}) as {
    company?: string;
    socialLinks?: { label: string; href: string }[];
  };

  return (
    <footer className="border-t border-[#ECECEC] bg-white py-16">
      <Container className="space-y-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-md text-sm leading-7 text-[#666666]">
              {content.company ||
                "Premium digital products for ambitious builders and operators."}
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#7A1F2B]">
              Company
            </h3>
            <div className="grid gap-3 text-sm text-[#666666]">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/categories">Categories</Link>
              <Link href="/shop">Shop</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#7A1F2B]">
              Support
            </h3>
            <div className="grid gap-3 text-sm text-[#666666]">
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-[#ECECEC] pt-6 text-sm text-[#666666] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {(content.socialLinks || []).map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#7A1F2B]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
