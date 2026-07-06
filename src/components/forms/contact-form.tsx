"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const response = await fetch("/api/homepage/contact", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData.entries())),
          headers: { "Content-Type": "application/json" },
        });
        setLoading(false);
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Unable to send message.");
          return;
        }
        toast.success("Message sent successfully.");
        (event.target as HTMLFormElement).reset();
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required />
      </div>
      <Button className="w-full md:w-auto" disabled={loading}>
        {loading ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
