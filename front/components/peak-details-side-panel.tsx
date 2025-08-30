"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mountain, X, Calendar, Users, Trophy, MapPin, Clock, 
  Activity, Thermometer, Navigation, Shield, Info, 
  Camera, Star, ChevronLeft, ChevronRight, TrendingUp, Play, Route
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

interface PeakDetailsSidePanelProps {
  peak: Peak | null
  isOpen: boolean
  onClose: () => void
  onStartClimb?: (peakId: number) => void
}

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  expert: "bg-red-500/20 text-red-400 border-red-500/30"
}

export function PeakDetailsSidePanel({ peak, isOpen, onClose, onStartClimb }: PeakDetailsSidePanelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!peak) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % peak.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + peak.images.length) % peak.images.length)
  }

  const handleStartClimb = () => {
    if (peak && onStartClimb) {
      onStartClimb(peak.id)
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Side Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[28rem] z-50
        bg-gradient-to-br from-background/98 to-muted/95 backdrop-blur-md 
        border-l border-white/20 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        overflow-y-auto
      `}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/40 to-secondary/30">
          {/* Image Navigation */}
          {peak.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-full text-sm">
            {currentImageIndex + 1} / {peak.images.length}
          </div>

          {/* Peak Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">{peak.name}</h1>
              <Badge className={`text-xs ${difficultyColors[peak.difficulty as keyof typeof difficultyColors]}`}>
                {peak.difficulty.charAt(0).toUpperCase() + peak.difficulty.slice(1)}
              </Badge>
            </div>
            <p className="text-white/80 text-sm italic">"{peak.nameEnglish}"</p>
            <p className="text-white/90 text-lg font-semibold">{peak.altitude}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Distance</span>
              </div>
              <p className="text-sm font-semibold">{peak.distance}</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Duration</span>
              </div>
              <p className="text-sm font-semibold">{peak.climbingDuration}</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-secondary" />
                <span className="text-xs text-muted-foreground">Success Rate</span>
              </div>
              <p className="text-sm font-semibold text-secondary">{peak.statistics.successRate}</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3 h-3 text-secondary" />
                <span className="text-xs text-muted-foreground">Reward</span>
              </div>
              <p className="text-sm font-semibold text-secondary">{peak.reward}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              About This Peak
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{peak.description}</p>
          </div>

          {/* Technical Information - Compact */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              Technical Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-xs text-muted-foreground">Technical Grade</span>
                <span className="text-xs font-semibold">{peak.technicalGrade}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-xs text-muted-foreground">Best Season</span>
                <span className="text-xs font-semibold">{peak.bestSeason}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-xs text-muted-foreground">Base Camp</span>
                <span className="text-xs font-semibold text-right">{peak.basecamp}</span>
              </div>
            </div>
          </div>

          {/* Historical Information - Compact */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-primary" />
              History
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-3">{peak.history}</p>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">First Ascent</span>
                <span className="font-semibold">{peak.firstAscent.year}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{peak.firstAscent.climbers}</div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Average Duration</span>
                <span className="text-xs font-semibold text-primary">{peak.statistics.averageDays} days</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary/10 border border-secondary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Speed Record</span>
                <span className="text-xs font-semibold text-secondary">{peak.statistics.recordTime}</span>
              </div>
            </div>
          </div>

          {/* Permits */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Required Permits</div>
            <div className="text-xs font-semibold">{peak.permits}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-white/10 sticky bottom-0 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm">
            <Button 
              onClick={handleStartClimb}
              className="flex-1 text-sm h-9 bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600"
            >
              <Play className="w-3 h-3 mr-2" />
              Start Climb
            </Button>
            <Button variant="outline" className="px-4 text-sm h-9">
              <Route className="w-3 h-3 mr-1" />
              Route
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}