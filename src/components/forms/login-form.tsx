"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json();
    if (!response.ok) {
      toast.error(result.message || "Unable to log in.");
      return;
    }

    toast.success("Welcome back.");
    router.push(
      searchParams.get("next") || result.data.redirectTo || "/dashboard",
    );
    router.refresh();
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
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        <p className="text-xs text-[#DC2626]">
          {form.formState.errors.password?.message}
        </p>
      </div>
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
