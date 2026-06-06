import { render, screen } from "@testing-library/react";
import { ServiceItemsTable } from "../../components/ServiceItemsTable";
import { describe, it, expect } from "vitest";

// Simplified mock that only renders what's necessary
const mockForm = {
  Field: ({ children }: { name: string; mode?: string; children: (field: any) => React.ReactNode }) => {
    const mockField = {
      state: {
        value: [
          { id: "1", description: "Consulting", quantity: 2, rate: 150 },
          { id: "2", description: "Development", quantity: 5, rate: 100 },
        ],
      },
      handleChange: () => {},
      handleBlur: () => {},
      removeValue: () => {},
      pushValue: () => {},
    };
    return children(mockField);
  },
};

describe("ServiceItemsTable", () => {
  it("renders table with all headers", () => {
    render(<ServiceItemsTable form={mockForm as any} />);

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Qty/Hrs")).toBeInTheDocument();
    expect(screen.getByText("Rate (CAD)")).toBeInTheDocument();
    expect(screen.getByText("Amount (CAD)")).toBeInTheDocument();
  });

  it("renders the Add line item button", () => {
    render(<ServiceItemsTable form={mockForm as any} />);

    const addButton = screen.getByText("Add line item");
    expect(addButton).toBeInTheDocument();
    expect(addButton.tagName).toBe("BUTTON");
  });

  it("renders table rows for each service item", () => {
    render(<ServiceItemsTable form={mockForm as any} />);

    // Table has one header row + 2 data rows
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(3);
  });

  it("renders quantity and rate inputs", () => {
    render(<ServiceItemsTable form={mockForm as any} />);

    const numberInputs = screen.getAllByRole("spinbutton");
    // 2 rows × 2 inputs (quantity + rate) = 4 number inputs
    expect(numberInputs.length).toBe(4);
  });

  it("renders description text inputs", () => {
    render(<ServiceItemsTable form={mockForm as any} />);

    const textInputs = screen.getAllByRole("textbox");
    // 2 description inputs
    expect(textInputs.length).toBe(2);
  });

  it("renders remove button for multiple rows", () => {
    render(<ServiceItemsTable form={mockForm as any} />);

    // Remove buttons should exist (visibility controlled by CSS opacity)
    const removeButtons = screen.getAllByTitle("Remove row");
    expect(removeButtons.length).toBe(2);
  });

  it("shows remove button only when multiple rows exist", () => {
    const singleRowForm = {
      Field: ({ children }: { name: string; children: (field: any) => React.ReactNode }) => {
        const mockField = {
          state: {
            value: [{ id: "1", description: "Only one", quantity: 1, rate: 100 }],
          },
          handleChange: () => {},
          handleBlur: () => {},
          removeValue: () => {},
          pushValue: () => {},
        };
        return children(mockField);
      },
    };

    render(<ServiceItemsTable form={singleRowForm as any} />);

    // With single row, remove button should not be in document
    expect(screen.queryByTitle("Remove row")).not.toBeInTheDocument();
  });

  it("displays Add line item with correct styling classes", () => {
    render(<ServiceItemsTable form={mockForm as any} />);

    const addButton = screen.getByText("Add line item");
    expect(addButton).toHaveClass("text-emerald-700");
  });
});