"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItemInput } from "@/types";

type CartStore = {
  items: CartItemInput[];
  addItem: (item: CartItemInput) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const normalizeItem = (item: CartItemInput): CartItemInput => ({
  ...item,
  quantity: 1,
});

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const normalizedItem = normalizeItem(item);
        const existing = get().items.find(
          (entry) => entry.productId === normalizedItem.productId,
        );

        if (existing) {
          set({
            items: get().items.map((entry) =>
              entry.productId === normalizedItem.productId
                ? { ...entry, ...normalizedItem, quantity: 1 }
                : entry,
            ),
          });
          return;
        }

        set({ items: [...get().items, normalizedItem] });
      },
      removeItem: (productId) =>
        set({
          items: get().items.filter((item) => item.productId !== productId),
        }),
      updateQuantity: (productId) =>
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity: 1 } : item,
          ),
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "premium-marketplace-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items.map(normalizeItem),
      }),
    },
  ),
);

export function useCartTotals() {
  const items = useCartStore((state) => state.items);
  const normalizedItems = items.map(normalizeItem);
  const subtotalCents = normalizedItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );

  return { items: normalizedItems, subtotalCents };
}
