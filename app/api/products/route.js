
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";

// GET: Display all active products
export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({ isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch products",
      },
      { status: 500 }
    );
  }
}

// POST: Add a product (admin only)
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

    // 3. Get product details
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      images,
      category,
      stock,
      brand,
      isFeatured,
    } = await request.json();

    // 4. Validate required fields
    if (
      !name?.trim() ||
      !slug?.trim() ||
      !description?.trim() ||
      price === undefined ||
      !images?.length ||
      !category ||
      stock === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required product details",
        },
        { status: 400 }
      );
    }

    // 5. Validate price and stock
    const productPrice = Number(price);
    const productStock = Number(stock);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid product price" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(productStock) || productStock < 0) {
      return NextResponse.json(
        { success: false, message: "Stock must be a non-negative integer" },
        { status: 400 }
      );
    }

    // 6. Validate category ID
    if (!mongoose.isValidObjectId(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // 7. Validate images
    if (
      !Array.isArray(images) ||
      images.length === 0 ||
      !images.every((image) => typeof image === "string" && image.trim())
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide valid image URLs" },
        { status: 400 }
      );
    }

    // 8. Normalize slug
    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    // 9. Check duplicate slug
    const existingProduct = await Product.findOne({
      slug: normalizedSlug,
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: "This product slug already exists" },
        { status: 409 }
      );
    }

    // 10. Create product
    const product = await Product.create({
      name: name.trim(),
      slug: normalizedSlug,
      description: description.trim(),
      price: productPrice,
      originalPrice:
        originalPrice === undefined || originalPrice === ""
          ? undefined
          : Number(originalPrice),
      images: images.map((image) => image.trim()),
      category,
      stock: productStock,
      brand: brand?.trim() || "",
      isFeatured: Boolean(isFeatured),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add product",
      },
      { status: 500 }
    );
  }
}
