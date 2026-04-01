import React from 'react';
import PhotographerGallery from '@/components/crafty/PhotographerGallery';
import { benRadatzImages } from '@/data/galleryData';

const GalleryBenRadatz: React.FC = () => {
  return <PhotographerGallery photographer="Ben Radatz" images={benRadatzImages} />;
};

export default GalleryBenRadatz;
