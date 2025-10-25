import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface GPSMapProps {
  latitude: number;
  longitude: number;
  deviceName?: string;
}

const GPSMap = ({ latitude, longitude, deviceName }: GPSMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set your Mapbox access token here
    // For production, store this in Supabase Edge Function Secrets
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2lzaW9uIiwiYSI6ImNscXh5ejB6ZzBhNGwyanF4YnN4eGJ4ZjUifQ.placeholder';

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [longitude, latitude],
        zoom: 14,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create custom marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6IiBmaWxsPSIjRDRBRjM3IiBzdHJva2U9IiMyMzFGMjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0iIzIzMUYyMCIvPjwvc3ZnPg==)';
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';

      // Add marker to map
      marker.current = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px; color: #231F20;">
              <strong style="color: #D4AF37;">${deviceName || 'ApexAuto Device'}</strong><br/>
              <span style="font-size: 12px;">Lat: ${latitude.toFixed(6)}</span><br/>
              <span style="font-size: 12px;">Lng: ${longitude.toFixed(6)}</span>
            </div>`
          )
        )
        .addTo(map.current);

      // Show popup by default
      marker.current.togglePopup();

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [latitude, longitude, deviceName]);

  // If mapbox token is not configured, show placeholder
  if (!mapboxgl.accessToken || mapboxgl.accessToken.includes('placeholder')) {
    return (
      <div className="aspect-video bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg border border-border flex items-center justify-center">
        <div className="text-center space-y-3 p-6">
          <MapPin className="w-12 h-12 text-primary mx-auto" />
          <div>
            <p className="font-semibold text-foreground">GPS Location</p>
            <p className="text-sm text-muted-foreground mt-2">
              Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            Configure Mapbox token in Supabase Edge Function Secrets to enable interactive map visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="aspect-video rounded-lg shadow-elegant border border-border overflow-hidden"
    />
  );
};

export default GPSMap;
