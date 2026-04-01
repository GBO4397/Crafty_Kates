import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Ticket, ChevronRight, ChevronLeft,
  Star, Gift, Music, Car, Phone, Mail, ArrowUp
} from 'lucide-react';
import SponsorSection from '@/components/crafty/SponsorSection';
import { LOGO, CAR_SHOW } from '@/data/imageConfig';


const CarShowPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const infoCards = [
    { icon: Calendar, label: 'Date', value: 'Saturday, April 18, 2026' },
    { icon: Clock, label: 'Time', value: '8:00 AM – 3:30 PM' },
    { icon: MapPin, label: 'Location', value: 'Classic Burgers, Inyokern, CA' },
    { icon: Ticket, label: 'Entry Fee', value: '$20 Pre-Reg / $25 Day-Of' },
  ];

  const expectations = [
    { icon: Car, text: 'Classic and modern vehicles on display' },
    { icon: Star, text: 'Special guests and celebrity appearances' },
    { icon: Gift, text: 'Raffle items and giveaways' },
    { icon: Users, text: 'Family-friendly activities for all ages' },
    { icon: Music, text: 'Live entertainment and great music' },
    { icon: Star, text: 'Food trucks and community fun' },
  ];




  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Top Bar */}
      <div className="bg-[#1a0a12] text-white/90 text-sm py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:17604131559" className="flex items-center gap-2 hover:text-[#FB50B1] transition-colors">
              <Phone size={14} />
              <span>1 (760) 413-1559</span>
            </a>
            <a
              href="https://maps.google.com/?q=6525+W+Inyokern+Rd+Inyokern+CA+93527"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#FB50B1] transition-colors"
            >
              <MapPin size={14} />
              <span>Classic Burgers, 6525 W. Inyokern Rd, Inyokern, CA 93527</span>
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

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={LOGO}
                alt="Crafty Kates Logo"
                className="w-14 h-14 rounded-full shadow-md group-hover:shadow-lg transition-shadow"
              />

              <div className="hidden sm:block">
                <h1 className="font-heading text-2xl text-[#9E065D] leading-none tracking-wide">Crafty Kates</h1>
                <p className="text-xs text-[#7D0348]/70 font-light italic">Drive into the past, fuel the future.</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200"
              >
                <ChevronLeft size={16} />
                Back to Home
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-[#9E065D]/20"
              >
                <Ticket size={14} />
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={CAR_SHOW.heroBg}
            alt="Classic Burger Car Show"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a12]/95 via-[#7D0348]/80 to-[#1a0a12]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/90 via-transparent to-transparent" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FB50B1] via-[#9E065D] to-[#FB50B1]" />

        <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-[#FB50B1]/20 border border-[#FB50B1]/30 rounded-full px-5 py-2 mb-6">
            <span className="w-2 h-2 bg-[#FB50B1] rounded-full animate-pulse" />
            <span className="text-[#FB50B1] text-sm font-medium">April 18, 2026</span>
          </div>

          <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl text-white leading-[0.9] tracking-wider mb-4">
            CLASSIC BURGER
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4]">CAR SHOW</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            More than just a car show — we're building community and changing lives. Join us for an unforgettable day of American muscle, great food, and giving back.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 shadow-lg shadow-[#9E065D]/30 hover:shadow-[#FB50B1]/40 hover:scale-105"
            >
              <Ticket size={18} />
              Register Your Vehicle
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => scrollToSection('cs-contact')}
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-[#FB50B1] text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 hover:bg-[#FB50B1]/10"
            >
              <Mail size={16} className="text-[#FB50B1]" />
              Questions?
            </button>
          </div>
        </div>
      </section>

      {/* Event Information */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-20 right-0 w-80 h-80 bg-[#FEE6F4]/40 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">Event Details</span>
            <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">EVENT INFORMATION</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {infoCards.map((card, i) => (
              <div key={i} className="bg-[#FEE6F4]/30 border border-[#FEE6F4] rounded-2xl p-6 text-center hover:shadow-lg hover:border-[#FB50B1]/30 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-[#9E065D] text-xs font-semibold uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-gray-900 font-medium text-sm">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-[#FB50B1]/5 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">What Awaits You</span>
            <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">WHAT TO EXPECT</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {expectations.map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-[#FEE6F4] transition-all duration-300">
                <div className="w-10 h-10 bg-[#FEE6F4] rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#9E065D]" />
                </div>
                <p className="text-gray-700 font-medium text-sm leading-relaxed pt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Register */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">Get Involved</span>
              <h2 className="font-heading text-5xl text-gray-900 tracking-wide mb-6">HOW TO REGISTER</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Ready to show off your ride? Use the entry form to register your vehicle for the 2026 Classic Burger Car Show. Spaces are limited, so don't wait — secure your spot today!
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Complete the online registration form and mail your entry fee. Pre-registration is <strong className="text-[#9E065D]">$20.00</strong> received on or before April 1, 2026. After that, entry is $25.00.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Vendors can also register for a 10' x 10' space. Cackle cars enter for free!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-[#9E065D]/20 hover:shadow-[#FB50B1]/30 hover:scale-105"
                >
                  <Ticket size={16} />
                  Open Entry Form
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => scrollToSection('cs-contact')}
                  className="inline-flex items-center gap-2 border-2 border-[#9E065D] text-[#9E065D] hover:bg-[#9E065D] hover:text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300"
                >
                  Contact Us
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-[#FB50B1]/10 to-[#9E065D]/10 rounded-3xl blur-xl" />
              <img
                src={CAR_SHOW.classicCars}
                alt="Classic cars at the show"
                className="relative w-full rounded-2xl shadow-xl object-cover aspect-video"
              />


              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#9E065D] to-[#7D0348] text-white px-4 py-2 rounded-xl shadow-lg">
                <p className="font-heading text-xl tracking-wider">2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Guests & Announcements */}
      <section className="py-20 bg-gradient-to-br from-[#1a0a12] to-[#7D0348] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <span className="inline-block text-[#FB50B1] text-sm font-semibold uppercase tracking-widest mb-3">Coming Soon</span>
          <h2 className="font-heading text-5xl sm:text-6xl text-white tracking-wide mb-6">SPECIAL GUESTS &amp; ANNOUNCEMENTS</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4] mx-auto rounded-full mb-8" />
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            We're lining up incredible special guests, featured vehicles, and exciting announcements for the 2026 show. Stay tuned — details will be revealed as we get closer to the event!
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Guest Bios', desc: 'Meet the legends behind the machines' },
              { label: 'Featured Vehicles', desc: 'Spotlight on the most iconic rides' },
              { label: 'Announcements', desc: 'News, surprises, and more' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <h3 className="font-heading text-xl text-[#FB50B1] tracking-wide mb-2">{item.label}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors & Donors */}
      <SponsorSection onContactClick={() => scrollToSection('cs-contact')} />



      {/* Contact / Questions */}
      <section id="cs-contact" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">Get In Touch</span>
            <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">QUESTIONS?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            <a href="mailto:craftykates@mail.com" className="flex flex-col items-center gap-3 bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-[#FEE6F4] transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Email</p>
                <p className="text-gray-900 font-medium text-sm group-hover:text-[#9E065D] transition-colors">craftykates@mail.com</p>
              </div>
            </a>

            <a href="tel:17604131559" className="flex flex-col items-center gap-3 bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-[#FEE6F4] transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Phone</p>
                <p className="text-gray-900 font-medium text-sm group-hover:text-[#9E065D] transition-colors">1 (760) 413-1559</p>
              </div>
            </a>

            <div className="flex flex-col items-center gap-3 bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-[#FEE6F4] transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Social</p>
                <p className="text-gray-900 font-medium text-sm">Follow us for updates</p>
              </div>
              <div className="flex gap-2 mt-1">
                <a href="https://www.facebook.com/craftykatespromotions" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#FEE6F4] text-[#9E065D] rounded-lg flex items-center justify-center hover:bg-[#9E065D] hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/craftykatespromotions" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#FEE6F4] text-[#9E065D] rounded-lg flex items-center justify-center hover:bg-[#9E065D] hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-[#1a0a12] to-[#0d050a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={LOGO} alt="Crafty Kates Logo" className="w-10 h-10 rounded-full" />
              <p className="text-white/40 text-sm">Copyright 2026 &copy; Crafty Kates. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Home</Link>
              <Link to="/register" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Register</Link>
              <Link to="/sponsor-admin" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Sponsor Admin</Link>
              <Link to="/event-admin" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Event Admin</Link>
            </div>

          </div>
        </div>
      </footer>



      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] text-white rounded-full shadow-lg shadow-[#9E065D]/30 flex items-center justify-center hover:scale-110 transition-transform duration-300"
        title="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default CarShowPage;
