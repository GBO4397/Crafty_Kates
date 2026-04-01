import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ArrowLeft, Camera, ZoomIn, Grid, LayoutGrid, Download, Share2, Images } from 'lucide-react';
import Navigation from '@/components/crafty/Navigation';
import Footer from '@/components/crafty/Footer';
import type { GalleryImage } from '@/data/galleryData';

interface PhotographerGalleryProps {
  photographer: string;
  images: GalleryImage[];
}

const PhotographerGallery: React.FC<PhotographerGalleryProps> = ({ photographer, images }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState<Set<number>>(new Set());
  const [lightboxLoaded, setLightboxLoaded] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setLightboxLoaded(false);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goNext = useCallback(() => {

    setLightboxLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);


  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, goNext, goPrev]);

  const handleImageLoad = (index: number) => {
    setLoaded((prev) => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    setImgError((prev) => new Set(prev).add(index));
  };

  const validImages = images.filter((_, i) => !imgError.has(i));

  // Determine the other photographer for cross-linking
  const otherPhotographer = photographer === 'Ben Radatz'
    ? { name: 'K. Mikael Wallin', path: '/gallery/k-mikael-wallin' }
    : { name: 'Ben Radatz', path: '/gallery/ben-radatz' };

  // Create masonry column assignments
  const getMasonryColumns = (total: number) => {
    const cols: number[][] = [[], [], [], []];
    for (let i = 0; i < total; i++) {
      cols[i % 4].push(i);
    }
    return cols;
  };

  const masonryColumns = getMasonryColumns(validImages.length);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navigation />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-[#1a0a12] via-[#2d1020] to-[#1a0a12] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #FB50B1 1px, transparent 1px), radial-gradient(circle at 75% 75%, #FB50B1 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FB50B1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#9E065D]/15 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Breadcrumb */}
          <nav className={`flex items-center gap-2 text-sm mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link to="/" className="text-white/40 hover:text-[#FB50B1] transition-colors">Home</Link>
            <ChevronRight size={14} className="text-white/20" />
            <button onClick={() => {
              const el = document.getElementById('gallery');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} className="text-white/40 hover:text-[#FB50B1] transition-colors">Gallery</button>
            <ChevronRight size={14} className="text-white/20" />
            <span className="text-[#FB50B1]">{photographer}</span>
          </nav>

          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* Left side */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FB50B1]/15 border border-[#FB50B1]/25 rounded-full px-4 py-1.5 mb-6">
                <Camera size={14} className="text-[#FB50B1]" />
                <span className="text-[#FB50B1] text-sm font-medium">Photography Collection</span>
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white tracking-wider leading-[0.95] mb-4">
                CLASSIC BURGER
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4]">
                  CAR SHOW
                </span>
              </h1>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-[2px] bg-gradient-to-r from-[#FB50B1] to-transparent" />
                <p className="text-white/70 text-lg font-light italic">
                  Imagery by <span className="text-[#FB50B1] font-medium not-italic">{photographer}</span>
                </p>
              </div>

              <p className="text-white/40 text-sm max-w-lg mt-4">
                A curated collection of stunning photographs capturing the spirit, beauty, and community of the Classic Burger Car Show.
              </p>
            </div>

            {/* Right side - Stats & Actions */}
            <div className="flex flex-col items-start lg:items-end gap-6">
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center lg:text-right">
                  <p className="font-heading text-4xl text-[#FB50B1]">{validImages.length}</p>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Photos</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center lg:text-right">
                  <p className="font-heading text-4xl text-white/80">2024</p>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Car Show</p>
                </div>
              </div>

              {/* View toggle & actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('masonry')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      viewMode === 'masonry'
                        ? 'bg-[#FB50B1] text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <LayoutGrid size={16} />
                    <span className="hidden sm:inline">Masonry</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-[#FB50B1] text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Grid size={16} />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </div>

                <Link
                  to={otherPhotographer.path}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-[#FB50B1] hover:border-[#FB50B1]/30 text-sm font-medium transition-all duration-300"
                >
                  <Images size={16} />
                  <span className="hidden sm:inline">{otherPhotographer.name}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Gallery Grid */}
      <section ref={galleryRef} className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Masonry View */}
          {viewMode === 'masonry' && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4">
              {validImages.map((img, i) => (
                <div
                  key={`masonry-${i}`}
                  onClick={() => openLightbox(i)}
                  className={`group relative mb-3 sm:mb-4 break-inside-avoid rounded-xl overflow-hidden cursor-pointer bg-gray-100 transition-all duration-500 hover:shadow-xl hover:shadow-[#FB50B1]/10 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${Math.min(i * 40, 800)}ms` }}
                >
                  {!loaded.has(i) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                  )}
                  <img
                    src={img.thumb || img.src}
                    alt={`${photographer} - Classic Burger Car Show photo ${i + 1}`}
                    onLoad={() => handleImageLoad(i)}
                    onError={() => handleImageError(i)}
                    className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 ${
                      loaded.has(i) ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/70 via-[#1a0a12]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-xs font-medium">{i + 1} / {validImages.length}</span>
                      <ZoomIn size={16} className="text-white/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {validImages.map((img, i) => (
                <div
                  key={`grid-${i}`}
                  onClick={() => openLightbox(i)}
                  className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100 transition-all duration-500 hover:shadow-xl hover:shadow-[#FB50B1]/10 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${Math.min(i * 40, 800)}ms` }}
                >
                  {!loaded.has(i) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                  )}
                  <img
                    src={img.thumb || img.src}
                    alt={`${photographer} - Classic Burger Car Show photo ${i + 1}`}
                    onLoad={() => handleImageLoad(i)}
                    onError={() => handleImageError(i)}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                      loaded.has(i) ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-xs font-medium">{i + 1}</span>
                      <ZoomIn size={16} className="text-white/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cross-link to other gallery */}
      <section className="py-16 bg-gradient-to-b from-white via-[#FEE6F4]/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#9E065D]/60 text-sm uppercase tracking-widest mb-3">More Photography</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-gray-900 tracking-wide mb-4">
            VIEW THE {otherPhotographer.name.toUpperCase()} GALLERY
          </h2>
          <p className="text-gray-500 text-base mb-8 max-w-lg mx-auto">
            Explore another perspective of the Classic Burger Car Show through the lens of {otherPhotographer.name}.
          </p>
          <Link
            to={otherPhotographer.path}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-[#9E065D]/20 hover:shadow-[#FB50B1]/30 hover:scale-105"
          >
            <Camera size={18} />
            {otherPhotographer.name} Gallery
          </Link>
        </div>
      </section>

      {/* Back to home */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#9E065D] hover:text-[#FB50B1] font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Crafty Kates
          </Link>
        </div>
      </section>

      <Footer />

      {/* Lightbox */}
      {lightboxOpen && validImages.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-[#0a0305]/98 flex items-center justify-center" onClick={closeLightbox}>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm font-medium bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
                {currentIndex + 1} / {validImages.length}
              </span>
              <span className="hidden sm:block text-white/50 text-sm">{photographer}</span>
            </div>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation arrows */}
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

          {/* Image container */}
          <div
            className="relative max-w-[92vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {!lightboxLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#FB50B1]/30 border-t-[#FB50B1] rounded-full animate-spin" />
              </div>
            )}
            <img
              src={validImages[currentIndex]?.src}
              alt={`${photographer} - Photo ${currentIndex + 1}`}
              onLoad={() => setLightboxLoaded(true)}
              className={`max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-black/50 transition-opacity duration-300 ${
                lightboxLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

          {/* Bottom bar - thumbnail strip */}
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/60 to-transparent py-4 px-4">
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto max-w-3xl mx-auto pb-1">
              {validImages.slice(
                Math.max(0, currentIndex - 5),
                Math.min(validImages.length, currentIndex + 6)
              ).map((img, offset) => {
                const actualIndex = Math.max(0, currentIndex - 5) + offset;
                return (
                  <button
                    key={actualIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxLoaded(false);
                      setCurrentIndex(actualIndex);
                    }}
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all duration-200 ${
                      actualIndex === currentIndex
                        ? 'ring-2 ring-[#FB50B1] scale-110 opacity-100'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img
                      src={img.thumb || img.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotographerGallery;
