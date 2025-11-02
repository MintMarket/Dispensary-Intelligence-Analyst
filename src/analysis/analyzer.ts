/**
 * Data Analysis Module
 * Analyzes competitive intelligence data and generates insights
 */

import {
  Observation,
  SearchResult,
  Event,
  PlaceRating,
  PricingGap,
  CompetitorPromo,
  EventInsight,
  RatingDelta,
  VarietyGap,
  VendorOpportunity,
} from '../types';

export class DataAnalyzer {
  /**
   * Extract competitor promos from search results and observations
   */
  extractCompetitorPromos(
    searchResults: SearchResult[],
    observations: Observation[]
  ): CompetitorPromo[] {
    const promos: CompetitorPromo[] = [];

    // Extract from search results
    for (const result of searchResults) {
      const promo = this.parsePromoFromSearchResult(result);
      if (promo) {
        promos.push(promo);
      }
    }

    // Extract from observations
    for (const obs of observations) {
      if (obs.type === 'promo' && obs.discount) {
        promos.push({
          competitor: obs.competitor,
          title: obs.notes || `${obs.product || 'Products'} Sale`,
          discount: obs.discount,
          details: this.buildPromoDetails(obs),
          startDate: obs.start_date,
          endDate: obs.end_date,
          source: obs.source_url || 'Internal Observation',
          url: obs.source_url,
        });
      }
    }

    return promos;
  }

  /**
   * Parse promo information from search result
   */
  private parsePromoFromSearchResult(result: SearchResult): CompetitorPromo | null {
    const text = `${result.title} ${result.snippet}`.toLowerCase();

    // Extract discount percentage
    const discountMatch = text.match(/(\d+)%\s*off/);
    if (!discountMatch) {
      return null;
    }

    const discount = parseInt(discountMatch[1], 10);

    // Try to identify competitor from title or source
    const competitor = result.source || this.extractCompetitorName(result.title);

    return {
      competitor,
      title: result.title,
      discount,
      details: result.snippet,
      source: result.source || 'Web Search',
      url: result.url,
    };
  }

  /**
   * Extract competitor name from text
   */
  private extractCompetitorName(text: string): string {
    // Simple heuristic: take first part before dash or hyphen
    const match = text.match(/^([^-–—]+)/);
    return match ? match[1].trim() : 'Unknown Competitor';
  }

  /**
   * Build promo details from observation
   */
  private buildPromoDetails(obs: Observation): string {
    const parts: string[] = [];

    if (obs.discount) {
      parts.push(`${obs.discount}% off`);
    }
    if (obs.product) {
      parts.push(obs.product);
    }
    if (obs.brand) {
      parts.push(`(${obs.brand})`);
    }
    if (obs.notes) {
      parts.push(`- ${obs.notes}`);
    }

    return parts.join(' ');
  }

  /**
   * Identify pricing gaps from observations
   */
  identifyPricingGaps(
    observations: Observation[],
    ourPricing?: Map<string, number>
  ): PricingGap[] {
    const gaps: PricingGap[] = [];
    const pricingObs = observations.filter((o) => o.type === 'pricing' && o.price);

    for (const obs of pricingObs) {
      const productKey = this.buildProductKey(obs);
      const ourPrice = ourPricing?.get(productKey);

      if (ourPrice && obs.price! < ourPrice) {
        const disadvantagePercent = ((ourPrice - obs.price!) / obs.price!) * 100;

        gaps.push({
          product: obs.product || 'Unknown Product',
          brand: obs.brand,
          size: obs.size,
          ourPrice,
          competitorPrice: obs.price!,
          competitor: obs.competitor,
          disadvantagePercent,
          source: obs.source_url,
        });
      } else if (!ourPrice && obs.price) {
        // We don't have this product - potential opportunity
        gaps.push({
          product: obs.product || 'Unknown Product',
          brand: obs.brand,
          size: obs.size,
          ourPrice: undefined,
          competitorPrice: obs.price!,
          competitor: obs.competitor,
          disadvantagePercent: 100, // Maximum gap when we don't have the product
          source: obs.source_url,
        });
      }
    }

    return gaps.sort((a, b) => b.disadvantagePercent - a.disadvantagePercent);
  }

