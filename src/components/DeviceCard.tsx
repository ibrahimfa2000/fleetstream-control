import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Signal, Battery, HardDrive, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

interface DeviceCardProps {
  device: {
    id: string;
    name: string;
    imei: string;
    model?: string;
    status: string;
    last_seen?: string;
    firmware_version?: string;
  };
  telemetry?: {
    signal_strength?: number;
    battery_level?: number;
    storage_free_mb?: number;
    gps_lat?: number;
    gps_lon?: number;
  };
  subscription?: {
    status: string;
  };
  onClick: () => void;
}

const DeviceCard = ({ device, telemetry, subscription, onClick }: DeviceCardProps) => {
  const { t } = useTranslation();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success/20 text-success border-success/30";
      case "offline":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-warning/20 text-warning border-warning/30";
    }
  };

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/20 text-success border-success/30";
      case "suspended":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <Card className="group hover:border-primary/50 transition-all hover:shadow-elegant cursor-pointer bg-gradient-secondary border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                {device.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">IMEI: {device.imei}</p>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(device.status)}>
            {t(`device.status.${device.status}`)}
          </Badge>
        </div>

        {device.model && (
          <p className="text-sm text-muted-foreground mb-3">
            Model: {device.model}
          </p>
        )}

        {telemetry && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {telemetry.signal_strength !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Signal className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{telemetry.signal_strength} dBm</span>
              </div>
            )}
            {telemetry.battery_level !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Battery className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{telemetry.battery_level}%</span>
              </div>
            )}
            {telemetry.storage_free_mb !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{Math.round(telemetry.storage_free_mb / 1024)} GB</span>
              </div>
            )}
            {telemetry.gps_lat !== undefined && telemetry.gps_lon !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">GPS</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-primary/10">
          <div className="flex flex-col gap-1.5">
            {subscription && (
              <Badge variant="outline" className={getSubscriptionColor(subscription.status)}>
                {subscription.status}
              </Badge>
            )}
            {device.last_seen && (
              <span className="text-xs text-muted-foreground">
                Last seen {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })}
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClick} className="hover:bg-primary/10 hover:text-primary border-primary/30">
            {t('device.viewDetails')} →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
