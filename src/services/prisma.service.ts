import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

export const prismaService = {
  prisma: prisma,
  async connect() {
    await prisma.$connect();
  },
  async disconnect() {
    await prisma.$disconnect();
  },
};
