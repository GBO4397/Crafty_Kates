import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useSiteImages } from '@/contexts/SiteImagesContext';

const CommunitySection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { getImage } = useSiteImages();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const causes = [
    {
      name: 'Ridgecrest Animal Shelter',
      desc: "Kate's signature cause — supporting rescue animals and finding them forever homes in the Ridgecrest community.",
      image: getImage('community-animal-shelter'),
      link: 'https://www.ridgecrest-ca.gov/departments/animal-control',
    },
    {
      name: 'Almost Eden Rescue',
      desc: "A dedicated animal rescue organization close to Kate's heart, saving lives one animal at a time.",
      image: getImage('community-almost-eden'),
      link: 'https://www.facebook.com/AlmostEdenRescue/',
    },
  ];

  return (
    <section id="community" ref={sectionRef} className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a12] via-[#3d0a2a] to-[#7D0348]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptLTEyLTR2Mg==...')] opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="inline-block text-[#FB50B1] text-sm font-semibold uppercase tracking-widest mb-3">Community & Causes</span>
          <h2 className="font-heading text-5xl sm:text-6xl text-white tracking-wide mb-4">DEAR TO MY HEART</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4] mx-auto rounded-full mb-6" />
          <p className="text-white/60 max-w-2xl mx-auto">
            More than just car shows — we're building community and changing lives. Every event, every connection, every dollar raised goes toward making a real difference.
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {causes.map((cause, i) => (
            <a
              key={i}
              href={cause.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 block"
            >
              <div className="aspect-video overflow-hidden">
                <img src={cause.image} alt={cause.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-[#FB50B1]" />
                  <h3 className="font-heading text-2xl text-white tracking-wide">{cause.name}</h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{cause.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
