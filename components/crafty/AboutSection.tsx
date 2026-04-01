import React, { useState, useEffect, useRef } from 'react';
import { Heart, Trophy, Film, Car } from 'lucide-react';
import { useSiteImages } from '@/contexts/SiteImagesContext';

const AboutSection: React.FC = () => {
  const { getImage } = useSiteImages();
  const ABOUT = { portrait: getImage('about-portrait') };

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const highlights = [
    { icon: <Film className="w-6 h-6" />, title: 'Hollywood Craft Services', desc: '30 years feeding film crews on major productions across Hollywood.' },
    { icon: <Car className="w-6 h-6" />, title: 'Race Track Promoter', desc: 'From promotional model to driving force behind iconic racing events.' },
    { icon: <Trophy className="w-6 h-6" />, title: 'Classic Burger Car Show', desc: 'Creator and organizer of the beloved annual Classic Burgers Car Show.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Animal Advocate', desc: 'Dedicated supporter of the Ridgecrest Animal Shelter and rescue organizations.' },
  ];

  return (
    <section id="about" ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FEE6F4]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FB50B1]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">About Katherine</span>
          <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">THE WOMAN BEHIND THE LEGEND</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute -inset-3 bg-gradient-to-br from-[#FB50B1]/20 to-[#9E065D]/20 rounded-3xl blur-xl" />
              <img
                src={ABOUT.portrait}
                alt="Katherine Crafty Kate"
                className="relative w-full rounded-2xl shadow-xl object-cover aspect-[3/4]"
              />
              <div className="absolute bottom-4 right-4 bg-white rounded-2xl shadow-xl p-5 max-w-[240px] border border-[#FEE6F4]">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z"/>
                  </svg>
                </div>
                <p className="text-gray-700 text-sm italic leading-relaxed">
                  "Every car has a soul — I just help bring them all together."
                </p>
                <p className="text-[#9E065D] text-xs font-semibold mt-2">— Crafty Kate</p>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h3 className="font-heading text-3xl text-[#9E065D] tracking-wide mb-6">WHERE PASSION MEETS PURPOSE</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>With a 30-year career spanning film industry craft services, race track promotion, and automotive modeling, Katherine "Crafty Kate" has built an unshakeable legacy as a promoter, racer, and community advocate who believes every car has a soul—and every event should give back.</p>
              <p>From her days as a promotional model working alongside legends like George "The Bushmaster" through the 1990s racing circuit, to becoming the driving force behind the Classic Burgers Annual Car Show, Kate has dedicated her life to three passions: celebrating American muscle, supporting local racers, and making a tangible difference through her signature cause—the Ridgecrest Animal Shelter.</p>
              <p>She spent 30 years feeding film crews, a lifetime at race tracks, and every spare moment giving back to her community. She's crafty, all right—but not in the way you might think. Kate's the real deal: a woman whose dedication to cars, racing, and animals has left an indelible mark on everyone she's touched.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {highlights.map((item, i) => (
                <div key={i} className="group p-4 rounded-xl border border-gray-100 hover:border-[#FB50B1]/30 hover:bg-[#FEE6F4]/30 transition-all duration-300 cursor-default">
                  <div className="w-10 h-10 bg-[#FEE6F4] text-[#9E065D] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#9E065D] group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
