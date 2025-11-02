/**
 * Dispensary Intelligence Analyst
 * Main orchestration class for competitive intelligence, analytics, and deal verification
 */

import { config as loadEnv } from 'dotenv';
import {
  ToolProvider,
  AnalystConfig,
  ExecutiveSummary,
  PTLVerificationReport,
  VendorPartnershipReport,
} from './types';
import { MockToolProvider } from './tools';
import {
  ExecutiveSummaryGenerator,
  ExecutiveSummaryInput,
  PTLVerificationGenerator,
  PTLVerificationInput,
  VendorPartnershipTracker,
  VendorPartnershipInput,
} from './reports';

loadEnv();

const DEFAULT_CONFIG: AnalystConfig = {
  organization: {
    orgId: process.env.DEFAULT_ORG_ID || 'default-org',
    name: 'Default Organization',
    primaryMarket: process.env.DEFAULT_MARKET || 'Arizona',
  },
  alertConfig: {
    thresholds: {
      priceDisadvantage: parseFloat(process.env.ALERT_PRICE_DISADVANTAGE_THRESHOLD || '10'),
      promoDiscount: parseFloat(process.env.ALERT_PROMO_DISCOUNT_THRESHOLD || '25'),
      eventProximityMiles: parseFloat(process.env.ALERT_EVENT_PROXIMITY_MILES || '10'),
      eventProximityDays: parseFloat(process.env.ALERT_EVENT_PROXIMITY_DAYS || '7'),
      reviewDelta: parseFloat(process.env.ALERT_REVIEW_DELTA_THRESHOLD || '-0.3'),
    },
    dedupeWindowHours: parseFloat(process.env.ALERT_DEDUPE_WINDOW_HOURS || '6'),
    quietHoursStart: parseFloat(process.env.ALERT_QUIET_START_HOUR || '22'),
    quietHoursEnd: parseFloat(process.env.ALERT_QUIET_END_HOUR || '7'),
    enabled: true,
  },
  defaultLookbackDays: parseFloat(process.env.DEFAULT_LOOKBACK_DAYS || '14'),
  defaultLookaheadDays: parseFloat(process.env.DEFAULT_LOOKAHEAD_DAYS || '21'),
  complianceMode: true,
  dataRetentionDays: 90,
};

export class DispensaryIntelligenceAnalyst {
  private config: AnalystConfig;
  private toolProvider: ToolProvider;
  private execSummaryGenerator: ExecutiveSummaryGenerator;
  private ptlVerificationGenerator: PTLVerificationGenerator;
  private vendorPartnershipTracker: VendorPartnershipTracker;

  constructor(toolProvider?: ToolProvider, config?: Partial<AnalystConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.toolProvider = toolProvider || new MockToolProvider(this.config.organization.orgId);
    this.execSummaryGenerator = new ExecutiveSummaryGenerator();
    this.ptlVerificationGenerator = new PTLVerificationGenerator();
    this.vendorPartnershipTracker = new VendorPartnershipTracker();
  }

  /**
   * Generate Executive Intelligence Summary
   * Main entry point for competitive intelligence analysis
   */
  async generateExecutiveSummary(params: {
    market?: string;
    lookbackDays?: number;
    lookaheadDays?: number;
    includeEvents?: boolean;
    includeRatings?: boolean;
    ourPricing?: Map<string, number>;
  }): Promise<ExecutiveSummary> {
    const market = params.market || this.config.organization.primaryMarket || 'Arizona';
    const lookbackDays = params.lookbackDays || this.config.defaultLookbackDays;
    const lookaheadDays = params.lookaheadDays || this.config.defaultLookaheadDays;
    const includeEvents = params.includeEvents !== false;
    const includeRatings = params.includeRatings !== false;

    this.log(`Generating executive summary for ${market}...`);

    // Gather data from all available tools
    const [observations, searchResults, events, futureEvents, ratings] = await Promise.all([
      this.toolProvider
        .listObservations({
          orgId: this.config.organization.orgId,
          market,
          sinceDays: lookbackDays,
        })
        .catch(() => ({ observations: [] })),

      this.toolProvider
        .searchCompetitors({
          orgId: this.config.organization.orgId,
          market,
          query: '(% off OR sale OR vendor day OR grand opening OR BOGO OR happy hour OR bundle)',
          days: lookbackDays,
        })
        .catch(() => ({ results: [] })),

      includeEvents
        ? this.toolProvider
            .fetchEvents({
              orgId: this.config.organization.orgId,
              location: this.extractPrimaryCity(market),
              daysAhead: lookaheadDays,
            })
            .catch(() => ({ events: [] }))
        : Promise.resolve({ events: [] }),

      includeEvents
        ? this.toolProvider
            .listFutureEvents({
              orgId: this.config.organization.orgId,
              market,
              daysAhead: lookaheadDays,
            })
            .catch(() => ({ events: [] }))
        : Promise.resolve({ events: [] }),

      includeRatings
        ? this.toolProvider
            .getPlacesRatings({
              orgId: this.config.organization.orgId,
              location: this.extractPrimaryCity(market),
              radiusMiles: 10,
            })
            .catch(() => ({ places: [] }))
        : Promise.resolve({ places: [] }),
    ]);

    // Merge events from multiple sources
    const allEvents = [...events.events, ...futureEvents.events];

    this.log(
      `Gathered data: ${observations.observations.length} observations, ${searchResults.results.length} search results, ${allEvents.length} events, ${ratings.places.length} ratings`
    );

    // Generate summary
    const input: ExecutiveSummaryInput = {
      orgId: this.config.organization.orgId,
      market,
      lookbackDays,
      lookaheadDays,
      observations: observations.observations,
      searchResults: searchResults.results,
      events: allEvents,
      ratings: ratings.places,
      ourPricing: params.ourPricing,
    };

    const summary = this.execSummaryGenerator.generate(input);

    this.log(`Executive summary generated: ${summary.smartAlerts.length} alerts`);

    return summary;
  }

