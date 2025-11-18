import Image from "next/image"
import { MapPin } from "lucide-react"

interface OfferCardProps {
  title: string
  location: string
  imageUrl: string
}

export function OfferCard({ title, location, imageUrl }: OfferCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex">
        <div className="relative h-24 w-24 flex-shrink-0">
          <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
        </div>
        <div className="p-3">
          <h3 className="font-medium mb-1 line-clamp-1">{title}</h3>
          <div className="flex items-center text-xs text-gray-400">
            <MapPin className="h-3 w-3 mr-1 text-gray-500" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

