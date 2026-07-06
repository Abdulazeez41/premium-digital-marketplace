"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import type { CartItemInput } from "@/types";

export function AddToCartButton({
  item,
  iconOnly = false,
}: {
  item: CartItemInput;
  iconOnly?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      type="button"
      size={iconOnly ? "icon" : "default"}
      onClick={() => {
        addItem(item);
        toast.success(`${item.title} added to cart.`);
      }}
      aria-label={`Add ${item.title} to cart`}
    >
      <ShoppingCart className="h-4 w-4" />
      {!iconOnly ? <span className="ml-2">Add to cart</span> : null}
    </Button>
  );
}
