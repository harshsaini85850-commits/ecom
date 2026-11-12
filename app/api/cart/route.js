
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getAuthUser } from "@/lib/auth";

// GET: View logged-in customer's cart
export async function GET() {
  try {
    // 1. Check login
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Find customer's cart
    const cart = await Cart.findOne({ user: user._id })
      .populate({
        path: "items.product",
        select: "name slug price images stock isActive",
      });

    if (!cart) {
      return NextResponse.json(
        {
          success: true,
          message: "Your cart is empty",
          cart: { items: [] },
        },
        { status: 200 }
      );
    }

    // 3. Return cart
    return NextResponse.json(
      {
        success: true,
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get cart error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch cart" },
      { status: 500 }
    );
  }
}

// POST: Add product to cart
export async function POST(request) {
  try {
    // 1. Check login
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Get product details
    const { productId, quantity = 1 } = await request.json();

    // 3. Validate product ID
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // 4. Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    // 5. Find product
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    // 6. Check stock
    if (quantity > product.stock) {
      return NextResponse.json(
        { success: false, message: "Not enough stock available" },
        { status: 400 }
      );
    }

    // 7. Find or create customer's cart
    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = new Cart({
        user: user._id,
        items: [],
      });
    }

    // 8. Check whether product is already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return NextResponse.json(
          {
            success: false,
            message: "Requested quantity exceeds available stock",
          },
          { status: 400 }
        );
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    // 9. Save cart
    await cart.save();

    // 10. Populate product details
    await cart.populate({
      path: "items.product",
      select: "name slug price images stock isActive",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added to cart successfully",
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add to cart error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to add product to cart" },
      { status: 500 }
    );
  }
}
