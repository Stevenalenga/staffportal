import { NextRequest, NextResponse } from "next/server";
import { PENDING_APPROVAL_STATUSES } from "@/lib/expense-workflow";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalStaff, activeStaff, totalAssets, assignedAssets,
    pendingExpenses, activeProjects, pendingLeave, openTasks,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { employmentStatus: "ACTIVE" } }),
    db.asset.count(),
    db.asset.count({ where: { status: "ASSIGNED" } }),
    db.expense.count({
      where: {
        status: {
          in: PENDING_APPROVAL_STATUSES as unknown as (
            | "SUBMITTED"
            | "FINANCE_APPROVED"
            | "APPROVED"
          )[],
        },
      },
    }),
    db.project.count({ where: { status: "ACTIVE" } }),
    db.leave.count({ where: { status: "PENDING" } }),
    db.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
  ]);

  return NextResponse.json({
    totalStaff, activeStaff, totalAssets, assignedAssets,
    pendingExpenses, activeProjects, pendingLeave, openTasks,
  });
}
