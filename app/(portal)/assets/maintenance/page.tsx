import { db } from "@/lib/db";
import { auth } from "@/auth";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { ReportMaintenanceButton } from "@/components/assets/report-maintenance-button";
import { MaintenanceCompleteButton } from "@/components/assets/maintenance-complete-button";

export const metadata = { title: "Asset Maintenance" };

const typeLabels: Record<string, string> = {
  DAMAGE: "Damage Report",
  REPAIR: "Repair",
  SERVICING: "Servicing",
  INSPECTION: "Inspection",
  OTHER: "Other",
};

const typeBadge: Record<string, string> = {
  DAMAGE: "bg-red-50 text-red-700",
  REPAIR: "bg-orange-50 text-orange-700",
  SERVICING: "bg-blue-50 text-blue-700",
  INSPECTION: "bg-purple-50 text-purple-700",
  OTHER: "bg-gray-50 text-gray-600",
};

export default async function MaintenancePage() {
  await auth();

  const [records, assets] = await Promise.all([
    db.assetMaintenance.findMany({
      include: { asset: true },
      orderBy: { date: "desc" },
    }),
    db.asset.findMany({
      where: { status: { not: "RETIRED" } },
      orderBy: { assetTag: "asc" },
      select: { id: true, assetTag: true, name: true, brand: true, status: true },
    }),
  ]);

  const open = records.filter((r) => !r.completedAt);
  const completed = records.filter((r) => r.completedAt);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Maintenance</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Report damaged assets and track repairs
          </p>
        </div>
        <ReportMaintenanceButton assets={assets} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Reports", value: records.length, icon: Wrench, color: "text-gray-700" },
          { label: "Open / Pending", value: open.length, icon: AlertTriangle, color: "text-red-600" },
          { label: "Resolved", value: completed.length, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
            <div className="rounded-lg bg-gray-50 p-2.5">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Open issues */}
      {open.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Open Issues ({open.length})
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Issue Description</th>
                    <th className="px-5 py-3">Reported On</th>
                    <th className="px-5 py-3">Vendor / Repair By</th>
                    <th className="px-5 py-3">Cost</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {open.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-semibold text-emerald-700">
                          {rec.asset.assetTag}
                        </p>
                        <p className="text-gray-600 text-xs">{rec.asset.name}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge[rec.type] ?? typeBadge.OTHER}`}>
                          {typeLabels[rec.type] ?? rec.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-xs">
                        <p className="line-clamp-2">{rec.description}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(rec.date.toISOString())}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{rec.vendor ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {rec.cost != null ? formatCurrency(Number(rec.cost)) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <MaintenanceCompleteButton id={rec.id} assetId={rec.assetId} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Resolved */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Resolved / Completed ({completed.length})
        </h2>
        {completed.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
            No completed maintenance records yet.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Issue Description</th>
                    <th className="px-5 py-3">Reported On</th>
                    <th className="px-5 py-3">Resolved On</th>
                    <th className="px-5 py-3">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {completed.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors opacity-80">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-semibold text-emerald-700">
                          {rec.asset.assetTag}
                        </p>
                        <p className="text-gray-600 text-xs">{rec.asset.name}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge[rec.type] ?? typeBadge.OTHER}`}>
                          {typeLabels[rec.type] ?? rec.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-xs">
                        <p className="line-clamp-2">{rec.description}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(rec.date.toISOString())}
                      </td>
                      <td className="px-5 py-3 text-emerald-700 text-xs whitespace-nowrap">
                        {rec.completedAt ? formatDate(rec.completedAt.toISOString()) : "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {rec.cost != null ? formatCurrency(Number(rec.cost)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
