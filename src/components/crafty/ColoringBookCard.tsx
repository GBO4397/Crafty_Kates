import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, Eye, User, Calendar, Tag } from 'lucide-react';

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

interface ColoringBookCardProps {
  book: ColoringBook;
  featured?: boolean;
}

const ColoringBookCard: React.FC<ColoringBookCardProps> = ({ book, featured = false }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (featured) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Cover Image - Book Style */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
            <div className="relative group">
              {/* Book shadow effect */}
              <div className="absolute -right-2 top-2 bottom-2 w-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-r-sm" />
              <div className="absolute -bottom-2 left-2 right-2 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-sm" />
              <img
                src={book.cover_image}
                alt={book.title}
                className="relative w-full max-w-[320px] h-auto aspect-[3/4] object-cover rounded-sm shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                  Featured
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[#FEE6F4] text-[#9E065D] text-xs font-semibold rounded-full">
                  Coloring Book
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen size={12} />
                  {book.page_count} pages
                </span>
              </div>

              <h3 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-2">
                {book.title}
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{book.author}</p>
                  <p className="text-xs text-gray-500">{formatDate(book.created_at)}</p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-4">
                {book.description}
              </p>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {book.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <Download size={14} />
                  {book.download_count} downloads
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
              <Link
                to={`/coloring-book/${book.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9E065D] text-white text-sm font-semibold rounded-xl hover:bg-[#7D0348] transition-colors"
              >
                <Eye size={16} />
                View Flip Book
              </Link>
              <Link
                to={`/coloring-book/${book.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#9E065D]/30 text-[#9E065D] text-sm font-semibold rounded-xl hover:bg-[#FEE6F4] transition-colors"
              >
                <Download size={16} />
                Download PDF
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular card
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="relative">
          <div className="absolute -right-1 top-1 bottom-1 w-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-r-sm" />
          <img
            src={book.cover_image}
            alt={book.title}
            className="relative w-full max-w-[200px] h-auto aspect-[3/4] object-cover rounded-sm shadow-xl group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-[#FEE6F4] text-[#9E065D] text-xs font-semibold rounded-full">
            {book.page_count} pages
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Download size={10} />
            {book.download_count}
          </span>
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#9E065D] transition-colors">
          {book.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <User size={12} />
          <span>{book.author}</span>
          <span className="text-gray-300">|</span>
          <Calendar size={12} />
          <span>{formatDate(book.created_at)}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{book.description}</p>
        <div className="flex items-center gap-2">
          <Link
            to={`/coloring-book/${book.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9E065D] hover:text-[#FB50B1] transition-colors"
          >
            <Eye size={14} />
            View Book
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            to={`/coloring-book/${book.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#9E065D] transition-colors"
          >
            <Download size={14} />
            Download
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ColoringBookCard;
