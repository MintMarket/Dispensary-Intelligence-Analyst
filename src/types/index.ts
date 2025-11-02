/**
 * Dispensary Intelligence Analyst - Type Definitions
 * Professional competitive intelligence types for cannabis dispensaries
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface Organization {
  orgId: string;
  name: string;
  primaryMarket?: string;
  markets?: string[];
  timezone?: string;
}

export interface Market {
  name: string;
  state: string;
  primaryCity: string;
  radius?: number; // miles
  timezone?: string;
}

// ============================================================================
// Tool Input/Output Types
// ============================================================================

export interface SearchCompetitorsArgs {
  orgId: string;
  market: string;
  query: string;
  days?: number; // default 14
  limit?: number; // default 25
}

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  publishedAt?: string; // ISO 8601
  source?: string;
}

export interface SearchCompetitorsResponse {
  results: SearchResult[];
}

export interface FetchEventsArgs {
  orgId: string;
  location: string;
  daysAhead?: number; // default 21
  q?: string; // default "cannabis OR dispensary"
}

export interface Event {
  name: string;
  start: string; // ISO 8601
  end?: string; // ISO 8601
  venue?: string;
  address?: string;
  url?: string;
  source?: string;
}

export interface FetchEventsResponse {
  events: Event[];
}

export interface GetPlacesRatingsArgs {
  orgId: string;
  location: string;
  radiusMiles?: number; // default 10
  keywords?: string;
}

export interface PlaceRating {
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  address?: string;
  placeId?: string;
  source?: string;
}

export interface GetPlacesRatingsResponse {
  places: PlaceRating[];
}

export interface ListObservationsArgs {
  orgId: string;
  market: string;
  sinceDays?: number; // default 14
}

export interface Observation {
  timestamp: string; // ISO 8601
  type: 'promo' | 'pricing' | 'product' | 'event' | 'opening' | 'other';
  market: string;
  competitor: string;
  brand?: string;
  product?: string;
  size?: string;
  potency?: string;
  price?: number;
  discount?: number; // percentage
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
  store?: string;
  source_url?: string;
  notes?: string;
}

export interface ListObservationsResponse {
  observations: Observation[];
}

export interface ListFutureEventsArgs {
  orgId: string;
  market: string;
  daysAhead?: number; // default 21
}

export interface ListFutureEventsResponse {
  events: Event[];
}

export interface GenerateExecSummaryArgs {
  orgId: string;
  market: string;
  lookbackDays?: number; // default 14
  lookaheadDays?: number; // default 21
  includeEvents?: boolean; // default true
  includeRatings?: boolean; // default true
}

export interface GenerateExecSummaryResponse {
  summary: ExecutiveSummary;
  observations: Observation[];
  futureEvents: Event[];
  ratings: PlaceRating[];
}

// ============================================================================
// Analysis & Insights Types
// ============================================================================

export interface PricingGap {
  product: string;
  brand?: string;
  size?: string;
  ourPrice?: number;
  competitorPrice: number;
  competitor: string;
  disadvantagePercent: number;
  source?: string;
}

export interface CompetitorPromo {
  competitor: string;
  title: string;
  discount: number; // percentage
  details: string;
  startDate?: string;
  endDate?: string;
  source: string;
  url?: string;
}

export interface EventInsight {
  event: Event;
  proximity: 'immediate' | 'near' | 'upcoming'; // ≤7d, ≤14d, ≤21d
  distanceMiles?: number;
  recommendedAction?: string;
}

export interface RatingDelta {
  competitor: string;
  currentRating: number;
  previousRating?: number;
  delta?: number;
  reviewCount: number;
  reviewCountDelta?: number;
}

export interface VarietyGap {
  category: string;
  missingBrands: string[];
  trendingProducts: string[];
  opportunity: string;
}

export interface VendorOpportunity {
  vendor: string;
  rationale: string;
  relatedEvents?: Event[];
  suggestedActivation?: string;
  priority: 'high' | 'medium' | 'low';
}

// ============================================================================
// Smart Alerts Types
// ============================================================================

export interface AlertThresholds {
  priceDisadvantage: number; // default 10%
  promoDiscount: number; // default 25%
  eventProximityMiles: number; // default 10
  eventProximityDays: number; // default 7
  reviewDelta: number; // default -0.3
}

export interface SmartAlert {
  id: string;
  type: 'price_disadvantage' | 'competitor_promo' | 'event_nearby' | 'review_delta' | 'new_opening';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  context: PricingGap | CompetitorPromo | EventInsight | RatingDelta | Observation;
  timestamp: string; // ISO 8601
  dedupeKey: string;
  actionable: boolean;
}

export interface AlertConfig {
  thresholds: AlertThresholds;
  dedupeWindowHours: number; // default 6
  quietHoursStart: number; // default 22 (10 PM)
  quietHoursEnd: number; // default 7 (7 AM)
  enabled: boolean;
}

// ============================================================================
// Report Types
// ============================================================================

export interface ExecutiveSummary {
  title: string;
  date: string;
  orgId: string;
  market: string;
  lookbackDays: number;
  lookaheadDays: number;

  executiveSummary: string[]; // 3-6 bullet points

  findings: {
    competitorPromosAndPricing: {
      topPromos: CompetitorPromo[];
      pricingGaps: PricingGap[];
      notableSkus: string[];
    };
    eventsAndOpenings: EventInsight[];
    ratingsAndSentiment: {
      averageRating?: number;
      reviewCountNotes: string;
      deltas: RatingDelta[];
    };
    varietyBrandGaps: VarietyGap[];
    vendorOpportunities: VendorOpportunity[];
  };

  recommendations: {
    counterPromos: CounterPromo[];
    vendorDays: VendorActivation[];
    geoTargeting: string[];
    messagingAngles: string[];
  };

  smartAlerts: SmartAlert[];

  sources: Source[];

  dataNotes: string[];
}

export interface CounterPromo {
  depth: number; // percentage
  skus: string[];
  timing: string;
  rationale: string;
  targeting?: string;
}

export interface VendorActivation {
  vendor: string;
  date: string;
  format: string;
  expectedOutcome: string;
}

export interface Source {
  name: string;
  url?: string;
  type: 'web' | 'api' | 'observation' | 'internal';
}

// ============================================================================
// PTL Verification Types
// ============================================================================

export interface PTLItem {
  sku: string;
  brand: string;
  product: string;
  size?: string;
  potency?: string;
  price: number;
  category: string;
}

export interface PublicListing {
  source: 'leafly' | 'weedmaps' | 'mintdeals' | 'other';
  sku?: string;
  brand: string;
  product: string;
  size?: string;
  potency?: string;
  price: number;
  url: string;
  lastSeen: string; // ISO 8601
}

export interface PTLMismatch {
  sku: string;
  ptlPrice: number;
  publicPrice: number;
  priceDelta: number;
  priceDeltaPercent: number;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  publicListing: PublicListing;
}

export interface PTLVerificationReport {
  date: string;
  orgId: string;
  market: string;
  period: string;
  totalItems: number;
  mismatches: PTLMismatch[];
  prioritizedFixes: PTLMismatch[];
  summary: string;
}

// ============================================================================
// Vendor Partnership Tracker Types
// ============================================================================

export interface VendorPartnership {
  vendor: string;
  upcomingEvents: Event[];
  suggestedActivations: VendorActivation[];
  contactRationale: string;
  priority: 'high' | 'medium' | 'low';
  estimatedReach?: number;
}

export interface VendorPartnershipReport {
  date: string;
  market: string;
  city: string;
  partnerships: VendorPartnership[];
  calendar: VendorCalendarEntry[];
}

export interface VendorCalendarEntry {
  date: string;
  vendor: string;
  event?: Event;
  activation?: VendorActivation;
  status: 'planned' | 'confirmed' | 'completed';
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AnalystConfig {
  organization: Organization;
  alertConfig: AlertConfig;
  defaultLookbackDays: number;
  defaultLookaheadDays: number;
  complianceMode: boolean;
  dataRetentionDays: number;
}

// ============================================================================
// Tool Provider Interface
// ============================================================================

export interface ToolProvider {
  searchCompetitors(args: SearchCompetitorsArgs): Promise<SearchCompetitorsResponse>;
  fetchEvents(args: FetchEventsArgs): Promise<FetchEventsResponse>;
  getPlacesRatings(args: GetPlacesRatingsArgs): Promise<GetPlacesRatingsResponse>;
  listObservations(args: ListObservationsArgs): Promise<ListObservationsResponse>;
  listFutureEvents(args: ListFutureEventsArgs): Promise<ListFutureEventsResponse>;
  generateExecSummary?(args: GenerateExecSummaryArgs): Promise<GenerateExecSummaryResponse>;
}
