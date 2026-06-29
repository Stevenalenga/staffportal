import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const updateSchema = z.object({
  assetTag: z.string().min(1).optional(),
  classification: z.string().optional(),
  name: z.string().min(1).optional(),
  category: z.enum([
    "LAPTOP", "DESKTOP", "MOBILE_PHONE", "FURNITURE", "PRINTER",
    "PROJECTOR", "NETWORK_EQUIPMENT", "SOFTWARE_LICENCE", "OTHER",
  ]).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentReference: z.string().optional(),
  staffInCharge: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_MAINTENANCE", "RETIRED", "LOST"]).optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { purchaseDate, ...rest } = parsed.data;

    const asset = await db.asset.update({
      where: { id },
      data: {
        ...rest,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      },
    });

    return NextResponse.json(asset);
  } catch (err) {
    console.error("[api/assets PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db.asset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
