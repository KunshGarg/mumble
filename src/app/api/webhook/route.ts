import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prismaService } from "@/services/prisma.service";
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log("Error: Missing Svix headers");
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  if (evt.type === "user.created") {
    console.log(`======= ${evt.type.toUpperCase()} EVENT =======`);
    console.log("userId:", evt.data.id);
    console.log(
      "userEmail:",
      evt.data.email_addresses?.[0]?.email_address || "No email provided"
    );
    console.log("userName:", `${evt.data.first_name} ${evt.data.last_name}`);

    // Log before database operation
    console.log("Checking if user exists in database...");

    try {
      const existingUserEmail = evt.data.email_addresses?.[0]?.email_address;

      if (existingUserEmail) {
        // Check if a user with this email already exists
        const existingUser = await prismaService.prisma.user.findUnique({
          where: {
            email: existingUserEmail,
          },
        });

        if (existingUser && existingUser.id !== evt.data.id) {
          // User exists with different ID - update their ID and other details
          await prismaService.prisma.user.update({
            where: {
              email: existingUserEmail,
            },
            data: {
              id: evt.data.id,
              firstName: evt.data.first_name,
              lastName: evt.data.last_name,
            },
          });
          console.log("Existing user updated with new ID");
        } else {
          // No user with this email or user has same ID - use upsert
          await prismaService.prisma.user.upsert({
            where: {
              id: evt.data.id,
            },
            update: {
              email: existingUserEmail,
              firstName: evt.data.first_name,
              lastName: evt.data.last_name,
            },
            create: {
              id: evt.data.id,
              email: existingUserEmail,
              firstName: evt.data.first_name,
              lastName: evt.data.last_name,
            },
          });
          console.log("User successfully upserted into database");
        }
      } else {
        // No email provided, just use the ID for upsert
        await prismaService.prisma.user.upsert({
          where: {
            id: evt.data.id,
          },
          update: {
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
          },
          create: {
            id: evt.data.id,
            email: "",
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
          },
        });
        console.log("User successfully upserted into database (no email)");
      }
    } catch (error) {
      console.error("Error processing user data in database:", error);
      return new Response("Error processing user data", { status: 500 });
    }
    console.log(`======= ${evt.type.toUpperCase()} EVENT HANDLED =======`);
  } else {
    console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response("Webhook received", { status: 200 });
}
