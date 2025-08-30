"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mountain, X, Calendar, Users, Trophy, MapPin, Clock, 
  Activity, Thermometer, Navigation, Shield, Info, 
  Camera, Star, ChevronLeft, ChevronRight, TrendingUp
} from "lucide-react"

interface Peak {
  id: number
  name: string
  nameEnglish: string
  distance: string
  altitude: string
  difficulty: string
  technicalGrade: string
  reward: string
  coordinates: [number, number]
  firstAscent: { year: number, climbers: string }
  climbingDuration: string
  bestSeason: string
  permits: string
  basecamp: string
  description: string
  history: string
  statistics: {
    successRate: string
    averageDays: number
    recordTime: string
  }
  images: string[]
}

interface PeakDetailsModalProps {
  peak: Peak | null
  isOpen: boolean
  onClose: () => void
}

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  expert: "bg-red-500/20 text-red-400 border-red-500/30"
}

export function PeakDetailsModal({ peak, isOpen, onClose }: PeakDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen || !peak) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % peak.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + peak.images.length) % peak.images.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-background/95 to-muted/95 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left Column - Images */}
          <div className="lg:w-1/2 relative">
            {/* Image Gallery */}
            <div className="relative h-64 lg:h-full bg-gradient-to-br from-primary/30 to-secondary/20">
              {/* Placeholder for actual images */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/30" />
              
              {/* Image Navigation */}
              {peak.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-full text-sm">
                {currentImageIndex + 1} / {peak.images.length}
              </div>

              {/* Peak Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{peak.name}</h1>
                  <Badge className={`${difficultyColors[peak.difficulty as keyof typeof difficultyColors]}`}>
                    {peak.difficulty.charAt(0).toUpperCase() + peak.difficulty.slice(1)}
                  </Badge>
                </div>
                <p className="text-white/80 text-sm italic">"{peak.nameEnglish}"</p>
                <p className="text-white/90 text-lg font-semibold">{peak.altitude}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:w-1/2 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Distance</span>
                  </div>
                  <p className="text-lg font-semibold">{peak.distance}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Duration</span>
                  </div>
                  <p className="text-lg font-semibold">{peak.climbingDuration}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                  </div>
                  <p className="text-lg font-semibold text-secondary">{peak.statistics.successRate}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Reward</span>
                  </div>
                  <p className="text-lg font-semibold text-secondary">{peak.reward}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  About This Peak
                </h3>
                <p className="text-muted-foreground leading-relaxed">{peak.description}</p>
              </div>

              {/* Historical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-primary" />
                  History
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-3">{peak.history}</p>
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">First Ascent</span>
                    <span className="font-semibold">{peak.firstAscent.year}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">Climbers</span>
                    <span className="font-semibold text-right">{peak.firstAscent.climbers}</span>
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  Technical Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-muted-foreground">Technical Grade</span>
                    <span className="font-semibold">{peak.technicalGrade}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-muted-foreground">Best Season</span>
                    <span className="font-semibold">{peak.bestSeason}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-muted-foreground">Base Camp</span>
                    <span className="font-semibold text-right">{peak.basecamp}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-muted-foreground mb-2">Required Permits</div>
                    <div className="font-semibold text-sm">{peak.permits}</div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Climbing Statistics
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="text-muted-foreground">Average Duration</span>
                    <span className="font-semibold text-primary">{peak.statistics.averageDays} days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <span className="text-muted-foreground">Speed Record</span>
                    <span className="font-semibold text-secondary">{peak.statistics.recordTime}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                  <Trophy className="w-4 h-4 mr-2" />
                  Start Campaign
                </Button>
                <Button variant="outline" className="px-6">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}