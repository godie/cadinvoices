import type { ServiceItem } from "../types";

export function calculateAmount(quantity: number, rate: number): number {
  return quantity * rate;
}

export function calculateSubtotal(services: ServiceItem[]): number {
  return services.reduce((sum, item) => sum + calculateAmount(item.quantity, item.rate), 0);
}

export function calculateGstHst(subtotal: number, percentage: number): number {
  return subtotal * (percentage / 100);
}

export function calculatePst(subtotal: number, percentage: number): number {
  return subtotal * (percentage / 100);
}

export function calculateQst(subtotal: number, percentage: number): number {
  return subtotal * (percentage / 100);
}

export function calculateTotal(
  subtotal: number,
  gstHst: number,
  pst = 0,
  qst = 0
): number {
  return subtotal + gstHst + pst + qst;
}

export function formatCurrency(amount: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
