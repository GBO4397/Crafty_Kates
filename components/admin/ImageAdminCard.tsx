import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, Image as ImageIcon, X, Check, AlertCircle,
  Camera, Loader2, ImageOff, Pencil, Trash2, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface SiteImageSlot {
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

interface ImageAdminCardProps {
  image: SiteImageSlot;
  onImageUpdated: (slotKey: string, newUrl: string) => void;
  onImageRemoved: (slotKey: string) => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const ImageAdminCard: React.FC<ImageAdminCardProps> = ({ image, onImageUpdated, onImageRemoved }) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImage = image.image_url && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [image.image_url]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`;
    }
    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setStatus('error');
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      
      // Start upload
      setStatus('uploading');
      setUploadProgress(10);

      try {
        setUploadProgress(30);

        // Try edge function first
        const { data, error: fnError } = await supabase.functions.invoke('upload-site-image', {
          body: {
            slotKey: image.slot_key,
            imageData: dataUrl,
            fileName: file.name,
            contentType: file.type,
            category: image.category,
            label: image.label,
            sortOrder: image.sort_order,
          },
        });

        setUploadProgress(70);

        if (fnError) {
          // Fallback: save data URL directly to DB
          console.warn('Edge function failed, saving directly to DB:', fnError);
          const { error: updateError } = await supabase
            .from('site_images')
            .update({
              image_url: dataUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', image.id);

          if (updateError) throw new Error(updateError.message);
          
          setUploadProgress(100);
          setStatus('success');
          onImageUpdated(image.slot_key, dataUrl);
        } else if (data?.success) {
          setUploadProgress(100);
          setStatus('success');
          onImageUpdated(image.slot_key, data.imageUrl);
        } else {
          throw new Error(data?.error || 'Upload failed');
        }

        // Reset after success
        setTimeout(() => {
          setStatus('idle');
          setPreviewUrl(null);
          setUploadProgress(0);
        }, 2000);
      } catch (err: any) {
        console.error('Upload error:', err);
        setErrorMessage(err.message || 'Upload failed. Please try again.');
        setStatus('error');
      }
    };
    reader.readAsDataURL(file);
  }, [image, onImageUpdated]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  }, [handleFileSelect]);

  const handleRemoveImage = async () => {
    try {
      const { error: updateError } = await supabase
        .from('site_images')
        .update({
          image_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', image.id);

      if (updateError) throw new Error(updateError.message);
      onImageRemoved(image.slot_key);
      setShowRemoveConfirm(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove image');
      setStatus('error');
    }
  };

  const resetUploader = () => {
    setStatus('idle');
    setPreviewUrl(null);
    setErrorMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Aspect ratio hints for different slots
  const getAspectHint = (slotKey: string): string => {
    const hints: Record<string, string> = {
      'logo': 'Square or wide logo',
      'hero-background': 'Wide landscape (16:9)',
      'hero-license-plate': 'License plate shape',
      'about-portrait': 'Portrait orientation',
      'events-car-show': 'Landscape (4:3)',
      'motto-background': 'Wide landscape (16:9)',
      'community-animal-shelter': 'Landscape (4:3)',
      'community-almost-eden': 'Landscape (4:3)',
      'car-show-hero-bg': 'Wide landscape (16:9)',
      'car-show-classic-cars': 'Landscape (4:3)',
      'car-show-registration-hero': 'Wide landscape (16:9)',
    };
    return hints[slotKey] || 'Any aspect ratio';
  };

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${hasImage ? 'border-emerald-200' : 'border-amber-200'}`}>
      {/* Status bar */}
      <div className={`h-1 ${hasImage ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />

      {/* Image Preview Area */}
      <div className="p-4">
        <div className="relative">
          {/* Image or Placeholder */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => status === 'idle' && fileInputRef.current?.click()}
            className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-all duration-300 group ${
              isDragOver
                ? 'border-[#FB50B1] bg-[#FEE6F4]/30 scale-[1.01]'
                : hasImage
                  ? 'border-gray-200 bg-gray-50 hover:border-[#FB50B1]/50'
                  : 'border-gray-300 bg-gray-100 hover:border-[#FB50B1]/50 hover:bg-[#FEE6F4]/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              className="hidden"
            />

            {/* Show current or preview image */}
            {(previewUrl || hasImage) && status !== 'error' ? (
              <img
                src={previewUrl || image.image_url!}
                alt={image.label}
                onError={() => { if (!previewUrl) setImgError(true); }}
                className="w-full h-full object-cover"
              />
            ) : status !== 'uploading' && status !== 'success' && status !== 'error' ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                <ImageOff size={32} />
                <span className="text-sm font-medium">No image uploaded</span>
                <span className="text-xs">{getAspectHint(image.slot_key)}</span>
              </div>
            ) : null}

            {/* Upload overlay on hover (idle state) */}
            {status === 'idle' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg">
                  {hasImage ? <Pencil size={20} className="text-[#9E065D]" /> : <Upload size={20} className="text-[#9E065D]" />}
                </div>
                <span className="text-white text-sm font-semibold drop-shadow-md">
                  {isDragOver ? 'Drop image here!' : hasImage ? 'Click to Replace' : 'Click to Upload'}
                </span>
                <span className="text-white/70 text-xs">PNG, JPG, SVG, WebP — Max 10MB</span>
              </div>
            )}

            {/* Uploading overlay */}
            {status === 'uploading' && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#FB50B1" strokeWidth="4" strokeDasharray={`${uploadProgress * 1.76} 176`} strokeLinecap="round" className="transition-all duration-300" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{uploadProgress}%</span>
                  </div>
                </div>
                <span className="text-white text-sm font-medium">Uploading...</span>
              </div>
            )}

            {/* Success overlay */}
            {status === 'success' && (
              <div className="absolute inset-0 bg-emerald-500/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <Check size={28} className="text-emerald-600" />
                </div>
                <span className="text-white text-sm font-semibold">Uploaded!</span>
              </div>
            )}

            {/* Error overlay */}
            {status === 'error' && (
              <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center gap-2 p-4">
                <AlertCircle size={28} className="text-red-500" />
                <span className="text-red-700 text-sm font-medium text-center">{errorMessage}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); resetUploader(); }}
                  className="text-sm text-[#9E065D] hover:text-[#FB50B1] font-medium underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="absolute top-2 right-2">
            {hasImage ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-sm">
                <ImageIcon size={10} /> Uploaded
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-sm">
                <ImageOff size={10} /> Missing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-0.5">{image.label}</h3>
        {image.description && (
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{image.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">{image.slot_key}</span>
          <div className="flex items-center gap-1">
            {hasImage && (
              <>
                {!showRemoveConfirm ? (
                  <button
                    onClick={() => setShowRemoveConfirm(true)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove image"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleRemoveImage}
                      className="px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => setShowRemoveConfirm(false)}
                      className="px-2 py-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
            {image.updated_at && image.image_url && (
              <span className="text-xs text-gray-400 ml-2">
                {new Date(image.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAdminCard;
