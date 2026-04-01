import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move } from 'lucide-react';

interface SponsorImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  targetWidth?: number;
  targetHeight?: number;
}

const SponsorImageCropper: React.FC<SponsorImageCropperProps> = ({
  imageFile,
  onCropComplete,
  onCancel,
  targetWidth = 400,
  targetHeight = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasW = 400;
  const canvasH = 300;

  // Load image from file
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageEl(img);
        const scaleX = canvasW / img.width;
        const scaleY = canvasH / img.height;
        const initialZoom = Math.max(scaleX, scaleY);
        setZoom(initialZoom);
        setOffset({
          x: (canvasW - img.width * initialZoom) / 2,
          y: (canvasH - img.height * initialZoom) / 2,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Draw on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageEl) return;

    ctx.clearRect(0, 0, canvasW, canvasH);

    // Checkerboard background
    const checkSize = 10;
    for (let y = 0; y < canvasH; y += checkSize) {
      for (let x = 0; x < canvasW; x += checkSize) {
        ctx.fillStyle = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Draw image
    ctx.drawImage(imageEl, offset.x, offset.y, imageEl.width * zoom, imageEl.height * zoom);

    // Crop border
    ctx.strokeStyle = '#9E065D';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(1, 1, canvasW - 2, canvasH - 2);
    ctx.setLineDash([]);

    // Corner markers
    const cs = 16;
    ctx.strokeStyle = '#FB50B1';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, cs); ctx.lineTo(0, 0); ctx.lineTo(cs, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvasW - cs, 0); ctx.lineTo(canvasW, 0); ctx.lineTo(canvasW, cs); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, canvasH - cs); ctx.lineTo(0, canvasH); ctx.lineTo(cs, canvasH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvasW - cs, canvasH); ctx.lineTo(canvasW, canvasH); ctx.lineTo(canvasW, canvasH - cs); ctx.stroke();
  }, [imageEl, zoom, offset]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleReset = () => {
    if (!imageEl) return;
    const scaleX = canvasW / imageEl.width;
    const scaleY = canvasH / imageEl.height;
    const z = Math.max(scaleX, scaleY);
    setZoom(z);
    setOffset({ x: (canvasW - imageEl.width * z) / 2, y: (canvasH - imageEl.height * z) / 2 });
  };

  const handleCropConfirm = () => {
    const out = document.createElement('canvas');
    out.width = targetWidth;
    out.height = targetHeight;
    const ctx = out.getContext('2d');
    if (!ctx || !imageEl) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const sx = targetWidth / canvasW;
    const sy = targetHeight / canvasH;
    ctx.drawImage(imageEl, offset.x * sx, offset.y * sy, imageEl.width * zoom * sx, imageEl.height * zoom * sy);

    onCropComplete(out.toDataURL('image/webp', 0.85));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Crop & Resize Logo</h3>
            <p className="text-gray-500 text-xs mt-0.5">Drag to reposition — output: {targetWidth}x{targetHeight}px</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Canvas */}
        <div className="px-6 pt-4">
          <div className="relative bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 mx-auto" style={{ width: canvasW, height: canvasH, maxWidth: '100%' }}>
            <canvas
              ref={canvasRef}
              width={canvasW}
              height={canvasH}
              className="cursor-move w-full h-full"
              style={{ maxWidth: '100%', height: 'auto' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDragging(false)}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
              <Move size={10} /> Drag to reposition
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setZoom(p => Math.max(p / 1.2, 0.1))} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <ZoomOut size={16} />
            </button>
            <div className="flex items-center gap-2 min-w-[140px]">
              <input type="range" min="10" max="500" value={Math.round(zoom * 100)} onChange={(e) => setZoom(parseInt(e.target.value) / 100)} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9E065D]" />
              <span className="text-xs text-gray-500 font-mono w-10 text-right">{Math.round(zoom * 100)}%</span>
            </div>
            <button onClick={() => setZoom(p => Math.min(p * 1.2, 5))} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <ZoomIn size={16} />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button onClick={handleReset} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="px-6 pb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            <span className="truncate max-w-[200px]">{imageFile.name}</span>
            <span>{(imageFile.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleCropConfirm} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#9E065D] to-[#7D0348] rounded-xl hover:from-[#FB50B1] hover:to-[#9E065D] transition-all shadow-lg shadow-[#9E065D]/20">
            <Check size={16} /> Apply & Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorImageCropper;
