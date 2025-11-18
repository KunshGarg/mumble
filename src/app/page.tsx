// app/page.tsx (Server Component)
// No "use client" directive here

import AnimatedContent from "@/components/AnimatedContent"; // Adjust the path if needed
import { addEventImage, createEvent } from "@/services/event.service";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
// No redirect import needed here anymore unless you have other specific cases
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import {
  createOrder,
  updateOrderPaymentStatus,
} from "@/services/order.service";
import { generateTicketsForOrder } from "@/services/ticket.service";
export default async function Home() {
  // Fetch the authentication status on the server
  const { userId } = await auth();
  const isLoggedIn = !!userId; // Convert the userId to a boolean flag
  // Add this as a test event for development
  // if (true) {
  //   try {
  //     const event = await createEvent({
  //       title: "Radium Light Party",
  //       description:
  //         "When the lights go dim, we glow. neon dreams. slow sips. deep drops.",
  //       dateTime: new Date("2025-04-23T17:00:00Z"),
  //       location: "Street Club Bar, Patiala",
  //       latitude: 30.346045,
  //       longitude: 76.378028,
  //       basePrice: 349.99,
  //       isPublished: true,
  //       discountTier1Quantity: 5,
  //       discountTier1Percent: 20,
  //       discountTier2Quantity: 5,
  //       discountTier2Percent: 20,
  //     });

  //     console.log("Test event created successfully", event);

  //     const addEventImagef = await addEventImage(event.id, {
  //       url: "https://pub-b43acd2dca154e228543c77aff6f738a.r2.dev/banner.jpg",
  //       altText: "Radium LOGO",
  //     });
  //     console.log("Test event image added successfully", addEventImagef);
  //     const addEventImagef2 = await addEventImage(event.id, {
  //       url: "https://pub-b43acd2dca154e228543c77aff6f738a.r2.dev/otherone.jpg",
  //       altText: "Radium POSTER",
  //     });
  //     console.log("Test event image added successfully", addEventImagef2);
  //   } catch (error) {
  //     console.error("Failed to create test event:", error);
  //   }
  // }
  // Always render the container and the Client Component
  // Pass the login status as a prop to the Client Component
  // function generateUuidRazorpayIds() {
  //   // Generate order and payment IDs using UUID
  //   const orderId = `order_${uuidv4().replace(/-/g, "").substring(0, 14)}`;
  //   const paymentId = `pay_${uuidv4().replace(/-/g, "").substring(0, 14)}`;

  //   // Generate signature using crypto
  //   const signature = crypto.randomBytes(32).toString("hex");
  //   return {
  //     razorpayOrderId: orderId,
  //     razorpayPaymentId: paymentId,
  //     razorpaySignature: signature,
  //   };
  // }
  // const makePaymentNonPayment = async () => {
  //   console.log("Payment initiated");
  //   const order = await createOrder({
  //     userId: "user_EXAMPLE_ID",
  //     eventId: "cm94jq9vg0000ky0v92olcjw0",
  //     quantity: 1,
  //   });
  //   if (!order) {
  //     alert("Order creation failed. Please try again.");
  //     return;
  //   }

  //   const response = generateUuidRazorpayIds();

  //   const updateOrder = await updateOrderPaymentStatus(order.id, "SUCCESS", {
  //     razorpayOrderId: response.razorpayOrderId,
  //     razorpayPaymentId: response.razorpayPaymentId,
  //     razorpaySignature: response.razorpaySignature,
  //   });
  //   if (!updateOrder) {
  //     alert("Payment verification failed. Please try again.");
  //     return;
  //   }
  //   const tickets = await generateTicketsForOrder(order.id);
  //   if (!tickets) {
  //     alert("Ticket generation failed. Please contact support.");
  //     return;
  //   }
  // };
  // makePaymentNonPayment();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <AnimatedContent isLoggedIn={isLoggedIn} />
    </div>
  );
}
