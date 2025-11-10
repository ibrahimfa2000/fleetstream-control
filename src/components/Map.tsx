import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MapProps {
  vehicles?: Array<{
    id: string;
    plate_number: string;
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    is_online?: boolean;
  }>;
}

declare global {
  interface Window {
    initGoogleMaps: () => void;
    google: typeof google;
  }
}

const GoogleMap = ({ vehicles = [] }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<{ [key: string]: google.maps.Marker }>({});
  const [googleToken, setGoogleToken] = useState(
    localStorage.getItem("google_maps_token") || ""
  );
  const [tokenSaved, setTokenSaved] = useState(
    !!localStorage.getItem("google_maps_token")
  );

  // Save token and reload
  const saveToken = () => {
    if (googleToken) {
      localStorage.setItem("google_maps_token", googleToken);
      setTokenSaved(true);
      window.location.reload();
    }
  };

  // Load Google Maps script
  useEffect(() => {
    if (!mapContainer.current || !tokenSaved) return;

    const existingScript = document.getElementById("google-maps");
    if (existingScript) {
      if (window.google) initMap();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleToken}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    window.initGoogleMaps = () => initMap();
    document.head.appendChild(script);
  }, [googleToken, tokenSaved]);

  // Initialize map
  const initMap = () => {
    if (!mapContainer.current) return;

    map.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      mapTypeId: "roadmap",
    });

    updateMarkers();
  };

  // Add or update markers
  const updateMarkers = () => {
    if (!map.current || vehicles.length === 0) return;

    // Remove old markers
    Object.values(markers.current).forEach((m) => m.setMap(null));
    markers.current = {};

    const bounds = new window.google.maps.LatLngBounds();

    vehicles.forEach((vehicle) => {
      if (!vehicle.latitude || !vehicle.longitude) return;

      const position = { lat: vehicle.latitude, lng: vehicle.longitude };

      // Custom SVG marker (rotatable)
      const rotation = vehicle.heading || 0;
      const color = vehicle.is_online ? "#10b981" : "#ef4444";

      const svgMarker = {
        path: "M 0,0 L 10,20 L -10,20 Z", // small triangle shape
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1,
        rotation,
        scale: 1.5,
        anchor: new window.google.maps.Point(0, 20),
      };

      const marker = new window.google.maps.Marker({
        position,
        map: map.current!,
        icon: svgMarker,
        title: vehicle.plate_number,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold">${vehicle.plate_number}</h3>
            <p class="text-sm">Speed: ${vehicle.speed || 0} km/h</p>
            <p class="text-sm">Heading: ${vehicle.heading || 0}°</p>
            <p class="text-sm">Status: ${
              vehicle.is_online ? "Online" : "Offline"
            }</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map.current, marker);
      });

      markers.current[vehicle.id] = marker;
      bounds.extend(position);
    });

    if (vehicles.length > 0) map.current.fitBounds(bounds);
  };

  useEffect(() => {
    if (map.current) updateMarkers();
  }, [vehicles]);

  if (!tokenSaved) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg p-8">
        <div className="max-w-md w-full space-y-4">
          <div>
            <Label htmlFor="google-token">Google Maps API Key</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Get your key from{" "}
              <a
                href="https://console.cloud.google.com/google/maps-apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
            <Input
              id="google-token"
              type="text"
              value={googleToken}
              onChange={(e) => setGoogleToken(e.target.value)}
              placeholder="AIzaSy..."
              className="mb-2"
            />
            <button
              onClick={saveToken}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
            >
              Save API Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default GoogleMap;
