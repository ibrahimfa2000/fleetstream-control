import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' || i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="./logo.jpg" alt="ApexCam Logo" className="h-10 w-10 rounded-lg" />
          <span className="text-2xl font-bold text-primary">ApexCam</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">
            {t('LandingPage.features')}
          </a>
          <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors">
            {t('LandingPage.pricing')}
          </a>
          <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">
            {t('LandingPage.contact')}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground"
          >
            {theme !== 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('he')}>
                עברית
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" className="text-foreground" onClick={()=> navigate("/auth")}>
            {t('LandingPage.signIn')}
          </Button>
          <a href="#contact" className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
            {t('LandingPage.getStarted')}
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
