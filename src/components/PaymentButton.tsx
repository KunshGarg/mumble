// components/PaymentButton.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  createOrder,
  updateOrderPaymentStatus,
} from "@/services/order.service";
import { generateTicketsForOrder } from "@/services/ticket.service";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

interface PaymentButtonProps {
  amount: number;
  userData: {
    user: {
      email: string;
      userId: string;
    };
    eventId: string;
    quantity: number;
  };
  handleProceedToPayment: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    email?: string;
    [key: string]: any;
  };
  theme: {
    color: string;
  };
}

// Extending the Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

const PaymentButton = ({
  amount,
  userData,
  handleProceedToPayment,
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  function generateUuidRazorpayIds() {
    // Generate order and payment IDs using UUID
    const orderId = `order_${uuidv4().replace(/-/g, "").substring(0, 14)}`;
    const paymentId = `pay_${uuidv4().replace(/-/g, "").substring(0, 14)}`;

    // Generate signature using crypto
    const signature = crypto.randomBytes(32).toString("hex");
    return {
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    };
  }
  const makePayment = () => async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Create order
      const response = await fetch(`/api/order/create?amount=${amount}`);
      const orderData: any = await response.json();

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Deja Vu",
        description: "Payment For Your Ticket",
        order_id: orderData.id,
        handler: async function (response: RazorpayResponse) {
          const order = await createOrder({
            userId: userData.user.userId,
            eventId: userData.eventId,
            quantity: userData.quantity,
          });
          if (!order) {
            alert("Order creation failed. Please try again.");
            setIsLoading(false);
            return;
          }
          // Verify payment
          const data = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              email: userData.user?.email,
            }),
          });

          const res: any = await data.json();

          if (res?.error === false) {
            // Redirect to success page
            const updateOrder = await updateOrderPaymentStatus(
              order.id,
              "SUCCESS",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }
            );
            if (!updateOrder) {
              alert("Payment verification failed. Please try again.");
              setIsLoading(false);
              return;
            }
            const tickets = await generateTicketsForOrder(order.id);
            if (!tickets) {
              alert("Ticket generation failed. Please contact support.");
              setIsLoading(false);
              return;
            }

            router.push("/");
          }
        },
        prefill: {
          email: userData.user?.email,
          // You can add more prefill options like name, contact
        },
        theme: {
          color: "#3399cc", // Customize according to your brand
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response) {
        alert("Payment failed. Please try again.");
        setIsLoading(false);
        router.push("/");
      });
    } catch (error) {
      setIsLoading(false);
      router.push("/");
    }
  };

  const makePaymentNonPayment = async () => {
    setIsLoading(true);
    const order = await createOrder({
      userId: userData.user.userId,
      eventId: userData.eventId,
      quantity: userData.quantity,
    });
    if (!order) {
      alert("Order creation failed. Please try again.");
      setIsLoading(false);
      return;
    }
    const response = generateUuidRazorpayIds();

    const updateOrder = await updateOrderPaymentStatus(order.id, "SUCCESS", {
      razorpayOrderId: response.razorpayOrderId,
      razorpayPaymentId: response.razorpayPaymentId,
      razorpaySignature: response.razorpaySignature,
    });
    if (!updateOrder) {
      alert("Payment verification failed. Please try again.");
      setIsLoading(false);
      return;
    }
    const tickets = await generateTicketsForOrder(order.id);
    if (!tickets) {
      alert("Ticket generation failed. Please contact support.");
      setIsLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <Button
      className="w-full bg-purple-700 hover:bg-purple-600 py-6"
      disabled={isLoading}
      onClick={makePayment()}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      ) : (
        "Pay Now"
      )}
    </Button>
  );
};

export default PaymentButton;
