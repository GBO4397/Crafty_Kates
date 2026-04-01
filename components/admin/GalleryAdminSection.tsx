import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Image as ImageIcon, X, Check, AlertCircle,
  Plus, Trash2, Loader2, ImageOff, GripVertical, Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SiteImageSlot } from './ImageAdminCard';

interface GalleryAdminSectionProps {
  title: string;
  category: string;
  images: SiteImageSlot[];
  onImagesUpdated: () => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const GalleryAdminSection: React.FC<GalleryAdminSectionProps> = ({
  title, category, images, onImagesUpdated
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const galleryImages = images
    .filter(img => img.category === category && img.image_url)
    .sort((a, b) => a.sort_order - b.sort_order);

  const handleFilesSelect = useCallback(async (files: FileList) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setError('No valid image files selected. Use PNG, JPG, or WebP under 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });
    setError(null);

    const maxOrder = galleryImages.reduce((max, img) => Math.max(max, img.sort_order), 0);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress({ current: i + 1, total: validFiles.length });

      try {
        // Read file as data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        const sortOrder = maxOrder + i + 1;
        const slotKey = `${category}-photo-${String(sortOrder).padStart(3, '0')}`;

        // Try edge function
        const { data, error: fnError } = await supabase.functions.invoke('upload-site-image', {
          body: {
            slotKey,
            imageData: dataUrl,
            fileName: file.name,
            contentType: file.type,
            category,
            label: `${title} Photo ${sortOrder}`,
            sortOrder,
          },
        });

        if (fnError || !data?.success) {
          // Fallback: insert directly to DB
          const { error: insertError } = await supabase
            .from('site_images')
            .insert({
              slot_key: slotKey,
              category,
              label: `${title} Photo ${sortOrder}`,
              image_url: dataUrl,
              sort_order: sortOrder,
              is_active: true,
            });

          if (insertError) {
            console.error('Insert error:', insertError);
          }
        }
      } catch (err: any) {
        console.error(`Failed to upload ${file.name}:`, err);
      }
    }

    setUploading(false);
    onImagesUpdated();
  }, [category, title, galleryImages, onImagesUpdated]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  }, [handleFilesSelect]);

  const handleDeleteImage = async (imageId: string) => {
    setDeletingId(imageId);
    try {
      const { error: deleteError } = await supabase
        .from('site_images')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw new Error(deleteError.message);
      onImagesUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Are you sure you want to delete all ${galleryImages.length} photos from ${title}? This cannot be undone.`)) return;
    
    setUploading(true);
    try {
      const ids = galleryImages.map(img => img.id);
      for (const id of ids) {
        await supabase.from('site_images').delete().eq('id', id);
      }
      onImagesUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
            <Camera size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">
              {galleryImages.length} photo{galleryImages.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {galleryImages.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={12} /> Delete All
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#9E065D] hover:bg-[#7D0348] rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Plus size={14} /> Add Photos
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        multiple
        onChange={(e) => { if (e.target.files) handleFilesSelect(e.target.files); }}
        className="hidden"
      />

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-4 bg-[#FEE6F4]/30 border border-[#FB50B1]/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={16} className="text-[#9E065D] animate-spin" />
              <span className="text-sm font-medium text-[#9E065D]">
                Uploading {uploadProgress.current} of {uploadProgress.total} photos...
              </span>
            </div>
            <div className="w-full bg-[#FEE6F4] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#9E065D] to-[#FB50B1] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {galleryImages.map((img, index) => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={img.image_url!}
                  alt={img.label}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={deletingId === img.id}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg"
                  >
                    {deletingId === img.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
                {/* Number badge */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-mono rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? 'border-[#FB50B1] bg-[#FEE6F4]/30 scale-[1.01]'
              : 'border-gray-200 hover:border-[#FB50B1]/50 hover:bg-[#FEE6F4]/10'
          }`}
        >
          <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all ${
            isDragOver ? 'bg-[#FB50B1] text-white scale-110' : 'bg-[#FEE6F4] text-[#9E065D]'
          }`}>
            <Upload size={24} />
          </div>
          <p className="font-semibold text-gray-800 mb-1">
            {isDragOver ? 'Drop photos here!' : 'Drag & drop photos here'}
          </p>
          <p className="text-gray-400 text-sm mb-1">or click to browse files</p>
          <p className="text-gray-400 text-xs">PNG, JPG, or WebP — Max 10MB each — Select multiple files</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryAdminSection;
