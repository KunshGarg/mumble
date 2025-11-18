"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, ChevronDown, User, Grid, Map, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryTabs } from "@/components/category-tabs";
import { EventCard } from "@/components/event-card";
import { MovieCard } from "@/components/movie-card";
import { OfferCard } from "@/components/offer-card";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";

import { getAllEvents } from "@/services/event.service";
import { AnyARecord } from "node:dns";
import { getTicketsByUserId } from "@/services/ticket.service";
import { Button } from "@/components/ui/button";
import { TicketsList } from "@/components/ticket-card";
import { PlaceCard } from "@/components/place-card";
import { PlacesMap } from "@/components/places-map";
import { Place } from "@/types/place";
import {
  getAllPlaces,
  getPlaceCategories,
  filterPlacesByCategory,
  searchPlaces,
  groupPlacesByCategory,
  getCategoryDisplayName,
  getCategoryColor,
} from "@/services/place.service";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Thapar University, Patiala");
  const [address, setAddress] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [events, setEvents] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [ticketData, setTicketData] = useState<any | null>(null);
  const { isSignedIn, sessionId, userId } = useAuth();

  // Places state
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [placeCategories, setPlaceCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [placesSearchQuery, setPlacesSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");

  useEffect(() => {
    async function loadEvent() {
      setEventsLoading(true);
      try {
        const eventsData = await getAllEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setEventsLoading(false);
      }
    }

    async function loadTickets(userId: string) {
      setTicketsLoading(true);
      try {
        const ticketsData = await getTicketsByUserId(userId);
        console.log("Tickets Data:", ticketsData);
        setTicketData(ticketsData);
      } catch (error) {
        console.error("Failed to load tickets:", error);
      } finally {
        setTicketsLoading(false);
      }
    }

    function loadPlaces() {
      try {
        const placesData = getAllPlaces();
        const categories = getPlaceCategories();

        // Group and sort places by category
        const groupedPlaces = groupPlacesByCategory(placesData);

        setPlaces(groupedPlaces);
        setFilteredPlaces(groupedPlaces);
        setPlaceCategories(categories);
      } catch (error) {
        console.error("Failed to load places:", error);
      }
    }

    if (activeCategory === "your-tickets") {
      if (isSignedIn && userId) {
        loadTickets(userId);
      }
    } else if (activeCategory === "for-you") {
      loadEvent();
    } else if (activeCategory === "explore") {
      loadPlaces();
    }
  }, [activeCategory, isSignedIn, userId]);

  // Filter places when search query or categories change
  useEffect(() => {
    if (activeCategory === "explore") {
      let filtered = places;

      // Filter by selected categories
      if (selectedCategories.length > 0) {
        filtered = filterPlacesByCategory(filtered, selectedCategories);
      }

      // Search filter
      if (placesSearchQuery) {
        filtered = searchPlaces(filtered, placesSearchQuery);
      }

      setFilteredPlaces(filtered);
    }
  }, [placesSearchQuery, selectedCategories, places, activeCategory]);

  // Initial category set outside useEffect to avoid infinite loop
  useEffect(() => {
    if (!activeCategory) {
      setActiveCategory("for-you");
    }
  }, []);

  // Handle category chip toggle
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setPlacesSearchQuery("");
  };

  // Loading spinner component that can be reused
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 z-50 bg-black pt-2 pb-4">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-gray-400" />
              <div>
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold">{location}</h1>
                  {/* <ChevronDown className="h-4 w-4 ml-1" /> */}
                </div>
                <p className="text-xs text-gray-400">{address}</p>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center px-4">
            <header className="flex justify-end items-center p-4 gap-4 h-16 px-4 ">
              <SignedOut>
                <SignInButton>
                  <Button className="bg-indigo-900 hover:bg-indigo-400 mr-8">
                    Sign In
                  </Button>
                </SignInButton>
                {/* <SignUpButton>
                  <Button className="bg-indigo-900 hover:bg-indigo-400">
                    Sign Up
                  </Button>
                </SignUpButton> */}
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
          </div>
        </div>

        <div className="px-4 mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search for events"
              className="pl-10 bg-gray-800 border-none h-12 rounded-xl text-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <CategoryTabs
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-300">
            Blockbuster Release
          </h2>
          <div className="h-[1px] flex-1 bg-gray-800 ml-4"></div>
        </div>

        <MovieCard
          title="Sikandar"
          category="UA13+ | Hindi"
          imageUrl="/placeholder.svg?height=400&width=600"
          buttonText="Pre-book now"
        />
      </div> */}

      {/* <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-300">
            Best Offers Around You
          </h2>
          <div className="h-[1px] flex-1 bg-gray-800 ml-4"></div>
        </div>

        
      </div> */}

      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-300">
            {activeCategory === "your-tickets"
              ? "Your Tickets"
              : activeCategory === "explore"
              ? "Explore Places"
              : "Events For You"}
          </h2>
          <div className="h-[1px] flex-1 bg-gray-800 ml-4"></div>
        </div>

        {activeCategory === "your-tickets" ? (
          <>
            {!isSignedIn ? (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <h3 className="text-xl mb-3">Sign in to view your tickets</h3>
                <p className="text-gray-400 mb-6">
                  You need to be signed in to see your purchased tickets
                </p>
                <SignInButton>
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            ) : ticketsLoading ? (
              <LoadingSpinner />
            ) : ticketData && ticketData.length > 0 ? (
              // <div className="grid grid-cols-1 gap-6">
              //   {ticketData.map((ticket: any) => (
              //     <TicketsList key={ticket.id} ticket={ticket} />
              //   ))}
              // </div>
              <TicketsList tickets={ticketData} />
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <h3 className="text-xl mb-3">No tickets found</h3>
                <p className="text-gray-400 mb-6">
                  You haven't purchased any tickets yet
                </p>
                <Button
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => setActiveCategory("for-you")}
                >
                  Explore Events
                </Button>
              </div>
            )}
          </>
        ) : activeCategory === "explore" ? (
          <>
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search places by name, address, or cuisine..."
                  className="pl-10 bg-gray-800 border-none h-12 rounded-xl text-gray-300"
                  value={placesSearchQuery}
                  onChange={(e) => setPlacesSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                <span className="text-sm text-gray-400 flex-shrink-0">
                  Filter:
                </span>
                {placeCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const categoryColor = getCategoryColor(category);

                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                        isSelected
                          ? `${categoryColor} text-white`
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {getCategoryDisplayName(category)}
                    </button>
                  );
                })}
                {(selectedCategories.length > 0 || placesSearchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* View Toggle and Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""} found
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "cards"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "map"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <Map className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Places Display */}
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : (
              <PlacesMap places={filteredPlaces} />
            )}

            {filteredPlaces.length === 0 && (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <h3 className="text-xl mb-3">No places found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {eventsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {events &&
                  events.map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
