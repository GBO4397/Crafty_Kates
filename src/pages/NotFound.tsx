import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { LOGO } from '@/data/imageConfig';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a12] via-[#2d0f1f] to-[#1a0a12] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FB50B1]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#9E065D]/15 rounded-full blur-[100px]" />
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #FB50B1 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FB50B1] via-[#9E065D] to-[#FB50B1]" />

      <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
        {/* Logo */}
        <Link to="/" className="inline-block mb-8">
          <img src={LOGO} alt="Crafty Kates Logo" className="w-20 h-20 rounded-full shadow-lg shadow-[#FB50B1]/20 mx-auto hover:scale-105 transition-transform" />
        </Link>

        {/* 404 Number */}
        <h1 className="font-heading text-[120px] sm:text-[160px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#FB50B1] to-[#FB50B1]/20 tracking-wider mb-0">
          404
        </h1>

        {/* Message */}
        <h2 className="font-heading text-2xl sm:text-3xl text-white tracking-wide mb-3 -mt-4">
          WRONG TURN, PARTNER
        </h2>
        <p className="text-white/50 text-base mb-2">
          Looks like this road doesn't lead anywhere.
        </p>
        <p className="text-white/30 text-sm mb-8">
          The page <span className="text-[#FB50B1]/60 font-mono">{location.pathname}</span> could not be found.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/20 hover:border-[#FB50B1] text-white hover:text-[#FB50B1] rounded-xl font-medium text-sm transition-all duration-300 hover:bg-[#FB50B1]/10 w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-[#9E065D]/30 hover:shadow-[#FB50B1]/40 w-full sm:w-auto justify-center"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Maybe try one of these?</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Car Show', to: '/car-show' },
              { label: 'Events', to: '/events' },
              { label: 'Posts', to: '/posts' },
              { label: 'Gallery', to: '/gallery/ben-radatz' },
              { label: 'Contact', to: '/#contact' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-[#FB50B1] hover:border-[#FB50B1]/30 text-sm transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-white/20 text-xs italic">"Drive into the past, fuel the future."</p>
      </div>
    </div>
  );
};

export default NotFound;
