import React, { useState, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import {
  X, Calendar, MapPin, Clock, User, Mail, Phone,
  Globe, Ticket, DollarSign, FileText, Send, Loader2,
  CheckCircle, AlertCircle, Image as ImageIcon, Tag,
  Upload, Trash2, Info, Link as LinkIcon
} from 'lucide-react';

interface EventSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  event_date: string;
  event_time_start: string;
  event_time_end: string;
  location: string;
  address: string;
  category: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  image_url: string;
  website_url: string;
  ticket_url: string;
  is_free: boolean;
  ticket_price: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  description: '',
  event_date: '',
  event_time_start: '',
  event_time_end: '',
  location: '',
  address: '',
  category: 'community',
  organizer_name: '',
  organizer_email: '',
  organizer_phone: '',
  image_url: '',
  website_url: '',
  ticket_url: '',
  is_free: true,
  ticket_price: '',
};

const CATEGORIES = [
  { value: 'car-show', label: 'Car Show' },
  { value: 'community', label: 'Community Event' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'festival', label: 'Festival / Fair' },
  { value: 'meetup', label: 'Meetup / Cruise' },
  { value: 'swap-meet', label: 'Swap Meet' },
  { value: 'other', label: 'Other' },
];

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_EXTENSIONS = '.jpg, .jpeg, .png, .webp';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUGGESTED_WIDTH = 1200;
const SUGGESTED_HEIGHT = 630;

