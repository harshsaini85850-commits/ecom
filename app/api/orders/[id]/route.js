
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/auth";

// GET: View individual order
export async function GET(request, { params }) {
  try {
    // 1. Check login
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first" },
        { status: 401 }
      );
    }

    // 2. Get order ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. Find order
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // 4. Customers can only view their own orders
    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "You are not allowed to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH: Update order status (admin only)
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

    // 2. Validate order ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. Get new status
    const { orderStatus } = await request.json();

    // 4. Allow only supported status values
    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid order status" },
        { status: 400 }
      );
    }

    // 5. Find order
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // 6. Update status
    order.orderStatus = orderStatus;

    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update order status" },
      { status: 500 }
    );
  }
}
