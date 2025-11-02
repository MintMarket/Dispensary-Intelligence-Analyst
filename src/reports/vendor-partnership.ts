/**
 * Vendor Partnership Tracker
 * Identifies and tracks vendor partnership opportunities based on market events
 */

import { format, addDays } from 'date-fns';
import {
  VendorPartnership,
  VendorPartnershipReport,
  VendorCalendarEntry,
  Event,
  Observation,
  VendorActivation,
} from '../types';

export interface VendorPartnershipInput {
  market: string;
  city: string;
  events: Event[];
  observations: Observation[];
  existingPartnerships?: string[]; // Vendors we already work with
}

export class VendorPartnershipTracker {
  /**
   * Generate vendor partnership report
   */
  generate(input: VendorPartnershipInput): VendorPartnershipReport {
    const vendorActivity = this.extractVendorActivity(input.events, input.observations);
    const partnerships = this.buildPartnerships(vendorActivity, input.events, input.existingPartnerships);
    const calendar = this.buildCalendar(partnerships);

    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      market: input.market,
      city: input.city,
      partnerships,
      calendar,
    };
  }

  /**
   * Extract vendor activity from events and observations
   */
  private extractVendorActivity(
    events: Event[],
    observations: Observation[]
  ): Map<string, { events: Event[]; observations: Observation[]; score: number }> {
    const activity = new Map<
      string,
      { events: Event[]; observations: Observation[]; score: number }
    >();

    // Extract from events
    for (const event of events) {
      const vendor = this.extractVendorFromEvent(event);
      if (vendor) {
        if (!activity.has(vendor)) {
          activity.set(vendor, { events: [], observations: [], score: 0 });
        }
        activity.get(vendor)!.events.push(event);
        activity.get(vendor)!.score += 3; // Events are high value
      }
    }

    // Extract from observations
    for (const obs of observations) {
      if (obs.brand) {
        if (!activity.has(obs.brand)) {
          activity.set(obs.brand, { events: [], observations: [], score: 0 });
        }
        activity.get(obs.brand)!.observations.push(obs);
        activity.get(obs.brand)!.score += 1;
      }
    }

    return activity;
  }

  /**
   * Extract vendor name from event
   */
  private extractVendorFromEvent(event: Event): string | null {
    const patterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Vendor|Brand)\s+Day/i,
      /(?:Vendor|Brand)\s+Day\s+(?:with|featuring)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Event/i,
    ];

    for (const pattern of patterns) {
      const match = event.name.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Build partnership recommendations
   */
  private buildPartnerships(
    vendorActivity: Map<string, { events: Event[]; observations: Observation[]; score: number }>,
    _allEvents: Event[],
    existingPartnerships?: string[]
  ): VendorPartnership[] {
    const partnerships: VendorPartnership[] = [];

    // Sort vendors by score
    const sortedVendors = Array.from(vendorActivity.entries()).sort(
      (a, b) => b[1].score - a[1].score
    );

    for (const [vendor, data] of sortedVendors.slice(0, 15)) {
      // Skip if already partnered
      if (existingPartnerships?.includes(vendor)) {
        continue;
      }

      const partnership: VendorPartnership = {
        vendor,
        upcomingEvents: data.events,
        suggestedActivations: this.suggestActivations(vendor, data.events),
        contactRationale: this.buildContactRationale(data),
        priority: this.calculatePriority(data),
        estimatedReach: this.estimateReach(data),
      };

      partnerships.push(partnership);
    }

    return partnerships;
  }

  /**
   * Suggest vendor activations
   */
  private suggestActivations(vendor: string, events: Event[]): VendorActivation[] {
    const activations: VendorActivation[] = [];

    if (events.length > 0) {
      // Coordinate with existing events
      for (const event of events.slice(0, 2)) {
        const eventDate = new Date(event.start);
        const suggestedDate = format(addDays(eventDate, -3), 'yyyy-MM-dd'); // 3 days before

        activations.push({
          vendor,
          date: suggestedDate,
          format: 'Pre-event vendor day with exclusive drops and special pricing',
          expectedOutcome: `Capture market attention before ${event.name}; drive 20-25% traffic increase`,
        });
      }
    } else {
      // Proactive outreach
      const suggestedDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');
      activations.push({
        vendor,
        date: suggestedDate,
        format: 'In-store vendor day with product education and sampling',
        expectedOutcome: 'Build brand awareness; drive 15-20% traffic increase; establish partnership',
      });
    }

    return activations;
  }

  /**
   * Build contact rationale
   */
  private buildContactRationale(data: {
    events: Event[];
    observations: Observation[];
    score: number;
  }): string {
    const parts: string[] = [];

    if (data.events.length > 0) {
      parts.push(`${data.events.length} upcoming market event(s)`);
    }

    if (data.observations.length > 0) {
      parts.push(`${data.observations.length} competitive observation(s)`);
    }

    parts.push('strong market presence detected');

    return parts.join('; ') + ' — opportune timing for partnership';
  }

  /**
   * Calculate partnership priority
   */
  private calculatePriority(data: { score: number }): 'high' | 'medium' | 'low' {
    if (data.score >= 5) return 'high';
    if (data.score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Estimate reach (simplified)
   */
  private estimateReach(data: { events: Event[]; observations: Observation[] }): number {
    // Base reach
    let reach = 500;

    // Add for events
    reach += data.events.length * 200;

    // Add for observations
    reach += data.observations.length * 50;

    return reach;
  }

  /**
   * Build activation calendar
   */
  private buildCalendar(partnerships: VendorPartnership[]): VendorCalendarEntry[] {
    const entries: VendorCalendarEntry[] = [];

    for (const partnership of partnerships) {
      for (const activation of partnership.suggestedActivations) {
        entries.push({
          date: activation.date,
          vendor: partnership.vendor,
          activation,
          status: 'planned',
        });
      }

      for (const event of partnership.upcomingEvents) {
        entries.push({
          date: format(new Date(event.start), 'yyyy-MM-dd'),
          vendor: partnership.vendor,
          event,
          status: 'planned',
        });
      }
    }

    // Sort by date
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Format report as markdown
   */
  formatAsMarkdown(report: VendorPartnershipReport): string {
    const lines: string[] = [];

    // Header
    lines.push(`# Vendor Partnership Tracker — ${report.market}`);
    lines.push(`**Date:** ${report.date} • **Focus:** ${report.city}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    const highPriority = report.partnerships.filter((p) => p.priority === 'high').length;
    const mediumPriority = report.partnerships.filter((p) => p.priority === 'medium').length;
    lines.push(
      `Identified ${report.partnerships.length} vendor partnership opportunities: ${highPriority} high-priority, ${mediumPriority} medium-priority.`
    );
    lines.push('');

    // High-Priority Partnerships
    const highP = report.partnerships.filter((p) => p.priority === 'high');
    if (highP.length > 0) {
      lines.push('## High-Priority Partnerships');
      lines.push('');

      for (const p of highP) {
        lines.push(`### ${p.vendor}`);
        lines.push(`**Rationale:** ${p.contactRationale}`);
        if (p.estimatedReach) {
          lines.push(`**Estimated Reach:** ${p.estimatedReach.toLocaleString()} customers`);
        }
        lines.push('');

        if (p.upcomingEvents.length > 0) {
          lines.push('**Upcoming Events:**');
          for (const event of p.upcomingEvents) {
            lines.push(`- ${format(new Date(event.start), 'MMM d')}: ${event.name}`);
          }
          lines.push('');
        }

        if (p.suggestedActivations.length > 0) {
          lines.push('**Suggested Activations:**');
          for (const activation of p.suggestedActivations) {
            lines.push(`- **${activation.date}**: ${activation.format}`);
            lines.push(`  *Expected:* ${activation.expectedOutcome}`);
          }
          lines.push('');
        }
      }
    }

    // Medium-Priority Partnerships
    const mediumP = report.partnerships.filter((p) => p.priority === 'medium');
    if (mediumP.length > 0) {
      lines.push('## Medium-Priority Partnerships');
      lines.push('');

      for (const p of mediumP.slice(0, 5)) {
        lines.push(`### ${p.vendor}`);
        lines.push(p.contactRationale);
        if (p.suggestedActivations.length > 0) {
          lines.push(`Suggested: ${p.suggestedActivations[0].format} on ${p.suggestedActivations[0].date}`);
        }
        lines.push('');
      }
    }

    // Calendar
    lines.push('## Activation Calendar');
    lines.push('');

    if (report.calendar.length > 0) {
      const next30Days = report.calendar.filter((entry) => {
        const entryDate = new Date(entry.date);
        const maxDate = addDays(new Date(), 30);
        return entryDate <= maxDate;
      });

      for (const entry of next30Days.slice(0, 15)) {
        const dateStr = format(new Date(entry.date), 'MMM d, yyyy (EEE)');
        if (entry.activation) {
          lines.push(`- **${dateStr}**: ${entry.vendor} Activation — ${entry.activation.format}`);
        } else if (entry.event) {
          lines.push(`- **${dateStr}**: ${entry.vendor} Event — ${entry.event.name}`);
        }
      }
    } else {
      lines.push('No calendar entries available.');
    }
    lines.push('');

    // Action Items
    lines.push('## Recommended Actions');
    lines.push('1. Reach out to high-priority vendors within 3-5 days');
    lines.push('2. Schedule initial calls to discuss partnership terms');
    lines.push('3. Prepare vendor day packages and promotional materials');
    lines.push('4. Monitor competitor vendor activations for timing conflicts');

    return lines.join('\n');
  }
}
