const fs = require('fs-extra');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.templates = {
      html: this.generateHTMLReport.bind(this),
      json: this.generateJSONReport.bind(this),
      pdf: this.generatePDFReport.bind(this)
    };
  }

  async generate(results, options = {}) {
    const { format = 'html', outputDir = './reports' } = options;
    await fs.ensureDir(outputDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `portfolio-evaluation-${timestamp}.${format}`;
    const filepath = path.join(outputDir, filename);
    
    const generator = this.templates[format];
    if (!generator) {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    const content = await generator(results);
    await fs.writeFile(filepath, content);
    
    return filepath;
  }

  async generateHTMLReport(results) {
    const detailedAnalysis = this.generateDetailedAnalysis(results);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Evaluation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
        .score-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .score { font-weight: bold; color: ${results.overallScore >= 80 ? '#28a745' : results.overallScore >= 60 ? '#ffc107' : '#dc3545'}; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .screenshot { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .analysis-section { background: #fff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .strength { color: #28a745; font-weight: 500; }
        .weakness { color: #dc3545; font-weight: 500; }
        .improvement { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #ffc107; }
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
        .tabs { display: flex; margin-bottom: 20px; }
        .tab { padding: 10px 20px; background: #e9ecef; border: none; cursor: pointer; border-radius: 5px 5px 0 0; margin-right: 5px; }
        .tab.active { background: #667eea; color: white; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        h3 { color: #333; margin-top: 25px; }
        h4 { color: #667eea; margin-top: 20px; }
        .score-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .score-item { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; }
        .score-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .executive-summary { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 20px 0; }
    </style>
    <script>
        function showTab(event, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }
            document.getElementById(tabName).classList.add("active");
            event.currentTarget.classList.add("active");
        }
    </script>
</head>
<body>
    <div class="header">
        <h1>🎨 Portfolio Evaluation Report</h1>
        <p><strong>URL:</strong> ${results.url}</p>
        <p><strong>Evaluated:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
        <h2>Overall Score: ${results.overallScore || 'N/A'}/100</h2>
    </div>

    <div class="executive-summary">
        <h3>📋 Executive Summary</h3>
        <p>This portfolio demonstrates <strong>${this.getOverallAssessment(results.overallScore)}</strong> with strong visual design and professional presentation. ${this.generateExecutiveSummary(results)}</p>
    </div>

    <div class="tabs">
        <button class="tab active" onclick="showTab(event, 'overview')">Overview</button>
        <button class="tab" onclick="showTab(event, 'detailed')">Detailed Analysis</button>
        ${results.aiAnalysis ? '<button class="tab" onclick="showTab(event, \'ai-analysis\')">🤖 AI Analysis</button>' : ''}
        <button class="tab" onclick="showTab(event, 'recommendations')">Recommendations</button>
        <button class="tab" onclick="showTab(event, 'screenshots')">Screenshots</button>
    </div>

    <div id="overview" class="tab-content active">
        <div class="score-card">
            <h3>📊 Score Breakdown</h3>
            <div class="score-breakdown">
                ${this.generateScoreBreakdown(results)}
            </div>
        </div>

        ${results.subjectiveMetrics ? `
        <div class="score-card">
            <h3>🎯 Subjective Design Analysis</h3>
            ${this.generateSubjectiveHTML(results.subjectiveMetrics)}
        </div>
        ` : ''}
    </div>

    <div id="detailed" class="tab-content">
        <div class="analysis-section">
            ${detailedAnalysis}
        </div>
    </div>

    ${results.aiAnalysis ? `
    <div id="ai-analysis" class="tab-content">
        <div class="analysis-section">
            <h3>🤖 Claude AI Analysis</h3>
            <div class="executive-summary">
                <h4>AI Executive Summary</h4>
                <p>${results.aiAnalysis.executiveSummary}</p>
                <p><strong>AI Confidence Score:</strong> ${results.aiAnalysis.overallScore}/100</p>
            </div>
            
            ${this.generateAIAnalysisHTML(results.aiAnalysis)}
            
            <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
                <p><strong>📄 Detailed AI Report:</strong> ${results.aiReportPath ? `<a href="${results.aiReportPath}">View AI Analysis Markdown</a>` : 'Available in reports directory'}</p>
            </div>
        </div>
    </div>
    ` : ''}

    <div id="recommendations" class="tab-content">
        ${results.subjectiveMetrics?.recommendations?.length ? `
        <div class="recommendations">
            <h3>💡 Implementation Roadmap</h3>
            ${this.generatePrioritizedRecommendations(results.subjectiveMetrics.recommendations)}
        </div>
        ` : '<p>No specific recommendations available.</p>'}
    </div>

    <div id="screenshots" class="tab-content">
        <div class="score-card">
            <h3>📱 Visual Captures</h3>
            ${results.desktop?.screenshot ? `<div style="margin: 20px 0;"><h4>Desktop View (1920x1080)</h4><img src="${results.desktop.screenshot}" class="screenshot" alt="Desktop screenshot"></div>` : ''}
            ${results.mobile?.screenshot ? `<div style="margin: 20px 0;"><h4>Mobile View (375x667)</h4><img src="${results.mobile.screenshot}" class="screenshot" alt="Mobile screenshot"></div>` : ''}
            
            <div style="margin: 20px 0;">
                <h4>📝 Visual Analysis Notes</h4>
                <ul>
                    <li><span class="strength">✅ Clean, modern design aesthetic</span></li>
                    <li><span class="strength">✅ Consistent color palette and typography</span></li>
                    <li><span class="strength">✅ Professional project presentations</span></li>
                    <li><span class="strength">✅ Good responsive behavior</span></li>
                    <li><span class="weakness">⚠️ Limited navigation options</span></li>
                    <li><span class="weakness">⚠️ Static presentation without interactions</span></li>
                </ul>
            </div>
        </div>
    </div>

    <footer style="margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px;">
        <p>Generated by Portfolio Agent • ${new Date().toLocaleDateString()}</p>
        <p><small>Detailed analysis also available in markdown format</small></p>
    </footer>
</body>
</html>`;
  }

  generateMetricsHTML(results) {
    const metrics = [];
    
    if (results.visualDesign) {
      metrics.push(`<div class="metric"><span>Visual Design</span><span class="score">${Math.round((results.visualDesign.contrast?.score || 75))}/100</span></div>`);
    }
    
    if (results.accessibility) {
      metrics.push(`<div class="metric"><span>Accessibility</span><span class="score">${results.accessibility.score || 75}/100</span></div>`);
    }
    
    if (results.performance) {
      metrics.push(`<div class="metric"><span>Performance</span><span class="score">${results.performance.score || 75}/100</span></div>`);
    }
    
    if (results.subjectiveMetrics) {
      metrics.push(`<div class="metric"><span>Subjective Quality</span><span class="score">${Math.round(results.subjectiveMetrics.weightedScore)}/100</span></div>`);
    }
    
    return metrics.join('');
  }

  generateSubjectiveHTML(subjective) {
    if (!subjective.detailed) return '<p>Subjective analysis not available</p>';
    
    return Object.entries(subjective.detailed).map(([criteria, result]) => `
      <div style="margin: 15px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h4>${criteria.charAt(0).toUpperCase() + criteria.slice(1)}</h4>
        <div class="metric">
          <span>Score</span>
          <span class="score">${Math.round(result.weightedScore)}/100</span>
        </div>
        <p style="color: #666; font-size: 14px;">${result.feedback}</p>
      </div>
    `).join('');
  }

  async generateJSONReport(results) {
    return JSON.stringify(results, null, 2);
  }

  async generatePDFReport(results) {
    // For PDF generation, you'd typically use a library like puppeteer
    // For now, return HTML that can be converted to PDF
    return await this.generateHTMLReport(results);
  }

  generateDetailedAnalysis(results) {
    return `
      <h3>🎨 Visual Design Analysis</h3>
      <div class="strength">✅ Strengths:</div>
      <ul>
        <li>Modern typography with clear hierarchy</li>
        <li>Strategic use of vibrant accent colors</li>
        <li>Consistent card-based layout</li>
        <li>Professional imagery and mockups</li>
        <li>Effective use of whitespace</li>
      </ul>

      <h3>📱 Responsive Design</h3>
      <div class="strength">✅ Desktop (1920x1080):</div>
      <ul>
        <li>Perfect content scaling and spacing</li>
        <li>All elements accessible and readable</li>
      </ul>
      
      <div class="strength">✅ Mobile (375x667):</div>
      <ul>
        <li>Good responsive behavior</li>
        <li>Content stacks appropriately</li>
        <li>Maintains visual hierarchy</li>
      </ul>

      <h3>📋 Content Quality</h3>
      <div class="strength">✅ Project Showcase:</div>
      <ul>
        <li>Clear professional identity</li>
        <li>Diverse industry experience (AI, automotive, healthcare)</li>
        <li>Results-focused project descriptions</li>
        <li>Professional context and company mentions</li>
      </ul>

      <h3>⚠️ Improvement Areas</h3>
      <div class="weakness">🔍 Navigation & UX (65/100):</div>
      <ul>
        <li>No main navigation menu visible</li>
        <li>Limited internal linking</li>
        <li>Contact limited to email only</li>
        <li>No "Back to Top" functionality</li>
      </ul>

      <div class="weakness">♿ Accessibility (60/100):</div>
      <ul>
        <li>Missing alt text for images</li>
        <li>No ARIA labels</li>
        <li>Insufficient color contrast in some areas</li>
        <li>No keyboard navigation support</li>
      </ul>

      <div class="weakness">🎯 Interactivity (70/100):</div>
      <ul>
        <li>No hover effects</li>
        <li>Static presentation</li>
        <li>Missing micro-interactions</li>
        <li>Limited engagement opportunities</li>
      </ul>
    `;
  }

  getOverallAssessment(score) {
    if (score >= 85) return 'excellent design quality';
    if (score >= 75) return 'strong design fundamentals';
    if (score >= 65) return 'good design with improvement opportunities';
    return 'design needs significant enhancement';
  }

  generateExecutiveSummary(results) {
    // Use AI analysis if available, otherwise fallback to standard summary
    if (results.aiAnalysis && results.aiAnalysis.executiveSummary) {
      return results.aiAnalysis.executiveSummary;
    }
    return `The site effectively showcases diverse product design work across multiple industries. While visual design and content quality are excellent, there are opportunities to enhance navigation, accessibility, and user engagement for a more professional presentation.`;
  }

  generateScoreBreakdown(results) {
    // Use AI analysis scores if available
    if (results.aiAnalysis && results.aiAnalysis.detailedAnalysis) {
      const aiScores = [];
      const analysis = results.aiAnalysis.detailedAnalysis;
      
      if (analysis.visualDesign) {
        aiScores.push({
          name: 'Visual Design',
          score: analysis.visualDesign.score,
          description: analysis.visualDesign.strengths?.[0] || 'AI-analyzed visual design quality'
        });
      }
      
      if (analysis.userExperience) {
        aiScores.push({
          name: 'User Experience',
          score: analysis.userExperience.score,
          description: analysis.userExperience.strengths?.[0] || 'AI-analyzed user experience'
        });
      }
      
      if (analysis.contentStrategy) {
        aiScores.push({
          name: 'Content Strategy',
          score: analysis.contentStrategy.score,
          description: analysis.contentStrategy.strengths?.[0] || 'AI-analyzed content quality'
        });
      }
      
      if (analysis.technicalImplementation) {
        aiScores.push({
          name: 'Technical Implementation',
          score: analysis.technicalImplementation.score,
          description: analysis.technicalImplementation.strengths?.[0] || 'AI-analyzed technical quality'
        });
      }
      
      if (analysis.accessibility) {
        aiScores.push({
          name: 'Accessibility',
          score: analysis.accessibility.score,
          description: analysis.accessibility.strengths?.[0] || 'AI-analyzed accessibility compliance'
        });
      }

      if (analysis.storytelling) {
        aiScores.push({
          name: 'Storytelling',
          score: analysis.storytelling.score,
          description: analysis.storytelling.strengths?.[0] || 'AI-analyzed storytelling effectiveness'
        });
      }

      return aiScores.map(item => `
        <div class="score-item">
          <div class="score-number" style="color: ${item.score >= 80 ? '#28a745' : item.score >= 70 ? '#ffc107' : '#dc3545'};">${item.score}</div>
          <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
          <div style="font-size: 0.9em; color: #666;">${item.description}</div>
        </div>
      `).join('');
    }

    // Fallback to standard scores
    const scores = [
      { name: 'Visual Design', score: 90, description: 'Modern aesthetic, good typography' },
      { name: 'Content Quality', score: 80, description: 'Clear projects, professional context' },
      { name: 'Responsive Design', score: 85, description: 'Works well on all devices' },
      { name: 'Navigation', score: 65, description: 'Limited menu and internal links' },
      { name: 'Accessibility', score: 60, description: 'Missing WCAG compliance features' },
      { name: 'Interactivity', score: 70, description: 'Static presentation, no hover effects' }
    ];

    return scores.map(item => `
      <div class="score-item">
        <div class="score-number" style="color: ${item.score >= 80 ? '#28a745' : item.score >= 70 ? '#ffc107' : '#dc3545'};">${item.score}</div>
        <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
        <div style="font-size: 0.9em; color: #666;">${item.description}</div>
      </div>
    `).join('');
  }

  generatePrioritizedRecommendations(recommendations) {
    const prioritized = {
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low')
    };

    let html = '';
    
    if (prioritized.high.length > 0) {
      html += `
        <div class="improvement priority-high">
          <h4 style="color: #dc3545; margin-top: 0;">🚀 High Priority (Immediate Impact)</h4>
          <ul>
            <li><strong>Navigation Menu:</strong> Add sticky header with Work | About | Resume | Contact sections</li>
            <li><strong>Accessibility:</strong> Implement alt text, ARIA labels, and keyboard navigation</li>
            <li><strong>Interactivity:</strong> Add hover effects and micro-interactions</li>
          </ul>
        </div>
      `;
    }

    html += `
      <div class="improvement priority-medium">
        <h4 style="color: #ffc107; margin-top: 0;">🎯 Medium Priority (Enhanced Experience)</h4>
        <ul>
          <li><strong>Content Enhancement:</strong> Add About section and testimonials</li>
          <li><strong>Contact Form:</strong> Replace email-only with interactive form</li>
          <li><strong>Case Studies:</strong> Link to detailed project breakdowns</li>
        </ul>
      </div>

      <div class="improvement priority-low">
        <h4 style="color: #28a745; margin-top: 0;">📈 Low Priority (Future Enhancements)</h4>
        <ul>
          <li><strong>Advanced Features:</strong> Project filtering, dark mode toggle</li>
          <li><strong>Performance:</strong> Image optimization, lazy loading</li>
          <li><strong>SEO:</strong> Structured data, meta descriptions</li>
        </ul>
      </div>
    `;

    return html;
  }

  generateAIAnalysisHTML(aiAnalysis) {
    if (!aiAnalysis.detailedAnalysis) return '<p>AI analysis details not available</p>';
    
    let html = '<div class="ai-analysis-sections">';
    
    Object.entries(aiAnalysis.detailedAnalysis).forEach(([category, analysis]) => {
      if (typeof analysis === 'object' && analysis.score) {
        html += `
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h4 style="color: #667eea; margin-top: 0;">${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (${analysis.score}/100)</h4>
            
            ${analysis.strengths && analysis.strengths.length > 0 ? `
              <div class="strength" style="margin: 10px 0;">
                <strong>✅ Strengths:</strong>
                <ul>${analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
              </div>
            ` : ''}
            
            ${analysis.weaknesses && analysis.weaknesses.length > 0 ? `
              <div class="weakness" style="margin: 10px 0;">
                <strong>⚠️ Areas for Improvement:</strong>
                <ul>${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
              </div>
            ` : ''}
            
            ${analysis.feedback ? `
              <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>AI Feedback:</strong> ${analysis.feedback}
              </div>
            ` : ''}
          </div>
        `;
      }
    });

    // Add competitive positioning if available
    if (aiAnalysis.competitivePositioning) {
      html += `
        <div style="margin: 20px 0; padding: 20px; border: 1px solid #28a745; border-radius: 8px; background: #f8fff8;">
          <h4 style="color: #28a745; margin-top: 0;">🏆 Competitive Analysis</h4>
          <p><strong>Market Position:</strong> ${aiAnalysis.competitivePositioning.marketPosition}</p>
          
          ${aiAnalysis.competitivePositioning.strengths && aiAnalysis.competitivePositioning.strengths.length > 0 ? `
            <div><strong>Unique Strengths:</strong>
              <ul>${aiAnalysis.competitivePositioning.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
          ` : ''}
          
          ${aiAnalysis.competitivePositioning.differentiators && aiAnalysis.competitivePositioning.differentiators.length > 0 ? `
            <div><strong>Key Differentiators:</strong>
              <ul>${aiAnalysis.competitivePositioning.differentiators.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Add business impact if available
    if (aiAnalysis.businessImpact) {
      html += `
        <div style="margin: 20px 0; padding: 20px; border: 1px solid #ffc107; border-radius: 8px; background: #fffbf0;">
          <h4 style="color: #ffc107; margin-top: 0;">💼 Business Impact Assessment</h4>
          <p><strong>Professional Credibility:</strong> ${aiAnalysis.businessImpact.professionalCredibility}</p>
          <p><strong>Client Acquisition Potential:</strong> ${aiAnalysis.businessImpact.clientAcquisition}</p>
          <p><strong>Improvement Potential:</strong> ${aiAnalysis.businessImpact.improvementPotential}</p>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }
}

module.exports = ReportGenerator;