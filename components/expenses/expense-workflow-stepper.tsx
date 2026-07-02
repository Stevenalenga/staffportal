import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

type StageState = "complete" | "active" | "pending";

function getStageState(status: string, stageIndex: number): StageState {
  if (status === "REJECTED" || status === "DRAFT") return "pending";

  const stageMap: Record<string, number> = {
    SUBMITTED: 0,
    FINANCE_APPROVED: 1,
    APPROVED: 2,
    DISBURSED: 3,
  };

  const current = stageMap[status] ?? -1;
  if (current > stageIndex) return "complete";
  if (current === stageIndex) {
    // At APPROVED, stage 2 (Approved) is complete; stage 3 (Disbursed) is active
    if (status === "APPROVED" && stageIndex === 2) return "complete";
    if (status === "APPROVED" && stageIndex === 3) return "active";
    return "active";
  }
  return "pending";
}

const STAGES = [
  "Finance Controller",
  "CEO",
  "Approved",
  "Disbursed",
];

export function ExpenseWorkflowStepper({ status }: { status: string }) {
  if (status === "DRAFT") {
    return <span className="text-xs text-gray-400 italic">Not yet submitted</span>;
  }

  if (status === "REJECTED") {
    return <span className="text-xs font-medium text-red-600">Rejected</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {STAGES.map((label, i) => {
        const state = getStageState(status, i);
        return (
          <div key={label} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
                state === "complete" && "bg-emerald-50 text-emerald-700",
                state === "active" && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                state === "pending" && "bg-gray-50 text-gray-400"
              )}
            >
              {state === "complete" && <CheckCircle2 className="h-3 w-3" />}
              {label}
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-gray-300 text-xs">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
