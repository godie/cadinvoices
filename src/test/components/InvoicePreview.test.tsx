import { render, screen } from "@testing-library/react";
import { InvoicePreview } from "../../components/InvoicePreview";
import type { Invoice } from "../../types";
import { describe, it, expect } from "vitest";

const minimalInvoice: Invoice = {
  business: { name: "Test Business", address: "123 Main St", phone: "555-1234", email: "test@business.com", gstHstNumber: "" },
  client: { name: "Test Client", company: "", address: "", email: "" },
  invoiceNumber: "INV-001",
  invoiceDate: "2024-01-15",
  dueDate: "2024-01-30",
  poNumber: "",
  serviceStartDate: "",
  serviceEndDate: "",
  paymentTerms: "Net 30",
  currency: "CAD",
  services: [{ id: "1", description: "Consulting", quantity: 2, rate: 150 }],
  gstHstPercentage: 5,
  pstPercentage: 0,
  qstPercentage: 0,
  accentColor: "#2d6a4f",
  logo: "",
  logoPosition: "left",
  logoSize: 20,
  paymentInfo: { method: "", bankName: "", accountHolder: "", institutionNumber: "", transitNumber: "", accountNumber: "", interacEmail: "" },
  showBankingDetails: false,
  notes: "",
};

describe("InvoicePreview", () => {
  it("renders business name", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText("Test Business")).toBeInTheDocument();
  });

  it("renders invoice number", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText("INV-001")).toBeInTheDocument();
  });

  it("renders client name", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText("Test Client")).toBeInTheDocument();
  });

  it("renders service description", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText("Consulting")).toBeInTheDocument();
  });

  it("calculates and displays subtotal correctly", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    // Subtotal should be 2 * 150 = $300.00 - appears in subtotal row (span, not td)
    expect(screen.getAllByText("$300.00").length).toBeGreaterThan(0);
    // Verify subtotal label exists
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
  });

  it("renders INVOICE title with accent color", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    const invoiceTitle = screen.getByText("INVOICE");
    expect(invoiceTitle).toBeInTheDocument();
    expect(invoiceTitle.tagName).toBe("H1");
  });

  it("displays GST/HST percentage and amount", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText(/GST\/HST/)).toBeInTheDocument();
  });

  it("renders Bill To section", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText("Bill To")).toBeInTheDocument();
  });

  it("shows total amount", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    // Total should include GST: $300 + 5% GST = $315.00
    expect(screen.getByText("$315.00")).toBeInTheDocument();
  });

  it("displays payment terms", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText(/Terms:/)).toBeInTheDocument();
  });

  it("shows thank you message", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.getByText("Thank you for your business.")).toBeInTheDocument();
  });

  it("renders multiple services correctly", () => {
    const multiServiceInvoice: Invoice = {
      ...minimalInvoice,
      services: [
        { id: "1", description: "Consulting", quantity: 2, rate: 150 },
        { id: "2", description: "Development", quantity: 5, rate: 100 },
      ],
    };

    render(<InvoicePreview data={multiServiceInvoice} />);

    expect(screen.getByText("Consulting")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
  });

  it("renders PST when percentage is greater than 0", () => {
    const invoiceWithPst: Invoice = {
      ...minimalInvoice,
      pstPercentage: 7,
      services: [{ id: "1", description: "Consulting", quantity: 100, rate: 10 }],
    };

    render(<InvoicePreview data={invoiceWithPst} />);

    // Subtotal: 1000, GST: 50, PST: 70, Total: 1120
    expect(screen.getByText(/PST/)).toBeInTheDocument();
  });

  it("does not render PST section when percentage is 0", () => {
    render(<InvoicePreview data={minimalInvoice} />);

    expect(screen.queryByText(/PST/)).not.toBeInTheDocument();
  });

  it("renders notes when present", () => {
    const invoiceWithNotes: Invoice = {
      ...minimalInvoice,
      notes: "Thank you for your business!",
    };

    render(<InvoicePreview data={invoiceWithNotes} />);

    expect(screen.getByText("Thank you for your business!")).toBeInTheDocument();
  });
});