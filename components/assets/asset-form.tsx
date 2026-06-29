"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const assetSchema = z.object({
  assetTag: z.string().min(1, "Asset tag is required"),
  classification: z.string().min(1, "Classification is required"),
  name: z.string().min(1, "Description is required"),
  category: z.enum([
    "LAPTOP",
    "DESKTOP",
    "MOBILE_PHONE",
    "FURNITURE",
    "PRINTER",
    "PROJECTOR",
    "NETWORK_EQUIPMENT",
    "SOFTWARE_LICENCE",
    "OTHER",
  ]),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentReference: z.string().optional(),
  staffInCharge: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_MAINTENANCE", "RETIRED", "LOST"]),
  notes: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

const CATEGORIES = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "DESKTOP", label: "Desktop Computer" },
  { value: "MOBILE_PHONE", label: "Mobile Phone" },
  { value: "PRINTER", label: "Printer" },
  { value: "PROJECTOR", label: "Projector" },
  { value: "NETWORK_EQUIPMENT", label: "Network Equipment" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "SOFTWARE_LICENCE", label: "Software Licence" },
  { value: "OTHER", label: "Other" },
];

const STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_MAINTENANCE", label: "In Maintenance" },
  { value: "RETIRED", label: "Retired" },
  { value: "LOST", label: "Lost" },
];

interface AssetFormProps {
  defaultValues?: Partial<AssetFormData>;
  assetId?: string;
}

export function AssetForm({ defaultValues, assetId }: AssetFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: "AVAILABLE",
      classification: "Equipment",
      ...defaultValues,
    },
  });

  const onSubmit = async (data: AssetFormData) => {
    setServerError(null);
    const url = assetId ? `/api/assets/${assetId}` : "/api/assets";
    const method = assetId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setServerError(err.error ?? "Failed to save asset. Please try again.");
      return;
    }

    router.push("/assets");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      {serverError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Asset Tag */}
        <Field label="Asset Tag *" error={errors.assetTag?.message}>
          <input {...register("assetTag")} placeholder="UTHABITI000001" className={inputCls(!!errors.assetTag)} />
        </Field>

        {/* Classification */}
        <Field label="Classification *" error={errors.classification?.message}>
          <select {...register("classification")} className={inputCls(!!errors.classification)}>
            <option value="Equipment">Equipment</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicle">Vehicle</option>
            <option value="Other">Other</option>
          </select>
        </Field>

        {/* Category */}
        <Field label="Category *" error={errors.category?.message}>
          <select {...register("category")} className={inputCls(!!errors.category)}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>

        {/* Description */}
        <Field label="Asset Description *" error={errors.name?.message}>
          <input {...register("name")} placeholder="e.g. Laptop, Printer, Sofa Set" className={inputCls(!!errors.name)} />
        </Field>

        {/* Make */}
        <Field label="Make (Brand)" error={errors.brand?.message}>
          <input {...register("brand")} placeholder="e.g. HP, Epson, TECNO" className={inputCls(false)} />
        </Field>

        {/* Model */}
        <Field label="Model / Specification" error={errors.model?.message}>
          <input {...register("model")} placeholder="e.g. Pavillion 15 Core i5 8gb RAM" className={inputCls(false)} />
        </Field>

        {/* Serial Number */}
        <Field label="Serial Number" error={errors.serialNumber?.message}>
          <input {...register("serialNumber")} placeholder="e.g. 5CD8491PZ0" className={inputCls(false)} />
        </Field>

        {/* Purchase Date */}
        <Field label="Date of Purchase" error={errors.purchaseDate?.message}>
          <input type="date" {...register("purchaseDate")} className={inputCls(false)} />
        </Field>

        {/* Supplier */}
        <Field label="Supplier / Vendor" error={errors.supplier?.message}>
          <input {...register("supplier")} placeholder="e.g. Yellow Apple Technologies" className={inputCls(false)} />
        </Field>

        {/* Purchase Cost */}
        <Field label="Purchase Cost (KES)" error={errors.purchasePrice?.message}>
          <input type="number" step="0.01" {...register("purchasePrice")} placeholder="0.00" className={inputCls(!!errors.purchasePrice)} />
        </Field>

        {/* Invoice Number */}
        <Field label="Invoice Number" error={errors.invoiceNumber?.message}>
          <input {...register("invoiceNumber")} placeholder="e.g. 11951" className={inputCls(false)} />
        </Field>

        {/* Payment Reference */}
        <Field label="Payment Reference" error={errors.paymentReference?.message}>
          <input {...register("paymentReference")} placeholder="e.g. Cheque #000020" className={inputCls(false)} />
        </Field>

        {/* Staff in Charge */}
        <Field label="Staff in Charge" error={errors.staffInCharge?.message}>
          <input {...register("staffInCharge")} placeholder="e.g. John Doe" className={inputCls(false)} />
        </Field>

        {/* Location */}
        <Field label="Asset Location" error={errors.location?.message}>
          <input {...register("location")} placeholder="e.g. Main Office, Reception" className={inputCls(false)} />
        </Field>

        {/* Status */}
        <Field label="Status *" error={errors.status?.message}>
          <select {...register("status")} className={inputCls(!!errors.status)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Comments — full width */}
      <div className="mt-6">
        <Field label="Comments" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Any additional notes or comments about this asset..."
            className={`${inputCls(false)} resize-none`}
          />
        </Field>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {assetId ? "Save Changes" : "Add Asset"}
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return `h-9 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