  /**
   * Generate PTL Verification Report
   */
  async generatePTLVerification(input: PTLVerificationInput): Promise<PTLVerificationReport> {
    this.log(`Generating PTL verification for ${input.market}...`);
    const report = this.ptlVerificationGenerator.generate(input);
    this.log(`PTL verification complete: ${report.mismatches.length} mismatches found`);
    return report;
  }

  /**
   * Generate Vendor Partnership Tracker
   */
  async generateVendorPartnershipTracker(params: {
    market?: string;
    city?: string;
    daysAhead?: number;
    existingPartnerships?: string[];
  }): Promise<VendorPartnershipReport> {
    const market = params.market || this.config.organization.primaryMarket || 'Arizona';
    const city = params.city || this.extractPrimaryCity(market);
    const daysAhead = params.daysAhead || this.config.defaultLookaheadDays;

    this.log(`Generating vendor partnership tracker for ${market}/${city}...`);

    // Gather data
    const [observations, events, futureEvents] = await Promise.all([
      this.toolProvider
        .listObservations({
          orgId: this.config.organization.orgId,
          market,
          sinceDays: this.config.defaultLookbackDays,
        })
        .catch(() => ({ observations: [] })),

      this.toolProvider
        .fetchEvents({
          orgId: this.config.organization.orgId,
          location: city,
          daysAhead,
        })
        .catch(() => ({ events: [] })),

      this.toolProvider
        .listFutureEvents({
          orgId: this.config.organization.orgId,
          market,
          daysAhead,
        })
        .catch(() => ({ events: [] })),
    ]);

    const allEvents = [...events.events, ...futureEvents.events];

    const input: VendorPartnershipInput = {
      market,
      city,
      events: allEvents,
      observations: observations.observations,
      existingPartnerships: params.existingPartnerships,
    };

    const report = this.vendorPartnershipTracker.generate(input);

    this.log(
      `Vendor partnership tracker complete: ${report.partnerships.length} partnerships identified`
    );

    return report;
  }

  /**
   * Format Executive Summary as markdown
   */
  formatExecutiveSummaryAsMarkdown(summary: ExecutiveSummary): string {
    return this.execSummaryGenerator.formatAsMarkdown(summary);
  }

  /**
   * Format PTL Verification as markdown
   */
  formatPTLVerificationAsMarkdown(report: PTLVerificationReport): string {
    return this.ptlVerificationGenerator.formatAsMarkdown(report);
  }

  /**
   * Format Vendor Partnership Tracker as markdown
   */
  formatVendorPartnershipAsMarkdown(report: VendorPartnershipReport): string {
    return this.vendorPartnershipTracker.formatAsMarkdown(report);
  }

  /**
   * Get configuration
   */
  getConfig(): AnalystConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnalystConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Extract primary city from market name
   */
  private extractPrimaryCity(market: string): string {
    // Simple heuristic - in production, use a proper mapping
    const cityMap: Record<string, string> = {
      Arizona: 'Phoenix, AZ',
      California: 'Los Angeles, CA',
      Colorado: 'Denver, CO',
      Nevada: 'Las Vegas, NV',
      Michigan: 'Detroit, MI',
      Illinois: 'Chicago, IL',
      Massachusetts: 'Boston, MA',
      Oregon: 'Portland, OR',
      Washington: 'Seattle, WA',
    };

    return cityMap[market] || market;
  }

  /**
   * Log message (respect LOG_LEVEL)
   */
  private log(message: string): void {
    const logLevel = process.env.LOG_LEVEL || 'info';
    if (logLevel === 'info' || logLevel === 'debug') {
      console.log(`[DispensaryIntelligenceAnalyst] ${message}`);
    }
  }
}
