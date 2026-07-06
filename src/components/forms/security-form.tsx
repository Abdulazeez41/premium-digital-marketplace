"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SecurityForm() {
  const form = useForm({
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (values) => {
        const response = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to change password.");
          return;
        }
        toast.success("Password changed successfully.");
        form.reset();
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          {...form.register("currentPassword")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          {...form.register("newPassword")}
        />
      </div>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
