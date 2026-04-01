import React, { useState, useEffect, useRef } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { sponsorDirectory, getSponsorLink } from '@/data/sponsorData';
import { useSiteImages } from '@/contexts/SiteImagesContext';


const CommunitySponsorCard: React.FC<{
  name: string;
  logo_url: string | null;
  link: string | null;
  description?: string;
}> = ({ name, logo_url, link, description }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasLogo = logo_url && !imgError;

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [logo_url]);

  const cardContent = (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-[#FB50B1]/30 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FB50B1]/10">
      <div className="flex items-center justify-center h-24 sm:h-28 p-3">
        {hasLogo ? (
          <img
            src={logo_url!}
            alt={`${name} logo`}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`max-w-full max-h-full object-contain filter brightness-0 invert opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 ${imgLoaded ? '' : 'opacity-0'}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-2">
            <span className="font-heading text-white/70 group-hover:text-[#FB50B1] text-xs sm:text-sm tracking-wider leading-tight transition-colors duration-300">
              {name.toUpperCase()}
            </span>
            {description && (
              <span className="text-white/30 text-[9px] sm:text-[10px] mt-1 leading-tight">{description}</span>
            )}
          </div>
        )}
      </div>
      <div className="px-3 pb-3 text-center">
        <p className="text-white/80 text-xs sm:text-sm font-medium group-hover:text-[#FB50B1] transition-colors truncate">{name}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block" title={name}>
        {cardContent}
      </a>
    );
  }

  return <div title={name}>{cardContent}</div>;
};

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
      desc: 'Kate\'s signature cause — supporting rescue animals and finding them forever homes in the Ridgecrest community.',
      image: getImage('community-animal-shelter'),
      link: 'https://www.ridgecrest-ca.gov/departments/animal-control',
    },
    {
      name: 'Almost Eden Rescue',
      desc: 'A dedicated animal rescue organization close to Kate\'s heart, saving lives one animal at a time.',
      image: getImage('community-almost-eden'),
      link: 'https://www.facebook.com/AlmostEdenRescue/',
    },
  ];

  const allSponsors = sponsorDirectory.filter(s => 
    s.category === 'sponsor' || s.category === 'nostalgia'
  );


  return (
    <section id="community" ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a12] via-[#3d0a2a] to-[#7D0348]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptLTEyLTR2Mkg0di0yaDIwem0wLTR2MkgyMHYtMmg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="inline-block text-[#FB50B1] text-sm font-semibold uppercase tracking-widest mb-3">Community & Causes</span>
          <h2 className="font-heading text-5xl sm:text-6xl text-white tracking-wide mb-4">DEAR TO MY HEART</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4] mx-auto rounded-full mb-6" />
          <p className="text-white/60 max-w-2xl mx-auto">
            More than just car shows — we're building community and changing lives. Every event, every connection, every dollar raised goes toward making a real difference.
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-8 mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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

        <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-10">
            <h3 className="font-heading text-3xl text-white tracking-wide mb-2">OUR AMAZING SPONSORS</h3>
            <p className="text-white/50 text-sm">These incredible partners make our events and community work possible.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allSponsors.map((sponsor, i) => (
              <CommunitySponsorCard
                key={i}
                name={sponsor.name}
                logo_url={sponsor.logo_url}
                link={getSponsorLink(sponsor)}
                description={sponsor.description}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              className="group inline-flex items-center gap-2 border-2 border-[#FB50B1] text-[#FB50B1] hover:bg-[#FB50B1] hover:text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300"
            >
              Become a Sponsor
              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
