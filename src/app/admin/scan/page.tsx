"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getTicketsByOrderId, validateTicket } from "@/services/ticket.service";
import { useAuth } from "@clerk/nextjs";
import { AdminHeader } from "@/components/admin/AdminHeader";
interface TicketData {
  id: string;
  orderId: string;
  userId: string;
  eventId: string;
  pricePaid: any;
  isUsed: boolean;
  validatedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: any;
  event: {
    id: string;
    title: string;
    dateTime: string;
    location: string;
  };
}

interface OrderData {
  id: string;
  tickets: TicketData[];
  totalTickets: number;
  usedTickets: number;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const { userId, isLoaded, isSignedIn } = useAuth();
  useEffect(() => {
    if (scanning) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      };

      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        config,
        /* verbose= */ false
      );

      const onScanSuccess = (decodedText: string) => {
        setScanResult(decodedText);
        setScanning(false);
        html5QrcodeScanner.clear();

        // Extract orderId from QR code
        // Format is "order:orderId" or just "orderId"
        const orderId = decodedText.startsWith("order:")
          ? decodedText.substring(6)
          : decodedText;

        fetchOrderDetails(orderId);
      };

      html5QrcodeScanner.render(onScanSuccess, (error) => {
        console.warn(`QR scanning error: ${error}`);
      });

