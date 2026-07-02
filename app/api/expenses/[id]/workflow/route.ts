import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";
import { canPerformAction, type ExpenseWorkflowAction } from "@/lib/expense-workflow";

const workflowSchema = z.object({
  action: z.enum(["finance_approve", "ceo_approve", "reject", "disburse"]),
  reason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role ?? "";
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = workflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { action, reason } = parsed.data;

    const expense = await db.expense.findUnique({ where: { id } });
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    if (!canPerformAction(role, expense.status, action as ExpenseWorkflowAction)) {
      return NextResponse.json(
        { error: "You are not allowed to perform this action at the current stage." },
        { status: 403 }
      );
    }

    const now = new Date();
    const userId = session.user.id;

    let data: Record<string, unknown> = {};

    switch (action) {
      case "finance_approve":
        data = {
          status: "FINANCE_APPROVED",
          financeApprovedById: userId,
          financeApprovedAt: now,
        };
        break;
      case "ceo_approve":
        data = {
          status: "APPROVED",
          ceoApprovedById: userId,
          ceoApprovedAt: now,
        };
        break;
      case "reject":
        data = {
          status: "REJECTED",
          rejectedById: userId,
          rejectedAt: now,
          rejectionReason: reason ?? undefined,
        };
        break;
      case "disburse":
        data = {
          status: "DISBURSED",
          disbursedById: userId,
          disbursedAt: now,
        };
        break;
    }

    const updated = await db.expense.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, email: true } },
        category: { select: { name: true } },
        lineItems: { orderBy: { sortOrder: "asc" } },
        financeApprover: { select: { name: true } },
        ceoApprover: { select: { name: true } },
        disburser: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/expenses/[id]/workflow PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
