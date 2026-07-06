"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function MiniCart() {
  const { items, subtotalCents } = useCartTotals();
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open cart"
          className="relative"
        >
          <ShoppingBag className="h-4 w-4" />
          {items.length ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7A1F2B] px-1 text-[10px] text-white">
              {items.length}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <h3 className="text-lg font-semibold text-[#1F1F1F]">Your cart</h3>
          <p className="text-sm text-[#666666]">
            Review your items before checkout.
          </p>
        </SheetHeader>
        <div className="space-y-4">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-start justify-between gap-4 rounded-2xl border border-[#ECECEC] p-4"
              >
                <div>
                  <p className="font-medium text-[#1F1F1F]">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#7A1F2B]">
                    {item.type}
                  </p>
                  <p className="mt-2 text-sm text-[#666666]">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="rounded-full p-2 text-[#666666] hover:bg-[#F4F4F5]"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-[#D6D6D6] p-8 text-center text-sm text-[#666666]">
              Your cart is currently empty.
            </div>
          )}
        </div>
        <div className="mt-6 space-y-4 border-t border-[#ECECEC] pt-6">
          <div className="flex items-center justify-between text-sm text-[#666666]">
            <span>Subtotal</span>
            <span className="font-semibold text-[#1F1F1F]">
              {formatPrice(subtotalCents)}
            </span>
          </div>
          <Button asChild className="w-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/cart">View full cart</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
