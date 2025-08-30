"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Award, MapPin } from "lucide-react"

export function FloatingMountain() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="relative w-full h-96 lg:h-[500px]">
      {/* Main Mountain Visualization */}
      <div
        className="relative w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
        }}
      >
        {/* Mountain SVG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="400"
            height="300"
            viewBox="0 0 400 300"
            fill="none"
            className="w-full h-full max-w-md animate-pulse"
            style={{ animationDuration: "4s" }}
          >
            {/* Mountain Peaks */}
            <path
              d="M50 250L120 120L200 80L280 140L350 250H50Z"
              fill="url(#mountainGradient)"
              className="drop-shadow-lg"
            />
            <path
              d="M80 250L140 160L220 100L300 180L350 250H80Z"
              fill="url(#mountainGradient2)"
              className="drop-shadow-md opacity-80"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgb(234 88 12)" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(234 88 12)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Peak Markers */}
            <circle cx="200" cy="80" r="4" fill="rgb(234 88 12)" className="animate-pulse" />
            <circle
              cx="120"
              cy="120"
              r="3"
              fill="rgb(16 185 129)"
              className="animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <circle
              cx="280"
              cy="140"
              r="3"
              fill="rgb(234 88 12)"
              className="animate-pulse"
              style={{ animationDelay: "2s" }}
            />
          </svg>
        </div>

        {/* Floating Info Cards */}
        <div
          className="absolute top-16 right-8 transition-transform duration-500"
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
          }}
        >
          <div
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 w-48 animate-float"
            style={{ animationDelay: "0s" }}
          >
            <div className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">2,847m</div>
                  <div className="text-xs text-muted-foreground">Altitude Gained</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-20 left-8 transition-transform duration-500"
          style={{
            transform: `translate(${mousePosition.x * -0.2}px, ${mousePosition.y * -0.2}px)`,
          }}
        >
          <div
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 w-44 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Award className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">156 HIKE</div>
                  <div className="text-xs text-muted-foreground">Tokens Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute top-32 left-12 transition-transform duration-500"
          style={{
            transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`,
          }}
        >
          <div
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 w-40 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <div className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Mt. Everest</div>
                  <div className="text-xs text-muted-foreground">Next Challenge</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
