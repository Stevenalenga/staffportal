import { jwtVerify, SignJWT } from "jose";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.MOBILE_JWT_SECRET ?? process.env.AUTH_SECRET ?? "fallback-secret"
);

export async function signMobileToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyMobileToken(
  req: NextRequest
): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
