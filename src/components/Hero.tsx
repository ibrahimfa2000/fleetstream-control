import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, MapPin, Camera, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background layers */}
      <div className="absolute inset-0 bg-dot-grid opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_hsl(43_64%_53%_/_0.18),_transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,_hsl(43_64%_53%_/_0.08),_transparent)]" />

      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-6 relative z-10 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-8 animate-fade-in text-center xl:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
              {t('LandingPage.heroBadge')}
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              {t('LandingPage.heroTitle1')}{" "}
              <span className="text-gold-gradient block">{t('LandingPage.heroTitle2')}</span>
              {t('LandingPage.heroTitle3')}
            </h1>

            {/* Tag line */}
            <p className="text-lg font-medium text-primary/80 tracking-wider uppercase">
              {t('LandingPage.heroTagline')}
            </p>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mx-auto xl:mx-0">
              {t('LandingPage.heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4">
              <a href="#contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-[var(--shadow-gold)] text-base px-8 py-6 rounded-xl transition-all hover:scale-105 font-semibold gap-2"
                >
                  {t('LandingPage.requestDemo')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <a href="#dashboard-preview">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/40 text-foreground hover:bg-primary/10 hover:border-primary text-base px-8 py-6 rounded-xl transition-all hover:scale-105 font-semibold gap-2"
                >
                  <Play className="h-4 w-4 text-primary" />
                  {t('LandingPage.seePlatform')}
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center xl:justify-start gap-3 pt-2">
              {[
                { icon: Activity, label: t('LandingPage.trust1') },
                { icon: Camera, label: t('LandingPage.trust2') },
                { icon: MapPin, label: t('LandingPage.trust3') },
                { icon: Shield, label: t('LandingPage.trust4') },
              ].map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.label} className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {badge.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative animate-scale-in" style={{ animationDelay: '200ms' }}>
            {/* Glow behind dashboard */}
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/15 rounded-3xl blur-3xl animate-pulse-glow" />

            <div className="relative rounded-2xl border border-primary/30 overflow-hidden shadow-[var(--shadow-gold)] bg-slate-950">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-primary/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-3 bg-slate-800 rounded px-3 py-1 text-[10px] text-muted-foreground font-mono text-center">
                  fleetstream.control — Live Dashboard
                </div>
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> LIVE
                </span>
              </div>

              {/* Dashboard content */}
              <div className="bg-slate-950 p-4 space-y-3">
                {/* Stat row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Online", val: "24", c: "text-green-400" },
                    { label: "Alerts", val: "3", c: "text-red-400" },
                    { label: "Cameras", val: "96", c: "text-blue-400" },
                    { label: "Speed", val: "OK", c: "text-primary" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-900 rounded-lg p-2 text-center">
                      <div className={`text-lg font-bold ${s.c}`}>{s.val}</div>
                      <div className="text-[9px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Map + vehicle list row */}
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-3 bg-slate-900 rounded-xl overflow-hidden">
                    <div className="relative h-32">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                      <div className="absolute inset-0 bg-dot-grid opacity-30" />
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="none">
                        <line x1="0" y1="60" x2="200" y2="60" stroke="hsl(43 64% 53%)" strokeWidth="0.7" />
                        <line x1="100" y1="0" x2="100" y2="120" stroke="hsl(43 64% 53%)" strokeWidth="0.7" />
                      </svg>
                      {[
                        { x: "25%", y: "35%", c: "bg-green-400" },
                        { x: "55%", y: "60%", c: "bg-primary" },
                        { x: "75%", y: "25%", c: "bg-blue-400" },
                        { x: "40%", y: "70%", c: "bg-amber-400" },
                      ].map((v, i) => (
                        <div key={i} className="absolute" style={{ left: v.x, top: v.y, transform: 'translate(-50%,-50%)' }}>
                          <div className={`w-2 h-2 rounded-full ${v.c}`} />
                          <div className={`absolute inset-0 w-2 h-2 rounded-full ${v.c} opacity-50 animate-map-ping`} />
                        </div>
                      ))}
                      <div className="absolute bottom-1.5 left-2 text-[9px] text-primary font-semibold">Live Map</div>
                    </div>
                  </div>
                  <div className="col-span-2 bg-slate-900 rounded-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-800 text-[10px] font-semibold text-foreground">Fleet</div>
                    {[
                      { id: "BUS-04", speed: "62", s: "text-green-400" },
                      { id: "TRK-11", speed: "0", s: "text-amber-400" },
                      { id: "VAN-07", speed: "95", s: "text-red-400" },
                    ].map((v) => (
                      <div key={v.id} className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-800/50 last:border-0">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.s === 'text-green-400' ? 'bg-green-400' : v.s === 'text-amber-400' ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
                        <span className="text-[9px] font-mono text-foreground flex-1">{v.id}</span>
                        <span className={`text-[9px] ${v.s}`}>{v.speed}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Camera grid */}
                <div className="grid grid-cols-4 gap-1">
                  {["Front", "Rear", "Left", "Cabin"].map((ch, i) => (
                    <div key={ch} className="relative aspect-video bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-slate-900/70" />
                      <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)" }} />
                      <Camera className="w-3 h-3 text-primary/50 relative z-10" />
                      <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${i === 2 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
                      <span className="absolute bottom-0.5 left-0.5 text-[7px] text-muted-foreground">{ch}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating alert badge */}
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              ⚠ Overspeed Alert
            </div>
            {/* Floating status badge */}
            <div className="absolute -bottom-3 -left-3 bg-card border border-primary/30 text-foreground text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-[var(--shadow-gold)] animate-float" style={{ animationDelay: '3s' }}>
              <span className="text-green-400">●</span> 24/7 Monitoring Active
            </div>
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { value: "24/7", label: t('LandingPage.realtimeMonitoring'), delay: '0ms' },
            { value: "99.9%", label: t('LandingPage.platformUptime'), delay: '100ms' },
            { value: "10K+", label: t('LandingPage.vehiclesConnected'), delay: '200ms' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] text-center group animate-slide-up"
              style={{ animationDelay: stat.delay }}
            >
              <div className="text-4xl font-bold text-gold-gradient mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
