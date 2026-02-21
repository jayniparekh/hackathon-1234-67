import { NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { generateToken } from "@/lib/jwt";
import { z } from "zod";

const signinSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signinSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 422 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await collections.users().findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // TODO: Generate JWT token
    const userId = String(user._id);

    // Generate JWT token
    const token = generateToken({
      userId,
      email: user.email,
      name: user.name,
    });

    // Create response with token as httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Sign in successful",
        userId,
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
      { status: 200 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (e) {
    console.error("Sign in error:", e);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
