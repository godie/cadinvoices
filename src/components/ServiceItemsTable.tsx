import type { ReactElement } from "react";
import { formatCurrency } from "../utils/calculations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormApi = any;

interface ServiceItemsTableProps {
  form: FormApi;
}

export function ServiceItemsTable({
  form,
}: ServiceItemsTableProps): ReactElement {
  return (
    <form.Field name="services" mode="array">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(field: any) => (
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 font-medium text-gray-500">
                    Description
                  </th>
                  <th className="pb-2 font-medium text-gray-500 w-20">
                    Qty/Hrs
                  </th>
                  <th className="pb-2 font-medium text-gray-500 w-28">
                    Rate (CAD)
                  </th>
                  <th className="pb-2 font-medium text-gray-500 w-28 text-right">
                    Amount (CAD)
                  </th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {field.state.value.map(
                  (item: { id: string }, i: number) => (
                    <tr key={item.id || i} className="group">
                      <td className="py-2 pr-2">
                        <form.Field name={`services[${i}].description`}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(subField: any) => (
                            <input
                              value={subField.state.value}
                              onChange={(e) =>
                                subField.handleChange(e.target.value)
                              }
                              onBlur={subField.handleBlur}
                              placeholder="Service description"
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            />
                          )}
                        </form.Field>
                      </td>
                      <td className="py-2 pr-2">
                        <form.Field name={`services[${i}].quantity`}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(subField: any) => (
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={
                                subField.state.value === 0
                                  ? ""
                                  : String(subField.state.value)
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                subField.handleChange(
                                  val === "" ? 0 : parseFloat(val)
                                );
                              }}
                              onBlur={subField.handleBlur}
                              placeholder="0"
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            />
                          )}
                        </form.Field>
                      </td>
                      <td className="py-2 pr-2">
                        <form.Field name={`services[${i}].rate`}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(subField: any) => (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                subField.state.value === 0
                                  ? ""
                                  : String(subField.state.value)
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                subField.handleChange(
                                  val === "" ? 0 : parseFloat(val)
                                );
                              }}
                              onBlur={subField.handleBlur}
                              placeholder="0.00"
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            />
                          )}
                        </form.Field>
                      </td>
                      <td className="py-2 text-right text-sm text-gray-700 font-medium">
                        <form.Field name={`services[${i}].quantity`}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(qtyField: any) => (
                            <form.Field name={`services[${i}].rate`}>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {(rateField: any) =>
                                formatCurrency(
                                  qtyField.state.value *
                                    rateField.state.value
                                )
                              }
                            </form.Field>
                          )}
                        </form.Field>
                      </td>
                      <td className="py-2 text-center">
                        {field.state.value.length > 1 && (
                          <button
                            type="button"
                            onClick={() => field.removeValue(i)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                            title="Remove row"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() =>
              field.pushValue({
                id: crypto.randomUUID(),
                description: "",
                quantity: 1,
                rate: 0,
              })
            }
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add line item
          </button>
        </div>
      )}
    </form.Field>
  );
}
