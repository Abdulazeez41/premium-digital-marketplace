"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/lib/validators/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.message || "Unable to reset password.");
      return;
    }
    toast.success("Password updated. You can sign in now.");
    router.push("/login");
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
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
        {form.formState.isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
