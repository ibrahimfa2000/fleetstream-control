import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import Map from '@/components/Map';

const LiveTracking = () => {
  const navigate = useNavigate();
  const { vehicles } = useVehicles();
  const { latestPositions, syncGPS, isSyncing } = useGPSTracking();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  // Merge vehicle data with latest GPS positions
  const vehiclesWithPositions = vehicles?.map(vehicle => {
    const position = latestPositions?.find(p => p.vehicle_id === vehicle.id);
    return {
      ...vehicle,
      latitude: position?.latitude ? Number(position.latitude) : undefined,
      longitude: position?.longitude ? Number(position.longitude) : undefined,
      speed: position?.speed ? Number(position.speed) : undefined,
      heading: position?.heading ? Number(position.heading) : undefined,
      is_online: position?.is_online,
      address: position?.address,
      gps_time: position?.gps_time,
    };
  });

  const selectedVehicleData = selectedVehicle
    ? vehiclesWithPositions?.find(v => v.id === selectedVehicle)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-primary text-white shadow-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Live Tracking</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => syncGPS()}
              disabled={isSyncing}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync GPS
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            <div className="h-[600px]">
              <Map vehicles={vehiclesWithPositions} />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Vehicles ({vehiclesWithPositions?.length || 0})
              </h3>
              <div className="space-y-2 max-h-[550px] overflow-y-auto">
                {vehiclesWithPositions?.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedVehicle === vehicle.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{vehicle.plate_number}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          vehicle.is_online
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-destructive text-destructive-foreground'
                        }`}
                      >
                        {vehicle.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {vehicle.speed !== undefined && (
                      <p className="text-sm opacity-80">
                        Speed: {vehicle.speed.toFixed(1)} km/h
                      </p>
                    )}
                    {vehicle.address && (
                      <p className="text-xs opacity-60 truncate mt-1">{vehicle.address}</p>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {selectedVehicleData && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Vehicle Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plate:</span>
                    <span className="font-medium">{selectedVehicleData.plate_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-medium">
                      {selectedVehicleData.speed?.toFixed(1) || 0} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">
                      {selectedVehicleData.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {selectedVehicleData.address && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Location:</span>
                      <span className="text-xs">{selectedVehicleData.address}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
