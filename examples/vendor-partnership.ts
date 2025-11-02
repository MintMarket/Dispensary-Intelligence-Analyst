/**
 * Vendor Partnership Tracker Example
 * Demonstrates vendor opportunity identification
 */

import { DispensaryIntelligenceAnalyst } from '../src';

async function main() {
  console.log('=== Vendor Partnership Tracker Example ===\n');

  const analyst = new DispensaryIntelligenceAnalyst();

  // Generate vendor partnership tracker for Detroit market
  const report = await analyst.generateVendorPartnershipTracker({
    market: 'Michigan',
    city: 'Detroit, MI',
    daysAhead: 30,
    existingPartnerships: ['Raw Garden', 'Stiiizy'], // Vendors we already work with
  });

  // Display formatted report
  console.log(analyst.formatVendorPartnershipAsMarkdown(report));

  // Display summary
  console.log('\n\n=== Summary ===\n');
  console.log(`Total Partnerships Identified: ${report.partnerships.length}`);
  console.log(`  - High Priority: ${report.partnerships.filter((p) => p.priority === 'high').length}`);
  console.log(`  - Medium Priority: ${report.partnerships.filter((p) => p.priority === 'medium').length}`);
  console.log(`  - Low Priority: ${report.partnerships.filter((p) => p.priority === 'low').length}`);
  console.log(`\nCalendar Entries: ${report.calendar.length}`);

  // Show top 3 high-priority partnerships
  const highPriority = report.partnerships.filter((p) => p.priority === 'high').slice(0, 3);
  if (highPriority.length > 0) {
    console.log('\n\n=== Top Priority Partnerships ===\n');
    for (const p of highPriority) {
      console.log(`${p.vendor}`);
      console.log(`  Rationale: ${p.contactRationale}`);
      console.log(`  Estimated Reach: ${p.estimatedReach?.toLocaleString()} customers`);
      if (p.suggestedActivations.length > 0) {
        console.log(`  Next Action: ${p.suggestedActivations[0].format} on ${p.suggestedActivations[0].date}`);
      }
      console.log('');
    }
  }
}

main().catch(console.error);
