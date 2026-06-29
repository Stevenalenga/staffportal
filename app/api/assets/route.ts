import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const assetSchema = z.object({
  assetTag: z.string().min(1),
  classification: z.string().optional(),
  name: z.string().min(1),
  category: z.enum([
    "LAPTOP", "DESKTOP", "MOBILE_PHONE", "FURNITURE", "PRINTER",
    "PROJECTOR", "NETWORK_EQUIPMENT", "SOFTWARE_LICENCE", "OTHER",
  ]),
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
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_MAINTENANCE", "RETIRED", "LOST"]).default("AVAILABLE"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = assetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { purchaseDate, ...rest } = parsed.data;

    const existing = await db.asset.findUnique({ where: { assetTag: rest.assetTag } });
    if (existing) {
      return NextResponse.json({ error: "Asset tag already exists" }, { status: 409 });
    }

    const asset = await db.asset.create({
      data: {
        ...rest,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (err) {
    console.error("[api/assets POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await db.asset.findMany({ orderBy: { assetTag: "asc" } });
  return NextResponse.json(assets);
}
