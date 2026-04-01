import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowUp, ExternalLink, Lock } from 'lucide-react';

import { sponsorDirectory, getSponsorLink } from '@/data/sponsorData';
import { LOGO } from '@/data/imageConfig';

const FooterSponsorCard: React.FC<{
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
    <div className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-[#FB50B1]/30 hover:shadow-lg hover:shadow-[#FB50B1]/5">
      <div className="flex items-center justify-center h-16 sm:h-20 p-2.5">
        {hasLogo ? (
          <img
            src={logo_url!}
            alt={`${name} logo`}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`max-w-full max-h-full object-contain filter brightness-0 invert opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 ${imgLoaded ? '' : 'opacity-0'}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-1.5">
            <span className="font-heading text-white/60 group-hover:text-[#FB50B1] text-[10px] sm:text-xs tracking-wider leading-tight transition-colors duration-300">
              {name.toUpperCase()}
            </span>
          </div>
        )}
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

const Footer: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = (id: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  const heartSponsors = sponsorDirectory.filter(s => s.category === 'heart');
  const nostalgiaSponsors = sponsorDirectory.filter(s => s.category === 'nostalgia');
  const allSponsors = sponsorDirectory.filter(s => s.category === 'sponsor' || s.tier === 'gold' || s.tier === 'silver');

  const siteLinks = [
    { label: 'Home', to: '/' },
    { label: 'Contact Crafty Kate', action: () => scrollToSection('contact') },
    { label: 'Become a Sponsor', action: () => scrollToSection('contact') },
    { label: 'Posts & Features', to: '/posts' },
    { label: 'All Events', to: '/events' },
    { label: 'Coloring Books', action: () => scrollToSection('coloring-books') },
    { label: 'Coloring Book Archive', to: '/coloring-books' },
    { label: 'Galleries', action: () => scrollToSection('gallery') },
    { label: 'Car Show Details', to: '/car-show' },
    { label: 'Car Show Registration', to: '/register' },
  ];

  return (
    <footer className="relative">
      <div className="bg-[#1a0a12] border-t border-[#FB50B1]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl text-white tracking-wide">2026 CLASSIC BURGER CAR SHOW</h3>
              <p className="text-white/50 text-sm">More information on this classic event can be found here or you can just take my word and signup now and not miss out.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/car-show" className="px-6 py-2.5 border-2 border-white/30 text-white/70 hover:border-[#FB50B1] hover:text-[#FB50B1] rounded-xl font-medium text-sm transition-all duration-300">Details</Link>
              <Link to="/register" className="px-6 py-2.5 border-2 border-[#FB50B1] text-[#FB50B1] hover:bg-[#FB50B1] hover:text-white rounded-xl font-medium text-sm transition-all duration-300">Register</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#1a0a12] to-[#0d050a]">
        <div className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center">
              <h3 className="font-heading text-3xl text-white tracking-wide mb-2">READY TO FOLLOW CRAFTY KATE</h3>
              <p className="text-white/50 text-sm mb-6 max-w-xl mx-auto">
                Whether you're a classic car enthusiast, potential sponsor, compassionate supporter — stay up to date by following Crafty Kate on my social media accounts.
              </p>
              <div className="flex justify-center gap-4">
                {[
                  { label: 'Facebook', url: 'https://www.facebook.com/craftykatespromotions', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { label: 'Instagram', url: 'https://www.instagram.com/craftykatespromotions', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                  { label: 'YouTube', url: 'https://www.youtube.com/@craftykatespromotions', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                ].map((social) => (
                  <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 text-white/70 rounded-xl flex items-center justify-center hover:bg-[#FB50B1] hover:border-[#FB50B1] hover:text-white transition-all duration-300" title={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h4 className="font-heading text-lg text-white tracking-wide mb-5">DEAR TO MY HEART</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {heartSponsors.map((sponsor, i) => (
                  <FooterSponsorCard key={i} name={sponsor.name} logo_url={sponsor.logo_url} link={getSponsorLink(sponsor)} description={sponsor.description} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg text-white tracking-wide mb-5">TRUE NOSTALGIA</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {nostalgiaSponsors.map((sponsor, i) => (
                  <FooterSponsorCard key={i} name={sponsor.name} logo_url={sponsor.logo_url} link={getSponsorLink(sponsor)} description={sponsor.description} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg text-white tracking-wide mb-5">MY SPONSORS</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {allSponsors.map((sponsor, i) => (
                  <FooterSponsorCard key={i} name={sponsor.name} logo_url={sponsor.logo_url} link={getSponsorLink(sponsor)} description={sponsor.description} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg text-white tracking-wide mb-5">SITE MENU</h4>
              <ul className="space-y-2.5">
                {siteLinks.map((link, j) => (
                  <li key={j}>
                    {'to' in link && link.to ? (
                      <Link to={link.to} className="text-white/50 hover:text-[#FB50B1] text-sm transition-colors duration-200">{link.label}</Link>
                    ) : (
                      <button onClick={(link as any).action} className="text-white/50 hover:text-[#FB50B1] text-sm transition-colors duration-200">{link.label}</button>
                    )}
                  </li>
                ))}
              </ul>
              {/* Admin Links */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Lock size={10} />
                  Admin
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link to="/admin" className="text-white/30 hover:text-[#FB50B1] text-sm transition-colors duration-200">Admin Dashboard</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={LOGO} alt="Crafty Kates Logo" className="w-14 h-14 rounded-full" />
              <div>
                <p className="text-white/60 text-sm font-medium">Crafty Kate Promotions</p>
                <p className="text-white/30 text-xs italic">"Drive into the past, fuel the future."</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-white/30 text-sm">Copyright 2026 &copy; Crafty Kates. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link to="/legal/privacy-policy" className="text-white/30 hover:text-[#FB50B1] text-sm transition-colors">Privacy Policy</Link>
                <Link to="/legal/disclaimer" className="text-white/30 hover:text-[#FB50B1] text-sm transition-colors">Disclaimer</Link>
                <Link to="/legal/terms-of-use" className="text-white/30 hover:text-[#FB50B1] text-sm transition-colors">Terms of Use</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] text-white rounded-full shadow-lg shadow-[#9E065D]/30 flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-fade-in" title="Back to top">
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
};

export default Footer;
