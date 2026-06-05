export interface Business {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstHstNumber: string;
}

export interface Client {
  name: string;
  company: string;
  address: string;
  email: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface PaymentInfo {
  method: string;
  bankName: string;
  accountHolder: string;
  institutionNumber: string;
  transitNumber: string;
  accountNumber: string;
  interacEmail: string;
}

export interface Invoice {
  business: Business;
  client: Client;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  serviceStartDate: string;
  serviceEndDate: string;
  paymentTerms: string;
  currency: "CAD";
  services: ServiceItem[];
  gstHstPercentage: number;
  pstPercentage: number;
  qstPercentage: number;
  accentColor: string;
  logo: string;
  logoPosition: "left" | "center";
  logoSize: number;
  paymentInfo: PaymentInfo;
  showBankingDetails: boolean;
  notes: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface DraftSummary {
  id: string;
  name: string;
  invoiceNumber: string;
  clientName: string;
  updatedAt: string;
}
