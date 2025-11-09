import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Fuel, Gauge, User } from "lucide-react";
import { useCMSV6Vehicles } from "@/hooks/useCMSV6Data";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export const VehicleList = () => {
  const { data, isLoading, error } = useCMSV6Vehicles();
const navigate = useNavigate();
  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Vehicle Status</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const vehicles = data?.vehicles || [];
  const hasRealData = vehicles.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving":
        return "bg-success text-success-foreground";
      case "idle":
        return "bg-warning text-warning-foreground";
      case "parked":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Vehicle Status</h2>
        {!hasRealData && (
          <Badge variant="outline" className="text-muted-foreground">
            No vehicles found
          </Badge>
        )}
        {hasRealData && (
          <Badge variant="outline" className="text-success">
            Live - {vehicles.length} vehicles
          </Badge>
        )}
      </div>
      <div className="space-y-4">
        {vehicles.map((vehicle: any, index: number) => (
          <div
            key={vehicle.id || vehicle.vehicleId || index}
            className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
            onClick={() => navigate(`/vehicle/${vehicle.dl?.[0]?.id || vehicle.id}`, { state: { vehicle } })}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {vehicle.nm || vehicle.name || vehicle.plateNumber || `Vehicle ${index + 1}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  ID: {vehicle.id || `V-${String(index + 1).padStart(3, '0')}`}
                </p>
              </div>
              <Badge className={getStatusColor(vehicle.status || 'parked')}>
                {vehicle.status || 'parked'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{vehicle.driver || vehicle.driverName || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <span>{vehicle.sp || '0 km/h'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-muted-foreground" />
                <span>{vehicle.fuel || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{vehicle.location || vehicle.address || 'Unknown'}</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-3">
              Last update: {vehicle.lastUpdate || vehicle.updateTime || 'Unknown'}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
