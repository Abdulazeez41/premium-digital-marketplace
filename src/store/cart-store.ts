"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { CartItemInput } from "@/types";

type CartStore = {
  items: CartItemInput[];
  addItem: (item: CartItemInput) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(
          (entry) => entry.productId === item.productId,
        );
        if (existing) {
          set({
            items: get().items.map((entry) =>
              entry.productId === item.productId
                ? { ...entry, quantity: entry.quantity + item.quantity }
                : entry,
            ),
          });
          return;
        }
        set({ items: [...get().items, item] });
      },
      removeItem: (productId) =>
        set({
          items: get().items.filter((item) => item.productId !== productId),
        }),
      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "premium-marketplace-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useCartTotals() {
  const items = useCartStore((state) => state.items);
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  return { items, subtotalCents };
}
