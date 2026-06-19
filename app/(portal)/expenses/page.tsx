import type { Metadata } from "next";
import { Receipt, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Expenses" };

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "info" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  PAID: { label: "Paid", variant: "default" },
};

export default async function ExpensesPage() {
  const session = await auth();
  const isManager = ["CEO", "FINANCE", "OPERATIONS"].includes(session?.user?.role ?? "");

  const expenses = await db.expense.findMany({
    where: isManager ? undefined : { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isManager ? "All Expense Claims" : "My Expense Claims"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {expenses.length} claims
          </p>
        </div>
        <Button asChild>
          <Link href="/expenses/new">
            <Plus className="h-4 w-4" />
            New Claim
          </Link>
        </Button>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No expense claims</h3>
            <p className="mt-1 text-sm text-gray-500">Submit a new expense claim to get started.</p>
            <Button className="mt-4" asChild>
              <Link href="/expenses/new">
                <Plus className="h-4 w-4" />
                New Claim
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {["Title", "Category", "Amount", "Date", "Submitted By", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((exp) => {
                const status = statusConfig[exp.status] ?? { label: exp.status, variant: "secondary" as const };
                return (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{exp.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exp.category.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(exp.amount), exp.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(exp.expenseDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exp.user.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
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
