"use client";

import { Place } from "@/types/place";
import { MapPin, ExternalLink } from "lucide-react";
import { getGoogleMapsUrl, getCategoryColor } from "@/services/place.service";
import { useState } from "react";

interface PlacesMapProps {
  places: Place[];
}

export function PlacesMap({ places }: PlacesMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Calculate center point from all places
  const centerLat =
    places.reduce((sum, place) => sum + place.lat, 0) / places.length || 30.3610663;
  const centerLon =
    places.reduce((sum, place) => sum + place.lon, 0) / places.length || 76.4195915;

  // Create Google Maps embed URL with multiple markers
  const createMapUrl = () => {
    // Use Google Maps Embed API for multiple markers
    // We'll show a map centered on the average location
    const baseUrl = "https://www.google.com/maps/embed/v1/view";
    const apiKey = "AIzaSyBFw0Qbyq9zTFTd-tUqqo6aDPX2ujGaBrg"; // You should use your own API key

    // For Cloudflare compatibility, we'll use a simpler approach
    // Create a search query with the center point
    const embedUrl = `https://maps.google.com/maps?q=${centerLat},${centerLon}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    return embedUrl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Map View */}
      <div className="lg:col-span-2 rounded-xl overflow-hidden bg-gray-900">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={createMapUrl()}
        ></iframe>
      </div>

      {/* Places List Sidebar */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <h3 className="font-semibold text-lg">Places ({places.length})</h3>
          <p className="text-sm text-gray-400">Click to view on map</p>
        </div>
        <div className="overflow-y-auto h-[calc(100%-80px)]">
          {places.map((place) => {
            const googleMapsUrl = getGoogleMapsUrl(place.lat, place.lon, place.name);
            const categoryColor = getCategoryColor(place.category);

            return (
              <div
                key={place.id}
                className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${
                  selectedPlace?.id === place.id ? "bg-gray-800" : ""
                }`}
                onClick={() => setSelectedPlace(place)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm line-clamp-1 flex-1">
                    {place.name}
                  </h4>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-medium text-white ${categoryColor} flex-shrink-0`}
                  >
                    {place.category}
                  </span>
                </div>

                <div className="flex items-start text-xs text-gray-400 mb-2">
                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {place.address}
                    {place.city && `, ${place.city}`}
                  </span>
                </div>

                {place.distance && (
                  <p className="text-xs text-gray-500 mb-2">
                    {place.distance < 1000
                      ? `${Math.round(place.distance)}m away`
                      : `${(place.distance / 1000).toFixed(1)}km away`}
                  </p>
                )}

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open in Google Maps
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
