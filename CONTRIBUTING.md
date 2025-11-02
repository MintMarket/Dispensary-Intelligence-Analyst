# Contributing to Dispensary Intelligence Analyst

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Dispensary-Intelligence-Analyst.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Build the project
npm run build
```

### Running Examples

```bash
# Run basic usage example
npm run dev examples/basic-usage.ts

# Run PTL verification example
npm run dev examples/ptl-verification.ts

# Run vendor partnership example
npm run dev examples/vendor-partnership.ts
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Format code
npm run format
```

**Key conventions:**
- Use TypeScript strict mode
- Document all public methods with JSDoc
- Export types alongside implementations
- Use descriptive variable names
- Keep functions focused and small

### Testing

```bash
# Run tests (when available)
npm test
```

**Testing guidelines:**
- Write unit tests for analysis functions
- Use MockToolProvider for integration tests
- Test edge cases (empty data, null values, etc.)
- Validate markdown output formatting

## Project Structure

```
src/
├── types/              # TypeScript type definitions
│   └── index.ts
├── tools/              # Tool provider implementations
│   ├── base-provider.ts
│   ├── mock-provider.ts
│   └── index.ts
├── analysis/           # Analysis engines
│   ├── alerts.ts       # Smart alerts
│   ├── analyzer.ts     # Data analysis
│   └── index.ts
├── reports/            # Report generators
│   ├── executive-summary.ts
│   ├── ptl-verification.ts
│   ├── vendor-partnership.ts
│   └── index.ts
├── utils/              # Utilities
│   ├── config.ts
│   └── index.ts
├── dispensary-intelligence-analyst.ts  # Main class
└── index.ts            # Main exports
```

## Making Changes

### Adding New Features

1. **Discuss First** — Open an issue to discuss the feature before implementing
2. **Follow Patterns** — Match existing code style and architecture
3. **Update Types** — Add/modify TypeScript types in `src/types/`
4. **Document** — Update README and relevant docs
5. **Test** — Add tests for new functionality

### Adding New Tool Providers

To add a new data source integration:

1. Create a new class extending `BaseToolProvider`
2. Implement all required methods from `ToolProvider` interface
3. Add error handling and logging
4. Create an example showing usage
5. Document configuration requirements

Example:

```typescript
// src/tools/my-provider.ts
import { BaseToolProvider, SearchCompetitorsArgs, SearchCompetitorsResponse } from '../types';

export class MyToolProvider extends BaseToolProvider {
  async searchCompetitors(args: SearchCompetitorsArgs): Promise<SearchCompetitorsResponse> {
    this.log('searchCompetitors', args);

    try {
      // Your implementation
      const results = await myAPI.search(args);
      return { results };
    } catch (error) {
      this.handleError('searchCompetitors', error);
    }
  }

  // ... implement other methods
}
```

### Adding New Alert Types

To add a new smart alert type:

1. Add alert type to `SmartAlert['type']` union in types
2. Create analysis method in `SmartAlertsEngine`
3. Add threshold configuration
4. Update documentation

### Adding New Report Types

To add a new report format:

1. Define input/output types in `src/types/`
2. Create generator class in `src/reports/`
3. Add method to main `DispensaryIntelligenceAnalyst` class
4. Create example in `examples/`
5. Update README

## Code Review Process

1. **Self-Review** — Review your own changes before submitting
2. **Clear Description** — Describe what and why in the PR description
3. **Small PRs** — Keep PRs focused on a single feature/fix
4. **Tests Pass** — Ensure all tests and linting pass
5. **Documentation** — Update docs for user-facing changes

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add support for custom alert thresholds
fix: Correct pricing gap calculation for negative deltas
docs: Update README with PTL verification examples
refactor: Simplify DataAnalyzer.extractCompetitorPromos
test: Add unit tests for SmartAlertsEngine
```

Prefixes:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code refactoring
- `test:` — Adding/updating tests
- `chore:` — Maintenance tasks

## Reporting Issues

When reporting bugs, include:

1. **Description** — Clear description of the issue
2. **Reproduction** — Steps to reproduce
3. **Expected Behavior** — What you expected to happen
4. **Actual Behavior** — What actually happened
5. **Environment** — Node version, OS, relevant config
6. **Code Sample** — Minimal code that reproduces the issue

## Questions?

- Open an issue with the "question" label
- Check existing documentation first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
