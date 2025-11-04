import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, MapPin, Calendar, Signal, Battery } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VehicleCardProps {
  vehicle: {
    devIdno: string;
    plate?: string;
    deviceNumber?: string;
    model?: string;
    state?: number;
    gpsTime?: string;
    mlat?: number;
    mlng?: number;
    signal?: number;
    battery?: number;
  };
  onClick: () => void;
}

const VehicleCard = ({ vehicle, onClick }: VehicleCardProps) => {
  const isOnline = vehicle.state === 1;
  const vehicleName = vehicle.plate || vehicle.deviceNumber || 'Unknown Vehicle';
  
  const getStatusColor = (status: number) => {
    return status === 1 
      ? "bg-success/20 text-success border-success/30" 
      : "bg-destructive/20 text-destructive border-destructive/30";
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {vehicleName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {vehicle.devIdno}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(vehicle.state || 0)}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {vehicle.model && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium text-foreground">{vehicle.model}</span>
          </div>
        )}

        {vehicle.signal !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Signal className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Signal:</span>
            <span className="font-medium text-foreground">{vehicle.signal}%</span>
          </div>
        )}

        {vehicle.battery !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Battery className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Battery:</span>
            <span className="font-medium text-foreground">{vehicle.battery}%</span>
          </div>
        )}

        {vehicle.mlat && vehicle.mlng && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">GPS:</span>
            <span className="font-medium text-foreground text-xs">
              {vehicle.mlat.toFixed(4)}, {vehicle.mlng.toFixed(4)}
            </span>
          </div>
        )}

        {vehicle.gpsTime && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last seen:</span>
            <span className="font-medium text-foreground text-xs">
              {formatDistanceToNow(new Date(vehicle.gpsTime), { addSuffix: true })}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <Button 
          variant="ghost" 
          className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
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
