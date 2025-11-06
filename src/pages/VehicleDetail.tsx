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
  ArrowLeft, RefreshCcw, Car, Signal, Battery, MapPin, Video, PlayCircle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  useCMSV6Session,
  useCMSV6Vehicles,
  useCMSV6LiveVideo,
  useCMSV6Telemetry,
  useCMSV6Reports
} from "@/hooks/useCMSV6";
import FLVPlayer from "@/components/FLVPlayer";

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [passengerData, setPassengerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { jsession } = useCMSV6Session();
  const { vehicles, refetch: refetchVehicles } = useCMSV6Vehicles(jsession);
  const { getLiveVideo } = useCMSV6LiveVideo();
  const { getTelemetry } = useCMSV6Telemetry();
  const { getPeopleDetail } = useCMSV6Reports();

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const found = vehicles.find((v) => v.dl[0].id.toString() === id);
      if (found) {
        setVehicle(found);
        setTelemetry({
          signal_strength: found.signal || found.status?.signal || null,
          battery_level: found.battery || found.status?.battery || null,
          gps_lat: found.weiDu,
          gps_lon: found.jingDu,
          speed: found.speed,
          direction: found.direction,
        });
      }
      setLoading(false);
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

      if (vehicle?.dl[0].id) {
        const freshTelemetry = await getTelemetry(jsession, vehicle.dl[0].id);
        if (freshTelemetry) setTelemetry(freshTelemetry);
      }

      toast.success("Data refreshed successfully");
    } catch (error: any) {
      toast.error("Failed to refresh data: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

const loadLiveStream = async () => {
  if (!jsession || !vehicle?.dl[0].id) {
    toast.error("CMSV6 session or vehicle ID not available");
    return;
  }

  setActionLoading(true);
  try {
    // Fetch up to 4 channels
    const channelPromises = [1, 2, 3, 4].map(ch =>
      getLiveVideo(jsession, vehicle.dl[0].id, ch, 1)
    );

    const results = await Promise.allSettled(channelPromises);

    const validStreams = results
      .filter(r => r.status === "fulfilled" && (r as any).value)
      .map((r, i) => ({
        stream_url: (r as any).value,
        channel: i + 1,
        stream_type: "HLS"
      }));

    if (validStreams.length > 0) {
      setStream(validStreams);
      toast.success(`Loaded ${validStreams.length} stream${validStreams.length > 1 ? "s" : ""}`);
    } else {
      toast.error("No valid streams found");
    }
  } catch (error: any) {
    toast.error("Failed to load streams: " + error.message);
  } finally {
    setActionLoading(false);
  }
};


  const loadPassengerData = async () => {
    if (!jsession || !vehicle?.vehiName) {
      toast.error("CMSV6 session or vehicle name not available");
      return;
    }

    setActionLoading(true);
    try {
      const endTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const startTime = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
      const data = await getPeopleDetail(jsession, vehicle.vehiName, startTime, endTime, 1, 20);
      if (data) setPassengerData(data);
      toast.success("Passenger data loaded");
    } catch (error: any) {
      toast.error("Failed to load passenger data: " + error.message);
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
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Vehicle not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isOnline = vehicle.online === 1;
  const vehicleName = vehicle.vehiName || vehicle.dl[0].id || "Unknown Vehicle";

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{vehicleName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Device ID: {vehicle.dl[0].id}
                    </p>
                    {jsession && <p className="text-xs text-success mt-1">✓ CMSV6 Connected</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className={
                      isOnline
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-destructive/20 text-destructive border-destructive/30"
                    }
                  >
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshData}
                    disabled={actionLoading}
                    className="gap-2 h-8 text-xs"
                  >
                    <RefreshCcw className={`w-3 h-3 ${actionLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                  <TabsTrigger value="passengers">Passengers</TabsTrigger>
                  <TabsTrigger value="stream">Live Stream</TabsTrigger>
                </TabsList>

                {/* --- Overview --- */}
                <TabsContent value="overview" className="mt-6 grid grid-cols-2 gap-4">
                  <Info label="Vehicle Type" value={vehicle.vehicleType} />
                  <Info label="Driver" value={vehicle.driverName} />
                  <Info label="Speed" value={`${vehicle.speed ?? 0} km/h`} />
                  <Info label="Direction" value={`${vehicle.direction ?? "N/A"}°`} />
                  <Info label="Last GPS" value={vehicle.gpsTime && formatDistanceToNow(new Date(vehicle.gpsTime), { addSuffix: true })} />
                </TabsContent>

                {/* --- Telemetry --- */}
                <TabsContent value="telemetry" className="mt-6 space-y-4">
                  {telemetry ? (
                    <>
                      <TelemetryItem icon={Signal} label="Signal" value={`${telemetry.signal_strength}%`} />
                      <TelemetryItem icon={Battery} label="Battery" value={`${telemetry.battery_level}%`} />
                      {telemetry.gps_lat && telemetry.gps_lon && (
                        <div>
                          <MapPin className="w-5 h-5 text-primary mb-1" />
                          <DeviceMap lat={telemetry.gps_lat} lon={telemetry.gps_lon} deviceName={vehicleName} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No telemetry data</p>
                  )}
                </TabsContent>

                {/* --- Passengers --- */}
                <TabsContent value="passengers" className="mt-6">
                  {passengerData ? (
                    <PassengerList data={passengerData} />
                  ) : (
                    <div className="text-center py-8">
                      <Button onClick={loadPassengerData} variant="outline" disabled={actionLoading}>
                        Load Passenger Data
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* --- Stream --- */}
                <TabsContent value="stream" className="mt-6">
                  {stream?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stream.map((s: any) => (
                        <div key={s.channel} className="relative rounded-lg overflow-hidden bg-black">
                          <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            Channel {s.channel}
                          </div>
                          {/* <StreamPlayer streamUrl={s.stream_url} streamType={s.stream_type} /> */}
                          <FLVPlayer url={s.stream_url} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="mb-3 text-muted-foreground">No live streams loaded</p>
                      <Button onClick={loadLiveStream} variant="outline" disabled={actionLoading}>
                        <PlayCircle className="w-4 h-4 mr-2" /> Load All Channels
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right Column: Stats */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Vehicle Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Info label="Status" value={isOnline ? "Online" : "Offline"} />
              <Info label="Speed" value={`${vehicle.speed ?? 0} km/h`} />
              <Info label="Signal" value={`${telemetry?.signal_strength ?? "-"}%`} />
              <Info label="Battery" value={`${telemetry?.battery_level ?? "-"}%`} />
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
    <p className="font-medium text-sm">{value ?? "N/A"}</p>
  </div>
);

const TelemetryItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
    <Icon className="w-5 h-5 text-primary" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

const PassengerList = ({ data }: any) => (
  <div className="space-y-3">
    {data.registration?.info?.map((rec: any, idx: number) => (
      <Card key={idx} className="bg-secondary/30 border-border/50">
        <CardContent className="p-3 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Info label="Time" value={rec.sTimedtv} />
            <Info label="Driver" value={rec.driveName} />
            <Info label="Total Passengers" value={rec.cd1People} />
            <Info label="Boarding" value={rec.upPeople4} />
            <Info label="Alighting" value={rec.downPeople1} />
            {rec.eedu && rec.wedu && <Info label="Location" value={`${rec.eedu}, ${rec.wedu}`} />}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default VehicleDetail;