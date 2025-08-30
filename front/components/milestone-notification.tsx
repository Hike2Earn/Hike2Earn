"use client"

import { useEffect, useState } from "react"
import { Trophy, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MilestoneNotificationProps {
  message: string
  onClose: () => void
}

export function MilestoneNotification({ message, onClose }: MilestoneNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setIsVisible(true)

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div
        className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 w-80 text-center transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="space-y-4">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">Milestone Reached!</h3>
            <p className="text-secondary font-semibold">{message}</p>
          </div>

          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-secondary rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="absolute top-2 right-2 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
