"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const lineItemSchema = z.object({
  itemDate: z.string().optional(),
  specification: z.string().min(1, "Required"),
  quantity: z.coerce.number().positive("Must be > 0"),
  unitCost: z.coerce.number().min(0, "Must be ≥ 0"),
});

const irfSchema = z.object({
  projectName: z.string().min(1, "Project is required"),
  purpose: z.string().min(1, "Purpose is required"),
  expenseDate: z.string().min(1, "Date is required"),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
  notes: z.string().optional(),
});

type IrfFormData = z.infer<typeof irfSchema>;

interface Props {
  requestedBy: string;
  projects?: { id: string; name: string; code: string }[];
}

const inputCls = (error?: boolean) =>
  `h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1 ${
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
  }`;

export function IrfClaimForm({ requestedBy, projects = [] }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IrfFormData>({
    resolver: zodResolver(irfSchema),
    defaultValues: {
      expenseDate: new Date().toISOString().slice(0, 10),
      projectName: "",
      purpose: "",
      notes: "",
      lineItems: [
        { itemDate: "", specification: "", quantity: 1, unitCost: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const lineItems = watch("lineItems");

  const total = useMemo(() => {
    return (lineItems ?? []).reduce((sum, row) => {
      const qty = Number(row?.quantity) || 0;
      const unit = Number(row?.unitCost) || 0;
      return sum + qty * unit;
    }, 0);
  }, [lineItems]);

  const onSubmit = async (data: IrfFormData, submit: boolean) => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, submit }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to save claim. Please try again.");
      return;
    }

    router.push("/expenses");
    router.refresh();
  };

  return (
    <form className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form header — matches IRF PDF */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">
            Internal Request Form
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Complete this form to submit an expense claim (IRF)
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              Requested by
            </label>
            <input
              type="text"
              value={requestedBy}
              readOnly
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              Date *
            </label>
            <input
              type="date"
              {...register("expenseDate")}
              className={inputCls(!!errors.expenseDate)}
            />
            {errors.expenseDate && (
              <p className="mt-1 text-xs text-red-600">{errors.expenseDate.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              Project *
            </label>
            {projects.length > 0 ? (
              <>
                <input
                  list="project-options"
                  {...register("projectName")}
                  placeholder="Select or type project name"
                  className={inputCls(!!errors.projectName)}
                />
                <datalist id="project-options">
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.code}
                    </option>
                  ))}
                </datalist>
              </>
            ) : (
              <input
                type="text"
                {...register("projectName")}
                placeholder="Project name"
                className={inputCls(!!errors.projectName)}
              />
            )}
            {errors.projectName && (
              <p className="mt-1 text-xs text-red-600">{errors.projectName.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              Purpose (s) *
            </label>
            <textarea
              {...register("purpose")}
              rows={3}
              placeholder="Describe the purpose of this request…"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none ${
                errors.purpose
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
            {errors.purpose && (
              <p className="mt-1 text-xs text-red-600">{errors.purpose.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line items table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Request Details</h3>
          <button
            type="button"
            onClick={() =>
              append({ itemDate: "", specification: "", quantity: 1, unitCost: 0 })
            }
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2 whitespace-nowrap w-32">Date</th>
                <th className="px-3 py-2 min-w-[200px]">Detailed specifications</th>
                <th className="px-3 py-2 whitespace-nowrap w-24">Qty</th>
                <th className="px-3 py-2 whitespace-nowrap w-32">Unit cost</th>
                <th className="px-3 py-2 whitespace-nowrap w-32">Cost (KES)</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fields.map((field, index) => {
                const qty = Number(lineItems?.[index]?.quantity) || 0;
                const unit = Number(lineItems?.[index]?.unitCost) || 0;
                const rowCost = qty * unit;

                return (
                  <tr key={field.id}>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="date"
                        {...register(`lineItems.${index}.itemDate`)}
                        className={inputCls()}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        {...register(`lineItems.${index}.specification`)}
                        placeholder="Item description"
                        className={inputCls(!!errors.lineItems?.[index]?.specification)}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        {...register(`lineItems.${index}.quantity`)}
                        className={inputCls(!!errors.lineItems?.[index]?.quantity)}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        {...register(`lineItems.${index}.unitCost`)}
                        className={inputCls(!!errors.lineItems?.[index]?.unitCost)}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="h-9 flex items-center px-1 font-medium text-gray-900">
                        {formatCurrency(rowCost)}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} className="px-3 py-3 text-right text-sm font-semibold text-gray-700">
                  Total
                </td>
                <td className="px-3 py-3 font-bold text-gray-900">
                  {formatCurrency(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        {errors.lineItems?.root && (
          <p className="px-4 pb-3 text-xs text-red-600">{errors.lineItems.root.message}</p>
        )}
      </div>

      {/* Approval workflow reference (matches PDF footer) */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase text-gray-500 mb-3">
          Approval workflow (after submission)
        </p>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-gray-600">
          <p>Prepared by: <span className="font-medium text-gray-800">{requestedBy}</span></p>
          <p>Reviewed by (Budget Holder)</p>
          <p>Checked by (Finance)</p>
          <p>Approved by (CEO)</p>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Signatures are captured during the approval process. Download the blank IRF PDF if you need a printable copy.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Additional notes (optional)
        </label>
        <textarea
          {...register("notes")}
          rows={2}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit((data) => onSubmit(data, true))}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Claim
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit((data) => onSubmit(data, false))}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => router.push("/expenses")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
