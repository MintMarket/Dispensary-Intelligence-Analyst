/**
 * Smart Alerts Engine
 * Detects and manages intelligent alerts based on configurable thresholds
 */

import { createHash } from 'crypto';
import {
  SmartAlert,
  AlertConfig,
  AlertThresholds,
  PricingGap,
  CompetitorPromo,
  EventInsight,
  RatingDelta,
  Observation,
} from '../types';

const DEFAULT_THRESHOLDS: AlertThresholds = {
  priceDisadvantage: parseFloat(process.env.ALERT_PRICE_DISADVANTAGE_THRESHOLD || '10'),
  promoDiscount: parseFloat(process.env.ALERT_PROMO_DISCOUNT_THRESHOLD || '25'),
  eventProximityMiles: parseFloat(process.env.ALERT_EVENT_PROXIMITY_MILES || '10'),
  eventProximityDays: parseFloat(process.env.ALERT_EVENT_PROXIMITY_DAYS || '7'),
  reviewDelta: parseFloat(process.env.ALERT_REVIEW_DELTA_THRESHOLD || '-0.3'),
};

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  thresholds: DEFAULT_THRESHOLDS,
  dedupeWindowHours: parseFloat(process.env.ALERT_DEDUPE_WINDOW_HOURS || '6'),
  quietHoursStart: parseFloat(process.env.ALERT_QUIET_START_HOUR || '22'),
  quietHoursEnd: parseFloat(process.env.ALERT_QUIET_END_HOUR || '7'),
  enabled: true,
};

export class SmartAlertsEngine {
  private config: AlertConfig;
  private alertHistory: Map<string, Date>;

  constructor(config?: Partial<AlertConfig>) {
    this.config = { ...DEFAULT_ALERT_CONFIG, ...config };
    this.alertHistory = new Map();
  }

  /**
   * Analyze pricing gaps and generate alerts
   */
  analyzePricingGaps(gaps: PricingGap[]): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    for (const gap of gaps) {
      if (gap.disadvantagePercent >= this.config.thresholds.priceDisadvantage) {
        const alert = this.createPriceDisadvantageAlert(gap);
        if (this.shouldEmitAlert(alert)) {
          alerts.push(alert);
          this.recordAlert(alert);
        }
      }
    }

