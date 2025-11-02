import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import StreamPlayer from "@/components/StreamPlayer";
import { DeviceMap } from "@/components/GPSMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, Radio, Signal, Battery, HardDrive, MapPin, 
  PlayCircle, PauseCircle, Power, RotateCcw, Video, Terminal, RefreshCcw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { useCMSV6Session, useCMSV6LiveVideo, useCMSV6Telemetry, useCMSV6Control } from "@/hooks/useCMSV6";

const DeviceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [device, setDevice] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // CMSV6 integration
  const { jsession } = useCMSV6Session();
  const { getLiveVideo } = useCMSV6LiveVideo();
  const { getTelemetry } = useCMSV6Telemetry();
  const { sendCommand: sendCMSV6Command } = useCMSV6Control();

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
      toast.error(t('deviceDetail.errorLoading') + ": " + error.message);
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

      toast.success(t('deviceDetail.subscriptionSuccess', { action }));
      fetchDeviceData();
    } catch (error: any) {
      toast.error(t('deviceDetail.subscriptionError', { action }) + ": " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCommand = async (command: string) => {
    setActionLoading(true);
    try {
      // Try CMSV6 control first if session is available
      if (jsession && device?.imei) {
        const commandMapping: any = {
          'reboot': { command: 'device_control', params: { controlType: 'reboot' } },
          'start_recording': { command: 'device_control', params: { controlType: 'start_record' } },
          'stop_recording': { command: 'device_control', params: { controlType: 'stop_record' } },
          'update_config': { command: 'device_control', params: { controlType: 'update_config' } },
        };
        
        const cmsv6Command = commandMapping[command];
        if (cmsv6Command) {
          await sendCMSV6Command(jsession, device.imei, cmsv6Command.command, cmsv6Command.params);
          toast.success(t('deviceDetail.commandSuccess', { command }));
          return;
        }
      }
      
      // Fallback to legacy command system
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

      toast.success(t('deviceDetail.commandSuccess', { command }));
    } catch (error: any) {
      toast.error(t('deviceDetail.commandError') + ": " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const refreshCMSV6Data = async () => {
    if (!jsession || !device?.imei) {
      toast.error("CMSV6 session or device IMEI not available");
      return;
    }
    
    setActionLoading(true);
    try {
      // Refresh telemetry from CMSV6
      const cmsv6Telemetry = await getTelemetry(jsession, device.imei);
      if (cmsv6Telemetry) {
        toast.success("CMSV6 telemetry refreshed");
      }
      
      // Refresh local data
      await fetchDeviceData();
    } catch (error: any) {
      toast.error("Failed to refresh CMSV6 data: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const loadCMSV6Stream = async () => {
    if (!jsession || !device?.imei) {
      toast.error("CMSV6 session or device IMEI not available");
      return;
    }
    
    setActionLoading(true);
    try {
      const streamUrl = await getLiveVideo(jsession, device.imei, 0, 1);
      if (streamUrl) {
        setStream({ stream_url: streamUrl, stream_type: 'HLS' });
        toast.success("Live stream loaded from CMSV6");
      }
    } catch (error: any) {
      toast.error("Failed to load CMSV6 stream: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">{t('deviceDetail.loading')}</p>
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
            {t('deviceDetail.backToDashboard')}
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
                        {jsession && (
                          <p className="text-xs text-success mt-1">✓ CMSV6 Connected</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline" className={getStatusColor(device.status)}>
                        {t(`device.status.${device.status}`)}
                      </Badge>
                      {jsession && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshCMSV6Data}
                          disabled={actionLoading}
                          className="gap-2 h-8 text-xs"
                        >
                          <RefreshCcw className={`w-3 h-3 ${actionLoading ? 'animate-spin' : ''}`} />
                          Sync CMSV6
                        </Button>
                      )}
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">{t('deviceDetail.tabs.overview')}</TabsTrigger>
                    <TabsTrigger value="telemetry">{t('deviceDetail.tabs.telemetry')}</TabsTrigger>
                    <TabsTrigger value="stream">{t('deviceDetail.tabs.stream')}</TabsTrigger>
                    <TabsTrigger value="control">{t('deviceDetail.tabs.control')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('deviceDetail.fields.model')}</p>
                        <p className="font-medium">{device.model || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('deviceDetail.fields.firmware')}</p>
                        <p className="font-medium">{device.firmware_version || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('deviceDetail.fields.simIccid')}</p>
                        <p className="font-medium text-xs">{device.sim_iccid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('deviceDetail.fields.lastSeen')}</p>
                        <p className="font-medium text-xs">
                          {device.last_seen 
                            ? formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })
                            : t('deviceDetail.fields.never')}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="telemetry" className="mt-6 space-y-6">
                    {telemetry ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                            <Signal className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t('deviceDetail.telemetry.signal')}</p>
                              <p className="font-semibold">{telemetry.signal_strength} dBm</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                            <Battery className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t('deviceDetail.telemetry.battery')}</p>
                              <p className="font-semibold">{telemetry.battery_level}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                            <HardDrive className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t('deviceDetail.telemetry.storage')}</p>
                              <p className="font-semibold">
                                {Math.round(telemetry.storage_free_mb / 1024)} GB {t('deviceDetail.telemetry.free')}
                              </p>
                            </div>
                          </div>
                          {telemetry.gps_lat && telemetry.gps_lon && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                              <MapPin className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">{t('deviceDetail.telemetry.location')}</p>
                                <p className="font-semibold text-xs">
                                  {telemetry.gps_lat.toFixed(4)}, {telemetry.gps_lon.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {telemetry.gps_lat && telemetry.gps_lon && (
                          <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {t('deviceDetail.telemetry.gpsMap')}
                            </h4>
                            <DeviceMap 
                              lat={telemetry.gps_lat} 
                              lon={telemetry.gps_lon}
                              deviceName={device.name}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">{t('deviceDetail.telemetry.noData')}</p>
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
                        <p className="text-muted-foreground mb-4">{t('deviceDetail.stream.noStream')}</p>
                        {jsession && (
                          <Button
                            variant="outline"
                            onClick={loadCMSV6Stream}
                            disabled={actionLoading}
                            className="gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Load CMSV6 Stream
                          </Button>
                        )}
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
                        {t('deviceDetail.control.reboot')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendCommand('start_recording')}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        {t('deviceDetail.control.startRecording')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendCommand('stop_recording')}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <PauseCircle className="w-4 h-4" />
                        {t('deviceDetail.control.stopRecording')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendCommand('update_config')}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <Terminal className="w-4 h-4" />
                        {t('deviceDetail.control.updateConfig')}
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
                  <CardTitle className="text-lg">{t('deviceDetail.subscription.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('deviceDetail.subscription.status')}</span>
                        <Badge variant="outline" className={
                          subscription.status === 'active' 
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-warning/20 text-warning border-warning/30"
                        }>
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('deviceDetail.subscription.plan')}</span>
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
                            {t('deviceDetail.subscription.suspend')}
                          </Button>
                        ) : (
                          <Button
                            className="w-full gap-2"
                            onClick={() => handleSubscriptionAction('activate')}
                            disabled={actionLoading}
                          >
                            <Power className="w-4 h-4" />
                            {t('deviceDetail.subscription.activate')}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  {!subscription && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('deviceDetail.subscription.noSubscription')}
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
