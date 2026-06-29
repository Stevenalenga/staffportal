import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const assignSchema = z.object({
  assetId: z.string().min(1),
  staffName: z.string().min(1, "Staff name is required"),
  notes: z.string().optional(),
  action: z.enum(["assign", "transfer", "return"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { assetId, staffName, notes, action } = parsed.data;

    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    if (action === "return") {
      // Close all open assignments for this asset
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
      // Close any existing open assignment first
      await db.assetAssignment.updateMany({
        where: { assetId, returnedAt: null },
        data: { returnedAt: new Date() },
      });

      // Find or create a placeholder user record for the staff name
      // We use the staffInCharge string field on Asset for display
      // and create a simple assignment record using the session user as proxy
      const sessionUser = await db.user.findUnique({
        where: { email: session.user?.email ?? "" },
      });

      if (sessionUser) {
        await db.assetAssignment.create({
          data: {
            assetId,
            userId: sessionUser.id,
            notes: `Assigned to: ${staffName}${notes ? ` — ${notes}` : ""}`,
          },
        });
      }

      await db.asset.update({
        where: { id: assetId },
        data: { status: "ASSIGNED", staffInCharge: staffName },
      });

      return NextResponse.json({ success: true, action });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[api/assets/assignments POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
