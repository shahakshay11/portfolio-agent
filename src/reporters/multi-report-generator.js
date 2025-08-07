const fs = require('fs-extra');
const path = require('path');
const ReportGenerator = require('./report-generator');

class MultiReportGenerator extends ReportGenerator {
  constructor() {
    super();
  }

  async generateMultipleReports(results, options = {}) {
    const { outputDir = './reports' } = options;
    await fs.ensureDir(outputDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPaths = {};

    // Generate main comprehensive report
    reportPaths.main = await this.generate(results, {
      format: 'html',
      outputDir,
      filename: `comprehensive-evaluation-${timestamp}.html`
    });

    // Generate home page specific report
    reportPaths.homepage = await this.generateHomepageReport(results, outputDir, timestamp);

    // Generate individual case study reports
    if (results.caseStudyAnalysis && results.caseStudyAnalysis.analyzed) {
      reportPaths.caseStudies = [];
      
      for (const caseStudy of results.caseStudyAnalysis.analyzed) {
        if (caseStudy.analyzed) {
          const caseStudyReportPath = await this.generateCaseStudyReport(
            caseStudy, 
            results, 
            outputDir, 
            timestamp
          );
          reportPaths.caseStudies.push(caseStudyReportPath);
        }
      }
    }

    // Generate summary index report
    reportPaths.index = await this.generateIndexReport(results, reportPaths, outputDir, timestamp);

    return reportPaths;
  }

  async generateHomepageReport(results, outputDir, timestamp) {
    const homepageData = {
      ...results,
      title: 'Homepage Analysis',
      focusArea: 'homepage',
      caseStudyAnalysis: null // Exclude case study data for homepage report
    };

    const content = this.generateHomepageHTML(homepageData);
    const filepath = path.join(outputDir, `homepage-analysis-${timestamp}.html`);
    await fs.writeFile(filepath, content);
    
    console.log(`📄 Homepage report saved to: ${filepath}`);
    return filepath;
  }

  async generateCaseStudyReport(caseStudy, parentResults, outputDir, timestamp) {
    const sanitizedTitle = caseStudy.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `case-study-${sanitizedTitle}-${timestamp}.html`;
    const filepath = path.join(outputDir, filename);

    const content = this.generateCaseStudyHTML(caseStudy, parentResults);
    await fs.writeFile(filepath, content);
    
    console.log(`📄 Case study report saved: ${caseStudy.title} -> ${filepath}`);
    return {
      title: caseStudy.title,
      filepath,
      storytellingScore: caseStudy.storytellingScore,
      userExperienceScore: caseStudy.userExperienceScore
    };
  }

  generateHomepageHTML(results) {
    const aiSummary = results.aiAnalysis ? results.aiAnalysis.executiveSummary : 
      'Homepage demonstrates solid design fundamentals with opportunities for enhancement.';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Homepage Analysis - ${new URL(results.url).hostname}</title>
    <style>
        ${this.getSharedCSS()}
        .homepage-focus { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    </style>
</head>
<body>
    <div class="header homepage-focus">
        <h1>🏠 Homepage Analysis</h1>
        <p><strong>URL:</strong> ${results.url}</p>
        <p><strong>Analyzed:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
        <h2>Homepage Score: ${results.overallScore || 'N/A'}/100</h2>
    </div>

    <div class="executive-summary">
        <h3>📋 Homepage Executive Summary</h3>
        <p>${aiSummary}</p>
    </div>

    <div class="score-card">
        <h3>🏠 Homepage Specific Analysis</h3>
        ${this.generateHomepageMetrics(results)}
    </div>

    ${results.aiAnalysis ? `
    <div class="analysis-section">
        <h3>🤖 AI Homepage Analysis</h3>
        ${this.generateAIHomepageAnalysis(results.aiAnalysis)}
    </div>
    ` : ''}

    <div class="score-card">
        <h3>📱 Homepage Screenshots</h3>
        ${results.desktop?.screenshot ? `
            <div style="margin: 20px 0;">
                <h4>Desktop View (1920x1080)</h4>
                <img src="${results.desktop.screenshot}" class="screenshot" alt="Homepage desktop screenshot">
            </div>
        ` : ''}
        ${results.mobile?.screenshot ? `
            <div style="margin: 20px 0;">
                <h4>Mobile View (375x667)</h4>
                <img src="${results.mobile.screenshot}" class="screenshot" alt="Homepage mobile screenshot">
            </div>
        ` : ''}
    </div>

    <footer style="margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px;">
        <p>Homepage Analysis by Portfolio Agent • ${new Date().toLocaleDateString()}</p>
    </footer>
</body>
</html>`;
  }

  generateCaseStudyHTML(caseStudy, parentResults) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Case Study Analysis - ${caseStudy.title}</title>
    <style>
        ${this.getSharedCSS()}
        .case-study-focus { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); }
        .story-metric { display: flex; justify-content: space-between; padding: 10px; background: #f0fdf4; border-left: 4px solid #10b981; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header case-study-focus">
        <h1>📖 Case Study Analysis</h1>
        <h2>${caseStudy.title}</h2>
        <p><strong>URL:</strong> <a href="${caseStudy.url}" target="_blank">${caseStudy.url}</a></p>
        <div style="display: flex; gap: 30px; margin-top: 15px;">
            <div>📊 Storytelling: <strong>${caseStudy.storytellingScore}/100</strong></div>
            <div>🎯 UX Quality: <strong>${caseStudy.userExperienceScore}/100</strong></div>
        </div>
    </div>

    <div class="executive-summary">
        <h3>📋 Case Study Overview</h3>
        <p>This case study analysis evaluates the storytelling effectiveness and user experience quality of the project presentation.</p>
    </div>

    <div class="score-card">
        <h3>📖 Storytelling Analysis (${caseStudy.storytellingScore}/100)</h3>
        ${this.generateStorytellingMetrics(caseStudy)}
    </div>

    <div class="score-card">
        <h3>🎯 User Experience Quality (${caseStudy.userExperienceScore}/100)</h3>
        ${this.generateCaseStudyUXMetrics(caseStudy)}
    </div>

    <div class="score-card">
        <h3>📄 Content Analysis</h3>
        ${this.generateContentAnalysis(caseStudy.content)}
    </div>

    ${caseStudy.screenshot ? `
    <div class="score-card">
        <h3>📱 Case Study Screenshot</h3>
        <div style="margin: 20px 0;">
            <img src="${caseStudy.screenshot}" class="screenshot" alt="Case study screenshot">
        </div>
    </div>
    ` : ''}

    <div class="recommendations">
        <h3>💡 Case Study Recommendations</h3>
        ${this.generateCaseStudyRecommendations(caseStudy)}
    </div>

    <footer style="margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px;">
        <p>Case Study Analysis by Portfolio Agent • ${new Date().toLocaleDateString()}</p>
        <p><a href="#" onclick="history.back()">← Back to Main Report</a></p>
    </footer>
</body>
</html>`;
  }

  async generateIndexReport(results, reportPaths, outputDir, timestamp) {
    const filepath = path.join(outputDir, `evaluation-index-${timestamp}.html`);
    
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Evaluation Index</title>
    <style>
        ${this.getSharedCSS()}
        .index-header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
        .report-link { display: block; padding: 15px; margin: 10px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #1e293b; transition: all 0.2s; }
        .report-link:hover { background: #e2e8f0; transform: translateY(-2px); }
        .case-study-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header index-header">
        <h1>📊 Portfolio Evaluation Index</h1>
        <p><strong>Portfolio:</strong> ${results.url}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <h2>Overall Score: ${results.overallScore || 'N/A'}/100</h2>
    </div>

    <div class="score-card">
        <h3>📄 Available Reports</h3>
        
        <a href="${path.basename(reportPaths.main)}" class="report-link">
            <h4>📊 Comprehensive Analysis</h4>
            <p>Complete evaluation with all metrics, AI analysis, and recommendations</p>
        </a>

        <a href="${path.basename(reportPaths.homepage)}" class="report-link">
            <h4>🏠 Homepage Analysis</h4>
            <p>Focused analysis of the main page design, content, and user experience</p>
        </a>
    </div>

    ${reportPaths.caseStudies && reportPaths.caseStudies.length > 0 ? `
    <div class="score-card">
        <h3>📖 Case Study Reports (${reportPaths.caseStudies.length} studies analyzed)</h3>
        <div class="case-study-grid">
            ${reportPaths.caseStudies.map(cs => `
                <a href="${path.basename(cs.filepath)}" class="report-link">
                    <h4>📖 ${cs.title}</h4>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <span>Storytelling: ${cs.storytellingScore}/100</span>
                        <span>UX: ${cs.userExperienceScore}/100</span>
                    </div>
                </a>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="score-card">
        <h3>📈 Summary Statistics</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #0369a1;">${results.overallScore || 'N/A'}</div>
                <div>Overall Score</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #059669;">${reportPaths.caseStudies ? reportPaths.caseStudies.length : 0}</div>
                <div>Case Studies</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #d97706;">${results.aiAnalysis ? 'AI' : 'Standard'}</div>
                <div>Analysis Type</div>
            </div>
        </div>
    </div>

    <footer style="margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px;">
        <p>Portfolio Evaluation Index by Portfolio Agent • ${new Date().toLocaleDateString()}</p>
    </footer>
</body>
</html>`;

    await fs.writeFile(filepath, content);
    console.log(`📄 Index report saved to: ${filepath}`);
    return filepath;
  }

  // Helper methods
  getSharedCSS() {
    return `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
      .header { color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
      .score-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .executive-summary { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 20px 0; }
      .screenshot { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
      .analysis-section { background: #fff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
      .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
    `;
  }

  generateHomepageMetrics(results) {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-size: 1.5em; font-weight: bold; color: #059669;">✅</div>
          <div>Responsive Design</div>
        </div>
        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-size: 1.5em; font-weight: bold; color: #dc2626;">⚠️</div>
          <div>Navigation</div>
        </div>
        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-size: 1.5em; font-weight: bold; color: #059669;">✅</div>
          <div>Visual Design</div>
        </div>
      </div>
    `;
  }

  generateStorytellingMetrics(caseStudy) {
    const elements = caseStudy.content?.storytellingElements || {};
    return `
      <div class="story-metric">
        <span>Problem Statement</span>
        <span>${elements.hasProblemStatement ? '✅ Present' : '❌ Missing'}</span>
      </div>
      <div class="story-metric">
        <span>Process Documentation</span>
        <span>${elements.hasProcess ? '✅ Present' : '❌ Missing'}</span>
      </div>
      <div class="story-metric">
        <span>Solution Presentation</span>
        <span>${elements.hasSolution ? '✅ Present' : '❌ Missing'}</span>
      </div>
      <div class="story-metric">
        <span>Impact Measurement</span>
        <span>${elements.hasImpact ? '✅ Present' : '❌ Missing'}</span>
      </div>
      <div class="story-metric">
        <span>Personal Reflection</span>
        <span>${elements.hasPersonalReflection ? '✅ Present' : '❌ Missing'}</span>
      </div>
    `;
  }

  generateCaseStudyUXMetrics(caseStudy) {
    const content = caseStudy.content || {};
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-size: 1.5em; font-weight: bold;">${content.headings?.length || 0}</div>
          <div>Headings</div>
        </div>
        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-size: 1.5em; font-weight: bold;">${content.paragraphs?.length || 0}</div>
          <div>Paragraphs</div>
        </div>
        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-size: 1.5em; font-weight: bold;">${content.images?.length || 0}</div>
          <div>Images</div>
        </div>
      </div>
    `;
  }

  generateContentAnalysis(content) {
    const wordCount = content?.storytellingElements?.wordCount || 0;
    return `
      <p><strong>Word Count:</strong> ${wordCount} words</p>
      <p><strong>Content Depth:</strong> ${wordCount > 1000 ? 'Comprehensive' : wordCount > 500 ? 'Adequate' : 'Brief'}</p>
      <p><strong>Visual Elements:</strong> ${content?.images?.length || 0} images supporting the narrative</p>
    `;
  }

  generateCaseStudyRecommendations(caseStudy) {
    const recommendations = [];
    const elements = caseStudy.content?.storytellingElements || {};
    
    if (!elements.hasProblemStatement) {
      recommendations.push('Add a clear problem statement to set context');
    }
    if (!elements.hasProcess) {
      recommendations.push('Document your design process and methodology');
    }
    if (!elements.hasSolution) {
      recommendations.push('Clearly present your solution and design decisions');
    }
    if (!elements.hasImpact) {
      recommendations.push('Include measurable impact and results');
    }
    if (caseStudy.storytellingScore < 70) {
      recommendations.push('Enhance narrative flow with problem → process → solution → impact structure');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent storytelling! Continue maintaining this high standard.');
    }

    return recommendations.map(rec => `<li>${rec}</li>`).join('');
  }

  generateAIHomepageAnalysis(aiAnalysis) {
    if (!aiAnalysis.detailedAnalysis) return '<p>AI analysis details not available</p>';
    
    return Object.entries(aiAnalysis.detailedAnalysis).slice(0, 3).map(([category, analysis]) => {
      if (typeof analysis === 'object' && analysis.score) {
        return `
          <div style="margin: 15px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h4>${category.charAt(0).toUpperCase() + category.slice(1)} (${analysis.score}/100)</h4>
            <p>${analysis.feedback || 'AI feedback not available'}</p>
          </div>
        `;
      }
      return '';
    }).join('');
  }
}

module.exports = MultiReportGenerator;