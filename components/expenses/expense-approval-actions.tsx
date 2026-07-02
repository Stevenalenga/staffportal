"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Banknote, Loader2 } from "lucide-react";
import {
  canPerformAction,
  type ExpenseWorkflowAction,
} from "@/lib/expense-workflow";

interface Props {
  expenseId: string;
  status: string;
  userRole: string;
}

export function ExpenseApprovalActions({ expenseId, status, userRole }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const runAction = async (action: ExpenseWorkflowAction) => {
    if (action === "reject" && !reason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    setLoading(action);
    setError("");

    const res = await fetch(`/api/expenses/${expenseId}/workflow`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: reason.trim() || undefined }),
    });

    setLoading(null);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Action failed.");
      return;
    }

    setShowReject(false);
    setReason("");
    router.refresh();
  };

  const actions: {
    action: ExpenseWorkflowAction;
    label: string;
    icon: React.ElementType;
    className: string;
  }[] = [];

  if (canPerformAction(userRole, status, "finance_approve")) {
    actions.push({
      action: "finance_approve",
      label: "Finance Approve",
      icon: CheckCircle2,
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    });
  }
  if (canPerformAction(userRole, status, "ceo_approve")) {
    actions.push({
      action: "ceo_approve",
      label: "CEO Approve",
      icon: CheckCircle2,
      className: "bg-emerald-700 hover:bg-emerald-800 text-white",
    });
  }
  if (canPerformAction(userRole, status, "disburse")) {
    actions.push({
      action: "disburse",
      label: "Mark Disbursed",
      icon: Banknote,
      className: "bg-purple-600 hover:bg-purple-700 text-white",
    });
  }
  if (
    canPerformAction(userRole, status, "reject")
  ) {
    actions.push({
      action: "reject",
      label: "Reject",
      icon: XCircle,
      className: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    });
  }

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {showReject ? (
        <div className="space-y-2 rounded-lg border border-red-100 bg-red-50 p-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
            rows={2}
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => runAction("reject")}
              disabled={!!loading}
              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {loading === "reject" && <Loader2 className="h-3 w-3 animate-spin" />}
              Confirm Reject
            </button>
            <button
              onClick={() => { setShowReject(false); setReason(""); setError(""); }}
              className="rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map(({ action, label, icon: Icon, className }) => (
            <button
              key={action}
              onClick={() =>
                action === "reject" ? setShowReject(true) : runAction(action)
              }
              disabled={!!loading}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${className}`}
            >
              {loading === action ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
