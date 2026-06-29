import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { z } from "zod";

const maintenanceSchema = z.object({
  assetId: z.string().min(1),
  type: z.enum(["DAMAGE", "REPAIR", "SERVICING", "INSPECTION", "OTHER"]),
  description: z.string().min(5, "Please describe the issue in detail"),
  date: z.string().min(1, "Date is required"),
  cost: z.coerce.number().optional(),
  vendor: z.string().optional(),
  markAsInMaintenance: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [records, assets] = await Promise.all([
    db.assetMaintenance.findMany({
      include: {
        asset: {
          select: { id: true, assetTag: true, name: true, brand: true, status: true },
        },
      },
      orderBy: { date: "desc" },
    }),
    db.asset.findMany({
      where: { status: { not: "RETIRED" } },
      orderBy: { assetTag: "asc" },
      select: { id: true, assetTag: true, name: true, brand: true, status: true },
    }),
  ]);

  const open = records.filter((r) => !r.completedAt).length;
  const completed = records.filter((r) => r.completedAt).length;

  return NextResponse.json({
    records,
    assets,
    summary: { total: records.length, open, completed },
  });
}

export async function POST(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = maintenanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { assetId, type, description, date, cost, vendor, markAsInMaintenance } =
      parsed.data;

    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const record = await db.assetMaintenance.create({
      data: {
        assetId,
        type,
        description,
        date: new Date(date),
        cost: cost ?? undefined,
        vendor: vendor ?? undefined,
      },
      include: {
        asset: {
          select: { id: true, assetTag: true, name: true, brand: true, status: true },
        },
      },
    });

    if (markAsInMaintenance) {
      await db.asset.update({
        where: { id: assetId },
        data: { status: "IN_MAINTENANCE" },
      });
    }

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("[api/mobile/assets/maintenance POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await verifyMobileToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, markCompleted } = await req.json();
    const record = await db.assetMaintenance.update({
      where: { id },
      data: { completedAt: markCompleted ? new Date() : null },
      include: {
        asset: {
          select: { id: true, assetTag: true, name: true, brand: true, status: true },
        },
      },
    });

    if (markCompleted) {
      await db.asset.update({
        where: { id: record.assetId },
        data: { status: "AVAILABLE" },
      });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error("[api/mobile/assets/maintenance PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
