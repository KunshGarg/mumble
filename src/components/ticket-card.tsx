"use client"

import { useState } from "react"
import NextImage from "next/image"
import { Calendar, Clock, MapPin, Ticket, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import QRCode from "react-qr-code"

interface TicketData {
  id: string
  orderId: string
  userId: string
  eventId: string
  pricePaid: number
  isUsed: boolean
  validatedAt: string | null
  createdAt: string
  updatedAt: string
  event: {
    id: string
    title: string
    description: string
    dateTime: string
    location: string
    latitude: number
    longitude: number
    basePrice: number
    isPublished: boolean
    createdAt: string
    updatedAt: string
    discountTier1Quantity: number
    discountTier1Percent: number
    discountTier2Quantity: number
    discountTier2Percent: number
  }
  order: {
    id: string
    userId: string
    eventId: string
    quantity: number
    totalAmount: number
    discountAppliedPercent: number
    finalAmount: number
    createdAt: string
    updatedAt: string
    paymentStatus: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }
}

interface GroupedTickets {
  [orderId: string]: {
    tickets: TicketData[]
    order: TicketData["order"]
    event: TicketData["event"]
  }
}

interface TicketsProps {
  tickets: TicketData[]
}

export function TicketsList({ tickets }: TicketsProps) {
  // Group tickets by orderId
  const groupedTickets: GroupedTickets = tickets.reduce((acc, ticket) => {
    const { orderId } = ticket
    
    if (!acc[orderId]) {
      acc[orderId] = {
        tickets: [],
        order: ticket.order,
        event: ticket.event
      }
    }
    
    acc[orderId].tickets.push(ticket)
    return acc
  }, {} as GroupedTickets)

  return (
    <div className="space-y-6">
      {Object.entries(groupedTickets).map(([orderId, data]) => (
        <OrderTicketCard 
          key={orderId}
          orderId={orderId}
          tickets={data.tickets}
          order={data.order}
          event={data.event}
        />
      ))}
    </div>
  )
}

interface OrderTicketCardProps {
  orderId: string
  tickets: TicketData[]
  order: TicketData["order"]
  event: TicketData["event"]
}

function OrderTicketCard({ orderId, tickets, order, event }: OrderTicketCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  const toggleExpand = () => {
    setExpanded(!expanded)
  }
  
  const eventDate = new Date(event.dateTime)
  const isPastEvent = eventDate < new Date()
  const purchaseDate = new Date(order.createdAt)
  
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
      {/* Event Header */}
      <div className="relative">
        <div className="h-32 w-full relative">
    
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold text-white">{event.title}</h3>
            <div className="flex items-center text-gray-300 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(new Date(event.dateTime))}</span>
            </div>
          </div>
          
          <Badge className={isPastEvent ? "bg-gray-600" : "bg-green-600"}>
            {isPastEvent ? "Past Event" : "Upcoming"}
          </Badge>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">Order ID</div>
            <div className="font-medium">{orderId.substring(0, 8)}...</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Purchased</div>
            <div className="font-medium">{formatDate(purchaseDate)}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Total</div>
            <div className="font-medium">{formatCurrency(order.finalAmount)}</div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-purple-400 hover:text-purple-300 hover:bg-gray-800"
            onClick={toggleExpand}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Tickets
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show Tickets ({tickets.length})
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Tickets Detail */}
      {expanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <div key={ticket.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold">Ticket #{index + 1}</div>
                    <Badge variant={ticket.isUsed ? "outline" : "default"} className={ticket.isUsed ? "border-red-500 text-red-500" : "bg-green-600"}>
                      {ticket.isUsed ? (
                        <span className="flex items-center">
                          <X className="h-3 w-3 mr-1" /> Used
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Valid
                        </span>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <div className="text-gray-400">Ticket ID</div>
                    <div>{ticket.id.substring(0, 8)}...</div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <div className="text-gray-400">Price Paid</div>
                    <div>{formatCurrency(ticket.pricePaid)}</div>
                  </div>
                  
                  {ticket.validatedAt && (
                    <div className="flex justify-between text-sm">
                      <div className="text-gray-400">Validated At</div>
                      <div>{formatDate(new Date(ticket.validatedAt))}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center">
              <div className="mb-4">
                <QRCode 
                  value={`order:${orderId}`} 
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
              <div className="text-center text-black">
                <div className="text-sm font-medium mb-1">Scan to verify tickets</div>
                <div className="text-xs text-gray-600">Order ID: {orderId}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h4 className="font-medium mb-3">Event Details</h4>
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium">{event.location}</div>
                <p className="text-sm text-gray-400 mt-1">{event.description}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button className="bg-purple-700 hover:bg-purple-600" onClick={() => {
              // Get the QR code SVG element
              const svg = document.querySelector(`.p-6.rounded-lg.flex.flex-col svg`) as SVGElement;
              if (svg) {
              // Preserve the exact dimensions and styling
              const svgData = new XMLSerializer().serializeToString(svg);
              const svgSize = svg.getBoundingClientRect();
              
              // Create canvas with matching dimensions plus padding
              const padding = 50; // 50px padding on all sides
              const scale = 2; // For higher resolution
              const canvas = document.createElement('canvas');
              canvas.width = (svgSize.width + padding * 2) * scale;
              canvas.height = (svgSize.height + padding * 2) * scale;
              
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.scale(scale, scale);
                
                // Create image from SVG
                const img = new Image();
                img.onload = () => {
                // Fill entire canvas with white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, svgSize.width + padding * 2, svgSize.height + padding * 2);
                
                // Draw image with padding offset
                ctx.drawImage(img, padding, padding, svgSize.width, svgSize.height);
                
                // Create download link
                const a = document.createElement("a");
                a.download = `ticket-qr-${orderId.substring(0, 8)}.png`;
                a.href = canvas.toDataURL("image/png");
                a.click();
                };
                
                // Need to use encoded SVG data
                const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(svgBlob);
                img.src = url;
              }
              }
            }}>
              Download QR Code
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
