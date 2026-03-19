import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import emailjs from "emailjs-com";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Contact = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().trim().min(1, { message: t('LandingPage.nameRequired') }).max(100),
    company: z.string().trim().min(1, { message: t('contact.companyRequired') }).max(100),
    phone: z.string().trim().min(1, { message: t('contact.phoneRequired') }).max(30),
    email: z.string().trim().min(1, { message: t('LandingPage.emailRequired') }).email({ message: t('LandingPage.emailInvalid') }),
    fleetSize: z.string().min(1, { message: t('contact.fleetSizeRequired') }),
    message: z.string().trim().min(1, { message: t('LandingPage.messageRequired') }).max(1000),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", company: "", phone: "", email: "", fleetSize: "", message: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { ...values },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      toast.success(t('LandingPage.messageSent'));
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error(t('LandingPage.messageError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fleetSizes = [
    { value: "1-10", label: "1–10 Vehicles" },
    { value: "11-50", label: "11–50 Vehicles" },
    { value: "51-200", label: "51–200 Vehicles" },
    { value: "201-500", label: "201–500 Vehicles" },
    { value: "500+", label: "500+ Vehicles" },
  ];

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(43_64%_53%_/_0.1),_transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t('contact.badge')}
          </div>
          <h2 className="text-5xl md:text-6xl font-bold">
            {t('LandingPage.contactTitle')} <span className="text-gold-gradient">{t('LandingPage.contactTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 animate-slide-in-left">
            <h3 className="text-2xl font-bold mb-6 text-foreground">{t('contact.formTitle')}</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('LandingPage.yourName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} className="bg-background border-border focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.company')}</FormLabel>
                      <FormControl>
                        <Input placeholder="FleetCo Ltd." {...field} className="bg-background border-border focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555 000 0000" {...field} className="bg-background border-border focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('LandingPage.yourEmail')}</FormLabel>
                      <FormControl>
                        <Input placeholder="john@fleetco.com" type="email" {...field} className="bg-background border-border focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="fleetSize" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contact.fleetSize')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border h-12">
                          <SelectValue placeholder={t('contact.fleetSizePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fleetSizes.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('LandingPage.yourMessage')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('contact.messagePlaceholder')}
                        {...field}
                        className="bg-background border-border focus:border-primary min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-[var(--shadow-gold)] text-base py-6 rounded-xl transition-all hover:scale-[1.02] font-semibold gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? t('LandingPage.sending') : (
                    <><Send className="h-4 w-4" />{t('contact.submit')}</>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6 animate-slide-in-right">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 text-foreground">{t('LandingPage.contactInfo')}</h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: t('LandingPage.emailUs'), value: "info@ApexCam.com", href: "mailto:info@ApexCam.com" },
                  { icon: Phone, label: t('LandingPage.callUs'), value: "(+972) 54-765-0058", href: "tel:+972547650058" },
                  { icon: MapPin, label: t('LandingPage.visitUs'), value: "Israel", href: "#" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4 group">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                        <a href={item.href} className="text-foreground font-semibold hover:text-primary transition-colors">{item.value}</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/972547650058"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 rounded-3xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_hsl(142_76%_36%_/_0.2)] group"
            >
              <div className="h-12 w-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{t('contact.whatsappTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('contact.whatsappSub')}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-green-400 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Business hours */}
            <div className="bg-gradient-to-br from-card to-card border border-primary/20 rounded-3xl p-6 shadow-[var(--shadow-elegant)]">
              <h4 className="font-bold mb-4 text-foreground">{t('contact.hoursTitle')}</h4>
              <div className="space-y-2 text-sm">
                {[
                  { day: "Mon – Fri", hours: "9:00 AM – 6:00 PM" },
                  { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
                  { day: "Sunday", hours: "Closed" },
                ].map((h) => (
                  <div key={h.day} className="flex justify-between">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-semibold text-foreground">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
