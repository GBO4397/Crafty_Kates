import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, BookOpen, ArrowRight, ArrowLeft, Check, Image as ImageIcon, Info, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ColoringBookSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PageUpload {
  id: string;
  file?: File;
  preview: string;
  title: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

const ColoringBookSubmitModal: React.FC<ColoringBookSubmitModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step 1: Book info
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // Step 2: Cover images
  const [coverImage, setCoverImage] = useState<PageUpload | null>(null);
  const [backCover, setBackCover] = useState<PageUpload | null>(null);
  const [insideFrontCover, setInsideFrontCover] = useState<PageUpload | null>(null);
  const [insideBackCover, setInsideBackCover] = useState<PageUpload | null>(null);

  // Step 3: Pages
  const [pages, setPages] = useState<PageUpload[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const backCoverInputRef = useRef<HTMLInputElement>(null);
  const insideFrontInputRef = useRef<HTMLInputElement>(null);
  const insideBackInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setAuthor('');
    setEmail('');
    setDescription('');
    setTags('');
    setCoverImage(null);
    setBackCover(null);
    setInsideFrontCover(null);
    setInsideBackCover(null);
    setPages([]);
    setSubmitting(false);
    setSubmitted(false);
    setSubmitError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const uploadImage = async (file: File, bookId: string = 'temp'): Promise<string> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${bookId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('coloring-books')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);

    const { data: urlData } = supabase.storage.from('coloring-books').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleCoverUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<PageUpload | null>>,
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum 10MB.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setter({
      id: Date.now().toString(),
      file,
      preview,
      title: label,
      uploading: false,
      uploaded: false,
    });
  };

  const handlePagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPages: PageUpload[] = [];
    Array.from(files).forEach((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) return;
      if (file.size > 10 * 1024 * 1024) return;

      newPages.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ''),
        uploading: false,
        uploaded: false,
      });
    });

    setPages((prev) => [...prev, ...newPages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const movePageUp = (index: number) => {
    if (index === 0) return;
    setPages((prev) => {
      const newPages = [...prev];
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
      return newPages;
    });
  };

  const movePageDown = (index: number) => {
    if (index === pages.length - 1) return;
    setPages((prev) => {
      const newPages = [...prev];
      [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
      return newPages;
    });
  };

  const updatePageTitle = (id: string, newTitle: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      // 1. Create the book record
      const { data: bookData, error: bookError } = await supabase
        .from('coloring_books')
        .insert({
          title,
          author,
          email,
          description,
          page_count: pages.length,
          status: 'pending',
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        })
        .select('id')
        .single();

      if (bookError) throw bookError;
      const bookId = bookData.id;

      // 2. Upload cover images
      let coverUrl = '';
      let backCoverUrl = '';
      let insideFrontUrl = '';
      let insideBackUrl = '';

      if (coverImage?.file) {
        coverUrl = await uploadImage(coverImage.file, bookId);
      }
      if (backCover?.file) {
        backCoverUrl = await uploadImage(backCover.file, bookId);
      }
      if (insideFrontCover?.file) {
        insideFrontUrl = await uploadImage(insideFrontCover.file, bookId);
      }
      if (insideBackCover?.file) {
        insideBackUrl = await uploadImage(insideBackCover.file, bookId);
      }

      // Update book with cover URLs
      await supabase
        .from('coloring_books')
        .update({
          cover_image: coverUrl || null,
          back_cover_image: backCoverUrl || null,
          inside_front_cover: insideFrontUrl || null,
          inside_back_cover: insideBackUrl || null,
        })
        .eq('id', bookId);

      // 3. Upload pages
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.file) {
          const pageUrl = await uploadImage(page.file, bookId);
          await supabase.from('coloring_book_pages').insert({
            book_id: bookId,
            page_number: i + 1,
            image_url: pageUrl,
            title: page.title,
            is_color: false,
          });
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'There was an error submitting your coloring book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canProceedStep1 = title.trim() && author.trim() && email.trim() && description.trim();
  const canProceedStep2 = coverImage !== null;
  const canProceedStep3 = pages.length >= 2;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {submitted ? 'Submitted!' : 'Create a Coloring Book'}
              </h2>
              {!submitted && (
                <p className="text-xs text-gray-500">Step {step} of 4</p>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="px-6 pt-4">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-gradient-to-r from-[#9E065D] to-[#FB50B1]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Success State */}
          {submitted && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coloring Book Submitted!</h3>
              <p className="text-gray-600 mb-2">
                Your coloring book <strong>"{title}"</strong> has been submitted for review.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Our team will review your submission within 24-48 hours. You'll be notified at <strong>{email}</strong> once it's approved and published.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          )}

          {/* Step 1: Book Info */}
          {!submitted && step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Book Details</h3>
              <p className="text-sm text-gray-500 mb-4">Tell us about your coloring book.</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Classic Muscle Cars Coloring Book"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Author / Artist *</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your coloring book — what's the theme, who is it for, what makes it special?"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., classic cars, hot rods, muscle cars (comma separated)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm"
                />
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Coloring Book Guidelines</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-blue-700">
                      <li>Pages should be black & white line art (high contrast)</li>
                      <li>Cover images can be full color</li>
                      <li>Minimum 2 pages, recommended 8-24 pages</li>
                      <li>Accepted formats: JPG, PNG, WebP (max 10MB each)</li>
                      <li>Recommended resolution: 2550 x 3300px (8.5" x 11" at 300dpi)</li>
                      <li>All submissions are reviewed before publishing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Cover Images */}
          {!submitted && step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Cover Images</h3>
              <p className="text-sm text-gray-500 mb-4">Upload your front cover (required) and optional back cover and inside covers. These can be full color.</p>

              {/* Front Cover - Required */}
              <CoverUploadBox
                label="Front Cover *"
                description="The main cover of your coloring book"
                image={coverImage}
                onRemove={() => setCoverImage(null)}
                inputRef={coverInputRef}
                onChange={(e) => handleCoverUpload(e, setCoverImage, 'Front Cover')}
              />

              {/* Back Cover */}
              <CoverUploadBox
                label="Back Cover"
                description="Optional back cover"
                image={backCover}
                onRemove={() => setBackCover(null)}
                inputRef={backCoverInputRef}
                onChange={(e) => handleCoverUpload(e, setBackCover, 'Back Cover')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Inside Front Cover */}
                <CoverUploadBox
                  label="Inside Front Cover"
                  description="Optional"
                  image={insideFrontCover}
                  onRemove={() => setInsideFrontCover(null)}
                  inputRef={insideFrontInputRef}
                  onChange={(e) => handleCoverUpload(e, setInsideFrontCover, 'Inside Front Cover')}
                  compact
                />

                {/* Inside Back Cover */}
                <CoverUploadBox
                  label="Inside Back Cover"
                  description="Optional"
                  image={insideBackCover}
                  onRemove={() => setInsideBackCover(null)}
                  inputRef={insideBackInputRef}
                  onChange={(e) => handleCoverUpload(e, setInsideBackCover, 'Inside Back Cover')}
                  compact
                />
              </div>
            </div>
          )}

          {/* Step 3: Pages */}
          {!submitted && step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Coloring Pages</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload your black & white line art pages. Drag to reorder. Minimum 2 pages required.
              </p>

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#FB50B1] hover:bg-[#FEE6F4]/20 transition-all"
              >
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Click to upload pages</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP — max 10MB each — select multiple</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={handlePagesUpload}
                  className="hidden"
                />
              </div>

              {/* Page list */}
              {pages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">{pages.length} page{pages.length !== 1 ? 's' : ''} added</p>
                  {pages.map((page, index) => (
                    <div
                      key={page.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => movePageUp(index)}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 3L10 8H2L6 3Z" fill="currentColor" /></svg>
                        </button>
                        <button
                          onClick={() => movePageDown(index)}
                          disabled={index === pages.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9L2 4H10L6 9Z" fill="currentColor" /></svg>
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-400 w-6 text-center">{index + 1}</span>
                      <img
                        src={page.preview}
                        alt={page.title}
                        className="w-12 h-16 object-cover rounded border border-gray-200"
                      />
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => updatePageTitle(page.id, e.target.value)}
                        placeholder="Page title (optional)"
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FB50B1]/40"
                      />
                      <button
                        onClick={() => removePage(page.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {pages.length < 2 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Please upload at least 2 coloring pages to continue.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {!submitted && step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Review & Submit</h3>
              <p className="text-sm text-gray-500 mb-4">Review your coloring book before submitting.</p>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex items-start gap-4">
                  {coverImage && (
                    <img src={coverImage.preview} alt="Cover" className="w-20 h-28 object-cover rounded shadow" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
                    <p className="text-sm text-gray-600">by {author}</p>
                    <p className="text-xs text-gray-500 mt-1">{email}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">{description}</p>

                {tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 bg-white text-gray-600 text-xs rounded-full border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-gray-900">{pages.length} Pages</p>
                    <p className="text-xs text-gray-500">Black & white line art</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-gray-900">
                      {[coverImage, backCover, insideFrontCover, insideBackCover].filter(Boolean).length} Covers
                    </p>
                    <p className="text-xs text-gray-500">Color cover images</p>
                  </div>
                </div>

                {/* Page thumbnails */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Pages Preview</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {pages.map((page, i) => (
                      <div key={page.id} className="flex-shrink-0">
                        <img
                          src={page.preview}
                          alt={`Page ${i + 1}`}
                          className="w-14 h-20 object-cover rounded border border-gray-200"
                        />
                        <p className="text-[10px] text-gray-500 text-center mt-0.5">{i + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Your coloring book will be reviewed by our team before being published. You'll receive an email notification at <strong>{email}</strong> once approved.
                </p>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {!submitted && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2) ||
                    (step === 3 && !canProceedStep3)
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/25 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Submit Coloring Book
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Cover upload box sub-component
const CoverUploadBox: React.FC<{
  label: string;
  description: string;
  image: PageUpload | null;
  onRemove: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  compact?: boolean;
}> = ({ label, description, image, onRemove, inputRef, onChange, compact }) => {
  if (image) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 ${compact ? '' : ''}`}>
        <img
          src={image.preview}
          alt={label}
          className={`${compact ? 'w-12 h-16' : 'w-16 h-22'} object-cover rounded shadow`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{label}</p>
          <p className="text-xs text-green-600">Ready to upload</p>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed border-gray-300 rounded-xl ${compact ? 'p-4' : 'p-5'} text-center cursor-pointer hover:border-[#FB50B1] hover:bg-[#FEE6F4]/20 transition-all`}
    >
      <ImageIcon size={compact ? 20 : 24} className="mx-auto text-gray-400 mb-1" />
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
};

export default ColoringBookSubmitModal;
