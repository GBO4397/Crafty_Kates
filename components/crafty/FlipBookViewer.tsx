import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, BookOpen, ZoomIn, ZoomOut } from 'lucide-react';

interface FlipPage {
  image_url: string;
  title?: string;
  page_number: number;
  is_color?: boolean;
  type?: 'cover' | 'inside-front' | 'page' | 'inside-back' | 'back-cover';
}

interface FlipBookViewerProps {
  pages: FlipPage[];
  title: string;
  onClose?: () => void;
}

const FlipBookViewer: React.FC<FlipBookViewerProps> = ({ pages, title }) => {
  const [currentSpread, setCurrentSpread] = useState(0); // Index into spreads array
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Build spreads (pairs of pages for desktop, single pages for mobile)
  const spreads = React.useMemo(() => {
    if (isMobile) {
      return pages.map((p) => [p]);
    }
    // Desktop: first page alone (cover), then pairs, last page alone if odd
    const result: FlipPage[][] = [];
    if (pages.length === 0) return result;

    // Cover is alone
    result.push([pages[0]]);

    // Interior pages in pairs
    for (let i = 1; i < pages.length - 1; i += 2) {
      if (i + 1 < pages.length) {
        result.push([pages[i], pages[i + 1]]);
      } else {
        result.push([pages[i]]);
      }
    }

    // Back cover alone (if more than 1 page and not already included)
    if (pages.length > 1) {
      const lastPage = pages[pages.length - 1];
      const lastSpread = result[result.length - 1];
      if (!lastSpread.includes(lastPage)) {
        result.push([lastPage]);
      }
    }

    return result;
  }, [pages, isMobile]);

  const totalSpreads = spreads.length;

  const goNext = useCallback(() => {
    if (currentSpread >= totalSpreads - 1 || isFlipping) return;
    setIsFlipping(true);
    setFlipDirection('left');
    setTimeout(() => {
      setCurrentSpread((prev) => prev + 1);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 400);
  }, [currentSpread, totalSpreads, isFlipping]);

  const goPrev = useCallback(() => {
    if (currentSpread <= 0 || isFlipping) return;
    setIsFlipping(true);
    setFlipDirection('right');
    setTimeout(() => {
      setCurrentSpread((prev) => prev - 1);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 400);
  }, [currentSpread, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, isFullscreen]);

  // Touch/swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const currentPages = spreads[currentSpread] || [];
  const isCoverPage = currentSpread === 0;
  const isBackCover = currentSpread === totalSpreads - 1;
  const isSinglePage = currentPages.length === 1;

  // Calculate page numbers for display
  const getDisplayPageNum = () => {
    if (isMobile) return `Page ${currentSpread + 1} of ${totalSpreads}`;
    if (isCoverPage) return 'Front Cover';
    if (isBackCover && pages.length > 1) return 'Back Cover';
    const leftPage = currentPages[0];
    const rightPage = currentPages[1];
    if (rightPage) {
      return `Pages ${leftPage.page_number} - ${rightPage.page_number}`;
    }
    return `Page ${leftPage?.page_number || 1}`;
  };

  const viewerContent = (
    <div
      ref={containerRef}
      className={`relative select-none ${isFullscreen ? 'fixed inset-0 z-[200] bg-black flex flex-col' : ''}`}
    >
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-4 py-3 ${isFullscreen ? 'bg-gray-900' : 'bg-gradient-to-r from-[#1a0a12] to-[#2d0f1f] rounded-t-2xl'}`}>
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#FB50B1]" />
          <span className="text-white text-sm font-semibold truncate max-w-[200px]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs hidden sm:block">{getDisplayPageNum()}</span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Book Area */}
      <div
        className={`relative flex items-center justify-center ${isFullscreen ? 'flex-1 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-b from-gray-100 to-gray-200 min-h-[400px] md:min-h-[550px]'} overflow-hidden`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Book shadow */}
        <div className={`absolute inset-0 pointer-events-none ${isFullscreen ? '' : ''}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[85%] bg-black/20 blur-xl rounded-xl" />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          disabled={currentSpread === 0}
          className={`absolute left-2 md:left-4 z-20 p-2 md:p-3 rounded-full transition-all ${
            currentSpread === 0
              ? 'opacity-20 cursor-not-allowed text-gray-400'
              : 'bg-white/90 hover:bg-white text-gray-800 shadow-lg hover:shadow-xl hover:scale-105'
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={goNext}
          disabled={currentSpread >= totalSpreads - 1}
          className={`absolute right-2 md:right-4 z-20 p-2 md:p-3 rounded-full transition-all ${
            currentSpread >= totalSpreads - 1
              ? 'opacity-20 cursor-not-allowed text-gray-400'
              : 'bg-white/90 hover:bg-white text-gray-800 shadow-lg hover:shadow-xl hover:scale-105'
          }`}
        >
          <ChevronRight size={20} />
        </button>

        {/* Book */}
        <div
          className={`relative z-10 flex ${isSinglePage ? 'justify-center' : ''} ${
            isFullscreen ? 'max-h-[85vh]' : 'max-h-[500px] md:max-h-[550px]'
          }`}
          style={{ perspective: '1500px' }}
        >
          {currentPages.map((page, idx) => {
            const isLeft = idx === 0 && !isSinglePage;
            const isRight = idx === 1;

            return (
              <div
                key={`${currentSpread}-${idx}`}
                className={`relative bg-white shadow-2xl transition-all duration-400 ${
                  isFlipping
                    ? flipDirection === 'left'
                      ? 'animate-flip-left'
                      : 'animate-flip-right'
                    : ''
                } ${isSinglePage ? 'rounded-lg' : isLeft ? 'rounded-l-lg' : 'rounded-r-lg'}`}
                style={{
                  width: isMobile ? 'min(85vw, 350px)' : isFullscreen ? 'min(40vw, 450px)' : 'min(35vw, 380px)',
                  aspectRatio: '3/4',
                }}
              >
                {/* Page content */}
                <img
                  src={page.image_url}
                  alt={page.title || `Page ${page.page_number}`}
                  className="w-full h-full object-contain bg-white rounded-inherit"
                  style={{ borderRadius: 'inherit' }}
                />

                {/* Page spine shadow */}
                {!isSinglePage && (
                  <div
                    className={`absolute top-0 bottom-0 w-8 pointer-events-none ${
                      isLeft
                        ? 'right-0 bg-gradient-to-l from-black/10 to-transparent'
                        : 'left-0 bg-gradient-to-r from-black/10 to-transparent'
                    }`}
                  />
                )}

                {/* Page title overlay */}
                {page.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-inherit" style={{ borderRadius: 'inherit' }}>
                    <p className="text-white text-xs font-medium truncate">{page.title}</p>
                  </div>
                )}

                {/* Page number */}
                <div className={`absolute bottom-2 ${isLeft || isSinglePage ? 'left-3' : 'right-3'} text-[10px] text-gray-400`}>
                  {page.page_number}
                </div>
              </div>
            );
          })}

          {/* Book spine */}
          {!isSinglePage && currentPages.length === 2 && (
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 z-20 shadow-lg" />
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`flex items-center justify-between px-4 py-3 ${isFullscreen ? 'bg-gray-900' : 'bg-gradient-to-r from-[#1a0a12] to-[#2d0f1f] rounded-b-2xl'}`}>
        {/* Page indicator dots */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[60%] py-1">
          {spreads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isFlipping) {
                  setIsFlipping(true);
                  setFlipDirection(idx > currentSpread ? 'left' : 'right');
                  setTimeout(() => {
                    setCurrentSpread(idx);
                    setIsFlipping(false);
                    setFlipDirection(null);
                  }, 300);
                }
              }}
              className={`flex-shrink-0 rounded-full transition-all ${
                idx === currentSpread
                  ? 'w-6 h-2 bg-[#FB50B1]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span className="hidden sm:inline">Use arrow keys or swipe to navigate</span>
          <span className="sm:hidden">Swipe to flip</span>
        </div>
      </div>
    </div>
  );

  return viewerContent;
};

export default FlipBookViewer;
