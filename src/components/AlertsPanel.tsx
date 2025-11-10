import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, Clock } from "lucide-react";
import { useCMSV6Alerts } from "@/hooks/useCMSV6Data";
import { Skeleton } from "@/components/ui/skeleton";

export const AlertsPanel = () => {
  const { data, isLoading, error } = useCMSV6Alerts();

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const alerts = data?.alerts || [];
  const hasRealData = alerts.length > 0;

  const getAlertType = (alarmType: number) => {
    // Map CMSV6 alarm types to our display types
    const criticalTypes = [1, 2, 5, 11]; // Emergency, overspeed, fatigue, etc
    const warningTypes = [3, 4, 9, 10]; 
    if (criticalTypes.includes(alarmType)) return "critical";
    if (warningTypes.includes(alarmType)) return "warning";
    return "info";
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "critical":
        return {
          badge: "bg-destructive text-destructive-foreground",
          border: "border-l-4 border-l-destructive",
          iconColor: "text-destructive",
        };
      case "warning":
        return {
          badge: "bg-warning text-warning-foreground",
          border: "border-l-4 border-l-warning",
          iconColor: "text-warning",
        };
      case "info":
        return {
          badge: "bg-primary text-primary-foreground",
          border: "border-l-4 border-l-primary",
          iconColor: "text-primary",
        };
      default:
        return {
          badge: "bg-muted text-muted-foreground",
          border: "border-l-4 border-l-muted",
          iconColor: "text-muted-foreground",
        };
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Alerts</h2>
        <div className="flex gap-2">
          {hasRealData ? (
            <Badge variant="outline" className="text-success">
              Live - {alerts.length} alerts
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              No active alerts
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active alerts</p>
          </div>
        ) : (
          alerts.map((alert: any, index: number) => {
            const type = getAlertType(alert.type);
            const Icon = type === "critical" ? AlertTriangle : type === "warning" ? AlertCircle : Info;
            const style = getAlertStyle(type);
            
            return (
              <div
                key={alert.guid || alert.id || index}
                className={`p-4 border rounded-lg ${style.border} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold">{alert.desc || `Alarm Type ${alert.type}`}</h3>
                      <Badge className={style.badge} variant="secondary">
                        {type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.vehicleName || `Device ${alert.DevIDNO}`}
                    </p>
                    
                    <p className="text-sm mb-2">{alert.desc || 'Alarm detected'}</p>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alert.time || alert.stm || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
