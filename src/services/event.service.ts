"use server";
import { Event, EventImage, Prisma } from "@prisma/client";
import { prismaService } from "./prisma.service";

/**
 * Create a new event
 */
export async function createEvent(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<Event> {
  return prismaService.prisma.event.create({
    data: eventData,
  });
}

/**
 * Get an event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  return prismaService.prisma.event.findUnique({
    where: { id },
    include: {
      images: true,
    },
  });
}

/**
 * Get all events (with optional filtering)
 */
export async function getAllEvents(params?: {
  includeUnpublished?: boolean;
  upcomingOnly?: boolean;
}) {
  const { includeUnpublished = false, upcomingOnly = false } = params || {};

  const where: Prisma.EventWhereInput = {};

  if (!includeUnpublished) {
    where.isPublished = true;
  }

  if (upcomingOnly) {
    where.dateTime = {
      gte: new Date(),
    };
  }

  return prismaService.prisma.event.findMany({
    where,
    include: {
      images: true,
    },
    orderBy: {
      dateTime: "asc",
    },
  });
}

/**
 * Update an event
 */
export async function updateEvent(
  id: string,
  eventData: Partial<Omit<Event, "id" | "createdAt" | "updatedAt">>
): Promise<Event> {
  return prismaService.prisma.event.update({
    where: { id },
    data: eventData,
  });
}

/**
 * Delete an event (if no orders exist)
 */
export async function deleteEvent(id: string): Promise<Event> {
  // First check if there are any orders for this event
  const ordersExist = await prismaService.prisma.order.findFirst({
    where: { eventId: id },
  });

  if (ordersExist) {
    throw new Error("Cannot delete event with existing orders");
  }

  return prismaService.prisma.event.delete({
    where: { id },
  });
}

/**
 * Publish an event (make it visible)
 */
export async function publishEvent(id: string): Promise<Event> {
  return prismaService.prisma.event.update({
    where: { id },
    data: { isPublished: true },
  });
}

/**
 * Unpublish an event (hide it)
 */
export async function unpublishEvent(id: string): Promise<Event> {
  return prismaService.prisma.event.update({
    where: { id },
    data: { isPublished: false },
  });
}

/**
 * Add an image to an event
 */
export async function addEventImage(
  eventId: string,
  imageData: { url: string; altText?: string }
): Promise<EventImage> {
  return prismaService.prisma.eventImage.create({
    data: {
      ...imageData,
      eventId,
    },
  });
}

/**
 * Remove an image from an event
 */
export async function removeEventImage(imageId: string): Promise<EventImage> {
  return prismaService.prisma.eventImage.delete({
    where: { id: imageId },
  });
}

/**
 * Calculate ticket price with applicable discount
 */
export async function calculateTicketPrice(
  eventId: string,
  quantity: number
): Promise<{
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  totalAmount: number;
}> {
  const event = await prismaService.prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Determine discount percentage based on quantity
  let discountPercent = 0;
  if (quantity >= event.discountTier2Quantity) {
    discountPercent = event.discountTier2Percent;
  } else if (quantity >= event.discountTier1Quantity) {
    discountPercent = event.discountTier1Percent;
  }

  // Calculate prices
  const totalAmount = Number(event.basePrice) * quantity;

  const discount = totalAmount * (discountPercent / 100);
  const finalPrice = totalAmount - discount;

  return {
    basePrice: Number(event.basePrice),
    discountPercent,
    finalPrice,
    totalAmount,
  };
}
