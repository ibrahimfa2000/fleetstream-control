import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(45_85%_58%_/_0.15),_transparent_50%)]" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {t('LandingPage.heroTitle')} <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{t('LandingPage.heroTitleHighlight')}</span> {t('LandingPage.heroTitleEnd')}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
            {t('LandingPage.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-scale-in">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-gold)] hover:shadow-[var(--shadow-gold)] text-lg px-8 transition-all hover:scale-105"
            >
              {t('LandingPage.startFreeTrial')}
              <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 transition-all hover:scale-105"
            >
              {t('LandingPage.watchDemo')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-card)] animate-slide-up group">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-foreground/80">{t('LandingPage.realtimeMonitoring')}</div>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-card)] animate-slide-up group" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">99.9%</div>
              <div className="text-foreground/80">{t('LandingPage.platformUptime')}</div>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-card)] animate-slide-up group" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">10K+</div>
              <div className="text-foreground/80">{t('LandingPage.activeUsers')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
