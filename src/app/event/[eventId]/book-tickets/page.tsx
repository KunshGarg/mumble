"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getEventById } from "@/services/event.service";
import PaymentButton from "@/components/PaymentButton";
import { useAuth } from "@clerk/nextjs";
import { getUserById } from "@/services/user.service";
export default function BookTicketsPage() {
  const router = useRouter();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const { eventId } = useParams<{ eventId: string }>();
  const [userData, setUserData] = useState<any | null>(null);
  const { sessionId, userId, isLoaded } = useAuth();
  useEffect(() => {
    async function loadEvent() {
      try {
        console.log("Loading event with ID:", userId);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  useEffect(() => {
    async function loadUser() {
      try {
        if (!userId) return;
        console.log("Loading user with ID:", userId);
        const userData = await getUserById(userId);
        setUserData(userData);
        console.log("User data loaded:", userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId, isLoaded]);

  useEffect(() => {
    if (!event) return;

    // Calculate discount based on quantity
    let discount = 0;
    if (
      quantity >= event.discountTier2Quantity &&
      event.discountTier2Percent > 0
    ) {
      discount = event.discountTier2Percent;
    } else if (
      quantity >= event.discountTier1Quantity &&
      event.discountTier1Percent > 0
    ) {
      discount = event.discountTier1Percent;
    }

    const baseAmount = Number(event.basePrice) * quantity;
    const discountAmount = baseAmount * (discount / 100);
    const final = baseAmount - discountAmount;

    setTotalAmount(baseAmount);
    setDiscountPercent(discount);
    setFinalAmount(final);
  }, [event, quantity]);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleProceedToPayment = () => {
    // In a real app, this would create an order and redirect to payment
    console.log("Creating order with:", {
      eventId: eventId,
      quantity,
      totalAmount,
      discountAppliedPercent: discountPercent,
      finalAmount,
    });

    // For demo purposes, just show an alert
    alert(`Teri Maa di fuddi da rate: ${formatCurrency(finalAmount)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Event not found</h1>
        <p className="text-gray-400 mb-4">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/")} variant="outline">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 bg-black p-4 border-b border-gray-800">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Review your booking</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            {event.images && event.images.length > 0 ? (
              <Image
                src={event.images[0].url || "/placeholder.svg"}
                alt={event.title}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                <span>No image</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{event.title}</h2>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <span className="px-1 border border-gray-600 mr-2">E</span>
              <span className="mr-2">|</span>
              <span>English</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">{event.location}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-lg">
                {formatDate(event.dateTime, true)}
              </span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-lg">
                {formatDate(event.dateTime, false, true)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-lg">
                {quantity} ticket{quantity !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-xl font-semibold">
              {formatCurrency(finalAmount)}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Select tickets</h3>
            {discountPercent > 0 && (
              <div className="bg-green-900 text-green-400 px-2 py-1 rounded text-sm">
                {discountPercent}% OFF
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Standard Ticket</div>
                <div className="text-gray-400 text-sm">
                  {formatCurrency(event.basePrice)} per ticket
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {(event.discountTier1Percent > 0 || event.discountTier2Percent > 0) && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Available discounts</h3>

            {event.discountTier1Percent > 0 && (
              <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span>Buy {event.discountTier1Quantity}+ tickets</span>
                </div>
                <span className="text-green-500">
                  {event.discountTier1Percent}% off
                </span>
              </div>
            )}

            {event.discountTier2Percent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span>Buy {event.discountTier2Quantity}+ tickets</span>
                </div>
                <span className="text-green-500">
                  {event.discountTier2Percent}% off
                </span>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Price details</h3>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">
                Base price ({quantity} × {formatCurrency(event.basePrice)})
              </span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Discount ({discountPercent}%)
                </span>
                <span className="text-green-500">
                  - {formatCurrency(totalAmount * (discountPercent / 100))}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-4 flex justify-between font-semibold">
            <span>Total amount</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm">
          <Info className="h-4 w-4 text-green-500" />
          <span className="text-green-500">
            Up to 70% refund on ticket cancellation
          </span>
          <span className="text-gray-400 underline ml-auto">Learn more</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-gray-800">
        {userData && userData.email && (
          <PaymentButton
            amount={finalAmount}
            handleProceedToPayment={handleProceedToPayment}
            userData={{
              user: {
                email: userData.email,
                userId: userData.id,
              },
              eventId: eventId,
              quantity: quantity,
            }}
          />
        )}
      </div>
    </div>
  );
}
