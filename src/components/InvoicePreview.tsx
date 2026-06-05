import type { ReactElement } from "react";
import { formatCurrency } from "../utils/calculations";
import type { Invoice } from "../types";

interface InvoicePreviewProps {
  data: Invoice;
}

export function InvoicePreview({ data }: InvoicePreviewProps): ReactElement {
  const subtotal = data.services.reduce(
    (sum, s) => sum + s.quantity * s.rate,
    0
  );
  const gstHst = subtotal * (data.gstHstPercentage / 100);
  const pst = subtotal * (data.pstPercentage / 100);
  const qst = subtotal * (data.qstPercentage / 100);
  const total = subtotal + gstHst + pst + qst;

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-[816px] mx-auto font-sans text-sm">
      {/* Header */}
      {data.logo && data.logoPosition === "center" && (
        <div className="flex justify-center mb-4">
          <img
            src={data.logo}
            alt="Logo"
            style={{ height: data.logoSize * 3.5 }}
            className="w-auto object-contain"
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start gap-4">
          {data.logo && data.logoPosition === "left" && (
            <img
              src={data.logo}
              alt="Logo"
              style={{ height: data.logoSize * 3.5 }}
              className="w-auto object-contain flex-shrink-0"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {data.business.name || "Your Business"}
            </h2>
            {data.business.address && (
              <p className="text-gray-500 text-xs mt-0.5">
                {data.business.address}
              </p>
            )}
            {data.business.phone && (
              <p className="text-gray-500 text-xs">Phone: {data.business.phone}</p>
            )}
            {data.business.email && (
              <p className="text-gray-500 text-xs">
                Email: {data.business.email}
              </p>
            )}
            {data.business.gstHstNumber && (
              <p
                className="text-xs font-medium mt-1"
                style={{ color: data.accentColor }}
              >
                GST/HST: {data.business.gstHstNumber}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: data.accentColor }}
          >
            INVOICE
          </h1>
          <div className="mt-2 space-y-0.5">
            <p className="text-gray-600 text-xs">
              <span className="text-gray-400">#</span>{" "}
              {data.invoiceNumber || "—"}
            </p>
            {data.poNumber && (
              <p className="text-gray-600 text-xs">
                <span className="text-gray-400">PO</span> {data.poNumber}
              </p>
            )}
            <p className="text-gray-600 text-xs">
              Date: {data.invoiceDate || "—"}
            </p>
            {data.paymentTerms && (
              <p className="text-gray-600 text-xs">
                Terms: {data.paymentTerms}
              </p>
            )}
            <p className="text-gray-600 text-xs">
              Due: {data.dueDate || "—"}
            </p>
            {(data.serviceStartDate || data.serviceEndDate) && (
              <p className="text-gray-600 text-xs">
                Period: {data.serviceStartDate || "—"} – {data.serviceEndDate || "—"}
              </p>
            )}
            <p className="text-gray-600 text-xs">Currency: {data.currency}</p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Bill To */}
      {(data.client.name || data.client.company) && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Bill To
          </h3>
          <p className="text-gray-800 font-medium">{data.client.name}</p>
          {data.client.company && (
            <p className="text-gray-600 text-xs">{data.client.company}</p>
          )}
          {data.client.address && (
            <p className="text-gray-600 text-xs">{data.client.address}</p>
          )}
          {data.client.email && (
            <p className="text-gray-600 text-xs">{data.client.email}</p>
          )}
        </div>
      )}

      {/* Services Table */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
              Qty/Hrs
            </th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
              Rate
            </th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.services.map((item) => (
            <tr key={item.id}>
              <td className="py-2 text-gray-800">{item.description || "—"}</td>
              <td className="py-2 text-center text-gray-600">
                {item.quantity || "—"}
              </td>
              <td className="py-2 text-right text-gray-600">
                {item.rate ? formatCurrency(item.rate) : "—"}
              </td>
              <td className="py-2 text-right text-gray-800 font-medium">
                {formatCurrency(item.quantity * item.rate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-72 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              GST/HST ({data.gstHstPercentage}%)
            </span>
            <span className="text-gray-700">{formatCurrency(gstHst)}</span>
          </div>
          {data.pstPercentage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                PST ({data.pstPercentage}%)
              </span>
              <span className="text-gray-700">{formatCurrency(pst)}</span>
            </div>
          )}
          {data.qstPercentage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                QST ({data.qstPercentage}%)
              </span>
              <span className="text-gray-700">{formatCurrency(qst)}</span>
            </div>
          )}
          <hr className="border-gray-300" />
          <div className="flex justify-between text-base font-bold">
            <span className="text-gray-800">Total (CAD)</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {(data.paymentInfo.method ||
        data.paymentInfo.interacEmail ||
        (data.showBankingDetails &&
          (data.paymentInfo.bankName ||
            data.paymentInfo.accountHolder ||
            data.paymentInfo.institutionNumber ||
            data.paymentInfo.transitNumber ||
            data.paymentInfo.accountNumber))) && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Payment Information
          </h3>
          <div className="text-xs text-gray-600 space-y-0.5">
            {data.paymentInfo.method && (
              <p>Method: {data.paymentInfo.method}</p>
            )}
            {data.paymentInfo.interacEmail && (
              <p>Interac e-Transfer: {data.paymentInfo.interacEmail}</p>
            )}
            {data.showBankingDetails && (
              <>
                {data.paymentInfo.bankName && (
                  <p>Bank: {data.paymentInfo.bankName}</p>
                )}
                {data.paymentInfo.accountHolder && (
                  <p>Account Holder: {data.paymentInfo.accountHolder}</p>
                )}
                {(data.paymentInfo.institutionNumber ||
                  data.paymentInfo.transitNumber) && (
                  <p>
                    Institution #: {data.paymentInfo.institutionNumber} | Transit #:{" "}
                    {data.paymentInfo.transitNumber}
                  </p>
                )}
                {data.paymentInfo.accountNumber && (
                  <p>Account #: {data.paymentInfo.accountNumber}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Notes
          </h3>
          <p className="text-xs text-gray-600 whitespace-pre-wrap">
            {data.notes}
          </p>
        </div>
      )}

      {/* Thank You */}
      <hr className="border-gray-200 mb-4" />
      <p
        className="text-center text-sm italic"
        style={{ color: data.accentColor }}
      >
        Thank you for your business.
      </p>
    </div>
  );
}
