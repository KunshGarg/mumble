import { AdminHeader } from "@/components/admin/AdminHeader";
import { EventForm } from "@/components/admin/EventForm";
import { requireAdmin } from "@/lib/admin";
import { getEventById } from "@/services/event.service";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdmin();

  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
        <EventForm mode="edit" event={event} />
      </div>
    </div>
  );
}
