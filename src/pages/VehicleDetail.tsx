import { useParams, useNavigate } from "react-router-dom";
import { useCMSV6Vehicles, useCMSV6Locations, useCMSV6Videos, useCMSV6Live } from "@/hooks/useCMSV6Data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Video, ExternalLink, Car, MapPin, ArrowLeft, Signal, ParkingCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import HLSPlayer from "@/components/CMSV6Player";
import CMSV6Player from "@/components/CMSV6Player";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { DeviceMap } from "@/components/GPSMap";

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vehiclesData, isLoading: loadingVehicles } = useCMSV6Vehicles();
  const { data: locationsData, isLoading: loadingLocations } = useCMSV6Locations();
  const { data: videoData, isLoading: loadingVideos } = useCMSV6Videos();
  const { data: LiveHTML, isLoading: loadingVideoslive } = useCMSV6Live("0045600");

  const vehicle = useMemo(() => {
    return vehiclesData?.vehicles?.find(
      (v: any) =>
        v.dl?.[0]?.id?.toString() === id ||
        v.id?.toString() === id ||
        v.nm === id
    );
  }, [vehiclesData, id]);

  const location = useMemo(() => {
    return locationsData?.locations?.find(
      (l: any) => l.id?.toString() === vehicle?.dl?.[0]?.id?.toString()
    );
  }, [locationsData, vehicle]);

  const streams = useMemo(() => {
    return (
      videoData?.streams?.filter(
        (s: any) => s.deviceId?.toString() === vehicle?.dl?.[0]?.id?.toString()
      ) || []
    );
  }, [videoData, vehicle]);

  const openVideoStream = (url: string) =>
    window.open(url, "_blank", "width=1200,height=800");


  // ✅ Conditional rendering comes after hooks
  if (loadingVehicles || loadingLocations || loadingVideos) {
    return (
      <div className="p-8">
        <Skeleton className="w-full h-[400px]" />
      </div>
    );
  }
const TelemetryItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
    <Icon className="w-5 h-5 text-primary" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);
  if (!vehicle) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Vehicle not found</p>
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
       <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card className="lg:col-span-3 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{vehicle.nm}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Device ID: {vehicle.dl[0].id}
                    </p>
                    {<p className="text-xs text-success mt-1">✓ CMSV6 Connected</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className={
                      location?.ol === 1 
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-destructive/20 text-destructive border-destructive/30"
                    }
                  >
                    {location?.ol === 1  ? "Online" : "Offline"}
                  </Badge>

                </div>
              </div>
           
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
            <TabsTrigger value="stream">Live Stream & Map</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 grid grid-cols-2 gap-4">
            <Info label="Plate Number" value={vehicle.nm} />
            <Info label="Company" value={vehicle.pnm} />
            <Info label="Vehicle Type" value={vehicle.vehicleType} />
            <Info label="Channels" value={vehicle.chnName} />
          </TabsContent>

          <TabsContent value="telemetry" className="mt-6 grid grid-cols-2 gap-4">
            <Info label="Speed" value={`${location?.sp ?? 0} km/h`} />
            <Info label="Signal" value={location?.net === 3 ? "4G" : "Unknown"} />
            <Info label="Battery" value={`${location?.bat ?? "-"}%`} />
            <Info
              label="Coordinates"
              value={`${location?.mlat}, ${location?.mlng}`}
            />
            <div className="col-span-2 flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location?.ps}
            </div>
          </TabsContent>

          <TabsContent value="stream" className="mt-6">
            {videoData && location ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {location.mlat && location.mlng && (
                  <div>
                    <MapPin className="w-5 h-5 text-primary mb-1" />
                    <DeviceMap lat={location.mlat} lon={location.mlng} deviceName={vehicle.pnm} />
                  </div>
                )}
                <div className="col-span-1">
                <iframe
                  src={videoData?.streams?.[0]?.liveUrl}
                  width="100%"
                  height="600"
                  allow="autoplay"
                ></iframe>
               <button
                  onClick={() => openVideoStream(videoData?.streams?.[0]?.liveUrl)}
                  className="mt-2 px-4 py-2 bg-primary text-white rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 inline-block mr-2" />
                  Video not working? Open in new window
                </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Loading secure live stream...</p>
              </div>
            )}
          </TabsContent>
  
        </Tabs>
      </CardContent>
    </Card>
    </div>
      </main>
    </div>
  );
};


const Info = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium text-sm break-words">{value ?? "N/A"}</p>
  </div>
);

export default VehicleDetail;
