import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
}

const Pricing = () => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      name: t('pricing.starter.name'),
      price: billingCycle === 'monthly' ? '$49' : '$490',
      period: billingCycle === 'monthly' ? t('LandingPage.perMonth') : '/year',
      description: t('pricing.starter.desc'),
      features: [
        t('pricing.starter.f0'),
        t('pricing.starter.f1'),
        t('pricing.starter.f2'),
        t('pricing.starter.f3'),
        t('pricing.starter.f4'),
        t('pricing.starter.f5'),
      ],
    },
    {
      name: t('pricing.professional.name'),
      price: billingCycle === 'monthly' ? '$129' : '$1,290',
      period: billingCycle === 'monthly' ? t('LandingPage.perMonth') : '/year',
      description: t('pricing.professional.desc'),
      features: [
        t('pricing.professional.f0'),
        t('pricing.professional.f1'),
        t('pricing.professional.f2'),
        t('pricing.professional.f3'),
        t('pricing.professional.f4'),
        t('pricing.professional.f5'),
        t('pricing.professional.f6'),
        t('pricing.professional.f7'),
      ],
      highlighted: true,
    },
    {
      name: t('pricing.enterprise.name'),
      price: t('LandingPage.custom'),
      period: '',
      description: t('pricing.enterprise.desc'),
      features: [
        t('pricing.enterprise.f0'),
        t('pricing.enterprise.f1'),
        t('pricing.enterprise.f2'),
        t('pricing.enterprise.f3'),
        t('pricing.enterprise.f4'),
        t('pricing.enterprise.f5'),
        t('pricing.enterprise.f6'),
        t('pricing.enterprise.f7'),
        t('pricing.enterprise.f8'),
      ],
      buttonText: t('LandingPage.contactSales'),
    },
  ];

  const PricingCard = ({ plan }: { plan: Plan }) => (
    <div
      className={cn(
        "relative group rounded-3xl p-8 transition-all duration-500 animate-fade-in",
        plan.highlighted
          ? "bg-gradient-to-br from-card via-card to-card border-2 border-primary shadow-[var(--shadow-gold)] scale-[1.05] hover:scale-[1.08]"
          : "bg-card/60 border border-border hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.02]"
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-primary-foreground px-6 py-2 rounded-full text-sm font-bold animate-shimmer shadow-[var(--shadow-gold)]">
            <Sparkles className="h-4 w-4" />
            {t('LandingPage.mostPopular')}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
          <p className="text-muted-foreground text-sm">{plan.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gold-gradient">{plan.price}</span>
          {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
        </div>

        <a href="#contact">
          <Button
            className={cn(
              "w-full text-base py-6 rounded-xl transition-all duration-300 font-semibold gap-2",
              plan.highlighted
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-[var(--shadow-gold)] hover:scale-105"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
            )}
          >
            {plan.buttonText || t('LandingPage.requestDemo')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>

        <div className="space-y-4 pt-4 border-t border-border/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('LandingPage.whatsIncluded')}</p>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className={cn("shrink-0 mt-0.5 rounded-full p-1", plan.highlighted ? "bg-primary/20" : "bg-secondary")}>
                  <Check className={cn("h-3.5 w-3.5", plan.highlighted ? "text-primary" : "text-foreground/60")} />
                </div>
                <span className="text-foreground/80 text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {plan.highlighted && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      )}
    </div>
  );

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_64%_53%_/_0.08),_transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t('pricing.badge')}
          </div>
          <h2 className="text-5xl md:text-6xl font-bold">
            {t('LandingPage.pricingTitle')} <span className="text-gold-gradient">{t('LandingPage.pricingTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('LandingPage.pricingSubtitle')}</p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-semibold transition-all duration-300 text-sm",
                billingCycle === 'monthly'
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-semibold transition-all duration-300 text-sm relative",
                billingCycle === 'yearly'
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t('pricing.yearly')}
              <span className="absolute -top-2.5 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12 text-sm">
          {t('pricing.footerNote')}
        </p>
      </div>
    </section>
  );
};

export default Pricing;