const EventSubmitModal: React.FC<EventSubmitModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Image upload state
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;



  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.title.trim()) return 'Event title is required';
    if (!form.event_date) return 'Event date is required';
    if (!form.location.trim()) return 'Location name is required';
    return '';
  };

  const validateStep2 = () => {
    if (!form.organizer_name.trim()) return 'Your name is required';
    if (!form.organizer_email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.organizer_email)) return 'Please enter a valid email';
    return '';
  };

  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setStep(3);
    }
    setError('');
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    setError('');
  };

  // ─── Image Upload Logic ───────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return `Invalid file type "${file.type.split('/')[1] || 'unknown'}". Accepted formats: JPG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File is too large (${sizeMB}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploadError('');
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress('Reading file...');

    try {
      const base64Data = await readFileAsBase64(file);
      setUploadProgress('Uploading flyer...');

      const { data, error: fnError } = await supabase.functions.invoke('upload-event-flyer', {
        body: {
          imageData: base64Data,
          fileName: file.name.replace(/\.[^/.]+$/, ''),
          contentType: file.type,
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Upload failed');

      const imageUrl = data.imageUrl;
      updateField('image_url', imageUrl);
      setPreviewUrl(base64Data); // Use local base64 for instant preview
      setUploadedFileName(file.name);
      setUploadProgress('');
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };


  const removeUploadedImage = () => {
    updateField('image_url', '');
    setPreviewUrl('');
    setUploadedFileName('');
    setUploadError('');
  };

  // ─── Submit Logic ─────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('community_events').insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        event_date: form.event_date,
        event_time_start: form.event_time_start || null,
        event_time_end: form.event_time_end || null,
        location: form.location.trim(),
        address: form.address.trim() || null,
        category: form.category,
        organizer_name: form.organizer_name.trim(),
        organizer_email: form.organizer_email.trim(),
        organizer_phone: form.organizer_phone.trim() || null,
        image_url: form.image_url.trim() || null,
        website_url: form.website_url.trim() || null,
        ticket_url: form.ticket_url.trim() || null,
        is_free: form.is_free,
        ticket_price: form.is_free ? null : form.ticket_price.trim() || null,
        status: 'pending',
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submit event error:', err);
      setError(err.message || 'Failed to submit event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setStep(1);
    setSubmitted(false);
    setError('');
    setImageMode('upload');
    setUploading(false);
    setUploadError('');
    setUploadProgress('');
    setPreviewUrl('');
    setUploadedFileName('');
    setIsDragging(false);
    onClose();
  };

  // ─── Success Screen ───────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Event Submitted!</h3>
          <p className="text-gray-600 mb-2">
            Thank you for submitting <strong className="text-[#9E065D]">{form.title}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will review your event and notify you at <strong>{form.organizer_email}</strong> once it's approved. This usually takes 1–2 business days.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white font-medium rounded-xl transition-all duration-300 shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── Styles ───────────────────────────────────────────────────────

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Submit Your Event</h3>
              <p className="text-xs text-gray-500">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-[#9E065D] to-[#FB50B1]' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs font-medium ${step >= 1 ? 'text-[#9E065D]' : 'text-gray-400'}`}>Event Details</span>
            <span className={`text-xs font-medium ${step >= 2 ? 'text-[#9E065D]' : 'text-gray-400'}`}>Contact & Flyer</span>
            <span className={`text-xs font-medium ${step >= 3 ? 'text-[#9E065D]' : 'text-gray-400'}`}>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {/* ───── Step 1: Event Details ───── */}
          {step === 1 && (
            <>
              <div>
                <label className={labelCls}>Event Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Spring Classic Car Cruise" className={inputCls} autoFocus />
              </div>

              <div>
                <label className={labelCls}>Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateField('category', cat.value)}
                      className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                        form.category === cat.value
                          ? 'border-[#9E065D] bg-[#FEE6F4]/50 text-[#9E065D]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Tell us about your event..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Event Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="date" value={form.event_date} onChange={e => updateField('event_date', e.target.value)} className={`${inputCls} pl-9`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Start</label>
                    <input type="time" value={form.event_time_start} onChange={e => updateField('event_time_start', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End</label>
                    <input type="time" value={form.event_time_end} onChange={e => updateField('event_time_end', e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Location Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.location} onChange={e => updateField('location', e.target.value)} placeholder="e.g. Classic Burgers" className={`${inputCls} pl-9`} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Full Address</label>
                <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="e.g. 6525 W. Inyokern Rd, Inyokern, CA 93527" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Admission</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('is_free', true)}
                      className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        form.is_free ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('is_free', false)}
                      className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        !form.is_free ? 'border-[#9E065D] bg-[#FEE6F4]/50 text-[#9E065D]' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      Paid
                    </button>
                  </div>
                </div>
                {!form.is_free && (
                  <div>
                    <label className={labelCls}>Price</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={form.ticket_price} onChange={e => updateField('ticket_price', e.target.value)} placeholder="e.g. $20" className={`${inputCls} pl-9`} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ───── Step 2: Contact Info & Flyer Upload ───── */}
          {step === 2 && (
            <>
              <div className="bg-[#FEE6F4]/30 border border-[#FEE6F4] rounded-xl p-4 mb-2">
                <p className="text-sm text-[#9E065D]">
                  <strong>Your contact info</strong> is used for review purposes only and won't be displayed publicly unless you choose to include it.
                </p>
              </div>

              <div>
                <label className={labelCls}>Your Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.organizer_name} onChange={e => updateField('organizer_name', e.target.value)} placeholder="Full name" className={`${inputCls} pl-9`} autoFocus />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={form.organizer_email} onChange={e => updateField('organizer_email', e.target.value)} placeholder="you@example.com" className={`${inputCls} pl-9`} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.organizer_phone} onChange={e => updateField('organizer_phone', e.target.value)} placeholder="(760) 555-1234" className={`${inputCls} pl-9`} />
                </div>
              </div>

              {/* ─── Event Flyer / Image Upload Section ─── */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <ImageIcon size={14} className="text-[#9E065D]" />
                    Event Flyer / Image
                    <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </h4>
                  {/* Toggle between upload and URL */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                        imageMode === 'upload'
                          ? 'bg-white text-[#9E065D] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Upload size={12} />
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                        imageMode === 'url'
                          ? 'bg-white text-[#9E065D] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <LinkIcon size={12} />
                      Paste URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <>
                    {/* Show preview if uploaded */}
                    {previewUrl && form.image_url ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-[#9E065D]/20 bg-gray-50">
                        <img
                          src={previewUrl}
                          alt="Event flyer preview"
                          className="w-full max-h-48 object-contain bg-white"
                        />
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700 font-medium truncate">{uploadedFileName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeUploadedImage}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & drop upload area */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                          isDragging
                            ? 'border-[#9E065D] bg-[#FEE6F4]/30 scale-[1.01]'
                            : uploading
                            ? 'border-gray-300 bg-gray-50 cursor-wait'
                            : 'border-gray-300 bg-gray-50/50 hover:border-[#9E065D]/50 hover:bg-[#FEE6F4]/10'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED_EXTENSIONS}
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {uploading ? (
                          <div className="flex flex-col items-center gap-3 py-2">
                            <div className="w-12 h-12 bg-[#FEE6F4] rounded-full flex items-center justify-center">
                              <Loader2 size={22} className="text-[#9E065D] animate-spin" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{uploadProgress || 'Uploading...'}</p>
                              <p className="text-xs text-gray-400 mt-1">Please wait</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 py-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                              isDragging ? 'bg-[#9E065D] text-white' : 'bg-[#FEE6F4] text-[#9E065D]'
                            }`}>
                              <Upload size={22} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {isDragging ? 'Drop your file here' : 'Drag & drop your event flyer here'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                or <span className="text-[#9E065D] font-medium underline underline-offset-2">browse files</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload error */}
                    {uploadError && (
                      <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl mt-2">
                        <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-xs">{uploadError}</p>
                      </div>
                    )}

                    {/* File requirements info box */}
                    <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-xl p-3.5">
                      <div className="flex items-start gap-2">
                        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-blue-800">Image Upload Guidelines</p>
                          <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                              <p className="text-xs text-blue-700">
                                <strong>Accepted formats:</strong> JPG, PNG, or WebP
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                              <p className="text-xs text-blue-700">
                                <strong>Max file size:</strong> {MAX_FILE_SIZE_MB}MB
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                              <p className="text-xs text-blue-700">
                                <strong>Suggested size:</strong> {SUGGESTED_WIDTH} x {SUGGESTED_HEIGHT}px (landscape)
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                              <p className="text-xs text-blue-700">
                                <strong>For print flyers:</strong> 2550 x 3300px (8.5" x 11" at 300dpi)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* URL paste mode */
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={e => {
                          updateField('image_url', e.target.value);
                          setPreviewUrl(e.target.value);
                          setUploadedFileName('');
                        }}
                        placeholder="https://... (paste a link to your event flyer or image)"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                    {form.image_url && imageMode === 'url' && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src={form.image_url}
                          alt="Event flyer preview"
                          className="w-full max-h-40 object-contain bg-white"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Paste a direct link to your event flyer image (JPG, PNG, or WebP recommended).
                    </p>
                  </div>
                )}
              </div>

              {/* ─── Event Links ─── */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Globe size={14} className="text-[#9E065D]" />
                  Event Links <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Event Website / Facebook Page</label>
                    <input type="url" value={form.website_url} onChange={e => updateField('website_url', e.target.value)} placeholder="https://..." className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Ticket / Registration Link</label>
                    <input type="url" value={form.ticket_url} onChange={e => updateField('ticket_url', e.target.value)} placeholder="https://..." className={inputCls} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ───── Step 3: Review ───── */}
          {step === 3 && (
            <>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-gray-900 text-lg">{form.title}</h4>
                
                {form.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{form.description}</p>
                )}

                {/* Flyer preview in review */}
                {form.image_url && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <img
                      src={previewUrl || form.image_url}
                      alt="Event flyer"
                      className="w-full max-h-44 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                      <ImageIcon size={12} className="text-[#9E065D]" />
                      <span className="text-xs text-gray-600 font-medium">
                        {uploadedFileName || 'Event flyer attached'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                    <Calendar size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
                      <p className="text-sm text-gray-900">{new Date(form.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  {(form.event_time_start || form.event_time_end) && (
                    <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                      <Clock size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Time</p>
                        <p className="text-sm text-gray-900">
                          {form.event_time_start && formatTime(form.event_time_start)}
                          {form.event_time_start && form.event_time_end && ' – '}
                          {form.event_time_end && formatTime(form.event_time_end)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                    <MapPin size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Location</p>
                      <p className="text-sm text-gray-900">{form.location}</p>
                      {form.address && <p className="text-xs text-gray-500">{form.address}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                    <Tag size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Category</p>
                      <p className="text-sm text-gray-900">{CATEGORIES.find(c => c.value === form.category)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                    <Ticket size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Admission</p>
                      <p className="text-sm text-gray-900">{form.is_free ? 'Free' : form.ticket_price || 'Paid'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                    <User size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Submitted By</p>
                      <p className="text-sm text-gray-900">{form.organizer_name}</p>
                      <p className="text-xs text-gray-500">{form.organizer_email}</p>
                    </div>
                  </div>
                </div>

                {(form.website_url || form.ticket_url) && (
                  <div className="border-t border-gray-200 pt-3 space-y-1">
                    {form.website_url && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><Globe size={12} className="text-[#9E065D]" /> {form.website_url}</p>
                    )}
                    {form.ticket_url && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><Ticket size={12} className="text-[#9E065D]" /> {form.ticket_url}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>What happens next?</strong> Your event will be reviewed by our team. Once approved, it will appear in the Upcoming Events section on our website. You'll receive an email confirmation.
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div>
            {step > 1 && (
              <button onClick={handleBack} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleClose} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#9E065D]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#9E065D]/20 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? 'Submitting...' : 'Submit Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default EventSubmitModal;
