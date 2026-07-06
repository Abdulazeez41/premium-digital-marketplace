"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteResourceButton({
  endpoint,
  label = "Delete",
}: {
  endpoint: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={async () => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this item?",
        );
        if (!confirmed) return;
        const response = await fetch(endpoint, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to delete item.");
          return;
        }
        toast.success("Item deleted.");
        router.refresh();
      }}
    >
      {label}
    </Button>
  );
}
