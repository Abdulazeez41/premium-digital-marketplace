"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";

export function LogoutButton(props: ButtonProps) {
  const router = useRouter();

  return (
    <Button
      {...props}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        toast.success("Signed out successfully.");
        router.push("/");
        router.refresh();
      }}
    />
  );
}
