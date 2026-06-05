import { describe, it, expect } from 'vitest';
import {
  calculateAmount,
  calculateSubtotal,
  calculateGstHst,
  calculatePst,
  calculateQst,
  calculateTotal,
  formatCurrency,
} from '../utils/calculations';
import type { ServiceItem } from '../types';

describe('calculateAmount', () => {
  it('multiplies quantity by rate', () => {
    expect(calculateAmount(2, 50)).toBe(100);
    expect(calculateAmount(0, 100)).toBe(0);
    expect(calculateAmount(1.5, 100)).toBe(150);
  });
});

describe('calculateSubtotal', () => {
  it('sums all service item amounts', () => {
    const services: ServiceItem[] = [
      { id: '1', description: 'Consulting', quantity: 2, rate: 100 },
      { id: '2', description: 'Development', quantity: 5, rate: 150 },
    ];
    expect(calculateSubtotal(services)).toBe(950); // 200 + 750
  });

  it('returns 0 for empty array', () => {
    expect(calculateSubtotal([])).toBe(0);
  });
});

describe('calculateGstHst', () => {
  it('calculates correct percentage', () => {
    expect(calculateGstHst(100, 5)).toBe(5);
    expect(calculateGstHst(200, 13)).toBe(26);
  });
});

describe('calculatePst', () => {
  it('calculates correct percentage', () => {
    expect(calculatePst(100, 7)).toBeCloseTo(7);
    expect(calculatePst(500, 6)).toBeCloseTo(30);
  });
});

describe('calculateQst', () => {
  it('calculates correct percentage', () => {
    expect(calculateQst(100, 9.975)).toBeCloseTo(9.975);
  });
});

describe('calculateTotal', () => {
  it('sums all components', () => {
    expect(calculateTotal(100, 13, 7, 9.975)).toBeCloseTo(129.975);
  });

  it('works with default tax values', () => {
    expect(calculateTotal(100, 13)).toBe(113);
  });
});

describe('formatCurrency', () => {
  it('formats CAD currency correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('uses CAD as default currency', () => {
    expect(formatCurrency(50)).toContain('$');
  });
});