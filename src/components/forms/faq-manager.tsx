"use client";

import { Faq } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteResourceButton } from "@/components/forms/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  question: "",
  answer: "",
  category: "",
  sortOrder: 0,
  published: true,
};

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);

  async function createItem() {
    const response = await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok)
      return toast.error(result.message || "Unable to create FAQ.");
    toast.success("FAQ created.");
    setForm(emptyForm);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 p-6">
          <Input
            placeholder="Question"
            value={form.question}
            onChange={(event) =>
              setForm((state) => ({ ...state, question: event.target.value }))
            }
          />
          <Textarea
            placeholder="Answer"
            value={form.answer}
            onChange={(event) =>
              setForm((state) => ({ ...state, answer: event.target.value }))
            }
          />
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(event) =>
              setForm((state) => ({ ...state, category: event.target.value }))
            }
          />
          <Button type="button" onClick={createItem} className="w-fit">
            Add FAQ
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {faqs.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-3 p-6">
              <p className="font-semibold text-[#1F1F1F]">{item.question}</p>
              <p className="text-sm leading-7 text-[#666666]">{item.answer}</p>
              <DeleteResourceButton endpoint={`/api/faqs/${item.id}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
