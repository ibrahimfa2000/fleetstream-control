import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Info, Signal, Battery, Navigation, Clock } from "lucide-react";

interface VehicleCardProps {
  telemntry?: any;
  vehicle: {
    id: number;
    nm: string; // vehicle name/number
    dl?: Array<{
      id: string; // device IMEI
      sim?: string; // SIM number
      ol?: number; // online status
      md?: number; // model
      gps?: number; // GPS status
    }>;
    status?: number;
    pt?: string; // plate type
  };
  onClick: () => void;
}

const VehicleCard = ({ telemntry, vehicle, onClick }: VehicleCardProps) => {
  const device = vehicle.dl?.[0]; // Get first device
  
  const getStatusColor = (onlineStatus?: number): "default" | "secondary" | "destructive" | "outline" => {
    if (onlineStatus === 1) return "default"; // Online - green
    if (onlineStatus === 2) return "secondary"; // Idle - yellow
    return "destructive"; // Offline - red
  };

  const getStatusText = (onlineStatus?: number) => {
    if (onlineStatus === 1) return "Online";
    if (onlineStatus === 2) return "Idle";
    return "Offline";
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              {vehicle.nm || vehicle.pt || `Vehicle ${vehicle.id}`}
            </CardTitle>
            <Badge variant={getStatusColor(telemntry?.[0]?.ol)}>
              {getStatusText(telemntry?.[0]?.ol)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {device && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Device ID:</span>
              <span className="font-medium text-xs">{device.id}</span>
            </div>
            
            {device.sim && (
              <div className="flex items-center gap-2 text-sm">
                <Signal className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">SIM:</span>
                <span className="font-medium">{device.sim}</span>
              </div>
            )}
            
            {device.md && (
              <div className="flex items-center gap-2 text-sm">
                <Battery className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium">{device.md}</span>
              </div>
            )}
            
            {device.gps !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">GPS:</span>
                <span className="font-medium">{telemntry?.[0]?.ps ? telemntry?.[0]?.ps : 'Inactive'}</span>
              </div>
            )}
          </>
        )}
        
        {vehicle.pt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">last update:</span>
            <span className="font-medium">{telemntry?.[0]?.gt}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
