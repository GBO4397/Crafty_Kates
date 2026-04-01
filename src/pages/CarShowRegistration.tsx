import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Phone, Mail, ChevronLeft, ChevronRight,
  Ticket, Car, Store, ArrowUp, CheckCircle, AlertCircle, Loader2,
  DollarSign, Trophy, FileText, Shield, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { LOGO, CAR_SHOW } from '@/data/imageConfig';


type EntryType = 'vehicle' | 'vendor' | 'cackle';

interface FormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  entryType: EntryType;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vendorName: string;
  vendorSpaceSize: string;
  cackleCarInfo: string;
  liabilityAgreed: boolean;
  photoRelease: boolean;
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  email: '',
  entryType: 'vehicle',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  vendorName: '',
  vendorSpaceSize: '',
  cackleCarInfo: '',
  liabilityAgreed: false,
  photoRelease: false,
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const CarShowRegistration: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.zip.trim()) errs.zip = 'Zip code is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email address';

    if (formData.entryType === 'vehicle') {
      if (!formData.vehicleYear.trim()) errs.vehicleYear = 'Vehicle year is required';
      if (!formData.vehicleMake.trim()) errs.vehicleMake = 'Vehicle make is required';
      if (!formData.vehicleModel.trim()) errs.vehicleModel = 'Vehicle model is required';
    }

    if (formData.entryType === 'vendor') {
      if (!formData.vendorName.trim()) errs.vendorName = 'Vendor name is required';
      if (!formData.vendorSpaceSize.trim()) errs.vendorSpaceSize = 'Space size is required';
    }

    if (formData.entryType === 'cackle') {
      if (!formData.cackleCarInfo.trim()) errs.cackleCarInfo = 'Please provide your cackle car information';
    }

    if (!formData.liabilityAgreed) errs.liabilityAgreed = 'You must agree to the liability release';
    if (!formData.photoRelease) errs.photoRelease = 'You must agree to the photo release';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        email: formData.email.trim(),
        entry_type: formData.entryType,
        liability_agreed: formData.liabilityAgreed,
        photo_release: formData.photoRelease,
      };

      if (formData.entryType === 'vehicle') {
        payload.vehicle_year = formData.vehicleYear.trim();
        payload.vehicle_make = formData.vehicleMake.trim();
        payload.vehicle_model = formData.vehicleModel.trim();
      } else if (formData.entryType === 'vendor') {
        payload.vendor_name = formData.vendorName.trim();
        payload.vendor_space_size = formData.vendorSpaceSize.trim();
      } else if (formData.entryType === 'cackle') {
        payload.cackle_car_info = formData.cackleCarInfo.trim();
      }

      const { error } = await supabase.from('car_show_registrations').insert(payload);
      if (error) throw error;

      setSubmitted(true);
      toast.success('Registration submitted!', {
        description: 'Thank you for registering! We\'ll be in touch with confirmation details.',
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error('Registration failed', {
        description: 'Please try again or contact us directly at craftykates@mail.com',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const entryTypes = [
    {
      id: 'vehicle' as EntryType,
      label: 'Vehicle Entry',
      icon: Car,
      desc: 'Cars, Trucks & Motorcycles',
      fee: '$20 pre-reg / $25 after April 1',
    },
    {
      id: 'vendor' as EntryType,
      label: 'Vendor Entry',
      icon: Store,
      desc: '10\' x 10\' vendor space',
      fee: '$20 before Feb 1 / $25 after',
    },
    {
      id: 'cackle' as EntryType,
      label: 'Cackle Car',
      icon: () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      ),
      desc: 'Free entry for cackle cars',
      fee: 'FREE',
    },
  ];

  const inputClasses = (field: string) =>
    `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] transition-all text-sm`;

  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
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
                to="/car-show"
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200"
              >
                <ChevronLeft size={16} />
                Car Show Details
              </Link>
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all duration-200"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={CAR_SHOW.registrationHero}
            alt="Classic Burger Car Show"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a12]/95 via-[#7D0348]/85 to-[#1a0a12]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/90 via-transparent to-transparent" />
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FB50B1] via-[#9E065D] to-[#FB50B1]" />

        <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-[#FB50B1]/20 border border-[#FB50B1]/30 rounded-full px-5 py-2 mb-6">
            <Ticket size={14} className="text-[#FB50B1]" />
            <span className="text-[#FB50B1] text-sm font-medium">Entry & Vendor Registration</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white leading-[0.9] tracking-wider mb-4">
            REGISTER
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB50B1] to-[#FEE6F4]">YOUR ENTRY</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Classic Burgers: 6th Annual Classic Car, Truck, Motorcycle & Cackle Car Show
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#FB50B1]" />
              <span>April 18, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#FB50B1]" />
              <span>8:00 AM - 3:30 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#FB50B1]" />
              <span>Classic Burgers, Inyokern, CA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Left Sidebar - Info Cards */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            {/* Entry Fees */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-xl text-[#9E065D] tracking-wide">ENTRY FEES</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="p-3 bg-[#FEE6F4]/30 rounded-xl">
                  <p className="font-semibold text-gray-900">Vehicle Entry</p>
                  <p><span className="text-[#9E065D] font-bold">$20.00</span> pre-registration (on or before April 1, 2026)</p>
                  <p><span className="text-gray-900 font-bold">$25.00</span> after April 1, 2026</p>
                </div>
                <div className="p-3 bg-[#FEE6F4]/30 rounded-xl">
                  <p className="font-semibold text-gray-900">Vendor Space</p>
                  <p><span className="text-[#9E065D] font-bold">$20.00</span> per 10' x 10' space (before Feb 1, 2026)</p>
                  <p><span className="text-gray-900 font-bold">$25.00</span> after February 1, 2026</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="font-semibold text-gray-900">Cackle Cars</p>
                  <p className="text-green-700 font-bold">FREE Entry</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-xl text-[#9E065D] tracking-wide">PAYMENT</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-3">
                <p>Make checks payable to:<br /><strong className="text-gray-900">Friends of the Ridgecrest Animal Shelter</strong></p>
                <p>
                  Mail to:<br />
                  <strong className="text-gray-900">Rods West &bull; C/O Crafty Kate</strong><br />
                  703 E. Dolphin<br />
                  Ridgecrest, CA 93555
                </p>
                <p className="text-xs text-gray-500 italic">Or drop the check/cash and entry off at Classic Burgers, or at the show on April 18, 2026.</p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-amber-800 text-xs font-medium">All donations are tax deductible.</p>
                </div>
              </div>
            </div>

            {/* Awards */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-xl text-[#9E065D] tracking-wide">AWARDS</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Each paid entry will be considered for <strong className="text-gray-900">Best of Show</strong> in all categories, including new, vintage, and under-construction vehicles. We had <strong className="text-[#9E065D]">40 awards</strong> given out in 2025!
              </p>
            </div>

            {/* Vendor Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-xl text-[#9E065D] tracking-wide">VENDOR INFO</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>All vendors must donate an item to be raffled off.</p>
                <p className="text-red-600 font-medium">No food trucks or trailers allowed.</p>
                <p>Please contact us with other food items to make sure they are allowed.</p>
                <p className="text-xs text-gray-500 italic">Vendors must load in at 7:00 AM.</p>
              </div>
            </div>

            {/* Become a Sponsor */}
            <div className="bg-gradient-to-br from-[#9E065D] to-[#7D0348] rounded-2xl p-6 text-white">
              <h3 className="font-heading text-xl tracking-wide mb-2">BECOME A SPONSOR</h3>
              <p className="text-white/70 text-sm mb-4">
                Interested in supporting the event? Your sponsorship helps the community and gives your business great exposure.
              </p>
              <Link
                to="/car-show"
                onClick={() => setTimeout(() => {
                  const el = document.getElementById('cs-contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 300)}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
              >
                Learn More
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-xl text-[#9E065D] tracking-wide">QUESTIONS?</h3>
              </div>
              <div className="space-y-3">
                <a href="mailto:craftykates@mail.com" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#9E065D] transition-colors">
                  <Mail size={14} />
                  craftykates@mail.com
                </a>
                <a href="tel:17604131559" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#9E065D] transition-colors">
                  <Phone size={14} />
                  1 (760) 413-1559
                </a>
              </div>
            </div>
          </div>

          {/* Right - Registration Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {submitted ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="font-heading text-4xl text-gray-900 tracking-wide mb-4">REGISTRATION SUBMITTED!</h2>
                <p className="text-gray-600 text-lg mb-2">
                  Thank you for registering for the 2026 Classic Burger Car Show!
                </p>
                <p className="text-gray-500 text-sm mb-8">
                  We'll review your entry and send a confirmation to your email. If you have any questions, don't hesitate to reach out.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => { setSubmitted(false); setFormData(initialFormData); }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg"
                  >
                    <Ticket size={16} />
                    Register Another Entry
                  </button>
                  <Link
                    to="/car-show"
                    className="inline-flex items-center gap-2 border-2 border-[#9E065D] text-[#9E065D] hover:bg-[#9E065D] hover:text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-300"
                  >
                    Back to Car Show
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Entry Type Selection */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-[#9E065D] rounded-lg flex items-center justify-center text-white font-heading text-sm">1</div>
                    <h2 className="font-heading text-2xl text-gray-900 tracking-wide">SELECT ENTRY TYPE</h2>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {entryTypes.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = formData.entryType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => updateField('entryType', type.id)}
                          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 ${
                            isSelected
                              ? 'border-[#9E065D] bg-[#FEE6F4]/30 shadow-md'
                              : 'border-gray-200 bg-white hover:border-[#FB50B1]/40 hover:bg-[#FEE6F4]/10'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-[#9E065D] rounded-full flex items-center justify-center">
                              <CheckCircle size={14} className="text-white" />
                            </div>
                          )}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                            isSelected ? 'bg-gradient-to-br from-[#9E065D] to-[#FB50B1] text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <p className={`font-semibold text-sm mb-1 ${isSelected ? 'text-[#9E065D]' : 'text-gray-900'}`}>{type.label}</p>
                          <p className="text-xs text-gray-500 mb-2">{type.desc}</p>
                          <p className={`text-xs font-bold ${type.id === 'cackle' ? 'text-green-600' : 'text-[#9E065D]'}`}>{type.fee}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-[#9E065D] rounded-lg flex items-center justify-center text-white font-heading text-sm">2</div>
                    <h2 className="font-heading text-2xl text-gray-900 tracking-wide">PERSONAL INFORMATION</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClasses}>Full Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          className={inputClasses('name')}
                          placeholder="Your full name"
                          disabled={submitting}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>Phone *</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className={inputClasses('phone')}
                          placeholder="(555) 555-5555"
                          disabled={submitting}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>Street Address *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        className={inputClasses('address')}
                        placeholder="123 Main Street"
                        disabled={submitting}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                      <div className="col-span-2 sm:col-span-1">
                        <label className={labelClasses}>City *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className={inputClasses('city')}
                          placeholder="City"
                          disabled={submitting}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.city}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>State *</label>
                        <select
                          value={formData.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          className={inputClasses('state')}
                          disabled={submitting}
                        >
                          <option value="">Select</option>
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.state && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.state}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>Zip *</label>
                        <input
                          type="text"
                          value={formData.zip}
                          onChange={(e) => updateField('zip', e.target.value)}
                          className={inputClasses('zip')}
                          placeholder="93555"
                          disabled={submitting}
                        />
                        {errors.zip && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.zip}</p>}
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={inputClasses('email')}
                        placeholder="your@email.com"
                        disabled={submitting}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Entry Details - Conditional */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-[#9E065D] rounded-lg flex items-center justify-center text-white font-heading text-sm">3</div>
                    <h2 className="font-heading text-2xl text-gray-900 tracking-wide">
                      {formData.entryType === 'vehicle' ? 'VEHICLE INFORMATION' :
                       formData.entryType === 'vendor' ? 'VENDOR INFORMATION' :
                       'CACKLE CAR INFORMATION'}
                    </h2>
                  </div>

                  {formData.entryType === 'vehicle' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-800 text-sm">Please provide the year, make, and model of your vehicle, truck, or motorcycle.</p>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-5">
                        <div>
                          <label className={labelClasses}>Year *</label>
                          <input
                            type="text"
                            value={formData.vehicleYear}
                            onChange={(e) => updateField('vehicleYear', e.target.value)}
                            className={inputClasses('vehicleYear')}
                            placeholder="e.g. 1969"
                            disabled={submitting}
                          />
                          {errors.vehicleYear && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.vehicleYear}</p>}
                        </div>
                        <div>
                          <label className={labelClasses}>Make *</label>
                          <input
                            type="text"
                            value={formData.vehicleMake}
                            onChange={(e) => updateField('vehicleMake', e.target.value)}
                            className={inputClasses('vehicleMake')}
                            placeholder="e.g. Chevrolet"
                            disabled={submitting}
                          />
                          {errors.vehicleMake && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.vehicleMake}</p>}
                        </div>
                        <div>
                          <label className={labelClasses}>Model *</label>
                          <input
                            type="text"
                            value={formData.vehicleModel}
                            onChange={(e) => updateField('vehicleModel', e.target.value)}
                            className={inputClasses('vehicleModel')}
                            placeholder="e.g. Camaro SS"
                            disabled={submitting}
                          />
                          {errors.vehicleModel && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.vehicleModel}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.entryType === 'vendor' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-blue-800 text-sm">
                          <p>All vendors must donate an item to be raffled off. No food trucks or trailers allowed.</p>
                          <p className="mt-1">Please contact us with other food items to make sure they are allowed.</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClasses}>Vendor / Business Name *</label>
                          <input
                            type="text"
                            value={formData.vendorName}
                            onChange={(e) => updateField('vendorName', e.target.value)}
                            className={inputClasses('vendorName')}
                            placeholder="Your business name"
                            disabled={submitting}
                          />
                          {errors.vendorName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.vendorName}</p>}
                        </div>
                        <div>
                          <label className={labelClasses}>Space Size Needed *</label>
                          <select
                            value={formData.vendorSpaceSize}
                            onChange={(e) => updateField('vendorSpaceSize', e.target.value)}
                            className={inputClasses('vendorSpaceSize')}
                            disabled={submitting}
                          >
                            <option value="">Select space size</option>
                            <option value="10x10">10' x 10' (1 space)</option>
                            <option value="10x20">10' x 20' (2 spaces)</option>
                            <option value="10x30">10' x 30' (3 spaces)</option>
                            <option value="custom">Custom - Contact us</option>
                          </select>
                          {errors.vendorSpaceSize && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.vendorSpaceSize}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.entryType === 'cackle' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                        <Info size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-green-800 text-sm">Cackle cars are free to enter! Please provide your car's information below.</p>
                      </div>
                      <div>
                        <label className={labelClasses}>Cackle Car Information *</label>
                        <textarea
                          value={formData.cackleCarInfo}
                          onChange={(e) => updateField('cackleCarInfo', e.target.value)}
                          rows={4}
                          className={inputClasses('cackleCarInfo') + ' resize-none'}
                          placeholder="Please describe your cackle car - year, make, model, engine type, and any other relevant details..."
                          disabled={submitting}
                        />
                        {errors.cackleCarInfo && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.cackleCarInfo}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Liability Release */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-[#9E065D] rounded-lg flex items-center justify-center text-white font-heading text-sm">4</div>
                    <h2 className="font-heading text-2xl text-gray-900 tracking-wide">LIABILITY RELEASE</h2>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Shield size={20} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                        <p>
                          The undersigned participant in the <strong>6th Annual Classic Burgers: Classic Car, Truck, Motorcycle, and Cackle Vehicle Show</strong> agrees to release Classic Burgers Vehicle Show, any staff or volunteers of the Classic Burgers Car Show, and any sponsors of said event from any and all liability arising from this event.
                        </p>
                        <p>
                          Participant also agrees to allow Classic Burgers and show sponsors to use any photographs or information obtained prior to or during the show for promotional purposes, including but not limited to social media, print, and web.
                        </p>
                        <p>
                          Participant understands that Classic Burgers Vehicle Show, its staff, volunteers, and sponsors are not responsible for any theft, damage, or loss of personal property during the event.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.liabilityAgreed ? 'border-[#9E065D] bg-[#FEE6F4]/20' : errors.liabilityAgreed ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-[#FB50B1]/40'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.liabilityAgreed}
                        onChange={(e) => updateField('liabilityAgreed', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#9E065D] focus:ring-[#FB50B1] mt-0.5"
                        disabled={submitting}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">I agree to the Liability Release *</p>
                        <p className="text-xs text-gray-500 mt-1">By checking this box, I acknowledge that I have read and agree to the liability release terms above.</p>
                      </div>
                    </label>
                    {errors.liabilityAgreed && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.liabilityAgreed}</p>}

                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.photoRelease ? 'border-[#9E065D] bg-[#FEE6F4]/20' : errors.photoRelease ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-[#FB50B1]/40'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.photoRelease}
                        onChange={(e) => updateField('photoRelease', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#9E065D] focus:ring-[#FB50B1] mt-0.5"
                        disabled={submitting}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">I agree to the Photo Release *</p>
                        <p className="text-xs text-gray-500 mt-1">I authorize the use of photographs taken at the event for promotional purposes.</p>
                      </div>
                    </label>
                    {errors.photoRelease && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.photoRelease}</p>}
                  </div>
                </div>

                {/* Submit */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {formData.entryType === 'vehicle' && 'Vehicle Entry Fee: $20.00 (pre-reg) / $25.00 (after April 1)'}
                        {formData.entryType === 'vendor' && 'Vendor Space Fee: $20.00 (before Feb 1) / $25.00 (after)'}
                        {formData.entryType === 'cackle' && 'Cackle Car Entry: FREE'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Payment can be mailed or dropped off. See payment info for details.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-10 py-4 rounded-xl font-medium text-base transition-all duration-300 shadow-lg shadow-[#9E065D]/20 hover:shadow-[#FB50B1]/30 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Ticket size={18} />
                          Submit Registration
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#1a0a12] to-[#0d050a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={LOGO}
                alt="Crafty Kates Logo"
                className="w-10 h-10 rounded-full"
              />

              <p className="text-white/40 text-sm">Copyright 2026 &copy; Crafty Kates. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Home</Link>
              <Link to="/car-show" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Car Show</Link>
              <Link to="/register" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Register</Link>
              <Link to="/sponsor-admin" className="text-white/40 hover:text-[#FB50B1] text-sm transition-colors">Sponsor Admin</Link>
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

export default CarShowRegistration;
