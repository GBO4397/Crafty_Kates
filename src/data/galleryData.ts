import { BEN_RADATZ_GALLERY, WALLIN_GALLERY, GALLERY_PREVIEW } from '@/data/imageConfig';

export interface GalleryImage {
  src: string;
  thumb: string;
}

// Ben Radatz Gallery Images
export const benRadatzImages: GalleryImage[] = BEN_RADATZ_GALLERY;

// K. Mikael Wallin Gallery Images
export const wallinImages: GalleryImage[] = WALLIN_GALLERY;

// Preview images for the main gallery section (mix of both photographers)
export const previewImages = [
  ...benRadatzImages.slice(0, 6),
  ...wallinImages.slice(0, 6),
];
