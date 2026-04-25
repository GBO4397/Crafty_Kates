import React, { useState, useEffect, useRef } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Global cache for proxied blob URLs to avoid re-fetching
const blobCache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string>>();

// URLs that should be used as-is without proxying
function isDirectUrl(url: string): boolean {
  return (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/') ||
    url.includes('supabase.co/storage')
  );
}

export async function fetchProxiedImage(originalUrl: string): Promise<string> {
  if (isDirectUrl(originalUrl)) return originalUrl;

  // Check cache
  if (blobCache.has(originalUrl)) return blobCache.get(originalUrl)!;

  // Deduplicate in-flight requests
  if (pendingFetches.has(originalUrl)) return pendingFetches.get(originalUrl)!;

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/proxy-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ url: originalUrl }),
      });

      if (!response.ok) {
        console.warn(`Proxy failed for ${originalUrl}: ${response.status}`);
        return originalUrl;
      }

      const blob = await response.blob();
      if (blob.size === 0) return originalUrl;

      const blobUrl = URL.createObjectURL(blob);
      blobCache.set(originalUrl, blobUrl);
      return blobUrl;
    } catch (err) {
      console.warn(`Proxy error for ${originalUrl}:`, err);
      return originalUrl;
    } finally {
      pendingFetches.delete(originalUrl);
    }
  })();

  pendingFetches.set(originalUrl, fetchPromise);
  return fetchPromise;
}

// Hook to get a proxied image URL
export function useProxiedImage(originalUrl: string | undefined): { src: string; loading: boolean; error: boolean } {
  const [src, setSrc] = useState<string>(() => {
    if (!originalUrl) return '/placeholder.svg';
    if (blobCache.has(originalUrl)) return blobCache.get(originalUrl)!;
    if (isDirectUrl(originalUrl)) return originalUrl;
    return ''; // will load async
  });
  const [loading, setLoading] = useState(!src);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!originalUrl) {
      setSrc('/placeholder.svg');
      setLoading(false);
      return;
    }

    if (blobCache.has(originalUrl) || isDirectUrl(originalUrl)) {
      setSrc(blobCache.get(originalUrl) || originalUrl);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchProxiedImage(originalUrl).then((proxiedUrl) => {
      if (!cancelled) {
        setSrc(proxiedUrl);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setSrc(originalUrl);
        setLoading(false);
        setError(true);
      }
    });

    return () => { cancelled = true; };
  }, [originalUrl]);

  return { src, loading, error };
}

// Hook to proxy multiple images at once
export function useProxiedImages(originalUrls: string[]): { images: string[]; loading: boolean } {
  const [images, setImages] = useState<string[]>(() =>
    originalUrls.map(url => blobCache.get(url) || '')
  );
  const [loading, setLoading] = useState(true);
  const urlKey = originalUrls.join(',');

  useEffect(() => {
    let cancelled = false;

    Promise.all(originalUrls.map(url => fetchProxiedImage(url))).then((results) => {
      if (!cancelled) {
        setImages(results);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  return { images, loading };
}

interface ProxiedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  placeholderClassName?: string;
}

const ProxiedImage: React.FC<ProxiedImageProps> = ({
  src: originalSrc,
  fallbackSrc,
  alt = '',
  className = '',
  placeholderClassName = '',
  onLoad,
  onError,
  ...rest
}) => {
  const { src, loading } = useProxiedImage(originalSrc);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [originalSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgError(true);
    if (fallbackSrc && (e.target as HTMLImageElement).src !== fallbackSrc) {
      (e.target as HTMLImageElement).src = fallbackSrc;
    }
    onError?.(e);
  };

  if (loading) {
    return (
      <div className={`${placeholderClassName || className} bg-gray-200 animate-pulse`} {...rest as any} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );
};

export default ProxiedImage;
