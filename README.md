# Portfolio Agent - Design Evaluation Framework

An AI-powered design portfolio evaluation system using Playwright MCP for automated testing and analysis.

## Features

- **Automated Design Analysis**: Uses Playwright MCP for browser automation
- **Objective Metrics**: Performance, accessibility, and technical quality assessment
- **Subjective Framework**: Structured approach to evaluate design aesthetics
- **Comprehensive Reports**: Detailed analysis with actionable recommendations

## Quick Start

1. Install dependencies: `npm install`
2. Configure MCP server: Follow setup in `config/mcp-config.json`
3. Run evaluation: `npm run evaluate <portfolio-url>`
4. View reports: `npm run report`

## Project Structure

```
portfolio_agent/
├── src/
│   ├── evaluators/          # Core evaluation modules
│   ├── metrics/             # Metrics calculation
│   ├── reporters/           # Report generation
│   └── utils/               # Helper functions
├── tests/                   # Playwright test files
├── config/                  # Configuration files
├── reports/                 # Generated evaluation reports
└── examples/                # Example portfolio evaluations
```

## Architecture

The system uses a component-based architecture with Playwright MCP at its core for reliable, fast browser automation without requiring vision models.