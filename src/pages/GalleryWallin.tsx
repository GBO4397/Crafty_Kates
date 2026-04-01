import React from 'react';
import PhotographerGallery from '@/components/crafty/PhotographerGallery';
import { wallinImages } from '@/data/galleryData';

const GalleryWallin: React.FC = () => {
  return <PhotographerGallery photographer="K. Mikael Wallin" images={wallinImages} />;
};

export default GalleryWallin;
