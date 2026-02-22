import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { collections } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }
    const payload = verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }
    let user;
    try {
      user = await collections.users().findOne({ _id: new ObjectId(payload.userId) });
    } catch {
      user = null;
    }
    if (!user) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }
    const { passwordHash: _, ...profile } = user;
    return NextResponse.json({
      profile: {
        ...profile,
        _id: user._id != null ? String(user._id) : undefined,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}
