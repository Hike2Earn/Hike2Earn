"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] lg:min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

const nearbyPeaks = [
  {
    id: 1,
    name: "Mount Washington",
    distance: "2.3 km",
    altitude: "1,916m",
    difficulty: "moderate",
    reward: "45 HIKE",
    coordinates: [44.2706, -71.3036] as [number, number],
  },
  {
    id: 2,
    name: "Eagle Peak",
    distance: "5.7 km",
    altitude: "2,847m",
    difficulty: "hard",
    reward: "89 HIKE",
    coordinates: [44.2856, -71.2889] as [number, number],
  },
  {
    id: 3,
    name: "Sunset Ridge",
    distance: "1.8 km",
    altitude: "1,234m",
    difficulty: "easy",
    reward: "23 HIKE",
    coordinates: [44.2556, -71.3186] as [number, number],
  },
]

export function MapWidget() {
  const [selectedPeak, setSelectedPeak] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.log("Geolocation error:", error)
        },
      )
    }
  }, [])

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full min-h-[400px] lg:min-h-[500px]">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="w-5 h-5 text-primary" />
            Nearby Peaks
          </div>
          <Button variant="outline" size="sm" className="glass bg-transparent">
            <Navigation className="w-4 h-4 mr-2" />
            Navigate
          </Button>
        </div>
      </div>

      <div className="p-0 flex-1">
        <div className="relative h-full min-h-[300px] lg:min-h-[400px] rounded-lg overflow-hidden">
          <LeafletMap peaks={nearbyPeaks} userLocation={userLocation} onPeakSelect={setSelectedPeak} />
        </div>
      </div>
    </div>
  )
}
