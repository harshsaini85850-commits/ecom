
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function getAuthUser() {
  try {
    // 1. Read authentication cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return null;
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Connect to database
    await dbConnect();

    // 4. Find user
    const user = await User.findById(decoded.userId).select("-password");

    // 5. Check account status
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Authentication helper error:", error);
    return null;
  }
}

export async function isAdmin() {
  const user = await getAuthUser();

  return user?.role === "admin";
}