  /**
   * Build product key for matching
   */
  private buildProductKey(obs: Observation): string {
    const parts = [obs.brand, obs.product, obs.size].filter(Boolean);
    return parts.join('::').toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Analyze events for proximity and timing
   */
  analyzeEventProximity(events: Event[], _targetLocation?: string): EventInsight[] {
    const now = new Date();
    const insights: EventInsight[] = [];

    for (const event of events) {
      const eventDate = new Date(event.start);
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let proximity: 'immediate' | 'near' | 'upcoming';
      if (daysUntil <= 7) {
        proximity = 'immediate';
      } else if (daysUntil <= 14) {
        proximity = 'near';
      } else {
        proximity = 'upcoming';
      }

      const insight: EventInsight = {
        event,
        proximity,
        recommendedAction: this.recommendEventAction(event, proximity),
      };

      insights.push(insight);
    }

    return insights.sort((a, b) => {
      const dateA = new Date(a.event.start).getTime();
      const dateB = new Date(b.event.start).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Recommend action based on event proximity
   */
  private recommendEventAction(event: Event, proximity: 'immediate' | 'near' | 'upcoming'): string {
    const eventLower = event.name.toLowerCase();

    if (proximity === 'immediate') {
      if (eventLower.includes('vendor') || eventLower.includes('brand')) {
        return 'Consider coordinating promotional timing or counter-programming';
      }
      if (eventLower.includes('festival') || eventLower.includes('420')) {
        return 'Launch competing promotion or event tie-in';
      }
      return 'Monitor for promotional opportunities';
    } else if (proximity === 'near') {
      return 'Plan promotional response or partnership opportunity';
    } else {
      return 'Note for future planning';
    }
  }

  /**
   * Analyze rating data for competitive position
   */
  analyzeRatings(
    currentRatings: PlaceRating[],
    historicalRatings?: PlaceRating[]
  ): RatingDelta[] {
    const deltas: RatingDelta[] = [];

    for (const current of currentRatings) {
      const historical = historicalRatings?.find((h) => h.name === current.name);

      const delta: RatingDelta = {
        competitor: current.name,
        currentRating: current.rating || 0,
        previousRating: historical?.rating,
        delta: historical?.rating ? (current.rating || 0) - historical.rating : undefined,
        reviewCount: current.userRatingsTotal || 0,
        reviewCountDelta: historical?.userRatingsTotal
          ? (current.userRatingsTotal || 0) - historical.userRatingsTotal
          : undefined,
      };

      deltas.push(delta);
    }

    return deltas.sort((a, b) => b.currentRating - a.currentRating);
  }

  /**
   * Identify variety and brand gaps
   */
  identifyVarietyGaps(observations: Observation[]): VarietyGap[] {
    const brandsByCategory = new Map<string, Set<string>>();
    const productsByCategory = new Map<string, Set<string>>();

    // Aggregate brands and products by category
    for (const obs of observations) {
      const category = this.categorizeProduct(obs.product || '');

      if (obs.brand) {
        if (!brandsByCategory.has(category)) {
          brandsByCategory.set(category, new Set());
        }
        brandsByCategory.get(category)!.add(obs.brand);
      }

      if (obs.product) {
        if (!productsByCategory.has(category)) {
          productsByCategory.set(category, new Set());
        }
        productsByCategory.get(category)!.add(obs.product);
      }
    }

    const gaps: VarietyGap[] = [];

    // Identify gaps (simplified - in production, compare against our inventory)
    for (const [category, brands] of brandsByCategory.entries()) {
      if (brands.size >= 3) {
        gaps.push({
          category,
          missingBrands: Array.from(brands).slice(0, 5),
          trendingProducts: Array.from(productsByCategory.get(category) || []).slice(0, 5),
          opportunity: `${brands.size} brands active in ${category} - consider expanding selection`,
        });
      }
    }

    return gaps;
  }

  /**
   * Categorize product (simplified)
   */
  private categorizeProduct(product: string): string {
    const productLower = product.toLowerCase();

    if (productLower.includes('flower') || productLower.includes('bud')) {
      return 'Flower';
    }
    if (productLower.includes('edible') || productLower.includes('gummies') || productLower.includes('chocolate')) {
      return 'Edibles';
    }
    if (productLower.includes('concentrate') || productLower.includes('wax') || productLower.includes('shatter') || productLower.includes('resin')) {
      return 'Concentrates';
    }
    if (productLower.includes('vape') || productLower.includes('cartridge') || productLower.includes('cart')) {
      return 'Vapes';
    }
    if (productLower.includes('pre-roll') || productLower.includes('joint')) {
      return 'Pre-Rolls';
    }

    return 'Other';
  }

  /**
   * Identify vendor partnership opportunities
   */
  identifyVendorOpportunities(
    observations: Observation[],
    events: Event[]
  ): VendorOpportunity[] {
    const opportunities: VendorOpportunity[] = [];
    const vendorActivity = new Map<string, number>();

    // Track vendor mentions in observations
    for (const obs of observations) {
      if (obs.brand) {
        vendorActivity.set(obs.brand, (vendorActivity.get(obs.brand) || 0) + 1);
      }
    }

    // Track vendors in events
    for (const event of events) {
      const vendorMatch = event.name.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Vendor|Brand)/i);
      if (vendorMatch) {
        const vendor = vendorMatch[1];
        vendorActivity.set(vendor, (vendorActivity.get(vendor) || 0) + 2); // Events are more significant
      }
    }

    // Create opportunities for top vendors
    const sortedVendors = Array.from(vendorActivity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [vendor, activity] of sortedVendors) {
      const relatedEvents = events.filter((e) => e.name.toLowerCase().includes(vendor.toLowerCase()));

      opportunities.push({
        vendor,
        rationale: `${activity} mentions in competitive intelligence (${relatedEvents.length} events)`,
        relatedEvents: relatedEvents.length > 0 ? relatedEvents : undefined,
        suggestedActivation: relatedEvents.length > 0
          ? 'Coordinate vendor day to compete with nearby events'
          : 'Proactive vendor partnership - brand showing strong market presence',
        priority: activity >= 4 ? 'high' : activity >= 2 ? 'medium' : 'low',
      });
    }

    return opportunities;
  }

  /**
   * Calculate average rating
   */
  calculateAverageRating(ratings: PlaceRating[]): number {
    const validRatings = ratings.filter((r) => r.rating !== undefined);
    if (validRatings.length === 0) {
      return 0;
    }
    const sum = validRatings.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / validRatings.length;
  }
}
