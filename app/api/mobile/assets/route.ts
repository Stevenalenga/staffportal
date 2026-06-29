import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = await db.asset.findMany({
    orderBy: { assetTag: "asc" },
    select: {
      id: true,
      assetTag: true,
      classification: true,
      name: true,
      category: true,
      brand: true,
      model: true,
      serialNumber: true,
      purchaseDate: true,
      purchasePrice: true,
      supplier: true,
      location: true,
      staffInCharge: true,
      status: true,
      notes: true,
      assignments: {
        where: { returnedAt: null },
        orderBy: { assignedAt: "desc" },
        take: 1,
        select: { assignedAt: true, notes: true },
      },
    },
  });

  return NextResponse.json(assets);
}
