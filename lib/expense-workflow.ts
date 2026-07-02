export const EXPENSE_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "warning" | "info" | "destructive" | "outline";
    stage: number;
  }
> = {
  DRAFT: { label: "Draft", variant: "secondary", stage: 0 },
  SUBMITTED: {
    label: "Pending Finance",
    variant: "warning",
    stage: 1,
  },
  FINANCE_APPROVED: {
    label: "Pending CEO",
    variant: "info",
    stage: 2,
  },
  APPROVED: { label: "Approved", variant: "default", stage: 3 },
  DISBURSED: { label: "Disbursed", variant: "default", stage: 4 },
  REJECTED: { label: "Rejected", variant: "destructive", stage: -1 },
};

export const APPROVAL_STAGES = [
  { key: "finance", label: "Finance Controller", status: "SUBMITTED" },
  { key: "ceo", label: "CEO", status: "FINANCE_APPROVED" },
  { key: "approved", label: "Approved", status: "APPROVED" },
  { key: "disbursed", label: "Disbursed", status: "DISBURSED" },
] as const;

export type ExpenseWorkflowAction =
  | "finance_approve"
  | "ceo_approve"
  | "reject"
  | "disburse";

export function canPerformAction(
  role: string,
  status: string,
  action: ExpenseWorkflowAction
): boolean {
  const isFinance = role === "FINANCE" || role === "IT_ADMIN";
  const isCeo = role === "CEO" || role === "IT_ADMIN";

  switch (action) {
    case "finance_approve":
      return isFinance && status === "SUBMITTED";
    case "ceo_approve":
      return isCeo && status === "FINANCE_APPROVED";
    case "reject":
      if (status === "SUBMITTED") return isFinance;
      if (status === "FINANCE_APPROVED") return isCeo;
      return false;
    case "disburse":
      return isFinance && status === "APPROVED";
    default:
      return false;
  }
}

export function getPendingStatusesForRole(role: string): string[] {
  if (role === "CEO" || role === "IT_ADMIN") {
    return ["SUBMITTED", "FINANCE_APPROVED", "APPROVED"];
  }
  if (role === "FINANCE" || role === "IT_ADMIN") {
    return ["SUBMITTED", "FINANCE_APPROVED", "APPROVED"];
  }
  return [];
}

export const PENDING_APPROVAL_STATUSES = ["SUBMITTED", "FINANCE_APPROVED", "APPROVED"];
