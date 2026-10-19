import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { MeetOrion } from '../components/landing/MeetOrion';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { DayInTheLife } from '../components/landing/DayInTheLife';
import { ReliabilitySecurity } from '../components/landing/ReliabilitySecurity';
import { Architecture } from '../components/landing/Architecture';
import { DemoCarousel } from '../components/landing/DemoCarousel';
import { Footer } from '../components/landing/Footer';

export interface LandingPageProps {
  onOpenApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 cyber-grid flex flex-col">
      <Navbar onOpenApp={onOpenApp} />
      <main className="flex-1">
        <Hero onOpenApp={onOpenApp} />
        <MeetOrion />
        <FeatureGrid />
        <DayInTheLife />
        <ReliabilitySecurity />
        <Architecture />
        <DemoCarousel />
      </main>
      <Footer />
    </div>
  );
};
