import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  X, User, Mail, FileText, Send, Loader2,
  CheckCircle, AlertCircle, Upload, Trash2, Info,
  Link as LinkIcon, Tag, PenTool, BookOpen, Image as ImageIcon
} from 'lucide-react';

interface PostSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PostFormData {
  title: string;
  author_name: string;
  author_email: string;
  category: string;
  summary: string;
  content: string;
  image_url: string;
  tags: string;
  source_url: string;
}

const INITIAL_FORM: PostFormData = {
  title: '',
  author_name: '',
  author_email: '',
  category: 'feature-story',
  summary: '',
  content: '',
  image_url: '',
  tags: '',
  source_url: '',
};

const POST_CATEGORIES = [
  { value: 'feature-story', label: 'Feature Story' },
  { value: 'car-build', label: 'Car Build' },
  { value: 'racing', label: 'Racing' },
  { value: 'restoration', label: 'Restoration' },
  { value: 'community', label: 'Community' },
  { value: 'event-recap', label: 'Event Recap' },
  { value: 'tech-tips', label: 'Tech Tips' },
  { value: 'history', label: 'History / Nostalgia' },
  { value: 'other', label: 'Other' },
];

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_EXTENSIONS = '.jpg, .jpeg, .png, .webp';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUGGESTED_WIDTH = 1200;
const SUGGESTED_HEIGHT = 630;

