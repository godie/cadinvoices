import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatCurrency,
  calculateSubtotal,
  calculateGstHst,
  calculatePst,
  calculateQst,
  calculateTotal,
} from "./calculations";
import type { Invoice } from "../types";

export function buildInvoicePdf(invoice: Invoice): jsPDF {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = 215.9;
  const margin = 20;
  let y = margin;

  const darkColor = "#1a1a2e";
  const accentColor = invoice.accentColor || "#2d6a4f";

  // Business info (top left)
  const logoDim = invoice.logoSize;
  let bizX = margin;
  const nameY = y;

  if (invoice.logo) {
    try {
      const lower = invoice.logo.toLowerCase();
      const format = lower.includes("image/png") ? "PNG"
        : lower.includes("image/jpeg") || lower.includes("image/jpg") ? "JPEG"
        : "PNG";

      if (invoice.logoPosition === "center") {
        const logoX = (pageWidth - logoDim) / 2;
        doc.addImage(invoice.logo, format, logoX, y, logoDim, 0);
      } else {
        doc.addImage(invoice.logo, format, margin, y, logoDim, 0);
        bizX = margin + logoDim + 4;
      }
      y = margin + logoDim;
    } catch {
      // Invalid logo data — skip
    }
  }

  doc.setFontSize(18);
  doc.setTextColor(darkColor);
  doc.text(invoice.business.name, bizX, nameY + (invoice.logo ? 6 : 0));

  doc.setFontSize(9);
  doc.setTextColor("#555");
  if (!invoice.logo) y += 5;
  if (invoice.business.address) {
    doc.text(invoice.business.address, margin, y);
    y += 4;
  }
  if (invoice.business.phone) {
    doc.text(`Phone: ${invoice.business.phone}`, margin, y);
    y += 4;
  }
  if (invoice.business.email) {
    doc.text(`Email: ${invoice.business.email}`, margin, y);
    y += 4;
  }
  if (invoice.business.gstHstNumber) {
    doc.setTextColor(accentColor);
    doc.setFontSize(8);
    doc.text(`GST/HST: ${invoice.business.gstHstNumber}`, margin, y);
    y += 4;
  }

  // INVOICE title (top right)
  doc.setFontSize(28);
  doc.setTextColor(accentColor);
  const titleWidth = doc.getTextWidth("INVOICE");
  doc.text("INVOICE", pageWidth - margin - titleWidth, margin + 8);

  // Invoice details (right)
  doc.setFontSize(9);
  doc.setTextColor("#333");
  let detailY = margin + 20;
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin - 60, detailY);
  detailY += 5;
  if (invoice.poNumber) {
    doc.text(`PO #: ${invoice.poNumber}`, pageWidth - margin - 60, detailY);
    detailY += 5;
  }
  doc.text(`Date: ${invoice.invoiceDate}`, pageWidth - margin - 60, detailY);
  detailY += 5;
  if (invoice.paymentTerms) {
    doc.text(`Terms: ${invoice.paymentTerms}`, pageWidth - margin - 60, detailY);
    detailY += 5;
  }
  doc.text(`Due Date: ${invoice.dueDate || "N/A"}`, pageWidth - margin - 60, detailY);
  detailY += 5;
  if (invoice.serviceStartDate || invoice.serviceEndDate) {
    doc.text(`Period: ${invoice.serviceStartDate || "—"} – ${invoice.serviceEndDate || "—"}`, pageWidth - margin - 60, detailY);
    detailY += 5;
  }
  doc.text(`Currency: ${invoice.currency}`, pageWidth - margin - 60, detailY);

  // Divider line
  y = Math.max(y, detailY) + 8;
  doc.setDrawColor("#ccc");
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Bill To
  doc.setFontSize(11);
  doc.setTextColor(darkColor);
  doc.text("Bill To:", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor("#333");
  doc.text(invoice.client.name, margin, y);
  y += 4;
  if (invoice.client.company) {
    doc.text(invoice.client.company, margin, y);
    y += 4;
  }
  if (invoice.client.address) {
    doc.text(invoice.client.address, margin, y);
    y += 4;
  }
  if (invoice.client.email) {
    doc.text(`Email: ${invoice.client.email}`, margin, y);
    y += 4;
  }

  y += 6;

  // Services table
  const tableHead = [["Description", "Qty/Hrs", "Rate (CAD)", "Amount (CAD)"]];
  const tableBody = invoice.services.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.rate),
    formatCurrency(item.quantity * item.rate),
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 51, 51],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    theme: "plain",
    styles: {
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Totals section (aligned right)
  const totalsX = pageWidth - margin - 4;
  const labelX = totalsX - 40;

  const subtotal = calculateSubtotal(invoice.services);
  const gstHst = calculateGstHst(subtotal, invoice.gstHstPercentage);
  const pst = calculatePst(subtotal, invoice.pstPercentage);
  const qst = calculateQst(subtotal, invoice.qstPercentage);
  const total = calculateTotal(subtotal, gstHst, pst, qst);

  const totalsLineHeight = 8;

  doc.setFontSize(10);
  doc.setTextColor("#555");
  doc.text("Subtotal:", labelX, y);
  doc.text(formatCurrency(subtotal), totalsX, y, { align: "right" });

  y += totalsLineHeight;

  if (invoice.gstHstPercentage > 0) {
    doc.setDrawColor("#e0e0e0");
    doc.setLineWidth(0.2);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
    doc.text(`GST/HST (${invoice.gstHstPercentage}%):`, labelX, y);
    doc.text(formatCurrency(gstHst), totalsX, y, { align: "right" });
    y += totalsLineHeight;
  }

  if (invoice.pstPercentage > 0) {
    doc.setDrawColor("#e0e0e0");
    doc.setLineWidth(0.2);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
    doc.text(`PST (${invoice.pstPercentage}%):`, labelX, y);
    doc.text(formatCurrency(pst), totalsX, y, { align: "right" });
    y += totalsLineHeight;
  }

  if (invoice.qstPercentage > 0) {
    doc.setDrawColor("#e0e0e0");
    doc.setLineWidth(0.2);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
    doc.text(`QST (${invoice.qstPercentage}%):`, labelX, y);
    doc.text(formatCurrency(qst), totalsX, y, { align: "right" });
    y += totalsLineHeight;
  }

  doc.setDrawColor("#e0e0e0");
  doc.setLineWidth(0.2);
  doc.line(margin, y - 4, pageWidth - margin, y - 4);

  doc.setFontSize(12);
  doc.setTextColor(darkColor);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", labelX, y);
  doc.text(formatCurrency(total), totalsX, y, { align: "right" });
  doc.setFont("helvetica", "normal");

  y += 12;

  // Payment info
  const pi = invoice.paymentInfo;
  const hasPaymentInfo =
    pi.method || pi.interacEmail ||
    (invoice.showBankingDetails && (pi.bankName || pi.accountHolder || pi.institutionNumber || pi.transitNumber || pi.accountNumber));

  if (hasPaymentInfo) {
    doc.setFontSize(11);
    doc.setTextColor(darkColor);
    doc.text("Payment Information", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor("#555");
    if (pi.method) {
      doc.text(`Method: ${pi.method}`, margin, y);
      y += 4;
    }
    if (pi.interacEmail) {
      doc.text(`Interac e-Transfer: ${pi.interacEmail}`, margin, y);
      y += 4;
    }
    if (invoice.showBankingDetails) {
      if (pi.bankName) {
        doc.text(`Bank: ${pi.bankName}`, margin, y);
        y += 4;
      }
      if (pi.accountHolder) {
        doc.text(`Account Holder: ${pi.accountHolder}`, margin, y);
        y += 4;
      }
      if (pi.institutionNumber || pi.transitNumber) {
        doc.text(
          `Institution #: ${pi.institutionNumber}  |  Transit #: ${pi.transitNumber}`,
          margin,
          y
        );
        y += 4;
      }
      if (pi.accountNumber) {
        doc.text(`Account #: ${pi.accountNumber}`, margin, y);
        y += 4;
      }
    }

    y += 4;
  }

  // Notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setTextColor("#555");
    doc.text("Notes:", margin, y);
    y += 5;
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4 + 6;
  }

  // Thank you
  doc.setFontSize(11);
  doc.setTextColor(accentColor);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your business.", margin, y);
  doc.setFont("helvetica", "normal");

  // Footer: business name (left) + page numbers (right) on every page
  const internal = doc as unknown as { internal: { pages: Record<number, unknown>; pageSize: { height: number } } };
  const pageCount = Object.keys(internal.internal.pages).length;
  const footerY = internal.internal.pageSize.height - 14;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor("#e0e0e0");
    doc.setLineWidth(0.15);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(7);
    doc.setTextColor("#999");
    doc.text(invoice.business.name, margin, footerY);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, { align: "right" });
  }

  return doc;
}

export function generateInvoicePdf(invoice: Invoice): void {
  const doc = buildInvoicePdf(invoice);
  const safeNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
  doc.save(`Invoice_${safeNumber}.pdf`);
}
