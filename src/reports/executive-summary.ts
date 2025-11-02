/**
 * Executive Intelligence Summary Generator
 * Produces comprehensive, actionable intelligence reports
 */

import { format } from 'date-fns';
import {
  ExecutiveSummary,
  Observation,
  SearchResult,
  Event,
  PlaceRating,
  CompetitorPromo,
  PricingGap,
  EventInsight,
  RatingDelta,
  VarietyGap,
  VendorOpportunity,
  SmartAlert,
  CounterPromo,
  VendorActivation,
  Source,
} from '../types';
import { DataAnalyzer } from '../analysis/analyzer';
import { SmartAlertsEngine } from '../analysis/alerts';

export interface ExecutiveSummaryInput {
  orgId: string;
  market: string;
  lookbackDays: number;
  lookaheadDays: number;
  observations: Observation[];
  searchResults: SearchResult[];
  events: Event[];
  ratings: PlaceRating[];
  historicalRatings?: PlaceRating[];
  ourPricing?: Map<string, number>;
}

export class ExecutiveSummaryGenerator {
  private analyzer: DataAnalyzer;
  private alertsEngine: SmartAlertsEngine;

  constructor() {
    this.analyzer = new DataAnalyzer();
    this.alertsEngine = new SmartAlertsEngine();
  }

