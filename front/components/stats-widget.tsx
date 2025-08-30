"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Mountain, Zap } from "lucide-react"

export function StatsWidget() {
  const [animatedValues, setAnimatedValues] = useState({
    altitude: 0,
    tokens: 0,
    climbs: 0,
  })

  const targetValues = {
    altitude: 2847,
    tokens: 156,
    climbs: 12,
  }

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedValues({
        altitude: Math.floor(targetValues.altitude * progress),
        tokens: Math.floor(targetValues.tokens * progress),
        climbs: Math.floor(targetValues.climbs * progress),
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedValues(targetValues)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="w-5 h-5 text-primary" />
          Today's Progress
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Altitude Gained */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Altitude Gained</span>
            </div>
            <span className="text-sm font-semibold">{animatedValues.altitude}m</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${(animatedValues.altitude / 3000) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* HIKE Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              <span className="text-sm text-muted-foreground">HIKE Earned</span>
            </div>
            <span className="text-sm font-semibold text-secondary">{animatedValues.tokens}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${(animatedValues.tokens / 200) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Climbs Completed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Climbs Completed</span>
            <span className="text-sm font-semibold">{animatedValues.climbs}/15</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(animatedValues.climbs / 15) * 100}%` }}
            />
          </div>
        </div>

        {/* Weekly Sparkline */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-muted-foreground mb-2">Last 7 days</div>
          <div className="flex items-end gap-1 h-12">
            {[40, 65, 30, 80, 45, 90, 75].map((height, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-sm transition-all duration-300 hover:from-primary hover:to-primary/80"
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
