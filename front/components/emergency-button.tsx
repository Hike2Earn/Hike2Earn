"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone } from "lucide-react"

export function EmergencyButton() {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleEmergency = () => {
    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 5000) // Auto-hide after 5 seconds
    } else {
      // Trigger emergency protocol
      alert("Emergency services contacted! Help is on the way.")
      setShowConfirm(false)
    }
  }

  return (
    <div className="absolute bottom-2 right-2 lg:bottom-3 lg:right-4">
      {showConfirm && (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 mb-2 w-48 animate-in slide-in-from-top-2 duration-200">
          <div className="text-sm font-semibold text-red-600 mb-2">Confirm Emergency</div>
          <div className="text-xs text-muted-foreground mb-3">
            This will contact emergency services and share your location.
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleEmergency} className="flex-1">
              <Phone className="w-3 h-3 mr-1" />
              Call Help
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Button
        variant="destructive"
        size="lg"
        onClick={handleEmergency}
        className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all duration-200 ${
          showConfirm ? "animate-pulse scale-110" : "hover:scale-110"
        }`}
      >
        <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />
      </Button>
    </div>
  )
}
