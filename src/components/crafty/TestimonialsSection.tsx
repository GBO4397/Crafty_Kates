import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, User, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  author_photo_url: string | null;
  testimonial_text: string;
  star_rating: number | null;
  event_id: string | null;
  community_events?: { title: string } | null;
}

interface EventGroup {
  eventTitle: string | null;
  eventId: string | null;
  items: Testimonial[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        size={14}
        className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

const TestimonialsSection: React.FC = () => {
  const [groups, setGroups] = useState<EventGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('testimonials')
          .select('*, community_events(title)')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!data || data.length === 0) { setLoading(false); return; }

        // Group by event
        const map = new Map<string, EventGroup>();
        for (const t of data) {
          const key = t.event_id ?? 'general';
          if (!map.has(key)) {
            map.set(key, {
              eventTitle: t.community_events?.title ?? null,
              eventId: t.event_id,
              items: [],
            });
          }
          map.get(key)!.items.push(t);
        }
        setGroups(Array.from(map.values()));
      } catch {
        // Testimonials are optional — fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || groups.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full mb-4">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Community Voices</span>
          </div>
          <h2 className="text-4xl font-heading text-gray-900 mb-3">What People Say</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real words from attendees, vendors, and sponsors who've been part of Crafty Kates events.
          </p>
        </div>

        {/* Groups */}
        <div className="space-y-12">
          {groups.map(group => (
            <div key={group.eventId ?? 'general'}>
              {group.eventTitle && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">{group.eventTitle}</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map(t => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Quote mark */}
                    <Quote size={20} className="text-[#FB50B1]/30 flex-shrink-0" />

                    {/* Text */}
                    <p className="text-gray-700 text-sm leading-relaxed flex-1">
                      &ldquo;{t.testimonial_text}&rdquo;
                    </p>

                    {/* Stars */}
                    {t.star_rating && <StarRating rating={t.star_rating} />}

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                      {t.author_photo_url ? (
                        <img
                          src={t.author_photo_url}
                          alt={t.author_name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D]/20 to-[#FB50B1]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-[#9E065D]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{t.author_name}</p>
                        {t.author_title && (
                          <p className="text-xs text-gray-400 truncate">{t.author_title}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
