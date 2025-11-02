/**
 * PTL Verification Example
 * Demonstrates price list verification against public listings
 */

import { DispensaryIntelligenceAnalyst, PTLItem, PublicListing } from '../src';

async function main() {
  console.log('=== PTL Verification Example ===\n');

  const analyst = new DispensaryIntelligenceAnalyst();

  // Define our internal price list (PTL)
  const ptlItems: PTLItem[] = [
    {
      sku: 'COOKIES-GP-8TH',
      brand: 'Cookies',
      product: 'Gary Payton',
      size: '3.5g',
      potency: '28% THC',
      price: 50,
      category: 'Flower',
    },
    {
      sku: 'STIIIZY-SFV-POD',
      brand: 'Stiiizy',
      product: 'SFV OG Pod',
      size: '1g',
      potency: '85% THC',
      price: 40,
      category: 'Vapes',
    },
    {
      sku: 'KIVA-TERRA-CHOC',
      brand: 'Kiva',
      product: 'Terra Bites',
      size: '100mg',
      potency: '100mg THC',
      price: 20,
      category: 'Edibles',
    },
    {
      sku: 'RAWG-RESIN-CART',
      brand: 'Raw Garden',
      product: 'Live Resin Cart',
      size: '1g',
      potency: '82% THC',
      price: 45,
      category: 'Concentrates',
    },
  ];

  // Simulate public listings from Weedmaps, Leafly, etc.
  const publicListings: PublicListing[] = [
    {
      source: 'weedmaps',
      brand: 'Cookies',
      product: 'Gary Payton',
      size: '3.5g',
      potency: '28% THC',
      price: 45, // $5 lower than our PTL!
      url: 'https://weedmaps.com/dispensaries/example/menu/cookies-gary-payton',
      lastSeen: new Date().toISOString(),
    },
    {
      source: 'leafly',
      brand: 'Stiiizy',
      product: 'SFV OG Pod',
      size: '1g',
      potency: '85% THC',
      price: 40, // Matches our PTL
      url: 'https://leafly.com/dispensary/example/product/stiiizy-sfv',
      lastSeen: new Date().toISOString(),
    },
    {
      source: 'weedmaps',
      brand: 'Kiva',
      product: 'Terra Bites',
      size: '100mg',
      potency: '100mg THC',
      price: 25, // $5 higher than our PTL (we're cheaper!)
      url: 'https://weedmaps.com/dispensaries/example/menu/kiva-terra',
      lastSeen: new Date().toISOString(),
    },
    {
      source: 'leafly',
      brand: 'Raw Garden',
      product: 'Live Resin Cart',
      size: '1g',
      potency: '82% THC',
      price: 38, // $7 lower than our PTL!
      url: 'https://leafly.com/dispensary/example/product/raw-garden-resin',
      lastSeen: new Date().toISOString(),
    },
  ];

  // Generate verification report
  const report = await analyst.generatePTLVerification({
    orgId: 'demo-org',
    market: 'Arizona',
    period: '2025-11-01 to 2025-11-02',
    ptlItems,
    publicListings,
  });

  // Display formatted report
  console.log(analyst.formatPTLVerificationAsMarkdown(report));

  // Display summary stats
  console.log('\n\n=== Summary Stats ===\n');
  console.log(`Total Items Checked: ${report.totalItems}`);
  console.log(`Mismatches Found: ${report.mismatches.length}`);
  console.log(`  - Critical: ${report.mismatches.filter((m) => m.severity === 'critical').length}`);
  console.log(`  - High: ${report.mismatches.filter((m) => m.severity === 'high').length}`);
  console.log(`  - Medium: ${report.mismatches.filter((m) => m.severity === 'medium').length}`);
  console.log(`  - Low: ${report.mismatches.filter((m) => m.severity === 'low').length}`);
}

main().catch(console.error);
