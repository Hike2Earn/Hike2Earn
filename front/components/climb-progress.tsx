"use client"

import { Mountain, Route } from "lucide-react"
import type { ClimbData } from "./climb-tracker"

interface ClimbProgressProps {
  climbData: ClimbData
}

export function ClimbProgress({ climbData }: ClimbProgressProps) {
  const altitudeProgress = (climbData.altitude / climbData.targetAltitude) * 100
  const distanceProgress = (climbData.distance / climbData.targetDistance) * 100

  return (
    <div className="absolute top-20 left-4 space-y-3 lg:left-1/2 lg:transform lg:-translate-x-1/2">
      {/* Altitude Progress */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 w-48">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgb(229 231 235)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgb(16 185 129)"
                strokeWidth="2"
                strokeDasharray={`${altitudeProgress}, 100`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Altitude Goal</div>
            <div className="text-xs text-muted-foreground">
              {climbData.altitude.toFixed(0)}m / {climbData.targetAltitude}m
            </div>
            <div className="text-xs text-primary font-semibold">{altitudeProgress.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Distance Progress */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 w-48">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgb(229 231 235)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgb(234 88 12)"
                strokeWidth="2"
                strokeDasharray={`${distanceProgress}, 100`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Route className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Distance Goal</div>
            <div className="text-xs text-muted-foreground">
              {(climbData.distance / 1000).toFixed(1)}km / {(climbData.targetDistance / 1000).toFixed(1)}km
            </div>
            <div className="text-xs text-secondary font-semibold">{distanceProgress.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
