import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await db.task.findMany({
    where: {
      status: { notIn: ["DONE", "CANCELLED"] },
      OR: [{ assigneeId: userId }, { creatorId: userId }],
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    select: {
      id: true, title: true, description: true, priority: true,
      status: true, dueDate: true,
      project: { select: { name: true, code: true } },
      assignee: { select: { name: true } },
    },
  });

  return NextResponse.json(tasks);
}
