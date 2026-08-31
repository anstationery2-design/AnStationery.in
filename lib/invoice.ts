import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { SITE } from "@/lib/constants";

export type InvoiceOrder = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: {
    productNameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    subtotal: number;
  }[];
};

const MUTED = rgb(0.42, 0.42, 0.42);
const INK = rgb(0.12, 0.12, 0.12);
const YELLOW = rgb(0.95, 0.8, 0.1);
const LINE = rgb(0.88, 0.88, 0.88);
const WHITE = rgb(1, 1, 1);

export async function generateInvoicePdf(order: InvoiceOrder): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Invoice ${order.orderNumber}`);
  doc.setProducer(`${SITE.name} Store`);
  doc.setCreator(SITE.name);

  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 48;
  const right = width - margin;

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const invoiceNo = order.orderNumber;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ---------- Header band ----------
  page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: YELLOW });
  page.drawText(SITE.name.toUpperCase(), { x: margin, y: height - 52, size: 24, font: bold, color: INK });
  page.drawText(SITE.tagline, { x: margin, y: height - 72, size: 10, font, color: INK });

  // ---------- INVOICE meta ----------
  page.drawText("INVOICE", { x: right, y: height - 52, size: 22, font: bold, color: INK });
  textRight(page, `No: ${invoiceNo}`, right, height - 72, 10, font, MUTED);
  textRight(page, `Date: ${date}`, right, height - 86, 10, font, MUTED);

  // ---------- Status strip ----------
  page.drawRectangle({
    x: margin,
    y: height - 206,
    width: 220,
    height: 24,
    color: rgb(0.96, 0.96, 0.96),
  });
  page.drawText(`Status: ${order.status}`, { x: margin + 8, y: height - 196, size: 9, font: bold, color: INK });

  // ---------- Billed to ----------
  let y = height - 260;
  page.drawText("BILLED TO", { x: margin, y, size: 9, font: bold, color: MUTED });
  y -= 16;
  page.drawText(order.customerName, { x: margin, y, size: 12, font: bold, color: INK });
  y -= 16;
  page.drawText(order.address, { x: margin, y, size: 10, font, color: INK });
  y -= 13;
  page.drawText(`${order.city}, ${order.state} - ${order.pincode}`, { x: margin, y, size: 10, font, color: INK });
  y -= 13;
  page.drawText(`Phone: ${order.customerPhone}`, { x: margin, y, size: 10, font, color: INK });
  if (order.customerEmail) {
    y -= 13;
    page.drawText(`Email: ${order.customerEmail}`, { x: margin, y, size: 10, font, color: INK });
  }

  // ---------- Ship to ----------
  const shipX = width / 2 + 24;
  let ys = height - 260;
  page.drawText("SHIP TO", { x: shipX, y: ys, size: 9, font: bold, color: MUTED });
  ys -= 16;
  page.drawText(order.customerName, { x: shipX, y: ys, size: 11, font: bold, color: INK });
  ys -= 14;
  page.drawText(order.address, { x: shipX, y: ys, size: 9, font, color: INK });
  ys -= 12;
  page.drawText(`${order.city}, ${order.state} - ${order.pincode}`, { x: shipX, y: ys, size: 9, font, color: INK });

  // ---------- Items table ----------
  const tableTop = height - 420;
  const colItem = margin + 8;
  const colQty = width - 210;
  const colPrice = width - 130;
  const colTotal = width - 60;

  page.drawRectangle({ x: margin, y: tableTop - 24, width: right - margin, height: 28, color: rgb(0.05, 0.05, 0.05) });
  page.drawText("ITEM", { x: colItem, y: tableTop - 15, size: 9, font: bold, color: WHITE });
  textRight(page, "QTY", colQty, tableTop - 15, 9, bold, WHITE);
  textRight(page, "PRICE", colPrice, tableTop - 15, 9, bold, WHITE);
  textRight(page, "TOTAL", colTotal, tableTop - 15, 9, bold, WHITE);

  let rowY = tableTop - 50;
  for (const it of order.items) {
    const name =
      it.productNameSnapshot.length > 46
        ? `${it.productNameSnapshot.slice(0, 45)}…`
        : it.productNameSnapshot;
    page.drawText(name, { x: colItem, y: rowY, size: 10, font, color: INK });
    textRight(page, String(it.quantity), colQty, rowY, 10, font, INK);
    textRight(page, formatRupee(it.priceSnapshot), colPrice, rowY, 10, font, INK);
    textRight(page, formatRupee(it.subtotal), colTotal, rowY, 10, bold, INK);
    rowY -= 26;
  }

  // ---------- Totals ----------
  const totalRow = rowY - 6;
  page.drawLine({
    start: { x: margin, y: totalRow },
    end: { x: right, y: totalRow },
    thickness: 0.6,
    color: LINE,
  });
  page.drawText("Subtotal", { x: colQty, y: totalRow - 24, size: 10, font, color: MUTED });
  textRight(page, formatRupee(order.subtotal), colTotal, totalRow - 24, 10, font, INK);

  const shipLabel = order.shippingAmount === 0 ? "Shipping (FREE)" : "Shipping";
  page.drawText(shipLabel, { x: colQty, y: totalRow - 48, size: 10, font, color: MUTED });
  textRight(page, formatRupee(order.shippingAmount), colTotal, totalRow - 48, 10, font, INK);

  const grand = totalRow - 74;
  page.drawRectangle({ x: width - 240, y: grand - 26, width: 192, height: 34, color: YELLOW });
  page.drawText("Amount Paid", { x: width - 232, y: grand - 10, size: 10, font: bold, color: INK });
  textRight(page, formatRupee(order.totalAmount), right - 8, grand - 10, 12, bold, INK);

  // ---------- Footer ----------
  page.drawText("Thank you for shopping with us!", { x: margin, y: 64, size: 10, font: bold, color: INK });
  page.drawText(`${SITE.name} · ${SITE.email} · ${SITE.phone}`, { x: margin, y: 48, size: 9, font, color: MUTED });
  page.drawLine({ start: { x: margin, y: 44 }, end: { x: right, y: 44 }, thickness: 0.6, color: LINE });

  return doc.save();
}

function formatRupee(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
}

function textRight(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: rightX - w, y, size, font, color });
}
