import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { BookOpen, Download, Search, ArrowLeft, Loader2, Palette, PenTool, ArrowRight, Eye } from 'lucide-react';
import Navigation from '@/components/crafty/Navigation';
import Footer from '@/components/crafty/Footer';
import ColoringBookSubmitModal from '@/components/crafty/ColoringBookSubmitModal';

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

const ColoringBookArchive: React.FC = () => {
  const [books, setBooks] = useState<ColoringBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('coloring_books')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        if (!error && data) setBooks(data);
      } catch (err) {
        console.error('Error fetching coloring books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.description?.toLowerCase().includes(q) ||
      book.tags?.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navigation />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a0a12] via-[#2d1020] to-[#1a0a12] py-16 sm:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FB50B1]/10 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-white/40 hover:text-[#FB50B1] transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-[#FB50B1]">Coloring Book Archive</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FB50B1]/15 border border-[#FB50B1]/25 rounded-full px-4 py-1.5 mb-4">
                <Palette size={14} className="text-[#FB50B1]" />
                <span className="text-[#FB50B1] text-sm font-medium">Creative Corner</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider mb-3">COLORING BOOK ARCHIVE</h1>
              <p className="text-white/50 max-w-lg text-sm">Browse, view, and download all community coloring books.</p>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FB50B1] to-[#FF7AC6] text-white font-bold rounded-xl hover:shadow-lg transition-all group self-start lg:self-auto"
            >
              <PenTool size={16} />
              Create Your Own
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coloring books..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm bg-white"
            />
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin text-[#9E065D] mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading coloring books...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {searchQuery ? 'No coloring books found' : 'No Coloring Books Yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try a different search term.' : 'Be the first to create and share a coloring book!'}
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <PenTool size={16} />
                Create a Coloring Book
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">{filteredBooks.length} coloring book{filteredBooks.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map(book => (
                  <Link
                    key={book.id}
                    to={`/coloring-book/${book.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#FEE6F4] transition-all duration-300"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                      {book.cover_image ? (
                        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FEE6F4] to-[#FB50B1]/20 flex items-center justify-center">
                          <BookOpen size={48} className="text-[#9E065D]/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#9E065D] transition-colors mb-1 truncate">{book.title}</h3>
                      <p className="text-gray-500 text-xs mb-2">by {book.author}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye size={12} />{book.page_count} pages</span>
                        <span className="flex items-center gap-1"><Download size={12} />{book.download_count} downloads</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
      <ColoringBookSubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
    </div>
  );
};

export default ColoringBookArchive;
