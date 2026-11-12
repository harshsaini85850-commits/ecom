
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";

// PATCH: Update an existing product (admin only)
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

    // 2. Get product ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await dbConnect();

    // 4. Find product
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // 5. Read updated details
    const data = await request.json();

    // 6. Update name
    if (data.name !== undefined) {
      if (typeof data.name !== "string" || !data.name.trim()) {
        return NextResponse.json(
          { success: false, message: "Invalid product name" },
          { status: 400 }
        );
      }

      product.name = data.name.trim();
    }

    // 7. Update slug
    if (data.slug !== undefined) {
      if (typeof data.slug !== "string" || !data.slug.trim()) {
        return NextResponse.json(
          { success: false, message: "Invalid product slug" },
          { status: 400 }
        );
      }

      const normalizedSlug = data.slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const duplicateSlug = await Product.findOne({
        slug: normalizedSlug,
        _id: { $ne: id },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, message: "This slug is already in use" },
          { status: 409 }
        );
      }

      product.slug = normalizedSlug;
    }

    // 8. Update description
    if (data.description !== undefined) {
      if (
        typeof data.description !== "string" ||
        !data.description.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid product description" },
          { status: 400 }
        );
      }

      product.description = data.description.trim();
    }

    // 9. Update price
    if (data.price !== undefined) {
      const price = Number(data.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid product price" },
          { status: 400 }
        );
      }

      product.price = price;
    }

    // 10. Update original price
    if (data.originalPrice !== undefined) {
      if (data.originalPrice === null || data.originalPrice === "") {
        product.originalPrice = undefined;
      } else {
        const originalPrice = Number(data.originalPrice);

        if (!Number.isFinite(originalPrice) || originalPrice < 0) {
          return NextResponse.json(
            { success: false, message: "Invalid original price" },
            { status: 400 }
          );
        }

        product.originalPrice = originalPrice;
      }
    }

    // 11. Update stock
    if (data.stock !== undefined) {
      const stock = Number(data.stock);

      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json(
          { success: false, message: "Stock must be a non-negative integer" },
          { status: 400 }
        );
      }

      product.stock = stock;
    }

    // 12. Update images
    if (data.images !== undefined) {
      if (
        !Array.isArray(data.images) ||
        data.images.length === 0 ||
        !data.images.every(
          (image) => typeof image === "string" && image.trim()
        )
      ) {
        return NextResponse.json(
          { success: false, message: "Please provide valid image URLs" },
          { status: 400 }
        );
      }

      product.images = data.images.map((image) => image.trim());
    }

    // 13. Update category
    if (data.category !== undefined) {
      if (!mongoose.isValidObjectId(data.category)) {
        return NextResponse.json(
          { success: false, message: "Invalid category ID" },
          { status: 400 }
        );
      }

      const categoryExists = await Category.findById(data.category);

      if (!categoryExists) {
        return NextResponse.json(
          { success: false, message: "Category not found" },
          { status: 404 }
        );
      }

      product.category = data.category;
    }

    // 14. Update brand
    if (data.brand !== undefined) {
      if (typeof data.brand !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid brand" },
          { status: 400 }
        );
      }

      product.brand = data.brand.trim();
    }

    // 15. Update featured status
    if (data.isFeatured !== undefined) {
      if (typeof data.isFeatured !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid featured status" },
          { status: 400 }
        );
      }

      product.isFeatured = data.isFeatured;
    }

    // 16. Save changes
    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update product",
      },
      { status: 500 }
    );
  }
}

// DELETE: Soft-delete a product (admin only)
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

    // 2. Get product ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await dbConnect();

    // 4. Mark product as inactive
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product removed from storefront successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete product",
      },
      { status: 500 }
    );
  }
}
