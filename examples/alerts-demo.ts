/**
 * Smart Alerts Demo
 * Demonstrates the Smart Alerts engine with various scenarios
 */

import { SmartAlertsEngine, PricingGap, CompetitorPromo, EventInsight, RatingDelta, Observation } from '../src';

function main() {
  console.log('=== Smart Alerts Engine Demo ===\n');

  const alertsEngine = new SmartAlertsEngine();

  // Scenario 1: Price Disadvantage Alerts
  console.log('## Scenario 1: Price Disadvantage Alerts\n');

  const pricingGaps: PricingGap[] = [
    {
      product: 'Cookies Gary Payton 1/8oz',
      brand: 'Cookies',
      size: '3.5g',
      ourPrice: 50,
      competitorPrice: 40,
      competitor: 'Green Haven Dispensary',
      disadvantagePercent: 25,
      source: 'https://weedmaps.com/greenhaven',
    },
    {
      product: 'Stiiizy Pod',
      brand: 'Stiiizy',
      size: '1g',
      ourPrice: 40,
      competitorPrice: 38,
      competitor: 'Desert Rose Cannabis',
      disadvantagePercent: 5.3,
      source: 'https://leafly.com/desertrose',
    },
  ];

  const priceAlerts = alertsEngine.analyzePricingGaps(pricingGaps);
  console.log(`Generated ${priceAlerts.length} price disadvantage alerts:`);
  for (const alert of priceAlerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.message}`);
  }
  console.log('');

  // Scenario 2: Competitor Promo Alerts
  console.log('## Scenario 2: Competitor Promo Alerts\n');

  const competitorPromos: CompetitorPromo[] = [
    {
      competitor: 'Green Haven Dispensary',
      title: '30% Off All Flower This Weekend',
      discount: 30,
      details: 'Stock up and save! Enjoy 30% off all flower products, Friday through Sunday only.',
      startDate: '2025-11-08',
      endDate: '2025-11-10',
      source: 'Green Haven Website',
      url: 'https://greenhaven.com/promo',
    },
    {
      competitor: 'Sunny Buds',
      title: 'BOGO Edibles Every Tuesday',
      discount: 50,
      details: 'Buy one, get one free on all edibles every Tuesday.',
      source: 'Sunny Buds Newsletter',
    },
  ];

  const promoAlerts = alertsEngine.analyzeCompetitorPromos(competitorPromos);
  console.log(`Generated ${promoAlerts.length} competitor promo alerts:`);
  for (const alert of promoAlerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.message}`);
  }
  console.log('');

  // Scenario 3: Event Proximity Alerts
  console.log('## Scenario 3: Event Proximity Alerts\n');

  const eventInsights: EventInsight[] = [
    {
      event: {
        name: 'Cannabis Industry Expo',
        start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        venue: 'Convention Center',
        address: '123 Main St, Phoenix, AZ',
        source: 'Eventbrite',
      },
      proximity: 'immediate',
      distanceMiles: 8,
      recommendedAction: 'Consider coordinating promotional timing or counter-programming',
    },
    {
      event: {
        name: '420 Festival',
        start: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        venue: 'City Park',
        address: '456 Park Ave, Phoenix, AZ',
        source: 'Local Events',
      },
      proximity: 'near',
      distanceMiles: 12,
      recommendedAction: 'Plan promotional response or partnership opportunity',
    },
  ];

  const eventAlerts = alertsEngine.analyzeEvents(eventInsights);
  console.log(`Generated ${eventAlerts.length} event proximity alerts:`);
  for (const alert of eventAlerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.message}`);
  }
  console.log('');

  // Scenario 4: Rating Delta Alerts
  console.log('## Scenario 4: Rating Delta Alerts\n');

  const ratingDeltas: RatingDelta[] = [
    {
      competitor: 'Green Haven Dispensary',
      currentRating: 4.2,
      previousRating: 4.5,
      delta: -0.3,
      reviewCount: 342,
      reviewCountDelta: 12,
    },
    {
      competitor: 'Desert Rose Cannabis',
      currentRating: 4.7,
      previousRating: 4.8,
      delta: -0.1,
      reviewCount: 521,
      reviewCountDelta: 8,
    },
  ];

  const ratingAlerts = alertsEngine.analyzeRatingDeltas(ratingDeltas);
  console.log(`Generated ${ratingAlerts.length} rating delta alerts:`);
  for (const alert of ratingAlerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.message}`);
  }
  console.log('');

  // Scenario 5: New Opening Alerts
  console.log('## Scenario 5: New Opening Alerts\n');

  const observations: Observation[] = [
    {
      timestamp: new Date().toISOString(),
      type: 'opening',
      market: 'Arizona',
      competitor: 'Canna Corner',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      store: 'North Phoenix',
      source_url: 'https://cannacorner.com/grand-opening',
      notes: 'Grand opening with 40% off everything',
    },
  ];

  const openingAlerts = alertsEngine.analyzeNewOpenings(observations);
  console.log(`Generated ${openingAlerts.length} new opening alerts:`);
  for (const alert of openingAlerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.message}`);
  }
  console.log('');

  // Summary
  const totalAlerts = priceAlerts.length + promoAlerts.length + eventAlerts.length + ratingAlerts.length + openingAlerts.length;
  console.log('## Summary\n');
  console.log(`Total Alerts Generated: ${totalAlerts}`);
  console.log(`  - Price Disadvantage: ${priceAlerts.length}`);
  console.log(`  - Competitor Promo: ${promoAlerts.length}`);
  console.log(`  - Event Nearby: ${eventAlerts.length}`);
  console.log(`  - Rating Delta: ${ratingAlerts.length}`);
  console.log(`  - New Opening: ${openingAlerts.length}`);
}

main();
