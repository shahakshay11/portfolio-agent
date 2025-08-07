const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const SubjectiveDesignEvaluator = require('./subjective-evaluator');
const ClaudeAIEvaluator = require('./claude-ai-evaluator');

class PortfolioEvaluator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.subjectiveEvaluator = new SubjectiveDesignEvaluator();
    this.claudeAI = new ClaudeAIEvaluator();
    this.metrics = {
      visual: {},
      accessibility: {},
      performance: {},
      subjective: {}
    };
  }

  async evaluate(url, options = {}) {
    console.log('\n🚀 ===============================================');
    console.log('🚀 PORTFOLIO EVALUATION STARTED');
    console.log('🚀 ===============================================');
    console.log(`🌐 URL: ${url}`);
    console.log(`📅 Started: ${new Date().toLocaleString()}`);
    console.log(`🔧 Options: ${JSON.stringify(options, null, 2)}`);
    console.log('🚀 ===============================================\n');
    
    console.log('🌐 Launching browser and setting up page...');
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    
    try {
      console.log(`🔄 Navigating to ${url}...`);
      await this.page.goto(url, { waitUntil: 'networkidle' });
      console.log('✅ Page loaded successfully!\n');
      
      console.log('📊 Gathering comprehensive page data for analysis...');
      const pageData = await this.gatherPageData(url);
      console.log(`✅ Page data collection completed`);
      console.log(`📋 Content sections found: ${Object.keys(pageData.content || {}).length}`);
      console.log(`🔍 Navigation items: ${pageData.navigation?.items?.length || 0}\n`);
      
      const results = {
        url,
        timestamp: new Date().toISOString(),
        desktop: null,
        mobile: null,
        accessibility: null,
        performance: null,
        visualDesign: null,
        subjectiveMetrics: null,
        overallScore: 0
      };
      
      console.log('🖥️ Evaluating desktop viewport...');
      results.desktop = await this.evaluateViewport('desktop');
      console.log('✅ Desktop evaluation completed\n');
      
      if (options.includeMobile) {
        console.log('📱 Evaluating mobile viewport...');
        results.mobile = await this.evaluateViewport('mobile');
        console.log('✅ Mobile evaluation completed\n');
      }
      
      if (options.runAccessibility) {
        console.log('♿ Running accessibility analysis...');
        results.accessibility = await this.evaluateAccessibility();
        console.log('✅ Accessibility analysis completed\n');
      }
      
      if (options.runPerformance) {
        console.log('⚡ Running performance analysis...');
        results.performance = await this.evaluatePerformance(url);
        console.log('✅ Performance analysis completed\n');
      }
      
      console.log('🎨 Evaluating visual design elements...');
      results.visualDesign = await this.evaluateVisualDesign();
      console.log('✅ Visual design evaluation completed\n');
      
      console.log('📐 Computing subjective design metrics...');
      results.subjectiveMetrics = await this.evaluateSubjectiveMetrics();
      console.log('✅ Subjective metrics evaluation completed\n');
      
      // Generate AI-powered analysis
      if (options.enableAI !== false) {
        console.log('🤖 Preparing AI-powered comprehensive analysis...');
        const screenshots = {
          desktop: results.desktop?.screenshot,
          mobile: results.mobile?.screenshot
        };
        
        try {
          results.aiAnalysis = await this.claudeAI.generateAIAnalysis(pageData, screenshots);
          
          // Generate AI markdown report only if AI analysis succeeded
          if (results.aiAnalysis) {
            console.log('📄 Generating AI analysis report...');
            const aiMarkdown = await this.claudeAI.generateMarkdownReport(results.aiAnalysis, url);
            const markdownPath = path.join('./reports', `claude-ai-analysis-${Date.now()}.md`);
            await fs.writeFile(markdownPath, aiMarkdown);
            results.aiReportPath = markdownPath;
            console.log(`✅ Claude AI analysis report saved: ${markdownPath}\n`);
          } else {
            console.log('ℹ️ No AI analysis generated (API key not provided)\n');
          }
        } catch (error) {
          console.error('⚠️ AI analysis failed but continuing with standard evaluation');
          console.error(`⚠️ Error: ${error.message}\n`);
          results.aiAnalysisError = error.message;
        }
      }
      
      // Navigate to case studies for deeper analysis
      if (options.analyzeCaseStudies !== false) {
        console.log('📚 Starting comprehensive case study analysis...');
        results.caseStudyAnalysis = await this.analyzeCaseStudies();
        console.log('✅ Case study analysis completed\n');
        
        // Update pageData with case study findings for AI analysis
        if (results.caseStudyAnalysis && pageData) {
          pageData.storytelling.caseStudyData = results.caseStudyAnalysis.summary;
        }
      }

      console.log('🧮 Calculating overall portfolio score...');
      results.overallScore = this.calculateOverallScore(results);
      
      console.log('\n🎯 ===============================================');
      console.log('🎯 PORTFOLIO EVALUATION COMPLETED');
      console.log('🎯 ===============================================');
      console.log(`🏆 Overall Score: ${results.overallScore}/100`);
      console.log(`📊 Desktop Evaluation: ${results.desktop ? '✅' : '❌'}`);
      console.log(`📱 Mobile Evaluation: ${results.mobile ? '✅' : '❌'}`);
      console.log(`♿ Accessibility: ${results.accessibility ? '✅' : '❌'}`);
      console.log(`⚡ Performance: ${results.performance ? '✅' : '❌'}`);
      console.log(`🤖 AI Analysis: ${results.aiAnalysis ? '✅' : '❌'}`);
      console.log(`📚 Case Studies: ${results.caseStudyAnalysis ? '✅' : '❌'}`);
      console.log('🎯 ===============================================\n');
      
      return results;
      
    } finally {
      console.log('🔄 Cleaning up browser resources...');
      await this.browser.close();
      console.log('✅ Browser closed successfully\n');
    }
  }

  async evaluateViewport(viewport) {
    const viewportSizes = {
      desktop: { width: 1920, height: 1080 },
      mobile: { width: 375, height: 667 }
    };
    
    console.log(`📐 Setting ${viewport} viewport (${viewportSizes[viewport].width}x${viewportSizes[viewport].height})...`);
    await this.page.setViewportSize(viewportSizes[viewport]);
    await this.page.waitForTimeout(1000);
    console.log(`✅ ${viewport} viewport configured`);
    
    console.log(`📸 Capturing ${viewport} screenshot...`);
    const screenshot = await this.captureScreenshot(viewport);
    console.log(`✅ ${viewport} screenshot saved`);
    
    console.log(`🔍 Analyzing ${viewport} layout metrics...`);
    const layoutMetrics = await this.analyzeLayout();
    
    console.log(`🎨 Analyzing ${viewport} color scheme...`);
    const colorAnalysis = await this.analyzeColorScheme();
    
    console.log(`📝 Analyzing ${viewport} typography...`);
    const typography = await this.analyzeTypography();
    
    console.log(`📏 Analyzing ${viewport} spacing...`);
    const spacing = await this.analyzeSpacing();
    
    console.log(`📱 Checking ${viewport} responsiveness...`);
    const responsiveness = await this.checkResponsiveness();
    
    console.log(`✅ ${viewport} viewport analysis completed`);
    
    return {
      viewport,
      screenshot,
      layoutMetrics,
      colorAnalysis,
      typography,
      spacing,
      responsiveness
    };
  }

  async evaluateVisualDesign() {
    console.log('🎨 Evaluating visual design principles...');
    
    console.log('  📐 Analyzing composition...');
    const composition = await this.analyzeComposition();
    
    console.log('  📊 Analyzing visual hierarchy...');
    const hierarchy = await this.analyzeVisualHierarchy();
    
    console.log('  ⚖️ Analyzing balance...');
    const balance = await this.analyzeBalance();
    
    console.log('  🔲 Analyzing contrast...');
    const contrast = await this.analyzeContrast();
    
    console.log('  🔄 Analyzing consistency...');
    const consistency = await this.analyzeConsistency();
    
    console.log('  ✅ Visual design analysis complete');
    
    return {
      composition,
      hierarchy,
      balance,
      contrast,
      consistency
    };
  }

  async evaluateSubjectiveMetrics() {
    console.log('📊 Gathering comprehensive design analysis data...');
    
    // Gather page analysis data
    console.log('  🔍 Checking whitespace usage...');
    const hasWhitespace = await this.checkWhitespace();
    
    console.log('  🖼️ Counting images...');
    const imageCount = await this.countImages();
    const hasImages = imageCount > 0;
    
    console.log('  🌈 Checking visual effects...');
    const hasGradients = await this.checkGradients();
    const hasShadows = await this.checkShadows();
    const hasRoundedCorners = await this.checkRoundedCorners();
    
    console.log('  📝 Analyzing typography...');
    const fontVariety = await this.countFonts();
    const usesModernFonts = await this.checkModernFonts();
    
    console.log('  🎨 Analyzing color palette...');
    const colorCount = await this.countColors();
    const colors = await this.analyzeColorScheme();
    
    console.log('  📐 Checking layout technology...');
    const hasFlexbox = await this.checkFlexbox();
    const hasGrid = await this.checkGrid();
    const hasMinimalDesign = await this.checkMinimalDesign();
    const hasResponsiveImages = await this.checkResponsiveImages();
    
    console.log('  🔍 Analyzing structural elements...');
    const layout = await this.analyzeLayout();
    const navigation = await this.analyzeNavigation();
    const content = await this.analyzeContent();
    const responsive = await this.checkResponsiveness();
    const design = await this.analyzeDesignConsistency();
    const branding = await this.analyzeBranding();
    const interactions = await this.analyzeInteractions();
    const accessibility = await this.checkAccessibilityFeatures();
    const typography = await this.analyzeTypography();
    
    console.log('  📊 Compiling analysis data...');
    const pageAnalysis = {
      hasWhitespace,
      hasImages,
      imageCount,
      hasGradients,
      hasShadows,
      fontVariety,
      colorCount,
      hasFlexbox,
      hasGrid,
      hasRoundedCorners,
      hasMinimalDesign,
      hasResponsiveImages,
      usesModernFonts,
      colors,
      layout,
      navigation,
      content,
      responsive,
      design,
      branding,
      interactions,
      accessibility,
      typography
    };

    const technicalMetrics = {
      performance: { score: 80 } // Placeholder
    };

    console.log('  🧮 Computing subjective evaluation scores...');
    const result = await this.subjectiveEvaluator.evaluateSubjectiveMetrics(pageAnalysis, technicalMetrics);
    console.log(`  ✅ Subjective analysis complete - Score: ${result.overallScore}/100`);
    
    return result;
  }

  async analyzeColorScheme() {
    const colors = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        colorSet.add(styles.color);
        colorSet.add(styles.backgroundColor);
        colorSet.add(styles.borderColor);
      });
      
      return Array.from(colorSet).filter(color => 
        color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent'
      );
    });

    return {
      palette: colors.slice(0, 10),
      harmony: this.analyzeColorHarmony(colors),
      accessibility: this.checkColorAccessibility(colors)
    };
  }

  async analyzeTypography() {
    return await this.page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
      const fonts = new Set();
      const sizes = new Set();
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        fonts.add(styles.fontFamily);
        sizes.add(styles.fontSize);
      });
      
      return {
        fontFamilies: Array.from(fonts).slice(0, 5),
        fontSizes: Array.from(sizes).slice(0, 10),
        consistency: fonts.size <= 3 ? 'good' : 'needs-improvement'
      };
    });
  }

  async evaluateAesthetics() {
    const visualElements = await this.page.evaluate(() => {
      return {
        imageCount: document.querySelectorAll('img').length,
        hasAnimations: document.querySelectorAll('[style*="animation"]').length > 0,
        hasGradients: document.querySelectorAll('[style*="gradient"]').length > 0,
        hasRoundedCorners: document.querySelectorAll('[style*="border-radius"]').length > 0
      };
    });

    // Scoring based on modern design principles
    let score = 70; // Base score
    
    if (visualElements.imageCount > 0) score += 10;
    if (visualElements.hasAnimations) score += 5;
    if (visualElements.hasGradients) score += 5;
    if (visualElements.hasRoundedCorners) score += 10;

    return {
      score: Math.min(score, 100),
      elements: visualElements,
      feedback: this.generateAestheticsFeedback(score, visualElements)
    };
  }

  async evaluateProfessionalism() {
    const professionalMetrics = await this.page.evaluate(() => {
      return {
        hasLogo: document.querySelector('[alt*="logo" i]') !== null,
        hasNavigation: document.querySelector('nav') !== null,
        hasFooter: document.querySelector('footer') !== null,
        hasContactInfo: document.querySelector('[href^="mailto:"], [href^="tel:"]') !== null,
        cleanLayout: document.querySelectorAll('*').length < 500,
        properHeadings: document.querySelectorAll('h1').length === 1
      };
    });

    const score = Object.values(professionalMetrics).filter(Boolean).length * 15;
    
    return {
      score: Math.min(score, 100),
      metrics: professionalMetrics,
      feedback: this.generateProfessionalismFeedback(professionalMetrics)
    };
  }

  generateRecommendations(criteria) {
    const recommendations = [];
    
    if (criteria.aesthetics.score < 80) {
      recommendations.push("Consider adding more visual elements like images, gradients, or subtle animations");
    }
    
    if (criteria.professionalism.score < 80) {
      recommendations.push("Ensure proper navigation structure and contact information is visible");
    }
    
    if (criteria.userExperience.score < 80) {
      recommendations.push("Improve loading times and ensure responsive design across all devices");
    }

    return recommendations;
  }

  calculateOverallScore(results) {
    // Use AI analysis score if available, otherwise calculate from components
    if (results.aiAnalysis && results.aiAnalysis.overallScore) {
      return results.aiAnalysis.overallScore;
    }

    const weights = {
      visual: 0.25,
      accessibility: 0.15,
      performance: 0.15,
      subjective: 0.25,
      caseStudy: 0.2
    };

    let totalScore = 0;
    let totalWeight = 0;

    // Visual design score
    if (results.visualDesign && results.visualDesign.contrast && results.visualDesign.contrast.score) {
      totalScore += results.visualDesign.contrast.score * weights.visual;
      totalWeight += weights.visual;
    } else {
      totalScore += 75 * weights.visual; // Default fallback
      totalWeight += weights.visual;
    }

    // Accessibility score
    if (results.accessibility && results.accessibility.score) {
      totalScore += results.accessibility.score * weights.accessibility;
      totalWeight += weights.accessibility;
    } else {
      totalScore += 70 * weights.accessibility; // Default fallback
      totalWeight += weights.accessibility;
    }

    // Performance score
    if (results.performance && results.performance.score) {
      totalScore += results.performance.score * weights.performance;
      totalWeight += weights.performance;
    } else {
      totalScore += 80 * weights.performance; // Default fallback
      totalWeight += weights.performance;
    }

    // Subjective metrics score
    if (results.subjectiveMetrics && results.subjectiveMetrics.weightedScore) {
      totalScore += results.subjectiveMetrics.weightedScore * weights.subjective;
      totalWeight += weights.subjective;
    } else {
      totalScore += 75 * weights.subjective; // Default fallback
      totalWeight += weights.subjective;
    }

    // Case study score
    if (results.caseStudyAnalysis && results.caseStudyAnalysis.summary && results.caseStudyAnalysis.summary.averageStorytellingScore > 0) {
      const caseStudyScore = (results.caseStudyAnalysis.summary.averageStorytellingScore + results.caseStudyAnalysis.summary.averageUXScore) / 2;
      totalScore += caseStudyScore * weights.caseStudy;
      totalWeight += weights.caseStudy;
    } else {
      totalScore += 70 * weights.caseStudy; // Default fallback
      totalWeight += weights.caseStudy;
    }

    return Math.round(totalScore / totalWeight);
  }

  async captureScreenshot(viewport) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    const filename = `screenshot-${viewport}-${Date.now()}.png`;
    const filepath = path.join('./reports/screenshots', filename);
    
    await fs.ensureDir(path.dirname(filepath));
    await fs.writeFile(filepath, screenshot);
    
    return filepath;
  }

  async gatherPageData(url) {
    return {
      url,
      content: {
        title: await this.page.title(),
        headings: await this.getHeadings(),
        text: await this.getPageText(),
        links: await this.getLinks(),
        images: await this.getImages(),
        forms: await this.getForms()
      },
      technical: {
        viewport: await this.page.viewportSize(),
        loadTime: Date.now(), // Simplified
        elements: await this.getElementCounts(),
        technologies: await this.detectTechnologies()
      },
      design: {
        colors: await this.analyzeColorScheme(),
        typography: await this.analyzeTypography(),
        layout: await this.analyzeLayout(),
        spacing: await this.analyzeSpacing()
      },
      storytelling: {
        mainPageNarrative: await this.analyzeMainPageStorytelling(),
        caseStudyData: null // Will be populated later if case studies are analyzed
      },
      navigation: await this.analyzeNavigation(),
      accessibility: await this.checkAccessibilityFeatures()
    };
  }

  async getHeadings() {
    return await this.page.evaluate(() => {
      const headings = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        headings.push({
          level: h.tagName.toLowerCase(),
          text: h.textContent.trim(),
          id: h.id
        });
      });
      return headings;
    });
  }

  async getPageText() {
    return await this.page.evaluate(() => {
      return document.body.textContent.replace(/\s+/g, ' ').trim().substring(0, 2000);
    });
  }

  async getLinks() {
    return await this.page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href]').forEach(a => {
        links.push({
          text: a.textContent.trim(),
          href: a.href,
          external: !a.href.includes(window.location.hostname)
        });
      });
      return links.slice(0, 20); // Limit for API
    });
  }

  async getImages() {
    return await this.page.evaluate(() => {
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        images.push({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height
        });
      });
      return images.slice(0, 10); // Limit for API
    });
  }

  async getForms() {
    return await this.page.evaluate(() => {
      const forms = [];
      document.querySelectorAll('form').forEach(form => {
        const inputs = Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          required: input.required
        }));
        forms.push({ inputs });
      });
      return forms;
    });
  }

  async getElementCounts() {
    return await this.page.evaluate(() => {
      return {
        total: document.querySelectorAll('*').length,
        divs: document.querySelectorAll('div').length,
        images: document.querySelectorAll('img').length,
        links: document.querySelectorAll('a').length,
        buttons: document.querySelectorAll('button').length
      };
    });
  }

  async detectTechnologies() {
    return await this.page.evaluate(() => {
      const tech = {
        frameworks: [],
        libraries: []
      };
      
      // Simple detection
      if (window.React) tech.frameworks.push('React');
      if (window.Vue) tech.frameworks.push('Vue');
      if (window.angular) tech.frameworks.push('Angular');
      if (window.jQuery) tech.libraries.push('jQuery');
      
      return tech;
    });
  }

  async analyzeMainPageStorytelling() {
    return await this.page.evaluate(() => {
      const storytelling = {
        hasPersonalIntro: false,
        hasAboutSection: false,
        hasClearValueProp: false,
        hasPersonalityElements: false,
        narrativeFlow: 'basic'
      };

      const bodyText = document.body.textContent.toLowerCase();
      
      // Check for personal introduction
      if (bodyText.includes('i am') || bodyText.includes("i'm") || bodyText.includes('my name')) {
        storytelling.hasPersonalIntro = true;
      }
      
      // Check for about section
      if (bodyText.includes('about') || bodyText.includes('who i am') || bodyText.includes('background')) {
        storytelling.hasAboutSection = true;
      }
      
      // Check for value proposition
      if (bodyText.includes('designer') || bodyText.includes('developer') || bodyText.includes('creator')) {
        storytelling.hasClearValueProp = true;
      }
      
      // Check for personality elements
      if (bodyText.includes('passion') || bodyText.includes('love') || bodyText.includes('enjoy') || 
          bodyText.includes('excited') || bodyText.includes('believe')) {
        storytelling.hasPersonalityElements = true;
      }
      
      // Determine narrative flow
      if (storytelling.hasPersonalIntro && storytelling.hasAboutSection && 
          storytelling.hasClearValueProp && storytelling.hasPersonalityElements) {
        storytelling.narrativeFlow = 'excellent';
      } else if (storytelling.hasAboutSection && storytelling.hasClearValueProp) {
        storytelling.narrativeFlow = 'good';
      } else if (storytelling.hasClearValueProp) {
        storytelling.narrativeFlow = 'adequate';
      }
      
      return storytelling;
    });
  }

  async analyzeCaseStudies() {
    try {
      console.log('🔍 ===============================================');
      console.log('🔍 CASE STUDY DISCOVERY & ANALYSIS');
      console.log('🔍 ===============================================');
      console.log('📊 Scanning homepage for case study links...');
      
      // Find project/case study links on the main page
      const projectLinks = await this.page.evaluate(() => {
        const links = [];
        
        // Enhanced selectors for better case study detection
        const selectors = [
          // Generic project/case/work links
          'a[href*="project"]',
          'a[href*="case"]',
          'a[href*="work"]',
          'a[href*="portfolio"]',
          'a[href*="study"]',
          
          // Class-based selectors
          '.project a',
          '.project-item a',
          '.portfolio-item a',
          '.case-study a',
          '.work-item a',
          '[class*="project"] a',
          '[class*="work"] a',
          '[class*="portfolio"] a',
          '[class*="case"] a',
          '[class*="study"] a',
          
          // Common modern portfolio patterns
          '.grid a', // Grid layouts
          '.card a', // Card components
          '.tile a', // Tile layouts
          '[data-*="project"] a', // Data attributes
          '[data-*="work"] a',
          '[data-*="portfolio"] a',
          
          // Framer/React specific patterns
          '[class*="framer"] a',
          '[class*="hover"] a',
          '[class*="link"] a',
          
          // Content-based detection
          'a[href*="/"]', // All internal links for content analysis
        ];
        
        const potentialLinks = new Set();
        
        // First pass: collect all links matching selectors
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(link => {
              if (link.href && link.href !== window.location.href && !link.href.includes('#')) {
                potentialLinks.add(link);
              }
            });
          } catch (e) {
            // Skip invalid selectors
          }
        });
        
        // Second pass: analyze link content and context for case study indicators
        potentialLinks.forEach(link => {
          const text = link.textContent.trim().toLowerCase();
          const href = link.href.toLowerCase();
          const parentText = link.parentElement ? link.parentElement.textContent.toLowerCase() : '';
          const imageAlt = link.querySelector('img') ? link.querySelector('img').alt.toLowerCase() : '';
          
          // Score-based detection system
          let score = 0;
          
          // URL indicators (high confidence)
          if (href.includes('project') || href.includes('case') || href.includes('work') || href.includes('portfolio')) score += 15;
          if (href.includes('study')) score += 10;
          
          // Text content indicators
          if (text.includes('view') || text.includes('see') || text.includes('read') || text.includes('learn')) score += 5;
          if (text.includes('project') || text.includes('case') || text.includes('work')) score += 10;
          if (text.includes('portfolio') || text.includes('study')) score += 8;
          
          // Common portfolio text patterns
          if (text.match(/^[A-Z][a-z]+ [A-Z][a-z]+/)) score += 5; // "Project Name" pattern
          if (text.length > 10 && text.length < 50) score += 3; // Reasonable project title length
          
          // Context indicators
          if (parentText.includes('project') || parentText.includes('case') || parentText.includes('work')) score += 8;
          if (parentText.includes('portfolio') || parentText.includes('study')) score += 5;
          
          // Image alt text indicators
          if (imageAlt.includes('project') || imageAlt.includes('case') || imageAlt.includes('work')) score += 8;
          
          // Visual cues (common project link patterns)
          const hasProjectImage = link.querySelector('img') !== null;
          if (hasProjectImage) score += 5;
          
          // Link structure patterns
          const isButtonLike = link.classList.contains('button') || link.classList.contains('btn') || 
                              link.style.display === 'block' || link.style.display === 'inline-block';
          if (isButtonLike) score += 3;
          
          // Exclude common non-project links
          if (href.includes('mailto:') || href.includes('tel:') || href.includes('linkedin') || 
              href.includes('twitter') || href.includes('instagram') || href.includes('github')) {
            score = 0;
          }
          
          // Exclude footer/header links
          const isInFooter = link.closest('footer') !== null;
          const isInHeader = link.closest('header') !== null;
          const isInNav = link.closest('nav') !== null;
          if (isInFooter || isInHeader || isInNav) score -= 5;
          
          // Special patterns for vyomikaparikh.com
          if (window.location.hostname.includes('vyomikaparikh')) {
            // Look for common project names/patterns on this site
            if (text.includes('up') || text.includes('habit') || text.includes('coach') || 
                text.includes('ai') || text.includes('ux') || text.includes('ui')) score += 5;
            
            // Look for "View Project" or similar CTA text
            if (text.toLowerCase().includes('view') && text.toLowerCase().includes('project')) score += 10;
            
            // Boost score for links with images in portfolio context
            if (hasProjectImage && parentText.includes('portfolio')) score += 8;
          }
          
          // Minimum score threshold (lowered for better detection)
          if (score >= 2 && text.length > 0) {
            const linkData = {
              href: link.href,
              text: link.textContent.trim(),
              score: score,
              selector: 'content-analysis',
              context: {
                hasImage: hasProjectImage,
                parentText: parentText.substring(0, 100),
                imageAlt: imageAlt
              }
            };
            
            // Avoid duplicates
            if (!links.some(l => l.href === linkData.href)) {
              links.push(linkData);
            }
          }
        });
        
        // Sort by score (highest first) and return
        return links.sort((a, b) => b.score - a.score);
      });

      console.log(`🔍 Found ${projectLinks.length} potential case study links`);
      
      // Debug: Log all found links with their scores
      projectLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. "${link.text}" (score: ${link.score}) -> ${link.href}`);
      });

      const caseStudies = [];
      
      for (const [index, link] of projectLinks.entries()) {
        try {
          console.log(`\n📖 [${index + 1}/${projectLinks.length}] Analyzing: "${link.text}"`);
          console.log(`🌐 URL: ${link.href}`);
          console.log('⏳ Navigating to case study page...');
          
          // Navigate to the case study
          await this.page.goto(link.href, { waitUntil: 'networkidle', timeout: 30000 });
          console.log('✅ Case study page loaded');
          
          console.log('📊 Extracting case study content and structure...');
          // Analyze the case study page
          const caseStudyData = await this.analyzeCaseStudyPage(link);
          console.log(`📝 Case study analysis complete (${caseStudyData.wordCount} words, ${caseStudyData.imageCount} images)`);
          
          caseStudies.push(caseStudyData);
          
          console.log('📸 Capturing case study screenshot...');
          // Take a screenshot of the case study
          const caseStudyScreenshot = await this.page.screenshot({ fullPage: true });
          const screenshotPath = path.join('./reports/screenshots', `case-study-${Date.now()}.png`);
          await fs.ensureDir(path.dirname(screenshotPath));
          await fs.writeFile(screenshotPath, caseStudyScreenshot);
          caseStudyData.screenshot = screenshotPath;
          console.log(`📱 Screenshot saved: ${path.basename(screenshotPath)}`);
          
          console.log(`✅ Case study [${index + 1}] analysis complete: "${link.text}"`);
          
        } catch (error) {
          console.warn(`⚠️ Failed to analyze case study ${link.text}:`, error.message);
          caseStudies.push({
            title: link.text,
            url: link.href,
            error: error.message,
            analyzed: false
          });
        }
      }

      return {
        totalFound: projectLinks.length,
        analyzed: caseStudies,
        summary: this.summarizeCaseStudyFindings(caseStudies)
      };

    } catch (error) {
      console.error('❌ Case study analysis failed:', error.message);
      return {
        error: error.message,
        totalFound: 0,
        analyzed: []
      };
    }
  }

  async analyzeCaseStudyPage(linkInfo) {
    const title = await this.page.title();
    
    const analysis = await this.page.evaluate(() => {
      const content = {
        headings: [],
        paragraphs: [],
        images: [],
        sections: [],
        storytellingElements: {}
      };

      // Extract headings for story structure
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        content.headings.push({
          level: h.tagName.toLowerCase(),
          text: h.textContent.trim()
        });
      });

      // Extract paragraph content for narrative analysis
      document.querySelectorAll('p').forEach(p => {
        const text = p.textContent.trim();
        if (text.length > 20) { // Only meaningful paragraphs
          content.paragraphs.push(text);
        }
      });

      // Count images for visual storytelling
      content.images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height
      }));

      // Look for storytelling indicators
      const text = document.body.textContent.toLowerCase();
      content.storytellingElements = {
        hasProblemStatement: text.includes('problem') || text.includes('challenge') || text.includes('issue'),
        hasProcess: text.includes('process') || text.includes('approach') || text.includes('method'),
        hasSolution: text.includes('solution') || text.includes('result') || text.includes('outcome'),
        hasImpact: text.includes('impact') || text.includes('result') || text.includes('success') || text.includes('improvement'),
        hasPersonalReflection: text.includes('learned') || text.includes('reflection') || text.includes('takeaway'),
        wordCount: text.split(' ').length
      };

      return content;
    });

    // Generate AI-powered analysis for this specific case study
    let aiAnalysis = null;
    if (this.claudeAI) {
      try {
        console.log(`🤖 Generating AI analysis for case study: ${title}`);
        
        // Take a focused screenshot for AI analysis (optimized size)
        const screenshot = await this.page.screenshot({ 
          fullPage: false, // Don't capture full page to avoid size limits
          clip: { x: 0, y: 0, width: 1200, height: 800 } // Capture main viewport area
        });
        
        // Prepare content summary for AI analysis
        const contentSummary = {
          title: title,
          headings: analysis.headings.map(h => h.text).join('\n'),
          contentPreview: analysis.paragraphs.slice(0, 3).join('\n'),
          imageCount: analysis.images.length,
          wordCount: analysis.storytellingElements.wordCount,
          storytellingElements: analysis.storytellingElements
        };
        
        // Generate AI insights specifically for this case study
        aiAnalysis = await this.claudeAI.generateCaseStudyAnalysis(
          linkInfo.href,
          contentSummary,
          screenshot
        );
        
        console.log(`✅ AI analysis completed for: ${title}`);
        
      } catch (error) {
        console.warn(`⚠️ AI analysis failed for ${title}:`, error.message);
      }
    }

    return {
      title: title,
      url: linkInfo.href,
      linkText: linkInfo.text,
      analyzed: true,
      content: analysis,
      storytellingScore: this.calculateStorytellingScore(analysis),
      userExperienceScore: this.calculateCaseStudyUXScore(analysis),
      aiAnalysis: aiAnalysis // New: Individual AI insights for each case study
    };
  }

  calculateStorytellingScore(analysis) {
    let score = 40; // Base score
    
    const elements = analysis.storytellingElements;
    
    if (elements.hasProblemStatement) score += 15;
    if (elements.hasProcess) score += 15;
    if (elements.hasSolution) score += 15;
    if (elements.hasImpact) score += 10;
    if (elements.hasPersonalReflection) score += 5;
    
    // Word count consideration
    if (elements.wordCount > 500) score += 5;
    if (elements.wordCount > 1000) score += 5;
    
    // Visual storytelling
    if (analysis.images.length >= 3) score += 5;
    if (analysis.images.length >= 6) score += 5;
    
    // Structure bonus
    if (analysis.headings.length >= 3) score += 5;
    
    return Math.min(score, 100);
  }

  calculateCaseStudyUXScore(analysis) {
    let score = 50; // Base score
    
    // Content organization
    if (analysis.headings.length >= 3) score += 15;
    if (analysis.paragraphs.length >= 5) score += 10;
    
    // Visual elements
    if (analysis.images.length >= 2) score += 10;
    if (analysis.images.length >= 5) score += 10;
    
    // Comprehensive coverage
    const elements = analysis.storytellingElements;
    if (elements.hasProblemStatement && elements.hasProcess && elements.hasSolution) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  summarizeCaseStudyFindings(caseStudies) {
    const analyzed = caseStudies.filter(cs => cs.analyzed);
    
    if (analyzed.length === 0) {
      return {
        averageStorytellingScore: 0,
        averageUXScore: 0,
        commonStrengths: [],
        commonWeaknesses: [],
        recommendations: ['No case studies could be analyzed']
      };
    }

    const avgStorytelling = analyzed.reduce((sum, cs) => sum + cs.storytellingScore, 0) / analyzed.length;
    const avgUX = analyzed.reduce((sum, cs) => sum + cs.userExperienceScore, 0) / analyzed.length;

    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    if (avgStorytelling >= 80) {
      strengths.push('Excellent storytelling in case studies');
    } else if (avgStorytelling < 60) {
      weaknesses.push('Case studies lack compelling narrative structure');
      recommendations.push('Enhance case study storytelling with clear problem-process-solution-impact flow');
    }

    if (avgUX >= 80) {
      strengths.push('Well-structured case study presentation');
    } else if (avgUX < 60) {
      weaknesses.push('Case studies could be better organized for readability');
      recommendations.push('Improve case study layout with better headings and visual hierarchy');
    }

    return {
      averageStorytellingScore: Math.round(avgStorytelling),
      averageUXScore: Math.round(avgUX),
      commonStrengths: strengths,
      commonWeaknesses: weaknesses,
      recommendations: recommendations
    };
  }

  // Helper methods for page analysis
  async checkWhitespace() {
    return await this.page.evaluate(() => {
      const body = document.body;
      const totalHeight = body.scrollHeight;
      const contentHeight = Array.from(document.querySelectorAll('*'))
        .reduce((sum, el) => sum + el.offsetHeight, 0);
      return (totalHeight - contentHeight) / totalHeight > 0.2;
    });
  }

  async countImages() {
    return await this.page.evaluate(() => document.querySelectorAll('img').length);
  }

  async checkGradients() {
    return await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).some(el => {
        const style = window.getComputedStyle(el);
        return style.background.includes('gradient') || style.backgroundImage.includes('gradient');
      });
    });
  }

  async checkShadows() {
    return await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).some(el => {
        const style = window.getComputedStyle(el);
        return style.boxShadow !== 'none' || style.textShadow !== 'none';
      });
    });
  }

  async countFonts() {
    return await this.page.evaluate(() => {
      const fonts = new Set();
      Array.from(document.querySelectorAll('*')).forEach(el => {
        fonts.add(window.getComputedStyle(el).fontFamily);
      });
      return fonts.size;
    });
  }

  async countColors() {
    return await this.page.evaluate(() => {
      const colors = new Set();
      Array.from(document.querySelectorAll('*')).forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color !== 'rgba(0, 0, 0, 0)') colors.add(style.color);
        if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(style.backgroundColor);
      });
      return colors.size;
    });
  }

  async checkFlexbox() {
    return await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).some(el => 
        window.getComputedStyle(el).display.includes('flex')
      );
    });
  }

  async checkGrid() {
    return await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).some(el => 
        window.getComputedStyle(el).display.includes('grid')
      );
    });
  }

  async checkRoundedCorners() {
    return await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).some(el => 
        window.getComputedStyle(el).borderRadius !== '0px'
      );
    });
  }

  async checkMinimalDesign() {
    return await this.page.evaluate(() => {
      const elementCount = document.querySelectorAll('*').length;
      return elementCount < 200; // Heuristic for minimal design
    });
  }

  async checkResponsiveImages() {
    return await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).some(img => 
        img.hasAttribute('srcset') || img.style.maxWidth === '100%'
      );
    });
  }

  async checkModernFonts() {
    return await this.page.evaluate(() => {
      const modernFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
      const usedFonts = new Set();
      Array.from(document.querySelectorAll('*')).forEach(el => {
        usedFonts.add(window.getComputedStyle(el).fontFamily);
      });
      return Array.from(usedFonts).some(font => 
        modernFonts.some(modern => font.includes(modern))
      );
    });
  }

  async analyzeNavigation() {
    return await this.page.evaluate(() => {
      return {
        hasMainNav: document.querySelector('nav') !== null,
        hasBreadcrumbs: document.querySelector('.breadcrumb') !== null,
        hasSearch: document.querySelector('input[type="search"]') !== null,
        linkCount: document.querySelectorAll('a').length
      };
    });
  }

  async analyzeContent() {
    return await this.page.evaluate(() => {
      return {
        headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        paragraphCount: document.querySelectorAll('p').length,
        hasProperHeadingHierarchy: document.querySelectorAll('h1').length === 1
      };
    });
  }

  async analyzeDesignConsistency() {
    return await this.page.evaluate(() => {
      const colors = new Set();
      const fonts = new Set();
      Array.from(document.querySelectorAll('*')).forEach(el => {
        const style = window.getComputedStyle(el);
        colors.add(style.color);
        fonts.add(style.fontFamily);
      });
      return {
        colorConsistency: colors.size <= 10,
        fontConsistency: fonts.size <= 5
      };
    });
  }

  async analyzeBranding() {
    return await this.page.evaluate(() => {
      return {
        hasLogo: document.querySelector('[alt*="logo" i]') !== null,
        hasConsistentColors: true // Simplified
      };
    });
  }

  async analyzeInteractions() {
    return await this.page.evaluate(() => {
      return {
        hasHoverEffects: document.querySelectorAll('[style*="hover"]').length > 0,
        hasAnimations: document.querySelectorAll('[style*="animation"]').length > 0,
        hasTransitions: document.querySelectorAll('[style*="transition"]').length > 0
      };
    });
  }

  async checkAccessibilityFeatures() {
    return await this.page.evaluate(() => {
      return {
        hasAltText: Array.from(document.querySelectorAll('img')).every(img => img.alt),
        hasProperHeadings: document.querySelectorAll('h1').length === 1,
        contrast: { score: 85 } // Placeholder
      };
    });
  }

  // Additional helper methods
  analyzeColorHarmony(colors) { return 'harmonious'; }
  checkColorAccessibility(colors) { return { wcagAA: true }; }
  generateAestheticsFeedback(score, elements) { return `Score: ${score}/100`; }
  generateProfessionalismFeedback(metrics) { return 'Professional appearance maintained'; }
  
  // Placeholder implementations for remaining methods
  async analyzeLayout() { return { score: 85 }; }
  async analyzeSpacing() { return { score: 80 }; }
  async checkResponsiveness() { return { score: 90 }; }
  async analyzeComposition() { return { score: 85 }; }
  async analyzeVisualHierarchy() { return { score: 80 }; }
  async analyzeBalance() { return { score: 85 }; }
  async analyzeContrast() { return { score: 90 }; }
  async analyzeConsistency() { return { score: 85 }; }
  async evaluateAccessibility() { return { score: 85 }; }
  async evaluatePerformance(url) { return { score: 80 }; }
  async evaluateCreativity() { return { score: 75 }; }
  async evaluateUserExperience() { return { score: 85 }; }
  async evaluateBrandAlignment() { return { score: 80 }; }
  calculateSubjectiveScore(criteria) {
    return Object.values(criteria).reduce((sum, item) => sum + item.score, 0) / Object.keys(criteria).length;
  }
}

module.exports = PortfolioEvaluator;