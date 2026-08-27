import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { Spot } from '../data/auctionData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sswdjqlouszcyqlshgks.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd2RqcWxvdXN6Y3lxbHNoZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTQ2NDcsImV4cCI6MjEwMzM5MDY0N30.OlWGAS-iXXwuw5pYw4NcaSWD2JTDVHIpH8ZaTmh3F_w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DatabaseSpotRow {
  id: number;
  label: string;
  short_label: string;
  zone: string;
  size: 'S' | 'M' | 'L' | 'XL';
  dimensions: string;
  starting_bid: number;
  current_bid: number;
  bid_count: number;
  top_bidder_brand: string;
  top_bidder_url: string;
  top_bidder_logo: string;
  top_bidder_twitter?: string;
  coords_2d: Spot['coords2d'];
  coords_3d: Spot['coords3d'];
  description: string;
  visibility_note: string;
}

export const SPOT_STARTING_PRICES: Record<number, number> = {
  1: 150, // Top Flap: Upper Left ($150)
  2: 140, // Top Flap: Lower Left ($140)
  3: 200, // Top Flap: Right Side ($200)
  4: 120, // Front Pocket: Top Left ($120)
  5: 120, // Front Pocket: Bottom Right ($120)
  6: 120, // Front Pocket: Top Right ($120)
  7: 120, // Front Pocket: Bottom Left ($120)
};

export function mapRowToSpot(row: DatabaseSpotRow): Spot {
  const baseStartingPrice = SPOT_STARTING_PRICES[row.id] ?? Number(row.starting_bid);
  const currentBid = row.bid_count > 0 ? Math.max(baseStartingPrice, Number(row.current_bid)) : baseStartingPrice;

  return {
    id: row.id,
    label: row.label,
    shortLabel: row.short_label,
    zone: row.zone,
    size: row.size,
    dimensions: row.dimensions,
    startingBid: baseStartingPrice,
    currentBid: currentBid,
    bidCount: row.bid_count,
    topBidder: {
      brand: row.top_bidder_brand,
      url: row.top_bidder_url,
      logo: row.top_bidder_logo || '',
      twitter: row.top_bidder_twitter || undefined,
    },
    coords2d: row.coords_2d,
    coords3d: row.coords_3d,
    description: row.description,
    visibilityNote: row.visibility_note,
    bidsHistory: [],
  };
}

/**
 * Fetch all spots from Supabase
 */
export async function fetchSpotsFromDb(): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching spots from Supabase:', error);
    throw error;
  }

  return (data as DatabaseSpotRow[]).map(mapRowToSpot);
}

/**
 * Place a bid atomically using the Postgres RPC function
 */
export async function placeBidInDb(params: {
  spotId: number;
  brandName: string;
  websiteUrl: string;
  logoUrl?: string;
  amount: number;
  depositAmount: number;
  bidderEmail?: string;
  bidderTwitter?: string;
}) {
  const { data, error } = await supabase.rpc('place_bid', {
    p_spot_id: params.spotId,
    p_brand_name: params.brandName,
    p_website_url: params.websiteUrl,
    p_logo_url: params.logoUrl || '',
    p_amount: params.amount,
    p_deposit_amount: params.depositAmount,
    p_bidder_email: params.bidderEmail || null,
    p_bidder_twitter: params.bidderTwitter || null,
  });

  if (error) {
    console.error('Error executing place_bid RPC:', error);
    throw error;
  }

  return data;
}

/**
 * Submit an email to the waitlist table
 */
export async function submitWaitlistToDb(email: string, twitter?: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([{ email, twitter: twitter || null }])
    .select();

  if (error) {
    console.error('Error submitting to waitlist:', error);
    throw error;
  }

  return data;
}

/**
 * Realtime subscription listener for spots updates
 */
export function subscribeToSpotsRealtime(onUpdate: (updatedSpot: Spot) => void) {
  const channel = supabase
    .channel('public:spots_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'spots',
      },
      (payload) => {
        if (payload.new) {
          const mapped = mapRowToSpot(payload.new as DatabaseSpotRow);
          onUpdate(mapped);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/* =========================================================================
   AUTH HELPERS (X / Twitter OAuth & Email OTP)
   ========================================================================= */

/**
 * Sign in with X / Twitter OAuth
 */
export async function signInWithTwitter() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Error signing in with Twitter:', error);
    throw error;
  }

  return data;
}

/**
 * Sign in with Email Magic Link / OTP
 */
export async function signInWithEmailOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Error sending email OTP:', error);
    throw error;
  }

  return data;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current user profile metadata
 */
export function getUserMetadata(user: User | null) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const twitterUsername = meta.user_name || meta.preferred_username || meta.screen_name || '';
  const avatarUrl = meta.avatar_url || meta.picture || '';
  const email = user.email || meta.email || '';

  return {
    id: user.id,
    email,
    twitterUsername,
    avatarUrl,
    displayName: meta.full_name || meta.name || twitterUsername || email.split('@')[0],
  };
}
