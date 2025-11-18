"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface EventImage {
  id: string;
  url: string;
  altText: string | null;
}

interface ImageCarouselProps {
  images: EventImage[]
  activeIndex: number
  onPrev: () => void
  onNext: () => void
}

export function ImageCarousel({ images, activeIndex, onPrev, onNext }: ImageCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <span className="text-gray-600">No images available</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-300 ${
            index === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={image.url || "/placeholder.svg?height=400&width=600"}
            alt={image.altText || `Image ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 flex items-center justify-center z-10"
        aria-label="Previous image"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 flex items-center justify-center z-10"
        aria-label="Next image"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex 
                ? "w-4 bg-white" 
                : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
