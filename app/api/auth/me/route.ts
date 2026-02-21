import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        user: {
          userId: payload.userId,
          email: payload.email,
          name: payload.name,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Get user error:", e);
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}
