"use client"

import { useEffect, useRef } from "react"

const difficultyColors = {
  easy: "bg-green-500",
  moderate: "bg-yellow-500",
  hard: "bg-red-500",
  extreme: "bg-purple-500",
}

interface Peak {
  id: number
  name: string
  distance: string
  altitude: string
  difficulty: string
  reward: string
  coordinates: [number, number]
}

interface LeafletMapProps {
  peaks: Peak[]
  userLocation: [number, number] | null
  onPeakSelect: (id: number) => void
}

export default function LeafletMap({ peaks, userLocation, onPeakSelect }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        document.head.appendChild(script)

        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      const L = (window as any).L

      // Initialize map
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([44.2706, -71.3036], 12)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current)
      }

      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current.removeLayer(layer)
        }
      })

      // Add peak markers
      peaks.forEach((peak) => {
        const color = peak.difficulty === "easy" ? "#10b981" : peak.difficulty === "moderate" ? "#f59e0b" : "#ef4444"

        const icon = L.divIcon({
          html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: "custom-marker",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        const marker = L.marker(peak.coordinates, { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 12px; background: #111827; color: white; border-radius: 8px; min-width: 200px;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${peak.name}</div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #d1d5db; margin-bottom: 8px;">
                <span>${peak.distance}</span>
                <span>${peak.altitude}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="padding: 4px 8px; font-size: 12px; border-radius: 4px; background-color: ${color}; color: white;">
                  ${peak.difficulty}
                </span>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #10b981;">
                  ⚡ ${peak.reward}
                </div>
              </div>
            </div>
          `)

        marker.on("click", () => onPeakSelect(peak.id))
      })

      // Add user location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: "user-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        L.marker(userLocation, { icon: userIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup('<div style="padding: 8px; font-size: 14px; font-weight: 600;">Your Location</div>')
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [peaks, userLocation, onPeakSelect])

  return (
    <>
      <div ref={mapRef} className="w-full h-full z-0" style={{ height: "100%", width: "100%" }} />

      <div className="absolute bottom-4 left-4 z-10">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3">
          <div className="space-y-2">
            <div className="text-xs font-semibold mb-2">Difficulty</div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Easy
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                Moderate
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Hard
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
