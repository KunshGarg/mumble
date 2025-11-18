import placesData from "../places.json";
import {
  Place,
  PlaceCategory,
  PlaceFeature,
  PlacesCollection,
} from "@/types/place";

// Convert PlaceFeature to UI-friendly Place object
function featureToPlace(feature: PlaceFeature): Place {
  const props = feature.properties;
  const primaryCategory =
    props.categories && props.categories.length > 0
      ? props.categories[0].split(".")[0]
      : "other";

  return {
    id: props.place_id,
    name: props.name,
    category: primaryCategory,
    categories: props.categories || [],
    lat: props.lat,
    lon: props.lon,
    address: props.address_line1 || props.formatted || "",
    city: props.city,
    state: props.state,
    postcode: props.postcode,
    distance: props.distance,
    openingHours: props.opening_hours,
    description: props.description,
    cuisine: props.catering?.cuisine,
  };
}

// Get all places from places.json
export function getAllPlaces(): Place[] {
  const data = placesData as PlacesCollection;
  return data.features
    .filter(feature => feature.properties.name) // Only include places with names
    .map(featureToPlace);
}

// Get unique categories from all places
export function getPlaceCategories(): string[] {
  const places = getAllPlaces();
  const categoriesSet = new Set<string>();

  places.forEach((place) => {
    categoriesSet.add(place.category);
  });

  return Array.from(categoriesSet).sort();
}

// Filter places by category
export function filterPlacesByCategory(
  places: Place[],
  categories: string[]
): Place[] {
  if (categories.length === 0 || categories.includes("all")) {
    return places;
  }

  return places.filter((place) => categories.includes(place.category));
}

// Search places by name, address, or category
export function searchPlaces(places: Place[], query: string): Place[] {
  if (!query.trim()) {
    return places;
  }

  const lowerQuery = query.toLowerCase();

  return places.filter((place) => {
    return (
      (place.name || "").toLowerCase().includes(lowerQuery) ||
      (place.address || "").toLowerCase().includes(lowerQuery) ||
      (place.category || "").toLowerCase().includes(lowerQuery) ||
      place.city?.toLowerCase().includes(lowerQuery) ||
      place.cuisine?.toLowerCase().includes(lowerQuery)
    );
  });
}

// Group places by category and sort alphabetically within groups
export function groupPlacesByCategory(places: Place[]): Place[] {
  const grouped: { [key: string]: Place[] } = {};

  // Group places
  places.forEach((place) => {
    if (!grouped[place.category]) {
      grouped[place.category] = [];
    }
    grouped[place.category].push(place);
  });

  // Sort within each group alphabetically by name
  Object.keys(grouped).forEach((category) => {
    grouped[category].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  });

  // Flatten back to array, ordered by category name
  const sortedCategories = Object.keys(grouped).sort();
  return sortedCategories.flatMap((category) => grouped[category]);
}

// Generate Google Maps URL from coordinates
export function getGoogleMapsUrl(lat: number, lon: number, name?: string): string {
  const coords = `${lat},${lon}`;
  if (name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      name
    )}&query_place_id=${coords}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${coords}`;
}

// Get place category display name
export function getCategoryDisplayName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    sport: "Sport & Fitness",
    catering: "Food & Dining",
    entertainment: "Entertainment",
    building: "Buildings",
    leisure: "Leisure & Parks",
    parking: "Parking",
    internet_access: "Internet Access",
    vegetarian: "Vegetarian",
    fast_food: "Fast Food",
  };

  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// Get category color for UI
export function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    sport: "bg-blue-500",
    catering: "bg-orange-500",
    entertainment: "bg-purple-500",
    building: "bg-gray-500",
    leisure: "bg-green-500",
    parking: "bg-yellow-500",
    internet_access: "bg-cyan-500",
    vegetarian: "bg-lime-500",
    fast_food: "bg-red-500",
  };

  return colorMap[category] || "bg-indigo-500";
}
