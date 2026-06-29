"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AssetStatusBadge } from "@/components/assets/asset-status-badge";

export type AssetRow = {
  id: string;
  assetTag: string;
  classification: string | null;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  supplier: string | null;
  invoiceNumber: string | null;
  paymentReference: string | null;
  staffInCharge: string | null;
  location: string | null;
  status: string;
  notes: string | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_MAINTENANCE", label: "In Maintenance" },
  { value: "RETIRED", label: "Retired" },
  { value: "LOST", label: "Lost" },
];

const CATEGORY_LABELS: Record<string, string> = {
  LAPTOP: "Laptop",
  DESKTOP: "Desktop",
  MOBILE_PHONE: "Mobile Phone",
  FURNITURE: "Furniture",
  PRINTER: "Printer",
  PROJECTOR: "Projector",
  NETWORK_EQUIPMENT: "Network Equipment",
  SOFTWARE_LICENCE: "Software Licence",
  OTHER: "Other",
};

const selectCls =
  "h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500";

function matchesSearch(asset: AssetRow, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [
    asset.assetTag,
    asset.classification,
    asset.name,
    asset.brand,
    asset.model,
    asset.serialNumber,
    asset.supplier,
    asset.staffInCharge,
    asset.location,
    asset.invoiceNumber,
    asset.paymentReference,
    asset.notes,
    CATEGORY_LABELS[asset.category] ?? asset.category,
  ];
  return fields.some((f) => f?.toLowerCase().includes(q));
}

interface Props {
  assets: AssetRow[];
}

export function AssetRegisterTable({ assets }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [classification, setClassification] = useState("");
  const [location, setLocation] = useState("");

  const classifications = useMemo(
    () =>
      [...new Set(assets.map((a) => a.classification).filter(Boolean))].sort() as string[],
    [assets]
  );

  const locations = useMemo(
    () =>
      [...new Set(assets.map((a) => a.location).filter(Boolean))].sort() as string[],
    [assets]
  );

  const categories = useMemo(
    () => [...new Set(assets.map((a) => a.category))].sort(),
    [assets]
  );

  const filtered = useMemo(() => {
    return assets.filter((asset) => {
      if (!matchesSearch(asset, search)) return false;
      if (status && asset.status !== status) return false;
      if (category && asset.category !== category) return false;
      if (classification && asset.classification !== classification) return false;
      if (location && asset.location !== location) return false;
      return true;
    });
  }, [assets, search, status, category, classification, location]);

  const filteredValue = filtered.reduce(
    (sum, a) => sum + (a.purchasePrice ?? 0),
    0
  );

  const hasFilters = !!(search || status || category || classification || location);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setClassification("");
    setLocation("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="space-y-3 border-b border-gray-100 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tag, description, serial number, staff, location…"
            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectCls}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectCls}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>

          {classifications.length > 0 && (
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className={selectCls}
            >
              <option value="">All classifications</option>
              {classifications.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {locations.length > 0 && (
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={selectCls}
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 whitespace-nowrap">Asset Tag</th>
              <th className="px-4 py-3 whitespace-nowrap">Classification</th>
              <th className="px-4 py-3 whitespace-nowrap">Description</th>
              <th className="px-4 py-3 whitespace-nowrap">Make</th>
              <th className="px-4 py-3 whitespace-nowrap">Model / Spec</th>
              <th className="px-4 py-3 whitespace-nowrap">Serial No.</th>
              <th className="px-4 py-3 whitespace-nowrap">Date of Purchase</th>
              <th className="px-4 py-3 whitespace-nowrap">Supplier / Vendor</th>
              <th className="px-4 py-3 whitespace-nowrap">Purchase Cost</th>
              <th className="px-4 py-3 whitespace-nowrap">Invoice No.</th>
              <th className="px-4 py-3 whitespace-nowrap">Payment Ref.</th>
              <th className="px-4 py-3 whitespace-nowrap">Staff in Charge</th>
              <th className="px-4 py-3 whitespace-nowrap">Location</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap">Comments</th>
              <th className="px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={16} className="px-4 py-12 text-center text-gray-400">
                  {hasFilters
                    ? "No assets match your search or filters."
                    : "No assets found. Add your first asset to get started."}
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-emerald-700">
                      {asset.assetTag}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {asset.classification ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {asset.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {asset.brand ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                    <span className="line-clamp-2">{asset.model ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600">
                    {asset.serialNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {asset.purchaseDate ? formatDate(asset.purchaseDate) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {asset.supplier ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {asset.purchasePrice != null
                      ? formatCurrency(asset.purchasePrice)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {asset.invoiceNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {asset.paymentReference ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {asset.staffInCharge || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {asset.location ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <AssetStatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px]">
                    <span className="line-clamp-2 text-xs">{asset.notes || "—"}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/assets/${asset.id}/edit`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {assets.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
          Showing {filtered.length} of {assets.length} assets
          {hasFilters && filtered.length !== assets.length && " (filtered)"}
          {" · "}
          Filtered value:{" "}
          <span className="font-semibold text-gray-700">
            {formatCurrency(filteredValue)}
          </span>
        </div>
      )}
    </div>
  );
}
