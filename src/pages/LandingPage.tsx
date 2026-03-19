import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PlatformOverview from "@/components/PlatformOverview";
import Features from "@/components/Features";
import WhyChooseUs from "@/components/WhyChooseUs";
import Industries from "@/components/Industries";
import DashboardPreview from "@/components/DashboardPreview";
import SocialProof from "@/components/SocialProof";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PlatformOverview />
        <Features />
        <WhyChooseUs />
        <Industries />
        <DashboardPreview />
        <SocialProof />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
