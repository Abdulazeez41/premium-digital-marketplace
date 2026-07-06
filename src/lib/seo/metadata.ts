import type { Metadata } from "next";

import { APP_NAME, APP_URL } from "@/lib/constants";

export function createMetadata(input: {
  title: string;
  description: string;
  path?: string;
  images?: string[];
}): Metadata {
  const url = `${APP_URL}${input.path || ""}`;

  return {
    title: `${input.title} | ${APP_NAME}`,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: APP_NAME,
      type: "website",
      images: input.images?.map((image) => ({ url: image })) || [],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.images,
    },
  };
}
