"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Users, Zap } from "lucide-react"

export function ChallengeWidget() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 }
        }
        return prev
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full min-h-[240px]">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="w-5 h-5 text-secondary" />
            Active Challenge
          </div>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            Featured
          </Badge>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Challenge Image */}
        <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
          <img src="/mountain-peak-challenge.png" alt="Summit Challenge" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <h3 className="font-semibold">Summit Challenge</h3>
            <p className="text-xs opacity-90">Reach 3000m altitude</p>
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              Reward
            </div>
            <div className="text-lg font-bold text-secondary">500 HIKE</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              Participants
            </div>
            <div className="text-lg font-bold">1,247/2,000</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">2,847m / 3,000m</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: "94.9%" }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time left</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono font-semibold">
            <span>{timeLeft.days}d</span>
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold">
          Continue Challenge
        </Button>
      </div>
    </div>
  )
}
