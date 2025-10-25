import { Button } from "@/components/ui/button";
import { Radio, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

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
              alt="ApexAuto Logo" 
              className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary tracking-wide">
                ApexAuto
              </h1>
              <span className="text-xs text-muted-foreground">MDVR Management Platform</span>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
              >
                {t('nav.myDevices')}
              </Button>
              <Button
                variant={location.pathname === "/admin" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/admin")}
                className="gap-2"
              >
                <Shield className="w-4 h-4" />
                {t('nav.admin')}
              </Button>
            </div>
          )}
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
