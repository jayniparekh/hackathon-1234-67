import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the authToken cookie
    response.cookies.set("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  } catch (e) {
    console.error("Logout error:", e);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
