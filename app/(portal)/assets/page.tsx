import type { Metadata } from "next";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Assets" };

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "info" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Available", variant: "default" },
  ASSIGNED: { label: "Assigned", variant: "info" },
  IN_MAINTENANCE: { label: "Maintenance", variant: "warning" },
  RETIRED: { label: "Retired", variant: "secondary" },
  LOST: { label: "Lost", variant: "destructive" },
};

export default async function AssetsPage() {
  const assets = await db.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignments: {
        where: { returnedAt: null },
        include: { user: { select: { name: true } } },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Register</h1>
          <p className="mt-1 text-sm text-gray-500">
            {assets.length} assets registered
          </p>
        </div>
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="h-4 w-4" />
            Register Asset
          </Link>
        </Button>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No assets registered
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start building your asset register.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/assets/new">
                <Plus className="h-4 w-4" />
                Register Asset
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {["Asset Tag", "Name", "Category", "Status", "Assigned To", "Purchase Date"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {assets.map((asset) => {
                const status = statusConfig[asset.status] ?? { label: asset.status, variant: "secondary" as const };
                const assignedTo = asset.assignments[0]?.user?.name;
                return (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{asset.assetTag}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                      {asset.brand && <p className="text-xs text-gray-500">{asset.brand} {asset.model}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asset.category.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{assignedTo ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {asset.purchaseDate ? formatDate(asset.purchaseDate) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
