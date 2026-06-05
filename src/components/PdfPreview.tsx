import { useState, useEffect, useRef, type ReactElement } from "react";
import { buildInvoicePdf } from "../utils/generatePdf";
import type { Invoice } from "../types";

interface PdfPreviewProps {
  data: Invoice;
}

export function PdfPreview({ data }: PdfPreviewProps): ReactElement {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevUrlRef = useRef<string>("");

  useEffect(() => {
    setLoading(true);
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        const doc = buildInvoicePdf(data);
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);

        if (prevUrlRef.current) {
          URL.revokeObjectURL(prevUrlRef.current);
        }
        prevUrlRef.current = url;
        setPdfUrl(url);
      } catch (err) {
        console.error("Failed to generate PDF preview:", err);
      }
      setLoading(false);
    }, 400);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [data]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  if (!pdfUrl) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 flex items-center justify-center max-w-[816px] mx-auto" style={{ minHeight: "800px" }}>
        <div className="text-center text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Generating PDF preview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-[816px] mx-auto">
      <div className="relative w-full aspect-[0.77]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title="Invoice PDF Preview"
        />
      </div>
    </div>
  );
}
