"use server";
import { Order, PaymentStatus, Prisma } from "@prisma/client";
import { prismaService } from "./prisma.service";
import { calculateTicketPrice } from "./event.service";

/**
 * Create a new order (initial state is PENDING)
 */
export async function createOrder(orderData: {
  userId: string;
  eventId: string;
  quantity: number;
}): Promise<Order> {
  const { userId, eventId, quantity } = orderData;

  // Calculate pricing using event service
  const pricing = await calculateTicketPrice(eventId, quantity);

  // Create the order in a transaction to ensure consistency
  return prismaService.prisma.$transaction(async (tx) => {
    // Create the order
    const order = await tx.order.create({
      data: {
        userId,
        eventId,
        quantity,
        totalAmount: pricing.totalAmount,
        discountAppliedPercent: pricing.discountPercent,
        finalAmount: pricing.finalPrice,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    return order;
  });
}

/**
 * Get an order by ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  return prismaService.prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      event: true,
      tickets: true,
    },
  });
}

/**
 * Get all orders for a user
 */
export async function getOrdersByUserId(userId: string) {
  return prismaService.prisma.order.findMany({
    where: { userId },
    include: {
      event: true,
      tickets: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get all orders for an event
 */
export async function getOrdersByEventId(eventId: string) {
  return prismaService.prisma.order.findMany({
    where: { eventId },
    include: {
      user: true,
      tickets: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  status: PaymentStatus,
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }
): Promise<Order> {
  return prismaService.prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: status,
      ...paymentDetails,
    },
  });
}

/**
 * Get an order by Razorpay order ID
 */
export async function getOrderByRazorpayOrderId(
  razorpayOrderId: string
): Promise<Order | null> {
  return prismaService.prisma.order.findUnique({
    where: { razorpayOrderId },
    include: {
      user: true,
      event: true,
    },
  });
}

