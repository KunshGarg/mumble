"use server";
import { User } from "@prisma/client";
import { prismaService } from "./prisma.service";

/**
 * Get a user by their Clerk ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const user = await prismaService.prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    console.error(`User with ID ${id} not found`);
    return null;
  }
  return user;
}

/**
 * Get a user by their email address
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prismaService.prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Create a new user with Clerk data
 */
export async function createUser(userData: {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  return prismaService.prisma.user.create({
    data: userData,
  });
}

/**
 * Update a user's information
 */
export async function updateUser(
  id: string,
  userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<User> {
  return prismaService.prisma.user.update({
    where: { id },
    data: userData,
  });
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string) {
  return prismaService.prisma.order.findMany({
    where: { userId },
    include: {
      event: true,
      tickets: true,
    },
  });
}

/**
 * Get all tickets for a user
 */
export async function getUserTickets(userId: string) {
  return prismaService.prisma.ticket.findMany({
    where: { userId },
    include: {
      event: true,
      order: true,
    },
  });
}
