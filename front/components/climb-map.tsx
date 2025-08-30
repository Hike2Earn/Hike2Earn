"use client"

import { useEffect, useState, useRef } from "react"
import { Navigation } from "lucide-react"
import type { ClimbData } from "./climb-tracker"

interface ClimbMapProps {
  climbData: ClimbData
}

export function ClimbMap({ climbData }: ClimbMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [routePath, setRoutePath] = useState<[number, number][]>([])
  const currentPosition: [number, number] = [climbData.currentLocation.lat, climbData.currentLocation.lng]

  useEffect(() => {
    if (climbData.isActive) {
      setRoutePath((prev) => [...prev, currentPosition])
    }
  }, [climbData.currentLocation, climbData.isActive])

  useEffect(() => {
    if (!climbData.isActive) {
      setRoutePath([currentPosition])
    }
  }, [climbData.isActive])

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
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: false,
        }).setView(currentPosition, 16)

        // Base layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current)

        // Satellite overlay
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
          opacity: 0.7,
        }).addTo(mapInstanceRef.current)
      }

      // Update map center
      mapInstanceRef.current.setView(currentPosition, mapInstanceRef.current.getZoom())

      // Update user marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }

      const userIcon = L.divIcon({
        html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        className: "user-location-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      markerRef.current = L.marker(currentPosition, { icon: userIcon }).addTo(mapInstanceRef.current)

      // Update route path
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current)
      }

      if (routePath.length > 1) {
        routeLayerRef.current = L.polyline(routePath, {
          color: "#10b981",
          weight: 4,
          opacity: 1,
        }).addTo(mapInstanceRef.current)
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        routeLayerRef.current = null
        markerRef.current = null
      }
    }
  }, [climbData.isActive, routePath])

  return (
    <div className="absolute inset-0">
      <div ref={mapRef} className="w-full h-full z-0" style={{ height: "100%", width: "100%" }} />

      {/* Compass */}
      <div className="absolute top-4 right-4 z-10">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3">
          <div className="flex items-center justify-center w-12 h-12">
            <Navigation className="w-6 h-6 text-primary" style={{ transform: "rotate(45deg)" }} />
          </div>
          <div className="text-xs text-center text-muted-foreground mt-1">NE</div>
        </div>
      </div>

      {/* Status Badge */}
    </div>
  )
}
