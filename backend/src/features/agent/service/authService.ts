import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthError } from "../types/agent";

const BCRYPT_COST = 12;
const JWT_TTL = "7d";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** امضای توکن برای یک agentId — امضای ساده و بدون ابهام */
export function signToken(agentId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AuthError("کلید امضا (JWT_SECRET) تنظیم نشده است.", 500);
  return jwt.sign({ sub: agentId }, secret, { expiresIn: JWT_TTL });
}

/** اعتبارسنجی توکن و برگرداندن agentId */
export function verifyToken(token: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AuthError("کلید امضا (JWT_SECRET) تنظیم نشده است.", 500);

  try {
    const payload = jwt.verify(token, secret) as { sub?: string };
    if (!payload.sub) throw new Error("بدون subject");
    return payload.sub;
  } catch {
    throw new AuthError("نشست شما منقضی شده است. دوباره وارد شوید.", 401);
  }
}
