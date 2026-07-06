import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const blocks = [
  ["hero", "Hero content"],
  ["featured-products", "Featured products"],
  ["testimonials", "Testimonials"],
  ["faq", "FAQ"],
  ["footer", "Footer"],
  ["seo", "SEO metadata"],
];

export default function AdminHomepagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Homepage CMS</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {blocks.map(([slug, title]) => (
          <Link key={slug} href={`/admin/homepage/${slug}`}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-[#1F1F1F]">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-[#666666]">
                  Edit the content block used on the homepage.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
