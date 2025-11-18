"use client";

import { useState } from "react";
import { Sparkles, History, Compass } from "lucide-react";

const categories = [
  { id: "for-you", name: "For you", icon: <Sparkles className="h-5 w-5" /> },
  {
    id: "your-tickets",
    name: "Your Tickets",
    icon: <History className="h-5 w-5" />,
  },
  {
    id: "explore",
    name: "Explore",
    icon: <Compass className="h-5 w-5" />,
  },
];

export function CategoryTabs(
  props: {
    activeCategory: string;
    setActiveCategory: (categoryId: string) => void;
  } & React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div className="overflow-x-auto scrollbar-hide px-4 py-2">
      <div className="flex w-full">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => props.setActiveCategory(category.id)}
            className={`flex flex-col items-center justify-center w-1/3 py-3 px-2 rounded-xl transition-colors ${
              props.activeCategory === category.id
                ? "bg-indigo-900 text-white"
                : "text-gray-400"
            }`}
          >
            <div
              className={`mb-1 ${
                props.activeCategory === category.id
                  ? category.id === "for-you"
                    ? "text-purple-400"
                    : category.id === "explore"
                    ? "text-green-400"
                    : category.id === "dining"
                    ? "text-pink-400"
                    : category.id === "ipl"
                    ? "text-amber-400"
                    : category.id === "events"
                    ? "text-yellow-400"
                    : "text-blue-400"
                  : "text-gray-400"
              }`}
            >
              {category.icon}
            </div>
            <span className="text-xs font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
