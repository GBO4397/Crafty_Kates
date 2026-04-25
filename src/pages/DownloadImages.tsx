import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FolderArchive, Image, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import AdminLoginGate, { checkAdminAuth, adminLogout } from '@/components/admin/AdminLoginGate';
import { FolderArchive as FolderArchiveIcon } from 'lucide-react';


// Supabase edge function URL for proxying image downloads (bypasses CORS)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const PROXY_URL = `${SUPABASE_URL}/functions/v1/proxy-image`;

// ─── All image URLs used across the site ───

const WP = 'https://craftykates.com/wp-content/uploads/2025/12';

const BEN_RADATZ_FILENAMES = [
  '2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-13.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-6.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-5.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-4.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-3.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-2.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-64.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-63.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-62.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-61.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-60.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-59.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-58.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-57.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-56.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-55.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-54.jpeg',
];

const WALLIN_FILENAMES = [
  'IMG_9804.jpeg',
  'IMG_9803.jpeg',
  'IMG_9802.jpeg',
  'IMG_9801.jpeg',
  'IMG_9800.jpeg',
  'IMG_9799.jpeg',
  'IMG_9798.jpeg',
  'IMG_9797.jpeg',
  'IMG_9796.jpeg',
  'IMG_9794.jpeg',
  'IMG_9793.jpeg',
  'IMG_9792.jpeg',
  'IMG_9791.jpeg',
  'IMG_9790.jpeg',
  'IMG_9789.jpeg',
  'IMG_9788.jpeg',
  'IMG_9787.jpeg',
  'IMG_9786.jpeg',
  'IMG_9785.jpeg',
  'IMG_9784.jpeg',
  'IMG_9783.jpeg',
  'IMG_9782.jpeg',
  'IMG_9781.jpeg',
];

interface ImageEntry {
  url: string;
  filename: string;
  folder: string;
  label: string;
}

