"use client"

import { useState, useEffect } from "react"
import { ClimbMap } from "./climb-map"
import { ClimbControls } from "./climb-controls"
import { ClimbStats } from "./climb-stats"
import { MilestoneNotification } from "./milestone-notification"
import { EmergencyButton } from "./emergency-button"

export interface ClimbData {
  isActive: boolean
  startTime: Date | null
  duration: number
  altitude: number
  distance: number
  speed: number
  elevationGain: number
  currentLocation: {
    lat: number
    lng: number
  }
  targetAltitude: number
  targetDistance: number
}

export function ClimbTracker() {
  const [climbData, setClimbData] = useState<ClimbData>({
    isActive: false,
    startTime: null,
    duration: 0,
    altitude: 1247,
    distance: 0,
    speed: 0,
    elevationGain: 0,
    currentLocation: {
      lat: 46.5197,
      lng: 6.6323,
    },
    targetAltitude: 3000,
    targetDistance: 5000,
  })

  const [showMilestone, setShowMilestone] = useState<string | null>(null)

  // Simulate real-time updates when climbing is active
  useEffect(() => {
    if (!climbData.isActive) return

    const interval = setInterval(() => {
      setClimbData((prev) => {
        const newAltitude = prev.altitude + Math.random() * 2
        const newDistance = prev.distance + Math.random() * 10
        const newSpeed = 3 + Math.random() * 2 // 3-5 km/h
        const newDuration = prev.duration + 1

        // Check for milestones
        if (Math.floor(newAltitude / 500) > Math.floor(prev.altitude / 500)) {
          setShowMilestone(`${Math.floor(newAltitude / 500) * 500}m altitude reached!`)
        }

        return {
          ...prev,
          altitude: newAltitude,
          distance: newDistance,
          speed: newSpeed,
          duration: newDuration,
          elevationGain: newAltitude - 1247,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [climbData.isActive])

  const handleStartStop = () => {
    setClimbData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
      startTime: !prev.isActive ? new Date() : prev.startTime,
    }))
  }

  const handleReset = () => {
    setClimbData((prev) => ({
      ...prev,
      isActive: false,
      startTime: null,
      duration: 0,
      altitude: 1247,
      distance: 0,
      speed: 0,
      elevationGain: 0,
    }))
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Main Map */}
      <ClimbMap climbData={climbData} />

      {/* Stats Panel - Desktop Sidebar / Mobile Bottom Sheet */}
      <div className="absolute inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:w-96 lg:bottom-auto">
        <ClimbStats climbData={climbData} />
      </div>

      {/* Control Buttons */}
      <ClimbControls isActive={climbData.isActive} onStartStop={handleStartStop} onReset={handleReset} />

      {/* Emergency Button */}
      <EmergencyButton />

      {/* Milestone Notifications */}
      {showMilestone && <MilestoneNotification message={showMilestone} onClose={() => setShowMilestone(null)} />}
    </div>
  )
}
