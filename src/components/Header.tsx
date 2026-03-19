import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe, Menu, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' || i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: t('LandingPage.home'), href: '#' },
    { label: t('LandingPage.features'), href: '#features' },
    { label: t('LandingPage.solutions'), href: '#solutions' },
    { label: t('LandingPage.pricing'), href: '#pricing' },
    { label: t('LandingPage.contact'), href: '#contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'border-b border-primary/20 bg-background/90 backdrop-blur-xl shadow-[0_4px_20px_hsl(0_0%_0%_/_0.3)]'
        : 'border-b border-transparent bg-transparent'
      }`}>
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative">
            <img src="./logo.jpg" alt="ApexCam Logo" className="h-10 w-10 rounded-xl border border-primary/30" />
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-accent/10 rounded-xl blur opacity-60" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-primary">ApexCam</span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">MDVR Platform</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground/70 hover:text-primary">
            {theme !== 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('ar')}>العربية</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('he')}>עברית</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:shadow-[var(--shadow-gold)] hover:scale-105 transition-all duration-200"
          >
            {t('LandingPage.bookDemo')}
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground/70">
            {theme !== 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-background/95 backdrop-blur-xl border-b border-border px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-foreground/70 hover:text-primary transition-colors font-medium text-sm border-b border-border/30 last:border-0"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
              {t('LandingPage.signIn')}
            </Button>
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm"
            >
              {t('LandingPage.bookDemo')}
            </a>
            <div className="flex justify-center gap-2 pt-1">
              {['en', 'ar', 'he'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { changeLanguage(lang); setMobileOpen(false); }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${i18n.language === lang ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ar' ? 'AR' : 'HE'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
