import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { z } from "zod";

const assignSchema = z.object({
  assetId: z.string().min(1),
  staffName: z.string().optional(),
  notes: z.string().optional(),
  action: z.enum(["assign", "transfer", "return"]),
});

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
      name: true,
      brand: true,
      model: true,
      location: true,
      staffInCharge: true,
      status: true,
      assignments: {
        where: { returnedAt: null },
        orderBy: { assignedAt: "desc" },
        take: 1,
        select: { assignedAt: true, notes: true },
      },
    },
  });

  const assigned = assets.filter((a) => a.status === "ASSIGNED").length;
  const available = assets.filter((a) => a.status === "AVAILABLE").length;

  return NextResponse.json({
    assets,
    summary: {
      total: assets.length,
      assigned,
      available,
    },
  });
}

export async function POST(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { assetId, staffName, notes, action } = parsed.data;

    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (action === "return") {
      await db.assetAssignment.updateMany({
        where: { assetId, returnedAt: null },
        data: { returnedAt: new Date(), notes: notes ?? undefined },
      });
      await db.asset.update({
        where: { id: assetId },
        data: { status: "AVAILABLE", staffInCharge: "" },
      });
      return NextResponse.json({ success: true, action: "returned" });
    }

    if (action === "transfer" || action === "assign") {
      if (!staffName?.trim()) {
        return NextResponse.json(
          { error: "Staff name is required" },
          { status: 400 }
        );
      }

      await db.assetAssignment.updateMany({
        where: { assetId, returnedAt: null },
        data: { returnedAt: new Date() },
      });

      await db.assetAssignment.create({
        data: {
          assetId,
          userId,
          notes: `Assigned to: ${staffName.trim()}${notes ? ` — ${notes}` : ""}`,
        },
      });

      await db.asset.update({
        where: { id: assetId },
        data: { status: "ASSIGNED", staffInCharge: staffName.trim() },
      });

      return NextResponse.json({ success: true, action });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[api/mobile/assets/assignments POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
