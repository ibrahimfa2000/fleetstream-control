import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCMSV6Session, useCMSV6Vehicles } from "@/hooks/useCMSV6";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { DashboardStats } from "@/components/DashboardStats";
import { VehicleList } from "@/components/VehicleList";
import { AlertsPanel } from "@/components/AlertsPanel";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // CMSV6 integration
  const { jsession, isLoading: sessionLoading, error: sessionError, refreshSession } = useCMSV6Session();

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




  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(213,175,55,0.08),transparent_60%)]" />
      <div className="relative">
        <Navbar />
        

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        
            <div className="flex gap-2">
             
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
<div className="space-y-6">
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
      
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VehicleList />
              <AlertsPanel />
            </div>
          </div>
          
           
 
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
