import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  Calendar, MapPin, Clock, Users, ChevronRight, Ticket, ExternalLink,
  Plus, Tag, Globe, DollarSign, ArrowRight
} from 'lucide-react';
import { useSiteImages } from '@/contexts/SiteImagesContext';
import EventSubmitModal from './EventSubmitModal';
import BackToTop from './BackToTop';


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
}

const CATEGORY_LABELS: Record<string, string> = {
  'car-show': 'Car Show',
  'community': 'Community',
  'fundraiser': 'Fundraiser',
  'festival': 'Festival',
  'meetup': 'Meetup',
  'swap-meet': 'Swap Meet',
  'other': 'Event',
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

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  return `${month} ${day}`;
}

const EventsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { getImage } = useSiteImages();
  const carShowImage = getImage('events-car-show');


  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('community_events')
          .select('id, title, description, event_date, event_time_start, event_time_end, location, address, category, image_url, website_url, ticket_url, is_free, ticket_price')
          .eq('status', 'approved')
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date', { ascending: true });

        if (!error && data) setCommunityEvents(data);
      } catch (err) {
        console.error('Failed to fetch community events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <>
      <section id="events" ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-20 right-0 w-80 h-80 bg-[#FEE6F4]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-[#FB50B1]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">Upcoming Events</span>
            <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">JOIN THE EXPERIENCE</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full mb-6" />
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-6">Check out our upcoming events or share your own with the community.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-[#9E065D]/20 hover:shadow-[#FB50B1]/30 hover:scale-105"
              >
                <Plus size={18} />
                Submit Your Event
                <ArrowRight size={16} className="ml-1" />
              </button>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-[#9E065D]/30 text-[#9E065D] font-medium text-sm rounded-xl hover:bg-[#FEE6F4] transition-all"
              >
                <Calendar size={16} />
                View All Events
              </Link>
            </div>
          </div>

          {/* Main Car Show Event */}
          <div className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#FB50B1]/10 to-[#9E065D]/10 rounded-3xl blur-xl" />
              <img
                src={carShowImage}
                alt="Classic Burger Car Show"
                className="relative w-full rounded-2xl shadow-xl object-cover aspect-video"
              />
              <div className="absolute top-4 left-4 bg-gradient-to-r from-[#9E065D] to-[#7D0348] text-white px-4 py-2 rounded-xl shadow-lg">
                <p className="font-heading text-xl tracking-wider">APR 18, 2026</p>
              </div>
            </div>


            <div>
              <h3 className="font-heading text-4xl text-[#9E065D] tracking-wide mb-4">CLASSIC BURGER CAR SHOW</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                More than just car shows — we're building community and changing lives. Join us for the annual Classic Burgers Car Show, where classic car enthusiasts, families, and the community come together for an unforgettable day of American muscle, great food, and giving back.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-[#FEE6F4]/40 rounded-xl">
                  <Calendar className="w-5 h-5 text-[#9E065D] mt-0.5 flex-shrink-0" />
                  <div><p className="font-semibold text-gray-900 text-sm">Date</p><p className="text-gray-600 text-sm">Saturday, April 18, 2026</p></div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FEE6F4]/40 rounded-xl">
                  <MapPin className="w-5 h-5 text-[#9E065D] mt-0.5 flex-shrink-0" />
                  <div><p className="font-semibold text-gray-900 text-sm">Location</p><p className="text-gray-600 text-sm">Classic Burgers, Inyokern, CA</p></div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FEE6F4]/40 rounded-xl">
                  <Users className="w-5 h-5 text-[#9E065D] mt-0.5 flex-shrink-0" />
                  <div><p className="font-semibold text-gray-900 text-sm">Open To</p><p className="text-gray-600 text-sm">All Classic Cars</p></div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FEE6F4]/40 rounded-xl">
                  <Clock className="w-5 h-5 text-[#9E065D] mt-0.5 flex-shrink-0" />
                  <div><p className="font-semibold text-gray-900 text-sm">Time</p><p className="text-gray-600 text-sm">8:00 AM – 3:30 PM</p></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-[#9E065D]/20 hover:shadow-[#FB50B1]/30 hover:scale-105">
                  <Ticket size={16} />
                  Register Now
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button onClick={() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center gap-2 border-2 border-[#9E065D] text-[#9E065D] hover:bg-[#9E065D] hover:text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300">
                  Become a Sponsor
                </button>
                <Link to="/car-show" className="inline-flex items-center gap-2 text-[#9E065D] hover:text-[#FB50B1] px-4 py-3.5 font-medium text-sm transition-all duration-300 group">
                  <ExternalLink size={16} />
                  Full Event Details
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Community Events Grid */}
          {communityEvents.length > 0 && (
            <div className={`mt-20 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-heading text-3xl text-gray-900 tracking-wide">COMMUNITY EVENTS</h3>
                  <p className="text-gray-500 text-sm mt-1">More events from the community</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/events" className="inline-flex items-center gap-2 px-4 py-2 text-[#9E065D] hover:text-[#FB50B1] text-sm font-medium transition-colors">
                    View All <ArrowRight size={14} />
                  </Link>
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-[#FB50B1]/40 text-[#9E065D] hover:border-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    <Plus size={16} />
                    Submit Yours
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityEvents.map((event) => (
                  <CommunityEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Submit Your Event CTA Banner */}
          <div className={`mt-20 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative bg-gradient-to-br from-[#1a0a12] to-[#7D0348] rounded-3xl overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-6 left-6 w-32 h-32 border border-white/20 rounded-full" />
                <div className="absolute bottom-6 right-6 w-48 h-48 border border-white/10 rounded-full" />
              </div>

              <div className="relative px-8 py-12 sm:px-12 sm:py-14 flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 bg-[#FB50B1]/20 border border-[#FB50B1]/30 rounded-full px-4 py-1.5 mb-4">
                    <Calendar size={14} className="text-[#FB50B1]" />
                    <span className="text-[#FB50B1] text-xs font-semibold uppercase tracking-wider">Community Events</span>
                  </div>
                  <h3 className="font-heading text-3xl sm:text-4xl text-white tracking-wide mb-3">HAVE AN EVENT?</h3>
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-lg">
                    Got a car show, community gathering, fundraiser, or meetup coming up? Submit your event and we'll feature it right here for the whole community to see.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="group inline-flex items-center gap-3 bg-white hover:bg-[#FEE6F4] text-[#9E065D] px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={20} className="text-white" />
                    </div>
                    Submit Your Event
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <BackToTop />
        </div>
      </section>

      <EventSubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
    </>
  );
};

// Community Event Card Component
const CommunityEventCard: React.FC<{ event: CommunityEvent }> = ({ event }) => {
  const categoryLabel = CATEGORY_LABELS[event.category] || 'Event';
  const shortDate = formatShortDate(event.event_date);
  const fullDate = formatEventDate(event.event_date);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-[#FEE6F4] hover:shadow-xl transition-all duration-300 overflow-hidden">
      {event.image_url ? (
        <div className="relative h-40 overflow-hidden">
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#9E065D] px-3 py-1 rounded-lg text-xs font-bold">{shortDate}</div>
          <div className="absolute top-3 right-3 bg-[#9E065D]/90 text-white px-2.5 py-1 rounded-lg text-xs font-medium">{categoryLabel}</div>
        </div>
      ) : (
        <div className="relative h-28 bg-gradient-to-br from-[#FEE6F4] to-[#FB50B1]/20 flex items-center justify-center">
          <Calendar size={32} className="text-[#9E065D]/30" />
          <div className="absolute top-3 left-3 bg-white/90 text-[#9E065D] px-3 py-1 rounded-lg text-xs font-bold">{shortDate}</div>
          <div className="absolute top-3 right-3 bg-[#9E065D]/90 text-white px-2.5 py-1 rounded-lg text-xs font-medium">{categoryLabel}</div>
        </div>
      )}

      <div className="p-5">
        <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#9E065D] transition-colors line-clamp-2">{event.title}</h4>
        {event.description && <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={14} className="text-[#9E065D] flex-shrink-0" /><span>{fullDate}</span></div>
          {(event.event_time_start || event.event_time_end) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} className="text-[#9E065D] flex-shrink-0" />
              <span>{event.event_time_start && formatTime(event.event_time_start)}{event.event_time_start && event.event_time_end && ' – '}{event.event_time_end && formatTime(event.event_time_end)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={14} className="text-[#9E065D] flex-shrink-0" /><span className="line-clamp-1">{event.location}{event.address ? `, ${event.address}` : ''}</span></div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={14} className="text-[#9E065D] flex-shrink-0" />
            <span className={event.is_free ? 'text-emerald-600 font-medium' : 'text-gray-600'}>{event.is_free ? 'Free Admission' : event.ticket_price || 'Paid'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {event.website_url && (
            <a href={event.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9E065D] bg-[#FEE6F4]/50 hover:bg-[#FEE6F4] rounded-lg transition-colors"><Globe size={12} />Website</a>
          )}
          {event.ticket_url && (
            <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9E065D] hover:bg-[#FB50B1] rounded-lg transition-colors"><Ticket size={12} />Tickets</a>
          )}
          {event.address && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-auto"><MapPin size={12} />Map</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
