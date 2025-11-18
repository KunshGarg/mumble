import Image from "next/image"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MovieCardProps {
  title: string
  category: string
  imageUrl: string
  buttonText: string
}

export function MovieCard({ title, category, imageUrl, buttonText }: MovieCardProps) {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-gray-400">{category}</p>
        </div>
        <Button className="rounded-full bg-transparent border border-white hover:bg-white hover:text-black transition-colors">
          {buttonText}
        </Button>
      </div>
    </div>
  )
}

