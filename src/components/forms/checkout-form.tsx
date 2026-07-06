"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validators/checkout";
import { useCartStore, useCartTotals } from "@/store/cart-store";

export function CheckoutForm({ reference }: { reference?: string }) {
  const clearCart = useCartStore((state) => state.clearCart);
  const { items, subtotalCents } = useCartTotals();
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      items,
      billingName: "",
      billingEmail: "",
      billingPhone: "",
      billingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "Nigeria",
      },
      couponCode: "",
    },
  });

  useEffect(() => {
    form.setValue("items", items as any);
  }, [form, items]);

  const initializeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof checkoutSchema>) => {
      const response = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to initialize checkout.");
      return result.data as { authorizationUrl: string };
    },
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
    onError: (error) => toast.error(error.message),
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Payment verification failed.");
      return result.data;
    },
    onSuccess: () => {
      clearCart();
      toast.success(
        "Payment verified. Your purchases are now available in your dashboard.",
      );
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (reference) {
      verifyMutation.mutate();
    }
  }, [reference, verifyMutation]);

  if (!items.length && !reference) {
    return (
      <Card>
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-lg font-semibold text-[#1F1F1F]">
            Your cart is empty.
          </p>
          <Button asChild>
            <Link href="/shop">Go to shop</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) =>
              initializeMutation.mutate(values),
            )}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billingName">Full name</Label>
                <Input id="billingName" {...form.register("billingName")} />
                <p className="text-xs text-[#DC2626]">
                  {form.formState.errors.billingName?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  {...form.register("billingEmail")}
                />
                <p className="text-xs text-[#DC2626]">
                  {form.formState.errors.billingEmail?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingPhone">Phone</Label>
                <Input id="billingPhone" {...form.register("billingPhone")} />
                <p className="text-xs text-[#DC2626]">
                  {form.formState.errors.billingPhone?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponCode">Coupon code</Label>
                <Input id="couponCode" {...form.register("couponCode")} />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" {...form.register("billingAddress.line1")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register("billingAddress.city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...form.register("billingAddress.state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...form.register("billingAddress.country")}
                />
              </div>
            </div>
            <Button
              className="w-full"
              disabled={
                initializeMutation.isPending || verifyMutation.isPending
              }
            >
              {initializeMutation.isPending
                ? "Redirecting to Paystack..."
                : "Pay securely with Paystack"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardContent className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Order summary
          </h2>
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-[#666666]">{item.title}</span>
              <span className="font-medium text-[#1F1F1F]">
                {formatPrice(item.priceCents)}
              </span>
            </div>
          ))}
          <div className="border-t border-[#ECECEC] pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#666666]">Subtotal</span>
              <span className="font-semibold text-[#1F1F1F]">
                {formatPrice(subtotalCents)}
              </span>
            </div>
          </div>
          {reference ? (
            <p className="rounded-2xl bg-[#DCFCE7] px-4 py-3 text-sm text-[#166534]">
              Verifying payment reference: {reference}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
