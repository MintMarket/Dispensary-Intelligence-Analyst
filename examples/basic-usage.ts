/**
 * Basic Usage Example
 * Demonstrates generating an executive intelligence summary
 */

import { DispensaryIntelligenceAnalyst } from '../src';

async function main() {
  console.log('=== Dispensary Intelligence Analyst - Basic Usage ===\n');

  // Create analyst instance (uses MockToolProvider by default)
  const analyst = new DispensaryIntelligenceAnalyst();

  // Generate executive summary for Arizona market
  console.log('Generating executive summary for Arizona market...\n');

  const summary = await analyst.generateExecutiveSummary({
    market: 'Arizona',
    lookbackDays: 14,
    lookaheadDays: 21,
  });

  // Format and display the summary
  const markdown = analyst.formatExecutiveSummaryAsMarkdown(summary);
  console.log(markdown);

  // Display key metrics
  console.log('\n\n=== Key Metrics ===\n');
  console.log(`Smart Alerts: ${summary.smartAlerts.length}`);
  console.log(`  - High Priority: ${summary.smartAlerts.filter((a) => a.severity === 'high').length}`);
  console.log(`  - Medium Priority: ${summary.smartAlerts.filter((a) => a.severity === 'medium').length}`);
  console.log(`  - Low Priority: ${summary.smartAlerts.filter((a) => a.severity === 'low').length}`);
  console.log(`\nCompetitor Promos: ${summary.findings.competitorPromosAndPricing.topPromos.length}`);
  console.log(`Pricing Gaps: ${summary.findings.competitorPromosAndPricing.pricingGaps.length}`);
  console.log(`Upcoming Events: ${summary.findings.eventsAndOpenings.length}`);
  console.log(`Vendor Opportunities: ${summary.findings.vendorOpportunities.length}`);
  console.log(`Sources Cited: ${summary.sources.length}`);
}

main().catch(console.error);
