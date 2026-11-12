
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getAuthUser } from "@/lib/auth";

// PATCH: Update product quantity in cart
export async function PATCH(request, { params }) {
  try {
    // 1. Check login
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    // 2. Get product ID from URL
    const { productId } = await params;

    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. Get new quantity
    const { quantity } = await request.json();

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive integer",
        },
        { status: 400 }
      );
    }

    // 4. Find product
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product is unavailable" },
        { status: 404 }
      );
    }

    // 5. Check available stock
    if (quantity > product.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${product.stock} items are available`,
        },
        { status: 400 }
      );
    }

    // 6. Find customer's cart
    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    // 7. Find product inside cart
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Product is not in your cart" },
        { status: 404 }
      );
    }

    // 8. Update quantity
    cartItem.quantity = quantity;

    await cart.save();

    // 9. Populate product details
    await cart.populate({
      path: "items.product",
      select: "name slug price images stock isActive",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cart quantity updated successfully",
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update cart error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update cart" },
      { status: 500 }
    );
  }
}

// DELETE: Remove product from cart
export async function DELETE(request, { params }) {
  try {
    // 1. Check login
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    // 2. Get product ID
    const { productId } = await params;

    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. Find customer's cart
    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    // 4. Check whether product exists in cart
    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return NextResponse.json(
        { success: false, message: "Product is not in your cart" },
        { status: 404 }
      );
    }

    // 5. Remove product from cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    // 6. Populate remaining products
    await cart.populate({
      path: "items.product",
      select: "name slug price images stock isActive",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product removed from cart successfully",
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove cart item error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to remove product from cart" },
      { status: 500 }
    );
  }
}
