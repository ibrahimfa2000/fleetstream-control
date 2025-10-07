import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import Navbar from "@/components/Navbar";
import DeviceCard from "@/components/DeviceCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (roleLoading) return;
    
    if (!isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    fetchAllDevices();
  }, [isAdmin, roleLoading, navigate]);

  const fetchAllDevices = async () => {
    try {
      // Admin can see all devices
      const { data: devicesData, error: devicesError } = await supabase
        .from("devices")
        .select(`
          *,
          owner:profiles!devices_owner_id_fkey (
            email
          )
        `)
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
      device.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">{t('admin.title')}</h2>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  {t('admin.allDevices')}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {t('admin.subtitle')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border"
              />
            </div>
          </div>

          {filteredDevices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? t('dashboard.noDevices') : t('dashboard.noDevicesDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Showing {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDevices.map((device) => (
                  <div key={device.id} className="space-y-2">
                    <DeviceCard
                      device={device}
                      telemetry={device.telemetry}
                      subscription={device.subscription}
                      onClick={() => navigate(`/device/${device.id}`)}
                    />
                    {device.owner?.email && (
                      <p className="text-xs text-muted-foreground pl-2">
                        Owner: {device.owner.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;