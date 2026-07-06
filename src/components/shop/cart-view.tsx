"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { items, subtotalCents } = useCartTotals();
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  if (!items.length) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-lg font-medium text-[#1F1F1F]">
            Your cart is empty.
          </p>
          <p className="mt-2 text-sm text-[#666666]">
            Explore the marketplace to add premium digital products.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Browse products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="h-24 w-20 rounded-2xl object-cover"
                />
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[#1F1F1F]">
                    {item.title}
                  </p>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#7A1F2B]">
                    {item.type}
                  </p>
                  <p className="text-sm text-[#666666]">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ECECEC] px-2 py-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="rounded-full p-2 hover:bg-[#F4F4F5]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="rounded-full p-2 hover:bg-[#F4F4F5]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="rounded-full p-3 text-[#666666] hover:bg-[#F4F4F5]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="h-fit">
        <CardContent className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Order summary
          </h2>
          <div className="flex items-center justify-between text-sm text-[#666666]">
            <span>Subtotal</span>
            <span className="font-semibold text-[#1F1F1F]">
              {formatPrice(subtotalCents)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[#666666]">
            <span>Delivery</span>
            <span className="font-semibold text-[#16A34A]">Instant access</span>
          </div>
          <Button asChild className="w-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
