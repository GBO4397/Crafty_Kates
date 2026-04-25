import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { useSiteImages } from '@/contexts/SiteImagesContext';

const HeroSection: React.FC = () => {
  const { getImage } = useSiteImages();
  const HERO = {
    background: getImage('hero-background'),
    licensePlate: getImage('hero-license-plate'),
  };

  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);
  const goTo = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* BG Image */}
      <div className="absolute inset-0 z-0">
        <img src={HERO.background} alt="Classic car show background" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a12]/95 via-[#7D0348]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/80 via-transparent to-[#1a0a12]/30" />
      </div>

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-[#FB50B1] via-[#9E065D] to-[#FB50B1]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div className={`transition-all duration-1000 ease-out ${show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="inline-flex items-center gap-2 bg-[#FB50B1]/20 border border-[#FB50B1]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-[#FB50B1] rounded-full animate-pulse" />
              <span className="text-[#FB50B1] text-sm font-medium">
                Promoter &middot; Community Builder &middot; Race Car Driver
              </span>
            </div>

            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl text-white leading-[0.9] tracking-wider mb-6">
              CRAFTY
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4]">
                KATES
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/80 font-light italic mb-2 font-heading tracking-wide">
              "Drive into the past, fuel the future."
            </p>

            <p className="text-white/60 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              Where classic cars, nostalgia race cars, &amp; vintage car culture
              meet and build a thriving community.
            </p>

            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={() => goTo('events')} className="bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 shadow-lg shadow-[#9E065D]/30 hover:shadow-[#FB50B1]/40 hover:scale-105">
                2026 Car Show
              </button>
              <button type="button" onClick={() => goTo('contact')} className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-[#FB50B1] text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 hover:bg-[#FB50B1]/10">
                <Mail size={16} className="text-[#FB50B1]" />
                Contact Kate
              </button>
            </div>

            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="font-heading text-4xl text-[#FB50B1]">30+</p>
                <p className="text-white/50 text-sm">Years in the Industry</p>
              </div>
              <div>
                <p className="font-heading text-4xl text-[#FB50B1]">1000s</p>
                <p className="text-white/50 text-sm">Cars Celebrated</p>
              </div>
              <div>
                <p className="font-heading text-4xl text-[#FB50B1]">Annual</p>
                <p className="text-white/50 text-sm">Classic Burger Car Show</p>
              </div>
            </div>
          </div>

          {/* Right column - License plate */}
          <div className={`hidden lg:block transition-all duration-1000 delay-300 ease-out ${show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#FB50B1]/20 to-[#9E065D]/20 rounded-3xl blur-2xl" />
              <img src={HERO.licensePlate} alt="Welcome License Plate" className="relative w-full rounded-2xl shadow-2xl shadow-black/40 border border-white/10" />
              <div className="absolute bottom-0 right-0 bg-gradient-to-br from-[#9E065D] to-[#7D0348] rounded-tl-2xl p-4 shadow-xl">
                <p className="font-heading text-2xl text-white tracking-wider">EST. 1990s</p>
                <p className="text-[#FEE6F4]/80 text-xs">Racing Circuit Legacy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
