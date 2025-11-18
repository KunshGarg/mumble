import { AdminHeader } from "@/components/admin/AdminHeader";
import { EventForm } from "@/components/admin/EventForm";
import { requireAdmin } from "@/lib/admin";

export default async function CreateEventPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
        <EventForm mode="create" />
      </div>
    </div>
  );
}
