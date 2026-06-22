import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isManager = ["CEO", "FINANCE", "OPERATIONS"].includes(user?.role ?? "");

  const expenses = await db.expense.findMany({
    where: isManager ? undefined : { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, title: true, amount: true, currency: true,
      status: true, expenseDate: true,
      user: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return NextResponse.json(
    expenses.map((e) => ({ ...e, amount: Number(e.amount) }))
  );
}
