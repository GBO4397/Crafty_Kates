import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Check, AlertCircle, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SponsorLogoUploaderProps {
  sponsorId: string;
  sponsorName: string;
  currentLogoUrl: string | null;
  onUploadComplete: (newLogoUrl: string) => void;
  onCancel: () => void;
  tier: 'gold' | 'silver' | 'bronze';
}

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const LOGO_WIDTH = 300;
const LOGO_HEIGHT = 200;

// Resize image to standard size using canvas
function resizeImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = LOGO_WIDTH;
      canvas.height = LOGO_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, LOGO_WIDTH, LOGO_HEIGHT);

      // Calculate scale to fit within bounds while maintaining aspect ratio
      const scale = Math.min(LOGO_WIDTH / img.width, LOGO_HEIGHT / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (LOGO_WIDTH - scaledWidth) / 2;
      const y = (LOGO_HEIGHT - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

const SponsorLogoUploader: React.FC<SponsorLogoUploaderProps> = ({
  sponsorId,
  sponsorName,
  currentLogoUrl,
  onUploadComplete,
  onCancel,
}) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.';
    if (file.size > MAX_FILE_SIZE) return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`;
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) { setErrorMessage(error); setStatus('error'); return; }
    setSelectedFile(file);
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setStatus('selected');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;
    setStatus('uploading');
    setUploadProgress(20);

    try {
      // Resize image to standard size
      setUploadProgress(40);
      const resizedUrl = await resizeImage(previewUrl);
      setUploadProgress(70);

      // Save to database
      const { error: updateError } = await supabase
        .from('sponsors')
        .update({ logo_url: resizedUrl, updated_at: new Date().toISOString() })
        .eq('id', sponsorId);

      if (updateError) throw new Error(`Database update failed: ${updateError.message}`);

      setUploadProgress(100);
      setStatus('success');
      setTimeout(() => { onUploadComplete(resizedUrl); }, 1000);
    } catch (err: any) {
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

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget && status !== 'uploading') onCancel(); }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Upload Logo</h3>
              <p className="text-gray-500 text-xs">{sponsorName} — Logo will be resized to {LOGO_WIDTH}x{LOGO_HEIGHT}px</p>
            </div>
          </div>
          {status !== 'uploading' && (
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {/* Current Logo */}
          {currentLogoUrl && status === 'idle' && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Current Logo</p>
              <div className="w-full h-24 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                <img src={currentLogoUrl} alt="Current logo" className="max-w-full max-h-full object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            </div>
          )}

          {/* Drop Zone */}
          {status === 'idle' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group ${isDragOver ? 'border-[#FB50B1] bg-[#FEE6F4]/30' : 'border-gray-200 hover:border-[#FB50B1]/50 hover:bg-[#FEE6F4]/10'}`}
            >
              <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleFileInputChange} className="hidden" />
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragOver ? 'bg-[#FB50B1] text-white' : 'bg-[#FEE6F4] text-[#9E065D] group-hover:bg-[#FB50B1] group-hover:text-white'}`}>
                <Upload size={28} />
              </div>
              <p className="font-semibold text-gray-800 mb-1">{isDragOver ? 'Drop your logo here!' : 'Click or drag to upload'}</p>
              <p className="text-gray-400 text-sm mb-3">PNG, JPG, SVG, or WebP — Max 5MB</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <ImageIcon size={12} />
                <span>Will be resized to {LOGO_WIDTH}x{LOGO_HEIGHT}px automatically</span>
              </div>
            </div>
          )}

          {/* Preview */}
          {status === 'selected' && previewUrl && (
            <div className="space-y-4">
              <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-center p-4" style={{ minHeight: 160 }}>
                  <img src={previewUrl} alt="Logo preview" className="max-w-full max-h-48 object-contain rounded-lg" />
                </div>
                <button onClick={resetUploader} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-lg shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                <span className="text-green-500 flex items-center gap-1"><Check size={10} /> Ready to save</span>
              </div>
            </div>
          )}

          {/* Uploading */}
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
              <p className="font-semibold text-gray-800">Resizing & saving logo...</p>
              <p className="text-gray-400 text-sm mt-1">Standardizing to {LOGO_WIDTH}x{LOGO_HEIGHT}px</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Logo saved!</p>
              <p className="text-gray-400 text-sm mt-1">Logo has been resized and saved successfully.</p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Upload Failed</p>
              <p className="text-red-500 text-sm mb-4 max-w-xs mx-auto">{errorMessage}</p>
              <button onClick={resetUploader} className="text-sm text-[#9E065D] hover:text-[#FB50B1] font-medium underline transition-colors">Try again</button>
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
              <button onClick={handleUpload} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#9E065D] to-[#7D0348] rounded-xl hover:from-[#FB50B1] hover:to-[#9E065D] transition-all shadow-lg">
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
