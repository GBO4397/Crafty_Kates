// ============================================================
// CENTRALIZED IMAGE CONFIGURATION
// ============================================================
// All images served from the public/images folder via Netlify CDN
// ============================================================

// ----- SITE LOGO -----
export const LOGO = '/images/site/KATES-LOGO-512x512-1-150x150.webp';

// ----- HERO SECTION -----
export const HERO = {
  background: '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg',
  licensePlate: '/images/site/KATES-LOGO-512x512-1-150x150.webp',
};

// ----- ABOUT SECTION -----
export const ABOUT = {
  portrait: '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg',
};

// ----- EVENTS SECTION -----
export const EVENTS = {
  carShow: '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-13.jpeg',
};

// ----- MOTTO SECTION -----
export const MOTTO = {
  background: '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg',
};

// ----- COMMUNITY SECTION -----
export const COMMUNITY = {
  animalShelter: '/images/site/ridgecrest-animal-shelter.jpeg',
  almostEden: '/images/site/almost-eden-rescue.jpeg',
};

// ----- CAR SHOW PAGE -----
export const CAR_SHOW = {
  heroBg: '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg',
  classicCars: '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-4.jpeg',
  registrationHero: '/images/site/IMG_9795.jpeg',
};

// ----- SPONSOR LOGOS -----
export const SPONSORS = {
  stateFarm: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/State-farm-insurance-logo.svg/500px-State-farm-insurance-logo.svg.png',
  vikingBags: 'https://www.vikingbags.com/media/logo/stores/1/viking-bags-logo.png',
  iskyRacing: 'https://iskycams.com/wp-content/uploads/2020/07/isky-logo-2020.png',
};

// ----- GALLERY PREVIEW (main page) -----
export const GALLERY_PREVIEW = [
  '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg',
  '/images/gallery/wallin/IMG_9804.jpeg',
  '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg',
  '/images/gallery/wallin/IMG_9800.jpeg',
  '/images/gallery/ben-radatz/2024_03_Classic_Cars_Classic_Burgers-100-3.jpeg',
  '/images/gallery/wallin/IMG_9796.jpeg',
  '/images/site/2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg',
  '/images/gallery/wallin/IMG_9793.jpeg',
  '/images/gallery/wallin/IMG_9790.jpeg',
  '/images/gallery/ben-radatz/2024_03_Classic_Cars_Classic_Burgers-100-64.jpeg',
  '/images/gallery/wallin/IMG_9785.jpeg',
];

// ----- BEN RADATZ GALLERY -----
const BEN_RADATZ_FILENAMES = [
  '2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-13.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-6.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-5.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-4.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-3.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-2.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg',
  '2024_03_Classic_Cars_Classic_Burgers-100-64.jpeg',
];

export const BEN_RADATZ_GALLERY = BEN_RADATZ_FILENAMES.map(filename => ({
  src: `/images/gallery/ben-radatz/${filename}`,
  thumb: `/images/gallery/ben-radatz/${filename}`,
}));

// ----- K. MIKAEL WALLIN GALLERY -----
const WALLIN_FILENAMES = [
  'IMG_9804.jpeg',
  'IMG_9803.jpeg',
  'IMG_9802.jpeg',
  'IMG_9801.jpeg',
  'IMG_9800.jpeg',
  'IMG_9799.jpeg',
  'IMG_9798.jpeg',
  'IMG_9797.jpeg',
  'IMG_9796.jpeg',
  'IMG_9795.jpeg',
  'IMG_9794.jpeg',
  'IMG_9793.jpeg',
  'IMG_9792.jpeg',
  'IMG_9791.jpeg',
  'IMG_9790.jpeg',
  'IMG_9789.jpeg',
  'IMG_9788.jpeg',
  'IMG_9787.jpeg',
  'IMG_9786.jpeg',
  'IMG_9785.jpeg',
  'IMG_9784.jpeg',
  'IMG_9782.jpeg',
];

export const WALLIN_GALLERY = WALLIN_FILENAMES.map(filename => ({
  src: `/images/gallery/wallin/${filename}`,
  thumb: `/images/gallery/wallin/${filename}`,
}));
