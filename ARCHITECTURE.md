# Architecture

This document describes the architecture of the Dispensary Intelligence Analyst system.

## Overview

The system is designed as a modular, extensible intelligence platform with the following key characteristics:

- **Data Source Agnostic** — Tool Provider interface allows integration with any data source
- **Compliance-First** — All analysis respects privacy and compliance requirements
- **Real-Time Alerting** — Smart alerts with deduplication and threshold-based detection
- **Multiple Report Formats** — Executive summaries, PTL verification, vendor tracking

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          DispensaryIntelligenceAnalyst (Main Class)         │
│  • Orchestrates data gathering and analysis                 │
│  • Manages configuration and tool providers                 │
│  • Generates reports in multiple formats                    │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   Tool Provider  │ │   Analysis   │ │     Reports     │
│                  │ │   Engines    │ │   Generators    │
│ • Search         │ │              │ │                 │
│ • Events         │ │ • Alerts     │ │ • Exec Summary  │
│ • Ratings        │ │ • Analyzer   │ │ • PTL Verify    │
│ • Observations   │ │              │ │ • Vendor Track  │
└──────────────────┘ └──────────────┘ └─────────────────┘
```

## Core Components

### 1. Tool Provider Layer

**Purpose:** Abstract data source integration

**Components:**
- `ToolProvider` (interface) — Defines data fetching contract
- `BaseToolProvider` (abstract class) — Common functionality
- `MockToolProvider` (implementation) — Development/testing provider
- Custom providers (user-implemented) — Production data sources

**Key Methods:**
- `searchCompetitors()` — Web/news search
- `fetchEvents()` — Event APIs
- `getPlacesRatings()` — Rating/review APIs
- `listObservations()` — Internal database
- `listFutureEvents()` — Internal database

### 2. Analysis Layer

**Purpose:** Transform raw data into actionable insights

**Components:**

#### DataAnalyzer
- Extract competitor promos from search results
- Identify pricing gaps
- Analyze event proximity and timing
- Calculate rating deltas
- Identify variety/brand gaps
- Discover vendor opportunities

#### SmartAlertsEngine
- Threshold-based alert detection
- Deduplication (6-hour window)
- Quiet hours support
- Multiple alert types:
  - Price disadvantage
  - Competitor promo
  - Event nearby
  - Review delta
  - New opening

### 3. Reports Layer

**Purpose:** Generate formatted intelligence reports

**Components:**

#### ExecutiveSummaryGenerator
Produces comprehensive competitive intelligence reports with:
- Executive summary (3-6 bullets)
- Detailed findings (promos, pricing, events, ratings, gaps)
- Actionable recommendations
- Smart alerts
- Source citations
- Data quality notes

#### PTLVerificationGenerator
Verifies internal pricing against public listings:
- Identifies price mismatches
- Calculates severity (critical/high/medium/low)
- Prioritizes fixes
- Groups by source

#### VendorPartnershipTracker
Identifies vendor opportunities:
- Extracts vendor activity from events/observations
- Suggests activation dates and formats
- Builds activation calendar
- Prioritizes by market presence

### 4. Configuration Layer

**Purpose:** Centralized configuration management

**Components:**
- Environment variable support
- Programmatic configuration
- Validation and defaults
- Alert threshold customization

## Data Flow

### Executive Summary Generation

```
1. Client calls generateExecutiveSummary()
           ↓
2. Analyst gathers data from ToolProvider
   • listObservations
   • searchCompetitors
   • fetchEvents
   • listFutureEvents
   • getPlacesRatings
           ↓
3. DataAnalyzer processes raw data
   • Extract promos
   • Identify gaps
   • Analyze events
   • Calculate deltas
   • Find opportunities
           ↓
4. SmartAlertsEngine generates alerts
   • Check thresholds
   • Deduplicate
   • Assign severity
           ↓
5. ExecutiveSummaryGenerator builds report
   • Synthesize findings
   • Generate recommendations
   • Cite sources
   • Format markdown
           ↓
6. Return ExecutiveSummary to client
```

## Extensibility Points

### Custom Tool Providers

Implement `ToolProvider` interface to connect to any data source:

```typescript
class MyToolProvider extends BaseToolProvider {
  async searchCompetitors(args) {
    // Your implementation
  }
  // ... other methods
}
```

### Custom Alert Types

Extend `SmartAlertsEngine` to add new alert types:

```typescript
class MyAlertsEngine extends SmartAlertsEngine {
  analyzeCustomMetric(data) {
    // Your custom alert logic
  }
}
```

### Custom Report Formats

Create new report generators alongside existing ones:

```typescript
class CustomReportGenerator {
  generate(input) {
    // Your custom report logic
  }
}
```

## Security & Compliance

### Data Privacy
- No PII collection
- Aggregate data only
- Public sources only
- Configurable data retention

### Compliance Features
- Compliance mode flag
- Source attribution required
- Anonymization of competitor data
- Audit trail via logging

## Performance Considerations

### Parallel Data Fetching
All tool provider calls use `Promise.all()` for parallel execution

### Deduplication
Smart alerts maintain in-memory deduplication map with configurable window

### Caching
Tool providers can implement internal caching (not included in base implementation)

### Scalability
- Stateless design (no shared state between calls)
- Tool provider abstraction allows distributed data sources
- Report generation is CPU-bound but fast (<1s for typical datasets)

## Error Handling

### Graceful Degradation
If a tool provider method fails:
1. Error is caught and logged
2. Empty result returned
3. Analysis continues with available data
4. Data notes indicate missing data

### Validation
- Configuration validation on startup
- Input validation in tool provider methods
- Type safety via TypeScript

## Testing Strategy

### Unit Tests
- Test individual analysis functions
- Mock tool provider responses
- Validate alert thresholds

### Integration Tests
- Test full report generation flow
- Use MockToolProvider for predictable data
- Validate markdown formatting

### End-to-End Tests
- Test with real tool provider implementations
- Validate against known datasets
- Performance benchmarking

## Deployment Patterns

### Standalone Service
Run as a Node.js service with REST API wrapper

### Scheduled Jobs
Cron-style execution for periodic report generation

### Event-Driven
Trigger analysis on data updates via message queue

### Embedded Library
Import and use directly in your application
