"use server";
import { PaymentStatus } from "@prisma/client";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prismaService } from "./prisma.service";
import {
  getOrderByRazorpayOrderId,
  updateOrderPaymentStatus,
} from "./order.service";
import { generateTicketsForOrder } from "./ticket.service";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Create a Razorpay order for an existing order in our system
 */
export async function createRazorpayOrder(orderId: string): Promise<{
  orderId: string;
  razorpayOrderId: string;
  amount: number;
}> {
  const order = await prismaService.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      event: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.razorpayOrderId) {
    throw new Error("Razorpay order already exists for this order");
  }

  const amount = Math.round(Number(order.finalAmount) * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: order.id,
    notes: {
      orderId: order.id,
      eventId: order.eventId,
      userId: order.userId,
      eventName: order.event.title,
    },
  });

  await updateOrderPaymentStatus(order.id, PaymentStatus.PENDING, {
    razorpayOrderId: razorpayOrder.id,
  });

  return {
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount,
  };
}

/**
 * Verify Razorpay payment and update order status
 */
export async function verifyPayment(paymentDetails: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<boolean> {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    paymentDetails;

  const order = await getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    throw new Error("Order not found for the given Razorpay order ID");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const isValid = generatedSignature === razorpaySignature;

  await updateOrderPaymentStatus(
    order.id,
    isValid ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    {
      razorpayPaymentId,
      razorpaySignature,
    }
  );

  if (isValid) {
    await generateTicketsForOrder(order.id);
  }

  return isValid;
}

/**
 * Handle Razorpay webhook
 */
export async function handleWebhook(payload: any): Promise<void> {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret not configured");
  }

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(payload.body));
  const digest = shasum.digest("hex");

  if (digest !== payload.headers["x-razorpay-signature"]) {
    throw new Error("Invalid webhook signature");
  }

  const event = payload.body.event;
  const paymentId = payload.body.payload.payment?.entity?.id;
  const orderId = payload.body.payload.payment?.entity?.order_id;

  if (!orderId) return;

  if (event === "payment.authorized") {
    const order = await getOrderByRazorpayOrderId(orderId);
    if (order) {
      await updateOrderPaymentStatus(order.id, PaymentStatus.SUCCESS, {
        razorpayPaymentId: paymentId,
      });
      await generateTicketsForOrder(order.id);
    }
  } else if (event === "payment.failed") {
    const order = await getOrderByRazorpayOrderId(orderId);
    if (order) {
      await updateOrderPaymentStatus(order.id, PaymentStatus.FAILED, {
        razorpayPaymentId: paymentId,
      });
    }
  }
}