      return () => {
        html5QrcodeScanner.clear().catch((error) => {
          console.error("Failed to clear scanner", error);
        });
      };
    }
  }, [scanning]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    setError("");

    try {
      const tickets = await getTicketsByOrderId(orderId);
      if (tickets.length === 0) {
        setError("No tickets found for this order.");
        setLoading(false);
        return;
      }

      // Transform tickets to match OrderData structure
      const orderData: OrderData = {
        id: orderId,
        tickets: tickets as any,
        totalTickets: tickets.length,
        usedTickets: tickets.filter((ticket: any) => ticket.isUsed).length,
        eventTitle: tickets[0].event.title,
        eventDate: tickets[0].event.dateTime.toString(),
        eventLocation: tickets[0].event.location,
      };

      setOrderData(orderData);
      setSelectedTickets(
        tickets.filter((ticket: any) => !ticket.isUsed).map((ticket: any) => ticket.id)
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details. Please try again.");
      setLoading(false);
    }

    // try {
    //   // In a real app, this would be an API call
    //   // For demo purposes, we'll simulate a response
    //   setTimeout(() => {
    //     // Mock data based on the provided schema
    //     const mockOrderData: OrderData = {
    //       id: orderId,
    //       tickets: [
    //         {
    //           id: "ticket1",
    //           orderId: orderId,
    //           userId: "user1",
    //           eventId: "event1",
    //           pricePaid: 224,
    //           isUsed: false,
    //           validatedAt: null,
    //           createdAt: new Date().toISOString(),
    //           updatedAt: new Date().toISOString(),
    //           event: {
    //             id: "event1",
    //             title: "Summer Music Festival",
    //             dateTime: "2025-07-15T18:00:00.000Z",
    //             location: "Central Park, New York",
    //           },
    //           user: {
    //             id: "user1",
    //             name: "John Doe",
    //             email: "john@example.com",
    //           },
    //         },
    //         {
    //           id: "ticket2",
    //           orderId: orderId,
    //           userId: "user1",
    //           eventId: "event1",
    //           pricePaid: 224,
    //           isUsed: false,
    //           validatedAt: null,
    //           createdAt: new Date().toISOString(),
    //           updatedAt: new Date().toISOString(),
    //           event: {
    //             id: "event1",
    //             title: "Summer Music Festival",
    //             dateTime: "2025-07-15T18:00:00.000Z",
    //             location: "Central Park, New York",
    //           },
    //           user: {
    //             id: "user1",
    //             name: "John Doe",
    //             email: "john@example.com",
    //           },
    //         },
    //       ],
    //       totalTickets: 2,
    //       usedTickets: 0,
    //       eventTitle: "Summer Music Festival",
    //       eventDate: "2025-07-15T18:00:00.000Z",
    //       eventLocation: "Central Park, New York",
    //     }

    //     setOrderData(mockOrderData)
    //     // Pre-select all tickets by default
    //     setSelectedTickets(mockOrderData.tickets.map((ticket) => ticket.id))
    //     setLoading(false)
    //   }, 1500)
    // } catch (err) {
    //   console.error("Error fetching order details:", err)
    //   setError("Failed to fetch order details. Please try again.")
    //   setLoading(false)
    // }
  };

  const handleStartScan = () => {
    setScanning(true);
    setScanResult("");
    setOrderData(null);
    setError("");
    setSuccess(false);
  };

  const toggleTicketSelection = (ticketId: string) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(selectedTickets.filter((id) => id !== ticketId));
    } else {
      setSelectedTickets([...selectedTickets, ticketId]);
    }
  };

  const handleValidateTickets = async () => {
    if (!orderData || selectedTickets.length === 0) return;
    if (!isLoaded || !userId) {
      setError("You must be logged in to validate tickets.");
      return;
    }
    setValidating(true);

    try {
      for (const ticketId of selectedTickets) {
        const ticket = await validateTicket(ticketId, userId);
        if (ticket === true) {
          alert("Bhag teri maa ka bhosda");
          return;
        }
      }

      // Show success message
      setSuccess(true);

      // Update the UI to show tickets as used
      const updatedOrderData = {
        ...orderData,
        tickets: orderData.tickets.map((ticket) => ({
          ...ticket,
          isUsed: selectedTickets.includes(ticket.id) ? true : ticket.isUsed,
          validatedAt: selectedTickets.includes(ticket.id)
            ? new Date()
            : ticket.validatedAt,
        })),
        usedTickets: orderData.usedTickets + selectedTickets.length,
      };

      setOrderData(updatedOrderData);
      setSelectedTickets([]);

      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setOrderData(null);
        setScanResult("");
      }, 3000);
    } catch (err) {
      console.error("Error validating tickets:", err);
      setError("Failed to validate tickets. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />

      <div className="container mx-auto p-4">
        {!scanning && !orderData && !success && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                  <QrCode className="h-10 w-10 text-purple-400" />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-center mb-4">
                Ticket Scanner
              </h2>
              <p className="text-gray-400 text-center mb-6">
                Scan a ticket QR code to validate entry for an event.
              </p>

              <Button
                className="w-full bg-purple-700 hover:bg-purple-600 py-6"
                onClick={handleStartScan}
              >
                Start Scanning
              </Button>
            </div>
          </div>
        )}

        {scanning && (
          <div className="flex flex-col items-center py-8">
            <h2 className="text-xl font-semibold mb-6">Scan QR Code</h2>
            <div id="qr-reader" className="w-full max-w-sm"></div>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setScanning(false)}
            >
              Cancel
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading ticket information...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-300 flex items-center">
              <X className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {orderData && !success && (
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold mb-1">
                {orderData.eventTitle}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-400 gap-2 sm:gap-4">
                <div className="flex items-center">
                  <Badge className="bg-purple-700 mr-2">Order</Badge>
                  {orderData.id.substring(0, 8)}...
                </div>
                <div>{formatDate(new Date(orderData.eventDate))}</div>
                <div>{orderData.eventLocation}</div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Select tickets to validate</h3>
                <div className="text-sm text-gray-400">
                  {orderData.usedTickets} of {orderData.totalTickets} used
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {orderData.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      ticket.isUsed
                        ? "bg-gray-800/50 border-gray-700"
                        : selectedTickets.includes(ticket.id)
                        ? "bg-purple-900/20 border-purple-700"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center">
                        Ticket {ticket.id.substring(0, 6)}
                        {ticket.isUsed && (
                          <Badge
                            variant="outline"
                            className="ml-2 border-red-500 text-red-500"
                          >
                            Used
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatCurrency(ticket.pricePaid)}
                      </div>
                    </div>

                    {!ticket.isUsed && (
                      <Button
                        variant={
                          selectedTickets.includes(ticket.id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={
                          selectedTickets.includes(ticket.id)
                            ? "bg-purple-700"
                            : ""
                        }
                        onClick={() => toggleTicketSelection(ticket.id)}
                      >
                        {selectedTickets.includes(ticket.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Selected
                          </>
                        ) : (
                          "Select"
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-purple-700 hover:bg-purple-600 py-6 mt-4"
                disabled={selectedTickets.length === 0 || validating}
                onClick={handleValidateTickets}
              >
                {validating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  `Validate ${selectedTickets.length} Ticket${
                    selectedTickets.length !== 1 ? "s" : ""
                  }`
                )}
              </Button>
            </div>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-green-900/30 border border-green-800 rounded-full p-6 mb-4">
              <Check className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Tickets Validated!</h2>
            <p className="text-gray-400 mb-6">
              Successfully validated ticket
              {selectedTickets.length !== 1 ? "s" : ""}.
            </p>
            <Button
              className="bg-purple-700 hover:bg-purple-600"
              onClick={handleStartScan}
            >
              Scan Another Ticket
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
