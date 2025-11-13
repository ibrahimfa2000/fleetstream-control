import { Button } from "@/components/ui/button";
import { Radio, LogOut, Shield, Menu, Video, Car, FileText, Settings as SettingsIcon, MapPin, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <nav className="border-b border-primary/20 bg-gradient-secondary shadow-elegant sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img 
              src="/logo.jpg" 
              alt="ApexCam Logo" 
              className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary tracking-wide">
                ApexCam
              </h1>
              <span className="text-xs text-muted-foreground">MDVR Management Platform</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              {t('nav.myDevices')}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Menu className="w-4 h-4" />
                  Management
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/video-management")}>
                  <Video className="w-4 h-4 mr-2" />
                  Video Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/fleet-management")}>
                  <Car className="w-4 h-4 mr-2" />
                  Fleet Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/device-management")}>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Device Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/rules-management")}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Rules & Areas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/reports")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/system-management")}>
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      System Management
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            {t('nav.signOut')}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
