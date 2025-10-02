import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import StreamPlayer from "@/components/StreamPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, Radio, Signal, Battery, HardDrive, MapPin, 
  PlayCircle, PauseCircle, Power, RotateCcw, Video, Terminal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const DeviceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDeviceData();
  }, [id]);

  const fetchDeviceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // @ts-ignore - Types will be generated after migration
      const { data: deviceData, error: deviceError } = await (supabase as any)
        .from("devices")
        .select("*")
        .eq("id", id)
        .eq("owner_id", user.id)
        .single();

      if (deviceError) throw deviceError;
      setDevice(deviceData);

      // @ts-ignore - Types will be generated after migration
      const { data: telemetryData } = await (supabase as any)
        .from("telemetry")
        .select("*")
        .eq("device_id", id)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();
      setTelemetry(telemetryData);

      // @ts-ignore - Types will be generated after migration
      const { data: subscriptionData } = await (supabase as any)
        .from("subscriptions")
        .select("*")
        .eq("device_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubscription(subscriptionData);

      // @ts-ignore - Types will be generated after migration
      const { data: streamData } = await (supabase as any)
        .from("streams")
        .select("*")
        .eq("device_id", id)
        .maybeSingle();
      setStream(streamData);

    } catch (error: any) {
      toast.error("Error loading device: " + error.message);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action: 'activate' | 'suspend') => {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('manage-subscription', {
        body: {
          action,
          deviceId: id,
          simIccid: device.sim_iccid
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) throw response.error;

      toast.success(`Subscription ${action}d successfully!`);
      fetchDeviceData();
    } catch (error: any) {
      toast.error(`Failed to ${action} subscription: ` + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCommand = async (command: string) => {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('send-device-command', {
        body: {
          deviceId: id,
          command,
          params: {}
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) throw response.error;

      toast.success(`Command "${command}" sent successfully!`);
    } catch (error: any) {
      toast.error("Failed to send command: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading device...</p>
        </div>
      </div>
    );
  }

  if (!device) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-success/20 text-success border-success/30";
      case "offline": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-warning/20 text-warning border-warning/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.1),transparent_50%)]" />
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
            {/* Device Info */}
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Radio className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{device.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        IMEI: {device.imei}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                    <TabsTrigger value="stream">Stream</TabsTrigger>
                    <TabsTrigger value="control">Control</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="font-medium">{device.model || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Firmware</p>
                        <p className="font-medium">{device.firmware_version || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SIM ICCID</p>
                        <p className="font-medium text-xs">{device.sim_iccid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Seen</p>
                        <p className="font-medium text-xs">
                          {device.last_seen 
                            ? formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="telemetry" className="mt-6">
                    {telemetry ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                          <Signal className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Signal</p>
                            <p className="font-semibold">{telemetry.signal_strength} dBm</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                          <Battery className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Battery</p>
                            <p className="font-semibold">{telemetry.battery_level}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                          <HardDrive className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Storage</p>
                            <p className="font-semibold">
                              {Math.round(telemetry.storage_free_mb / 1024)} GB free
                            </p>
                          </div>
                        </div>
                        {telemetry.gps_lat && telemetry.gps_lon && (
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="font-semibold text-xs">
                                {telemetry.gps_lat.toFixed(4)}, {telemetry.gps_lon.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
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
                        <p className="text-muted-foreground">No stream configured</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="control" className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleSendCommand('reboot')}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reboot
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendCommand('start_recording')}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Start Recording
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendCommand('stop_recording')}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <PauseCircle className="w-4 h-4" />
                        Stop Recording
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendCommand('update_config')}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <Terminal className="w-4 h-4" />
                        Update Config
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Subscription Control */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="outline" className={
                          subscription.status === 'active' 
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-warning/20 text-warning border-warning/30"
                        }>
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plan</span>
                        <span className="font-medium">{subscription.plan_id || "Basic"}</span>
                      </div>
                      <div className="pt-4 space-y-2">
                        {subscription.status === 'active' ? (
                          <Button
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={() => handleSubscriptionAction('suspend')}
                            disabled={actionLoading}
                          >
                            <PauseCircle className="w-4 h-4" />
                            Suspend Subscription
                          </Button>
                        ) : (
                          <Button
                            className="w-full gap-2"
                            onClick={() => handleSubscriptionAction('activate')}
                            disabled={actionLoading}
                          >
                            <Power className="w-4 h-4" />
                            Activate Subscription
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  {!subscription && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No subscription found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeviceDetail;
