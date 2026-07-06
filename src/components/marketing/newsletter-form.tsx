"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await fetch("/api/homepage/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setLoading(false);
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to subscribe.");
          return;
        }
        toast.success("You are subscribed.");
        setEmail("");
      }}
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
        className="sm:min-w-[280px]"
      />
      <Button disabled={loading}>
        {loading ? "Submitting..." : "Join newsletter"}
      </Button>
    </form>
  );
}
