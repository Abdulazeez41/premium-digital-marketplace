import PDFDocument from "pdfkit";

import { formatPrice } from "@/lib/utils";

type InvoiceInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  items: { title: string; priceCents: number }[];
  paidAt?: Date | null;
};

export async function generateInvoiceBuffer(input: InvoiceInput) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const completed = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(24).text("Premium Digital Marketplace Invoice");
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${input.orderId}`);
  doc.text(`Customer: ${input.customerName}`);
  doc.text(`Email: ${input.customerEmail}`);
  doc.text(`Paid at: ${input.paidAt ? input.paidAt.toISOString() : "Pending"}`);
  doc.moveDown();
  doc.fontSize(14).text("Items");
  doc.moveDown(0.5);

  input.items.forEach((item) => {
    doc
      .fontSize(12)
      .text(`${item.title} - ${formatPrice(item.priceCents, input.currency)}`);
  });

  doc.moveDown();
  doc
    .fontSize(16)
    .text(`Total: ${formatPrice(input.amountCents, input.currency)}`);
  doc.end();

  return completed;
}