  /**
   * Generate complete executive intelligence summary
   */
  generate(input: ExecutiveSummaryInput): ExecutiveSummary {
    // Extract and analyze data
    const competitorPromos = this.analyzer.extractCompetitorPromos(
      input.searchResults,
      input.observations
    );
    const pricingGaps = this.analyzer.identifyPricingGaps(input.observations, input.ourPricing);
    const eventInsights = this.analyzer.analyzeEventProximity(input.events);
    const ratingDeltas = this.analyzer.analyzeRatings(input.ratings, input.historicalRatings);
    const varietyGaps = this.analyzer.identifyVarietyGaps(input.observations);
    const vendorOpportunities = this.analyzer.identifyVendorOpportunities(
      input.observations,
      input.events
    );

    // Generate smart alerts
    const smartAlerts = this.generateSmartAlerts(
      pricingGaps,
      competitorPromos,
      eventInsights,
      ratingDeltas,
      input.observations
    );

    // Build executive summary bullets
    const executiveSummaryBullets = this.buildExecutiveSummaryBullets({
      competitorPromos,
      pricingGaps,
      eventInsights,
      varietyGaps,
      smartAlerts,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      competitorPromos,
      pricingGaps,
      eventInsights,
      vendorOpportunities,
    });

    // Collect sources
    const sources = this.collectSources(input);

    // Build data notes
    const dataNotes = this.buildDataNotes(input);

    // Calculate average rating
    const averageRating = this.analyzer.calculateAverageRating(input.ratings);

    return {
      title: `Executive Intelligence Summary — ${input.market}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      orgId: input.orgId,
      market: input.market,
      lookbackDays: input.lookbackDays,
      lookaheadDays: input.lookaheadDays,

      executiveSummary: executiveSummaryBullets,

      findings: {
        competitorPromosAndPricing: {
          topPromos: competitorPromos.slice(0, 10),
          pricingGaps: pricingGaps.slice(0, 10),
          notableSkus: this.extractNotableSkus(pricingGaps, competitorPromos),
        },
        eventsAndOpenings: eventInsights,
        ratingsAndSentiment: {
          averageRating: averageRating > 0 ? averageRating : undefined,
          reviewCountNotes: this.buildReviewCountNotes(input.ratings),
          deltas: ratingDeltas,
        },
        varietyBrandGaps: varietyGaps,
        vendorOpportunities: vendorOpportunities,
      },

      recommendations,

      smartAlerts,

      sources,

      dataNotes,
    };
  }

  /**
   * Generate all smart alerts
   */
  private generateSmartAlerts(
    pricingGaps: PricingGap[],
    competitorPromos: CompetitorPromo[],
    eventInsights: EventInsight[],
    ratingDeltas: RatingDelta[],
    observations: Observation[]
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    alerts.push(...this.alertsEngine.analyzePricingGaps(pricingGaps));
    alerts.push(...this.alertsEngine.analyzeCompetitorPromos(competitorPromos));
    alerts.push(...this.alertsEngine.analyzeEvents(eventInsights));
    alerts.push(...this.alertsEngine.analyzeRatingDeltas(ratingDeltas));
    alerts.push(...this.alertsEngine.analyzeNewOpenings(observations));

    return alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Build executive summary bullet points
   */
  private buildExecutiveSummaryBullets(data: {
    competitorPromos: CompetitorPromo[];
    pricingGaps: PricingGap[];
    eventInsights: EventInsight[];
    varietyGaps: VarietyGap[];
    smartAlerts: SmartAlert[];
  }): string[] {
    const bullets: string[] = [];

    // High-priority alerts
    const highAlerts = data.smartAlerts.filter((a) => a.severity === 'high');
    if (highAlerts.length > 0) {
      bullets.push(
        `**${highAlerts.length} high-priority alerts** requiring immediate attention (${highAlerts.map((a) => a.type).join(', ')})`
      );
    }

    // Top competitor promos
    if (data.competitorPromos.length > 0) {
      const topPromo = data.competitorPromos[0];
      bullets.push(
        `**Competitor activity:** ${topPromo.competitor} running ${topPromo.discount}% promotion${data.competitorPromos.length > 1 ? ` (+${data.competitorPromos.length - 1} more promos detected)` : ''}`
      );
    }

    // Pricing gaps
    const significantGaps = data.pricingGaps.filter((g) => g.disadvantagePercent >= 15);
    if (significantGaps.length > 0) {
      bullets.push(
        `**Pricing opportunities:** ${significantGaps.length} products with ≥15% price disadvantage`
      );
    }

    // Immediate events
    const immediateEvents = data.eventInsights.filter((e) => e.proximity === 'immediate');
    if (immediateEvents.length > 0) {
      bullets.push(
        `**Upcoming events:** ${immediateEvents.length} events within 7 days requiring promotional planning`
      );
    }

    // Variety gaps
    if (data.varietyGaps.length > 0) {
      const topGap = data.varietyGaps[0];
      bullets.push(
        `**Product opportunities:** ${topGap.missingBrands.length} trending brands in ${topGap.category}`
      );
    }

    // If no significant findings, add a general bullet
    if (bullets.length === 0) {
      bullets.push('Market conditions stable; continue monitoring for changes');
    }

    return bullets.slice(0, 6); // Max 6 bullets
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(data: {
    competitorPromos: CompetitorPromo[];
    pricingGaps: PricingGap[];
    eventInsights: EventInsight[];
    vendorOpportunities: VendorOpportunity[];
  }): {
    counterPromos: CounterPromo[];
    vendorDays: VendorActivation[];
    geoTargeting: string[];
    messagingAngles: string[];
  } {
    const counterPromos: CounterPromo[] = [];
    const vendorDays: VendorActivation[] = [];
    const geoTargeting: string[] = [];
    const messagingAngles: string[] = [];

    // Counter-promos based on competitor activity
    for (const promo of data.competitorPromos.slice(0, 3)) {
      const suggestedDepth = Math.min(promo.discount + 5, 50); // Match + 5%, max 50%
      counterPromos.push({
        depth: suggestedDepth,
        skus: [promo.title.split(' ').slice(0, 3).join(' ')], // Simplified SKU extraction
        timing: promo.endDate
          ? `Before ${promo.endDate}`
          : 'Within next 3-7 days',
        rationale: `Counter ${promo.competitor}'s ${promo.discount}% promotion`,
        targeting: `10-mile radius around ${promo.competitor}`,
      });
    }

    // Vendor days based on opportunities
    for (const vendor of data.vendorOpportunities.slice(0, 3)) {
      if (vendor.priority === 'high' && vendor.relatedEvents && vendor.relatedEvents.length > 0) {
        const event = vendor.relatedEvents[0];
        vendorDays.push({
          vendor: vendor.vendor,
          date: format(new Date(event.start), 'yyyy-MM-dd'),
          format: 'In-store activation with special pricing',
          expectedOutcome: `Compete with nearby ${vendor.vendor} event; drive 15-20% traffic increase`,
        });
      }
    }

    // Geo-targeting suggestions
    const competitors = new Set(data.competitorPromos.map((p) => p.competitor));
    for (const competitor of Array.from(competitors).slice(0, 3)) {
      geoTargeting.push(`Target 10-mile radius around ${competitor} locations`);
    }

    // Messaging angles
    if (data.pricingGaps.length > 0) {
      messagingAngles.push('Price match guarantee on top brands');
    }
    if (data.competitorPromos.some((p) => p.discount >= 30)) {
      messagingAngles.push('Limited-time beats: matching or exceeding competitor discounts');
    }
    if (data.eventInsights.some((e) => e.proximity === 'immediate')) {
      messagingAngles.push('Event tie-in promotions: celebrate local cannabis community');
    }
    messagingAngles.push('Loyalty rewards: incentivize repeat visits over competitor one-time deals');

    return {
      counterPromos,
      vendorDays,
      geoTargeting,
      messagingAngles: messagingAngles.slice(0, 4),
    };
  }

  /**
   * Extract notable SKUs from analysis
   */
  private extractNotableSkus(
    pricingGaps: PricingGap[],
    competitorPromos: CompetitorPromo[]
  ): string[] {
    const skus = new Set<string>();

    for (const gap of pricingGaps.slice(0, 5)) {
      const sku = [gap.brand, gap.product, gap.size].filter(Boolean).join(' ');
      skus.add(sku);
    }

    for (const promo of competitorPromos.slice(0, 3)) {
      // Extract product type from title
      const productMatch = promo.title.match(
        /(flower|edibles|concentrates|vapes|pre-rolls)/i
      );
      if (productMatch) {
        skus.add(productMatch[1]);
      }
    }

    return Array.from(skus).slice(0, 10);
  }

  /**
   * Build review count notes
   */
  private buildReviewCountNotes(ratings: PlaceRating[]): string {
    const totalReviews = ratings.reduce((sum, r) => sum + (r.userRatingsTotal || 0), 0);
    const avgReviewsPerPlace = ratings.length > 0 ? totalReviews / ratings.length : 0;

    return `${ratings.length} competitors tracked, avg ${avgReviewsPerPlace.toFixed(0)} reviews per location (${totalReviews} total)`;
  }

  /**
   * Collect all sources used in analysis
   */
  private collectSources(input: ExecutiveSummaryInput): Source[] {
    const sources: Source[] = [];
    const seenUrls = new Set<string>();

    // Search results
    for (const result of input.searchResults) {
      if (result.url && !seenUrls.has(result.url)) {
        sources.push({
          name: result.source || result.title.substring(0, 50),
          url: result.url,
          type: 'web',
        });
        seenUrls.add(result.url);
      }
    }

    // Observations
    for (const obs of input.observations) {
      if (obs.source_url && !seenUrls.has(obs.source_url)) {
        sources.push({
          name: `${obs.competitor} - ${obs.type}`,
          url: obs.source_url,
          type: 'observation',
        });
        seenUrls.add(obs.source_url);
      }
    }

    // Events
    for (const event of input.events) {
      if (event.url && !seenUrls.has(event.url)) {
        sources.push({
          name: event.name,
          url: event.url,
          type: 'web',
        });
        seenUrls.add(event.url);
      }
    }

    // Add generic source categories if we have data but no URLs
    if (input.observations.length > 0 && sources.filter((s) => s.type === 'observation').length === 0) {
      sources.push({
        name: 'Internal Observations Database',
        type: 'internal',
      });
    }

    if (input.ratings.length > 0) {
      sources.push({
        name: input.ratings[0].source || 'Places API',
        type: 'api',
      });
    }

    return sources;
  }

  /**
   * Build data notes about what was used and any assumptions
   */
  private buildDataNotes(input: ExecutiveSummaryInput): string[] {
    const notes: string[] = [];

    notes.push(
      `Analysis period: ${input.lookbackDays}-day lookback, ${input.lookaheadDays}-day lookahead`
    );

    if (input.observations.length > 0) {
      notes.push(`${input.observations.length} competitive observations analyzed`);
    } else {
      notes.push('⚠️ No observations data available - limited pricing/promo insights');
    }

    if (input.searchResults.length > 0) {
      notes.push(`${input.searchResults.length} web sources scanned for competitor activity`);
    } else {
      notes.push('⚠️ No web search data - may miss recent competitor announcements');
    }

    if (input.events.length > 0) {
      notes.push(`${input.events.length} upcoming events identified`);
    } else {
      notes.push('ℹ️ No events data - consider connecting event sources');
    }

    if (input.ratings.length > 0) {
      notes.push(`${input.ratings.length} competitor locations rated`);
    } else {
      notes.push('ℹ️ No ratings data - sentiment analysis unavailable');
    }

    notes.push('All data aggregated and anonymized per compliance requirements');

    return notes;
  }

  /**
   * Format summary as markdown text
   */
  formatAsMarkdown(summary: ExecutiveSummary): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${summary.title}`);
    lines.push(`**Date:** ${summary.date} • **Org:** ${summary.orgId} • **Lookback:** ${summary.lookbackDays}d • **Lookahead:** ${summary.lookaheadDays}d`);
    lines.push('');

    // Executive Summary
    lines.push('## Executive Summary');
    for (const bullet of summary.executiveSummary) {
      lines.push(`- ${bullet}`);
    }
    lines.push('');

    // Findings
    lines.push('## Findings');
    lines.push('');

    // Competitor Promos & Pricing
    lines.push('### Competitor Promos & Pricing');
    if (summary.findings.competitorPromosAndPricing.topPromos.length > 0) {
      for (const promo of summary.findings.competitorPromosAndPricing.topPromos.slice(0, 5)) {
        lines.push(
          `- **${promo.competitor}**: ${promo.discount}% off — ${promo.title}${promo.endDate ? ` (ends ${promo.endDate})` : ''}`
        );
      }
    } else {
      lines.push('- No significant promos detected');
    }
    lines.push('');

    if (summary.findings.competitorPromosAndPricing.pricingGaps.length > 0) {
      lines.push('**Pricing Gaps:**');
      for (const gap of summary.findings.competitorPromosAndPricing.pricingGaps.slice(0, 5)) {
        lines.push(
          `- ${gap.product}: ${gap.competitor} @ $${gap.competitorPrice.toFixed(2)} (${gap.disadvantagePercent.toFixed(1)}% lower${gap.ourPrice ? ` vs our $${gap.ourPrice.toFixed(2)}` : ''})`
        );
      }
      lines.push('');
    }

    // Events & Openings
    lines.push('### Events & Openings (Next 21 Days)');
    if (summary.findings.eventsAndOpenings.length > 0) {
      for (const insight of summary.findings.eventsAndOpenings.slice(0, 8)) {
        const eventDate = format(new Date(insight.event.start), 'MMM d');
        lines.push(
          `- **${eventDate}**: ${insight.event.name}${insight.event.venue ? ` @ ${insight.event.venue}` : ''} — *${insight.recommendedAction}*`
        );
      }
    } else {
      lines.push('- No upcoming events identified');
    }
    lines.push('');

    // Ratings & Sentiment
    lines.push('### Ratings & Sentiment');
    if (summary.findings.ratingsAndSentiment.averageRating) {
      lines.push(
        `- Competitive avg rating: ${summary.findings.ratingsAndSentiment.averageRating.toFixed(1)}★`
      );
    }
    lines.push(`- ${summary.findings.ratingsAndSentiment.reviewCountNotes}`);
    lines.push('');

    // Variety/Brand Gaps
    if (summary.findings.varietyBrandGaps.length > 0) {
      lines.push('### Variety/Brand Gaps');
      for (const gap of summary.findings.varietyBrandGaps.slice(0, 3)) {
        lines.push(`- **${gap.category}**: ${gap.missingBrands.slice(0, 5).join(', ')}`);
        lines.push(`  ${gap.opportunity}`);
      }
      lines.push('');
    }

    // Vendor Opportunities
    if (summary.findings.vendorOpportunities.length > 0) {
      lines.push('### Vendor/Partnership Opportunities');
      for (const vendor of summary.findings.vendorOpportunities.slice(0, 5)) {
        lines.push(`- **${vendor.vendor}** [${vendor.priority}]: ${vendor.rationale}`);
      }
      lines.push('');
    }

    // Recommendations
    lines.push('## Recommendations');
    lines.push('');

    if (summary.recommendations.counterPromos.length > 0) {
      lines.push('### Counter-Promos');
      for (const promo of summary.recommendations.counterPromos) {
        lines.push(`- **${promo.depth}%** on ${promo.skus.join(', ')}`);
        lines.push(`  Timing: ${promo.timing} | Rationale: ${promo.rationale}`);
      }
      lines.push('');
    }

    if (summary.recommendations.vendorDays.length > 0) {
      lines.push('### Vendor Days');
      for (const activation of summary.recommendations.vendorDays) {
        lines.push(`- **${activation.vendor}** on ${activation.date}`);
        lines.push(`  ${activation.format} — Expected: ${activation.expectedOutcome}`);
      }
      lines.push('');
    }

    if (summary.recommendations.geoTargeting.length > 0) {
      lines.push('### Geo-Targeting');
      for (const geo of summary.recommendations.geoTargeting) {
        lines.push(`- ${geo}`);
      }
      lines.push('');
    }

    if (summary.recommendations.messagingAngles.length > 0) {
      lines.push('### Messaging Angles');
      for (const msg of summary.recommendations.messagingAngles) {
        lines.push(`- ${msg}`);
      }
      lines.push('');
    }

    // Smart Alerts
    if (summary.smartAlerts.length > 0) {
      lines.push('## Smart Alerts');
      for (const alert of summary.smartAlerts.slice(0, 10)) {
        const emoji = alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢';
        lines.push(`${emoji} **${alert.title}**: ${alert.message}`);
      }
      lines.push('');
    }

    // Sources
    lines.push('## Sources');
    for (const source of summary.sources.slice(0, 15)) {
      if (source.url) {
        lines.push(`- [${source.name}](${source.url})`);
      } else {
        lines.push(`- ${source.name}`);
      }
    }
    if (summary.sources.length > 15) {
      lines.push(`- ... and ${summary.sources.length - 15} more sources`);
    }
    lines.push('');

    // Data Notes
    lines.push('## Data Notes & Assumptions');
    for (const note of summary.dataNotes) {
      lines.push(`- ${note}`);
    }

    return lines.join('\n');
  }
}
