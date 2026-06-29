import { db } from "@/lib/db";
import { auth } from "@/auth";
import { formatDate } from "@/lib/utils";
import { AssetStatusBadge } from "@/components/assets/asset-status-badge";
import { AssignmentActions } from "@/components/assets/assignment-actions";
import { Package2, UserCheck, ArrowRightLeft } from "lucide-react";

export const metadata = { title: "Asset Assignments" };

export default async function AssignmentsPage() {
  await auth();

  const assets = await db.asset.findMany({
    orderBy: { assetTag: "asc" },
    include: {
      assignments: {
        where: { returnedAt: null },
        orderBy: { assignedAt: "desc" },
        take: 1,
      },
    },
  });

  const assigned = assets.filter((a) => a.status === "ASSIGNED");
  const available = assets.filter((a) => a.status === "AVAILABLE");

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Asset Assignments</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage who holds each asset — assign, transfer, or return
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Assets", value: assets.length, icon: Package2, color: "text-gray-700" },
          { label: "Currently Assigned", value: assigned.length, icon: UserCheck, color: "text-blue-600" },
          { label: "Available to Assign", value: available.length, icon: ArrowRightLeft, color: "text-emerald-600" },
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

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">All Assets</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Click Transfer to reassign an asset or Return to make it available
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Asset Tag</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Make / Model</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Staff in Charge</th>
                <th className="px-5 py-3">Assigned On</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.map((asset) => {
                const activeAssignment = asset.assignments[0];
                return (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-emerald-700">
                        {asset.assetTag}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{asset.name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {[asset.brand, asset.model].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{asset.location ?? "—"}</td>
                    <td className="px-5 py-3">
                      {asset.staffInCharge ? (
                        <span className="font-medium text-gray-900">{asset.staffInCharge}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {activeAssignment
                        ? formatDate(activeAssignment.assignedAt.toISOString())
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <AssetStatusBadge status={asset.status} />
                    </td>
                    <td className="px-5 py-3">
                      <AssignmentActions
                        assetId={asset.id}
                        assetTag={asset.assetTag}
                        assetName={asset.name}
                        currentHolder={asset.staffInCharge ?? ""}
                        status={asset.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
