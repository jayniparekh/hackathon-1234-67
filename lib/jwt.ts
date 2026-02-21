import { createHmac } from "crypto";

/**
 * Simple JWT token utilities using HMAC
 * NOTE: For production, consider using a proper JWT library like jsonwebtoken
 */

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

function base64Encode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64Decode(str: string): string {
  const padded = str + "===".slice((str.length + 3) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">, expiresIn = 24 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const header = base64Encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Encode(JSON.stringify(tokenPayload));
  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    // Verify signature
    const expectedSignature = createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) return null;

    // Decode payload
    const payload = JSON.parse(base64Decode(body)) as JWTPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}
