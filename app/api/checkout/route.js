
import { NextResponse } from "next/server";

import dbConnect from "@/lib/mongodb";
import stripe from "@/lib/stripe";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getAuthUser } from "@/lib/auth";

export async function POST() {
  try {
    // 1. Check customer login
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Find customer's cart
    const cart = await Cart.findOne({ user: user._id });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty" },
        { status: 400 }
      );
    }

    // 3. Prepare Stripe line items using database prices
    const lineItems = [];

    for (const item of cart.items) {
      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
      });

      if (!product) {
        return NextResponse.json(
          { success: false, message: "A product in your cart is unavailable" },
          { status: 400 }
        );
      }

      if (item.quantity > product.stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}`,
          },
          { status: 400 }
        );
      }

      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: product.images?.[0] ? [product.images[0]] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // 4. Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_BASE_URL");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: user.email,
      client_reference_id: user._id.toString(),
      metadata: {
        userId: user._id.toString(),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    // 5. Return checkout URL
    return NextResponse.json(
      {
        success: true,
        checkoutUrl: session.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to start checkout",
      },
      { status: 500 }
    );
  }
}
