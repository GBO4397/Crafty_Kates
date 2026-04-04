// Centralized sponsor data
// All sponsor data is now managed through the Admin Dashboard and Supabase database.
// This file is kept for type definitions and helper functions only.

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

// Empty — all sponsors managed through Admin Dashboard
export const sponsorDirectory: SponsorInfo[] = [];

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
