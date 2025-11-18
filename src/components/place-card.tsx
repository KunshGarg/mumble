import {
  MapPin,
  ExternalLink,
  Clock,
  Navigation,
  Utensils,
} from "lucide-react";
import { Place } from "@/types/place";
import {
  getGoogleMapsUrl,
  getCategoryDisplayName,
  getCategoryColor,
} from "@/services/place.service";

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const googleMapsUrl = getGoogleMapsUrl(place.lat, place.lon, place.name);

  // Format distance
  const distanceText = place.distance
    ? place.distance < 1000
      ? `${Math.round(place.distance)}m`
      : `${(place.distance / 1000).toFixed(1)}km`
    : null;

  // Get primary category color
  const categoryColor = getCategoryColor(place.category);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all">
      {/* Header with category badge */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 h-32 flex items-center justify-center">
        <div className="text-center px-4">
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
            {place.name}
          </h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${categoryColor}`}
          >
            {getCategoryDisplayName(place.category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Address */}
        <div className="flex items-start text-sm text-gray-400 mb-2">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="line-clamp-2">
              {place.address}
              {place.city && `, ${place.city}`}
              {place.state && `, ${place.state}`}
              {place.postcode && ` ${place.postcode}`}
            </span>
          </div>
        </div>

        {/* Distance */}
        {distanceText && (
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <Navigation className="h-4 w-4 mr-2 text-gray-500" />
            <span>{distanceText} away</span>
          </div>
        )}

        {/* Cuisine */}
        {place.cuisine && (
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <Utensils className="h-4 w-4 mr-2 text-gray-500" />
            <span>{place.cuisine}</span>
          </div>
        )}

        {/* Opening Hours */}
        {place.openingHours && (
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{place.openingHours}</span>
          </div>
        )}

        {/* Description */}
        {place.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {place.description}
          </p>
        )}

        {/* View on Map Button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <MapPin className="h-4 w-4 mr-2" />
          View on Google Maps
          <ExternalLink className="h-4 w-4 ml-2" />
        </a>
      </div>
    </div>
  );
}
