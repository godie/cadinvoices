import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCurrentDraftId,
  setCurrentDraftId,
  getAllDrafts,
  getDraft,
  saveNamedDraft,
  deleteDraft,
  getNextInvoiceNumber,
  incrementInvoiceNumber,
} from '../utils/storage';
import type { Invoice } from '../types';

const mockInvoice: Invoice = {
  business: { name: 'Test Business', address: '123 Test St', phone: '555-0123', email: 'test@test.com', gstHstNumber: '123456789' },
  client: { name: 'Test Client', company: 'Test Co', address: '456 Test Ave', email: 'client@test.com' },
  invoiceNumber: 'INV-001',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  poNumber: 'PO-123',
  serviceStartDate: '2024-01-01',
  serviceEndDate: '2024-01-31',
  paymentTerms: 'Net 30',
  currency: 'CAD',
  services: [{ id: '1', description: 'Service', quantity: 1, rate: 100 }],
  gstHstPercentage: 13,
  pstPercentage: 0,
  qstPercentage: 0,
  accentColor: '#2d6a4f',
  logo: '',
  logoPosition: 'left',
  logoSize: 30,
  paymentInfo: { method: 'e-transfer', bankName: '', accountHolder: '', institutionNumber: '', transitNumber: '', accountNumber: '', interacEmail: 'test@test.com' },
  showBankingDetails: false,
  notes: 'Test note',
};

describe('getCurrentDraftId / setCurrentDraftId', () => {
  beforeEach(() => localStorage.clear());
  
  it('sets and retrieves current draft id', () => {
    setCurrentDraftId('test-id-123');
    expect(getCurrentDraftId()).toBe('test-id-123');
  });

  it('returns null when no id set', () => {
    expect(getCurrentDraftId()).toBeNull();
  });

  it('removes id when set to null', () => {
    setCurrentDraftId('test-id');
    setCurrentDraftId(null);
    expect(getCurrentDraftId()).toBeNull();
  });
});

describe('getAllDrafts', () => {
  beforeEach(() => localStorage.clear());
  
  it('returns empty array when no drafts exist', () => {
    expect(getAllDrafts()).toEqual([]);
  });
});

describe('saveNamedDraft', () => {
  beforeEach(() => localStorage.clear());
  
  it('creates a new draft and returns its id', () => {
    const id = saveNamedDraft('Test Draft', mockInvoice);
    expect(id).toBeTruthy();
    expect(getDraft(id)).toBeTruthy();
  });

  it('updates existing draft with same name', () => {
    const id1 = saveNamedDraft('My Draft', mockInvoice);
    const updatedInvoice = { ...mockInvoice, invoiceNumber: 'INV-002' };
    const id2 = saveNamedDraft('My Draft', updatedInvoice);
    expect(id1).toBe(id2);
  });
});

describe('getDraft', () => {
  beforeEach(() => localStorage.clear());
  
  it('returns null for non-existent draft', () => {
    expect(getDraft('non-existent')).toBeNull();
  });

  it('returns saved draft data', () => {
    const id = saveNamedDraft('Test', mockInvoice);
    const retrieved = getDraft(id);
    expect(retrieved?.invoiceNumber).toBe('INV-001');
  });
});

describe('deleteDraft', () => {
  beforeEach(() => localStorage.clear());
  
  it('removes draft from storage', () => {
    const id = saveNamedDraft('To Delete', mockInvoice);
    deleteDraft(id);
    expect(getDraft(id)).toBeNull();
  });
});

describe('getNextInvoiceNumber / incrementInvoiceNumber', () => {
  beforeEach(() => localStorage.clear());
  
  it('returns INV-001 on first call', () => {
    expect(getNextInvoiceNumber()).toBe('INV-001');
  });

  it('increments counter correctly', () => {
    getNextInvoiceNumber();
    incrementInvoiceNumber();
    expect(getNextInvoiceNumber()).toBe('INV-002');
  });
});