import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOTTO } from '@/data/imageConfig';
import BackToTop from './BackToTop';

const MottoSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img src={MOTTO.background} alt="Engine detail" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a12]/90 via-[#7D0348]/80 to-[#9E065D]/70" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#FB50B1]" />
              <span className="text-[#FB50B1] text-sm font-semibold uppercase tracking-widest">Crafty Kate Promotions</span>
              <div className="h-px w-12 bg-[#FB50B1]" />
            </div>
          </div>

          <h2 className="font-heading text-6xl sm:text-7xl lg:text-8xl text-white tracking-wider leading-[0.9] mb-6">
            DRIVE INTO<br />THE PAST
          </h2>
          <h3 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4] tracking-wider mb-8">
            FUEL THE FUTURE
          </h3>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            More than just car shows — we're building community and changing lives. Every engine that roars, every story that's shared, every hand that's extended brings us closer together.
          </p>

          <div className="mt-10 flex justify-center gap-6">
            <button
              onClick={() => scrollToSection('events')}
              className="bg-gradient-to-r from-[#FB50B1] to-[#9E065D] hover:from-[#FEE6F4] hover:to-[#FB50B1] text-white hover:text-[#9E065D] px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-[#FB50B1]/30"
            >
              Upcoming Events
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="border-2 border-white/30 hover:border-[#FB50B1] text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:bg-[#FB50B1]/10"
            >
              Our Story
            </button>
          </div>
        </div>

        <BackToTop className="pt-12" />
      </div>
    </section>
  );
};

export default MottoSection;
