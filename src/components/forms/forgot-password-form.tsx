"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.message || "Unable to send reset email.");
      return;
    }
    toast.success(
      "If an account exists for that email, a reset link has been sent.",
    );
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
        />
        <p className="text-xs text-[#DC2626]">
          {form.formState.errors.email?.message}
        </p>
      </div>
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
