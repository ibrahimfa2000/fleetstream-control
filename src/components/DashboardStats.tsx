import { Card } from "@/components/ui/card";
import { Truck, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { useCMSV6Vehicles, useCMSV6Alerts, useCMSV6Locations } from "@/hooks/useCMSV6Data";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardStats = () => {
  const { data: vehiclesData, isLoading: loadingVehicles } = useCMSV6Vehicles();
  const { data: alertsData, isLoading: loadingAlerts } = useCMSV6Alerts();
  const { data: locationsData, isLoading: loadingLocations } = useCMSV6Locations();

  const totalVehicles = vehiclesData?.vehicles?.length || 0;
  const totalAlerts = alertsData?.alerts?.length || 0;
  const onlineDevices = locationsData?.locations?.filter((l: any) => l.ol === 1).length || 0;
  const activeVehicles = locationsData?.locations?.filter((l: any) => l.sp > 0).length || 0;
  
  const onlinePercentage = totalVehicles > 0 ? Math.round((onlineDevices / totalVehicles) * 100) : 0;
  const activePercentage = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  const stats = [
    {
      title: "Total Vehicles",
      value: totalVehicles.toString(),
      change: `${totalVehicles} registered`,
      icon: Truck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Now",
      value: activeVehicles.toString(),
      change: `${activePercentage}%`,
      icon: Activity,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Alerts",
      value: totalAlerts.toString(),
      change: totalAlerts > 0 ? "Requires attention" : "All clear",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Online",
      value: onlineDevices.toString(),
      change: `${onlinePercentage}%`,
      icon: CheckCircle,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  if (loadingVehicles || loadingAlerts || loadingLocations) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
