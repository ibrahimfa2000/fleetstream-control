import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StreamPlayer from "@/components/StreamPlayer";
import { DeviceMap } from "@/components/GPSMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, Radio, Signal, Battery, MapPin, 
  PlayCircle, Video, RefreshCcw, Car, Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCMSV6Session, useCMSV6Vehicles, useCMSV6LiveVideo, useCMSV6Telemetry } from "@/hooks/useCMSV6";

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { jsession } = useCMSV6Session();
  const { vehicles, refetch: refetchVehicles } = useCMSV6Vehicles(jsession);
  const { getLiveVideo } = useCMSV6LiveVideo();
  const { getTelemetry } = useCMSV6Telemetry();

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const foundVehicle = vehicles.find(v => v.devIdno === id || v.id === id);
      if (foundVehicle) {
        setVehicle(foundVehicle);
        setLoading(false);
        
        // Set telemetry from vehicle data
        setTelemetry({
          signal_strength: foundVehicle.signal,
          battery_level: foundVehicle.battery,
          gps_lat: foundVehicle.mlat,
          gps_lon: foundVehicle.mlng,
          speed: foundVehicle.speed,
          direction: foundVehicle.direction,
        });
      } else {
        setLoading(false);
      }
    }
  }, [vehicles, id]);

  const refreshData = async () => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }
    
    setActionLoading(true);
    try {
      await refetchVehicles();
      
      if (vehicle?.devIdno) {
        const freshTelemetry = await getTelemetry(jsession, vehicle.devIdno);
        if (freshTelemetry) {
          setTelemetry(freshTelemetry);
        }
      }
      
      toast.success("Data refreshed successfully");
    } catch (error: any) {
      toast.error("Failed to refresh data: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const loadLiveStream = async () => {
    if (!jsession || !vehicle?.devIdno) {
      toast.error("CMSV6 session or vehicle ID not available");
      return;
    }
    
    setActionLoading(true);
    try {
      const streamUrl = await getLiveVideo(jsession, vehicle.devIdno, 0, 1);
      if (streamUrl) {
        setStream({ stream_url: streamUrl, stream_type: 'HLS' });
        toast.success("Live stream loaded");
      }
    } catch (error: any) {
      toast.error("Failed to load stream: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground text-center">Vehicle not found</p>
          <Button onClick={() => navigate("/")} className="mt-4 mx-auto block">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isOnline = vehicle.state === 1;
  const vehicleName = vehicle.plate || vehicle.deviceNumber || 'Unknown Vehicle';

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(213,175,55,0.08),transparent_60%)]" />
      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Info */}
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{vehicleName}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Device ID: {vehicle.devIdno}
                      </p>
                      {jsession && (
                        <p className="text-xs text-success mt-1">✓ CMSV6 Connected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline" className={isOnline ? "bg-success/20 text-success border-success/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshData}
                      disabled={actionLoading}
                      className="gap-2 h-8 text-xs"
                    >
                      <RefreshCcw className={`w-3 h-3 ${actionLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                    <TabsTrigger value="stream">Live Stream</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {vehicle.model && (
                        <div>
                          <p className="text-sm text-muted-foreground">Model</p>
                          <p className="font-medium">{vehicle.model}</p>
                        </div>
                      )}
                      {vehicle.deviceNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Device Number</p>
                          <p className="font-medium">{vehicle.deviceNumber}</p>
                        </div>
                      )}
                      {vehicle.plate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Plate Number</p>
                          <p className="font-medium">{vehicle.plate}</p>
                        </div>
                      )}
                      {vehicle.gpsTime && (
                        <div>
                          <p className="text-sm text-muted-foreground">Last GPS Update</p>
                          <p className="font-medium text-xs">
                            {formatDistanceToNow(new Date(vehicle.gpsTime), { addSuffix: true })}
                          </p>
                        </div>
                      )}
                      {vehicle.speed !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground">Speed</p>
                          <p className="font-medium">{vehicle.speed} km/h</p>
                        </div>
                      )}
                      {vehicle.direction !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground">Direction</p>
                          <p className="font-medium">{vehicle.direction}°</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="telemetry" className="mt-6 space-y-6">
                    {telemetry ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          {telemetry.signal_strength !== undefined && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                              <Signal className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Signal Strength</p>
                                <p className="font-semibold">{telemetry.signal_strength}%</p>
                              </div>
                            </div>
                          )}
                          {telemetry.battery_level !== undefined && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                              <Battery className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Battery Level</p>
                                <p className="font-semibold">{telemetry.battery_level}%</p>
                              </div>
                            </div>
                          )}
                          {telemetry.gps_lat && telemetry.gps_lon && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 col-span-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">GPS Location</p>
                                <p className="font-semibold text-xs">
                                  {telemetry.gps_lat.toFixed(6)}, {telemetry.gps_lon.toFixed(6)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {telemetry.gps_lat && telemetry.gps_lon && (
                          <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              Live GPS Map
                            </h4>
                            <DeviceMap 
                              lat={telemetry.gps_lat} 
                              lon={telemetry.gps_lon}
                              deviceName={vehicleName}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No telemetry data available</p>
                    )}
                  </TabsContent>

                  <TabsContent value="stream" className="mt-6">
                    {stream && stream.stream_url ? (
                      <StreamPlayer 
                        streamUrl={stream.stream_url} 
                        streamType={stream.stream_type}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">No live stream available</p>
                        {jsession && (
                          <Button
                            variant="outline"
                            onClick={loadLiveStream}
                            disabled={actionLoading}
                            className="gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Load Live Stream
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connection</span>
                    <Badge variant={isOnline ? "default" : "secondary"}>
                      {isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  {vehicle.gpsTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Update</span>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(vehicle.gpsTime), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  {telemetry?.signal_strength !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Signal</span>
                      <span className="text-sm font-medium">{telemetry.signal_strength}%</span>
                    </div>
                  )}
                  {telemetry?.battery_level !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Battery</span>
                      <span className="text-sm font-medium">{telemetry.battery_level}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {telemetry?.gps_lat && telemetry?.gps_lon && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Location Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Latitude</p>
                      <p className="font-mono text-sm">{telemetry.gps_lat.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Longitude</p>
                      <p className="font-mono text-sm">{telemetry.gps_lon.toFixed(6)}</p>
                    </div>
                    {vehicle.speed !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">Speed</p>
                        <p className="font-medium">{vehicle.speed} km/h</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VehicleDetail;
