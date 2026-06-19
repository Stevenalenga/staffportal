import { Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";

type Expense = {
  id: string;
  title: string;
  amount: string | number | { toFixed: (n: number) => string };
  currency: string;
  status: string;
  expenseDate: Date;
  user: { name: string | null; image: string | null };
  category: { name: string };
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "warning" | "info" | "destructive" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  PAID: { label: "Paid", variant: "default" },
};

export function RecentActivity({ expenses }: { expenses: Expense[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Recent Expense Claims
          </CardTitle>
          <CardDescription>Latest expense submissions</CardDescription>
        </div>
        <Link
          href="/expenses"
          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No expense claims yet</p>
            <Link
              href="/expenses"
              className="mt-2 text-xs text-emerald-600 hover:underline"
            >
              Submit your first expense
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.map((expense) => {
              const status = statusConfig[expense.status] ?? {
                label: expense.status,
                variant: "secondary" as const,
              };
              const amount =
                typeof expense.amount === "object"
                  ? parseFloat(expense.amount.toFixed(2))
                  : Number(expense.amount);

              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 py-3"
                >
                  <Avatar
                    src={expense.user.image}
                    fallback={expense.user.name ?? "?"}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {expense.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.user.name} · {expense.category.name} ·{" "}
                      {formatDate(expense.expenseDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(amount, expense.currency)}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
