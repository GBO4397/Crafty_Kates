import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera, ArrowRight } from 'lucide-react';
import { GALLERY_PREVIEW, BEN_RADATZ_GALLERY, WALLIN_GALLERY } from '@/data/imageConfig';
import BackToTop from './BackToTop';

const galleryImages = GALLERY_PREVIEW.map(src => ({ src }));

const photographers = [
  {
    name: 'Ben Radatz',
    path: '/gallery/ben-radatz',
    count: BEN_RADATZ_GALLERY.length,
    description: 'Capturing the raw beauty and detail of classic automobiles with an artistic eye.',
    preview: BEN_RADATZ_GALLERY[0]?.src,
  },
  {
    name: 'K. Mikael Wallin',
    path: '/gallery/k-mikael-wallin',
    count: WALLIN_GALLERY.length,
    description: 'Documenting the energy, community, and spirit of the car show experience.',
    preview: WALLIN_GALLERY[0]?.src,
  },
];

const GallerySection: React.FC = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen]);

  return (
    <section id="gallery" ref={sectionRef} className="relative overflow-hidden">
      <div className="bg-gradient-to-b from-[#1a0a12] via-[#1f0e18] to-[#1a0a12] py-20 sm:py-28">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #FB50B1 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="inline-flex items-center gap-2 bg-[#FB50B1]/10 border border-[#FB50B1]/20 rounded-full px-4 py-1.5 mb-6">
              <Camera size={14} className="text-[#FB50B1]" />
              <span className="text-[#FB50B1] text-sm font-medium">Photo Gallery</span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider leading-tight mb-4">
              CLASSIC BURGER CAR SHOW
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#FB50B1]" />
              <p className="text-[#FB50B1]/80 italic text-base sm:text-lg tracking-wide">
                Prior Years Gallery
              </p>
              <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#FB50B1]" />
            </div>
            <p className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto">
              Relive the magic of past Classic Burger Car Shows through the lenses of our talented photographers.
            </p>
          </div>

          {/* Photographer Cards - WITH PREVIEW IMAGES */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-14 max-w-3xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {photographers.map((p) => (
              <Link
                key={p.name}
                to={p.path}
                className="group relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-[#FB50B1]/30 transition-all duration-500"
              >
                {/* Preview Image */}
                {p.preview && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={p.preview}
                      alt={`${p.name} gallery preview`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12] via-[#1a0a12]/40 to-transparent" />
                  </div>
                )}

                <div className="relative p-6 sm:p-8">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FB50B1]/0 group-hover:bg-[#FB50B1]/10 rounded-full blur-3xl transition-all duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FB50B1] to-[#9E065D] rounded-xl flex items-center justify-center">
                        <Camera size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-white tracking-wide group-hover:text-[#FB50B1] transition-colors">
                          {p.name.toUpperCase()}
                        </h3>
                        <p className="text-white/30 text-xs">{p.count} Photos</p>
                      </div>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed mb-4">{p.description}</p>
                    <div className="flex items-center gap-2 text-[#FB50B1] text-sm font-medium group-hover:gap-3 transition-all duration-300">
                      <span>View Gallery</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FB50B1] to-[#9E065D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            ))}
          </div>

          {/* Preview Image Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className={`group relative overflow-hidden cursor-pointer bg-white/5 transition-all duration-500 hover:z-10 hover:shadow-xl hover:shadow-[#FB50B1]/10 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${
                  i % 6 === 0 || i % 6 === 3 ? 'aspect-[3/4] rounded-xl' :
                  i % 6 === 1 || i % 6 === 4 ? 'aspect-square rounded-xl' :
                  'aspect-[4/5] rounded-xl'
                }`}
                style={{ transitionDelay: `${Math.min(i * 60, 700) + 300}ms` }}
              >
                {!loaded.has(i) && (
                  <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />
                )}
                <img
                  src={img.src}
                  alt={`Classic Burger Car Show photo ${i + 1}`}
                  onLoad={() => setLoaded((prev) => new Set(prev).add(i))}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                    loaded.has(i) ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ZoomIn size={14} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <BackToTop className="pt-10" />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0a0305]/98 flex items-center justify-center" onClick={closeLightbox}>
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
            <span className="text-white/70 text-sm font-medium bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {galleryImages.length}
            </span>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>

          <div className="max-w-[92vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[currentIndex].src}
              alt={`Photo ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-black/50"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
