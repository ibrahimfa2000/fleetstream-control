import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="./logo.jpg" alt="ApexAuto Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-bold text-primary">ApexAuto</span>
            </div>
            <p className="text-muted-foreground">
              {t('LandingPage.footerDesc')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('LandingPage.product')}</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.features')}</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.pricing')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.documentation')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.api')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('LandingPage.company')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.aboutUs')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.careers')}</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.contact')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.blog')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('LandingPage.legal')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.privacyPolicy')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.termsOfService')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('LandingPage.cookiePolicy')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ApexAuto. {t('LandingPage.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
