
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/auth";

// GET: Fetch logged-in customer's orders
export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    await dbConnect();

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch orders" },
      { status: 500 }
    );
  }
}

// POST: Create a Cash on Delivery order
export async function POST(request) {
  let session;

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

    // 2. Get shipping address
    const { shippingAddress, paymentMethod } = await request.json();

    // 3. COD is the only supported method for now
    if (paymentMethod !== "cod") {
      return NextResponse.json(
        {
          success: false,
          message: "Only Cash on Delivery is currently supported",
        },
        { status: 400 }
      );
    }

    // 4. Validate shipping details
    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide complete shipping details",
        },
        { status: 400 }
      );
    }

    // 5. Start MongoDB transaction
    session = await mongoose.startSession();

    let createdOrder;

    await session.withTransaction(async () => {
      // 6. Find customer's cart
      const cart = await Cart.findOne({ user: user._id }).session(session);

      if (!cart || cart.items.length === 0) {
        const error = new Error("Your cart is empty");
        error.status = 400;
        throw error;
      }

      let subtotal = 0;
      const orderItems = [];

      // 7. Validate products and calculate prices from database
      for (const item of cart.items) {
        const product = await Product.findOne({
          _id: item.product,
          isActive: true,
        }).session(session);

        if (!product) {
          const error = new Error("A product in your cart is unavailable");
          error.status = 400;
          throw error;
        }

        if (item.quantity > product.stock) {
          const error = new Error(
            `Insufficient stock for ${product.name}`
          );
          error.status = 400;
          throw error;
        }

        // 8. Calculate subtotal using database price
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        // 9. Save product details as an order snapshot
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0],
          price: product.price,
          quantity: item.quantity,
        });

        // 10. Reduce stock safely
        const stockUpdate = await Product.updateOne(
          {
            _id: product._id,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session }
        );

        if (stockUpdate.modifiedCount !== 1) {
          const error = new Error(
            `Stock changed while placing order for ${product.name}`
          );
          error.status = 409;
          throw error;
        }
      }

      // 11. Temporary shipping charge
      // Change this when your shipping policy is finalized.
      const shippingCost = 0;
      const totalAmount = subtotal + shippingCost;

      // 12. Create order
      const orders = await Order.create(
        [
          {
            user: user._id,
            items: orderItems,
            shippingAddress: {
              fullName: shippingAddress.fullName.trim(),
              phone: shippingAddress.phone.trim(),
              address: shippingAddress.address.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              postalCode: shippingAddress.postalCode.trim(),
              country: shippingAddress.country.trim(),
            },
            subtotal,
            shippingCost,
            totalAmount,
            paymentMethod: "cod",
            paymentStatus: "pending",
            orderStatus: "pending",
          },
        ],
        { session }
      );

      createdOrder = orders[0];

      // 13. Clear customer's cart
      cart.items = [];
      await cart.save({ session });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to place order",
      },
      { status: error.status || 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
