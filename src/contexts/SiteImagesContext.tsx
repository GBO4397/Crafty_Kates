import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Default fallback images (used when DB has no image)
import {
  LOGO as DEFAULT_LOGO,
  HERO as DEFAULT_HERO,
  ABOUT as DEFAULT_ABOUT,
  EVENTS as DEFAULT_EVENTS,
  MOTTO as DEFAULT_MOTTO,
  COMMUNITY as DEFAULT_COMMUNITY,
  CAR_SHOW as DEFAULT_CAR_SHOW,
  GALLERY_PREVIEW as DEFAULT_GALLERY_PREVIEW,
  BEN_RADATZ_GALLERY as DEFAULT_BEN_RADATZ,
  WALLIN_GALLERY as DEFAULT_WALLIN,
} from '@/data/imageConfig';

export interface SiteImage {
  id: string;
  slot_key: string;
  category: string;
  label: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SiteImagesContextType {
  images: SiteImage[];
  imageMap: Record<string, string>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getImage: (slotKey: string, fallback?: string) => string;
  getGalleryImages: (category: string) => SiteImage[];
}

const SiteImagesContext = createContext<SiteImagesContextType | null>(null);

// Static fallback map
const FALLBACK_MAP: Record<string, string> = {
  'logo': DEFAULT_LOGO,
  'hero-background': DEFAULT_HERO.background,
  'hero-license-plate': DEFAULT_HERO.licensePlate,
  'hero-accent': DEFAULT_HERO.accentImage,
  'about-portrait': DEFAULT_ABOUT.portrait,
  'about-accent': DEFAULT_ABOUT.accentImage,
  'events-car-show': DEFAULT_EVENTS.carShow,
  'motto-background': DEFAULT_MOTTO.background,
  'community-animal-shelter': DEFAULT_COMMUNITY.animalShelter,
  'community-almost-eden': DEFAULT_COMMUNITY.almostEden,
  'car-show-hero-bg': DEFAULT_CAR_SHOW.heroBg,
  'car-show-classic-cars': DEFAULT_CAR_SHOW.classicCars,
  'car-show-registration-hero': DEFAULT_CAR_SHOW.registrationHero,
};

export const SiteImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('site_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      const imgs = data || [];
      setImages(imgs);

      // Build a map of slot_key -> image_url for quick lookups.
      // Only trust URLs from the correct Supabase project or relative paths —
      // stale entries pointing at old domains (databasepad.com, WP uploads, etc.)
      // are dropped so the static fallbacks in imageConfig.ts take over.
      const TRUSTED_SUPABASE = 'gufmfkkdqgjomuitbgtt.supabase.co';
      const isTrustedUrl = (url: string) =>
        url.startsWith('/') ||
        url.startsWith('blob:') ||
        url.includes(TRUSTED_SUPABASE);

      const map: Record<string, string> = {};
      imgs.forEach(img => {
        if (img.image_url && img.category === 'site' && isTrustedUrl(img.image_url)) {
          map[img.slot_key] = img.image_url;
        }
      });
      setImageMap(map);
    } catch (err: any) {
      console.error('Failed to load site images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const getImage = useCallback((slotKey: string, fallback?: string): string => {
    return imageMap[slotKey] || fallback || FALLBACK_MAP[slotKey] || '/placeholder.svg';
  }, [imageMap]);

  const getGalleryImages = useCallback((category: string): SiteImage[] => {
    return images
      .filter(img => img.category === category && img.image_url)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [images]);

  return (
    <SiteImagesContext.Provider value={{
      images,
      imageMap,
      loading,
      error,
      refetch: fetchImages,
      getImage,
      getGalleryImages,
    }}>
      {children}
    </SiteImagesContext.Provider>
  );
};

export const useSiteImages = (): SiteImagesContextType => {
  const context = useContext(SiteImagesContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      images: [],
      imageMap: {},
      loading: false,
      error: null,
      refetch: async () => {},
      getImage: (slotKey: string, fallback?: string) => fallback || FALLBACK_MAP[slotKey] || '/placeholder.svg',
      getGalleryImages: () => [],
    };
  }
  return context;
};

export default SiteImagesContext;
