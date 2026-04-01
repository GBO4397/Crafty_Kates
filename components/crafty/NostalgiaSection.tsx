import React, { useState, useEffect, useRef } from 'react';
import { Quote, ExternalLink } from 'lucide-react';
import { sponsorDirectory, getSponsorLink } from '@/data/sponsorData';

const getNameColor = (name: string): string => {
  const colors = [
    'from-rose-600 to-pink-700', 'from-violet-600 to-purple-700',
    'from-blue-600 to-indigo-700', 'from-emerald-600 to-teal-700',
    'from-orange-600 to-red-700', 'from-cyan-600 to-blue-700',
    'from-fuchsia-600 to-pink-700', 'from-amber-600 to-orange-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

/* ─── Nostalgia Sponsor Card with Logo ─── */
const NostalgiaSponsorCard: React.FC<{
  name: string;
  description: string;
  logo_url: string | null;
  link: string | null;
}> = ({ name, description, logo_url, link }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasLogo = logo_url && !imgError;

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [logo_url]);

  const cardContent = (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#FB50B1]/30 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      
      {/* Logo / Branded Card Area */}
      <div className="flex items-center justify-center h-28 sm:h-32 p-4 mx-4 mt-4 rounded-xl overflow-hidden">
        {hasLogo ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 m-4 bg-gray-50 animate-pulse rounded-xl" />
            )}
            <img
              src={logo_url!}
              alt={`${name} logo`}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
              className={`max-w-full max-h-full object-contain transition-all duration-700 ease-out group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getNameColor(name)} rounded-xl flex flex-col items-center justify-center px-3 py-2 transition-all duration-700 ease-out group-hover:scale-105`}>
            <span className="font-heading text-white tracking-wider text-center leading-tight text-sm sm:text-base">
              {name.toUpperCase()}
            </span>
            <span className="text-white/50 text-[10px] sm:text-xs mt-1 text-center leading-tight">{description}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-3 text-center">
        <h4 className="font-heading text-lg text-gray-900 tracking-wide group-hover:text-[#9E065D] transition-colors leading-tight">{name}</h4>
        <p className="text-gray-500 text-xs mt-1">{description}</p>
        {link && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[#9E065D] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <span className="text-xs font-medium">Visit</span>
            <ExternalLink size={10} />
          </div>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

const NostalgiaSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      quote: "Kate doesn't just organize car shows — she creates moments that bring an entire community together. Her passion for classic cars is only matched by her dedication to giving back.",
      author: "Classic Car Enthusiast",
      role: "Annual Car Show Attendee",
    },
    {
      quote: "From the Hollywood film sets to the race tracks of Ridgecrest, Kate has always been the heart and soul of every event she touches. She's the real deal.",
      author: "Racing Community Member",
      role: "Long-time Friend & Supporter",
    },
    {
      quote: "What Kate has done for the Ridgecrest Animal Shelter through her car shows is nothing short of amazing. She proves that car culture and compassion go hand in hand.",
      author: "Local Community Leader",
      role: "Ridgecrest Resident",
    },
  ];

  // Get nostalgia sponsors from the directory
  const nostalgiaSponsors = sponsorDirectory.filter(s => s.category === 'nostalgia');

  return (
    <section ref={sectionRef} className="py-24 bg-[#FEE6F4]/10 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FB50B1]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Testimonials */}
        <div className={`mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">Community Voices</span>
            <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">WHAT PEOPLE SAY</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full" />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white rounded-3xl shadow-xl p-10 border border-[#FEE6F4]">
              <div className="absolute -top-5 left-10">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="min-h-[120px]">
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-500 ${
                      activeTestimonial === i ? 'opacity-100' : 'opacity-0 absolute inset-0 p-10'
                    }`}
                  >
                    {activeTestimonial === i && (
                      <>
                        <p className="text-gray-700 text-lg leading-relaxed italic mb-6">"{t.quote}"</p>
                        <div>
                          <p className="font-semibold text-[#9E065D]">{t.author}</p>
                          <p className="text-gray-400 text-sm">{t.role}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      activeTestimonial === i ? 'bg-[#9E065D] w-8' : 'bg-gray-300 hover:bg-[#FB50B1]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* True Nostalgia — Now with logo images */}
        <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-10">
            <h3 className="font-heading text-3xl text-[#9E065D] tracking-wide mb-2">TRUE NOSTALGIA</h3>
            <p className="text-gray-500 text-sm">The culture, the community, the legacy that inspires everything we do.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {nostalgiaSponsors.map((sponsor, i) => (
              <NostalgiaSponsorCard
                key={i}
                name={sponsor.name}
                description={sponsor.description}
                logo_url={sponsor.logo_url}
                link={getSponsorLink(sponsor)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NostalgiaSection;