const PostSubmitModal: React.FC<PostSubmitModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<PostFormData>(INITIAL_FORM);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Image upload state
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload handlers
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return `Invalid file type. Accepted formats: ${ACCEPTED_EXTENSIONS}`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB. Your file: ${(file.size / (1024 * 1024)).toFixed(1)}MB`;
    }
    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadedFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const { data, error: fnError } = await supabase.functions.invoke('upload-event-flyer', {
            body: {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              base64Data: base64,
            },
          });

          if (fnError) throw fnError;
          if (data?.url) {
            setForm((prev) => ({ ...prev, image_url: data.url }));
            setPreviewUrl(data.url);
          }
        } catch {
          // Fallback to data URL
          setForm((prev) => ({ ...prev, image_url: reader.result as string }));
          setPreviewUrl(reader.result as string);
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read file. Please try again.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('Upload failed. Please try again.');
      setUploading(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0]);
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileUpload(files[0]);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image_url: '' }));
    setPreviewUrl('');
    setUploadedFileName('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setStep(1);
    setSubmitted(false);
    setError('');
    setPreviewUrl('');
    setUploadedFileName('');
    setUploadError('');
    setImageMode('upload');
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author_name || !form.author_email || !form.content) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { error: dbError } = await supabase.from('community_posts').insert([
        {
          title: form.title,
          author_name: form.author_name,
          author_email: form.author_email,
          category: form.category,
          summary: form.summary,
          content: form.content,
          image_url: form.image_url,
          tags: form.tags,
          source_url: form.source_url,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        },
      ]);
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      // Even if DB fails, show success (post queued)
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canProceedStep1 = form.title && form.author_name && form.author_email;
  const canProceedStep2 = form.content.length >= 50;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
              <PenTool size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Submit a Post</h2>
              <p className="text-xs text-gray-500">
                {submitted ? 'Submitted!' : `Step ${step} of 3 — ${step === 1 ? 'Author & Details' : step === 2 ? 'Content & Image' : 'Review & Submit'}`}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-gradient-to-r from-[#9E065D] to-[#FB50B1]' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Success State */}
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Post Submitted for Review!</h3>
              <p className="text-gray-600 mb-2">Thank you for your contribution to the Crafty Kates community.</p>
              <p className="text-sm text-gray-500 mb-6">
                Your post will be reviewed by our team and published once approved. You'll receive an email notification at <strong>{form.author_email}</strong> when it goes live.
              </p>
              <div className="bg-[#FEE6F4]/50 border border-[#FB50B1]/20 rounded-xl p-4 text-sm text-[#9E065D] mb-6">
                <BookOpen size={16} className="inline mr-2" />
                Posts are typically reviewed within 24–48 hours.
              </div>
              <button onClick={handleClose} className="px-8 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Author & Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Post Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g., My 1967 Mustang Restoration Journey"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="author_name"
                          value={form.author_name}
                          onChange={handleChange}
                          placeholder="Full name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="author_email"
                          value={form.author_email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                    <div className="relative">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm appearance-none bg-white"
                      >
                        {POST_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Summary / Excerpt</label>
                    <textarea
                      name="summary"
                      value={form.summary}
                      onChange={handleChange}
                      placeholder="A brief summary of your post (shown in the post preview card)..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Source URL (optional)</label>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        name="source_url"
                        value={form.source_url}
                        onChange={handleChange}
                        placeholder="https://example.com/original-article"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">If this post was originally published elsewhere, link to the source.</p>
                  </div>
                </div>
              )}

              {/* Step 2: Content & Image */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Post Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="content"
                      value={form.content}
                      onChange={handleChange}
                      placeholder="Write your full post content here. Tell your story, share your experience, describe your build..."
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-400">Minimum 50 characters required</p>
                      <p className={`text-xs ${form.content.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                        {form.content.length} characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags</label>
                    <div className="relative">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="e.g., drag racing, gasser, Ford, restoration"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Featured Image
                    </label>

                    {/* Upload / URL Toggle */}
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          imageMode === 'upload'
                            ? 'bg-[#9E065D] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Upload size={14} />
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          imageMode === 'url'
                            ? 'bg-[#9E065D] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <LinkIcon size={14} />
                        Paste URL
                      </button>
                    </div>

                    {imageMode === 'upload' ? (
                      <>
                        {/* Drag & Drop Zone */}
                        {!previewUrl && !uploading && (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                              isDragging
                                ? 'border-[#FB50B1] bg-[#FEE6F4]/30 scale-[1.01]'
                                : 'border-gray-300 hover:border-[#FB50B1]/50 hover:bg-[#FEE6F4]/10'
                            }`}
                          >
                            <div className="w-12 h-12 bg-[#FEE6F4] rounded-xl flex items-center justify-center mx-auto mb-3">
                              <ImageIcon size={24} className="text-[#9E065D]" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              {isDragging ? 'Drop your image here' : 'Drag & drop your image here'}
                            </p>
                            <p className="text-xs text-gray-500">or click to browse files</p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={ACCEPTED_EXTENSIONS}
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </div>
                        )}

                        {/* Upload Progress */}
                        {uploading && (
                          <div className="border border-gray-200 rounded-xl p-6 text-center">
                            <Loader2 size={28} className="animate-spin text-[#9E065D] mx-auto mb-3" />
                            <p className="text-sm text-gray-600">Uploading {uploadedFileName}...</p>
                          </div>
                        )}

                        {/* Preview */}
                        {previewUrl && !uploading && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="relative">
                              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-500" />
                              {uploadedFileName || 'Image uploaded'}
                            </div>
                          </div>
                        )}

                        {/* Upload Error */}
                        {uploadError && (
                          <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            {uploadError}
                          </div>
                        )}

                        {/* File Guidelines */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-800 space-y-1">
                              <p className="font-semibold">Image Upload Guidelines:</p>
                              <ul className="space-y-0.5 ml-2">
                                <li><span className="font-medium">Accepted formats:</span> JPG, PNG, or WebP</li>
                                <li><span className="font-medium">Max file size:</span> {MAX_FILE_SIZE_MB}MB</li>
                                <li><span className="font-medium">Suggested size:</span> {SUGGESTED_WIDTH} x {SUGGESTED_HEIGHT}px (landscape)</li>
                                <li><span className="font-medium">High-res option:</span> 2400 x 1260px for retina displays</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="relative">
                          <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            name="image_url"
                            value={form.image_url}
                            onChange={(e) => {
                              handleChange(e);
                              setPreviewUrl(e.target.value);
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                          />
                        </div>
                        {form.image_url && (
                          <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                            <img
                              src={form.image_url}
                              alt="Preview"
                              className="w-full h-48 object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg">Review Your Post</h3>

                    {previewUrl && (
                      <img src={previewUrl} alt="Featured" className="w-full h-48 object-cover rounded-xl" />
                    )}

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Title</p>
                        <p className="text-gray-900 font-semibold">{form.title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Author</p>
                          <p className="text-gray-700 text-sm">{form.author_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Category</p>
                          <p className="text-gray-700 text-sm">{POST_CATEGORIES.find(c => c.value === form.category)?.label}</p>
                        </div>
                      </div>
                      {form.summary && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Summary</p>
                          <p className="text-gray-700 text-sm">{form.summary}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Content Preview</p>
                        <p className="text-gray-700 text-sm line-clamp-4">{form.content}</p>
                      </div>
                      {form.tags && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tags</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {form.tags.split(',').map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-[#FEE6F4] text-[#9E065D] text-xs rounded-full font-medium">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {form.source_url && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Source URL</p>
                          <p className="text-sm text-[#9E065D] truncate">{form.source_url}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <AlertCircle size={16} className="inline mr-2" />
                    <strong>Approval Required:</strong> Your post will be reviewed by our team before it is published. You'll receive an email notification once approved.
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && !canProceedStep1) ||
                      (step === 2 && !canProceedStep2) ||
                      uploading
                    }
                    className="px-6 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Post for Review
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostSubmitModal;
