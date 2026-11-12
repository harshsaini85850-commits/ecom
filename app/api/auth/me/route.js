
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // 1. Read cookies from the incoming request
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    // 2. Check whether token exists
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // 3. Check JWT secret
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    // 4. Verify JWT token
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 }
      );
    }

    // 5. Connect to MongoDB
    await dbConnect();

    // 6. Find user using ID stored in token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or account inactive",
        },
        { status: 401 }
      );
    }

    // 7. Return logged-in user details
    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Authentication check error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
