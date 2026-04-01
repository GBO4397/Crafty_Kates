// Centralized sponsor data used as fallback across the site
// When the database has logo_url populated, that takes priority.
// This file provides fallback logos, links, and categorization.

import { SPONSORS } from '@/data/imageConfig';

export interface SponsorInfo {
  name: string;
  logo_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  description: string;
  tier: 'gold' | 'silver' | 'bronze';
  category: 'sponsor' | 'nostalgia' | 'heart';
}

// Master sponsor directory — used for fallback data and footer/nostalgia sections
export const sponsorDirectory: SponsorInfo[] = [
  {
    name: 'Classic Burgers',
    logo_url: null,
    website_url: 'https://www.facebook.com/ClassicBurgersRidgecrest/',
    facebook_url: 'https://www.facebook.com/ClassicBurgersRidgecrest/',
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'Title Sponsor & Venue Host',
    tier: 'gold',
    category: 'sponsor',
  },
  {
    name: 'Gary Charlon - State Farm Ridgecrest',
    logo_url: SPONSORS.stateFarm,
    website_url: 'https://www.statefarm.com/agent/us/ca/ridgecrest/gary-charlon-gylbh1ys000',
    facebook_url: null,
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'Like a Good Neighbor',
    tier: 'gold',
    category: 'sponsor',
  },
  {
    name: 'Rods West',
    logo_url: null,
    website_url: 'https://www.facebook.com/profile.php?id=100063605474498',
    facebook_url: 'https://www.facebook.com/profile.php?id=100063605474498',
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'Hot Rod Parts & Accessories',
    tier: 'silver',
    category: 'nostalgia',
  },
  {
    name: 'Cheater Slick Culture',
    logo_url: null,
    website_url: 'https://www.instagram.com/cheaterslickculture/',
    facebook_url: null,
    instagram_url: 'https://www.instagram.com/cheaterslickculture/',
    youtube_url: null,
    tiktok_url: null,
    description: 'Drag Racing Culture & Apparel',
    tier: 'silver',
    category: 'nostalgia',
  },
  {
    name: 'Viking Motorcycle Luggage',
    logo_url: SPONSORS.vikingBags,
    website_url: 'https://www.vikingbags.com/',
    facebook_url: null,
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'Premium Motorcycle Bags & Luggage',
    tier: 'silver',
    category: 'sponsor',
  },
  {
    name: 'Kings of the Sport',
    logo_url: null,
    website_url: null,
    facebook_url: null,
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'Celebrating Racing Legends',
    tier: 'bronze',
    category: 'nostalgia',
  },
  {
    name: 'Isky Racing Cams',
    logo_url: SPONSORS.iskyRacing,
    website_url: 'https://iskycams.com/',
    facebook_url: 'https://www.facebook.com/IskyRacingCams/',
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'The Camfather — Ed Iskenderian',
    tier: 'silver',
    category: 'heart',
  },
  {
    name: 'NITRO SLAMDANCE',
    logo_url: null,
    website_url: 'https://www.instagram.com/nitroslamdance/',
    facebook_url: null,
    instagram_url: 'https://www.instagram.com/nitroslamdance/',
    youtube_url: null,
    tiktok_url: null,
    description: 'High-Octane Nostalgia Racing',
    tier: 'bronze',
    category: 'nostalgia',
  },
  {
    name: 'Ridgecrest Animal Shelter',
    logo_url: null,
    website_url: 'https://www.ridgecrest-ca.gov/departments/animal-control',
    facebook_url: null,
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'Saving Lives, One Paw at a Time',
    tier: 'bronze',
    category: 'heart',
  },
  {
    name: 'Almost Eden Rescue',
    logo_url: null,
    website_url: 'https://www.facebook.com/AlmostEdenRescue/',
    facebook_url: 'https://www.facebook.com/AlmostEdenRescue/',
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    description: 'Rescue, Rehabilitate, Rehome',
    tier: 'bronze',
    category: 'heart',
  },
];

// Helper to find a sponsor by name (case-insensitive partial match)
export function findSponsor(name: string): SponsorInfo | undefined {
  const lower = name.toLowerCase().trim();
  return sponsorDirectory.find(s => 
    s.name.toLowerCase() === lower ||
    s.name.toLowerCase().includes(lower) ||
    lower.includes(s.name.toLowerCase())
  );
}

// Get sponsors by category
export function getSponsorsByCategory(category: 'sponsor' | 'nostalgia' | 'heart'): SponsorInfo[] {
  return sponsorDirectory.filter(s => s.category === category);
}

// Get the primary link for a sponsor
export function getSponsorLink(sponsor: SponsorInfo): string | null {
  return sponsor.website_url || sponsor.facebook_url || sponsor.instagram_url || sponsor.youtube_url || sponsor.tiktok_url || null;
}
