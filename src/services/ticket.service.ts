"use server";
import { Prisma, Ticket } from "@prisma/client";
import { prismaService } from "./prisma.service";

/**
 * Generate tickets for an order after successful payment
 */
export async function generateTicketsForOrder(
  orderId: string
): Promise<Ticket[]> {
  // Get the order with necessary details
  const order = await prismaService.prisma.order.findUnique({
    where: { id: orderId },
    include: { event: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "SUCCESS") {
    throw new Error("Cannot generate tickets for unpaid order");
  }

  // Check if tickets already exist
  const existingTickets = await prismaService.prisma.ticket.findMany({
    where: { orderId },
  });

  if (existingTickets.length > 0) {
    return existingTickets;
  }

  // Calculate price per ticket
  const pricePerTicket = Number(order.finalAmount) / order.quantity;

  // Generate tickets in a transaction
  return prismaService.prisma.$transaction(async (tx) => {
    const tickets: Ticket[] = [];

    for (let i = 0; i < order.quantity; i++) {
      const ticket = await tx.ticket.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          eventId: order.eventId,
          pricePaid: pricePerTicket,
        },
      });
      tickets.push(ticket);
    }

    return tickets;
  });
}

/**
 * Get a ticket by ID
 */
export async function getTicketById(id: string): Promise<Ticket | null> {
  return prismaService.prisma.ticket.findUnique({
    where: { id },
    include: {
      event: true,
      user: true,
      order: true,
    },
  });
}

/**
 * Validate a ticket at the event (mark as used)
 */

export async function validateTicket(
  id: string,
  userId: string
): Promise<Ticket | true> {
  const user = await prismaService.prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (
    user.email == "arnavguptagg@gmail.com" ||
    user.email == "namankundra6@gmail.com"
  ) {
    // Check if ticket exists and is not used
    const ticket = await prismaService.prisma.ticket.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.isUsed) {
      throw new Error("Ticket has already been used");
    }

    // Validate ticket (mark as used)
    return prismaService.prisma.ticket.update({
      where: { id },
      data: {
        isUsed: true,
        validatedAt: new Date(),
      },
    });
  } else {
    return true;
  }
}

/**
 * Get all tickets for a specific event
 */
export async function getTicketsByEventId(eventId: string) {
  return prismaService.prisma.ticket.findMany({
    where: { eventId },
    include: {
      user: true,
      order: true,
    },
  });
}

/**
 * Get all tickets for a specific order
 */
export async function getTicketsByOrderId(orderId: string) {
  return prismaService.prisma.ticket.findMany({
    where: { orderId },
    include: {
      event: true,
    },
  });
}

/**
 * Get all tickets for a specific user
 */
export async function getTicketsByUserId(userId: string) {
  return prismaService.prisma.ticket.findMany({
    where: { userId },
    include: {
      event: true,
      order: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
