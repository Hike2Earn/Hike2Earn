"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import { PeakDetailsSidePanel } from "./peak-details-side-panel"

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] lg:min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

const mendozaPeaks = [
  {
    id: 1,
    name: "Aconcagua",
    nameEnglish: "Stone Sentinel",
    distance: "230 km",
    altitude: "6,962m",
    difficulty: "expert",
    technicalGrade: "PD (Peu Difficile)",
    reward: "2500 HIKE",
    coordinates: [-32.6532, -70.0109] as [number, number],
    firstAscent: { year: 1897, climbers: "Matthias Zurbriggen" },
    climbingDuration: "14-20 days",
    bestSeason: "December - February",
    permits: "Aconcagua Provincial Park permit required",
    basecamp: "Plaza de Mulas (4,300m)",
    description: "The highest peak in both the Western and Southern Hemispheres, Aconcagua stands as the ultimate challenge for mountaineers in South America.",
    history: "Known as 'Stone Sentinel' by the Quechua people, Aconcagua was first conquered by Swiss guide Matthias Zurbriggen in 1897. The mountain has since become a proving ground for climbers preparing for the world's highest peaks.",
    statistics: {
      successRate: "40%",
      averageDays: 16,
      recordTime: "5h 45m (speed ascent)"
    },
    images: ["/peaks/aconcagua-1.jpg", "/peaks/aconcagua-2.jpg", "/peaks/aconcagua-3.jpg"]
  },
  {
    id: 2,
    name: "Cerro Mercedario",
    nameEnglish: "Mercedario Peak",
    distance: "280 km",
    altitude: "6,770m",
    difficulty: "expert",
    technicalGrade: "AD (Assez Difficile)",
    reward: "2200 HIKE",
    coordinates: [-31.9714, -70.1175] as [number, number],
    firstAscent: { year: 1934, climbers: "Polish expedition led by Adam Karpiński" },
    climbingDuration: "12-16 days",
    bestSeason: "December - March",
    permits: "San Juan Province climbing permit",
    basecamp: "Base Mercedario (4,200m)",
    description: "Argentina's second-highest peak, offering a more technical and remote climbing experience than Aconcagua.",
    history: "First climbed by a Polish expedition in 1934, Mercedario remained relatively unknown until recent decades. Its remote location and technical challenges make it a coveted prize for experienced mountaineers.",
    statistics: {
      successRate: "25%",
      averageDays: 14,
      recordTime: "7h 12m (speed ascent)"
    },
    images: ["/peaks/mercedario-1.jpg", "/peaks/mercedario-2.jpg"]
  },
  {
    id: 3,
    name: "Cerro Tupungato",
    nameEnglish: "Tupungato Volcano",
    distance: "150 km",
    altitude: "6,570m",
    difficulty: "advanced",
    technicalGrade: "PD+ (Peu Difficile Plus)",
    reward: "1800 HIKE",
    coordinates: [-33.3833, -69.8167] as [number, number],
    firstAscent: { year: 1897, climbers: "Stuart Vines and Nicola Lanti" },
    climbingDuration: "10-14 days",
    bestSeason: "November - March",
    permits: "Chilean-Argentine border crossing permit",
    basecamp: "Tupungato Base Camp (4,000m)",
    description: "A massive stratovolcano straddling the Chilean-Argentine border, known for its glaciated summit and technical ice climbing.",
    history: "One of the first major peaks climbed in the Andes, Tupungato was conquered in the same year as Aconcagua. The volcano's last eruption occurred around 1986, leaving behind a challenging glaciated peak.",
    statistics: {
      successRate: "35%",
      averageDays: 12,
      recordTime: "6h 30m (speed ascent)"
    },
    images: ["/peaks/tupungato-1.jpg", "/peaks/tupungato-2.jpg"]
  },
  {
    id: 4,
    name: "Cerro Plata",
    nameEnglish: "Silver Peak",
    distance: "120 km",
    altitude: "6,100m",
    difficulty: "advanced",
    technicalGrade: "PD (Peu Difficile)",
    reward: "1500 HIKE",
    coordinates: [-33.2167, -69.9167] as [number, number],
    firstAscent: { year: 1896, climbers: "Robert Helbling" },
    climbingDuration: "8-12 days",
    bestSeason: "December - February",
    permits: "Mendoza Province permit",
    basecamp: "Plata Base Camp (3,800m)",
    description: "A beautiful peak offering excellent training for higher summits, with spectacular views of the Aconcagua massif.",
    history: "Named for its silvery appearance when covered in snow, Cerro Plata was one of the earliest major peaks climbed in the region. It serves as an excellent acclimatization peak for Aconcagua attempts.",
    statistics: {
      successRate: "60%",
      averageDays: 10,
      recordTime: "4h 45m (speed ascent)"
    },
    images: ["/peaks/plata-1.jpg", "/peaks/plata-2.jpg"]
  },
  {
    id: 5,
    name: "Cerro El Plomo",
    nameEnglish: "Lead Peak",
    distance: "180 km",
    altitude: "5,424m",
    difficulty: "intermediate",
    technicalGrade: "F (Facile)",
    reward: "800 HIKE",
    coordinates: [-33.2333, -70.2167] as [number, number],
    firstAscent: { year: 1896, climbers: "Federico Reichert" },
    climbingDuration: "2-4 days",
    bestSeason: "November - April",
    permits: "Chilean National Parks permit",
    basecamp: "Refugio Federación (3,200m)",
    description: "Visible from Santiago, this peak offers one of the best views in the central Andes and serves as excellent training for higher peaks.",
    history: "El Plomo holds archaeological significance with Inca mummy discoveries near its summit. The mountain has been climbed for centuries and remains one of the most popular training peaks in the region.",
    statistics: {
      successRate: "85%",
      averageDays: 3,
      recordTime: "3h 20m (speed ascent)"
    },
    images: ["/peaks/plomo-1.jpg", "/peaks/plomo-2.jpg"]
  },
  {
    id: 6,
    name: "Cerro Vallecitos",
    nameEnglish: "Little Valleys Peak",
    distance: "95 km",
    altitude: "5,462m",
    difficulty: "intermediate",
    technicalGrade: "PD (Peu Difficile)",
    reward: "900 HIKE",
    coordinates: [-33.0833, -69.3833] as [number, number],
    firstAscent: { year: 1952, climbers: "Argentine Mountain Club" },
    climbingDuration: "3-5 days",
    bestSeason: "December - March",
    permits: "Vallecitos Provincial Park permit",
    basecamp: "Vallecitos Ski Resort (3,000m)",
    description: "A popular training peak for Aconcagua, offering technical climbing experience with excellent access from Mendoza.",
    history: "Located near Argentina's highest ski resort, Vallecitos has become a favorite training ground for mountaineers. The peak offers various routes of different difficulties.",
    statistics: {
      successRate: "70%",
      averageDays: 4,
      recordTime: "4h 15m (speed ascent)"
    },
    images: ["/peaks/vallecitos-1.jpg", "/peaks/vallecitos-2.jpg"]
  }
]

interface MapWidgetProps {
  onPeakSelect?: (peakId: number | null) => void
  selectedPeakId?: number | null
}

export function MapWidget({ onPeakSelect, selectedPeakId }: MapWidgetProps = {}) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  
  const selectedPeak = mendozaPeaks.find(peak => peak.id === selectedPeakId)

  const handlePeakSelect = (id: number) => {
    onPeakSelect?.(id)
  }

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
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full max-h-full flex flex-col overflow-hidden">
      <div className="p-6 pb-4 flex-shrink-0">
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

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="relative h-full rounded-b-xl overflow-hidden">
          <LeafletMap peaks={mendozaPeaks} userLocation={userLocation} onPeakSelect={handlePeakSelect} />
        </div>
      </div>
      
    </div>
  )
}
