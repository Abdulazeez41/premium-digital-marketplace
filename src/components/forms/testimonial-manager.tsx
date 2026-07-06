"use client";

import { Testimonial } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteResourceButton } from "@/components/forms/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  name: "",
  role: "",
  company: "",
  quote: "",
  rating: 5,
  avatarUrl: "",
  featured: true,
  sortOrder: 0,
};

export function TestimonialManager({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);

  async function createItem() {
    const response = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok)
      return toast.error(result.message || "Unable to create testimonial.");
    toast.success("Testimonial created.");
    setForm(emptyForm);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(event) =>
              setForm((state) => ({ ...state, name: event.target.value }))
            }
          />
          <Input
            placeholder="Role"
            value={form.role}
            onChange={(event) =>
              setForm((state) => ({ ...state, role: event.target.value }))
            }
          />
          <Input
            placeholder="Company"
            value={form.company}
            onChange={(event) =>
              setForm((state) => ({ ...state, company: event.target.value }))
            }
          />
          <Input
            placeholder="Avatar URL"
            value={form.avatarUrl}
            onChange={(event) =>
              setForm((state) => ({ ...state, avatarUrl: event.target.value }))
            }
          />
          <Textarea
            className="md:col-span-2"
            placeholder="Quote"
            value={form.quote}
            onChange={(event) =>
              setForm((state) => ({ ...state, quote: event.target.value }))
            }
          />
          <Button type="button" onClick={createItem} className="md:w-fit">
            Add testimonial
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {testimonials.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-3 p-6">
              <p className="font-semibold text-[#1F1F1F]">{item.name}</p>
              <p className="text-sm text-[#666666]">
                {item.role}
                {item.company ? `, ${item.company}` : ""}
              </p>
              <p className="text-sm leading-7 text-[#666666]">{item.quote}</p>
              <DeleteResourceButton endpoint={`/api/testimonials/${item.id}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
