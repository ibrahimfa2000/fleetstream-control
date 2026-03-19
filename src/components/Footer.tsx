import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Youtube, MessageCircle } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative border-t border-border bg-card/30 pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="./logo.jpg" alt="ApexCam Logo" className="h-10 w-10 rounded-xl border border-primary/30" />
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-accent/10 rounded-xl blur opacity-60" />
              </div>
              <div>
                <span className="text-xl font-bold text-primary block leading-none">ApexCam</span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase">MDVR Platform</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t('LandingPage.footerDesc')}
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-2">
              {[
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: MessageCircle, href: "https://wa.me/972547650058", label: "WhatsApp" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
            {/* Contact quick */}
            <div className="space-y-1.5 pt-1">
              {[
                { icon: Mail, val: "info@ApexCam.com", href: "mailto:info@ApexCam.com" },
                { icon: Phone, val: "(+972) 54-765-0058", href: "tel:+972547650058" },
                { icon: MapPin, val: "Israel", href: "#" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <a key={c.val} href={c.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    {c.val}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('LandingPage.product')}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t('LandingPage.features'), href: '#features' },
                { label: t('LandingPage.solutions'), href: '#solutions' },
                { label: t('LandingPage.pricing'), href: '#pricing' },
                { label: t('LandingPage.documentation'), href: '#' },
                { label: t('LandingPage.api'), href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('LandingPage.company')}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t('LandingPage.aboutUs'), href: '#' },
                { label: t('industries.badge'), href: '#industries' },
                { label: t('LandingPage.contact'), href: '#contact' },
                { label: t('LandingPage.blog'), href: '#' },
                { label: t('LandingPage.careers'), href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('LandingPage.legal')}</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.privacyPolicy')}</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.termsOfService')}</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.cookiePolicy')}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ApexCam. {t('LandingPage.allRightsReserved')}</p>
          <p className="flex items-center gap-1.5">
            <span>🛡</span> {t('footer.trust')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
