"use client"

import { useState, useEffect } from "react"

export function MountainBackground() {
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{
    left: number
    top: number
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    // Generate particle positions only on client side
    const newParticles = Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }))
    
    setParticles(newParticles)
    setMounted(true)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated mountain silhouettes */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full opacity-5"
        viewBox="0 0 1200 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 600L200 400L400 300L600 200L800 350L1000 250L1200 400V600H0Z"
          fill="currentColor"
          className="text-primary animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <path
          d="M0 600L150 450L350 350L550 250L750 400L950 300L1200 450V600H0Z"
          fill="currentColor"
          className="text-secondary opacity-60 animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        />
        <path
          d="M0 600L100 500L300 400L500 300L700 450L900 350L1200 500V600H0Z"
          fill="currentColor"
          className="text-muted-foreground opacity-40 animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        />
      </svg>

      {/* Floating particles - only render on client */}
      {mounted && (
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
