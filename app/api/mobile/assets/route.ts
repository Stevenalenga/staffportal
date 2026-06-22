import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = await db.asset.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, assetTag: true, name: true, category: true,
      brand: true, model: true, status: true, purchaseDate: true,
      assignments: {
        where: { returnedAt: null },
        select: { user: { select: { name: true } } },
        take: 1,
      },
    },
  });

  return NextResponse.json(assets);
}
