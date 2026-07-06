import { FaqManager } from "@/components/forms/faq-manager";
import { db } from "@/lib/db";

export default async function AdminHomepageFaqPage() {
  const faqs = await db.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Manage FAQs</h1>
      <FaqManager faqs={faqs} />
    </div>
  );
}
