import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import PermissionGuard from '@/components/admin/PermissionGuard';
import {
  BookOpen, Check, X, Loader2, RefreshCw, AlertCircle,
  Mail, User, Tag, Eye, EyeOff, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColoringBook {
  id: string;
  title: string;
  author: string;
  email: string;
  description: string | null;
  page_count: number;
  status: 'pending' | 'approved' | 'rejected';
  tags: string[] | null;
  cover_image: string | null;
  created_at: string;
}

interface ColoringPage {
  id: string;
  book_id: string;
  page_number: number;
  image_url: string;
  title: string | null;
}

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

interface ColoringBookAdminProps {
  embedded?: boolean;
}

const ColoringBookAdmin: React.FC<ColoringBookAdminProps> = ({ embedded }) => {
  const { hasPermission } = useAdminPermissions();
  const { toast } = useToast();

  const [books, setBooks] = useState<ColoringBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pages, setPages] = useState<Record<string, ColoringPage[]>>({});
  const [loadingPages, setLoadingPages] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('coloring_books')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setBooks(data ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load coloring books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const loadPages = async (bookId: string) => {
    if (pages[bookId]) return;
    setLoadingPages(bookId);
    try {
      const { data, error: err } = await supabase
        .from('coloring_book_pages')
        .select('*')
        .eq('book_id', bookId)
        .order('page_number');
      if (!err && data) setPages(prev => ({ ...prev, [bookId]: data }));
    } finally {
      setLoadingPages(null);
    }
  };

  const toggleExpand = (bookId: string) => {
    if (expandedId === bookId) {
      setExpandedId(null);
    } else {
      setExpandedId(bookId);
      loadPages(bookId);
    }
  };

  const updateStatus = async (book: ColoringBook, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(book.id);
    try {
      const { error: err } = await supabase
        .from('coloring_books')
        .update({ status: newStatus })
        .eq('id', book.id);
      if (err) throw err;
      toast({ title: `"${book.title}" ${newStatus}` });
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, status: newStatus } : b));
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (book: ColoringBook) => {
    if (!confirm(`Permanently delete "${book.title}" by ${book.author}? This cannot be undone.`)) return;
    try {
      const { error: err } = await supabase.from('coloring_books').delete().eq('id', book.id);
      if (err) throw err;
      toast({ title: 'Deleted' });
      setBooks(prev => prev.filter(b => b.id !== book.id));
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const filtered = statusFilter === 'all' ? books : books.filter(b => b.status === statusFilter);
  const counts = {
    pending: books.filter(b => b.status === 'pending').length,
    approved: books.filter(b => b.status === 'approved').length,
    rejected: books.filter(b => b.status === 'rejected').length,
    all: books.length,
  };

  const TABS: { key: StatusFilter; label: string; activeColor: string }[] = [
    { key: 'pending', label: 'Pending', activeColor: 'text-amber-600' },
    { key: 'approved', label: 'Approved', activeColor: 'text-emerald-600' },
    { key: 'rejected', label: 'Rejected', activeColor: 'text-red-500' },
    { key: 'all', label: 'All', activeColor: 'text-gray-600' },
  ];

  const wrapClass = embedded ? 'p-6' : 'max-w-5xl mx-auto px-4 sm:px-6 py-8';

  return (
    <PermissionGuard permission="coloring_book_admin" hasPermission={hasPermission('coloring_book_admin')}>
      <div className={wrapClass}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coloring Books</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and approve submitted coloring books.</p>
          </div>
          <button onClick={loadBooks} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`ml-1.5 text-xs font-bold ${statusFilter === tab.key ? tab.activeColor : 'text-gray-400'}`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Book list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="text-[#9E065D] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 px-6 py-8 text-red-600 bg-white rounded-2xl border border-gray-200">
            <AlertCircle size={16} /><span className="text-sm">{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No {statusFilter === 'all' ? '' : statusFilter} submissions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(book => (
              <div key={book.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Book summary row */}
                <div className="flex items-start gap-4 p-5">
                  {/* Cover thumbnail */}
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-14 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-gray-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">{book.title}</h3>
                      <StatusBadge status={book.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={11} />{book.author}</span>
                      <span className="flex items-center gap-1"><Mail size={11} />{book.email}</span>
                      <span className="flex items-center gap-1"><BookOpen size={11} />{book.page_count} pages</span>
                      <span className="text-gray-400">{new Date(book.created_at).toLocaleDateString()}</span>
                    </div>
                    {book.description && (
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{book.description}</p>
                    )}
                    {book.tags && book.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Tag size={10} className="text-gray-400" />
                        {book.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {book.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(book, 'approved')}
                          disabled={updatingId === book.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          {updatingId === book.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(book, 'rejected')}
                          disabled={updatingId === book.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          <X size={11} /> Reject
                        </button>
                      </>
                    )}
                    {book.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(book, 'rejected')}
                        disabled={updatingId === book.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-xs font-medium text-gray-500 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <EyeOff size={11} /> Revoke
                      </button>
                    )}
                    {book.status === 'rejected' && (
                      <button
                        onClick={() => updateStatus(book, 'approved')}
                        disabled={updatingId === book.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-xs font-medium text-gray-500 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Eye size={11} /> Re-approve
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(book.id)}
                      title="Preview pages"
                      className="p-1.5 text-gray-400 hover:text-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-lg transition-colors"
                    >
                      {expandedId === book.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(book)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded pages preview */}
                {expandedId === book.id && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    {loadingPages === book.id ? (
                      <div className="flex justify-center py-6">
                        <Loader2 size={18} className="text-[#9E065D] animate-spin" />
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Pages ({pages[book.id]?.length ?? 0})
                        </p>
                        {pages[book.id]?.length ? (
                          <div className="flex flex-wrap gap-3">
                            {pages[book.id].map(page => (
                              <div key={page.id} className="flex-shrink-0 text-center">
                                <img
                                  src={page.image_url}
                                  alt={page.title ?? `Page ${page.page_number}`}
                                  className="w-20 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">{page.page_number}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No pages uploaded.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default ColoringBookAdmin;
