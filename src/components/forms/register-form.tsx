"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/validators/auth";

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json();
    if (!response.ok) {
      toast.error(result.message || "Unable to create account.");
      return;
    }

    toast.success(
      "Account created. Please verify your email before continuing.",
    );
    router.push("/login");
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" {...form.register("name")} />
        <p className="text-xs text-[#DC2626]">
          {form.formState.errors.name?.message}
        </p>
      </div>
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
          autoComplete="new-password"
          {...form.register("password")}
        />
        <p className="text-xs text-[#DC2626]">
          {form.formState.errors.password?.message}
        </p>
      </div>
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
