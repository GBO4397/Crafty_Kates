import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, BookOpen, User, Calendar, Tag, Share2, Eye, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteImages } from '@/contexts/SiteImagesContext';
import FlipBookViewer from '@/components/crafty/FlipBookViewer';

interface ColoringBook {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_image: string;
  back_cover_image: string | null;
  inside_front_cover: string | null;
  inside_back_cover: string | null;
  page_count: number;
  download_count: number;
  featured: boolean;
  tags: string[];
  created_at: string;
}

interface BookPage {
  id: string;
  book_id: string;
  page_number: number;
  image_url: string;
  title: string | null;
  is_color: boolean;
}

const ColoringBookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getImage } = useSiteImages();
  const LOGO = getImage('logo');

  const [book, setBook] = useState<ColoringBook | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      setLoading(true);
      setError('');

      try {
        const { data: bookData, error: bookError } = await supabase
          .from('coloring_books')
          .select('*')
          .eq('id', id)
          .single();

        if (bookError) throw bookError;
        if (!bookData) {
          setError('Coloring book not found.');
          setLoading(false);
          return;
        }

        setBook(bookData);

        const { data: pagesData, error: pagesError } = await supabase
          .from('coloring_book_pages')
          .select('*')
          .eq('book_id', id)
          .order('page_number');

        if (pagesError) throw pagesError;
        setPages(pagesData || []);
      } catch (err: any) {
        console.error('Error fetching coloring book:', err);
        setError('Failed to load coloring book.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Build flip book pages array (covers + interior pages)
  const flipBookPages = React.useMemo(() => {
    if (!book) return [];

    const allPages: Array<{
      image_url: string;
      title?: string;
      page_number: number;
      is_color?: boolean;
      type: string;
    }> = [];

    let pageNum = 1;

    // Front cover
    if (book.cover_image) {
      allPages.push({
        image_url: book.cover_image,
        title: 'Front Cover',
        page_number: pageNum++,
        is_color: true,
        type: 'cover',
      });
    }

    // Inside front cover
    if (book.inside_front_cover) {
      allPages.push({
        image_url: book.inside_front_cover,
        title: 'Inside Front Cover',
        page_number: pageNum++,
        is_color: true,
        type: 'inside-front',
      });
    }

    // Interior pages
    pages.forEach((page) => {
      allPages.push({
        image_url: page.image_url,
        title: page.title || undefined,
        page_number: pageNum++,
        is_color: page.is_color,
        type: 'page',
      });
    });

    // Inside back cover
    if (book.inside_back_cover) {
      allPages.push({
        image_url: book.inside_back_cover,
        title: 'Inside Back Cover',
        page_number: pageNum++,
        is_color: true,
        type: 'inside-back',
      });
    }

    // Back cover
    if (book.back_cover_image) {
      allPages.push({
        image_url: book.back_cover_image,
        title: 'Back Cover',
        page_number: pageNum++,
        is_color: true,
        type: 'back-cover',
      });
    }

    return allPages;
  }, [book, pages]);

  const handleDownload = async () => {
    if (!book) return;
    setDownloading(true);

    try {
      // Increment download count
      await supabase
        .from('coloring_books')
        .update({ download_count: (book.download_count || 0) + 1 })
        .eq('id', book.id);

      // Download all page images as individual files
      // In a real implementation, you'd generate a PDF server-side
      // For now, we'll open pages in a new printable window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const imageUrls = flipBookPages.map((p) => p.image_url);
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${book.title} - Coloring Book</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                .page { page-break-after: always; display: flex; align-items: center; justify-content: center; height: 100vh; }
                .page:last-child { page-break-after: auto; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                .no-print { display: none !important; }
              }
              body { margin: 0; padding: 0; background: #f3f4f6; font-family: system-ui, sans-serif; }
              .header { background: #1a0a12; color: white; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
              .header h1 { font-size: 18px; margin: 0; }
              .header button { background: #FB50B1; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
              .header button:hover { background: #e0459e; }
              .page { display: flex; align-items: center; justify-content: center; padding: 20px; min-height: 80vh; }
              img { max-width: 800px; width: 100%; height: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border-radius: 4px; }
              .page-label { text-align: center; color: #666; font-size: 12px; margin-top: 8px; }
            </style>
          </head>
          <body>
            <div class="header no-print">
              <h1>${book.title}</h1>
              <button onclick="window.print()">Print / Save as PDF</button>
            </div>
            ${imageUrls.map((url, i) => `
              <div class="page">
                <div>
                  <img src="${url}" alt="Page ${i + 1}" />
                  <div class="page-label no-print">${flipBookPages[i]?.title || `Page ${i + 1}`}</div>
                </div>
              </div>
            `).join('')}
          </body>
          </html>
        `);
        printWindow.document.close();
      }

      setBook((prev) => prev ? { ...prev, download_count: (prev.download_count || 0) + 1 } : prev);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title || 'Coloring Book',
        text: book?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#9E065D] mx-auto mb-4" />
          <p className="text-gray-600">Loading coloring book...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'Coloring book not found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9E065D] text-white font-semibold rounded-xl hover:bg-[#7D0348] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <img src={LOGO} alt="Crafty Kates" className="w-10 h-10 rounded-full shadow" />
                <span className="hidden sm:block font-heading text-lg text-[#9E065D]">Crafty Kates</span>
              </Link>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-sm text-gray-600 truncate max-w-[200px]">{book.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#9E065D] text-white text-sm font-semibold rounded-xl hover:bg-[#7D0348] transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">Download / Print</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#9E065D] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <button onClick={() => {
            navigate('/');
            setTimeout(() => {
              document.getElementById('coloring-books')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }} className="hover:text-[#9E065D] transition-colors">Coloring Books</button>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium truncate">{book.title}</span>
        </nav>

        {/* Book Info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">{book.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-full flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{book.author}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar size={12} />
                  {formatDate(book.created_at)}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <BookOpen size={12} />
                  {book.page_count} pages
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Download size={12} />
                  {book.download_count} downloads
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed max-w-3xl mb-4">{book.description}</p>

          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FEE6F4] text-[#9E065D] text-xs font-medium rounded-full">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Flip Book Viewer */}
        {flipBookPages.length > 0 ? (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
            <FlipBookViewer pages={flipBookPages} title={book.title} />
          </div>
        ) : (
          <div className="mb-12 bg-gray-100 rounded-2xl p-12 text-center">
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pages available yet for this coloring book.</p>
          </div>
        )}

        {/* Page Thumbnails Grid */}
        {flipBookPages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Pages</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {flipBookPages.map((page, idx) => (
                <div key={idx} className="group">
                  <div className="relative aspect-[3/4] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 group-hover:shadow-lg transition-shadow">
                    <img
                      src={page.image_url}
                      alt={page.title || `Page ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 text-center mt-1 truncate">
                    {page.title || `Page ${idx + 1}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download CTA */}
        <div className="bg-gradient-to-r from-[#1a0a12] via-[#2d0f1f] to-[#1a0a12] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-8 w-24 h-24 border border-[#FB50B1] rounded-full" />
            <div className="absolute bottom-4 right-12 w-32 h-32 border border-[#FB50B1] rounded-full" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-heading font-bold text-white mb-3">
              Ready to Color?
            </h3>
            <p className="text-white/70 max-w-lg mx-auto mb-6">
              Download this coloring book and print it at home. Each page is designed for standard 8.5" x 11" paper.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FB50B1] to-[#FF7AC6] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/30 transition-all disabled:opacity-50"
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Download / Print Coloring Book
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#9E065D] hover:text-[#FB50B1] font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Crafty Kates
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ColoringBookPage;
