export interface PlaceProperties {
  // Core identification
  name: string;
  place_id: string;

  // Location data
  country?: string;
  country_code?: string;
  state?: string;
  state_code?: string;
  state_district?: string;
  county?: string;
  city?: string;
  postcode?: string;
  street?: string;
  iso3166_2?: string;

  // Coordinates
  lon: number;
  lat: number;

  // Formatted addresses
  formatted?: string;
  address_line1?: string;
  address_line2?: string;

  // Categorization
  categories: string[];
  details?: string[];

  // Additional metadata
  description?: string;
  distance?: number;
  opening_hours?: string;

  // Category-specific data
  catering?: {
    cuisine?: string;
  };

  // Data source info (we won't display this)
  datasource?: {
    sourcename: string;
    attribution: string;
    license: string;
    url: string;
    raw?: any;
  };
}

export interface PlaceGeometry {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PlaceFeature {
  type: "Feature";
  properties: PlaceProperties;
  geometry: PlaceGeometry;
}

export interface PlacesCollection {
  type: "FeatureCollection";
  features: PlaceFeature[];
}

// UI-friendly place type without datasource
export interface Place {
  id: string;
  name: string;
  category: string;
  categories: string[];
  lat: number;
  lon: number;
  address: string;
  city?: string;
  state?: string;
  postcode?: string;
  distance?: number;
  openingHours?: string;
  description?: string;
  cuisine?: string;
}

export type PlaceCategory =
  | "sport"
  | "catering"
  | "entertainment"
  | "building"
  | "leisure"
  | "parking"
  | "internet_access"
  | "vegetarian"
  | "all";
