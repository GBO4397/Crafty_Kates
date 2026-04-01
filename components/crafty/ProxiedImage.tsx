import React, { useState, useEffect, useRef } from 'react';

const SUPABASE_URL = 'https://csdwcjbfexwtaqpmzzkj.databasepad.com';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhmNzFmNzlhLWZkMjAtNDYyNy1hMzVmLTExZTc5NjhlY2QwYSJ9.eyJwcm9qZWN0SWQiOiJjc2R3Y2piZmV4d3RhcXBtenpraiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxNTEwODE0LCJleHAiOjIwODY4NzA4MTQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.7PlmeZjxGTplqF0juXTQ_9vJcleqkcSL6_D3fGm0WIg';

// Global cache for proxied blob URLs to avoid re-fetching
const blobCache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string>>();

export async function fetchProxiedImage(originalUrl: string): Promise<string> {
  // If it's already a Supabase storage URL or data URL, return as-is
  if (
    originalUrl.startsWith('data:') ||
    originalUrl.startsWith('blob:') ||
    originalUrl.includes('databasepad.com/storage') ||
    originalUrl.startsWith('/placeholder')
  ) {
    return originalUrl;
  }

  // Check cache
  if (blobCache.has(originalUrl)) {
    return blobCache.get(originalUrl)!;
  }

  // Check if there's already a pending fetch for this URL
  if (pendingFetches.has(originalUrl)) {
    return pendingFetches.get(originalUrl)!;
  }

  // Create the fetch promise
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
        return originalUrl; // Fall back to original URL
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        return originalUrl;
      }

      const blobUrl = URL.createObjectURL(blob);
      blobCache.set(originalUrl, blobUrl);
      return blobUrl;
    } catch (err) {
      console.warn(`Proxy error for ${originalUrl}:`, err);
      return originalUrl; // Fall back to original URL
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
    if (
      originalUrl.startsWith('data:') ||
      originalUrl.startsWith('blob:') ||
      originalUrl.includes('databasepad.com/storage') ||
      originalUrl.startsWith('/placeholder')
    ) {
      return originalUrl;
    }
    return ''; // Will be loading
  });
  const [loading, setLoading] = useState(!src);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!originalUrl) {
      setSrc('/placeholder.svg');
      setLoading(false);
      return;
    }

    // Already cached or non-proxied URL
    if (
      blobCache.has(originalUrl) ||
      originalUrl.startsWith('data:') ||
      originalUrl.startsWith('blob:') ||
      originalUrl.includes('databasepad.com/storage') ||
      originalUrl.startsWith('/placeholder')
    ) {
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
        if (proxiedUrl === originalUrl && !originalUrl.includes('databasepad.com')) {
          // Proxy failed, using original - might still fail
        }
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

  useEffect(() => {
    let cancelled = false;

    Promise.all(originalUrls.map(url => fetchProxiedImage(url))).then((results) => {
      if (!cancelled) {
        setImages(results);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [originalUrls.join(',')]);

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
    // Try fallback
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
