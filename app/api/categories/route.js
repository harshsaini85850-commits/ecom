
import { NextResponse } from "next/server";

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";

// GET: Fetch active categories
export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        categories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch categories",
      },
      { status: 500 }
    );
  }
}

// POST: Create category (admin only)
export async function POST(request) {
  try {
    // 1. Check admin authorization
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // 2. Connect to database
    await dbConnect();

    // 3. Get category details
    const { name, slug, description, image } = await request.json();

    // 4. Validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name and slug are required",
        },
        { status: 400 }
      );
    }

    // 5. Normalize slug
    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    // 6. Check duplicate name or slug
    const existingCategory = await Category.findOne({
      $or: [
        { name: name.trim() },
        { slug: normalizedSlug },
      ],
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name or slug already exists",
        },
        { status: 409 }
      );
    }

    // 7. Create category
    const category = await Category.create({
      name: name.trim(),
      slug: normalizedSlug,
      description: description?.trim() || "",
      image: image?.trim() || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create category",
      },
      { status: 500 }
    );
  }
}
