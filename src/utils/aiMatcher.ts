import { CampusItem, MatchResult, ScoreBreakdown } from '../types/retrivo';

/**
 * Calculates word overlap / Jaccard similarity as a local fallback for text embeddings.
 */
function computeTextSimilarity(textA: string, textB: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) return 0.1;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  const jaccard = intersection / union;

  // Boost for key matches
  return Math.min(1.0, Math.max(0.15, jaccard * 1.8 + 0.35));
}

/**
 * Computes spatial proximity decay on campus (1.0 = same building/exact spot, decays with distance).
 */
function computeLocationScore(itemA: CampusItem, itemB: CampusItem): number {
  if (
    itemA.campus_location.building.toLowerCase() ===
    itemB.campus_location.building.toLowerCase()
  ) {
    // If specific room or area matches, boost further
    const roomA = itemA.campus_location.floor_or_room?.toLowerCase() || '';
    const roomB = itemB.campus_location.floor_or_room?.toLowerCase() || '';
    if (roomA && roomB && (roomA.includes(roomB) || roomB.includes(roomA))) {
      return 0.99;
    }
    return 0.92;
  }

  // If coordinates are present
  if (
    itemA.campus_location.latitude &&
    itemA.campus_location.longitude &&
    itemB.campus_location.latitude &&
    itemB.campus_location.longitude
  ) {
    const dLat = itemA.campus_location.latitude - itemB.campus_location.latitude;
    const dLon = itemA.campus_location.longitude - itemB.campus_location.longitude;
    const distKm = Math.sqrt(dLat * dLat + dLon * dLon) * 111;
    // Campus scale: < 200m is very close, > 1km is farther away
    return Math.max(0.1, Math.exp(-distKm * 2.0));
  }

  return 0.5; // neutral fallback
}

/**
 * Computes temporal proximity decay (exponential decay with delta in hours).
 */
function computeTimeScore(timeA: string, timeB: string): number {
  const tA = new Date(timeA).getTime();
  const tB = new Date(timeB).getTime();
  const diffHours = Math.abs(tA - tB) / (1000 * 60 * 60);

  // e^(-t / 48 hours)
  return Math.max(0.05, Math.exp(-diffHours / 48));
}

/**
 * Computes visual embedding similarity simulation (in production, cosine similarity of CLIP embeddings).
 */
function computeImageScore(itemA: CampusItem, itemB: CampusItem, categoryMatch: boolean): number {
  if (!itemA.image_url || !itemB.image_url) {
    return categoryMatch ? 0.75 : 0.4;
  }
  // Category match with both images available simulates strong visual embedding correlation
  return categoryMatch ? 0.93 : 0.55;
}

/**
 * Core RETRIVO Multimodal AI Matching Function:
 * Weights:
 * - Text Similarity: 35%
 * - Visual/Image Similarity: 40%
 * - Location Proximity: 15%
 * - Time Proximity: 10%
 *
 * Final Score: 0.0 to 10.0 scale.
 */
export function computeMultimodalMatch(
  lostItem: CampusItem,
  foundItem: CampusItem
): MatchResult {
  const isCategoryMatch = lostItem.category === foundItem.category;

  const textScore = computeTextSimilarity(
    `${lostItem.title} ${lostItem.description}`,
    `${foundItem.title} ${foundItem.description}`
  );

  const imageScore = computeImageScore(lostItem, foundItem, isCategoryMatch);
  const locationScore = computeLocationScore(lostItem, foundItem);
  const timeScore = computeTimeScore(lostItem.timestamp, foundItem.timestamp);

  // Composite weighted score (0.0 to 1.0)
  const compositeScore =
    textScore * 0.35 +
    imageScore * 0.40 +
    locationScore * 0.15 +
    timeScore * 0.10;

  // Scale to 0.0 - 10.0 with 1 decimal place
  const matchScore = Math.round(compositeScore * 100) / 10;

  let recommendedAction: MatchResult['recommended_action'] = 'low_confidence';
  if (matchScore >= 8.5) {
    recommendedAction = 'notify_owner';
  } else if (matchScore >= 6.0) {
    recommendedAction = 'manual_review';
  }

  const breakdown: ScoreBreakdown = {
    text_score: Math.round(textScore * 100) / 100,
    image_score: Math.round(imageScore * 100) / 100,
    location_score: Math.round(locationScore * 100) / 100,
    time_score: Math.round(timeScore * 100) / 100,
  };

  return {
    lost_item_id: lostItem.id,
    found_item_id: foundItem.id,
    match_score: matchScore,
    breakdown,
    recommended_action: recommendedAction,
    matched_at: new Date().toISOString(),
    lost_item: lostItem,
    found_item: foundItem,
  };
}

/**
 * Cross-evaluates a new or existing item against all complement items
 * (lost vs all found, or found vs all lost).
 */
export function findMatchesForItem(
  targetItem: CampusItem,
  allItems: CampusItem[]
): MatchResult[] {
  const complementType = targetItem.type === 'lost' ? 'found' : 'lost';
  const candidates = allItems.filter(
    (item) => item.type === complementType && item.status !== 'returned'
  );

  const results: MatchResult[] = [];
  for (const candidate of candidates) {
    const lost = targetItem.type === 'lost' ? targetItem : candidate;
    const found = targetItem.type === 'found' ? targetItem : candidate;
    const match = computeMultimodalMatch(lost, found);

    // Only surface matches with a plausible threshold (> 4.5 / 10.0)
    if (match.match_score >= 4.5) {
      results.push(match);
    }
  }

  // Sort descending by highest match score
  return results.sort((a, b) => b.match_score - a.match_score);
}

