"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCarousel } from "@/components/image-carousel";
import { getEventById } from "@/services/event.service";

export default function EventPage() {
  const router = useRouter();
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadEvent() {
      try {
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

  const handlePrevImage = () => {
    setActiveImageIndex((prev) =>
      prev === 0 ? event.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) =>
      prev === event.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleBookTickets = () => {
    router.push(`/event/${eventId}/book-tickets`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="relative">
        <div className="relative h-[40vh]">
          {event.images && event.images.length > 0 ? (
            <ImageCarousel
              images={[...event.images].reverse()}
              activeIndex={activeImageIndex}
              onPrev={handlePrevImage}
              onNext={handleNextImage}
            />
          ) : (
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt={event.title}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <button
              onClick={() => router.push("/events")}
              className="h-10 w-10 rounded-full bg-black/50 flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {/* <button className="h-10 w-10 rounded-full bg-black/50 flex items-center justify-center">
              <Share2 className="h-5 w-5" />
            </button> */}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-black rounded-t-3xl p-4 border-t border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            {/* <div className="bg-green-800 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
              <span className="mr-1">4.8</span>
              <span className="text-xs">★</span>
            </div> */}
          </div>

          <p className="text-gray-400 mb-2">{event.location}</p>

          <div className="flex items-center text-gray-400 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">2.5 km away</span>
            <span className="mx-2">•</span>
            <span className="text-sm">
              {formatCurrency(event.basePrice)} per ticket
            </span>
          </div>

          <div className="flex items-center text-gray-400 mb-6">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {new Date(event.dateTime).toLocaleString()}
            </span>
          </div>

          {/* <div className="grid grid-cols-3 gap-2 mb-6">
            <Button
              variant="outline"
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Directions
            </Button>
            <Button
              variant="outline"
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant="outline"
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div> */}

          <Button
            className="w-full bg-purple-700 hover:bg-purple-600 py-6 text-lg"
            onClick={handleBookTickets}
          >
            Book Tickets
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 mb-6">
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-purple-700"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="data-[state=active]:bg-purple-700"
            >
              Gallery
            </TabsTrigger>
            {/* <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-purple-700"
            >
              Reviews
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="about" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">About the Event</h2>
              <p className="text-gray-300">{event.description}</p>

              <h3 className="text-lg font-semibold mt-6">Location</h3>
              <div className="bg-gray-900 rounded-lg h-40 overflow-hidden">
                {event.latitude && event.longitude ? (
                  <div className="relative h-full">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        event.longitude - 0.01
                      }%2C${event.latitude - 0.01}%2C${
                        event.longitude + 0.01
                      }%2C${event.latitude + 0.01}&layer=mapnik&marker=${
                        event.latitude
                      }%2C${event.longitude}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}`;
                        window.open(mapsUrl, "_blank");
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-600" />
                    <span className="text-gray-500 ml-2">
                      Location unavailable
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Ticket Information
                </h3>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Base Price:</span>
                    <span>{formatCurrency(event.basePrice)}</span>
                  </div>

                  {event.discountTier1Percent > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">
                        Buy {event.discountTier1Quantity}+ tickets:
                      </span>
                      <span className="text-green-500">
                        {event.discountTier1Percent}% off
                      </span>
                    </div>
                  )}

                  {event.discountTier2Percent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Buy {event.discountTier2Quantity}+ tickets:
                      </span>
                      <span className="text-green-500">
                        {event.discountTier2Percent}% off
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-0">
            <div className="grid grid-cols-2 gap-2">
              {event.images &&
                event.images.map((image: any, index: any) => (
                  <div
                    key={image.id}
                    className="aspect-square relative rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image.url || "/placeholder.svg?height=200&width=200"}
                      alt={image.altText || `Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <div className="text-center py-8">
              <p className="text-gray-400">No reviews yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
