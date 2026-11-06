import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { Invoice } from "../types";

GlobalWorkerOptions.workerSrc = workerUrl;

type TextItem = { str: string; transform: number[] };

export function parseInvoiceText(items: TextItem[], base: Invoice): Invoice {
  const texts = items.map((item) => item.str.trim()).filter(Boolean);
  const value = (label: string) => texts.find((text) => text.startsWith(label))?.slice(label.length).trim() ?? "";
  if (!texts.includes("INVOICE") || !value("Invoice #: ") || !texts.includes("Bill To:") || !texts.includes("Description")) {
    throw new Error("This PDF does not match the supported invoice format.");
  }
  const billIndex = texts.indexOf("Bill To:");
  const descriptionIndex = items.findIndex((item) => item.str.trim() === "Description");
  const subtotalIndex = items.findIndex((item, i) => i > descriptionIndex && item.str.trim() === "Subtotal:");
  const rows = new Map<string, TextItem[]>();
  for (const item of items.slice(descriptionIndex + 1, subtotalIndex < 0 ? undefined : subtotalIndex)) {
    if (!item.str.trim() || ["Qty/Hrs", "Rate (CAD)", "Amount (CAD)"].includes(item.str.trim())) continue;
    const key = String(Math.round(item.transform[5]));
    rows.set(key, [...(rows.get(key) ?? []), item]);
  }
  const services = [...rows.values()].map((row) => {
    const columns = row.filter((item) => item.str.trim()).sort((a, b) => a.transform[4] - b.transform[4]);
    if (columns.length !== 4) return null;
    const quantity = Number(columns[1].str.replace(/,/g, ""));
    const rateText = columns[2].str.replace(/[^\d.-]/g, "");
    const rate = Number(rateText);
    if (!Number.isFinite(quantity) || quantity <= 0 || !rateText || !Number.isFinite(rate) || rate < 0) return null;
    return { id: crypto.randomUUID(), description: columns[0].str.trim(), quantity, rate };
  }).filter((row) => row !== null);
  const tax = (label: string) => Number(texts.find((text) => text.startsWith(`${label} (`))?.match(/\(([\d.]+)%\)/)?.[1] ?? 0);
  const clientName = texts[billIndex + 1] ?? "";
  const nameItem = items.find((item) => item.str.trim() === "INVOICE");
  const business = items.find((item) => item.str.trim() && item.transform[4] < (nameItem?.transform[4] ?? 400))?.str.trim() ?? "";
  return {
    ...base,
    business: { name: business, address: "", phone: value("Phone: "), email: "", gstHstNumber: value("GST/HST: ") },
    client: { name: clientName, company: "", address: "", email: "" },
    invoiceNumber: value("Invoice #: "), invoiceDate: value("Date: "), dueDate: value("Due Date: ") === "N/A" ? "" : value("Due Date: "),
    poNumber: value("PO #: "), paymentTerms: value("Terms: "), services: services.length ? services : base.services,
    gstHstPercentage: tax("GST/HST"), pstPercentage: tax("PST"), qstPercentage: tax("QST"),
    paymentInfo: { method: value("Method: "), bankName: value("Bank: "), accountHolder: value("Account Holder: "), institutionNumber: "", transitNumber: "", accountNumber: value("Account #: "), interacEmail: value("Interac e-Transfer: ") },
    showBankingDetails: Boolean(value("Bank: ") || value("Account Holder: ") || value("Account #: ") || value("Institution #: ")),
  };
}

export async function importInvoicePdf(file: File, base: Invoice): Promise<Invoice> {
  const loadingTask = getDocument({ data: await file.arrayBuffer() });
  const document = await loadingTask.promise;
  try {
    const items: TextItem[] = [];
    for (let page = 1; page <= document.numPages; page++) {
      const content = await (await document.getPage(page)).getTextContent();
      items.push(...content.items.filter((item): item is typeof item & TextItem => "str" in item && "transform" in item));
    }
    return parseInvoiceText(items, base);
  } finally {
    await loadingTask.destroy();
  }
}
