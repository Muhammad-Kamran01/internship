import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { AgentsShowcase } from '../components/landing/AgentsShowcase';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { AboutSection } from '../components/landing/AboutSection';
import { Testimonials } from '../components/landing/Testimonials';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
// import { PricingSection } from '../components/landing/PricingSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <AgentsShowcase />
        <FeaturesSection />
        <AboutSection />
        <Testimonials />
        <FAQSection />
        <CTASection />
        {/* <PricingSection /> */}
      </main>
      <Footer />
    </div>
  );
};
