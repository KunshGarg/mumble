import Image from "next/image";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ExternalLink,
  IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EventWithImages {
  id: string;
  title: string;
  description: string | null;
  dateTime: Date | string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  basePrice: number;
  isPublished: boolean;
  discountTier1Quantity: number;
  discountTier1Percent: number;
  discountTier2Quantity: number;
  discountTier2Percent: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  images?: Array<{ url: string }>;
}

interface EventCardProps {
  event: EventWithImages;
}

export function EventCard({ event }: EventCardProps) {
  const googleMapsUrl =
    event.latitude && event.longitude
      ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
      : null;

  const router = useRouter();

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div
        className="relative h-48"
        onClick={() => {
          router.push(`/event/${event.id}`);
        }}
      >
        <Image
          src={event.images ? event.images[0]?.url : "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3
          onClick={() => {
            router.push(`/event/${event.id}`);
          }}
          className="text-lg font-semibold mb-2"
        >
          {event.title}
        </h3>
        <div className="flex items-center text-sm text-gray-400 mb-1">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span>{new Date(event.dateTime).toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-1">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <span>{event.location}</span>
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 hover:underline flex items-center"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-1">
          <IndianRupee className="h-4 w-4 mr-2 text-gray-500" />
          <span>₹{event?.basePrice?.toString()}</span>
        </div>
        {/* <div className="flex items-center text-sm text-gray-400">
          <Users className="h-4 w-4 mr-2 text-gray-500" />
          <span>{event.tickets.length} attending</span>
        </div> */}
      </div>
    </div>
  );
}
