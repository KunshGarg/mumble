// app/api/order/create/route.ts (App Router)
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { v4 as uuid } from "uuid";

// Add this export to prevent prerendering of this route
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  // Check if Razorpay credentials exist
  if (!key_id || !key_secret) {
    return NextResponse.json(
      { error: "Razorpay credentials are not configured" },
      { status: 500 }
    );
  }

  // Initialize Razorpay only when handling an actual request
  const instance = new Razorpay({
    key_id,
    key_secret,
  });

  const { searchParams } = new URL(request.url);
  const totalAmount = Number(searchParams.get("amount")); // in rupees
  const amount = totalAmount * 100; // convert to paisa

  const options = {
    amount: amount.toString(),
    currency: "INR",
    receipt: uuid(),
  };

  const order = await instance.orders.create(options);
  return NextResponse.json(order);
}
