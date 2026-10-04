export type ItemType = 'lost' | 'found';

export type ItemStatus = 'open' | 'under_verification' | 'returned';

export type ItemCategory =
  | 'electronics'
  | 'identification'
  | 'keys'
  | 'wallets_bags'
  | 'clothing'
  | 'stationery_books'
  | 'accessories'
  | 'other';

export type ClaimStatus = 'pending' | 'verified' | 'rejected';

/**
 * Verified student or staff campus user profile.
 */
export interface UserProfile {
  id: string; // References auth.users.id
  student_id: string; // Campus ID / Roll Number (e.g., STU-2024-8891)
  name: string;
  email: string; // Institutional email (@university.edu)
  avatar_url?: string | null;
  phone_number?: string | null;
  department?: string;
  trust_score?: number; // 0 to 100 reputational confidence rating
  created_at?: string;
  updated_at?: string;
}

/**
 * Structured campus coordinate / venue marker.
 */
export interface CampusLocation {
  building: string; // e.g. "Main Library", "Science Complex B"
  floor_or_room?: string; // e.g. "3rd Floor Study Room 302"
  latitude?: number;
  longitude?: number;
}

/**
 * Core reported asset.
 * Security Note: `hidden_clue` must be protected via Supabase RLS
 * and never exposed in public browse feeds until claim verification.
 */
export interface CampusItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  campus_location: CampusLocation;
  timestamp: string; // ISO 8601 string of incident occurrence
  image_url: string | null;
  hidden_clue: string; // Private anchor (e.g. "Cracked bottom-right corner", "Blue dinosaur keychain")
  status: ItemStatus;
  user_id: string; // Reporter's UserProfile ID
  created_at?: string;
  updated_at?: string;
}

/**
 * Multimodal score breakdown across contextual channels (0.0 to 1.0 each).
 */
export interface ScoreBreakdown {
  text_score: number; // Semantic vector similarity (embeddings)
  image_score: number; // Visual feature similarity (CLIP / multimodal model)
  location_score: number; // Campus proximity decay score
  time_score: number; // Temporal proximity decay score
}

/**
 * AI-computed multimodal match candidate linking a lost item and a found item.
 */
export interface MatchResult {
  lost_item_id: string;
  found_item_id: string;
  match_score: number; // Normalized composite score (0.0 to 10.0)
  breakdown: ScoreBreakdown;
  recommended_action?: 'notify_owner' | 'manual_review' | 'low_confidence';
  matched_at?: string;
  lost_item?: CampusItem;
  found_item?: CampusItem;
}

/**
 * Traceable ownership claim verification and physical handover protocol.
 */
export interface ClaimVerification {
  id: string;
  item_id: string;
  claimant_id: string;
  proof_answer: string; // Claimant's answer attempting to match item.hidden_clue
  status: ClaimStatus;
  handover_code?: string; // One-Time Secure Handover PIN / Token
  handover_confirmed_at?: string | null;
  verified_by_reporter?: boolean;
  item?: CampusItem;
  claimant?: UserProfile;
  created_at?: string;
  updated_at?: string;
}

