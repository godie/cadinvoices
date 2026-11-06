import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { buildInvoicePdf } from "../utils/generatePdf";
import { describe, it, expect } from "vitest";
import { parseInvoiceText } from "../utils/importPdf";
import type { Invoice } from "../types";

const item = (str: string, x = 50, y = 700) => ({ str, transform: [1, 0, 0, 1, x, y] });
const base = { services: [{ id: "empty", description: "", quantity: 1, rate: 0 }] } as Invoice;

describe("PDF invoice import", () => {
  it("extracts identifiable fields and service rows", () => {
    const invoice = parseInvoiceText([
      item("Acme"), item("INVOICE", 400), item("Invoice #: INV-5"), item("Date: 2024-01-01"),
      item("Bill To:"), item("Client"), item("Description"), item("Qty/Hrs"), item("Rate (CAD)"), item("Amount (CAD)"),
      item("Consulting", 50, 500), item("2", 300, 500), item("$100.00", 400, 500), item("$200.00", 500, 500),
      item("Subtotal:"), item("GST/HST (13%):"),
    ], base);
    expect(invoice.invoiceNumber).toBe("INV-5");
    expect(invoice.client.name).toBe("Client");
    expect(invoice.services[0]).toMatchObject({ description: "Consulting", quantity: 2, rate: 100 });
    expect(invoice.gstHstPercentage).toBe(13);
  });
  it("rejects unrelated documents", () => {
    expect(() => parseInvoiceText([item("unrelated")], base)).toThrow();
  });
});

it("imports text from a generated PDF", async () => {
  const invoice: Invoice = {
    business: { name: "Acme", address: "123 Main", phone: "555", email: "a@example.com", gstHstNumber: "123" },
    client: { name: "Client", company: "Company", address: "Street", email: "c@example.com" },
    invoiceNumber: "INV-5", invoiceDate: "2024-01-01", dueDate: "2024-02-01", poNumber: "PO-1", serviceStartDate: "", serviceEndDate: "", paymentTerms: "Net 30", currency: "CAD",
    services: [{ id: "1", description: "Consulting", quantity: 2, rate: 100 }], gstHstPercentage: 13, pstPercentage: 0, qstPercentage: 0,
    accentColor: "#2d6a4f", logo: "", logoPosition: "left", logoSize: 14,
    paymentInfo: { method: "", bankName: "", accountHolder: "", institutionNumber: "", transitNumber: "", accountNumber: "", interacEmail: "" }, showBankingDetails: false, notes: "",
  };
  const data = new Uint8Array(buildInvoicePdf(invoice).output("arraybuffer"));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const contents = await (await pdf.getPage(1)).getTextContent();
  const items = contents.items.filter((i) => "str" in i);
  const result = parseInvoiceText(items, invoice);
  expect(result.invoiceNumber).toBe(invoice.invoiceNumber);
  expect(result.client.name).toBe(invoice.client.name);
  expect(result.services).toMatchObject([{ description: "Consulting", quantity: 2, rate: 100 }]);
  expect(result.gstHstPercentage).toBe(13);
  await pdf.cleanup();
});
