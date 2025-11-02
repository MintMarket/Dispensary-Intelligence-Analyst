/**
 * PTL (Price/Product List) Verification Module
 * Compares internal pricing against public listings to identify discrepancies
 */

import { format } from 'date-fns';
import {
  PTLItem,
  PublicListing,
  PTLMismatch,
  PTLVerificationReport,
} from '../types';

export interface PTLVerificationInput {
  orgId: string;
  market: string;
  period: string;
  ptlItems: PTLItem[];
  publicListings: PublicListing[];
}

export class PTLVerificationGenerator {
  /**
   * Generate PTL verification report
   */
  generate(input: PTLVerificationInput): PTLVerificationReport {
    const mismatches = this.identifyMismatches(input.ptlItems, input.publicListings);
    const prioritizedFixes = this.prioritizeFixes(mismatches);
    const summary = this.buildSummary(input.ptlItems.length, mismatches);

    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      orgId: input.orgId,
      market: input.market,
      period: input.period,
      totalItems: input.ptlItems.length,
      mismatches,
      prioritizedFixes,
      summary,
    };
  }

  /**
   * Identify mismatches between PTL and public listings
   */
  private identifyMismatches(
    ptlItems: PTLItem[],
    publicListings: PublicListing[]
  ): PTLMismatch[] {
    const mismatches: PTLMismatch[] = [];

    for (const ptl of ptlItems) {
      // Find matching public listing
      const matches = publicListings.filter((listing) =>
        this.isMatch(ptl, listing)
      );

      for (const listing of matches) {
        if (Math.abs(ptl.price - listing.price) > 0.01) {
          // Price mismatch found
          const delta = listing.price - ptl.price;
          const deltaPercent = (delta / ptl.price) * 100;

          const severity = this.calculateSeverity(Math.abs(deltaPercent));

          mismatches.push({
            sku: ptl.sku,
            ptlPrice: ptl.price,
            publicPrice: listing.price,
            priceDelta: delta,
            priceDeltaPercent: deltaPercent,
            source: listing.source,
            severity,
            publicListing: listing,
          });
        }
      }
    }

    return mismatches.sort((a, b) => Math.abs(b.priceDeltaPercent) - Math.abs(a.priceDeltaPercent));
  }

  /**
   * Check if PTL item matches public listing
   */
  private isMatch(ptl: PTLItem, listing: PublicListing): boolean {
    // SKU match (if available)
    if (ptl.sku && listing.sku && ptl.sku === listing.sku) {
      return true;
    }

    // Fuzzy match on brand, product, size
    const ptlKey = this.normalizeKey(ptl.brand, ptl.product, ptl.size, ptl.potency);
    const listingKey = this.normalizeKey(listing.brand, listing.product, listing.size, listing.potency);

    return ptlKey === listingKey;
  }

  /**
   * Normalize product key for matching
   */
  private normalizeKey(...parts: (string | undefined)[]): string {
    return parts
      .filter(Boolean)
      .map((p) => p!.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .join('_');
  }

  /**
   * Calculate severity based on price delta percentage
   */
  private calculateSeverity(deltaPercent: number): 'critical' | 'high' | 'medium' | 'low' {
    if (deltaPercent >= 20) return 'critical';
    if (deltaPercent >= 10) return 'high';
    if (deltaPercent >= 5) return 'medium';
    return 'low';
  }

  /**
   * Prioritize fixes based on severity and impact
   */
  private prioritizeFixes(mismatches: PTLMismatch[]): PTLMismatch[] {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return [...mismatches].sort((a, b) => {
      // Sort by severity first
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // Then by absolute delta percentage
      return Math.abs(b.priceDeltaPercent) - Math.abs(a.priceDeltaPercent);
    });
  }

  /**
   * Build summary text
   */
  private buildSummary(totalItems: number, mismatches: PTLMismatch[]): string {
    const mismatchPercent = (mismatches.length / totalItems) * 100;
    const critical = mismatches.filter((m) => m.severity === 'critical').length;
    const high = mismatches.filter((m) => m.severity === 'high').length;

    return `Found ${mismatches.length} price mismatches out of ${totalItems} items (${mismatchPercent.toFixed(1)}%). ${critical} critical and ${high} high-priority items require immediate attention.`;
  }

  /**
   * Format report as markdown
   */
  formatAsMarkdown(report: PTLVerificationReport): string {
    const lines: string[] = [];

    // Header
    lines.push(`# PTL Verification Report — ${report.market}`);
    lines.push(`**Date:** ${report.date} • **Period:** ${report.period} • **Org:** ${report.orgId}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push(report.summary);
    lines.push('');

    // Prioritized Fixes
    lines.push('## Prioritized Fixes');
    lines.push('');

    if (report.prioritizedFixes.length > 0) {
      lines.push('| Priority | SKU | PTL Price | Public Price | Delta | Source |');
      lines.push('|----------|-----|-----------|--------------|-------|--------|');

      for (const fix of report.prioritizedFixes.slice(0, 20)) {
        const emoji = this.getSeverityEmoji(fix.severity);
        const deltaSign = fix.priceDelta >= 0 ? '+' : '';
        lines.push(
          `| ${emoji} ${fix.severity} | ${fix.sku} | $${fix.ptlPrice.toFixed(2)} | $${fix.publicPrice.toFixed(2)} | ${deltaSign}${fix.priceDeltaPercent.toFixed(1)}% | ${fix.source} |`
        );
      }

      if (report.prioritizedFixes.length > 20) {
        lines.push(`\n*... and ${report.prioritizedFixes.length - 20} more items*`);
      }
    } else {
      lines.push('✅ No mismatches found. All prices match public listings!');
    }
    lines.push('');

    // All Mismatches by Source
    if (report.mismatches.length > 0) {
      lines.push('## Mismatches by Source');
      lines.push('');

      const bySources = this.groupBySource(report.mismatches);
      for (const [source, items] of Object.entries(bySources)) {
        lines.push(`### ${source} (${items.length} items)`);
        for (const item of items.slice(0, 10)) {
          const deltaSign = item.priceDelta >= 0 ? '+' : '';
          lines.push(
            `- ${item.sku}: PTL $${item.ptlPrice.toFixed(2)} vs Public $${item.publicPrice.toFixed(2)} (${deltaSign}${item.priceDeltaPercent.toFixed(1)}%)`
          );
        }
        if (items.length > 10) {
          lines.push(`  *... and ${items.length - 10} more*`);
        }
        lines.push('');
      }
    }

    // Action Items
    lines.push('## Recommended Actions');
    const critical = report.mismatches.filter((m) => m.severity === 'critical');
    const high = report.mismatches.filter((m) => m.severity === 'high');

    if (critical.length > 0) {
      lines.push(`1. **URGENT**: Update ${critical.length} critical price discrepancies immediately`);
    }
    if (high.length > 0) {
      lines.push(`2. **HIGH**: Review and update ${high.length} high-priority items within 24 hours`);
    }
    lines.push('3. Verify all public listing integrations are syncing correctly');
    lines.push('4. Implement automated price monitoring to catch discrepancies faster');

    return lines.join('\n');
  }

  /**
   * Get emoji for severity
   */
  private getSeverityEmoji(severity: string): string {
    const emojiMap: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };
    return emojiMap[severity] || '';
  }

  /**
   * Group mismatches by source
   */
  private groupBySource(mismatches: PTLMismatch[]): Record<string, PTLMismatch[]> {
    const groups: Record<string, PTLMismatch[]> = {};

    for (const mismatch of mismatches) {
      const source = mismatch.source;
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(mismatch);
    }

    return groups;
  }
}
