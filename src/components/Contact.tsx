import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Contact = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('LandingPage.nameRequired') })
      .max(100, { message: t('LandingPage.nameTooLong') }),
    email: z
      .string()
      .trim()
      .min(1, { message: t('LandingPage.emailRequired') })
      .email({ message: t('LandingPage.emailInvalid') })
      .max(255, { message: t('LandingPage.emailTooLong') }),
    message: z
      .string()
      .trim()
      .min(1, { message: t('LandingPage.messageRequired') })
      .max(1000, { message: t('LandingPage.messageTooLong') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success(t('LandingPage.messageSent'));
      form.reset();
    } catch (error) {
      toast.error(t('LandingPage.messageError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(45_85%_58%_/_0.1),_transparent_70%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold">
            {t('LandingPage.contactTitle')} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('LandingPage.contactTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('LandingPage.contactSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 animate-slide-up">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">{t('LandingPage.yourName')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          className="bg-background border-border focus:border-primary transition-colors h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">{t('LandingPage.yourEmail')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="john@example.com" 
                          type="email"
                          {...field} 
                          className="bg-background border-border focus:border-primary transition-colors h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">{t('LandingPage.yourMessage')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('LandingPage.yourMessage')}
                          {...field} 
                          className="bg-background border-border focus:border-primary transition-colors min-h-[150px] text-base resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-gold)] text-lg py-6 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    t('LandingPage.sending')
                  ) : (
                    <>
                      {t('LandingPage.sendMessage')}
                      <Send className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold mb-6 text-foreground">{t('LandingPage.contactInfo')}</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('LandingPage.emailUs')}</div>
                    <a href="mailto:info@M-Z.com" className="text-foreground hover:text-primary transition-colors text-lg font-semibold">
                      info@m-z.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('LandingPage.callUs')}</div>
                    <a href="tel:+972547650058" className="text-foreground hover:text-primary transition-colors text-lg font-semibold">
                      (+972) 54-765-0058
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('LandingPage.visitUs')}</div>
                    <p className="text-foreground text-lg font-semibold">
                      الشارع<br />
                      شعب, اسراىْيل 2016500
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card via-card to-card border-2 border-primary/30 rounded-3xl p-8 shadow-[var(--shadow-gold)]">
              <h4 className="text-xl font-bold mb-4 text-foreground">Business Hours</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-semibold text-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-semibold text-foreground">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-semibold text-foreground">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
