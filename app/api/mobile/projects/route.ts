import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, code: true, description: true,
      status: true, startDate: true, endDate: true, funder: true,
      _count: { select: { members: true, tasks: true, milestones: true } },
    },
  });

  return NextResponse.json(projects);
}
