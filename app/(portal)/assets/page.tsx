import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Plus, Download } from "lucide-react";
import {
  AssetRegisterTable,
  type AssetRow,
} from "@/components/assets/asset-register-table";

export const metadata = { title: "Assets" };

export default async function AssetsPage() {
  await auth();

  const assets = await db.asset.findMany({
    orderBy: { assetTag: "asc" },
  });

  const rows: AssetRow[] = assets.map((a) => ({
    id: a.id,
    assetTag: a.assetTag,
    classification: a.classification,
    name: a.name,
    category: a.category,
    brand: a.brand,
    model: a.model,
    serialNumber: a.serialNumber,
    purchaseDate: a.purchaseDate?.toISOString() ?? null,
    purchasePrice: a.purchasePrice != null ? Number(a.purchasePrice) : null,
    supplier: a.supplier,
    invoiceNumber: a.invoiceNumber,
    paymentReference: a.paymentReference,
    staffInCharge: a.staffInCharge,
    location: a.location,
    status: a.status,
    notes: a.notes,
  }));

  const totalValue = rows.reduce((sum, a) => sum + (a.purchasePrice ?? 0), 0);

  const byStatus = {
    assigned: rows.filter((a) => a.status === "ASSIGNED").length,
    available: rows.filter((a) => a.status === "AVAILABLE").length,
    maintenance: rows.filter((a) => a.status === "IN_MAINTENANCE").length,
    retired: rows.filter((a) => a.status === "RETIRED").length,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Register</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {rows.length} assets tracked · Total value {formatCurrency(totalValue)}
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Assets", value: rows.length, color: "text-gray-900" },
          { label: "Assigned", value: byStatus.assigned, color: "text-blue-600" },
          { label: "Available", value: byStatus.available, color: "text-emerald-600" },
          { label: "Retired / Faulty", value: byStatus.retired, color: "text-red-500" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <AssetRegisterTable assets={rows} />
    </div>
  );
}
