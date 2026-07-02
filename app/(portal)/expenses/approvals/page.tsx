import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EXPENSE_STATUS_CONFIG } from "@/lib/expense-workflow";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExpenseWorkflowStepper } from "@/components/expenses/expense-workflow-stepper";
import { ExpenseApprovalActions } from "@/components/expenses/expense-approval-actions";
import { Clock, CheckCircle2, Banknote, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Expense Approvals" };

const APPROVER_ROLES = ["CEO", "FINANCE", "IT_ADMIN"];

type ExpenseWithRelations = Awaited<ReturnType<typeof fetchExpenses>>[number];

async function fetchExpenses() {
  return db.expense.findMany({
    where: {
      status: { not: "DRAFT" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      category: { select: { name: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
      financeApprover: { select: { name: true } },
      ceoApprover: { select: { name: true } },
      disburser: { select: { name: true } },
    },
  });
}

function ExpenseApprovalCard({
  expense,
  userRole,
}: {
  expense: ExpenseWithRelations;
  userRole: string;
}) {
  const status =
    EXPENSE_STATUS_CONFIG[expense.status] ?? {
      label: expense.status,
      variant: "secondary" as const,
    };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-900">{expense.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {expense.user.name} · {formatDate(expense.expenseDate)} ·{" "}
            {expense.projectName ?? "No project"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(Number(expense.amount), expense.currency)}
          </p>
          <Badge variant={status.variant} className="mt-1">
            {status.label}
          </Badge>
        </div>
      </div>

      {expense.purpose && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{expense.purpose}</p>
      )}

      <div className="mb-4 overflow-x-auto">
        <ExpenseWorkflowStepper status={expense.status} />
      </div>

      {/* Line items summary */}
      {expense.lineItems.length > 0 && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
            {expense.lineItems.length} line item{expense.lineItems.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-1">
            {expense.lineItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-gray-600">
                <span className="truncate flex-1 mr-2">{item.specification}</span>
                <span className="font-medium">{formatCurrency(Number(item.cost))}</span>
              </div>
            ))}
            {expense.lineItems.length > 3 && (
              <p className="text-xs text-gray-400">
                +{expense.lineItems.length - 3} more…
              </p>
            )}
          </div>
        </div>
      )}

      {/* Approval audit trail */}
      <div className="grid gap-1 text-xs text-gray-500 mb-4 sm:grid-cols-2">
        {expense.financeApprover && expense.financeApprovedAt && (
          <p>
            Finance: <span className="text-gray-700">{expense.financeApprover.name}</span>{" "}
            · {formatDate(expense.financeApprovedAt)}
          </p>
        )}
        {expense.ceoApprover && expense.ceoApprovedAt && (
          <p>
            CEO: <span className="text-gray-700">{expense.ceoApprover.name}</span>{" "}
            · {formatDate(expense.ceoApprovedAt)}
          </p>
        )}
        {expense.disburser && expense.disbursedAt && (
          <p>
            Disbursed: <span className="text-gray-700">{expense.disburser.name}</span>{" "}
            · {formatDate(expense.disbursedAt)}
          </p>
        )}
        {expense.rejectionReason && (
          <p className="text-red-600 sm:col-span-2">
            Rejection reason: {expense.rejectionReason}
          </p>
        )}
      </div>

      <ExpenseApprovalActions
        expenseId={expense.id}
        status={expense.status}
        userRole={userRole}
      />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  children,
  accent,
}: {
  title: string;
  icon: React.ElementType;
  count: number;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <section>
      <div className={`flex items-center gap-2 mb-3 ${accent}`}>
        <Icon className="h-4 w-4" />
        <h2 className="text-sm font-semibold">
          {title} ({count})
        </h2>
      </div>
      {count === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-8 text-center text-sm text-gray-400">
          No claims in this stage
        </div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}

export default async function ExpenseApprovalsPage() {
  const session = await auth();
  const role = session?.user?.role ?? "";

  if (!APPROVER_ROLES.includes(role)) {
    redirect("/expenses");
  }

  const expenses = await fetchExpenses();

  const pendingFinance = expenses.filter((e) => e.status === "SUBMITTED");
  const pendingCeo = expenses.filter((e) => e.status === "FINANCE_APPROVED");
  const approvedAwaitingDisbursement = expenses.filter((e) => e.status === "APPROVED");
  const disbursed = expenses.filter((e) => e.status === "DISBURSED");
  const rejected = expenses.filter((e) => e.status === "REJECTED");

  const pendingTotal = pendingFinance.length + pendingCeo.length + approvedAwaitingDisbursement.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expense Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Finance Controller → CEO → Approved → Disbursed
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Pending Finance",
            value: pendingFinance.length,
            color: "text-amber-600",
          },
          {
            label: "Pending CEO",
            value: pendingCeo.length,
            color: "text-blue-600",
          },
          {
            label: "Awaiting Disbursement",
            value: approvedAwaitingDisbursement.length,
            color: "text-emerald-600",
          },
          {
            label: "Disbursed",
            value: disbursed.length,
            color: "text-purple-600",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {pendingTotal === 0 && disbursed.length === 0 && rejected.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No claims to review</h3>
          <p className="mt-1 text-sm text-gray-500">
            Submitted IRF expense claims will appear here for approval.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <Section
            title="Pending Finance Controller Review"
            icon={Clock}
            count={pendingFinance.length}
            accent="text-amber-700"
          >
            {pendingFinance.map((exp) => (
              <ExpenseApprovalCard key={exp.id} expense={exp} userRole={role} />
            ))}
          </Section>

          <Section
            title="Pending CEO Approval"
            icon={CheckCircle2}
            count={pendingCeo.length}
            accent="text-blue-700"
          >
            {pendingCeo.map((exp) => (
              <ExpenseApprovalCard key={exp.id} expense={exp} userRole={role} />
            ))}
          </Section>

          <Section
            title="Approved — Awaiting Disbursement"
            icon={Banknote}
            count={approvedAwaitingDisbursement.length}
            accent="text-emerald-700"
          >
            {approvedAwaitingDisbursement.map((exp) => (
              <ExpenseApprovalCard key={exp.id} expense={exp} userRole={role} />
            ))}
          </Section>

          {disbursed.length > 0 && (
            <Section
              title="Disbursed"
              icon={Banknote}
              count={disbursed.length}
              accent="text-purple-700"
            >
              {disbursed.map((exp) => (
                <ExpenseApprovalCard key={exp.id} expense={exp} userRole={role} />
              ))}
            </Section>
          )}

          {rejected.length > 0 && (
            <Section
              title="Rejected"
              icon={XCircle}
              count={rejected.length}
              accent="text-red-700"
            >
              {rejected.map((exp) => (
                <ExpenseApprovalCard key={exp.id} expense={exp} userRole={role} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
