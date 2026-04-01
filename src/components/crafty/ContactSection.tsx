import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, MapPin, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const ContactSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email address';
    if (!formData.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject || null,
        message: formData.message.trim(),
      });

      if (error) throw error;

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent!', { description: 'Thank you for reaching out. Kate will get back to you soon!' });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err: any) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message', { description: 'Please try again or email craftykates@mail.com directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setNewsletterSubmitting(true);
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast.info('Already subscribed!', { description: "You're already on the list. Stay tuned for updates!" });
          setNewsletterEmail('');
          setNewsletterSubmitted(true);
          setTimeout(() => setNewsletterSubmitted(false), 5000);
          return;
        }
        throw error;
      }

      setNewsletterSubmitted(true);
      setNewsletterEmail('');
      toast.success('Subscribed!', { description: 'Welcome to the Crafty Kate community!' });
      setTimeout(() => setNewsletterSubmitted(false), 6000);
    } catch (err: any) {
      console.error('Newsletter error:', err);
      toast.error('Subscription failed', { description: 'Please try again later.' });
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FEE6F4]/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">Get In Touch</span>
          <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">CONTACT CRAFTY KATE</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full" />
        </div>

        <div className={`grid lg:grid-cols-5 gap-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-heading text-2xl text-[#9E065D] tracking-wide mb-4">READY TO FOLLOW CRAFTY KATE?</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Whether you're a classic car enthusiast, potential sponsor, or compassionate supporter — stay up to date by following Crafty Kate on social media or reach out directly.
              </p>
            </div>

            <div className="space-y-4">
              <a href="tel:17604131559" className="flex items-center gap-4 p-4 bg-[#FEE6F4]/40 rounded-xl hover:bg-[#FEE6F4] transition-colors group">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Phone</p>
                  <p className="text-gray-900 font-medium group-hover:text-[#9E065D] transition-colors">1 (760) 413-1559</p>
                </div>
              </a>

              <a href="mailto:craftykates@mail.com" className="flex items-center gap-4 p-4 bg-[#FEE6F4]/40 rounded-xl hover:bg-[#FEE6F4] transition-colors group">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Email</p>
                  <p className="text-gray-900 font-medium group-hover:text-[#9E065D] transition-colors">craftykates@mail.com</p>
                </div>
              </a>

              <a
                href="https://maps.google.com/?q=703+E+Dolphin+Ridgecrest+CA+93555"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#FEE6F4]/40 rounded-xl hover:bg-[#FEE6F4] transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Address</p>
                  <p className="text-gray-900 font-medium group-hover:text-[#9E065D] transition-colors">703 E Dolphin, Ridgecrest CA 93555</p>
                </div>
              </a>
            </div>

            {/* Social */}
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { label: 'Facebook', url: 'https://www.facebook.com/craftykatespromotions', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { label: 'Instagram', url: 'https://www.instagram.com/craftykatespromotions', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                  { label: 'YouTube', url: 'https://www.youtube.com/@craftykatespromotions', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                  { label: 'TikTok', url: '#', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-[#FEE6F4] text-[#9E065D] rounded-xl flex items-center justify-center hover:bg-[#9E065D] hover:text-white transition-all duration-300"
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              {submitted ? (
                <div className="text-center py-12 animate-fade-in">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-heading text-2xl text-gray-900 tracking-wide mb-2">MESSAGE SENT!</h3>
                  <p className="text-gray-600">Thank you for reaching out. Kate will get back to you soon!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] transition-all text-sm`}
                        placeholder="Your name"
                        disabled={submitting}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] transition-all text-sm`}
                        placeholder="your@email.com"
                        disabled={submitting}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] transition-all text-sm bg-white"
                      disabled={submitting}
                    >
                      <option value="">Select a subject...</option>
                      <option value="general">General Inquiry</option>
                      <option value="carshow">Car Show Registration</option>
                      <option value="sponsor">Become a Sponsor</option>
                      <option value="media">Media / Press</option>

                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => { setFormData({ ...formData, message: e.target.value }); setErrors({ ...errors, message: '' }); }}
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] transition-all text-sm resize-none`}
                      placeholder="Tell Kate what's on your mind..."
                      disabled={submitting}
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-8 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-[#9E065D]/20 hover:shadow-[#FB50B1]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Newsletter */}
            <div className="mt-8 bg-gradient-to-r from-[#9E065D] to-[#7D0348] rounded-2xl p-8 text-white">
              <h3 className="font-heading text-2xl tracking-wide mb-2">STAY IN THE LOOP</h3>
              <p className="text-white/70 text-sm mb-5">Get updates on upcoming events, car shows, and community news delivered to your inbox.</p>
              {newsletterSubmitted ? (
                <div className="flex items-center gap-2 text-[#FEE6F4] animate-fade-in">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">You're subscribed! Welcome to the community.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/50 focus:border-[#FB50B1] text-sm"
                    required
                    disabled={newsletterSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="px-6 py-3 bg-[#FB50B1] hover:bg-[#FEE6F4] hover:text-[#9E065D] text-white rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {newsletterSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
