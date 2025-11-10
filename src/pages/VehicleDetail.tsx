import { useParams, useNavigate } from "react-router-dom";
import { useCMSV6Vehicles, useCMSV6Locations, useCMSV6Videos, useCMSV6Live } from "@/hooks/useCMSV6Data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Video, ExternalLink, Car, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import HLSPlayer from "@/components/CMSV6Player";
import CMSV6Player from "@/components/CMSV6Player";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playerHtml, setPlayerHtml] = useState<string | null>(null);

  const { data: vehiclesData, isLoading: loadingVehicles } = useCMSV6Vehicles();
  const { data: locationsData, isLoading: loadingLocations } = useCMSV6Locations();
  const { data: videoData, isLoading: loadingVideos } = useCMSV6Videos();
const { data: LiveHTML, isLoading: loadingVideoslive } = useCMSV6Live('0045600');


  const vehicle = useMemo(() => {
    return vehiclesData?.vehicles?.find((v: any) => v.dl?.[0]?.id?.toString() === id || v.id?.toString() === id || v.nm === id);
  }, [vehiclesData, id]);

  const location = useMemo(() => {
    return locationsData?.locations?.find((l: any) => l.id?.toString() === vehicle?.dl?.[0]?.id?.toString());
  }, [locationsData, vehicle]);

  const streams = useMemo(() => {
    return videoData?.streams?.filter((s: any) => s.deviceId?.toString() === vehicle?.dl?.[0]?.id?.toString()) || [];
  }, [videoData, vehicle]);

  const openVideoStream = (url: string) => window.open(url, "_blank", "width=1200,height=800");

  if (loadingVehicles || loadingLocations || loadingVideos)
    return (
      <div className="p-8">
        <Skeleton className="w-full h-[400px]" />
      </div>
    );


  useEffect(() => {
    const fetchPlayer = async () => {
      if (!vehicle?.nm) return;
      console.log("LiveHTML", LiveHTML.html)
       
       if(LiveHTML){
         setPlayerHtml(LiveHTML.html);
      }
    };

    fetchPlayer();
  }, [LiveHTML]);


  if (!vehicle)
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Vehicle not found</p>
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );

  return (
    <Card className="p-6">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-2xl">{vehicle.nm}</CardTitle>
        <Badge variant="outline" className={location?.ol === 1 ? "text-success" : "text-destructive"}>
          {location?.ol === 1 ? "Online" : "Offline"}
        </Badge>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
            <TabsTrigger value="stream">Live Stream</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 grid grid-cols-2 gap-4">
            <Info label="Plate Number" value={vehicle.nm} />
            <Info label="Company" value={vehicle.pnm} />
            <Info label="Vehicle Type" value={vehicle.vehicleType} />
            <Info label="Channels" value={vehicle.chnName} />
          </TabsContent>

          {/* Telemetry */}
          <TabsContent value="telemetry" className="mt-6 grid grid-cols-2 gap-4">
            <Info label="Speed" value={`${location?.sp ?? 0} km/h`} />
            <Info label="Signal" value={location?.net === 3 ? "4G" : "Unknown"} />
            <Info label="Battery" value={`${location?.bat ?? "-"}%`} />
            <Info label="Coordinates" value={`${location?.mlat}, ${location?.mlng}`} />
            <div className="col-span-2 flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location?.ps}
            </div>
          </TabsContent>

          {/* Live Stream */}
          <TabsContent value="stream" className="mt-6">
            {playerHtml ? (
              <iframe
  src="http://57.131.13.157/808gps/open/player/RealPlayVideo.html?account=admin&password=!ApexAuto2025!&PlateNum=0045600&lang=en"
  width="100%"
  height="600"
  allow="autoplay"
></iframe>
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
  );
};

const Info = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium text-sm break-words">{value ?? "N/A"}</p>
  </div>
);

export default VehicleDetail;
