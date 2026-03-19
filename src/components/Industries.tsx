import { Truck, Bus, GraduationCap, Car, Package, HardHat } from "lucide-react";
import { useTranslation } from "react-i18next";

const industries = [
  { icon: Truck, key: "logistics", accent: "from-blue-500/20 to-blue-600/5", border: "hover:border-blue-400/50" },
  { icon: Bus, key: "publicTransport", accent: "from-green-500/20 to-green-600/5", border: "hover:border-green-400/50" },
  { icon: GraduationCap, key: "schoolBuses", accent: "from-amber-500/20 to-amber-600/5", border: "hover:border-amber-400/50" },
  { icon: Car, key: "taxiFleets", accent: "from-yellow-500/20 to-yellow-600/5", border: "hover:border-yellow-400/50" },
  { icon: Package, key: "delivery", accent: "from-purple-500/20 to-purple-600/5", border: "hover:border-purple-400/50" },
  { icon: HardHat, key: "construction", accent: "from-orange-500/20 to-orange-600/5", border: "hover:border-orange-400/50" },
];

const Industries = () => {
  const { t } = useTranslation();

  return (
    <section id="industries" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t('industries.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('industries.title')} <span className="text-gold-gradient">{t('industries.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('industries.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {industries.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`group relative p-8 rounded-2xl bg-card border border-border ${item.border} transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.03] cursor-pointer animate-slide-up overflow-hidden`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 border border-border group-hover:border-primary/30">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{t(`industries.${item.key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{t(`industries.${item.key}.desc`)}</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1].map((i) => (
                      <span key={i} className="text-[11px] bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 font-medium">
                        {t(`industries.${item.key}.tag${i}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Industries;
