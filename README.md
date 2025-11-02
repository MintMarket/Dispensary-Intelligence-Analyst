# Dispensary Intelligence Analyst

**Professional competitive intelligence, analytics, and deal verification agent for cannabis dispensaries.**

State-specific, actionable insights using a 14-day lookback and 21-day lookahead. Compliance-aware: aggregate insights only, no PII, and cite public sources.

## What It Does

- **Detect competitor promos and pricing gaps** — Identify competitive promotions, pricing disadvantages, and SKU opportunities
- **Forecast events & openings** — Track upcoming industry events and new competitor openings
- **Recommend compliant counter-promos** — Generate actionable promotional responses based on competitive activity
- **Highlight product variety gaps** — Identify trending brands and categories you're missing
- **Track vendor partnerships and activations** — Discover vendor partnership opportunities
- **Generate Executive Intelligence Summaries** — Comprehensive reports with findings and recommendations
- **Smart Alerts** — Automated alerts for price disadvantages, competitor promos, events, and more

## Features

### Smart Alerts

Default thresholds (all configurable):

- **Price Disadvantage** ≥ 10%
- **Competitor Promo Nearby** ≥ 25% discount
- **Events Soon** within 10 miles and ≤ 7 days out
- **Review Delta** ≤ -0.3★ over 14 days
- **New Opening** keywords: "grand opening", "now open"

Alerts are de-duped every 6 hours with quiet hours support (10 PM–7 AM local, advisory only).

### Output Formats

1. **Executive Intelligence Summary** — Comprehensive competitive intelligence report
2. **PTL Verification** — Price/product list verification against public listings
3. **Vendor Partnership Tracker** — Vendor opportunity identification and calendar

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key settings:
- `DEFAULT_ORG_ID` — Your organization ID
- `DEFAULT_MARKET` — Primary market (e.g., "Arizona")
- Alert thresholds (optional overrides)

### Basic Usage

```typescript
import { DispensaryIntelligenceAnalyst } from 'dispensary-intelligence-analyst';

// Create analyst instance
const analyst = new DispensaryIntelligenceAnalyst();

// Generate executive summary
const summary = await analyst.generateExecutiveSummary({
  market: 'Arizona',
  lookbackDays: 14,
  lookaheadDays: 21,
});

// Format as markdown
const markdown = analyst.formatExecutiveSummaryAsMarkdown(summary);
console.log(markdown);
```

## Core Concepts

### Tool Provider

The system uses a **Tool Provider** interface to fetch data from various sources:

- `searchCompetitors` — Search for competitor promos/news
- `fetchEvents` — Fetch upcoming events
- `getPlacesRatings` — Get ratings and review counts
- `listObservations` — List internally stored observations
- `listFutureEvents` — List internally stored events

By default, a `MockToolProvider` is used for development/testing. In production, implement a custom `ToolProvider` that connects to your data sources.

### Analysis Pipeline

1. **Data Collection** — Gather data from all configured tools
2. **Normalization** — Standardize and clean data
3. **Analysis** — Identify gaps, trends, and opportunities
4. **Alert Generation** — Detect threshold breaches
5. **Report Generation** — Produce formatted output

## Examples

### Executive Summary

```typescript
import { DispensaryIntelligenceAnalyst } from './src';

async function main() {
  const analyst = new DispensaryIntelligenceAnalyst();

  const summary = await analyst.generateExecutiveSummary({
    market: 'Arizona',
  });

  console.log(analyst.formatExecutiveSummaryAsMarkdown(summary));
}

main();
```

### PTL Verification

```typescript
import { DispensaryIntelligenceAnalyst, PTLItem, PublicListing } from './src';

async function main() {
  const analyst = new DispensaryIntelligenceAnalyst();

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
  ];

  const publicListings: PublicListing[] = [
    {
      source: 'weedmaps',
      brand: 'Cookies',
      product: 'Gary Payton',
      size: '3.5g',
      potency: '28% THC',
      price: 45,
      url: 'https://weedmaps.com/example',
      lastSeen: new Date().toISOString(),
    },
  ];

  const report = await analyst.generatePTLVerification({
    orgId: 'my-org',
    market: 'Arizona',
    period: '2025-11-01 to 2025-11-02',
    ptlItems,
    publicListings,
  });

  console.log(analyst.formatPTLVerificationAsMarkdown(report));
}

main();
```

### Vendor Partnership Tracker

