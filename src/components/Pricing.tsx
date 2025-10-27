import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const individualPlans: Plan[] = [
    {
      name: t('LandingPage.basic'),
      price: billingCycle === 'monthly' ? '₪29' : '₪290',
      period: billingCycle === 'monthly' ? t('LandingPage.perMonth') : '/year',
      description: t('LandingPage.basicDesc'),
      features: [
        "Up to 1 vehicles",
        "Basic real-time monitoring",
        "GPS tracking",
        "7-day video storage",
        "Mobile app access",
        "Email support"
      ]
    },
    {
      name: t('LandingPage.pro'),
      price: billingCycle === 'monthly' ? '₪59' : '₪590',
      period: billingCycle === 'monthly' ? t('LandingPage.perMonth') : '/year',
      description: t('LandingPage.proDesc'),
      features: [
        "Up to 3 vehicles",
        "Advanced real-time monitoring",
        "GPS tracking & route history",
        "30-day video storage",
        "Mobile & web app access",
        "Priority email support",
        "Custom alerts & notifications",
        "Driver behavior analytics"
      ],
      highlighted: true
    },
    {
      name: t('LandingPage.premium'),
      price: billingCycle === 'monthly' ? '₪99' : '₪990',
      period: billingCycle === 'monthly' ? t('LandingPage.perMonth') : '/year',
      description: t('LandingPage.premiumDesc'),
      features: [
        "Up to 5 vehicles",
        "Premium real-time monitoring",
        "Advanced GPS & geofencing",
        "90-day video storage",
        "Multi-device access",
        "24/7 phone & email support",
        "Advanced analytics & reports",
        "Driver scoring system",
        "API access"
      ]
    }
  ];

  const businessPlans: Plan[] = [
    {
      name: t('LandingPage.startup'),
      price: billingCycle === 'monthly' ? '₪199' : '₪1,990',
      period: billingCycle === 'monthly' ? t('LandingPage.perMonth') : '/year',
      description: t('LandingPage.startupDesc'),
      features: [
        "Up to 50 vehicles",
        "Enterprise monitoring system",
        "Advanced fleet analytics",
        "90-day video storage",
        "Multi-user accounts",
        "24/7 priority support",
        "Custom integrations",
        "Dedicated account manager",
        "Monthly performance reports"
      ]
    },
    {
      name: t('LandingPage.business'),
      price: billingCycle === 'monthly' ? '₪499' : '₪4,990',
      period: billingCycle === 'monthly' ? t('LandingPage.perMonth') : '/year',
      description: t('LandingPage.businessDesc'),
      features: [
        "Up to 150 vehicles",
        "Advanced enterprise features",
        "AI-powered analytics",
        "180-day video storage",
        "Unlimited user accounts",
        "24/7 premium support",
        "Custom API integrations",
        "Dedicated account team",
        "Weekly performance reviews",
        "Custom reporting dashboards",
        "Training & onboarding"
      ],
      highlighted: true
    },
    {
      name: t('LandingPage.enterprise'),
      price: t('LandingPage.custom'),
      period: "",
      description: t('LandingPage.enterpriseDesc'),
      features: [
        "Unlimited vehicles",
        "White-label solutions",
        "Custom AI & ML models",
        "Unlimited video storage",
        "Advanced user management",
        "Dedicated infrastructure",
        "Custom development",
        "24/7 enterprise support",
        "SLA guarantees",
        "On-site training",
        "Custom integrations",
        "Compliance & security audits"
      ],
      buttonText: t('LandingPage.contactSales')
    }
  ];

  const PricingCard = ({ plan }: { plan: Plan }) => (
    <div
      className={cn(
        "relative group rounded-3xl p-8 transition-all duration-500 animate-fade-in",
        plan.highlighted
          ? "bg-gradient-to-br from-card via-card to-card border-2 border-primary shadow-[var(--shadow-gold)] scale-[1.05] hover:scale-[1.08]"
          : "bg-card/50 border border-border hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.02]"
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
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
          <p className="text-muted-foreground text-sm">{plan.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-muted-foreground text-lg">{plan.period}</span>
          )}
        </div>

        <Button
          className={cn(
            "w-full text-lg py-6 rounded-xl transition-all duration-300",
            plan.highlighted
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-gold)] hover:shadow-[var(--shadow-gold)] hover:scale-105"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
          )}
        >
          {plan.buttonText || t('LandingPage.selectPlan')}
        </Button>

        <div className="space-y-4 pt-6">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('LandingPage.whatsIncluded')}
          </div>
          <ul className="space-y-4">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "shrink-0 mt-0.5 rounded-full p-1",
                  plan.highlighted ? "bg-primary/20" : "bg-secondary"
                )}>
                  <Check className={cn(
                    "h-4 w-4",
                    plan.highlighted ? "text-primary" : "text-foreground/60"
                  )} />
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(45_85%_58%_/_0.1),_transparent_70%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold">
            {t('LandingPage.pricingTitle')} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('LandingPage.pricingTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('LandingPage.pricingSubtitle')}
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2 rounded-full font-semibold transition-all duration-300",
                billingCycle === 'monthly'
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2 rounded-full font-semibold transition-all duration-300 relative",
                billingCycle === 'yearly'
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-accent text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-14 bg-secondary/50 p-1 rounded-2xl">
            <TabsTrigger 
              value="individual" 
              className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[var(--shadow-gold)]"
            >
              {t('LandingPage.forIndividuals')}
            </TabsTrigger>
            <TabsTrigger 
              value="business"
              className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[var(--shadow-gold)]"
            >
              {t('LandingPage.forBusiness')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-8">
            <div className="text-center space-y-2 animate-fade-in">
              <h3 className="text-3xl font-bold">{t('LandingPage.forIndividuals')}</h3>
              <p className="text-muted-foreground">{t('LandingPage.forIndividualsDesc')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {individualPlans.map((plan, index) => (
                <PricingCard key={index} plan={plan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-8">
            <div className="text-center space-y-2 animate-fade-in">
              <h3 className="text-3xl font-bold">{t('LandingPage.forBusiness')}</h3>
              <p className="text-muted-foreground">{t('LandingPage.forBusinessDesc')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {businessPlans.map((plan, index) => (
                <PricingCard key={index} plan={plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Pricing;
