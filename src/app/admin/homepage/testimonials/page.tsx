import { TestimonialManager } from "@/components/forms/testimonial-manager";
import { db } from "@/lib/db";

export default async function AdminHomepageTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Manage testimonials
      </h1>
      <TestimonialManager testimonials={testimonials} />
    </div>
  );
}
