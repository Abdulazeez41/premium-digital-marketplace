export type CartItemInput = {
  productId: string;
  title: string;
  slug: string;
  coverImage: string;
  priceCents: number;
  type: "EBOOK" | "AUDIOBOOK" | "WORKBOOK" | "COURSE";
  quantity: number;
};

export type BillingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
};

export type CheckoutPayload = {
  items: CartItemInput[];
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: BillingAddress;
  couponCode?: string;
};
