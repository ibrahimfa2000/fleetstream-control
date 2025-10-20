import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import DeviceCard from "@/components/DeviceCard";
import AddDeviceDialog from "@/components/AddDeviceDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchDevices(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchDevices(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDevices = async (userId: string) => {
    try {
      const { data: devicesData, error: devicesError } = await (supabase as any)
        .from("devices")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (devicesError) throw devicesError;

      if (devicesData) {
        const devicesWithDetails = await Promise.all(
          devicesData.map(async (device: any) => {
            const { data: telemetryData } = await (supabase as any)
              .from("telemetry")
              .select("*")
              .eq("device_id", device.id)
              .order("timestamp", { ascending: false })
              .limit(1)
              .maybeSingle();

            const { data: subscriptionData } = await (supabase as any)
              .from("subscriptions")
              .select("*")
              .eq("device_id", device.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              ...device,
              telemetry: telemetryData,
              subscription: subscriptionData,
            };
          })
        );

        setDevices(devicesWithDetails);
      }
    } catch (error: any) {
      toast.error("Error fetching devices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.imei.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading M-Z devices...</p>
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
            </div>
            <AddDeviceDialog onDeviceAdded={() => fetchDevices(user!.id)} />
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
                {searchQuery ? t('dashboard.noDevices') : t('dashboard.noDevicesDesc')}
              </p>
              <AddDeviceDialog onDeviceAdded={() => fetchDevices(user!.id)} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  telemetry={device.telemetry}
                  subscription={device.subscription}
                  onClick={() => navigate(`/device/${device.id}`)}
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
