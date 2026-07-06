"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  user,
}: {
  user: { id: string; name: string; email: string; avatarUrl?: string | null };
}) {
  const router = useRouter();
  const form = useForm({
    defaultValues: { name: user.name, avatarUrl: user.avatarUrl || "" },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (values) => {
        const response = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to update profile.");
          return;
        }
        toast.success("Profile updated.");
        router.refresh();
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...form.register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" {...form.register("avatarUrl")} />
      </div>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
