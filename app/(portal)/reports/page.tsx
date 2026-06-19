import type { Metadata } from "next";
import { BarChart3, Download, FileText, Users, Package, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Reports" };

const reports = [
  {
    title: "Staff Register",
    description: "Complete list of all staff members, departments, and employment status.",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
    formats: ["Excel", "PDF"],
  },
  {
    title: "Asset Register",
    description: "Full inventory of organisational assets with status and assignments.",
    icon: Package,
    color: "bg-purple-50 text-purple-700",
    formats: ["Excel", "PDF"],
  },
  {
    title: "Expense Report",
    description: "Summary of expense claims by period, category, and approval status.",
    icon: Receipt,
    color: "bg-orange-50 text-orange-700",
    formats: ["Excel", "PDF"],
  },
  {
    title: "Project Status Report",
    description: "Progress overview of all active projects, milestones, and KPIs.",
    icon: BarChart3,
    color: "bg-emerald-50 text-emerald-700",
    formats: ["Excel", "PDF"],
  },
  {
    title: "Monthly Operational Report",
    description: "Combined operational metrics for the selected month.",
    icon: FileText,
    color: "bg-teal-50 text-teal-700",
    formats: ["PDF"],
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and download operational reports.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${report.color} mb-2`}>
                <report.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription className="text-xs">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {report.formats.map((fmt) => (
                  <Button
                    key={fmt}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {fmt}
                  </Button>
                ))}
              </div>
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-md px-2 py-1.5">
                Report generation coming in Phase 6
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
