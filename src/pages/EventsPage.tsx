import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  Calendar, MapPin, Clock, Users, ChevronRight, ChevronLeft, Ticket, ExternalLink,
  Plus, Tag, Globe, DollarSign, ArrowRight, Filter, Loader2
} from 'lucide-react';
import { EVENTS } from '@/data/imageConfig';
import Navigation from '@/components/crafty/Navigation';
import Footer from '@/components/crafty/Footer';
import EventSubmitModal from '@/components/crafty/EventSubmitModal';

interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time_start: string | null;
  event_time_end: string | null;
  location: string;
  address: string | null;
  category: string;
  image_url: string | null;
  website_url: string | null;
  ticket_url: string | null;
  is_free: boolean;
  ticket_price: string | null;
  admission_free: boolean | null;
  price_adults: number | null;
  price_kids: number | null;
  price_kids_free_under_age: number | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  'car-show': 'Car Show', 'community': 'Community', 'fundraiser': 'Fundraiser',
  'festival': 'Festival', 'meetup': 'Meetup', 'swap-meet': 'Swap Meet',
  'racing': 'Racing Event', 'other': 'Event',
};

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAdmission(event: CommunityEvent): React.ReactNode {
  const free = event.admission_free ?? event.is_free;
  if (free) return <span className="text-emerald-600 text-xs font-medium">Free</span>;

  const parts: string[] = [];
  if (event.price_adults) parts.push(`Adults $${event.price_adults}`);
  if (event.price_kids) parts.push(`Kids $${event.price_kids}`);
  if (event.price_kids_free_under_age) parts.push(`Under ${event.price_kids_free_under_age} free`);

  if (parts.length === 0 && event.ticket_price) parts.push(event.ticket_price);

  if (parts.length === 0) return <span className="text-gray-500 text-xs">Paid</span>;
  return <span className="text-gray-600 text-xs">{parts.join(' · ')}</span>;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('community_events')
          .select('*')
          .eq('status', 'approved')
          .order('event_date', { ascending: true });
        if (!error && data) setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Main car show event (always shown)
  const carShowEvent = {
    id: 'main-car-show',
    title: '2026 Classic Burger Car Show',
    description: 'The annual Classic Burgers Car Show — classic car enthusiasts, families, and the community come together for an unforgettable day.',
    event_date: '2026-04-18',
    event_time_start: '08:00',
    event_time_end: '15:30',
    location: 'Classic Burgers, Inyokern, CA',
    address: 'Classic Burgers, Inyokern, CA',
    category: 'car-show',
    image_url: EVENTS.carShow,
    website_url: null,
    ticket_url: null,
    is_free: true,
    ticket_price: null,
    admission_free: true,
    price_adults: null,
    price_kids: null,
    price_kids_free_under_age: null,
  };

  const allEvents = [carShowEvent, ...events];

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.event_date + 'T12:00:00');
      const matchesMonth = eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesMonth && matchesCategory;
    });
  }, [allEvents, selectedMonth, selectedYear, selectedCategory]);

  const upcomingEvents = allEvents.filter(e => new Date(e.event_date + 'T12:00:00') >= new Date()).slice(0, 6);

  const goToPrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  // Get days in month for calendar grid
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();
  const eventsOnDay = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(e => e.event_date === dateStr);
  };

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
            <span className="text-[#FB50B1]">Events</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FB50B1]/15 border border-[#FB50B1]/25 rounded-full px-4 py-1.5 mb-4">
                <Calendar size={14} className="text-[#FB50B1]" />
                <span className="text-[#FB50B1] text-sm font-medium">Community Events</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider mb-3">UPCOMING EVENTS</h1>
              <p className="text-white/50 max-w-lg text-sm">Car shows, community gatherings, fundraisers, and more.</p>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FB50B1] to-[#FF7AC6] text-white font-bold rounded-xl hover:shadow-lg transition-all group self-start lg:self-auto"
            >
              <Plus size={16} />
              Submit Your Event
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#9E065D] to-[#7D0348]">
                  <button onClick={goToPrevMonth} className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="font-heading text-xl text-white tracking-wide">
                    {MONTHS[selectedMonth]} {selectedYear}
                  </h3>
                  <button onClick={goToNextMonth} className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">{day}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20 border-b border-r border-gray-50" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = eventsOnDay(day);
                    const isToday = day === new Date().getDate() && selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();
                    return (
                      <div key={day} className={`h-20 border-b border-r border-gray-50 p-1.5 ${isToday ? 'bg-[#FEE6F4]/30' : ''}`}>
                        <span className={`text-xs font-medium ${isToday ? 'text-[#9E065D] font-bold' : 'text-gray-500'}`}>{day}</span>
                        {dayEvents.map((evt, j) => (
                          <div key={j} className="mt-0.5 px-1.5 py-0.5 bg-[#9E065D] text-white text-[10px] rounded truncate leading-tight" title={evt.title}>
                            {evt.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
                <Filter size={14} className="text-gray-400 flex-shrink-0" />
                {['all', 'car-show', 'community', 'fundraiser', 'festival', 'meetup'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat ? 'bg-[#9E065D] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FB50B1]/30'
                    }`}
                  >
                    {cat === 'all' ? 'All Events' : CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>

              {/* Events for selected month */}
              <div className="mt-6">
                <h3 className="font-heading text-xl text-gray-900 mb-4">
                  Events in {MONTHS[selectedMonth]} {selectedYear}
                </h3>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
                    <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No events found for this month.</p>
                    <button onClick={() => setShowSubmitModal(true)} className="text-[#9E065D] text-sm font-medium mt-2 hover:text-[#FB50B1]">Submit an event</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map(event => (
                      <div key={event.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex gap-5">
                        {event.image_url && (
                          <img src={event.image_url} alt={event.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0 hidden sm:block" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 bg-[#FEE6F4] text-[#9E065D] text-xs font-semibold rounded-full">{CATEGORY_LABELS[event.category] || 'Event'}</span>
                            {formatAdmission(event)}
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{event.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={12} className="text-[#9E065D]" />{formatEventDate(event.event_date)}</span>
                            {event.event_time_start && <span className="flex items-center gap-1"><Clock size={12} className="text-[#9E065D]" />{formatTime(event.event_time_start)}</span>}
                            <span className="flex items-center gap-1"><MapPin size={12} className="text-[#9E065D]" />{event.location}</span>
                          </div>
                          {event.id === 'main-car-show' && (
                            <div className="flex gap-2 mt-3">
                              <Link to="/car-show" className="px-3 py-1.5 bg-[#9E065D] text-white text-xs font-medium rounded-lg hover:bg-[#FB50B1] transition-colors">Details</Link>
                              <Link to="/register" className="px-3 py-1.5 border border-[#9E065D] text-[#9E065D] text-xs font-medium rounded-lg hover:bg-[#FEE6F4] transition-colors">Register</Link>
                            </div>
                          )}
                          {event.website_url && (
                            <a href={event.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#9E065D] text-xs font-medium mt-2 hover:text-[#FB50B1]">
                              <Globe size={12} /> Website
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Upcoming Events */}
            <div>
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-[140px]">
                <h3 className="font-heading text-lg text-gray-900 tracking-wide mb-4">UPCOMING EVENTS</h3>
                {loading ? (
                  <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-[#9E065D] mx-auto" /></div>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming events.</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map(event => {
                      const eventDate = new Date(event.event_date + 'T12:00:00');
                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 cursor-pointer group"
                          onClick={() => {
                            setSelectedMonth(eventDate.getMonth());
                            setSelectedYear(eventDate.getFullYear());
                          }}
                        >
                          <div className="w-12 h-12 bg-[#FEE6F4] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[#9E065D] text-[10px] font-bold uppercase">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-[#9E065D] text-lg font-bold leading-none">{eventDate.getDate()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm group-hover:text-[#9E065D] transition-colors truncate">{event.title}</p>
                            <p className="text-gray-500 text-xs truncate">{event.location}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick jump to April 2026 */}
                <button
                  onClick={() => { setSelectedMonth(3); setSelectedYear(2026); }}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-[#9E065D] to-[#7D0348] text-white rounded-xl text-sm font-medium hover:from-[#FB50B1] hover:to-[#9E065D] transition-all"
                >
                  View April 2026 Car Show
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <EventSubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
    </div>
  );
};

export default EventsPage;
