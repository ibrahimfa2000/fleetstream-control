import { Video, MapPin, Bell, BarChart3, Shield, Cloud } from "lucide-react";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Video,
      title: t('LandingPage.hdVideo'),
      description: t('LandingPage.hdVideoDesc')
    },
    {
      icon: MapPin,
      title: t('LandingPage.gpsTracking'),
      description: t('LandingPage.gpsTrackingDesc')
    },
    {
      icon: Bell,
      title: t('LandingPage.smartAlerts'),
      description: t('LandingPage.smartAlertsDesc')
    },
    {
      icon: BarChart3,
      title: t('LandingPage.analytics'),
      description: t('LandingPage.analyticsDesc')
    },
    {
      icon: Shield,
      title: t('LandingPage.security'),
      description: t('LandingPage.securityDesc')
    },
    {
      icon: Cloud,
      title: t('LandingPage.cloudStorage'),
      description: t('LandingPage.cloudStorageDesc')
    }
  ];

  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('LandingPage.featuresTitle')} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('LandingPage.featuresTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('LandingPage.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
