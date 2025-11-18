import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllEvents } from "@/services/event.service";
import { prismaService } from "@/services/prisma.service";
import { Calendar, Eye, EyeOff, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";

export default async function AdminDashboard() {
  await requireAdmin();

  const allEvents = await getAllEvents({ includeUnpublished: true });
  const events = allEvents || [];
  const publishedEvents = events.filter((e: any) => e.isPublished);
  const unpublishedEvents = events.filter((e: any) => !e.isPublished);
  const upcomingEvents = events.filter(
    (e: any) => new Date(e.dateTime) > new Date()
  );

  const totalOrders = await prismaService.prisma.order.count();
  const totalTickets = await prismaService.prisma.ticket.count();

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "text-purple-400",
    },
    {
      label: "Published Events",
      value: publishedEvents.length,
      icon: Eye,
      color: "text-green-400",
    },
    {
      label: "Unpublished Events",
      value: unpublishedEvents.length,
      icon: EyeOff,
      color: "text-yellow-400",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Ticket,
      color: "text-pink-400",
    },
    {
      label: "Total Tickets",
      value: totalTickets,
      icon: Ticket,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/admin/events/create">
            <Button className="bg-purple-700 hover:bg-purple-600">
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Events */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Events</h2>
            <Link href="/admin/events">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No events found</p>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(event.dateTime).toLocaleDateString()} at{" "}
                      {event.location}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.isPublished ? (
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                        Draft
                      </span>
                    )}
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
