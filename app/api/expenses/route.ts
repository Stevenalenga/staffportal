import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const lineItemSchema = z.object({
  itemDate: z.string().optional(),
  specification: z.string().min(1, "Specification is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unitCost: z.coerce.number().min(0, "Unit cost must be 0 or more"),
});

const irfSchema = z.object({
  projectName: z.string().min(1, "Project is required"),
  purpose: z.string().min(1, "Purpose is required"),
  expenseDate: z.string().min(1, "Date is required"),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
  submit: z.boolean().optional(),
  notes: z.string().optional(),
});

async function getOrCreateIrfCategory() {
  return db.expenseCategory.upsert({
    where: { code: "IRF" },
    update: {},
    create: {
      code: "IRF",
      name: "Internal Request",
      description: "Internal Request Form (IRF) expense claims",
    },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isManager = ["CEO", "FINANCE", "OPERATIONS", "IT_ADMIN"].includes(
    session.user.role ?? ""
  );

  const expenses = await db.expense.findMany({
    where: isManager ? undefined : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      category: { select: { name: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = irfSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { projectName, purpose, expenseDate, lineItems, submit, notes } =
      parsed.data;

    const category = await getOrCreateIrfCategory();

    const computedItems = lineItems.map((item, index) => {
      const cost = item.quantity * item.unitCost;
      return {
        itemDate: item.itemDate ? new Date(item.itemDate) : null,
        specification: item.specification,
        quantity: item.quantity,
        unitCost: item.unitCost,
        cost,
        sortOrder: index,
      };
    });

    const total = computedItems.reduce((sum, item) => sum + item.cost, 0);

    const expense = await db.expense.create({
      data: {
        userId: session.user.id,
        categoryId: category.id,
        title: `IRF — ${projectName}`,
        description: purpose,
        projectName,
        purpose,
        amount: total,
        currency: "KES",
        expenseDate: new Date(expenseDate),
        status: submit ? "SUBMITTED" : "DRAFT",
        notes: notes ?? undefined,
        lineItems: {
          create: computedItems,
        },
      },
      include: {
        lineItems: { orderBy: { sortOrder: "asc" } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    console.error("[api/expenses POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
