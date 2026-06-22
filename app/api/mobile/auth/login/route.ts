import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email: rawEmail, password } = parsed.data;
    const email = rawEmail.trim().toLowerCase();
    const user = await db.user.findUnique({
      where: { email },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.employmentStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 403 }
      );
    }

    const token = await signMobileToken(user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
      },
    });
  } catch (err) {
    console.error("[mobile/auth/login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
