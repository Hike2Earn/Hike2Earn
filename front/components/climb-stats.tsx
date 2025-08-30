"use client"
import { Badge } from "@/components/ui/badge"
import { Mountain, Timer, Gauge, TrendingUp, Cloud, Wind, Droplets, Route } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { ClimbData } from "./climb-tracker"

interface ClimbStatsProps {
  climbData: ClimbData
}

// Mock elevation data for the chart
const elevationData = [
  { time: 0, elevation: 1247 },
  { time: 5, elevation: 1280 },
  { time: 10, elevation: 1320 },
  { time: 15, elevation: 1380 },
  { time: 20, elevation: 1450 },
  { time: 25, elevation: 1520 },
  { time: 30, elevation: 1600 },
]

export function ClimbStats({ climbData }: ClimbStatsProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const altitudeProgress = (climbData.altitude / climbData.targetAltitude) * 100
  const distanceProgress = (climbData.distance / climbData.targetDistance) * 100

  return (
    <div className="h-full lg:h-screen flex flex-col">
      {/* Mobile Handle */}
      <div className="lg:hidden flex justify-center py-2">
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
      </div>

      <div className="flex-1 glass-strong border-t lg:border-l lg:border-t-0 border-white/10 overflow-y-auto">
        <div className="p-3 space-y-3">
          {/* Live Metrics - Stats without GlassCard wrappers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Live Metrics</h2>
              <Badge
                variant={climbData.isActive ? "default" : "secondary"}
                className={`${
                  climbData.isActive ? "bg-green-500 text-white animate-pulse" : "bg-muted text-muted-foreground"
                }`}
              >
                {climbData.isActive ? "Tracking Active" : "Tracking Paused"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Altitude Goal */}
              <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
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
                      <Mountain className="w-4 h-4 text-primary" />
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

              {/* Distance Goal */}
              <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
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
                      <Route className="w-4 h-4 text-secondary" />
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

            {/* Altitude */}
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Altitude</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  +{climbData.elevationGain.toFixed(0)}m
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{climbData.altitude.toFixed(0)}m</div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${(climbData.altitude / climbData.targetAltitude) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Target: {climbData.targetAltitude}m</div>
            </div>

            {/* Speed & Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-semibold">Speed</span>
                </div>
                <div className="text-xl font-bold text-secondary">{climbData.speed.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">km/h</div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Distance</span>
                </div>
                <div className="text-xl font-bold text-primary">{(climbData.distance / 1000).toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">km</div>
              </div>
            </div>

            {/* Duration */}
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Duration</span>
              </div>
              <div className="text-xl font-bold font-mono">{formatDuration(climbData.duration)}</div>
            </div>
          </div>

          {/* Elevation Chart */}
          <div className="space-y-3">
            <h3 className="font-semibold">Elevation Profile</h3>
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={elevationData}>
                    <defs>
                      <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(16 185 129)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="rgb(16 185 129)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "rgb(107 114 128)" }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgb(107 114 128)" }} />
                    <Area
                      type="monotone"
                      dataKey="elevation"
                      stroke="rgb(16 185 129)"
                      strokeWidth={2}
                      fill="url(#elevationGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Weather Conditions</h3>
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <Cloud className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                  <div className="text-sm font-semibold">18°C</div>
                  <div className="text-xs text-muted-foreground">Cloudy</div>
                </div>
                <div>
                  <Wind className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-sm font-semibold">15 km/h</div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                </div>
                <div>
                  <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-sm font-semibold">72%</div>
                  <div className="text-xs text-muted-foreground">Humidity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
