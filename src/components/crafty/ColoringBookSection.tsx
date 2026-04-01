import React, { useState, useEffect } from 'react';
import { BookOpen, PenTool, ArrowRight, Loader2, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ColoringBookCard from './ColoringBookCard';
import ColoringBookSubmitModal from './ColoringBookSubmitModal';

interface ColoringBook {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_image: string;
  page_count: number;
  download_count: number;
  featured: boolean;
  tags: string[];
  created_at: string;
}

const ColoringBookSection: React.FC = () => {
  const [books, setBooks] = useState<ColoringBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('coloring_books')
          .select('*')
          .eq('status', 'approved')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBooks(data || []);
      } catch (err) {
        console.error('Error fetching coloring books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const featuredBook = books.find((b) => b.featured);
  const regularBooks = books.filter((b) => !b.featured);

  return (
    <section id="coloring-books" className="py-20 bg-gradient-to-b from-white via-[#FEFBF7] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FEE6F4] rounded-full mb-4">
            <Palette size={14} className="text-[#9E065D]" />
            <span className="text-sm font-semibold text-[#9E065D] tracking-wide uppercase">Creative Corner</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Coloring Books
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Browse our collection of printable coloring books. View them as digital flip books, download, and print at home. Community members can submit their own creations!
          </p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/25 transition-all group"
          >
            <PenTool size={16} />
            Create Your Own
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 size={32} className="animate-spin text-[#9E065D] mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading coloring books...</p>
          </div>
        )}

        {/* No books */}
        {!loading && books.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Coloring Books Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to create and share a coloring book with the community!</p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <PenTool size={16} />
              Create a Coloring Book
            </button>
          </div>
        )}

        {/* Featured Book */}
        {featuredBook && (
          <div className="mb-12">
            <ColoringBookCard book={featuredBook} featured />
          </div>
        )}

        {/* Regular Books Grid */}
        {regularBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {regularBooks.map((book) => (
              <ColoringBookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Create Your Own CTA */}
        <div className="bg-gradient-to-r from-[#1a0a12] via-[#2d0f1f] to-[#1a0a12] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-8 w-24 h-24 border border-[#FB50B1] rounded-full" />
            <div className="absolute bottom-4 right-12 w-32 h-32 border border-[#FB50B1] rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-[#FB50B1] rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FB50B1]/30">
              <Palette size={24} className="text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
              Create Your Own Coloring Book
            </h3>
            <p className="text-white/70 max-w-lg mx-auto mb-6 text-sm md:text-base">
              Have original line art or illustrations? Upload your pages, design your covers, and share your coloring book with the Crafty Kates community. All submissions are reviewed before publishing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FB50B1] to-[#FF7AC6] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/30 transition-all group"
              >
                <PenTool size={18} />
                Start Creating
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/50 text-xs">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6L5.5 7.5L8 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Free to create
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6L5.5 7.5L8 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Upload your own art
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6L5.5 7.5L8 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Reviewed & published
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6L5.5 7.5L8 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Downloadable & printable
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <ColoringBookSubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
    </section>
  );
};

export default ColoringBookSection;
