"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Camera } from "lucide-react"

interface ClimbControlsProps {
  isActive: boolean
  onStartStop: () => void
  onReset: () => void
}

export function ClimbControls({ isActive, onStartStop, onReset }: ClimbControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 lg:bottom-6">
      <div className="flex items-center gap-4">
        {/* Reset Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="glass w-14 h-14 rounded-full p-0 hover:scale-110 transition-transform duration-200 bg-transparent"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>

        {/* Main Start/Stop Button */}
        <Button
          size="lg"
          onClick={onStartStop}
          className={`w-20 h-20 rounded-full p-0 relative overflow-hidden transition-all duration-300 ${
            isActive
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          } hover:scale-110 active:scale-95`}
        >
          <div className="relative z-10">
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </div>

          {/* Ripple Effect */}
          <div
            className={`absolute inset-0 rounded-full ${
              isActive ? "bg-red-400" : "bg-primary/80"
            } animate-ping opacity-20`}
          />
        </Button>

        {/* Camera Button */}
        <Button
          variant="outline"
          size="lg"
          className="glass w-14 h-14 rounded-full p-0 hover:scale-110 transition-transform duration-200 animate-bounce bg-transparent"
          style={{ animationDuration: "2s" }}
        >
          <Camera className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
