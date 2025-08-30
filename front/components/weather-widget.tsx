"use client"

import { Sun, Wind, Droplets } from "lucide-react"

export function WeatherWidget() {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sun className="w-5 h-5 text-secondary" />
          Weather
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Current Weather */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Sun className="w-12 h-12 text-secondary" />
          </div>
          <div className="text-2xl font-bold">22°C</div>
          <div className="text-sm text-muted-foreground">Partly Cloudy</div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="text-sm font-semibold">12 km/h</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="text-sm font-semibold">65%</div>
            </div>
          </div>
        </div>

        {/* Climbing Conditions */}
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-sm font-semibold text-green-600 mb-1">Excellent Climbing Conditions</div>
          <div className="text-xs text-muted-foreground">Perfect weather for your next adventure</div>
        </div>
      </div>
    </div>
  )
}
