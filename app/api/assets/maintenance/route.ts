import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = maintenanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { assetId, type, description, date, cost, vendor, markAsInMaintenance } = parsed.data;

    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    const record = await db.assetMaintenance.create({
      data: {
        assetId,
        type,
        description,
        date: new Date(date),
        cost: cost ?? undefined,
        vendor: vendor ?? undefined,
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
    console.error("[api/assets/maintenance POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, markCompleted } = await req.json();
    const record = await db.assetMaintenance.update({
      where: { id },
      data: { completedAt: markCompleted ? new Date() : null },
      include: { asset: true },
    });

    if (markCompleted) {
      await db.asset.update({
        where: { id: record.assetId },
        data: { status: "AVAILABLE" },
      });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error("[api/assets/maintenance PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
