import type { ReactElement } from "react";
import { ServiceItemsTable } from "./ServiceItemsTable";
import type { FormErrors } from "../types";
import {
  savePaymentDefaults,
  loadPaymentDefaults,
  saveBusinessDefaults,
  loadBusinessDefaults,
} from "../utils/storage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormApi = any;

interface InvoiceFormProps {
  form: FormApi;
  errors: FormErrors;
}

function FieldError({ error }: { error?: string }): ReactElement | null {
  if (!error) return null;
  return <p className="text-red-500 text-xs mt-0.5">{error}</p>;
}

export function InvoiceForm({ form, errors }: InvoiceFormProps): ReactElement {
  return (
    <div className="space-y-8">
      {/* Business Information */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Business Information
          </h3>
          <form.Field name="business">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => saveBusinessDefaults(field.state.value)}
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  Save as Defaults
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defaults = loadBusinessDefaults();
                    if (defaults) field.handleChange(defaults);
                  }}
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  Load Defaults
                </button>
              </div>
            )}
          </form.Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Logo
              <span className="text-gray-400 ml-0.5">(optional)</span>
            </label>
            <form.Field name="logo">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <div className="flex items-center gap-3">
                  {field.state.value ? (
                    <>
                      <img
                        src={field.state.value}
                        alt="Business logo"
                        className="h-12 w-auto object-contain border border-gray-200 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => field.handleChange("")}
                        className="text-xs text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <label className="px-4 py-2 text-sm border border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-500">
                      <span>Upload logo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => field.handleChange(reader.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Logo Position
            </label>
            <form.Field name="logoPosition">
              {(field: any) => (
                <form.Subscribe selector={(state: any) => state.values.logo}>
                  {(logo: string) => (
                    <div className={`flex gap-3${!logo ? " opacity-40 pointer-events-none" : ""}`}>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="logoPosition"
                          value="left"
                          checked={field.state.value === "left"}
                          onChange={() => field.handleChange("left")}
                          className="accent-emerald-600"
                        />
                        Left
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="logoPosition"
                          value="center"
                          checked={field.state.value === "center"}
                          onChange={() => field.handleChange("center")}
                          className="accent-emerald-600"
                        />
                        Center
                      </label>
                    </div>
                  )}
                </form.Subscribe>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Logo Size
              <span className="text-gray-400 ml-0.5">(mm)</span>
            </label>
            <form.Field name="logoSize">
              {(field: any) => (
                <form.Subscribe selector={(state: any) => state.values.logo}>
                  {(logo: string) => (
                    <div className={`flex items-center gap-2${!logo ? " opacity-40 pointer-events-none" : ""}`}>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        className="flex-1 accent-emerald-600"
                        disabled={!logo}
                      />
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {field.state.value}mm
                      </span>
                    </div>
                  )}
                </form.Subscribe>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Business Name *
            </label>
            <form.Field name="business.name">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
            <FieldError error={errors["business.name"]} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Accent Color
            </label>
            <form.Field name="accentColor">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="#2d6a4f"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <form.Field name="business.email">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Address
            </label>
            <form.Field name="business.address">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone
            </label>
            <form.Field name="business.phone">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              GST/HST Number
              <span className="text-gray-400 ml-0.5">(optional)</span>
            </label>
            <form.Field name="business.gstHstNumber">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. 123456789RT0001"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
        </div>
      </section>

      {/* Client Information */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Client Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Client Name *
            </label>
            <form.Field name="client.name">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
            <FieldError error={errors["client.name"]} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Company
            </label>
            <form.Field name="client.company">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <form.Field name="client.email">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Address
            </label>
            <form.Field name="client.address">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
        </div>
      </section>

      {/* Invoice Information */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Invoice Details
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Invoice # *
            </label>
            <form.Field name="invoiceNumber">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="INV-001"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
            <FieldError error={errors.invoiceNumber} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PO Number
              <span className="text-gray-400 ml-0.5">(optional)</span>
            </label>
            <form.Field name="poNumber">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="PO-12345"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Invoice Date *
            </label>
            <form.Field name="invoiceDate">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
            <FieldError error={errors.invoiceDate} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Payment Terms
            </label>
            <form.Field name="paymentTerms">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <form.Subscribe selector={(state: any) => state.values.invoiceDate}>
                  {(invoiceDate: string) => (
                    <select
                      value={field.state.value}
                      onChange={(e) => {
                        const terms = e.target.value;
                        field.handleChange(terms);
                        if (invoiceDate && terms) {
                          const daysMap: Record<string, number> = {
                            "Due on Receipt": 0,
                            "Net 15": 15,
                            "Net 30": 30,
                            "Net 60": 60,
                          };
                          const days = daysMap[terms];
                          if (days !== undefined) {
                            const date = new Date(invoiceDate + "T00:00:00");
                            date.setDate(date.getDate() + days);
                            form.setFieldValue("dueDate", date.toISOString().slice(0, 10));
                          }
                        }
                      }}
                      onBlur={field.handleBlur}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-white"
                    >
                      <option value="">Select terms</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  )}
                </form.Subscribe>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Due Date
            </label>
            <form.Field name="dueDate">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Service Period
              <span className="text-gray-400 ml-0.5">(optional)</span>
            </label>
            <div className="flex gap-3">
              <form.Field name="serviceStartDate">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                  <input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    title="Start date"
                  />
                )}
              </form.Field>
              <span className="text-gray-400 self-center text-sm">to</span>
              <form.Field name="serviceEndDate">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                  <input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    title="End date"
                  />
                )}
              </form.Field>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Currency
            </label>
            <input
              type="text"
              value="CAD"
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-100 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </section>

      {/* Services Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Services
          </h3>
        </div>
        <ServiceItemsTable form={form} />
        {errors.services && (
          <p className="text-red-500 text-xs mt-1">{errors.services}</p>
        )}
      </section>

      {/* Tax */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Tax
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              GST/HST %
            </label>
            <form.Field name="gstHstPercentage">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={field.state.value === 0 ? "" : String(field.state.value)}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.handleChange(val === "" ? 0 : parseFloat(val));
                    }}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 pr-8 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    %
                  </span>
                </div>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PST %
              <span className="text-gray-400 ml-0.5">(optional)</span>
            </label>
            <form.Field name="pstPercentage">
              {(field: any) => (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={field.state.value === 0 ? "" : String(field.state.value)}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.handleChange(val === "" ? 0 : parseFloat(val));
                    }}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 pr-8 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    %
                  </span>
                </div>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              QST %
              <span className="text-gray-400 ml-0.5">(optional)</span>
            </label>
            <form.Field name="qstPercentage">
              {(field: any) => (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={field.state.value === 0 ? "" : String(field.state.value)}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.handleChange(val === "" ? 0 : parseFloat(val));
                    }}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 pr-8 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    %
                  </span>
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Payment Information
          </h3>
          <form.Field name="paymentInfo">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => savePaymentDefaults(field.state.value)}
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  Save as Defaults
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defaults = loadPaymentDefaults();
                    if (defaults) field.handleChange(defaults);
                  }}
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  Load Defaults
                </button>
              </div>
            )}
          </form.Field>
        </div>
        <form.Field name="showBankingDetails">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span className="text-gray-600">Show banking details on invoice</span>
              <span className="text-xs text-amber-500">(sensitive data — off by default)</span>
            </label>
          )}
        </form.Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Payment Method
            </label>
            <form.Field name="paymentInfo.method">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-white"
                >
                  <option value="">Select method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Interac e-Transfer">
                    Interac e-Transfer
                  </option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Bank Name
            </label>
            <form.Field name="paymentInfo.bankName">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Account Holder
            </label>
            <form.Field name="paymentInfo.accountHolder">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Institution Number
            </label>
            <form.Field name="paymentInfo.institutionNumber">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Transit Number
            </label>
            <form.Field name="paymentInfo.transitNumber">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Account Number
            </label>
            <form.Field name="paymentInfo.accountNumber">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Interac e-Transfer Email
            </label>
            <form.Field name="paymentInfo.interacEmail">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="transfer@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              )}
            </form.Field>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Notes
        </h3>
        <form.Field name="notes">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              rows={3}
              placeholder="Additional notes, terms, or special instructions..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
            />
          )}
        </form.Field>
      </section>
    </div>
  );
}
