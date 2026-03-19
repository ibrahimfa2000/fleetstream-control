import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

const stats = [
  { key: "vehicles", value: 15000, suffix: "+" },
  { key: "events", value: 2400000, suffix: "+" },
  { key: "uptime", value: 99.9, suffix: "%", decimal: true },
  { key: "fleets", value: 850, suffix: "+" },
];

function useCountUp(target: number, duration = 2000, decimal = false) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const StatCard = ({ stat }: { stat: typeof stats[0] }) => {
  const { t } = useTranslation();
  const { count, ref } = useCountUp(stat.value, 2000, stat.decimal);

  const display = stat.decimal
    ? count.toFixed(1)
    : count >= 1000000
    ? `${(count / 1000000).toFixed(1)}M`
    : count >= 1000
    ? `${(count / 1000).toFixed(0)}K`
    : Math.floor(count).toString();

  return (
    <div ref={ref} className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-gold)] group">
      <div className="text-5xl md:text-6xl font-bold text-gold-gradient mb-2 group-hover:scale-110 transition-transform">
        {display}{stat.suffix}
      </div>
      <div className="text-muted-foreground font-medium">{t(`socialProof.stat.${stat.key}`)}</div>
    </div>
  );
};

const testimonials = [
  { key: "t1", avatar: "MT" },
  { key: "t2", avatar: "SA" },
  { key: "t3", avatar: "RK" },
];

const clientLogos = ["LogiCorp", "TransLink", "SafeRoute", "FleetPro", "RoadGuard", "CityBus"];

const SocialProof = () => {
  const { t } = useTranslation();

  return (
    <section id="social-proof" className="py-24 relative overflow-hidden bg-secondary/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(43_64%_53%_/_0.08),_transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10 space-y-20">
        {/* Stats */}
        <div>
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              {t('socialProof.statsTitle')} <span className="text-gold-gradient">{t('socialProof.statsTitleHighlight')}</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat) => (
              <StatCard key={stat.key} stat={stat} />
            ))}
          </div>
        </div>

        {/* Trusted logos */}
        <div className="text-center animate-fade-in">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            {t('socialProof.trustedBy')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {clientLogos.map((logo) => (
              <div
                key={logo}
                className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[var(--shadow-elegant)] text-muted-foreground hover:text-foreground font-semibold text-sm"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold">
              {t('socialProof.testimonialsTitle')} <span className="text-gold-gradient">{t('socialProof.testimonialsTitleHighlight')}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((item, index) => (
              <div
                key={item.key}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] animate-slide-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-foreground/80 leading-relaxed mb-6 italic">
                  {t(`socialProof.${item.key}.quote`)}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t(`socialProof.${item.key}.name`)}</p>
                    <p className="text-muted-foreground text-xs">{t(`socialProof.${item.key}.role`)}</p>
                  </div>
                  {/* Stars */}
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-primary text-xs">★</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
