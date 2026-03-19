import { ShieldCheck, Eye, Lock, Zap, Users, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const props = [
  { icon: ShieldCheck, key: "safety", gradient: "from-green-500/20 to-green-600/5", iconColor: "text-green-400" },
  { icon: Eye, key: "visibility", gradient: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
  { icon: Lock, key: "protection", gradient: "from-primary/20 to-accent/5", iconColor: "text-primary" },
  { icon: Zap, key: "response", gradient: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400" },
  { icon: Users, key: "accountability", gradient: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400" },
  { icon: FileText, key: "evidence", gradient: "from-cyan-500/20 to-cyan-600/5", iconColor: "text-cyan-400" },
];

const WhyChooseUs = () => {
  const { t } = useTranslation();

  return (
    <section id="why-us" className="py-24 relative overflow-hidden bg-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_64%_53%_/_0.06),_transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t('why.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('why.title')} <span className="text-gold-gradient">{t('why.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('why.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {props.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`h-7 w-7 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{t(`why.${item.key}.title`)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(`why.${item.key}.desc`)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered highlight CTA banner */}
        <div className="mt-16 text-center">
          <div className="inline-block p-px bg-gradient-to-r from-primary via-accent to-primary rounded-2xl animate-shimmer" style={{ backgroundSize: '200% auto' }}>
            <div className="bg-card rounded-2xl px-12 py-8">
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {t('why.ctaText')}
              </p>
              <p className="text-muted-foreground">{t('why.ctaSubtext')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
