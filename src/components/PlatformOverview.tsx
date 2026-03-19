import { MapPin, Camera, PlayCircle, Bell, Route, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const blocks = [
  {
    icon: MapPin,
    key: "liveTracking",
    mockup: (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-primary/20 shadow-[var(--shadow-card)]">
        {/* Map grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        {/* Fake road lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 180">
          <line x1="0" y1="90" x2="300" y2="90" stroke="hsl(43 64% 53% / 0.4)" strokeWidth="1.5" strokeDasharray="8,6" />
          <line x1="150" y1="0" x2="150" y2="180" stroke="hsl(43 64% 53% / 0.3)" strokeWidth="1" strokeDasharray="6,8" />
          <line x1="50" y1="0" x2="200" y2="180" stroke="hsl(43 64% 53% / 0.2)" strokeWidth="1" />
        </svg>
        {/* Vehicle pings */}
        {[
          { x: "28%", y: "40%", label: "BUS-04" },
          { x: "58%", y: "60%", label: "TRK-11" },
          { x: "72%", y: "28%", label: "VAN-07" },
        ].map((v) => (
          <div key={v.label} className="absolute" style={{ left: v.x, top: v.y }}>
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-map-ping opacity-60" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card/90 border border-primary/30 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                {v.label}
              </div>
            </div>
          </div>
        ))}
        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-primary/20 px-3 py-2 flex items-center gap-4">
          <span className="text-[10px] text-primary font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />3 Online</span>
          <span className="text-[10px] text-muted-foreground">Last: 2s ago</span>
        </div>
      </div>
    ),
  },
  {
    icon: Camera,
    key: "multiCamera",
    mockup: (
      <div className="w-full rounded-xl overflow-hidden border border-primary/20 shadow-[var(--shadow-card)] bg-slate-900">
        <div className="grid grid-cols-2 gap-0.5 bg-border/30">
          {["CH1 Front", "CH2 Rear", "CH3 Left", "CH4 Cabin"].map((ch, i) => (
            <div key={ch} className="relative aspect-video bg-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700/40 to-slate-900/60" />
              {/* Fake video scanline effect */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)" }} />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Camera className="w-4 h-4 text-primary/60" />
                <span className="text-[9px] text-muted-foreground">{ch}</span>
              </div>
              <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
              <div className="absolute bottom-1 left-1.5 text-[8px] text-primary/70 font-mono">LIVE</div>
            </div>
          ))}
        </div>
        <div className="px-3 py-2 bg-card/80 flex items-center justify-between">
          <span className="text-[10px] text-primary font-semibold">4-Channel MDVR</span>
          <span className="text-[10px] text-green-400">● Recording</span>
        </div>
      </div>
    ),
  },
  {
    icon: PlayCircle,
    key: "playback",
    mockup: (
      <div className="w-full rounded-xl overflow-hidden border border-primary/20 shadow-[var(--shadow-card)] bg-slate-900">
        <div className="relative aspect-video bg-slate-800 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/40 to-slate-900/80" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)" }} />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <PlayCircle className="w-10 h-10 text-primary/80" />
            <span className="text-[10px] text-muted-foreground font-mono">2024-03-15 08:42:33</span>
          </div>
          <div className="absolute top-2 left-2 bg-amber-600/30 border border-amber-500/40 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded">EVENT</div>
          <div className="absolute top-2 right-2 text-[9px] text-muted-foreground font-mono">1080p</div>
        </div>
        <div className="px-3 py-2 bg-card/90">
          <div className="w-full h-1.5 bg-secondary rounded-full mb-1.5">
            <div className="h-full w-1/3 bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
            <span>00:14:22</span><span>00:42:00</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Bell,
    key: "smartAlerts",
    mockup: (
      <div className="w-full rounded-xl overflow-hidden border border-primary/20 shadow-[var(--shadow-card)] bg-card">
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-foreground">Alert Feed</span>
          <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Live</span>
        </div>
        <div className="divide-y divide-border/30">
          {[
            { color: "red", icon: "⚠", label: "Overspeed", detail: "VAN-07 • 95 km/h", time: "now" },
            { color: "amber", icon: "🔴", label: "Harsh Brake", detail: "BUS-04 • -0.8g", time: "2m" },
            { color: "blue", icon: "📍", label: "Geofence Exit", detail: "TRK-11 • Zone A", time: "5m" },
            { color: "green", icon: "✓", label: "Ignition On", detail: "CAR-02 • Engine start", time: "8m" },
          ].map((alert) => (
            <div key={alert.label} className="px-3 py-2 flex items-center gap-2.5 hover:bg-secondary/30 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                alert.color === 'red' ? 'bg-red-500' : alert.color === 'amber' ? 'bg-amber-500' : alert.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-foreground">{alert.label}</p>
                <p className="text-[9px] text-muted-foreground truncate">{alert.detail}</p>
              </div>
              <span className="text-[9px] text-muted-foreground flex-shrink-0">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Route,
    key: "routeHistory",
    mockup: (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-primary/20 shadow-[var(--shadow-card)]">
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
          <path d="M30,150 Q80,130 120,100 T200,60 T270,30" fill="none" stroke="hsl(43 64% 53%)" strokeWidth="2.5" strokeDasharray="none" opacity="0.7" strokeLinecap="round"/>
          <path d="M30,150 Q80,130 120,100 T200,60 T270,30" fill="none" stroke="hsl(43 64% 53% / 0.15)" strokeWidth="12" strokeLinecap="round"/>
          <circle cx="30" cy="150" r="5" fill="hsl(142 76% 36%)" />
          <circle cx="270" cy="30" r="5" fill="hsl(43 64% 53%)" />
          <circle cx="120" cy="100" r="3.5" fill="hsl(43 64% 53% / 0.6)" />
          <circle cx="200" cy="60" r="3.5" fill="hsl(43 64% 53% / 0.6)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-primary/20 px-3 py-2 flex items-center gap-4">
          <span className="text-[10px] text-muted-foreground">Total: <span className="text-foreground font-semibold">142 km</span></span>
          <span className="text-[10px] text-muted-foreground">Stops: <span className="text-foreground font-semibold">4</span></span>
          <span className="text-[10px] text-muted-foreground">Dur: <span className="text-foreground font-semibold">3h 22m</span></span>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    key: "fleetAnalytics",
    mockup: (
      <div className="w-full rounded-xl overflow-hidden border border-primary/20 shadow-[var(--shadow-card)] bg-card">
        <div className="p-3 border-b border-border/50">
          <span className="text-[11px] font-semibold text-foreground">Fleet Performance</span>
        </div>
        <div className="p-3 space-y-2">
          {[
            { label: "Driver Score", value: 87, color: "bg-green-400" },
            { label: "Fuel Efficiency", value: 73, color: "bg-primary" },
            { label: "On-Time Delivery", value: 91, color: "bg-blue-400" },
            { label: "Safety Rating", value: 94, color: "bg-accent" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[9px] text-muted-foreground">{item.label}</span>
                <span className="text-[9px] font-bold text-foreground">{item.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-secondary/60 rounded-full">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const PlatformOverview = () => {
  const { t } = useTranslation();

  return (
    <section id="solutions" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t('overview.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('overview.title')} <span className="text-gold-gradient">{t('overview.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('overview.subtitle')}
          </p>
        </div>

        <div className="space-y-24">
          {blocks.map((block, index) => {
            const Icon = block.icon;
            const isEven = index % 2 === 0;
            return (
              <div
                key={block.key}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`space-y-6 animate-slide-in-left ${!isEven ? 'lg:order-2' : ''}`} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                      {t(`overview.${block.key}.badge`)}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    {t(`overview.${block.key}.title`)}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t(`overview.${block.key}.desc`)}
                  </p>

                  <ul className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <li key={i} className="flex items-center gap-2.5 text-foreground/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {t(`overview.${block.key}.bullet${i}`)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`animate-slide-in-right ${!isEven ? 'lg:order-1' : ''}`}
                  style={{ animationDelay: `${index * 80 + 100}ms` }}
                >
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      {block.mockup}
                    </div>
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

export default PlatformOverview;
