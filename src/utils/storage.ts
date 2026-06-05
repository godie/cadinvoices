import type { Invoice, DraftSummary, PaymentInfo, Business } from "../types";

const DRAFTS_KEY = "cadinvoice_drafts";
const CURRENT_KEY = "cadinvoice_current_id";
const PAYMENT_DEFAULTS_KEY = "cadinvoice_payment_defaults";
const BUSINESS_DEFAULTS_KEY = "cadinvoice_business_defaults";

interface DraftEntry {
  id: string;
  name: string;
  data: Invoice;
  createdAt: string;
  updatedAt: string;
}

function loadAllEntries(): Record<string, DraftEntry> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DraftEntry>;
  } catch {
    return {};
  }
}

function saveAllEntries(entries: Record<string, DraftEntry>): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(entries));
  } catch {
    // Storage full — silently ignore
  }
}

export function getCurrentDraftId(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentDraftId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(CURRENT_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_KEY);
    }
  } catch {
    // Silently ignore
  }
}

export function getAllDrafts(): DraftSummary[] {
  const entries = loadAllEntries();
  return Object.values(entries)
    .map((e) => ({
      id: e.id,
      name: e.name,
      invoiceNumber: e.data.invoiceNumber,
      clientName: e.data.client.name,
      updatedAt: e.updatedAt,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getDraft(id: string): Invoice | null {
  const entries = loadAllEntries();
  return entries[id]?.data ?? null;
}

export function saveNamedDraft(name: string, data: Invoice): string {
  const entries = loadAllEntries();

  const existing = Object.values(entries).find((e) => e.name === name);
  const id = existing?.id ?? crypto.randomUUID();
  const now = new Date().toISOString();

  entries[id] = {
    id,
    name,
    data,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  saveAllEntries(entries);
  setCurrentDraftId(id);
  return id;
}

export function saveCurrentDraft(id: string, data: Invoice): void {
  const entries = loadAllEntries();
  if (!entries[id]) return;

  entries[id] = {
    ...entries[id],
    data,
    updatedAt: new Date().toISOString(),
  };

  saveAllEntries(entries);
}

export function deleteDraft(id: string): void {
  const entries = loadAllEntries();
  delete entries[id];
  saveAllEntries(entries);

  if (getCurrentDraftId() === id) {
    setCurrentDraftId(null);
  }
}

export function loadCurrentDraft(): { id: string; name: string; data: Invoice } | null {
  const currentId = getCurrentDraftId();
  if (!currentId) return null;

  const entries = loadAllEntries();
  const entry = entries[currentId];
  if (!entry) {
    setCurrentDraftId(null);
    return null;
  }

  return { id: entry.id, name: entry.name, data: entry.data };
}

// Payment info defaults: save/load reusable payment configuration
export function savePaymentDefaults(info: PaymentInfo): void {
  try {
    localStorage.setItem(PAYMENT_DEFAULTS_KEY, JSON.stringify(info));
  } catch {
    // Silently ignore
  }
}

export function loadPaymentDefaults(): PaymentInfo | null {
  try {
    const raw = localStorage.getItem(PAYMENT_DEFAULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PaymentInfo;
  } catch {
    return null;
  }
}

// Business info defaults: save/load reusable business profile
export function saveBusinessDefaults(info: Business): void {
  try {
    localStorage.setItem(BUSINESS_DEFAULTS_KEY, JSON.stringify(info));
  } catch {
    // Silently ignore
  }
}

export function loadBusinessDefaults(): Business | null {
  try {
    const raw = localStorage.getItem(BUSINESS_DEFAULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Business;
  } catch {
    return null;
  }
}

// Auto-incrementing invoice number counter
const COUNTER_KEY = "cadinvoice_counter";

export function getNextInvoiceNumber(): string {
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    const next = raw ? parseInt(raw, 10) : 1;
    return `INV-${String(next).padStart(3, "0")}`;
  } catch {
    return "INV-001";
  }
}

export function incrementInvoiceNumber(): void {
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    const next = raw ? parseInt(raw, 10) : 1;
    localStorage.setItem(COUNTER_KEY, String(next + 1));
  } catch {
    // Silently ignore
  }
}

// Legacy: load the old single-draft key and migrate it
export function migrateLegacyDraft(): Invoice | null {
  try {
    const raw = localStorage.getItem("cadinvoice_draft");
    if (!raw) return null;
    localStorage.removeItem("cadinvoice_draft");
    return JSON.parse(raw) as Invoice;
  } catch {
    return null;
  }
}
