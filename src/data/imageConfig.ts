// ============================================================
// CENTRALIZED IMAGE CONFIGURATION
// ============================================================
// All images served from the original WordPress media library.
// These URLs are the fallback when the database (site_images table)
// doesn't have an uploaded replacement.
//
// WordPress base: https://craftykates.com/wp-content/uploads/2025/12/
// ============================================================

const WP = 'https://craftykates.com/wp-content/uploads/2025/12';

// ----- SITE LOGO -----
export const LOGO = `${WP}/KATES-LOGO-512x512-1-150x150.webp`;

// ----- HERO SECTION -----
export const HERO = {
  background: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg`,
  licensePlate: `${WP}/KATES-LOGO-512x512-1-150x150.webp`,
};

// ----- ABOUT SECTION -----
export const ABOUT = {
  portrait: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg`,
};

// ----- EVENTS SECTION -----
export const EVENTS = {
  carShow: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-13.jpeg`,
};

// ----- MOTTO SECTION -----
export const MOTTO = {
  background: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg`,
};

// ----- COMMUNITY SECTION -----
export const COMMUNITY = {
  animalShelter: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-6.jpeg`,
  almostEden: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-5.jpeg`,
};

// ----- CAR SHOW PAGE -----
export const CAR_SHOW = {
  heroBg: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg`,
  classicCars: `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-4.jpeg`,
  registrationHero: `${WP}/IMG_9795.jpeg`,
};

// ----- SPONSOR LOGOS -----
// These use external URLs from the sponsor's own sites
export const SPONSORS = {
  stateFarm: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/State-farm-insurance-logo.svg/500px-State-farm-insurance-logo.svg.png',
  vikingBags: 'https://www.vikingbags.com/media/logo/stores/1/viking-bags-logo.png',
  iskyRacing: 'https://iskycams.com/wp-content/uploads/2020/07/isky-logo-2020.png',
};

// ----- GALLERY PREVIEW (main page) -----
// Mix of both photographers for the homepage gallery section
export const GALLERY_PREVIEW = [
  `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg`,
  `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-6.jpeg`,
  `${WP}/IMG_9804.jpeg`,
  `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg`,
  `${WP}/IMG_9800.jpeg`,
  `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-3.jpeg`,
  `${WP}/IMG_9796.jpeg`,
  `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-12.jpeg`,
  `${WP}/IMG_9793.jpeg`,
  `${WP}/IMG_9790.jpeg`,
  `${WP}/2024_03_Classic_Cars_Classic_Burgers-100-64.jpeg`,
  `${WP}/IMG_9785.jpeg`,
];

// ----- BEN RADATZ GALLERY -----
// Original filenames from the 2024 Classic Cars Classic Burgers shoot
// NOTE: Files 54-63 were not present on the WordPress server (404) and have been removed
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
  src: `${WP}/${filename}`,
  thumb: `${WP}/${filename}`,
}));

// ----- K. MIKAEL WALLIN GALLERY -----
// Original filenames from the car show shoot
// NOTE: IMG_9783 and IMG_9781 were not present on the WordPress server (404) and have been removed
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
  src: `${WP}/${filename}`,
  thumb: `${WP}/${filename}`,
}));
