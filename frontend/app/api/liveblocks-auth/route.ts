import { NextRequest, NextResponse } from "next/server";
import { Liveblocks } from "@liveblocks/node";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY ?? "",
});

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "forbidden", reason: "Not authenticated" },
      { status: 403 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "forbidden", reason: "Invalid or expired session" },
      { status: 403 }
    );
  }

  let body: { room?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const room = body.room;
  if (!room || typeof room !== "string") {
    return NextResponse.json(
      { error: "forbidden", reason: "Room is required" },
      { status: 403 }
    );
  }

  const session = liveblocks.prepareSession(payload.userId, {
    userInfo: {
      name: payload.name ?? payload.email,
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { body: authBody, status } = await session.authorize();
  return new NextResponse(authBody, { status });
}
