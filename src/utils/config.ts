/**
 * Configuration Utilities
 * Helper functions for loading and validating configuration
 */

import { AnalystConfig, Organization, AlertConfig } from '../types';

export class ConfigLoader {
  /**
   * Load configuration from environment variables
   */
  static loadFromEnv(): Partial<AnalystConfig> {
    return {
      organization: this.loadOrganization(),
      alertConfig: this.loadAlertConfig(),
      defaultLookbackDays: this.parseNumber(process.env.DEFAULT_LOOKBACK_DAYS, 14),
      defaultLookaheadDays: this.parseNumber(process.env.DEFAULT_LOOKAHEAD_DAYS, 21),
      complianceMode: true,
      dataRetentionDays: this.parseNumber(process.env.DATA_RETENTION_DAYS, 90),
    };
  }

  /**
   * Load organization configuration
   */
  private static loadOrganization(): Organization {
    return {
      orgId: process.env.DEFAULT_ORG_ID || 'default-org',
      name: process.env.ORG_NAME || 'Default Organization',
      primaryMarket: process.env.DEFAULT_MARKET || 'Arizona',
      timezone: process.env.TIMEZONE || 'America/Phoenix',
    };
  }

  /**
   * Load alert configuration
   */
  private static loadAlertConfig(): AlertConfig {
    return {
      thresholds: {
        priceDisadvantage: this.parseNumber(process.env.ALERT_PRICE_DISADVANTAGE_THRESHOLD, 10),
        promoDiscount: this.parseNumber(process.env.ALERT_PROMO_DISCOUNT_THRESHOLD, 25),
        eventProximityMiles: this.parseNumber(process.env.ALERT_EVENT_PROXIMITY_MILES, 10),
        eventProximityDays: this.parseNumber(process.env.ALERT_EVENT_PROXIMITY_DAYS, 7),
        reviewDelta: this.parseNumber(process.env.ALERT_REVIEW_DELTA_THRESHOLD, -0.3),
      },
      dedupeWindowHours: this.parseNumber(process.env.ALERT_DEDUPE_WINDOW_HOURS, 6),
      quietHoursStart: this.parseNumber(process.env.ALERT_QUIET_START_HOUR, 22),
      quietHoursEnd: this.parseNumber(process.env.ALERT_QUIET_END_HOUR, 7),
      enabled: process.env.ALERT_ENABLED !== 'false',
    };
  }

  /**
   * Parse number from environment variable with default
   */
  private static parseNumber(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validate configuration
   */
  static validate(config: AnalystConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.organization.orgId) {
      errors.push('Organization ID is required');
    }

    if (!config.organization.primaryMarket) {
      errors.push('Primary market is required');
    }

    if (config.defaultLookbackDays < 1 || config.defaultLookbackDays > 90) {
      errors.push('Default lookback days must be between 1 and 90');
    }

    if (config.defaultLookaheadDays < 1 || config.defaultLookaheadDays > 90) {
      errors.push('Default lookahead days must be between 1 and 90');
    }

    if (config.alertConfig.thresholds.priceDisadvantage < 0 || config.alertConfig.thresholds.priceDisadvantage > 100) {
      errors.push('Price disadvantage threshold must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
