"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mountain } from "lucide-react"
import { FloatingMountain } from "@/components/floating-mountain"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-orange-50/50" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Animated Headline */}
            <div className="space-y-4">
              <div
                className={`transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gradient">Climb Higher,</span>
                  <br />
                  <span className="text-foreground">Earn More</span>
                </h1>
              </div>

              <div
                className={`transition-all duration-1000 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Join the world's first Web3 hiking platform. Track your hikes, earn HIKE tokens, and unlock exclusive
                  NFT achievements on the Flare Network.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-1000 delay-400 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-98"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Mountain className="w-5 h-5" />
                  Start Hiking
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="glass border-2 border-primary/20 hover:border-primary/40 text-foreground hover:text-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-98 bg-transparent"
              >
                Learn More
              </Button>
            </div>

            {/* Quick Stats */}
            <div
              className={`grid grid-cols-3 gap-4 pt-8 transition-all duration-1000 delay-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Hikers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-secondary">500+</div>
                <div className="text-sm text-muted-foreground">Trails</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">$1M+</div>
                <div className="text-sm text-muted-foreground">Rewards</div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Mountain Visualization */}
          <div className="relative lg:block">
            <div
              className={`transition-all duration-1000 delay-800 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              <FloatingMountain />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
