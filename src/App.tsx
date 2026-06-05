import { useState, useEffect, useMemo, useRef, type ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import { PdfPreview } from "./components/PdfPreview";
import { DraftsMenu } from "./components/DraftsMenu";
import { generateInvoicePdf } from "./utils/generatePdf";
import {
  loadCurrentDraft,
  saveCurrentDraft,
  deleteDraft as deleteDraftFromStorage,
  getCurrentDraftId,
  migrateLegacyDraft,
  loadPaymentDefaults,
  loadBusinessDefaults,
  getNextInvoiceNumber,
  incrementInvoiceNumber,
} from "./utils/storage";
import type { Invoice, FormErrors } from "./types";

const invoiceSchema = z.object({
  business: z.object({
    name: z.string().min(1, "Business name is required"),
    address: z.string(),
    phone: z.string(),
    email: z.string().email("Invalid business email").or(z.literal("")),
    gstHstNumber: z.string(),
  }),
  client: z.object({
    name: z.string().min(1, "Client name is required"),
    company: z.string(),
    address: z.string(),
    email: z.string().email("Invalid client email").or(z.literal("")),
  }),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string(),
  poNumber: z.string(),
  serviceStartDate: z.string(),
  serviceEndDate: z.string(),
  paymentTerms: z.string(),
  currency: z.literal("CAD"),
  services: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().min(1, "Each service needs a description"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        rate: z.number().min(0, "Rate must be 0 or greater"),
      })
    )
    .min(1, "At least one service row is required"),
  gstHstPercentage: z.number().min(0).max(100),
  pstPercentage: z.number().min(0).max(100),
  qstPercentage: z.number().min(0).max(100),
  accentColor: z.string().default("#2d6a4f"),
  logo: z.string().default(""),
  logoPosition: z.enum(["left", "center"]).default("left"),
  logoSize: z.number().min(10).max(50).default(14),
  paymentInfo: z.object({
    method: z.string(),
    bankName: z.string(),
    accountHolder: z.string(),
    institutionNumber: z.string(),
    transitNumber: z.string(),
    accountNumber: z.string(),
    interacEmail: z.string(),
  }),
  showBankingDetails: z.boolean().default(false),
  notes: z.string(),
});

function freshInvoice(): Invoice {
  const paymentDefaults = loadPaymentDefaults();
  const businessDefaults = loadBusinessDefaults();
  return {
    business: businessDefaults ?? { name: "", address: "", phone: "", email: "", gstHstNumber: "" },
    client: { name: "", company: "", address: "", email: "" },
    invoiceNumber: getNextInvoiceNumber(),
    invoiceDate: "",
    dueDate: "",
    poNumber: "",
    serviceStartDate: "",
    serviceEndDate: "",
    paymentTerms: "",
    currency: "CAD",
    services: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }],
    gstHstPercentage: 0,
    pstPercentage: 0,
    qstPercentage: 0,
    accentColor: "#2d6a4f",
    logo: "",
    logoPosition: "left",
    logoSize: 14,
    paymentInfo: paymentDefaults ?? {
      method: "", bankName: "", accountHolder: "",
      institutionNumber: "", transitNumber: "", accountNumber: "", interacEmail: "",
    },
    showBankingDetails: false,
    notes: "",
  };
}

function patchDraft(data: Record<string, unknown>): Invoice {
  const defaults = freshInvoice();
  return { ...defaults, ...data } as Invoice;
}

function getInitialValues(): Invoice {
  const current = loadCurrentDraft();
  if (current) return patchDraft(current.data as unknown as Record<string, unknown>);

  const legacy = migrateLegacyDraft();
  if (legacy) return patchDraft(legacy as unknown as Record<string, unknown>);

  return freshInvoice();
}

function flattenZodErrors(zodError: z.ZodError): FormErrors {
  const errors: FormErrors = {};
  for (const issue of zodError.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

export default function App(): ReactElement {
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(true);
  const [previewMode, setPreviewMode] = useState<"html" | "pdf">("html");
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(getCurrentDraftId());
  const [currentDraftName, setCurrentDraftName] = useState<string | null>(() => {
    const current = loadCurrentDraft();
    return current?.name ?? null;
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const skipSave = useRef(false);

  const defaultValues = useMemo(() => getInitialValues(), []);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setErrors({});
      const result = invoiceSchema.safeParse(value);

      if (!result.success) {
        setErrors(flattenZodErrors(result.error));
        return;
      }

      generateInvoicePdf(result.data);
      if (result.data.invoiceNumber === getNextInvoiceNumber()) {
        incrementInvoiceNumber();
      }
    },
  });

  const values = form.state.values;

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (currentDraftId) {
        saveCurrentDraft(currentDraftId, values);
      }
      setSaved(true);
    }, 500);

    return () => {
      clearTimeout(saveTimer.current);
    };
  }, [values, currentDraftId]);

  const handleLoadDraft = (data: Invoice, name: string, id: string) => {
    setErrors({});
    skipSave.current = true;
    setCurrentDraftId(id);
    setCurrentDraftName(name);
    setSaved(true);
    form.reset(patchDraft(data as unknown as Record<string, unknown>));
  };

  const handleDraftsChanged = () => {
    setCurrentDraftId(getCurrentDraftId());
    const current = loadCurrentDraft();
    setCurrentDraftName(current?.name ?? null);
  };

  const handleNewInvoice = () => {
    setErrors({});
    skipSave.current = true;
    setCurrentDraftId(null);
    setCurrentDraftName(null);
    setSaved(true);
    form.reset(freshInvoice());
  };

  const handleReset = () => {
    setErrors({});
    if (currentDraftId) {
      deleteDraftFromStorage(currentDraftId);
    }
    setCurrentDraftId(null);
    setCurrentDraftName(null);
    setSaved(true);
    skipSave.current = true;
    form.reset(freshInvoice());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Canadian Invoice Generator
            </h1>
            <p className="text-xs text-gray-500">
              Create and download professional invoices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs transition-colors ${saved ? "text-gray-400" : "text-amber-500"}`}
            >
              {saved ? "✓ Saved" : "Saving…"}
            </span>
            <DraftsMenu
              currentDraftName={currentDraftName}
              currentValues={values}
              onLoadDraft={handleLoadDraft}
              onDraftsChanged={handleDraftsChanged}
              onNewInvoice={handleNewInvoice}
            />
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={() => form.handleSubmit()}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-2">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
              {Object.entries(errors).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form Column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <InvoiceForm form={form} errors={errors} />
          </div>

          {/* Preview Column */}
          <div className="xl:sticky xl:top-24 h-fit">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Live Preview
                </h2>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode("html")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    previewMode === "html"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("pdf")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    previewMode === "pdf"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  PDF
                </button>
              </div>
            </div>
            <form.Subscribe selector={(state) => state.values}>
              {(values) =>
                previewMode === "html" ? (
                  <InvoicePreview data={values} />
                ) : (
                  <PdfPreview data={values} />
                )
              }
            </form.Subscribe>
          </div>
        </div>
      </main>
    </div>
  );
}
