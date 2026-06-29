"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, X, AlertTriangle } from "lucide-react";

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  brand: string | null;
  status: string;
}

interface Props {
  assets: Asset[];
}

const issueTypes = [
  { value: "DAMAGE", label: "Damage Report" },
  { value: "REPAIR", label: "Repair Needed" },
  { value: "SERVICING", label: "Servicing / Service Due" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "OTHER", label: "Other" },
];

export function ReportMaintenanceButton({ assets }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    assetId: "",
    type: "DAMAGE",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    cost: "",
    vendor: "",
    markAsInMaintenance: true,
  });

  const update = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError("");
    if (!form.assetId) { setError("Please select an asset."); return; }
    if (form.description.trim().length < 5) { setError("Please provide a description (at least 5 characters)."); return; }

    setLoading(true);
    const res = await fetch("/api/assets/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        cost: form.cost ? Number(form.cost) : undefined,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to submit. Please try again.");
      return;
    }

    setOpen(false);
    setForm({
      assetId: "",
      type: "DAMAGE",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      cost: "",
      vendor: "",
      markAsInMaintenance: true,
    });
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(""); }}
        className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        <AlertTriangle className="h-4 w-4" />
        Report Issue
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Report Asset Issue</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Report a damaged, faulty, or maintenance-needed asset
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Asset *</label>
                <select
                  value={form.assetId}
                  onChange={(e) => update("assetId", e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Select an asset…</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} — {a.name}{a.brand ? ` (${a.brand})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Issue Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {issueTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Description / Issue Details *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  placeholder="Describe the damage or issue in detail…"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:border-red-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Repair Vendor (optional)</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => update("vendor", e.target.value)}
                    placeholder="e.g. HP Service Centre"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Estimated Cost (KES)</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => update("cost", e.target.value)}
                    placeholder="0"
                    min="0"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.markAsInMaintenance}
                  onChange={(e) => update("markAsInMaintenance", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-red-600"
                />
                <span className="text-gray-700">
                  Mark asset status as <strong>In Maintenance</strong>
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Plus className="h-4 w-4" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
