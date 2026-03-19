import {
  Video, MapPin, Bell, BarChart3, Shield, Cloud,
  Truck, Route, Download, Activity, Users, FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesGrid = () => {
  const { t } = useTranslation();

  const features = [
    { icon: MapPin, key: "gpsTracking" },
    { icon: Video, key: "liveVideo" },
    { icon: Route, key: "routeHistory" },
    { icon: Download, key: "remoteDownload" },
    { icon: Activity, key: "driverBehavior" },
    { icon: MapPin, key: "geofencing" },
    { icon: Bell, key: "overspeed" },
    { icon: Shield, key: "panicButton" },
    { icon: Truck, key: "fuelIgnition" },
    { icon: BarChart3, key: "centralDash" },
    { icon: Users, key: "multiUser" },
    { icon: FileText, key: "reportsExport" },
  ];

  const iconColors = [
    "text-primary", "text-blue-400", "text-green-400", "text-purple-400",
    "text-amber-400", "text-cyan-400", "text-red-400", "text-orange-400",
    "text-emerald-400", "text-indigo-400", "text-pink-400", "text-yellow-400",
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/20" />
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_64%_53%_/_0.06),_transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t('LandingPage.featuresBadge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('LandingPage.featuresTitle')} <span className="text-gold-gradient">{t('LandingPage.featuresTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('LandingPage.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.key}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.03] animate-slide-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-border group-hover:border-primary/20">
                  <Icon className={`h-6 w-6 ${iconColors[index]}`} />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">{t(`features.${feature.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.${feature.key}.desc`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
