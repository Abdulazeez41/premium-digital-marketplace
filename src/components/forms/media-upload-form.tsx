"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MediaUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!file) {
          toast.error("Please select a file.");
          return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("altText", altText);

        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setLoading(false);
        if (!response.ok) {
          toast.error(result.message || "Unable to upload media.");
          return;
        }
        toast.success("Media uploaded successfully.");
        router.push("/admin/media");
        router.refresh();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="file">Media file</Label>
        <Input
          id="file"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="altText">Alt text</Label>
        <Input
          id="altText"
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
        />
      </div>
      <Button disabled={loading}>
        {loading ? "Uploading..." : "Upload media"}
      </Button>
    </form>
  );
}
