import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import DeviceCard from "@/components/DeviceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCMSV6Session, useCMSV6Vehicles } from "@/hooks/useCMSV6";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // CMSV6 integration
  const { jsession, isLoading: sessionLoading, error: sessionError, refreshSession } = useCMSV6Session();
  const { vehicles: cmsv6Vehicles, isLoading: vehiclesLoading, refetch: refetchVehicles } = useCMSV6Vehicles(jsession);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const syncCMSV6Data = async () => {
    if (!jsession) {
      toast.error("CMSV6 session not available. Refreshing...");
      refreshSession();
      return;
    }
    
    try {
      await refetchVehicles();
      toast.success("CMSV6 data synced successfully");
    } catch (error: any) {
      toast.error("Failed to sync CMSV6 data: " + error.message);
    }
  };

  const devices = cmsv6Vehicles || [];
  
  const filteredDevices = devices.filter(
    (device) =>
      (device.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       device.devIdno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       device.deviceNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (sessionLoading || vehiclesLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading devices from CMSV6...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(213,175,55,0.08),transparent_60%)]" />
      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">{t('dashboard.title')}</h2>
              <p className="text-muted-foreground">
                {t('dashboard.subtitle')}
              </p>
              {jsession && (
                <p className="text-xs text-success mt-1">✓ CMSV6 Connected</p>
              )}
              {sessionError && (
                <p className="text-xs text-destructive mt-1">⚠ CMSV6 Error: {sessionError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncCMSV6Data}
                disabled={!jsession || vehiclesLoading}
                className="gap-2"
              >
                <RefreshCcw className={`w-4 h-4 ${vehiclesLoading ? 'animate-spin' : ''}`} />
                Sync CMSV6
              </Button>
              <Button
                onClick={() => navigate('/device-management')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Device
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-primary/20 focus:border-primary/40"
              />
            </div>
          </div>

          {filteredDevices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? t('dashboard.noDevices') : 'No devices found in CMSV6'}
              </p>
              <Button onClick={() => navigate('/device-management')} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Device in CMSV6
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((device, index) => (
                <DeviceCard
                  key={device.devIdno || device.id || index}
                  device={{
                    id: device.devIdno || device.id,
                    name: device.plate || device.deviceNumber || 'Unknown Device',
                    imei: device.devIdno || device.deviceNumber || 'N/A',
                    model: device.model,
                    status: device.state === 1 ? 'online' : 'offline',
                    last_seen: device.gpsTime
                  }}
                  telemetry={{
                    signal_strength: device.signal,
                    battery_level: device.battery,
                    gps_lat: device.mlat,
                    gps_lon: device.mlng
                  }}
                  subscription={{
                    status: device.state === 1 ? 'active' : 'inactive'
                  }}
                  onClick={() => navigate(`/device/${device.devIdno || device.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
