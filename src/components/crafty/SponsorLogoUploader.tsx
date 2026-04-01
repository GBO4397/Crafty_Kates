import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Check, AlertCircle, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SponsorImageCropper from './SponsorImageCropper';

interface SponsorLogoUploaderProps {
  sponsorId: string;
  sponsorName: string;
  currentLogoUrl: string | null;
  onUploadComplete: (newLogoUrl: string) => void;
  onCancel: () => void;
  tier: 'gold' | 'silver' | 'bronze';
}

type UploadStatus = 'idle' | 'selected' | 'cropping' | 'uploading' | 'success' | 'error';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SponsorLogoUploader: React.FC<SponsorLogoUploaderProps> = ({
  sponsorId,
  sponsorName,
  currentLogoUrl,
  onUploadComplete,
  onCancel,
  tier,
}) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tierDimensions = {
    gold: { width: 400, height: 300 },
    silver: { width: 350, height: 250 },
    bronze: { width: 300, height: 200 },
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setStatus('error');
      return;
    }
    setSelectedFile(file);
    setErrorMessage('');

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setStatus('selected');
      };
      reader.readAsDataURL(file);
    } else {
      setStatus('cropping');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setPreviewUrl(croppedDataUrl);
    setStatus('selected');
  };

  const handleUpload = async () => {
    if (!previewUrl) return;
    setStatus('uploading');
    setUploadProgress(10);

    try {
      setUploadProgress(30);

      // Save the image data URL directly to the database
      // This avoids storage bucket auth issues and is simpler for logos
      const { data, error: updateError } = await supabase
        .from('sponsors')
        .update({
          logo_url: previewUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sponsorId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      setUploadProgress(100);
      setStatus('success');

      setTimeout(() => {
        onUploadComplete(previewUrl);
      }, 1000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Upload failed. Please try again.');
      setStatus('error');
    }
  };

  const resetUploader = () => {
    setStatus('idle');
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const dims = tierDimensions[tier];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget && status !== 'uploading') onCancel(); }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#FEE6F4]/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Upload Logo</h3>
              <p className="text-gray-500 text-xs">{sponsorName}</p>
            </div>
          </div>
          {status !== 'uploading' && (
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Cropper Modal */}
        {status === 'cropping' && selectedFile && (
          <SponsorImageCropper
            imageFile={selectedFile}
            onCropComplete={handleCropComplete}
            onCancel={resetUploader}
            targetWidth={dims.width}
            targetHeight={dims.height}
          />
        )}

        {/* Content */}
        <div className="px-6 py-5">
          {/* Current Logo Preview */}
          {currentLogoUrl && status === 'idle' && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Current Logo</p>
              <div className="relative w-full h-24 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                <img src={currentLogoUrl} alt="Current logo" className="max-w-full max-h-full object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            </div>
          )}

          {/* Idle / Drop Zone */}
          {status === 'idle' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group ${isDragOver ? 'border-[#FB50B1] bg-[#FEE6F4]/30 scale-[1.02]' : 'border-gray-200 hover:border-[#FB50B1]/50 hover:bg-[#FEE6F4]/10'}`}
            >
              <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleFileInputChange} className="hidden" />
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragOver ? 'bg-[#FB50B1] text-white scale-110' : 'bg-[#FEE6F4] text-[#9E065D] group-hover:bg-[#FB50B1] group-hover:text-white group-hover:scale-110'}`}>
                <Upload size={28} />
              </div>
              <p className="font-semibold text-gray-800 mb-1">{isDragOver ? 'Drop your logo here!' : 'Click or drag to upload'}</p>
              <p className="text-gray-400 text-sm mb-3">PNG, JPG, SVG, or WebP — Max 5MB</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <ImageIcon size={12} />
                <span>Output: {dims.width} x {dims.height}px</span>
              </div>
            </div>
          )}

          {/* Preview State */}
          {status === 'selected' && previewUrl && (
            <div className="space-y-4">
              <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-center p-4" style={{ minHeight: 160 }}>
                  <img src={previewUrl} alt="Logo preview" className="max-w-full max-h-48 object-contain rounded-lg" />
                </div>
                <div className="absolute top-2 right-2">
                  <button onClick={resetUploader} className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                <div className="flex items-center gap-2">
                  <span>{selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : ''}</span>
                  <span className="text-green-500 flex items-center gap-1"><Check size={10} /> Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* Uploading State */}
          {status === 'uploading' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#FB50B1" strokeWidth="4" strokeDasharray={`${uploadProgress * 1.76} 176`} strokeLinecap="round" className="transition-all duration-300" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#9E065D]">{uploadProgress}%</span>
                </div>
              </div>
              <p className="font-semibold text-gray-800">Saving logo...</p>
              <p className="text-gray-400 text-sm mt-1">Optimizing and saving to database</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <Check size={32} className="text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Logo saved!</p>
              <p className="text-gray-400 text-sm mt-1">The sponsor logo has been updated successfully.</p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Upload Failed</p>
              <p className="text-red-500 text-sm mb-4 max-w-xs mx-auto">{errorMessage}</p>
              <button onClick={resetUploader} className="text-sm text-[#9E065D] hover:text-[#FB50B1] font-medium underline transition-colors">
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        {(status === 'idle' || status === 'selected') && (
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            {status === 'selected' && (
              <button onClick={handleUpload} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#9E065D] to-[#7D0348] rounded-xl hover:from-[#FB50B1] hover:to-[#9E065D] transition-all shadow-lg shadow-[#9E065D]/20">
                <Upload size={16} /> Save Logo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorLogoUploader;
