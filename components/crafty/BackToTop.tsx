import React from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop: React.FC<{ className?: string }> = ({ className = '' }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`flex justify-center pt-8 ${className}`}>
      <button
        onClick={scrollToTop}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#9E065D] transition-colors duration-200 group"
      >
        <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
        Back to Top
      </button>
    </div>
  );
};

export default BackToTop;
