import type { Metadata } from "next";
import { Receipt, Plus, Download, CheckSquare } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EXPENSE_STATUS_CONFIG } from "@/lib/expense-workflow";

export const metadata: Metadata = { title: "Expenses" };

const APPROVER_ROLES = ["CEO", "FINANCE", "IT_ADMIN"];

export default async function ExpensesPage() {
  const session = await auth();
  const role = session?.user?.role ?? "";
  const isManager = ["CEO", "FINANCE", "OPERATIONS", "IT_ADMIN"].includes(role);
  const canApprove = APPROVER_ROLES.includes(role);

  const expenses = await db.expense.findMany({
    where: isManager ? undefined : { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      category: { select: { name: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isManager ? "All Expense Claims" : "My Expense Claims"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {expenses.length} claims · Internal Request Form (IRF)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canApprove && (
            <Button variant="outline" asChild>
              <Link href="/expenses/approvals">
                <CheckSquare className="h-4 w-4" />
                Approvals
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <a
              href="/forms/irf-form.pdf"
              download="IRF-Form-Uthabiti-Africa.pdf"
            >
              <Download className="h-4 w-4" />
              Download IRF Form
            </a>
          </Button>
          <Button asChild>
            <Link href="/expenses/new">
              <Plus className="h-4 w-4" />
              New IRF Claim
            </Link>
          </Button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No expense claims</h3>
            <p className="mt-1 text-sm text-gray-500">
              Submit an Internal Request Form (IRF) to claim expenses.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <Link href="/expenses/new">
                  <Plus className="h-4 w-4" />
                  New IRF Claim
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="/forms/irf-form.pdf"
                  download="IRF-Form-Uthabiti-Africa.pdf"
                >
                  <Download className="h-4 w-4" />
                  Download Form
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "Reference",
                  "Project",
                  "Purpose",
                  "Items",
                  "Amount",
                  "Date",
                  "Submitted By",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((exp) => {
                const status = EXPENSE_STATUS_CONFIG[exp.status] ?? {
                  label: exp.status,
                  variant: "secondary" as const,
                };
                return (
                  <tr key={exp.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {exp.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {exp.projectName ?? "—"}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-sm text-gray-600">
                      <span className="line-clamp-2">
                        {exp.purpose ?? exp.description ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {exp.lineItems.length > 0 ? exp.lineItems.length : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(exp.amount), exp.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(exp.expenseDate)}
                    </td>
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
