import React, { useState, useRef, useCallback } from 'react';
import {
  GripVertical, Crown, Trophy, Medal, Image, ImageOff,
  ExternalLink, CheckCircle, XCircle, ChevronDown,
  ArrowUp, ArrowDown, MoreHorizontal, Eye, EyeOff,
  Layers, Trash2, Check, Users
} from 'lucide-react';


interface Sponsor {
  id: string;
  name: string;
  tier: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SponsorAdminTableProps {
  sponsors: Sponsor[];
  onReorder: (sponsors: Sponsor[]) => void;
  onUpdateSponsor: (id: string, updates: Partial<Sponsor>) => void;
  onBulkAction: (action: string, ids: string[], value?: string) => void;
}

const tierIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  gold: Crown,
  silver: Trophy,
  bronze: Medal,
};

const tierColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  gold: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-gradient-to-r from-amber-400 to-yellow-500' },
  silver: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-gradient-to-r from-slate-400 to-gray-500' },
  bronze: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', badge: 'bg-gradient-to-r from-orange-400 to-amber-600' },
};

const getInitials = (name: string): string => {
  const words = name.replace(/[–—-]/g, ' ').split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

const SponsorAdminTable: React.FC<SponsorAdminTableProps> = ({
  sponsors,
  onReorder,
  onUpdateSponsor,
  onBulkAction,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'sort_order' | 'name' | 'tier' | 'updated_at'>('sort_order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterLogo, setFilterLogo] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [bulkDropdown, setBulkDropdown] = useState(false);
  const [showTierDropdown, setShowTierDropdown] = useState<string | null>(null);
  const dragCounter = useRef(0);

  // Filtering
  let filtered = [...sponsors];
  if (filterTier !== 'all') filtered = filtered.filter(s => s.tier === filterTier);
  if (filterLogo === 'has') filtered = filtered.filter(s => s.logo_url);
  if (filterLogo === 'missing') filtered = filtered.filter(s => !s.logo_url);
  if (filterActive === 'active') filtered = filtered.filter(s => s.is_active);
  if (filterActive === 'inactive') filtered = filtered.filter(s => !s.is_active);

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'sort_order') cmp = a.sort_order - b.sort_order;
    else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'tier') {
      const tierOrder: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
      cmp = (tierOrder[a.tier] ?? 3) - (tierOrder[b.tier] ?? 3);
    } else if (sortField === 'updated_at') {
      cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const allSelected = sorted.length > 0 && sorted.every(s => selectedIds.has(s.id));
  const someSelected = sorted.some(s => selectedIds.has(s.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map(s => s.id)));
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Make the drag image slightly transparent
    const el = e.currentTarget as HTMLElement;
    setTimeout(() => el.classList.add('opacity-50'), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('opacity-50');
    setDraggedId(null);
    setDragOverId(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragCounter.current++;
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) return;

    const currentOrder = sponsors.map(s => s.id);
    const dragIdx = currentOrder.indexOf(draggedId);
    const targetIdx = currentOrder.indexOf(targetId);

    if (dragIdx === -1 || targetIdx === -1) return;

    const newOrder = [...sponsors];
    const [dragged] = newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, dragged);

    // Reassign sort_order
    const reordered = newOrder.map((s, i) => ({ ...s, sort_order: i + 1 }));
    onReorder(reordered);
    setDraggedId(null);
  };

  const moveRow = (id: string, direction: 'up' | 'down') => {
    const idx = sponsors.findIndex(s => s.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sponsors.length - 1) return;

    const newOrder = [...sponsors];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    const reordered = newOrder.map((s, i) => ({ ...s, sort_order: i + 1 }));
    onReorder(reordered);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown size={14} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ArrowUp size={14} className="text-[#9E065D]" />
      : <ArrowDown size={14} className="text-[#9E065D]" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filters:</span>

            {/* Tier filter */}
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D]"
            >
              <option value="all">All Tiers</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>

            {/* Logo filter */}
            <select
              value={filterLogo}
              onChange={e => setFilterLogo(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D]"
            >
              <option value="all">All Logos</option>
              <option value="has">Has Logo</option>
              <option value="missing">Missing Logo</option>
            </select>

            {/* Active filter */}
            <select
              value={filterActive}
              onChange={e => setFilterActive(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex-1" />

          {/* Bulk Actions */}
          {someSelected && (
            <div className="relative">
              <button
                onClick={() => setBulkDropdown(!bulkDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#9E065D] text-white rounded-lg text-sm font-medium hover:bg-[#7D0348] transition-colors shadow-sm"
              >
                <Layers size={14} />
                Bulk Actions ({selectedIds.size})
                <ChevronDown size={14} />
              </button>

              {bulkDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBulkDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white rounded-xl border border-gray-200 shadow-xl py-1">
                    <button
                      onClick={() => { onBulkAction('activate', Array.from(selectedIds)); setBulkDropdown(false); setSelectedIds(new Set()); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <Eye size={14} /> Activate Selected
                    </button>
                    <button
                      onClick={() => { onBulkAction('deactivate', Array.from(selectedIds)); setBulkDropdown(false); setSelectedIds(new Set()); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <EyeOff size={14} /> Deactivate Selected
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Change Tier</p>
                    {['gold', 'silver', 'bronze'].map(tier => {
                      const TierIcon = tierIcons[tier];
                      const colors = tierColors[tier];
                      return (
                        <button
                          key={tier}
                          onClick={() => { onBulkAction('changeTier', Array.from(selectedIds), tier); setBulkDropdown(false); setSelectedIds(new Set()); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:${colors.bg} transition-colors`}
                        >
                          <TierIcon size={14} className={colors.text} />
                          Move to {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          <span className="text-xs text-gray-400">
            {sorted.length} of {sponsors.length} sponsors
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#9E065D] focus:ring-[#9E065D]"
                />
              </th>
              <th className="w-10 px-2 py-3">
                <GripVertical size={14} className="text-gray-300 mx-auto" />
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('sort_order')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                  # <SortIcon field="sort_order" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                  Sponsor <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('tier')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                  Tier <SortIcon field="tier" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</span>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('updated_at')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                  Updated <SortIcon field="updated_at" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((sponsor, idx) => {
              const TierIcon = tierIcons[sponsor.tier] || Medal;
              const colors = tierColors[sponsor.tier] || tierColors.bronze;
              const isSelected = selectedIds.has(sponsor.id);
              const isDragOver = dragOverId === sponsor.id;
              const isDragging = draggedId === sponsor.id;

              return (
                <tr
                  key={sponsor.id}
                  draggable
                  onDragStart={e => handleDragStart(e, sponsor.id)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={e => handleDragEnter(e, sponsor.id)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, sponsor.id)}
                  className={`border-b border-gray-50 transition-all duration-200 ${
                    isDragging ? 'opacity-30 bg-gray-50' : ''
                  } ${isDragOver ? 'bg-[#FEE6F4]/30 border-t-2 border-t-[#FB50B1]' : ''} ${
                    isSelected ? 'bg-[#FEE6F4]/20' : 'hover:bg-gray-50/80'
                  } ${!sponsor.is_active ? 'opacity-60' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(sponsor.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#9E065D] focus:ring-[#9E065D]"
                    />
                  </td>

                  {/* Drag Handle */}
                  <td className="px-2 py-3 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} className="text-gray-300 hover:text-gray-500 mx-auto transition-colors" />
                  </td>

                  {/* Sort Order */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono text-gray-400 w-6 text-center">{sponsor.sort_order}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveRow(sponsor.id, 'up')}
                          className="p-0.5 text-gray-300 hover:text-[#9E065D] transition-colors"
                          disabled={idx === 0}
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          onClick={() => moveRow(sponsor.id, 'down')}
                          className="p-0.5 text-gray-300 hover:text-[#9E065D] transition-colors"
                          disabled={idx === sorted.length - 1}
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Sponsor Name + Logo Preview */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                        {sponsor.logo_url ? (
                          <img
                            src={sponsor.logo_url}
                            alt={sponsor.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`${sponsor.logo_url ? 'hidden' : ''} w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
                          <span className="text-xs font-bold text-white">{getInitials(sponsor.name)}</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{sponsor.name}</p>
                        {sponsor.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{sponsor.description}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowTierDropdown(showTierDropdown === sponsor.id ? null : sponsor.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border} border hover:shadow-sm transition-all`}
                      >
                        <TierIcon size={12} />
                        {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
                        <ChevronDown size={10} />
                      </button>

                      {showTierDropdown === sponsor.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowTierDropdown(null)} />
                          <div className="absolute left-0 top-full mt-1 z-50 w-40 bg-white rounded-xl border border-gray-200 shadow-xl py-1">
                            {['gold', 'silver', 'bronze'].map(t => {
                              const TIcon = tierIcons[t];
                              const tc = tierColors[t];
                              const isCurrent = sponsor.tier === t;
                              return (
                                <button
                                  key={t}
                                  onClick={() => {
                                    if (!isCurrent) onUpdateSponsor(sponsor.id, { tier: t });
                                    setShowTierDropdown(null);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isCurrent ? `${tc.bg} ${tc.text} font-semibold` : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  <TIcon size={14} className={tc.text} />
                                  {t.charAt(0).toUpperCase() + t.slice(1)}
                                  {isCurrent && <Check size={12} className="ml-auto" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Logo Status */}
                  <td className="px-4 py-3 text-center">
                    {sponsor.logo_url ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <Image size={12} />
                        Uploaded
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium">
                        <ImageOff size={12} />
                        Missing
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onUpdateSponsor(sponsor.id, { is_active: !sponsor.is_active })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        sponsor.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {sponsor.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {sponsor.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-700 font-medium">{formatDate(sponsor.updated_at)}</p>
                      <p className="text-xs text-gray-400">{formatTime(sponsor.updated_at)}</p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === sponsor.id ? null : sponsor.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openDropdown === sponsor.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-xl border border-gray-200 shadow-xl py-1">
                            <button
                              onClick={() => {
                                onUpdateSponsor(sponsor.id, { is_active: !sponsor.is_active });
                                setOpenDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {sponsor.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                              {sponsor.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            {sponsor.website_url && (
                              <a
                                href={sponsor.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpenDropdown(null)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <ExternalLink size={14} />
                                Visit Website
                              </a>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Users size={32} />
                    <p className="text-sm font-medium">No sponsors match your filters</p>
                    <p className="text-xs">Try adjusting the filter criteria above</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing {sorted.length} of {sponsors.length} sponsors
          {selectedIds.size > 0 && ` — ${selectedIds.size} selected`}
        </p>
        <p className="text-xs text-gray-400">
          Drag rows to reorder, or use arrow buttons
        </p>
      </div>
    </div>
  );
};

export default SponsorAdminTable;
