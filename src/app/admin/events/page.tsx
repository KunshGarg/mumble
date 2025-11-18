"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  basePrice: number;
  isPublished: boolean;
  images?: { url: string }[];
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">(
    "all"
  );

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      if (response.ok) {
        const data = (await response.json()) as { events: Event[] };
        setEvents(data.events);
      } else {
        const errorData = (await response.json()) as { error?: string };
        toast.error(errorData.error || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    const loadingToast = toast.loading("Deleting event...");

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
        toast.success("Event deleted successfully", { id: loadingToast });
      } else {
        const errorData = (await response.json()) as { error?: string };
        toast.error(errorData.error || "Failed to delete event", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.", { id: loadingToast });
    }
  };

  const togglePublish = async (eventId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unpublishing" : "publishing";
    const loadingToast = toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} event...`);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        setEvents(
          events.map((e) =>
            e.id === eventId ? { ...e, isPublished: !currentStatus } : e
          )
        );
        toast.success(
          `Event ${currentStatus ? "unpublished" : "published"} successfully`,
          { id: loadingToast }
        );
      } else {
        const errorData = (await response.json()) as { error?: string };
        toast.error(errorData.error || `Failed to ${action} event`, { id: loadingToast });
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error(`Failed to ${action} event. Please try again.`, { id: loadingToast });
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "published") return event.isPublished;
    if (filter === "unpublished") return !event.isPublished;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Events</h1>
          <Link href="/admin/events/create">
            <Button className="bg-purple-700 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {["all", "published", "unpublished"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? "bg-purple-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <p className="text-gray-400 mb-4">No events found</p>
            <Link href="/admin/events/create">
              <Button className="bg-purple-700 hover:bg-purple-600">
                Create Your First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                    {event.images && event.images.length > 0 ? (
                      <Image
                        src={event.images[0].url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-600">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          {event.title}
                        </h2>
                        <p className="text-gray-400 text-sm mb-1">
                          {new Date(event.dateTime).toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">{event.location}</p>
                        <p className="text-purple-400 font-semibold mt-2">
                          ₹{event.basePrice}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {event.isPublished ? (
                          <span className="text-xs bg-green-900/30 text-green-400 px-3 py-1 rounded-full">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          togglePublish(event.id, event.isPublished)
                        }
                      >
                        {event.isPublished ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </Button>

                      <Link href={`/event/${event.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
