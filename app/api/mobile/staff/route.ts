import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await db.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, email: true, image: true,
      role: true, employeeId: true, employmentStatus: true,
      department: { select: { name: true } },
      position: { select: { title: true } },
    },
  });

  return NextResponse.json(staff);
}
