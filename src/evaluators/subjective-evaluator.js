class SubjectiveDesignEvaluator {
  constructor() {
    this.criteria = {
      aesthetics: {
        weight: 0.25,
        subcriteria: {
          visualAppeal: { weight: 0.3, description: "Overall visual attractiveness" },
          modernDesign: { weight: 0.25, description: "Contemporary design trends" },
          colorHarmony: { weight: 0.25, description: "Color scheme effectiveness" },
          visualBalance: { weight: 0.2, description: "Element distribution and balance" }
        }
      },
      usability: {
        weight: 0.3,
        subcriteria: {
          navigation: { weight: 0.3, description: "Ease of navigation" },
          contentClarity: { weight: 0.25, description: "Information clarity" },
          loadingSpeed: { weight: 0.25, description: "Performance perception" },
          mobileExperience: { weight: 0.2, description: "Mobile responsiveness" }
        }
      },
      professionalism: {
        weight: 0.2,
        subcriteria: {
          consistency: { weight: 0.3, description: "Design consistency throughout" },
          branding: { weight: 0.25, description: "Brand identity strength" },
          contentQuality: { weight: 0.25, description: "Content professionalism" },
          technicalExecution: { weight: 0.2, description: "Technical implementation quality" }
        }
      },
      innovation: {
        weight: 0.15,
        subcriteria: {
          creativity: { weight: 0.4, description: "Creative design solutions" },
          uniqueness: { weight: 0.3, description: "Distinctive design elements" },
          interactivity: { weight: 0.3, description: "Interactive features effectiveness" }
        }
      },
      accessibility: {
        weight: 0.1,
        subcriteria: {
          contrast: { weight: 0.4, description: "Color contrast adequacy" },
          typography: { weight: 0.3, description: "Text readability" },
          navigation: { weight: 0.3, description: "Accessible navigation" }
        }
      }
    };
  }

  async evaluateSubjectiveMetrics(pageAnalysis, technicalMetrics) {
    const results = {};
    
    for (const [criteriaName, criteriaConfig] of Object.entries(this.criteria)) {
      results[criteriaName] = await this.evaluateCriteria(
        criteriaName, 
        criteriaConfig, 
        pageAnalysis, 
        technicalMetrics
      );
    }

    return {
      detailed: results,
      overallScore: this.calculateWeightedScore(results),
      recommendations: this.generateRecommendations(results),
      confidenceLevel: this.calculateConfidenceLevel(results)
    };
  }

  async evaluateCriteria(criteriaName, config, pageAnalysis, technicalMetrics) {
    const subResults = {};
    
    for (const [subName, subConfig] of Object.entries(config.subcriteria)) {
      const score = await this.evaluateSubcriteria(
        criteriaName, 
        subName, 
        pageAnalysis, 
        technicalMetrics
      );
      
      subResults[subName] = {
        score,
        weight: subConfig.weight,
        description: subConfig.description,
        feedback: this.generateSubcriteriaFeedback(criteriaName, subName, score)
      };
    }

    const weightedScore = Object.values(subResults).reduce(
      (sum, result) => sum + (result.score * result.weight), 0
    );

    return {
      subcriteria: subResults,
      weightedScore,
      weight: config.weight,
      feedback: this.generateCriteriaFeedback(criteriaName, weightedScore)
    };
  }

  async evaluateSubcriteria(criteria, subcriteria, pageAnalysis, technicalMetrics) {
    // This is where the subjective evaluation logic happens
    // Using quantifiable proxies for subjective qualities
    
    const evaluationMap = {
      aesthetics: {
        visualAppeal: () => this.evaluateVisualAppeal(pageAnalysis),
        modernDesign: () => this.evaluateModernDesign(pageAnalysis),
        colorHarmony: () => this.evaluateColorHarmony(pageAnalysis.colors),
        visualBalance: () => this.evaluateVisualBalance(pageAnalysis.layout)
      },
      usability: {
        navigation: () => this.evaluateNavigation(pageAnalysis.navigation),
        contentClarity: () => this.evaluateContentClarity(pageAnalysis.content),
        loadingSpeed: () => this.evaluateLoadingSpeed(technicalMetrics.performance),
        mobileExperience: () => this.evaluateMobileExperience(pageAnalysis.responsive)
      },
      professionalism: {
        consistency: () => this.evaluateConsistency(pageAnalysis.design),
        branding: () => this.evaluateBranding(pageAnalysis.branding),
        contentQuality: () => this.evaluateContentQuality(pageAnalysis.content),
        technicalExecution: () => this.evaluateTechnicalExecution(technicalMetrics)
      },
      innovation: {
        creativity: () => this.evaluateCreativity(pageAnalysis.interactions),
        uniqueness: () => this.evaluateUniqueness(pageAnalysis.design),
        interactivity: () => this.evaluateInteractivity(pageAnalysis.interactions)
      },
      accessibility: {
        contrast: () => this.evaluateContrast(pageAnalysis.accessibility),
        typography: () => this.evaluateTypography(pageAnalysis.typography),
        navigation: () => this.evaluateAccessibleNavigation(pageAnalysis.accessibility)
      }
    };

    const evaluator = evaluationMap[criteria]?.[subcriteria];
    return evaluator ? await evaluator() : 75; // Default score
  }

  // Quantifiable proxies for subjective evaluation
  evaluateVisualAppeal(analysis) {
    let score = 60; // Base score
    
    // Modern design elements
    if (analysis.hasWhitespace) score += 10;
    if (analysis.hasImages) score += 8;
    if (analysis.hasGradients || analysis.hasShadows) score += 7;
    if (analysis.fontVariety <= 3) score += 5;
    if (analysis.colorCount >= 3 && analysis.colorCount <= 6) score += 10;
    
    return Math.min(score, 100);
  }

  evaluateModernDesign(analysis) {
    let score = 50;
    
    const modernFeatures = [
      analysis.hasFlexbox,
      analysis.hasGrid,
      analysis.hasRoundedCorners,
      analysis.hasMinimalDesign,
      analysis.hasResponsiveImages,
      analysis.usesModernFonts
    ];
    
    score += modernFeatures.filter(Boolean).length * 8;
    return Math.min(score, 100);
  }

  evaluateColorHarmony(colors) {
    if (!colors || colors.palette.length < 2) return 60;
    
    // Simplified color harmony analysis
    const paletteSize = colors.palette.length;
    if (paletteSize >= 3 && paletteSize <= 5) return 85;
    if (paletteSize === 2 || paletteSize === 6) return 75;
    return 65;
  }

  evaluateNavigation(navigation) {
    let score = 50;
    
    if (navigation.hasMainNav) score += 20;
    if (navigation.hasBreadcrumbs) score += 10;
    if (navigation.hasSearch) score += 10;
    if (navigation.linkCount >= 3 && navigation.linkCount <= 7) score += 10;
    
    return Math.min(score, 100);
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    for (const [criteriaName, criteriaResult] of Object.entries(results)) {
      if (criteriaResult.weightedScore < 70) {
        recommendations.push({
          category: criteriaName,
          priority: criteriaResult.weight > 0.2 ? 'high' : 'medium',
          suggestion: this.getImprovementSuggestion(criteriaName, criteriaResult.weightedScore),
          impact: `Could improve overall score by ${Math.round(criteriaResult.weight * 30)}%`
        });
      }
    }
    
    return recommendations.sort((a, b) => 
      (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0)
    );
  }

  getImprovementSuggestion(criteria, score) {
    const suggestions = {
      aesthetics: "Consider improving color harmony, adding visual elements, or enhancing overall visual appeal",
      usability: "Focus on navigation clarity, content organization, and mobile responsiveness",
      professionalism: "Ensure design consistency, strengthen branding, and improve content quality",
      innovation: "Add creative interactive elements or unique design features",
      accessibility: "Improve color contrast, typography readability, and navigation accessibility"
    };
    
    return suggestions[criteria] || "General improvements needed";
  }

  calculateWeightedScore(results) {
    return Object.values(results).reduce(
      (sum, result) => sum + (result.weightedScore * result.weight), 0
    );
  }

  calculateConfidenceLevel(results) {
    // Confidence based on how many metrics we could evaluate
    const totalMetrics = Object.values(results).reduce(
      (sum, result) => sum + Object.keys(result.subcriteria).length, 0
    );
    
    if (totalMetrics >= 15) return 'high';
    if (totalMetrics >= 10) return 'medium';
    return 'low';
  }

  generateCriteriaFeedback(criteria, score) {
    if (score >= 80) return `Excellent ${criteria} implementation`;
    if (score >= 70) return `Good ${criteria} with minor improvements needed`;
    if (score >= 60) return `Average ${criteria} with room for enhancement`;
    return `${criteria} needs significant improvement`;
  }

  generateSubcriteriaFeedback(criteria, subcriteria, score) {
    const feedbackMap = {
      high: "Exceeds expectations",
      good: "Meets standards with minor tweaks possible",
      average: "Acceptable but could be enhanced",
      low: "Requires attention and improvement"
    };
    
    if (score >= 85) return feedbackMap.high;
    if (score >= 75) return feedbackMap.good;
    if (score >= 65) return feedbackMap.average;
    return feedbackMap.low;
  }

  // Placeholder implementations for remaining evaluation methods
  evaluateVisualBalance(layout) { return 80; }
  evaluateContentClarity(content) { return 75; }
  evaluateLoadingSpeed(performance) { return performance?.score || 80; }
  evaluateMobileExperience(responsive) { return responsive?.score || 85; }
  evaluateConsistency(design) { return 80; }
  evaluateBranding(branding) { return 75; }
  evaluateContentQuality(content) { return 80; }
  evaluateTechnicalExecution(metrics) { return 85; }
  evaluateCreativity(interactions) { return 70; }
  evaluateUniqueness(design) { return 75; }
  evaluateInteractivity(interactions) { return 80; }
  evaluateContrast(accessibility) { return accessibility?.contrast || 85; }
  evaluateTypography(typography) { return typography?.readability || 80; }
  evaluateAccessibleNavigation(accessibility) { return 80; }
}

module.exports = SubjectiveDesignEvaluator;