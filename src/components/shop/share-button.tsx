"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          await navigator.share({ title, url });
          return;
        }
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard.");
      }}
    >
      <Share2 className="mr-2 h-4 w-4" /> Share
    </Button>
  );
}
