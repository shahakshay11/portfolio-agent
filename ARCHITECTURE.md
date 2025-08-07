# Portfolio Agent Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI Interface                            │
│                    (src/index.js)                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Portfolio Evaluator                           │
│               (src/evaluators/portfolio-evaluator.js)          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Browser   │  │  Viewport   │  │ Screenshot  │            │
│  │ Automation  │  │  Testing    │  │  Capture    │            │
│  │(Playwright) │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Analysis Pipeline                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┬─────────────┐
        ▼         ▼         ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Visual    │ │Accessibility│ │Performance  │ │ Subjective  │
│  Analysis   │ │   Testing   │ │  Analysis   │ │ Evaluation  │
│             │ │             │ │             │ │             │
│• Color      │ │• WCAG       │ │• Lighthouse │ │• Aesthetics │
│• Typography │ │• Axe-core   │ │• Load Times │ │• Usability  │
│• Layout     │ │• Contrast   │ │• Bundle     │ │• Innovation │
│• Spacing    │ │             │ │  Size       │ │• Brand      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
        │         │               │             │
        └─────────┼───────────────┼─────────────┘
                  │               │
                  ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Scoring & Aggregation                          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Weighted   │  │ Confidence  │  │Recommendation│            │
│  │   Scoring   │  │   Levels    │  │  Generation │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Report Generation                             │
│              (src/reporters/report-generator.js)               │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    HTML     │  │    JSON     │  │     PDF     │            │
│  │   Report    │  │   Export    │  │   Report    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Subjective Evaluation Framework

### 1. **Quantifiable Proxies for Subjective Qualities**

Instead of relying purely on subjective judgment, we use measurable indicators:

```javascript
Aesthetics = f(
  visual_elements,     // Images, gradients, animations
  color_harmony,       // Palette size, contrast ratios
  typography_quality,  // Font variety, hierarchy
  whitespace_usage,    // Layout density, spacing
  modern_design_patterns // Flexbox, grid, responsive
)
```

### 2. **Multi-Criteria Decision Analysis (MCDA)**

```
Overall Score = Σ(Weight[i] × Score[i])

Where:
- Aesthetics:      25%
- Usability:       30%
- Professionalism: 20%
- Innovation:      15%
- Accessibility:   10%
```

### 3. **Confidence Scoring**

```javascript
confidence = {
  high:   metrics_evaluated >= 15,
  medium: metrics_evaluated >= 10,
  low:    metrics_evaluated < 10
}
```

## Technical Implementation

### Browser Automation Flow
1. **Launch Playwright Browser** (headless: false for visual inspection)
2. **Multi-Viewport Testing** (Desktop: 1920x1080, Mobile: 375x667)
3. **Screenshot Capture** (Full page, element-specific)
4. **DOM Analysis** (Structure, semantic elements)
5. **Performance Metrics** (Lighthouse integration)

### Evaluation Metrics

#### Objective Metrics
- **Performance**: LCP, FID, CLS (Core Web Vitals)
- **Accessibility**: WCAG compliance, contrast ratios
- **SEO**: Meta tags, semantic HTML, structured data
- **Technical**: Valid HTML, CSS efficiency

#### Subjective Proxies
- **Visual Appeal**: Element count, color palette analysis
- **Modern Design**: CSS Grid/Flexbox usage, design patterns
- **User Experience**: Navigation structure, content organization

## Usage Examples

### Basic Evaluation
```bash
npm run evaluate https://portfolio-example.com
```

### Comprehensive Analysis
```bash
npm run evaluate https://portfolio-example.com -- --mobile --accessibility --performance
```

### Batch Processing
```bash
npm run batch portfolios.json
```

### Comparison Analysis
```bash
npm run compare https://site1.com https://site2.com https://site3.com
```

## Key Benefits

1. **Objectivity**: Uses measurable proxies for subjective qualities
2. **Consistency**: Standardized evaluation criteria
3. **Comprehensive**: Covers technical and design aspects
4. **Actionable**: Provides specific improvement recommendations
5. **Scalable**: Can evaluate multiple portfolios systematically

## Handling Subjectivity

### Statistical Approach
- **Baseline Scoring**: Establish benchmarks from high-quality portfolios
- **Comparative Analysis**: Score relative to portfolio standards
- **Weighted Criteria**: Balance objective metrics with design principles

### Design Principles Integration
- **Visual Hierarchy**: Measure heading structure, contrast patterns
- **Balance**: Analyze element distribution, whitespace usage
- **Consistency**: Check for pattern repetition, style coherence
- **Accessibility**: Quantify inclusive design practices

This architecture provides a systematic approach to evaluating design portfolios while maintaining objectivity in subjective assessments.