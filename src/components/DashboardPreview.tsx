import { MapPin, Camera, Bell, BarChart3, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

const DashboardPreview = () => {
  const { t } = useTranslation();

  return (
    <section id="dashboard-preview" className="py-24 relative overflow-hidden bg-secondary/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(43_64%_53%_/_0.08),_transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t('dashPreview.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('dashPreview.title')} <span className="text-gold-gradient">{t('dashPreview.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('dashPreview.subtitle')}</p>
        </div>

        {/* Browser chrome wrapper */}
        <div className="relative max-w-6xl mx-auto animate-scale-in">
          {/* Glow */}
          <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl animate-pulse-glow" />

          <div className="relative rounded-2xl border border-primary/30 overflow-hidden shadow-[var(--shadow-gold)] bg-slate-950">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-primary/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4 bg-slate-800 rounded-md px-3 py-1 text-xs text-muted-foreground font-mono text-center">
                fleetstream.control — Command Center
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> LIVE</span>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="grid grid-cols-12 gap-0 min-h-[520px]">
              {/* Sidebar */}
              <div className="col-span-2 bg-slate-900 border-r border-slate-800 p-3 space-y-1 hidden md:block">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-3 px-2">Navigation</div>
                {[
                  { icon: Activity, label: "Overview", active: true },
                  { icon: MapPin, label: "Live Map" },
                  { icon: Camera, label: "Cameras" },
                  { icon: Bell, label: "Alerts" },
                  { icon: BarChart3, label: "Reports" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] cursor-pointer transition-colors ${
                        item.active
                          ? "bg-primary/20 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-slate-800 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {item.label}
                    </div>
                  );
                })}
              </div>

              {/* Main content area */}
              <div className="col-span-12 md:col-span-10 bg-slate-950 p-4 space-y-4">
                {/* Top stat bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Active Vehicles", value: "24", sub: "of 30 total", color: "text-green-400" },
                    { label: "Speed Violations", value: "3", sub: "last 1h", color: "text-red-400" },
                    { label: "Cameras Online", value: "96", sub: "of 100", color: "text-blue-400" },
                    { label: "Fuel Alerts", value: "2", sub: "low level", color: "text-amber-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                      <p className="text-[9px] text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-3">
                  {/* Map panel */}
                  <div className="col-span-12 lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-foreground flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" /> Live Map</span>
                      <span className="text-[9px] text-green-400">● 24 active</span>
                    </div>
                    <div className="relative h-40">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                      <div className="absolute inset-0 bg-dot-grid opacity-30" />
                      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 400 160" preserveAspectRatio="none">
                        <line x1="0" y1="80" x2="400" y2="80" stroke="hsl(43 64% 53%)" strokeWidth="0.8" />
                        <line x1="200" y1="0" x2="200" y2="160" stroke="hsl(43 64% 53%)" strokeWidth="0.8" />
                        <line x1="100" y1="0" x2="300" y2="160" stroke="hsl(43 64% 53%)" strokeWidth="0.5" />
                        <line x1="300" y1="0" x2="100" y2="160" stroke="hsl(43 64% 53%)" strokeWidth="0.5" />
                      </svg>
                      {[
                        { x: "20%", y: "35%", label: "BUS-04", c: "bg-green-400" },
                        { x: "48%", y: "55%", label: "TRK-11", c: "bg-primary" },
                        { x: "70%", y: "25%", label: "VAN-07", c: "bg-blue-400" },
                        { x: "35%", y: "70%", label: "CAR-02", c: "bg-amber-400" },
                        { x: "82%", y: "65%", label: "TRK-15", c: "bg-primary" },
                      ].map((v) => (
                        <div key={v.label} className="absolute" style={{ left: v.x, top: v.y, transform: 'translate(-50%, -50%)' }}>
                          <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${v.c}`} />
                            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${v.c} opacity-60 animate-map-ping`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle list */}
                  <div className="col-span-12 lg:col-span-5 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <span className="text-[10px] font-semibold text-foreground">Fleet Status</span>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {[
                        { id: "BUS-04", speed: "62 km/h", status: "Moving", color: "text-green-400", dot: "bg-green-400" },
                        { id: "TRK-11", speed: "0 km/h", status: "Idle", color: "text-amber-400", dot: "bg-amber-400" },
                        { id: "VAN-07", speed: "95 km/h", status: "Overspeed!", color: "text-red-400", dot: "bg-red-500 animate-pulse" },
                        { id: "CAR-02", speed: "48 km/h", status: "Moving", color: "text-green-400", dot: "bg-green-400" },
                      ].map((v) => (
                        <div key={v.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/50 transition-colors">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.dot}`} />
                          <span className="text-[10px] font-mono font-semibold text-foreground w-14">{v.id}</span>
                          <span className={`text-[10px] flex-1 ${v.color}`}>{v.status}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{v.speed}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Camera thumbnails */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold text-foreground">Live Feeds</span>
                    </div>
                    <div className="grid grid-cols-2 gap-0.5 p-0.5 bg-slate-800">
                      {["Front", "Rear", "Left", "Cabin"].map((ch, i) => (
                        <div key={ch} className="relative bg-slate-800 aspect-video flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/80" />
                          <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)" }} />
                          <span className="relative z-10 text-[8px] text-muted-foreground">{ch}</span>
                          <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alert feed */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-foreground flex items-center gap-1.5"><Bell className="w-3 h-3 text-primary" /> Alerts</span>
                      <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">3 new</span>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {[
                        { dot: "bg-red-500", text: "Overspeed – VAN-07", time: "0m" },
                        { dot: "bg-amber-500", text: "Harsh Brake – BUS-04", time: "3m" },
                        { dot: "bg-blue-400", text: "Geofence Exit – TRK-11", time: "7m" },
                        { dot: "bg-green-400", text: "Ignition On – CAR-02", time: "11m" },
                      ].map((a) => (
                        <div key={a.text} className="flex items-center gap-2.5 px-3 py-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`} />
                          <span className="text-[9px] text-foreground flex-1 truncate">{a.text}</span>
                          <span className="text-[9px] text-muted-foreground flex-shrink-0">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance chart */}
                  <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold text-foreground">Performance</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {[
                        { label: "Safety Score", val: 94, color: "bg-green-400" },
                        { label: "Fuel Eff.", val: 78, color: "bg-primary" },
                        { label: "Utilization", val: 85, color: "bg-blue-400" },
                        { label: "On-Time", val: 91, color: "bg-accent" },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[9px] text-muted-foreground">{m.label}</span>
                            <span className="text-[9px] font-bold text-foreground">{m.val}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full">
                            <div className={`h-full rounded-full ${m.color} transition-all`} style={{ width: `${m.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
