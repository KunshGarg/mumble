// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: any) {
  const { razorpayOrderId, razorpaySignature, razorpayPaymentId, email } =
    await req.json();

  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpaySignature;

  if (!isAuthentic) {
    return NextResponse.json(
      { message: "invalid payment signature", error: true },
      { status: 400 }
    );
  }

  // Update your database here to mark payment as successful
  // Example: await Order.findOneAndUpdate({ email: email }, { hasPaid: true });

  return NextResponse.json(
    { message: "payment success", error: false },
    { status: 200 }
  );
}
