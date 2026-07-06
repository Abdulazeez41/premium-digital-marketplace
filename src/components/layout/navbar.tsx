import Link from "next/link";
import { Menu } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { MiniCart } from "@/components/shop/mini-cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/constants";
import { getSession } from "@/lib/auth/session";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-[#ECECEC]/70 bg-[#FAFAFA]/90 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[#444444] transition-colors hover:text-[#7A1F2B]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <MiniCart />
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link
              href={
                session
                  ? session.role === "ADMIN"
                    ? "/admin"
                    : "/dashboard"
                  : "/login"
              }
            >
              {session ? "Dashboard" : "Login"}
            </Link>
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/shop">Start shopping</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="max-w-sm">
              <div className="space-y-6">
                <Logo />
                <div className="grid gap-4">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl border border-[#ECECEC] px-4 py-3 text-sm font-medium text-[#1F1F1F]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <MiniCart />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
