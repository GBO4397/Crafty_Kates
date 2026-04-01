import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin, ChevronDown, Search, Lock, Image as ImageIcon, Shield, Calendar, Plus, PenTool, Palette, BookOpen, ClipboardList, Download, ArrowRight, Archive } from 'lucide-react';

import { useSiteImages } from '@/contexts/SiteImagesContext';
import EventSubmitModal from './EventSubmitModal';
import PostSubmitModal from './PostSubmitModal';
import ColoringBookSubmitModal from './ColoringBookSubmitModal';


const Navigation: React.FC = () => {
  const { getImage } = useSiteImages();
  const LOGO = getImage('logo');
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showColoringModal, setShowColoringModal] = useState(false);

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [postsDropdown, setPostsDropdown] = useState(false);
  const [coloringDropdown, setColoringDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (moreDropdown && !target.closest('[data-more-dropdown]')) setMoreDropdown(false);
      if (postsDropdown && !target.closest('[data-posts-dropdown]')) setPostsDropdown(false);
      if (coloringDropdown && !target.closest('[data-coloring-dropdown]')) setColoringDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [moreDropdown, postsDropdown, coloringDropdown]);

  const isHomePage = location.pathname === '/';

  const scrollToSection = (id: string) => {
    if (isHomePage) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    setMobileOpen(false);
    setMoreDropdown(false);
    setPostsDropdown(false);
    setColoringDropdown(false);
  };

  const goHome = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
    setMobileOpen(false);
  };

  const galleryLinks = [
    { label: 'Ben Radatz Gallery', to: '/gallery/ben-radatz' },
    { label: 'K.Mikael Wallin Gallery', to: '/gallery/k-mikael-wallin' },
  ];

  const pageLinks = [
    { label: 'Car Show Details', to: '/car-show' },
    { label: 'Car Show Registration', to: '/register' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1a0a12] text-white/90 text-sm py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:17604131559" className="flex items-center gap-2 hover:text-[#FB50B1] transition-colors">
              <Phone size={14} />
              <span>1 (760) 413-1559</span>
            </a>
            <a href="https://maps.google.com/?q=703+E+Dolphin+Ridgecrest+CA+93555" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#FB50B1] transition-colors">
              <MapPin size={14} />
              <span>703 E Dolphin Ridgecrest CA 93555</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/craftykatespromotions" target="_blank" rel="noopener noreferrer" className="hover:text-[#FB50B1] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/craftykatespromotions" target="_blank" rel="noopener noreferrer" className="hover:text-[#FB50B1] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.youtube.com/@craftykatespromotions" target="_blank" rel="noopener noreferrer" className="hover:text-[#FB50B1] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - links to Home */}
            <Link to="/" onClick={() => { if (isHomePage) window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-3 group">
              <img src={LOGO} alt="Crafty Kates Logo" className="w-14 h-14 rounded-full shadow-md group-hover:shadow-lg transition-shadow" />
              <div className="hidden sm:block">
                <h1 className="font-heading text-2xl text-[#9E065D] leading-none tracking-wide">Crafty Kates</h1>
                <p className="text-xs text-[#7D0348]/70 font-light italic">Drive into the past, fuel the future.</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {/* Home */}
              <button onClick={goHome} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200">Home</button>

              {/* About */}
              <button onClick={() => scrollToSection('about')} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200">About</button>

              {/* Posts Dropdown */}
              <div className="relative" data-posts-dropdown>
                <button
                  onClick={() => { setPostsDropdown(!postsDropdown); setColoringDropdown(false); setMoreDropdown(false); }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200 flex items-center gap-1"
                >
                  Posts <ChevronDown size={14} className={`transition-transform ${postsDropdown ? 'rotate-180' : ''}`} />
                </button>
                {postsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                    <Link to="/posts" onClick={() => setPostsDropdown(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEE6F4]/50 hover:text-[#9E065D] transition-colors font-medium">
                      All Posts & Features
                    </Link>
                    <button
                      onClick={() => { setPostsDropdown(false); setShowPostModal(true); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#1E40AF] hover:bg-[#E8F4FE]/50 transition-colors font-medium"
                    >
                      <PenTool size={14} />
                      Create a Post
                    </button>
                  </div>
                )}
              </div>

              {/* Coloring Books Dropdown */}
              <div className="relative" data-coloring-dropdown>
                <button
                  onClick={() => { setColoringDropdown(!coloringDropdown); setPostsDropdown(false); setMoreDropdown(false); }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200 flex items-center gap-1"
                >
                  Coloring Books <ChevronDown size={14} className={`transition-transform ${coloringDropdown ? 'rotate-180' : ''}`} />
                </button>
                {coloringDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                    <button
                      onClick={() => { setColoringDropdown(false); scrollToSection('coloring-books'); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEE6F4]/50 hover:text-[#9E065D] transition-colors font-medium"
                    >
                      Coloring Books
                    </button>
                    <Link to="/coloring-books" onClick={() => setColoringDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEE6F4]/50 hover:text-[#9E065D] transition-colors font-medium">
                      <Archive size={14} />
                      Coloring Book Archive
                    </Link>
                    <button
                      onClick={() => { setColoringDropdown(false); setShowColoringModal(true); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#166534] hover:bg-[#F0FDF4]/50 transition-colors font-medium"
                    >
                      <Palette size={14} />
                      Create a Coloring Book
                    </button>
                  </div>
                )}
              </div>

              {/* 2026 Car Show */}
              <button onClick={() => scrollToSection('events')} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200">2026 Car Show</button>

              {/* Gallery */}
              <button onClick={() => scrollToSection('gallery')} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200">Gallery</button>

              {/* Contact */}
              <button onClick={() => scrollToSection('contact')} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200">Contact</button>

              {/* More Dropdown */}
              <div className="relative" data-more-dropdown>
                <button onClick={() => { setMoreDropdown(!moreDropdown); setPostsDropdown(false); setColoringDropdown(false); }} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200 flex items-center gap-1">
                  More <ChevronDown size={14} className={`transition-transform ${moreDropdown ? 'rotate-180' : ''}`} />
                </button>
                {moreDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                    {/* Submit Event */}
                    <button
                      onClick={() => { setMoreDropdown(false); setShowSubmitModal(true); }}
                      className="flex items-center gap-3 mx-2 mb-1 px-3 py-3 bg-gradient-to-r from-[#FEE6F4] to-[#FEE6F4]/50 border border-[#FB50B1]/20 rounded-xl text-sm text-[#9E065D] hover:from-[#FB50B1]/20 hover:to-[#FEE6F4] transition-all group w-[calc(100%-16px)]"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <Plus size={14} className="text-white" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold block leading-tight">Submit Your Event</span>
                        <span className="text-xs text-[#9E065D]/60">Share your event with the community</span>
                      </div>
                    </button>

                    {/* Pages */}
                    <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Pages</p>
                    {pageLinks.map((page) => (
                      <Link key={page.label} to={page.to} onClick={() => setMoreDropdown(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEE6F4]/50 hover:text-[#9E065D] transition-colors">{page.label}</Link>
                    ))}
                    <Link to="/events" onClick={() => setMoreDropdown(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEE6F4]/50 hover:text-[#9E065D] transition-colors">All Events</Link>

                    {/* Photo Galleries */}
                    <div className="border-t border-gray-100 my-1" />
                    <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Photo Galleries</p>
                    {galleryLinks.map((g) => (
                      <Link key={g.label} to={g.to} onClick={() => setMoreDropdown(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEE6F4]/50 hover:text-[#9E065D] transition-colors">{g.label}</Link>
                    ))}

                    {/* Admin */}
                    <div className="border-t border-gray-100 my-1" />
                    <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={10} className="text-gray-400" />
                      Admin (Password Protected)
                    </p>
                    <Link to="/admin" onClick={() => setMoreDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEE6F4]/50 hover:text-[#9E065D] transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#FEE6F4] flex items-center justify-center transition-colors">
                        <Lock size={14} className="text-gray-500 group-hover:text-[#9E065D] transition-colors" />
                      </div>
                      <span className="font-medium">Admin Dashboard</span>
                      <Lock size={12} className="text-gray-300 group-hover:text-[#9E065D]/50 transition-colors ml-auto" />
                    </Link>
                  </div>
                )}
              </div>

              <button onClick={() => setSearchOpen(!searchOpen)} className="ml-2 p-2 text-gray-500 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all"><Search size={18} /></button>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-[#9E065D] hover:bg-[#FEE6F4] rounded-lg transition-colors">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {searchOpen && (
            <div className="hidden lg:block pb-4 animate-slide-in">
              <div className="relative max-w-md ml-auto">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Crafty Kates..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm" autoFocus />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-in">
            <div className="px-4 py-3 space-y-1">
              {/* Submit Actions */}
              <button onClick={() => { setMobileOpen(false); setShowSubmitModal(true); }} className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-[#FEE6F4] to-[#FEE6F4]/50 border border-[#FB50B1]/20 rounded-xl text-sm text-[#9E065D] transition-all group mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-lg flex items-center justify-center flex-shrink-0"><Plus size={14} className="text-white" /></div>
                <div className="text-left"><span className="font-bold block leading-tight">Submit Your Event</span><span className="text-xs text-[#9E065D]/60">Share your event with the community</span></div>
              </button>
              <button onClick={() => { setMobileOpen(false); setShowPostModal(true); }} className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-[#E8F4FE] to-[#E8F4FE]/50 border border-[#3B82F6]/20 rounded-xl text-sm text-[#1E40AF] transition-all group mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-lg flex items-center justify-center flex-shrink-0"><PenTool size={14} className="text-white" /></div>
                <div className="text-left"><span className="font-bold block leading-tight">Create a Post</span><span className="text-xs text-[#1E40AF]/60">Share your story with the community</span></div>
              </button>
              <button onClick={() => { setMobileOpen(false); setShowColoringModal(true); }} className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-[#F0FDF4] to-[#F0FDF4]/50 border border-[#22C55E]/20 rounded-xl text-sm text-[#166534] transition-all group mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#166534] to-[#22C55E] rounded-lg flex items-center justify-center flex-shrink-0"><Palette size={14} className="text-white" /></div>
                <div className="text-left"><span className="font-bold block leading-tight">Create a Coloring Book</span><span className="text-xs text-[#166534]/60">Upload your art & share it</span></div>
              </button>

              {/* Nav Links */}
              <button onClick={goHome} className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm font-medium">Home</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm font-medium">About</button>

              {/* Posts */}
              <Link to="/posts" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm font-medium">Posts & Features</Link>

              {/* Coloring Books */}
              <button onClick={() => scrollToSection('coloring-books')} className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm font-medium">Coloring Books</button>
              <Link to="/coloring-books" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm ml-4">
                <Archive size={14} /> Coloring Book Archive
              </Link>

              <button onClick={() => scrollToSection('events')} className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm font-medium">2026 Car Show</button>
              <button onClick={() => scrollToSection('gallery')} className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm font-medium">Gallery</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all text-sm font-medium">Contact</button>

              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</p>
                {pageLinks.map((page) => (
                  <Link key={page.label} to={page.to} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-colors">{page.label}</Link>
                ))}
                <Link to="/events" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-colors">All Events</Link>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Photo Galleries</p>
                {galleryLinks.map((g) => (
                  <Link key={g.label} to={g.to} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-colors">{g.label}</Link>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Lock size={10} /> Admin</p>
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Lock size={14} className="text-gray-500" /></div>
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex items-center gap-3 px-4">
                  <a href="tel:17604131559" className="flex items-center gap-2 text-sm text-[#9E065D]"><Phone size={14} /><span>1 (760) 413-1559</span></a>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <EventSubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
      <PostSubmitModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
      <ColoringBookSubmitModal isOpen={showColoringModal} onClose={() => setShowColoringModal(false)} />
    </>
  );
};

export default Navigation;
