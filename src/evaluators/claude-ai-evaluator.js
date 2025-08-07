require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs-extra');
const path = require('path');

class ClaudeAIEvaluator {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
    this.temperature = parseFloat(process.env.AI_ANALYSIS_TEMPERATURE) || 0.3;
  }

  async generateAIAnalysis(pageData, screenshots) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ ANTHROPIC_API_KEY not found. Skipping AI analysis.');
      return null; // Return null instead of fallback to clearly indicate no AI analysis
    }

    try {
      console.log('\n🤖 ===============================================');
      console.log('🤖 CLAUDE AI ANALYSIS STARTED');
      console.log('🤖 ===============================================');
      console.log(`📊 Model: ${this.model}`);
      console.log(`🎯 Temperature: ${this.temperature}`);
      console.log(`🌐 Analyzing URL: ${pageData.url}`);
      
      console.log('\n📝 Building comprehensive analysis prompt...');
      const analysisPrompt = this.buildAnalysisPrompt(pageData);
      console.log(`📏 Prompt length: ${analysisPrompt.length} characters`);
      
      console.log('\n📸 Processing screenshots for visual analysis...');
      const screenshotAnalysis = await this.analyzeScreenshots(screenshots);
      console.log(`📱 Screenshots processed: ${screenshotAnalysis.length / 2} images`);
      
      console.log('\n🚀 Sending request to Claude AI...');
      console.log('⏳ This may take 10-30 seconds for comprehensive analysis...');
      
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: this.temperature,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt
            },
            ...screenshotAnalysis
          ]
        }]
      });

      console.log('✅ Claude AI response received!');
      console.log(`📊 Response length: ${response.content[0].text.length} characters`);
      console.log('🔄 Parsing AI response into structured analysis...');
      
      const aiAnalysis = this.parseAIResponse(response.content[0].text);
      
      console.log('\n🎯 ===============================================');
      console.log('🎯 CLAUDE AI ANALYSIS COMPLETED');
      console.log('🎯 ===============================================');
      console.log(`🏆 Overall Score: ${aiAnalysis.overallScore}/100`);
      console.log(`📈 Visual Design: ${aiAnalysis.detailedAnalysis?.visualDesign?.score || 'N/A'}/100`);
      console.log(`🚀 User Experience: ${aiAnalysis.detailedAnalysis?.userExperience?.score || 'N/A'}/100`);
      console.log(`📝 Content Strategy: ${aiAnalysis.detailedAnalysis?.contentStrategy?.score || 'N/A'}/100`);
      console.log(`⚙️  Technical: ${aiAnalysis.detailedAnalysis?.technicalImplementation?.score || 'N/A'}/100`);
      console.log(`♿ Accessibility: ${aiAnalysis.detailedAnalysis?.accessibility?.score || 'N/A'}/100`);
      console.log(`📖 Storytelling: ${aiAnalysis.detailedAnalysis?.storytelling?.score || 'N/A'}/100`);
      console.log('🎯 ===============================================\n');
      
      return aiAnalysis;

    } catch (error) {
      console.error('\n❌ ===============================================');
      console.error('❌ CLAUDE AI ANALYSIS FAILED');
      console.error('❌ ===============================================');
      console.error(`❌ Error: ${error.message}`);
      
      if (error.message.includes('rate_limit')) {
        console.error('🚫 Rate limit exceeded. Please wait before retrying.');
        console.error('💡 Consider reducing analysis frequency or upgrading API limits.');
      } else if (error.message.includes('invalid_api_key')) {
        console.error('🔑 Invalid API key. Please check your ANTHROPIC_API_KEY.');
        console.error('💡 Get your API key from: https://console.anthropic.com/');
      } else if (error.message.includes('image_parse_error')) {
        console.error('📸 Screenshot processing failed. Continuing with text-only analysis.');
      }
      
      console.error('❌ ===============================================\n');
      
      // Don't use fallback - let the user know AI analysis failed
      throw new Error(`Claude AI analysis failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(pageData) {
    return `
You are a senior UX/UI design expert evaluating a portfolio website. Analyze the following data and provide a comprehensive evaluation.

WEBSITE DATA:
- URL: ${pageData.url}
- Content Analysis: ${JSON.stringify(pageData.content, null, 2)}
- Technical Metrics: ${JSON.stringify(pageData.technical, null, 2)}
- Design Elements: ${JSON.stringify(pageData.design, null, 2)}
- Navigation Structure: ${JSON.stringify(pageData.navigation, null, 2)}
- Accessibility Features: ${JSON.stringify(pageData.accessibility, null, 2)}

ANALYSIS REQUIREMENTS:
Please provide a detailed evaluation in the following JSON format:

{
  "overallScore": 85,
  "executiveSummary": "Brief 2-3 sentence overview of the portfolio's strengths and key areas for improvement",
  "detailedAnalysis": {
    "visualDesign": {
      "score": 85,
      "strengths": ["List of specific strengths"],
      "weaknesses": ["List of specific weaknesses"],
      "feedback": "Detailed feedback paragraph"
    },
    "userExperience": {
      "score": 75,
      "strengths": ["List of specific strengths"],
      "weaknesses": ["List of specific weaknesses"], 
      "feedback": "Detailed feedback paragraph"
    },
    "contentStrategy": {
      "score": 80,
      "strengths": ["List of specific strengths"],
      "weaknesses": ["List of specific weaknesses"],
      "feedback": "Detailed feedback paragraph"
    },
    "technicalImplementation": {
      "score": 70,
      "strengths": ["List of specific strengths"],
      "weaknesses": ["List of specific weaknesses"],
      "feedback": "Detailed feedback paragraph"
    },
    "accessibility": {
      "score": 65,
      "strengths": ["List of specific strengths"],
      "weaknesses": ["List of specific weaknesses"],
      "feedback": "Detailed feedback paragraph"
    },
    "storytelling": {
      "score": 75,
      "strengths": ["List of specific strengths in narrative and presentation"],
      "weaknesses": ["List of specific weaknesses in story flow"],
      "feedback": "Detailed feedback on how well the portfolio tells a compelling professional story"
    }
  },
  "recommendations": {
    "immediate": [
      {
        "priority": "high",
        "category": "Navigation",
        "action": "Specific actionable recommendation",
        "impact": "Expected impact description",
        "effort": "low/medium/high"
      }
    ],
    "shortTerm": [
      {
        "priority": "medium", 
        "category": "Accessibility",
        "action": "Specific actionable recommendation",
        "impact": "Expected impact description",
        "effort": "low/medium/high"
      }
    ],
    "longTerm": [
      {
        "priority": "low",
        "category": "Enhancement",
        "action": "Specific actionable recommendation", 
        "impact": "Expected impact description",
        "effort": "low/medium/high"
      }
    ]
  },
  "competitivePositioning": {
    "strengths": ["Unique advantages compared to typical portfolios"],
    "marketPosition": "Assessment of how this portfolio stands in the market",
    "differentiators": ["Key differentiating factors"]
  },
  "businessImpact": {
    "professionalCredibility": "Assessment of professional impression",
    "clientAcquisition": "Potential for attracting clients",
    "improvementPotential": "Estimated improvement with recommendations"
  }
}

Focus on:
1. Specific, actionable feedback rather than generic advice
2. Industry-standard design principles and current best practices
3. User experience and conversion optimization
4. Accessibility and inclusive design
5. Professional presentation and credibility
6. Technical execution quality
7. Storytelling effectiveness - how well the portfolio creates a compelling narrative about the designer's journey, process, and impact
8. Case study depth and narrative flow

For storytelling evaluation, assess:
- Personal brand narrative consistency
- Project story arc (problem → process → solution → impact)
- Emotional engagement and connection with viewers
- Progressive disclosure of information
- Clear value proposition communication
- Professional journey demonstration

Provide honest, constructive criticism with clear improvement pathways.
`;
  }

  async analyzeScreenshots(screenshots) {
    const screenshotContent = [];
    
    for (const [viewType, screenshotPath] of Object.entries(screenshots)) {
      if (screenshotPath && await fs.pathExists(screenshotPath)) {
        try {
          console.log(`🖼️  Processing ${viewType} screenshot: ${path.basename(screenshotPath)}`);
          
          const imageBuffer = await fs.readFile(screenshotPath);
          const imageSizeKB = (imageBuffer.length / 1024).toFixed(1);
          
          console.log(`📏 Screenshot size: ${imageSizeKB} KB`);
          
          if (imageBuffer.length > 5 * 1024 * 1024) { // 5MB limit
            console.warn(`⚠️  Screenshot too large (${imageSizeKB} KB), skipping ${viewType}`);
            continue;
          }
          
          const base64Image = imageBuffer.toString('base64');
          
          screenshotContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64Image
            }
          });
          
          screenshotContent.push({
            type: 'text',
            text: `📱 ${viewType.toUpperCase()} VIEW ANALYSIS: Please analyze this ${viewType} view focusing on visual design, layout hierarchy, typography choices, color palette usage, spacing/whitespace, user interface elements, and overall aesthetic quality. Consider how this view contributes to the overall user experience and professional presentation.`
          });
          
          console.log(`✅ Successfully processed ${viewType} screenshot`);
        } catch (error) {
          console.warn(`⚠️  Could not process ${viewType} screenshot: ${error.message}`);
        }
      } else {
        console.log(`❌ Screenshot not found for ${viewType}: ${screenshotPath}`);
      }
    }
    
    console.log(`📸 Total screenshot content items: ${screenshotContent.length}`);
    return screenshotContent;
  }

  parseAIResponse(responseText) {
    try {
      // Extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: try to parse the entire response
      return JSON.parse(responseText);
    } catch (error) {
      console.warn('Warning: Could not parse AI response as JSON, using fallback');
      return this.parseTextResponse(responseText);
    }
  }

  parseTextResponse(responseText) {
    // Fallback parser for non-JSON responses
    return {
      overallScore: 75,
      executiveSummary: "AI analysis completed with text parsing fallback.",
      detailedAnalysis: {
        aiGeneratedFeedback: responseText.substring(0, 1000) + "..."
      },
      recommendations: {
        immediate: [{
          priority: "high",
          category: "AI Analysis",
          action: "Review AI-generated feedback for detailed insights",
          impact: "Comprehensive evaluation insights",
          effort: "low"
        }]
      },
      competitivePositioning: {
        strengths: ["AI-analyzed portfolio with detailed feedback"],
        marketPosition: "Evaluated using advanced AI analysis",
        differentiators: ["Comprehensive AI-powered assessment"]
      },
      businessImpact: {
        professionalCredibility: "Enhanced through AI evaluation",
        clientAcquisition: "Improved with AI insights",
        improvementPotential: "Significant with AI recommendations"
      }
    };
  }

  getFallbackAnalysis() {
    return {
      overallScore: 75,
      executiveSummary: "Portfolio evaluation completed using standard metrics. Enable AI analysis with ANTHROPIC_API_KEY for enhanced insights.",
      detailedAnalysis: {
        visualDesign: {
          score: 80,
          strengths: ["Clean, modern aesthetic", "Good use of typography", "Professional color palette"],
          weaknesses: ["Could enhance visual hierarchy", "Limited interactive elements"],
          feedback: "The visual design demonstrates solid fundamentals with room for enhancement in interactive elements and visual engagement."
        },
        userExperience: {
          score: 70,
          strengths: ["Responsive design", "Clear content structure"],
          weaknesses: ["Navigation could be improved", "Limited user engagement features"],
          feedback: "User experience is functional but could benefit from enhanced navigation and more engaging interactive elements."
        },
        contentStrategy: {
          score: 75,
          strengths: ["Clear project presentations", "Professional context"],
          weaknesses: ["Could expand on process and outcomes", "Limited storytelling"],
          feedback: "Content effectively showcases work but could benefit from more detailed case studies and storytelling elements."
        },
        technicalImplementation: {
          score: 75,
          strengths: ["Responsive implementation", "Clean code structure"],
          weaknesses: ["Performance optimization opportunities", "Accessibility improvements needed"],
          feedback: "Technical implementation is solid with opportunities for performance and accessibility enhancements."
        },
        accessibility: {
          score: 65,
          strengths: ["Basic responsive design", "Readable typography"],
          weaknesses: ["Missing alt text", "Limited keyboard navigation", "Color contrast issues"],
          feedback: "Accessibility needs attention to meet WCAG guidelines and ensure inclusive design."
        }
      },
      recommendations: {
        immediate: [
          {
            priority: "high",
            category: "Navigation",
            action: "Add main navigation menu with clear section links",
            impact: "Improved user orientation and site exploration",
            effort: "medium"
          },
          {
            priority: "high",
            category: "Accessibility",
            action: "Add alt text to all images and improve color contrast",
            impact: "Better accessibility compliance and user experience",
            effort: "low"
          }
        ],
        shortTerm: [
          {
            priority: "medium",
            category: "Interactivity",
            action: "Add hover effects and micro-interactions",
            impact: "Enhanced user engagement and modern feel",
            effort: "medium"
          },
          {
            priority: "medium",
            category: "Content",
            action: "Expand project case studies with process details",
            impact: "Better demonstration of problem-solving skills",
            effort: "high"
          }
        ],
        longTerm: [
          {
            priority: "low",
            category: "Enhancement",
            action: "Implement advanced features like project filtering",
            impact: "Enhanced user experience and portfolio browsing",
            effort: "high"
          }
        ]
      },
      competitivePositioning: {
        strengths: ["Professional presentation", "Clean design aesthetic", "Diverse project range"],
        marketPosition: "Above average portfolio with strong foundation",
        differentiators: ["Clean modern design", "Professional project presentations"]
      },
      businessImpact: {
        professionalCredibility: "Strong professional impression with room for enhancement",
        clientAcquisition: "Good potential with recommended improvements",
        improvementPotential: "Significant improvement possible with navigation and accessibility updates"
      }
    };
  }

  async generateMarkdownReport(analysis, url) {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportContent = `
# AI-Powered Portfolio Analysis

**URL:** ${url}  
**Analysis Date:** ${timestamp}  
**Overall Score:** ${analysis.overallScore}/100  
**Powered by:** Claude AI

---

## Executive Summary

${analysis.executiveSummary}

---

## Detailed Analysis

### 🎨 Visual Design (${analysis.detailedAnalysis.visualDesign?.score || 'N/A'}/100)

**Strengths:**
${analysis.detailedAnalysis.visualDesign?.strengths?.map(s => `- ${s}`).join('\n') || '- Analysis not available'}

**Areas for Improvement:**
${analysis.detailedAnalysis.visualDesign?.weaknesses?.map(w => `- ${w}`).join('\n') || '- Analysis not available'}

**Detailed Feedback:**
${analysis.detailedAnalysis.visualDesign?.feedback || 'Detailed feedback not available'}

### 🚀 User Experience (${analysis.detailedAnalysis.userExperience?.score || 'N/A'}/100)

**Strengths:**
${analysis.detailedAnalysis.userExperience?.strengths?.map(s => `- ${s}`).join('\n') || '- Analysis not available'}

**Areas for Improvement:**
${analysis.detailedAnalysis.userExperience?.weaknesses?.map(w => `- ${w}`).join('\n') || '- Analysis not available'}

**Detailed Feedback:**
${analysis.detailedAnalysis.userExperience?.feedback || 'Detailed feedback not available'}

### 📝 Content Strategy (${analysis.detailedAnalysis.contentStrategy?.score || 'N/A'}/100)

**Strengths:**
${analysis.detailedAnalysis.contentStrategy?.strengths?.map(s => `- ${s}`).join('\n') || '- Analysis not available'}

**Areas for Improvement:**
${analysis.detailedAnalysis.contentStrategy?.weaknesses?.map(w => `- ${w}`).join('\n') || '- Analysis not available'}

**Detailed Feedback:**
${analysis.detailedAnalysis.contentStrategy?.feedback || 'Detailed feedback not available'}

### ⚙️ Technical Implementation (${analysis.detailedAnalysis.technicalImplementation?.score || 'N/A'}/100)

**Strengths:**
${analysis.detailedAnalysis.technicalImplementation?.strengths?.map(s => `- ${s}`).join('\n') || '- Analysis not available'}

**Areas for Improvement:**
${analysis.detailedAnalysis.technicalImplementation?.weaknesses?.map(w => `- ${w}`).join('\n') || '- Analysis not available'}

**Detailed Feedback:**
${analysis.detailedAnalysis.technicalImplementation?.feedback || 'Detailed feedback not available'}

### ♿ Accessibility (${analysis.detailedAnalysis.accessibility?.score || 'N/A'}/100)

**Strengths:**
${analysis.detailedAnalysis.accessibility?.strengths?.map(s => `- ${s}`).join('\n') || '- Analysis not available'}

**Areas for Improvement:**
${analysis.detailedAnalysis.accessibility?.weaknesses?.map(w => `- ${w}`).join('\n') || '- Analysis not available'}

**Detailed Feedback:**
${analysis.detailedAnalysis.accessibility?.feedback || 'Detailed feedback not available'}

### 📖 Storytelling (${analysis.detailedAnalysis.storytelling?.score || 'N/A'}/100)

**Strengths:**
${analysis.detailedAnalysis.storytelling?.strengths?.map(s => `- ${s}`).join('\n') || '- Analysis not available'}

**Areas for Improvement:**
${analysis.detailedAnalysis.storytelling?.weaknesses?.map(w => `- ${w}`).join('\n') || '- Analysis not available'}

**Detailed Feedback:**
${analysis.detailedAnalysis.storytelling?.feedback || 'Detailed feedback not available'}

---

## Implementation Roadmap

### 🚨 Immediate Actions (High Priority)
${analysis.recommendations?.immediate?.map(rec => 
  `**${rec.category}:** ${rec.action}  
*Impact:* ${rec.impact}  
*Effort:* ${rec.effort}`
).join('\n\n') || 'No immediate recommendations available'}

### 📅 Short-term Goals (Medium Priority)
${analysis.recommendations?.shortTerm?.map(rec => 
  `**${rec.category}:** ${rec.action}  
*Impact:* ${rec.impact}  
*Effort:* ${rec.effort}`
).join('\n\n') || 'No short-term recommendations available'}

### 🎯 Long-term Vision (Low Priority)
${analysis.recommendations?.longTerm?.map(rec => 
  `**${rec.category}:** ${rec.action}  
*Impact:* ${rec.impact}  
*Effort:* ${rec.effort}`
).join('\n\n') || 'No long-term recommendations available'}

---

## Competitive Analysis

### 🏆 Unique Strengths
${analysis.competitivePositioning?.strengths?.map(s => `- ${s}`).join('\n') || '- Analysis not available'}

### 📊 Market Position
${analysis.competitivePositioning?.marketPosition || 'Market position analysis not available'}

### 🌟 Key Differentiators
${analysis.competitivePositioning?.differentiators?.map(d => `- ${d}`).join('\n') || '- Analysis not available'}

---

## Business Impact Assessment

**Professional Credibility:** ${analysis.businessImpact?.professionalCredibility || 'Assessment not available'}

**Client Acquisition Potential:** ${analysis.businessImpact?.clientAcquisition || 'Assessment not available'}

**Improvement Potential:** ${analysis.businessImpact?.improvementPotential || 'Assessment not available'}

---

*This analysis was generated using Claude AI to provide comprehensive, contextual feedback on portfolio design and user experience.*
`;

    return reportContent;
  }

  async generateCaseStudyAnalysis(url, contentSummary, screenshot) {
    if (!this.anthropic) {
      throw new Error('Claude API not configured');
    }

    try {
      console.log('\n🔍 ===============================================');
      console.log('🔍 CASE STUDY AI ANALYSIS STARTED');
      console.log('🔍 ===============================================');
      console.log(`📊 Case Study: ${contentSummary.title}`);
      console.log(`🌐 URL: ${url}`);
      console.log(`📝 Word Count: ${contentSummary.wordCount}`);
      console.log(`🖼️  Images: ${contentSummary.imageCount}`);
      console.log(`📋 Headings: ${contentSummary.headings?.length || 0}`);

      const analysisPrompt = `You are an expert UX portfolio reviewer analyzing an individual case study. Provide detailed, specific feedback for this project.

CASE STUDY INFORMATION:
- Title: ${contentSummary.title}
- URL: ${url}
- Word Count: ${contentSummary.wordCount}
- Images: ${contentSummary.imageCount}
- Key Headings: ${contentSummary.headings}
- Content Preview: ${contentSummary.contentPreview}

STORYTELLING ANALYSIS:
- Has Problem Statement: ${contentSummary.storytellingElements.hasProblemStatement}
- Has Process: ${contentSummary.storytellingElements.hasProcess}
- Has Solution: ${contentSummary.storytellingElements.hasSolution}
- Has Impact: ${contentSummary.storytellingElements.hasImpact}
- Has Reflection: ${contentSummary.storytellingElements.hasPersonalReflection}

Please analyze this specific case study and provide:

1. **Project Overview**: What is this project about and what problem does it solve?

2. **Storytelling Assessment** (Score 1-100):
   - Problem Definition: How clearly is the challenge presented?
   - Process Documentation: How well is the design process explained?
   - Solution Presentation: How effectively is the final design showcased?
   - Impact Measurement: How well are results and outcomes communicated?
   - Personal Growth: Does the author reflect on learnings?

3. **Visual Design Quality** (Score 1-100):
   - Layout and hierarchy
   - Visual consistency
   - Use of imagery and mockups
   - Typography and readability
   - Professional presentation

4. **Content Strategy** (Score 1-100):
   - Clarity of communication
   - Appropriate level of detail
   - Logical flow and structure
   - Engaging narrative voice
   - Technical depth vs accessibility

5. **Specific Strengths**: What does this case study do exceptionally well?

6. **Areas for Improvement**: What specific aspects could be enhanced?

7. **Actionable Recommendations**: 3 concrete steps to improve this case study

8. **Competitive Analysis**: How does this compare to industry-standard case studies?

9. **Overall Assessment**: Final thoughts and overall score (1-100)

Provide specific, actionable feedback that the designer can immediately implement. Focus on both content and presentation aspects.`;

      const screenshotAnalysis = screenshot ? [{
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: screenshot.toString('base64')
        }
      }] : [];

      console.log('🚀 Sending case study to Claude AI...');
      console.log('⏳ Analyzing content, structure, and storytelling...');

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: this.temperature,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            ...screenshotAnalysis
          ]
        }]
      });

      console.log('✅ Claude AI case study response received!');
      console.log(`📊 Response length: ${response.content[0].text.length} characters`);

      const analysisText = response.content[0].text;
      
      console.log('🔄 Parsing AI response into structured data...');
      // Parse the AI response into structured data
      const parsedAnalysis = this.parseCaseStudyAnalysis(analysisText);
      
      console.log('📈 ===============================================');
      console.log('📈 CASE STUDY ANALYSIS COMPLETED');
      console.log('📈 ===============================================');
      console.log(`🏆 Overall Score: ${parsedAnalysis.overallScore}/100`);
      console.log(`📖 Storytelling: ${parsedAnalysis.storytellingScore}/100`);
      console.log(`🎨 Visual Design: ${parsedAnalysis.visualDesignScore}/100`);
      console.log(`📝 Content Strategy: ${parsedAnalysis.contentStrategyScore}/100`);
      console.log(`💡 Recommendations: ${parsedAnalysis.recommendations?.length || 0}`);
      console.log('📈 ===============================================\n');
      
      return {
        rawAnalysis: analysisText,
        structured: parsedAnalysis,
        timestamp: new Date().toISOString(),
        model: this.model
      };

    } catch (error) {
      console.error('\n❌ ===============================================');
      console.error('❌ CASE STUDY ANALYSIS FAILED');
      console.error('❌ ===============================================');
      console.error(`❌ Error: ${error.message}`);
      console.error('❌ ===============================================\n');
      throw new Error(`AI case study analysis failed: ${error.message}`);
    }
  }

  parseCaseStudyAnalysis(analysisText) {
    // Extract structured data from AI response
    const structure = {
      projectOverview: this.extractSection(analysisText, 'project overview', 'storytelling assessment'),
      storytellingScore: this.extractScore(analysisText, 'storytelling assessment'),
      visualDesignScore: this.extractScore(analysisText, 'visual design quality'),
      contentStrategyScore: this.extractScore(analysisText, 'content strategy'),
      strengths: this.extractListItems(analysisText, 'specific strengths', 'areas for improvement'),
      improvements: this.extractListItems(analysisText, 'areas for improvement', 'actionable recommendations'),
      recommendations: this.extractListItems(analysisText, 'actionable recommendations', 'competitive analysis'),
      competitiveAnalysis: this.extractSection(analysisText, 'competitive analysis', 'overall assessment'),
      overallScore: this.extractScore(analysisText, 'overall assessment'),
      overallAssessment: this.extractSection(analysisText, 'overall assessment')
    };

    return structure;
  }

  extractSection(text, startMarker, endMarker = null) {
    const start = text.toLowerCase().indexOf(startMarker.toLowerCase());
    if (start === -1) return 'Analysis not available';
    
    const startText = text.substring(start);
    const nextSection = endMarker ? startText.toLowerCase().indexOf(endMarker.toLowerCase()) : -1;
    
    const section = nextSection > 0 ? startText.substring(0, nextSection) : startText;
    return section.replace(/^[^:]*:?\s*/, '').trim();
  }

  extractScore(text, section) {
    const sectionText = this.extractSection(text, section);
    const scoreMatch = sectionText.match(/(\d+)\/100|score[:\s]*(\d+)|(\d+)\s*\/\s*100/i);
    return scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : 75;
  }

  extractListItems(text, startMarker, endMarker = null) {
    const section = this.extractSection(text, startMarker, endMarker);
    const lines = section.split('\n').filter(line => line.trim());
    
    return lines
      .filter(line => line.match(/^[-*•]\s+|^\d+\.\s+/))
      .map(line => line.replace(/^[-*•]\s+|^\d+\.\s+/, '').trim())
      .filter(item => item.length > 0);
  }
}

module.exports = ClaudeAIEvaluator;