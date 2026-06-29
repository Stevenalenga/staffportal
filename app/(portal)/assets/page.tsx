import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Download, Search } from "lucide-react";
import { AssetStatusBadge } from "@/components/assets/asset-status-badge";

export const metadata = { title: "Assets" };

export default async function AssetsPage() {
  await auth();

  const assets = await db.asset.findMany({
    orderBy: { assetTag: "asc" },
  });

  const totalValue = assets.reduce(
    (sum, a) => sum + Number(a.purchasePrice ?? 0),
    0
  );

  const byStatus = {
    assigned: assets.filter((a) => a.status === "ASSIGNED").length,
    available: assets.filter((a) => a.status === "AVAILABLE").length,
    maintenance: assets.filter((a) => a.status === "IN_MAINTENANCE").length,
    retired: assets.filter((a) => a.status === "RETIRED").length,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Register</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {assets.length} assets tracked · Total value{" "}
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/assets/export"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </Link>
          <Link
            href="/assets/new"
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Assets", value: assets.length, color: "text-gray-900" },
          { label: "Assigned", value: byStatus.assigned, color: "text-blue-600" },
          { label: "Available", value: byStatus.available, color: "text-emerald-600" },
          { label: "Retired / Faulty", value: byStatus.retired, color: "text-red-500" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Table toolbar */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by tag, description, serial number…"
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

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
              {assets.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No assets found. Add your first asset to get started.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
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
                      {asset.purchaseDate
                        ? formatDate(asset.purchaseDate.toISOString())
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {asset.supplier ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                      {asset.purchasePrice
                        ? formatCurrency(Number(asset.purchasePrice))
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
                      <span className="line-clamp-2 text-xs">
                        {asset.notes || "—"}
                      </span>
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
            Showing {assets.length} of {assets.length} assets · Total value:{" "}
            <span className="font-semibold text-gray-700">
              {formatCurrency(totalValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
