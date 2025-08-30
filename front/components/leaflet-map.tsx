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
  nameEnglish: string
  distance: string
  altitude: string
  difficulty: string
  technicalGrade: string
  reward: string
  coordinates: [number, number]
  firstAscent: { year: number, climbers: string }
  climbingDuration: string
  bestSeason: string
  permits: string
  basecamp: string
  description: string
  history: string
  statistics: {
    successRate: string
    averageDays: number
    recordTime: string
  }
  images: string[]
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
    if (!mapRef.current) {
      console.log("Map container not available yet")
      return
    }

    const loadLeaflet = async () => {
      try {
        console.log("Starting to load Leaflet...")
        
        // Load CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          console.log("Loading Leaflet CSS...")
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Load JS
        if (!(window as any).L) {
          console.log("Loading Leaflet JavaScript...")
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          document.head.appendChild(script)

          await new Promise((resolve, reject) => {
            script.onload = () => {
              console.log("Leaflet JavaScript loaded successfully")
              resolve(true)
            }
            script.onerror = () => {
              console.error("Failed to load Leaflet JavaScript")
              reject(new Error("Failed to load Leaflet"))
            }
          })
        } else {
          console.log("Leaflet already loaded")
        }

        const L = (window as any).L

        if (!L) {
          throw new Error("Leaflet library not available")
        }

        // Initialize map centered on Mendoza region
        if (!mapInstanceRef.current && mapRef.current) {
          console.log("Initializing map...")
          console.log("Map container dimensions:", mapRef.current.offsetWidth, "x", mapRef.current.offsetHeight)
          
          mapInstanceRef.current = L.map(mapRef.current).setView([-32.8895, -68.8458], 8)

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapInstanceRef.current)
          
          console.log("Map initialized successfully")
        }

        // Clear existing markers
        if (mapInstanceRef.current) {
          mapInstanceRef.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              mapInstanceRef.current.removeLayer(layer)
            }
          })
        }

        // Add peak markers
        console.log("Adding", peaks.length, "peak markers to map")
        peaks.forEach((peak, index) => {
          console.log(`Adding marker ${index + 1}:`, peak.name, peak.coordinates)
        const color = peak.difficulty === "easy" ? "#10b981" : 
                     peak.difficulty === "intermediate" ? "#f59e0b" : 
                     peak.difficulty === "advanced" ? "#f97316" : 
                     peak.difficulty === "expert" ? "#ef4444" : "#8b5cf6"

        const icon = L.divIcon({
          html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">⛰</div>`,
          className: "custom-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        // Create a more compact popup for better positioning
        const popup = L.popup({
          maxWidth: 250,
          minWidth: 200,
          autoPan: true,
          autoPanPadding: [20, 20],
          closeButton: true,
          offset: [0, -10]
        }).setContent(`
          <div style="padding: 12px; background: linear-gradient(135deg, #111827 0%, #1f2937 100%); color: white; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <div style="font-weight: 700; font-size: 14px; color: #ffffff;">${peak.name}</div>
              <span style="padding: 2px 4px; font-size: 8px; border-radius: 4px; background-color: ${color}; color: white; font-weight: 600;">
                ${peak.difficulty.toUpperCase()}
              </span>
            </div>
            
            <div style="font-size: 10px; color: #9ca3af; margin-bottom: 8px; font-style: italic;">
              "${peak.nameEnglish}"
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; margin-bottom: 8px;">
              <div>
                <div style="color: #6b7280; font-size: 9px;">ELEVATION</div>
                <div style="font-weight: 600; color: #ffffff;">${peak.altitude}</div>
              </div>
              <div>
                <div style="color: #6b7280; font-size: 9px;">REWARD</div>
                <div style="font-weight: 600; color: #10b981;">${peak.reward}</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; margin-top: 8px;">
              <button style="padding: 4px 12px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border: none; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer; width: 100%;">
                View Full Details
              </button>
            </div>
          </div>
        `)

        const marker = L.marker(peak.coordinates, { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(popup)

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

        console.log("Map setup completed successfully")
      } catch (error) {
        console.error("Error setting up map:", error)
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
      <div ref={mapRef} className="w-full h-full z-0" style={{ height: "100%", width: "100%", minHeight: "300px" }} />

      <div className="absolute bottom-4 left-4 z-10">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3">
          <div className="space-y-2">
            <div className="text-xs font-semibold mb-2">Difficulty</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Easy
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                Intermediate
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                Advanced
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Expert
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