```typescript
import { DispensaryIntelligenceAnalyst } from './src';

async function main() {
  const analyst = new DispensaryIntelligenceAnalyst();

  const report = await analyst.generateVendorPartnershipTracker({
    market: 'Arizona',
    city: 'Phoenix, AZ',
    existingPartnerships: ['Cookies', 'Raw Garden'],
  });

  console.log(analyst.formatVendorPartnershipAsMarkdown(report));
}

main();
```

### Custom Tool Provider

```typescript
import { BaseToolProvider, SearchCompetitorsArgs, SearchCompetitorsResponse } from './src';

class MyToolProvider extends BaseToolProvider {
  async searchCompetitors(args: SearchCompetitorsArgs): Promise<SearchCompetitorsResponse> {
    // Connect to your data source
    const results = await myAPI.search(args.query);
    return { results };
  }

  // Implement other required methods...
}

// Use custom provider
const analyst = new DispensaryIntelligenceAnalyst(new MyToolProvider('my-org-id'));
```

## API Reference

### DispensaryIntelligenceAnalyst

Main orchestration class.

#### Methods

- `generateExecutiveSummary(params)` → `Promise<ExecutiveSummary>`
- `generatePTLVerification(input)` → `Promise<PTLVerificationReport>`
- `generateVendorPartnershipTracker(params)` → `Promise<VendorPartnershipReport>`
- `formatExecutiveSummaryAsMarkdown(summary)` → `string`
- `formatPTLVerificationAsMarkdown(report)` → `string`
- `formatVendorPartnershipAsMarkdown(report)` → `string`
- `getConfig()` → `AnalystConfig`
- `updateConfig(config)` → `void`

### Tool Provider Interface

```typescript
interface ToolProvider {
  searchCompetitors(args: SearchCompetitorsArgs): Promise<SearchCompetitorsResponse>;
  fetchEvents(args: FetchEventsArgs): Promise<FetchEventsResponse>;
  getPlacesRatings(args: GetPlacesRatingsArgs): Promise<GetPlacesRatingsResponse>;
  listObservations(args: ListObservationsArgs): Promise<ListObservationsResponse>;
  listFutureEvents(args: ListFutureEventsArgs): Promise<ListFutureEventsResponse>;
  generateExecSummary?(args: GenerateExecSummaryArgs): Promise<GenerateExecSummaryResponse>;
}
```

## Configuration

### Environment Variables

```bash
# Organization
DEFAULT_ORG_ID=your-org-id
DEFAULT_MARKET=Arizona

# Alert Thresholds
ALERT_PRICE_DISADVANTAGE_THRESHOLD=10
ALERT_PROMO_DISCOUNT_THRESHOLD=25
ALERT_EVENT_PROXIMITY_MILES=10
ALERT_EVENT_PROXIMITY_DAYS=7
ALERT_REVIEW_DELTA_THRESHOLD=-0.3

# Alert Behavior
ALERT_DEDUPE_WINDOW_HOURS=6
ALERT_QUIET_START_HOUR=22
ALERT_QUIET_END_HOUR=7

# Defaults
DEFAULT_LOOKBACK_DAYS=14
DEFAULT_LOOKAHEAD_DAYS=21

# Logging
LOG_LEVEL=info
```

### Programmatic Configuration

```typescript
const analyst = new DispensaryIntelligenceAnalyst(toolProvider, {
  organization: {
    orgId: 'my-org',
    name: 'My Dispensary',
    primaryMarket: 'California',
  },
  alertConfig: {
    thresholds: {
      priceDisadvantage: 15,
      promoDiscount: 30,
      eventProximityMiles: 5,
      eventProximityDays: 5,
      reviewDelta: -0.5,
    },
    dedupeWindowHours: 12,
    quietHoursStart: 23,
    quietHoursEnd: 6,
    enabled: true,
  },
  defaultLookbackDays: 7,
  defaultLookaheadDays: 14,
});
```

## Compliance

This system is designed with compliance in mind:

- **Aggregate data only** — No PII collection or storage
- **Public sources** — All data from publicly available sources
- **Citations** — All findings cite their sources
- **Anonymized** — Competitor data aggregated and anonymized

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Architecture

```
src/
├── types/              # TypeScript type definitions
├── tools/              # Tool provider implementations
│   ├── base-provider.ts
│   └── mock-provider.ts
├── analysis/           # Analysis engines
│   ├── alerts.ts       # Smart alerts
│   └── analyzer.ts     # Data analysis
├── reports/            # Report generators
│   ├── executive-summary.ts
│   ├── ptl-verification.ts
│   └── vendor-partnership.ts
├── utils/              # Utilities
│   └── config.ts
└── dispensary-intelligence-analyst.ts  # Main class
```

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