// Build the complete image manifest
const buildImageManifest = (): ImageEntry[] => {
  const images: ImageEntry[] = [];

  // Site Logo & Branding
  images.push({
    url: `${WP}/KATES-LOGO-512x512-1-150x150.webp`,
    filename: 'KATES-LOGO-512x512-1-150x150.webp',
    folder: '01-branding',
    label: 'Site Logo / Favicon',
  });

  // Hero Section
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg',
    folder: '02-hero',
    label: 'Hero Background',
  });

  // About Section
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg',
    folder: '03-about',
    label: 'About Portrait',
  });

  // Events Section
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-13.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-13.jpeg',
    folder: '04-events',
    label: 'Events Car Show',
  });

  // Motto Section
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg',
    folder: '05-motto',
    label: 'Motto Background',
  });

  // Community Section
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-6.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-6.jpeg',
    folder: '06-community',
    label: 'Animal Shelter',
  });
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-5.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-5.jpeg',
    folder: '06-community',
    label: 'Almost Eden Rescue',
  });

  // Car Show Page
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg',
    folder: '07-car-show',
    label: 'Car Show Hero',
  });
  images.push({
    url: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-4.jpeg`,
    filename: '2024_03_Classic_Cars_Classic_Burgers-100-4.jpeg',
    folder: '07-car-show',
    label: 'Classic Cars',
  });
  images.push({
    url: `${WP}/IMG_9796.jpeg`,
    filename: 'IMG_9796.jpeg',
    folder: '07-car-show',
    label: 'Registration Hero',
  });

  // Posts Section
  images.push({
    url: `${WP}/Rodney5.jpg`,
    filename: 'Rodney5.jpg',
    folder: '08-posts',
    label: 'Rodney Potter Feature',
  });

  // Ben Radatz Gallery
  BEN_RADATZ_FILENAMES.forEach((fn) => {
    images.push({
      url: `${WP}/${fn}`,
      filename: fn,
      folder: '09-gallery-ben-radatz',
      label: fn.replace('.jpeg', ''),
    });
  });

  // K. Mikael Wallin Gallery
  WALLIN_FILENAMES.forEach((fn) => {
    images.push({
      url: `${WP}/${fn}`,
      filename: fn,
      folder: '10-gallery-wallin',
      label: fn.replace('.jpeg', ''),
    });
  });

  // External Sponsor Logos
  images.push({
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/State-farm-insurance-logo.svg/500px-State-farm-insurance-logo.svg.png',
    filename: 'state-farm-logo.png',
    folder: '11-sponsor-logos',
    label: 'State Farm Logo',
  });
  images.push({
    url: 'https://www.vikingbags.com/media/logo/stores/1/viking-bags-logo.png',
    filename: 'viking-bags-logo.png',
    folder: '11-sponsor-logos',
    label: 'Viking Bags Logo',
  });
  images.push({
    url: 'https://iskycams.com/wp-content/uploads/2020/07/isky-logo-2020.png',
    filename: 'isky-racing-cams-logo.png',
    folder: '11-sponsor-logos',
    label: 'Isky Racing Cams Logo',
  });

  return images;
};

const IMAGE_MANIFEST = buildImageManifest();

// Deduplicate by URL
const UNIQUE_IMAGES = IMAGE_MANIFEST.filter(
  (img, index, self) => index === self.findIndex((t) => t.url === img.url)
);

// Group by folder
const GROUPED = UNIQUE_IMAGES.reduce<Record<string, ImageEntry[]>>((acc, img) => {
  if (!acc[img.folder]) acc[img.folder] = [];
  acc[img.folder].push(img);
  return acc;
}, {});

const FOLDER_LABELS: Record<string, string> = {
  '01-branding': 'Branding & Logo',
  '02-hero': 'Hero Section',
  '03-about': 'About Section',
  '04-events': 'Events Section',
  '05-motto': 'Motto Section',
  '06-community': 'Community Section',
  '07-car-show': 'Car Show Page',
  '08-posts': 'Posts & Features',
  '09-gallery-ben-radatz': 'Gallery — Ben Radatz',
  '10-gallery-wallin': 'Gallery — K. Mikael Wallin',
  '11-sponsor-logos': 'Sponsor Logos (External)',
};

const DownloadImagesContent: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [results, setResults] = useState<{ success: number; failed: string[] } | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFolders(new Set(Object.keys(GROUPED)));
  };

  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  // Helper: fetch a single image via the server-side proxy (bypasses CORS)
  const fetchImageViaProxy = async (imageUrl: string): Promise<Blob> => {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy error ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    // If the proxy returned JSON (error), throw
    if (contentType.includes('application/json')) {
      const json = await response.json();
      throw new Error(json.error || 'Proxy returned JSON error');
    }

    return await response.blob();
  };

  // Helper: delay between requests to avoid rate limiting
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const downloadZip = useCallback(async () => {
    setDownloading(true);
    setResults(null);
    setProgress({ current: 0, total: UNIQUE_IMAGES.length, currentFile: 'Loading JSZip...' });

    try {
      // Dynamically load JSZip from CDN
      const JSZipModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      const failed: string[] = [];
      let success = 0;

      // Process images ONE AT A TIME with a delay to avoid rate limiting
      for (let i = 0; i < UNIQUE_IMAGES.length; i++) {
        const img = UNIQUE_IMAGES[i];

        setProgress({
          current: i + 1,
          total: UNIQUE_IMAGES.length,
          currentFile: img.filename,
        });

        // Try up to 2 times from the client side (proxy also retries 3x internally)
        let downloaded = false;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            if (attempt > 0) {
              // Wait longer before retry
              await delay(2000);
              setProgress({
                current: i + 1,
                total: UNIQUE_IMAGES.length,
                currentFile: `Retrying: ${img.filename}`,
              });
            }

            const blob = await fetchImageViaProxy(img.url);
            if (blob.size > 0) {
              zip.file(`${img.folder}/${img.filename}`, blob);
              success++;
              downloaded = true;
              break;
            }
          } catch (err) {
            console.warn(`Attempt ${attempt + 1} failed for ${img.filename}:`, err);
          }
        }

        if (!downloaded) {
          failed.push(img.filename);
          zip.file(
            `${img.folder}/${img.filename}.FAILED.txt`,
            `Could not download this image.\nOriginal URL: ${img.url}\n\nPlease download manually from the URL above.`
          );
        }

        // Add a small delay between each image to avoid rate limiting from WordPress
        if (i < UNIQUE_IMAGES.length - 1) {
          await delay(300);
        }
      }

      // Add a README
      const readmeContent = `CRAFTY KATES — SITE IMAGE ARCHIVE
====================================
Generated: ${new Date().toLocaleString()}

This ZIP contains all images used on the Crafty Kates website.
Images are organized into folders by section/usage.

FOLDER STRUCTURE:
${Object.entries(FOLDER_LABELS)
  .map(([folder, label]) => `  ${folder}/  — ${label} (${GROUPED[folder]?.length || 0} images)`)
  .join('\n')}

TOTAL IMAGES: ${UNIQUE_IMAGES.length}
SUCCESSFULLY DOWNLOADED: ${success}
${failed.length > 0 ? `FAILED (download manually): ${failed.length}\n${failed.map((f) => `  - ${f}`).join('\n')}` : ''}

IMPORTANT NOTES:
- WordPress images come from: ${WP}/
- Sponsor logos come from external sites (may need to be re-downloaded)
- Some images are used in multiple sections (only included once in the ZIP)
- If moving to a custom domain, update the image URLs in src/data/imageConfig.ts
- Database-uploaded images (sponsor logos, gallery, event flyers) are stored in 
  Supabase storage buckets and are NOT included in this ZIP.

IMAGE CONFIG FILE:
  The main image configuration is in: src/data/imageConfig.ts
  Update the WP base URL when moving to your custom domain.
`;
      zip.file('README.txt', readmeContent);

      // Also add a CSV manifest
      const csvContent = [
        'Folder,Filename,Label,URL',
        ...UNIQUE_IMAGES.map(
          (img) =>
            `"${img.folder}","${img.filename}","${img.label}","${img.url}"`
        ),
      ].join('\n');
      zip.file('image-manifest.csv', csvContent);

      setProgress({ current: UNIQUE_IMAGES.length, total: UNIQUE_IMAGES.length, currentFile: 'Creating ZIP file...' });

      const content = await zip.generateAsync({ type: 'blob' });

      // Trigger download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crafty-kates-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setResults({ success, failed });
    } catch (err) {
      console.error('ZIP creation failed:', err);
      setResults({ success: 0, failed: ['ZIP creation failed — see console for details'] });
    } finally {
      setDownloading(false);
    }
  }, []);

  // Retry only the failed images
  const retryFailed = useCallback(async () => {
    if (!results || results.failed.length === 0) return;
    
    setDownloading(true);
    const failedImages = UNIQUE_IMAGES.filter(img => results.failed.includes(img.filename));
    setProgress({ current: 0, total: failedImages.length, currentFile: 'Loading JSZip for retry...' });

    try {
      const JSZipModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      const stillFailed: string[] = [];
      let retrySuccess = 0;

      for (let i = 0; i < failedImages.length; i++) {
        const img = failedImages[i];
        setProgress({
          current: i + 1,
          total: failedImages.length,
          currentFile: img.filename,
        });

        let downloaded = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            if (attempt > 0) await delay(3000);
            const blob = await fetchImageViaProxy(img.url);
            if (blob.size > 0) {
              zip.file(`${img.folder}/${img.filename}`, blob);
              retrySuccess++;
              downloaded = true;
              break;
            }
          } catch (err) {
            console.warn(`Retry attempt ${attempt + 1} failed for ${img.filename}:`, err);
          }
        }

        if (!downloaded) {
          stillFailed.push(img.filename);
          zip.file(
            `${img.folder}/${img.filename}.FAILED.txt`,
            `Could not download this image.\nOriginal URL: ${img.url}\n\nPlease download manually from the URL above.`
          );
        }

        // Longer delay between retries
        if (i < failedImages.length - 1) await delay(1000);
      }

      if (retrySuccess > 0) {
        setProgress({ current: failedImages.length, total: failedImages.length, currentFile: 'Creating retry ZIP...' });
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crafty-kates-retry-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setResults({
        success: results.success + retrySuccess,
        failed: stillFailed,
      });
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [results]);




  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Site</span>
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FB50B1] to-[#9E065D] rounded-2xl flex items-center justify-center flex-shrink-0">
              <FolderArchive size={28} />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl tracking-wide">DOWNLOAD SITE IMAGES</h1>
              <p className="text-white/60 mt-1">
                Archive of all {UNIQUE_IMAGES.length} images used across the Crafty Kates website.
                Download as a ZIP for custom domain migration.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Download Action Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Download All Images as ZIP</h2>
              <p className="text-gray-500 text-sm mt-1">
                {UNIQUE_IMAGES.length} images across {Object.keys(GROUPED).length} folders — organized by section.
                Includes README and CSV manifest.
              </p>
            </div>
            <button
              onClick={downloadZip}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FB50B1]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download ZIP
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {downloading && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span className="truncate max-w-[60%]">{progress.currentFile}</span>
                <span>
                  {progress.current} / {progress.total} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9E065D] to-[#FB50B1] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className={`mt-6 p-4 rounded-xl ${results.failed.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-start gap-3">
                {results.failed.length === 0 ? (
                  <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${results.failed.length === 0 ? 'text-green-800' : 'text-amber-800'}`}>
                    {results.failed.length === 0
                      ? `All ${results.success} images downloaded successfully!`
                      : `${results.success} images downloaded, ${results.failed.length} failed`}
                  </p>
                  {results.failed.length > 0 && (
                    <div className="mt-2">
                      <p className="text-amber-700 text-sm mb-1">
                        Failed images have placeholder text files in the ZIP with their original URLs.
                      </p>
                      <ul className="text-amber-700 text-sm list-disc list-inside mb-3">
                        {results.failed.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                      <button
                        onClick={retryFailed}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {downloading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            Retry {results.failed.length} Failed Images
                          </>
                        )}
                      </button>
                      <p className="text-amber-600 text-xs mt-2">
                        Retry downloads one at a time with longer delays. If images still fail, they may not exist on the source server — use the "Open Original" links below to verify.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
              <Image size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{UNIQUE_IMAGES.length}</p>
            <p className="text-gray-500 text-sm">Total Images</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3">
              <FolderArchive size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{Object.keys(GROUPED).length}</p>
            <p className="text-gray-500 text-sm">Organized Folders</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center mb-3">
              <ExternalLink size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-gray-500 text-sm">External Sponsor Logos</p>
          </div>
        </div>

        {/* Note about database images */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Note about database-uploaded images</p>
              <p>
                This archive includes all <strong>hardcoded/configured</strong> images from the codebase. 
                Images uploaded through the admin panels (sponsor logos, gallery images, event flyers, coloring book pages) 
                are stored in Supabase storage buckets and are <strong>not</strong> included here — they will persist 
                when you switch to a custom domain since they're hosted on Supabase infrastructure.
              </p>
              <p className="mt-2">
                <strong>Storage buckets:</strong> sponsor-logos, site-images, event-flyers, coloring-books
              </p>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Image Inventory</h2>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-sm text-[#9E065D] hover:underline">
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={collapseAll} className="text-sm text-[#9E065D] hover:underline">
              Collapse All
            </button>
          </div>
        </div>

        {/* Image Folders */}
        <div className="space-y-3">
          {Object.entries(GROUPED)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([folder, images]) => {
              const isExpanded = expandedFolders.has(folder);
              return (
                <div key={folder} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D]/10 to-[#FB50B1]/10 text-[#9E065D] rounded-lg flex items-center justify-center">
                        <FolderArchive size={16} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">{FOLDER_LABELS[folder] || folder}</p>
                        <p className="text-gray-400 text-xs">{images.length} image{images.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {images.map((img) => (
                          <div
                            key={img.url}
                            className="group relative bg-gray-50 rounded-lg border border-gray-100 overflow-hidden hover:border-[#FB50B1]/30 hover:shadow-md transition-all"
                          >
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                              <img
                                src={img.url}
                                alt={img.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400';
                                    placeholder.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-medium text-gray-900 truncate" title={img.filename}>
                                {img.filename}
                              </p>
                              <p className="text-xs text-gray-400 truncate" title={img.label}>
                                {img.label}
                              </p>
                              <a
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-[#9E065D] hover:underline mt-1"
                              >
                                <ExternalLink size={10} />
                                Open Original
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Migration Guide */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Domain Migration Guide</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-[#9E065D] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <div>
                <p className="font-semibold text-gray-900">Download the ZIP</p>
                <p>Click "Download ZIP" above to get all site images organized by folder.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-[#9E065D] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <div>
                <p className="font-semibold text-gray-900">Upload to your new host</p>
                <p>Upload the images to your custom domain's hosting (e.g., <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">yourdomain.com/images/</code>).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-[#9E065D] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <div>
                <p className="font-semibold text-gray-900">Update the image config</p>
                <p>
                  Edit <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">src/data/imageConfig.ts</code> and change the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">WP</code> base URL from{' '}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs break-all">craftykates.com/wp-content/uploads/2025/12</code> to your new image path.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-[#9E065D] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
              <div>
                <p className="font-semibold text-gray-900">Update the favicon</p>
                <p>
                  Update the favicon URL in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">index.html</code> to point to your new logo location.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-[#9E065D] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
              <div>
                <p className="font-semibold text-gray-900">Database images are safe</p>
                <p>
                  Images uploaded via admin panels (sponsor logos, gallery, event flyers, coloring books) are stored in Supabase storage buckets 
                  and will continue to work regardless of your domain — no action needed for those.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Source File Reference */}
        <div className="mt-6 bg-gray-100 rounded-xl p-5 text-sm text-gray-500">
          <p className="font-semibold text-gray-700 mb-2">Source Files Reference</p>
          <ul className="space-y-1">
            <li><code className="text-xs">src/data/imageConfig.ts</code> — Central image URL configuration (WP base URL + all filenames)</li>
            <li><code className="text-xs">src/data/galleryData.ts</code> — Gallery image arrays for both photographers</li>
            <li><code className="text-xs">src/data/sponsorData.ts</code> — Sponsor directory with external logo URLs</li>
            <li><code className="text-xs">index.html</code> — Favicon and Open Graph image references</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ─── Wrapper with Admin Auth Gate ────────────────────────────────
const DownloadImages: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (embedded) {
      setIsAuthenticated(true);
      setCheckingAuth(false);
      return;
    }
    setIsAuthenticated(checkAdminAuth());
    setCheckingAuth(false);
  }, [embedded]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#1a0a12] flex items-center justify-center">
        <Loader2 size={32} className="text-[#FB50B1] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginGate
        title="Download Site Images"
        subtitle="Enter the admin password to access image downloads"
        icon={<FolderArchive size={28} className="text-white" />}
        backTo="/"
        backLabel="Back to Home"
        onAuthenticated={() => setIsAuthenticated(true)}
      />
    );
  }

  return <DownloadImagesContent />;
};

export default DownloadImages;
