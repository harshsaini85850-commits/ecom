
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";

// PATCH: Update category (admin only)
export async function PATCH(request, { params }) {
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

    // 2. Validate category ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. Find category
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // 4. Get updated details
    const data = await request.json();

    // 5. Update name
    if (data.name !== undefined) {
      if (typeof data.name !== "string" || !data.name.trim()) {
        return NextResponse.json(
          { success: false, message: "Invalid category name" },
          { status: 400 }
        );
      }

      const duplicateName = await Category.findOne({
        name: data.name.trim(),
        _id: { $ne: id },
      });

      if (duplicateName) {
        return NextResponse.json(
          { success: false, message: "Category name already exists" },
          { status: 409 }
        );
      }

      category.name = data.name.trim();
    }

    // 6. Update slug
    if (data.slug !== undefined) {
      if (typeof data.slug !== "string" || !data.slug.trim()) {
        return NextResponse.json(
          { success: false, message: "Invalid category slug" },
          { status: 400 }
        );
      }

      const normalizedSlug = data.slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const duplicateSlug = await Category.findOne({
        slug: normalizedSlug,
        _id: { $ne: id },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, message: "Category slug already exists" },
          { status: 409 }
        );
      }

      category.slug = normalizedSlug;
    }

    // 7. Update description
    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid description" },
          { status: 400 }
        );
      }

      category.description = data.description.trim();
    }

    // 8. Update image
    if (data.image !== undefined) {
      if (typeof data.image !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid image URL" },
          { status: 400 }
        );
      }

      category.image = data.image.trim();
    }

    // 9. Save changes
    await category.save();

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update category",
      },
      { status: 500 }
    );
  }
}

// DELETE: Soft-delete category (admin only)
export async function DELETE(request, { params }) {
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

    // 2. Validate category ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. Check whether products use this category
    const Product = (await import("@/models/Product")).default;

    const linkedProducts = await Product.countDocuments({
      category: id,
      isActive: true,
    });

    if (linkedProducts > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete category while active products use it",
        },
        { status: 409 }
      );
    }

    // 4. Soft-delete category
    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete category",
      },
      { status: 500 }
    );
  }
}