    return alerts;
  }

  /**
   * Analyze competitor promos and generate alerts
   */
  analyzeCompetitorPromos(promos: CompetitorPromo[]): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    for (const promo of promos) {
      if (promo.discount >= this.config.thresholds.promoDiscount) {
        const alert = this.createCompetitorPromoAlert(promo);
        if (this.shouldEmitAlert(alert)) {
          alerts.push(alert);
          this.recordAlert(alert);
        }
      }
    }

    return alerts;
  }

  /**
   * Analyze events and generate proximity alerts
   */
  analyzeEvents(events: EventInsight[]): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const now = new Date();

    for (const eventInsight of events) {
      const eventDate = new Date(eventInsight.event.start);
      const daysUntil = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const withinProximity =
        daysUntil <= this.config.thresholds.eventProximityDays &&
        (!eventInsight.distanceMiles ||
          eventInsight.distanceMiles <= this.config.thresholds.eventProximityMiles);

      if (withinProximity) {
        const alert = this.createEventNearbyAlert(eventInsight, daysUntil);
        if (this.shouldEmitAlert(alert)) {
          alerts.push(alert);
          this.recordAlert(alert);
        }
      }
    }

    return alerts;
  }

  /**
   * Analyze rating deltas and generate alerts
   */
  analyzeRatingDeltas(deltas: RatingDelta[]): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    for (const delta of deltas) {
      if (delta.delta !== undefined && delta.delta <= this.config.thresholds.reviewDelta) {
        const alert = this.createReviewDeltaAlert(delta);
        if (this.shouldEmitAlert(alert)) {
          alerts.push(alert);
          this.recordAlert(alert);
        }
      }
    }

    return alerts;
  }

  /**
   * Analyze observations for new openings
   */
  analyzeNewOpenings(observations: Observation[]): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    const openingKeywords = ['grand opening', 'now open', 'opening soon', 'new location'];

    for (const obs of observations) {
      if (obs.type === 'opening') {
        const alert = this.createNewOpeningAlert(obs);
        if (this.shouldEmitAlert(alert)) {
          alerts.push(alert);
          this.recordAlert(alert);
        }
      } else if (obs.notes) {
        const notesLower = obs.notes.toLowerCase();
        const hasOpeningKeyword = openingKeywords.some((kw) => notesLower.includes(kw));
        if (hasOpeningKeyword) {
          const alert = this.createNewOpeningAlert(obs);
          if (this.shouldEmitAlert(alert)) {
            alerts.push(alert);
            this.recordAlert(alert);
          }
        }
      }
    }

    return alerts;
  }

  /**
   * Create price disadvantage alert
   */
  private createPriceDisadvantageAlert(gap: PricingGap): SmartAlert {
    const severity = gap.disadvantagePercent >= 20 ? 'high' : gap.disadvantagePercent >= 15 ? 'medium' : 'low';

    return {
      id: this.generateAlertId('price_disadvantage', gap),
      type: 'price_disadvantage',
      severity,
      title: `Price Disadvantage: ${gap.product}`,
      message: `${gap.competitor} is pricing ${gap.product} ${gap.disadvantagePercent.toFixed(1)}% lower at $${gap.competitorPrice.toFixed(2)}${gap.ourPrice ? ` vs our $${gap.ourPrice.toFixed(2)}` : ''}`,
      context: gap,
      timestamp: new Date().toISOString(),
      dedupeKey: this.generateDedupeKey('price_disadvantage', gap.product, gap.competitor),
      actionable: true,
    };
  }

  /**
   * Create competitor promo alert
   */
  private createCompetitorPromoAlert(promo: CompetitorPromo): SmartAlert {
    const severity = promo.discount >= 40 ? 'high' : promo.discount >= 30 ? 'medium' : 'low';

    return {
      id: this.generateAlertId('competitor_promo', promo),
      type: 'competitor_promo',
      severity,
      title: `Competitor Promo: ${promo.competitor}`,
      message: `${promo.competitor} running ${promo.discount}% discount: ${promo.title}`,
      context: promo,
      timestamp: new Date().toISOString(),
      dedupeKey: this.generateDedupeKey('competitor_promo', promo.competitor, promo.title),
      actionable: true,
    };
  }

  /**
   * Create event nearby alert
   */
  private createEventNearbyAlert(eventInsight: EventInsight, daysUntil: number): SmartAlert {
    const severity = daysUntil <= 3 ? 'high' : daysUntil <= 5 ? 'medium' : 'low';

    return {
      id: this.generateAlertId('event_nearby', eventInsight.event),
      type: 'event_nearby',
      severity,
      title: `Event Soon: ${eventInsight.event.name}`,
      message: `${eventInsight.event.name} in ${daysUntil} days${eventInsight.distanceMiles ? ` (${eventInsight.distanceMiles.toFixed(1)} mi away)` : ''}`,
      context: eventInsight,
      timestamp: new Date().toISOString(),
      dedupeKey: this.generateDedupeKey('event_nearby', eventInsight.event.name, eventInsight.event.start),
      actionable: true,
    };
  }

  /**
   * Create review delta alert
   */
  private createReviewDeltaAlert(delta: RatingDelta): SmartAlert {
    const severity = delta.delta! <= -0.5 ? 'high' : delta.delta! <= -0.4 ? 'medium' : 'low';

    return {
      id: this.generateAlertId('review_delta', delta),
      type: 'review_delta',
      severity,
      title: `Rating Drop: ${delta.competitor}`,
      message: `${delta.competitor} rating decreased by ${Math.abs(delta.delta!).toFixed(1)}★ (now ${delta.currentRating}★)`,
      context: delta,
      timestamp: new Date().toISOString(),
      dedupeKey: this.generateDedupeKey('review_delta', delta.competitor, delta.currentRating.toString()),
      actionable: false,
    };
  }

  /**
   * Create new opening alert
   */
  private createNewOpeningAlert(observation: Observation): SmartAlert {
    return {
      id: this.generateAlertId('new_opening', observation),
      type: 'new_opening',
      severity: 'high',
      title: `New Opening: ${observation.competitor}`,
      message: `${observation.competitor} ${observation.store ? `(${observation.store})` : ''} opening ${observation.start_date ? `on ${observation.start_date}` : 'soon'}`,
      context: observation,
      timestamp: new Date().toISOString(),
      dedupeKey: this.generateDedupeKey('new_opening', observation.competitor, observation.store || ''),
      actionable: true,
    };
  }

  /**
   * Determine if alert should be emitted (check deduplication and quiet hours)
   */
  private shouldEmitAlert(alert: SmartAlert): boolean {
    if (!this.config.enabled) {
      return false;
    }

    // Check deduplication
    const lastEmitted = this.alertHistory.get(alert.dedupeKey);
    if (lastEmitted) {
      const hoursSinceLastEmit =
        (new Date().getTime() - lastEmitted.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastEmit < this.config.dedupeWindowHours) {
        return false; // Skip duplicate
      }
    }

    // Check quiet hours (advisory only - still return true but could be filtered)
    // const now = new Date();
    // const currentHour = now.getHours();
    // const inQuietHours =
    //   this.config.quietHoursStart > this.config.quietHoursEnd
    //     ? currentHour >= this.config.quietHoursStart || currentHour < this.config.quietHoursEnd
    //     : currentHour >= this.config.quietHoursStart && currentHour < this.config.quietHoursEnd;

    // For now, we emit during quiet hours (could implement filtering later)
    return true;
  }

  /**
   * Record alert emission for deduplication
   */
  private recordAlert(alert: SmartAlert): void {
    this.alertHistory.set(alert.dedupeKey, new Date());
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(type: string, context: any): string {
    const hash = createHash('md5')
      .update(JSON.stringify({ type, context, timestamp: new Date().toISOString() }))
      .digest('hex');
    return `${type}_${hash.substring(0, 12)}`;
  }

  /**
   * Generate deduplication key
   */
  private generateDedupeKey(...parts: string[]): string {
    return parts.join('::').toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Clear alert history (useful for testing)
   */
  clearHistory(): void {
    this.alertHistory.clear();
  }

  /**
   * Get configuration
   */
  getConfig(): AlertConfig {
    return { ...this.config };
  }
}
