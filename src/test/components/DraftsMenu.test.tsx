import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftsMenu } from "../../components/DraftsMenu";
import type { Invoice } from "../../types";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockInvoice: Invoice = {
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

const mockOnLoadDraft = vi.fn();
const mockOnDraftsChanged = vi.fn();
const mockOnNewInvoice = vi.fn();

describe("DraftsMenu", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders Drafts button", () => {
    render(
      <DraftsMenu
        currentDraftName={null}
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    expect(screen.getByText("Drafts")).toBeInTheDocument();
  });

  it("shows current draft name when provided", () => {
    render(
      <DraftsMenu
        currentDraftName="My Invoice Draft"
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    expect(screen.getByText(/My Invoice Draft/)).toBeInTheDocument();
  });

  it("opens dropdown menu when button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DraftsMenu
        currentDraftName={null}
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    await user.click(screen.getByText("Drafts"));

    await waitFor(() => {
      expect(screen.getByText("Saved Drafts")).toBeInTheDocument();
    });
  });

  it("shows empty state when no drafts exist", async () => {
    const user = userEvent.setup();

    render(
      <DraftsMenu
        currentDraftName={null}
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    await user.click(screen.getByText("Drafts"));

    await waitFor(() => {
      expect(screen.getByText("No saved drafts yet")).toBeInTheDocument();
    });
  });

  it("shows New Invoice button in dropdown", async () => {
    const user = userEvent.setup();

    render(
      <DraftsMenu
        currentDraftName={null}
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    await user.click(screen.getByText("Drafts"));

    await waitFor(() => {
      expect(screen.getByText("+ New Invoice")).toBeInTheDocument();
    });
  });

  it("shows Save as New Draft option when opened", async () => {
    const user = userEvent.setup();

    render(
      <DraftsMenu
        currentDraftName={null}
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    await user.click(screen.getByText("Drafts"));

    await waitFor(() => {
      expect(screen.getByText("Save current as new draft")).toBeInTheDocument();
    });
  });

  it("calls onNewInvoice when New Invoice is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DraftsMenu
        currentDraftName={null}
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    await user.click(screen.getByText("Drafts"));

    await waitFor(() => {
      expect(screen.getByText("+ New Invoice")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ New Invoice"));

    expect(mockOnNewInvoice).toHaveBeenCalled();
  });

  it("closes menu when clicking outside", async () => {
    const user = userEvent.setup();

    render(
      <DraftsMenu
        currentDraftName={null}
        currentValues={mockInvoice}
        onLoadDraft={mockOnLoadDraft}
        onDraftsChanged={mockOnDraftsChanged}
        onNewInvoice={mockOnNewInvoice}
      />
    );

    await user.click(screen.getByText("Drafts"));

    await waitFor(() => {
      expect(screen.getByText("Saved Drafts")).toBeInTheDocument();
    });

    // Click outside the menu
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText("Saved Drafts")).not.toBeInTheDocument();
    });
  });
});