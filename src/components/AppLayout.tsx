import React from 'react';
import Navigation from '@/components/crafty/Navigation';
import HeroSection from '@/components/crafty/HeroSection';
import AboutSection from '@/components/crafty/AboutSection';
import MottoSection from '@/components/crafty/MottoSection';
import GallerySection from '@/components/crafty/GallerySection';
import EventsSection from '@/components/crafty/EventsSection';
import PostsSection from '@/components/crafty/PostsSection';
import ColoringBookSection from '@/components/crafty/ColoringBookSection';
import NostalgiaSection from '@/components/crafty/NostalgiaSection';
import CommunitySection from '@/components/crafty/CommunitySection';
import ContactSection from '@/components/crafty/ContactSection';
import Footer from '@/components/crafty/Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <MottoSection />
      <GallerySection />
      <PostsSection />
      <ColoringBookSection />
      <EventsSection />
      <NostalgiaSection />
      <CommunitySection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default AppLayout;

