"use client"

import { useEffect, useRef } from "react"

interface DeviceMapProps {
  lat: number
  lon: number
  deviceName?: string
}

export function DeviceMap({ lat, lon, deviceName }: DeviceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    const initMap = async () => {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Clean up previous map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Initialize map
      const map = L.map(mapRef.current, {
  attributionControl: true, // default = true
}).setView([lat, lon], 30)

      // Add OpenStreetMap tiles
      const baseLayers = {
        "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "ApexCam © maps",
    maxZoom: 18,
  }),
  "Topo": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: "ApexCam © maps",
  }),
  
  "OSM": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "ApexCam © maps",
  }),
}

// Add one by default
baseLayers["Satellite"].addTo(map)

// Add the layer switch control
L.control.layers(baseLayers).addTo(map)
      
      // Add marker with popup
      const marker = L.marker([lat, lon]).addTo(map)
      if (deviceName) {
        marker
          .bindPopup(`<b>${deviceName}</b><br>Lat: ${lat?.toFixed(6)}<br>Lon: ${lon?.toFixed(6)}`)
          .openPopup()
      }

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lon, deviceName])

  return (
    <div className="relative w-full h-[200px] rounded-lg overflow-hidden border border-border/50">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
