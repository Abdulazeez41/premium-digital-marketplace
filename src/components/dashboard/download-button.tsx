"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DownloadButton({ productId }: { productId: string }) {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const response = await fetch(`/api/downloads/${productId}`);
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to generate download links.");
          return;
        }

        result.data.forEach((entry: { url: string }) => {
          window.open(entry.url, "_blank", "noopener,noreferrer");
        });
      }}
    >
      <Download className="mr-2 h-4 w-4" /> Download files
    </Button>
  );
}
