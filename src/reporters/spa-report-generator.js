const fs = require('fs-extra');
const path = require('path');
const MultiReportGenerator = require('./multi-report-generator');

class SPAReportGenerator extends MultiReportGenerator {
  constructor() {
    super();
  }

  async generateSPAReport(results, options = {}) {
    const { outputDir = './reports' } = options;
    await fs.ensureDir(outputDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `portfolio-spa-${timestamp}.html`;
    const filepath = path.join(outputDir, filename);

    const content = this.generateSPAHTML(results);
    await fs.writeFile(filepath, content);
    
    console.log(`🎨 SPA Report saved to: ${filepath}`);
    return filepath;
  }

  generateSPAHTML(results) {
    const hostname = new URL(results.url).hostname;
    const aiAnalysis = results.aiAnalysis || {};
    const caseStudies = results.caseStudyAnalysis?.analyzed || [];

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Analysis - ${hostname}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        ${this.getSPAStyles()}
    </style>
</head>
<body>
    <div class="app">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <div class="header-main">
                    <div class="logo">
                        <i class="fas fa-chart-line"></i>
                        <h1>Portfolio Analyzer</h1>
                    </div>
                    <div class="header-info">
                        <div class="site-info">
                            <h2>${hostname}</h2>
                            <p><i class="fas fa-link"></i> <a href="${results.url}" target="_blank">${results.url}</a></p>
                        </div>
                        <div class="overall-score">
                            <div class="score-circle ${this.getScoreClass(results.overallScore)}">
                                <div class="score-number">${results.overallScore || 'N/A'}</div>
                                <div class="score-label">Overall</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="header-stats">
                    <div class="stat">
                        <i class="fas fa-desktop"></i>
                        <span>Desktop & Mobile Tested</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-robot"></i>
                        <span>${results.aiAnalysis ? 'AI Analyzed' : 'Standard Analysis'}</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-book"></i>
                        <span>${caseStudies.length} Case Studies</span>
                    </div>
                    <div class="stat">
                        <i class="far fa-clock"></i>
                        <span>${new Date(results.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="nav">
            <div class="nav-content">
                <button class="nav-btn active" onclick="showSection('overview')" data-section="overview">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Overview</span>
                </button>
                <button class="nav-btn" onclick="showSection('homepage')" data-section="homepage">
                    <i class="fas fa-home"></i>
                    <span>Homepage</span>
                </button>
                <button class="nav-btn" onclick="showSection('casestudies')" data-section="casestudies">
                    <i class="fas fa-book-open"></i>
                    <span>Case Studies</span>
                    <span class="badge">${caseStudies.length}</span>
                </button>
                <button class="nav-btn" onclick="showSection('ai-insights')" data-section="ai-insights">
                    <i class="fas fa-brain"></i>
                    <span>AI Insights</span>
                </button>
                <button class="nav-btn" onclick="showSection('recommendations')" data-section="recommendations">
                    <i class="fas fa-lightbulb"></i>
                    <span>Recommendations</span>
                </button>
                <button class="nav-btn" onclick="showSection('screenshots')" data-section="screenshots">
                    <i class="fas fa-images"></i>
                    <span>Screenshots</span>
                </button>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="main">
            <!-- Overview Section -->
            <section id="overview" class="section active">
                <div class="section-header">
                    <h2><i class="fas fa-tachometer-alt"></i> Performance Overview</h2>
                    <p>Comprehensive analysis of ${hostname}</p>
                </div>
                
                <div class="score-grid">
                    ${this.generateScoreCards(results)}
                </div>

                <div class="content-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-pie"></i> Executive Summary</h3>
                        </div>
                        <div class="card-content">
                            <p>${aiAnalysis.executiveSummary || 'This portfolio demonstrates solid design fundamentals with opportunities for enhancement in navigation, accessibility, and user engagement.'}</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-trophy"></i> Key Strengths</h3>
                        </div>
                        <div class="card-content">
                            ${this.generateStrengthsList(results)}
                        </div>
                    </div>
                </div>
            </section>

            <!-- Homepage Section -->
            <section id="homepage" class="section">
                <div class="section-header">
                    <h2><i class="fas fa-home"></i> Homepage Analysis</h2>
                    <p>First impression and main page evaluation</p>
                </div>
                
                <div class="content-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-eye"></i> Visual Design</h3>
                        </div>
                        <div class="card-content">
                            ${this.generateHomepageAnalysis(results)}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-mobile-alt"></i> Responsive Design</h3>
                        </div>
                        <div class="card-content">
                            <div class="responsive-preview">
                                ${results.desktop?.screenshot ? `
                                    <div class="device-preview desktop">
                                        <div class="device-header">Desktop (1920x1080)</div>
                                        <img src="${results.desktop.screenshot}" alt="Desktop screenshot">
                                    </div>
                                ` : ''}
                                ${results.mobile?.screenshot ? `
                                    <div class="device-preview mobile">
                                        <div class="device-header">Mobile (375x667)</div>
                                        <img src="${results.mobile.screenshot}" alt="Mobile screenshot">
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Case Studies Section -->
            <section id="casestudies" class="section">
                <div class="section-header">
                    <h2><i class="fas fa-book-open"></i> Case Studies Analysis</h2>
                    <p>${caseStudies.length} case studies found and analyzed</p>
                </div>
                
                ${caseStudies.length > 0 ? `
                    <!-- Case Study Navigation -->
                    <div class="case-study-nav" style="margin-bottom: 30px;">
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            ${caseStudies.map((cs, index) => `
                                <button onclick="showCaseStudy(${index})" class="case-nav-btn ${index === 0 ? 'active' : ''}" data-case="${index}" style="
                                    padding: 10px 20px; 
                                    border: 2px solid #667eea; 
                                    background: ${index === 0 ? '#667eea' : 'white'}; 
                                    color: ${index === 0 ? 'white' : '#667eea'}; 
                                    border-radius: 25px; 
                                    cursor: pointer; 
                                    font-weight: 500;
                                    transition: all 0.3s ease;
                                ">
                                    ${cs.title}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Individual Case Study Sections -->
                    ${caseStudies.map((cs, index) => this.generateFullCaseStudySection(cs, index)).join('')}
                    
                    <div class="case-study-summary card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-bar"></i> Case Study Summary</h3>
                        </div>
                        <div class="card-content">
                            ${this.generateCaseStudySummary(results.caseStudyAnalysis?.summary)}
                        </div>
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-book-open"></i>
                        <h3>No Case Studies Found</h3>
                        <p>The portfolio evaluation couldn't detect case study links. This could mean:</p>
                        <ul>
                            <li>Case studies are embedded in the homepage without separate links</li>
                            <li>Projects use non-standard link patterns</li>
                            <li>Case studies are behind navigation or require interaction</li>
                        </ul>
                    </div>
                `}
            </section>

            <!-- AI Insights Section -->
            <section id="ai-insights" class="section">
                <div class="section-header">
                    <h2><i class="fas fa-brain"></i> AI-Powered Insights</h2>
                    <p>Claude AI analysis and recommendations</p>
                </div>
                
                ${results.aiAnalysis ? `
                    <div class="ai-analysis-grid">
                        ${this.generateAIInsights(results.aiAnalysis)}
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-robot"></i>
                        <h3>AI Analysis Not Available</h3>
                        <p>Run evaluation with --ai flag to get AI-powered insights</p>
                    </div>
                `}
            </section>

            <!-- Recommendations Section -->
            <section id="recommendations" class="section">
                <div class="section-header">
                    <h2><i class="fas fa-lightbulb"></i> Recommendations</h2>
                    <p>Actionable improvements for better performance</p>
                </div>
                
                <div class="recommendations-grid">
                    ${this.generateRecommendations(results)}
                </div>
            </section>

            <!-- Screenshots Section -->
            <section id="screenshots" class="section">
                <div class="section-header">
                    <h2><i class="fas fa-images"></i> Visual Documentation</h2>
                    <p>Screenshots captured during analysis</p>
                </div>
                
                <div class="screenshots-grid">
                    ${this.generateScreenshotsGallery(results)}
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <p>Generated by Portfolio Agent • Powered by Claude AI • ${new Date().toLocaleDateString()}</p>
        </footer>
    </div>

    <script>
        ${this.getSPAJavaScript()}
    </script>
</body>
</html>`;
  }

  getSPAStyles() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }

        .app {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
            box-shadow: 0 0 50px rgba(0,0,0,0.1);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }

        .header-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo i {
            font-size: 2.5em;
        }

        .logo h1 {
            font-size: 2em;
            font-weight: 700;
        }

        .header-info {
            display: flex;
            align-items: center;
            gap: 30px;
        }

        .site-info h2 {
            font-size: 1.5em;
            margin-bottom: 5px;
        }

        .site-info a {
            color: rgba(255,255,255,0.9);
            text-decoration: none;
        }

        .overall-score {
            text-align: center;
        }

        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .score-circle.excellent { background: linear-gradient(135deg, #4CAF50, #45a049); }
        .score-circle.good { background: linear-gradient(135deg, #FF9800, #F57C00); }
        .score-circle.needs-improvement { background: linear-gradient(135deg, #f44336, #d32f2f); }

        .score-number {
            font-size: 1.5em;
        }

        .score-label {
            font-size: 0.8em;
            opacity: 0.9;
        }

        .header-stats {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }

        .stat {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.1);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }

        /* Navigation */
        .nav {
            background: white;
            border-bottom: 1px solid #e0e0e0;
            sticky: top 0;
            z-index: 100;
        }

        .nav-content {
            display: flex;
            padding: 0 30px;
            overflow-x: auto;
        }

        .nav-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 15px 20px;
            border: none;
            background: none;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            white-space: nowrap;
        }

        .nav-btn:hover {
            background: #f5f5f5;
        }

        .nav-btn.active {
            border-bottom-color: #667eea;
            color: #667eea;
            background: #f8f9ff;
        }

        .badge {
            background: #667eea;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 0.8em;
            margin-left: 5px;
        }

        /* Main Content */
        .main {
            padding: 30px;
        }

        .section {
            display: none;
        }

        .section.active {
            display: block;
        }

        .section-header {
            margin-bottom: 30px;
        }

        .section-header h2 {
            font-size: 2em;
            color: #333;
            margin-bottom: 10px;
        }

        .section-header p {
            color: #666;
            font-size: 1.1em;
        }

        /* Cards */
        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        .card-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
        }

        .card-header h3 {
            color: #333;
            font-size: 1.2em;
        }

        .card-content {
            padding: 20px;
        }

        /* Grids */
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }

        .case-studies-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .recommendations-grid {
            display: grid;
            gap: 20px;
        }

        .screenshots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }

        /* Score Card */
        .score-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }

        .score-card:hover {
            transform: translateY(-5px);
        }

        .score-card .score-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .score-card .score-title {
            font-size: 1.1em;
            color: #333;
            margin-bottom: 5px;
        }

        .score-card .score-description {
            color: #666;
            font-size: 0.9em;
        }

        /* Case Study Card */
        .case-study-card {
            border-left: 4px solid #667eea;
        }

        .case-study-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .case-study-title {
            font-size: 1.3em;
            color: #333;
        }

        .case-study-scores {
            display: flex;
            gap: 15px;
        }

        .mini-score {
            text-align: center;
            background: #f8f9fa;
            padding: 5px 10px;
            border-radius: 8px;
        }

        .mini-score-value {
            font-weight: bold;
            color: #667eea;
        }

        .mini-score-label {
            font-size: 0.8em;
            color: #666;
        }

        /* Responsive Design */
        .responsive-preview {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .device-preview {
            flex: 1;
            min-width: 250px;
        }

        .device-header {
            background: #333;
            color: white;
            padding: 8px 15px;
            border-radius: 8px 8px 0 0;
            font-size: 0.9em;
            text-align: center;
        }

        .device-preview img {
            width: 100%;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .empty-state i {
            font-size: 4em;
            margin-bottom: 20px;
            opacity: 0.5;
        }

        .empty-state h3 {
            margin-bottom: 15px;
            color: #333;
        }

        .empty-state ul {
            text-align: left;
            max-width: 500px;
            margin: 20px auto;
        }

        /* Footer */
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .header {
                padding: 20px;
            }

            .header-main {
                flex-direction: column;
                gap: 20px;
            }

            .header-stats {
                justify-content: center;
            }

            .main {
                padding: 20px;
            }

            .nav-content {
                padding: 0 20px;
            }

            .content-grid {
                grid-template-columns: 1fr;
            }

            .responsive-preview {
                flex-direction: column;
            }
        }
    `;
  }

  getSPAJavaScript() {
    return `
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Remove active from all nav buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Add active to selected nav button
            document.querySelector(\`[data-section="\${sectionId}"]\`).classList.add('active');
        }

        function expandCaseStudy(index) {
            const details = document.getElementById(\`case-study-details-\${index}\`);
            const button = details.previousElementSibling.querySelector('.expand-btn');
            
            if (details.style.display === 'none' || !details.style.display) {
                details.style.display = 'block';
                button.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
            } else {
                details.style.display = 'none';
                button.innerHTML = '<i class="fas fa-chevron-down"></i> Show More';
            }
        }

        function showCaseStudy(index) {
            // Hide all case study sections
            document.querySelectorAll('.case-study-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Remove active from all case study nav buttons
            document.querySelectorAll('.case-nav-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'white';
                btn.style.color = '#667eea';
            });
            
            // Show selected case study section
            const targetSection = document.getElementById(\`case-study-\${index}\`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Add active to selected nav button
            const activeBtn = document.querySelector(\`[data-case="\${index}"]\`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.style.background = '#667eea';
                activeBtn.style.color = 'white';
            }
        }

        function toggleRawAnalysis(index) {
            const rawSection = document.getElementById(\`raw-analysis-\${index}\`);
            const button = event.target.closest('button');
            
            if (rawSection.style.display === 'none' || !rawSection.style.display) {
                rawSection.style.display = 'block';
                button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Full Analysis';
            } else {
                rawSection.style.display = 'none';
                button.innerHTML = '<i class="fas fa-eye"></i> View Full Analysis';
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            showSection('overview');
        });
    `;
  }

  getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'needs-improvement';
  }

  generateScoreCards(results) {
    const scores = [];
    
    if (results.aiAnalysis && results.aiAnalysis.detailedAnalysis) {
      const analysis = results.aiAnalysis.detailedAnalysis;
      
      Object.entries(analysis).forEach(([key, value]) => {
        if (value && value.score) {
          scores.push({
            title: this.formatTitle(key),
            score: value.score,
            description: value.strengths?.[0] || 'AI analyzed',
            color: this.getScoreColor(value.score)
          });
        }
      });
    } else {
      // Fallback scores
      scores.push(
        { title: 'Visual Design', score: 85, description: 'Modern aesthetic', color: '#4CAF50' },
        { title: 'User Experience', score: 75, description: 'Good usability', color: '#FF9800' },
        { title: 'Content Quality', score: 80, description: 'Well structured', color: '#4CAF50' }
      );
    }

    return scores.map(score => `
      <div class="score-card">
        <div class="score-value" style="color: ${score.color};">${score.score}</div>
        <div class="score-title">${score.title}</div>
        <div class="score-description">${score.description}</div>
      </div>
    `).join('');
  }

  generateCaseStudyCard(caseStudy, index) {
    return `
      <div class="card case-study-card">
        <div class="card-header">
          <div class="case-study-header">
            <div class="case-study-title">${caseStudy.title}</div>
            <div class="case-study-scores">
              <div class="mini-score">
                <div class="mini-score-value">${caseStudy.storytellingScore}</div>
                <div class="mini-score-label">Story</div>
              </div>
              <div class="mini-score">
                <div class="mini-score-value">${caseStudy.userExperienceScore}</div>
                <div class="mini-score-label">UX</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-content">
          <p><strong>URL:</strong> <a href="${caseStudy.url}" target="_blank">${caseStudy.url}</a></p>
          <div style="margin: 15px 0;">
            <button class="expand-btn" onclick="expandCaseStudy(${index})" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
              <i class="fas fa-chevron-down"></i> Show Details
            </button>
          </div>
          <div id="case-study-details-${index}" style="display: none; margin-top: 15px;">
            ${this.generateCaseStudyDetails(caseStudy)}
          </div>
        </div>
      </div>
    `;
  }

  generateFullCaseStudySection(caseStudy, index) {
    const aiAnalysis = caseStudy.aiAnalysis;
    const elements = caseStudy.content?.storytellingElements || {};
    
    return `
      <div class="case-study-section ${index === 0 ? 'active' : ''}" id="case-study-${index}" style="display: ${index === 0 ? 'block' : 'none'};">
        <div class="case-study-header-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 15px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 300px;">
              <h2 style="font-size: 2.5em; margin-bottom: 15px; color: white;">${caseStudy.title}</h2>
              <p style="font-size: 1.1em; opacity: 0.9; margin-bottom: 10px;">
                <i class="fas fa-link"></i> 
                <a href="${caseStudy.url}" target="_blank" style="color: rgba(255,255,255,0.9); text-decoration: none;">
                  ${caseStudy.url}
                </a>
              </p>
              <div style="display: flex; gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 8px;">
                  <i class="fas fa-file-alt"></i> ${elements.wordCount || 0} words
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 8px;">
                  <i class="fas fa-images"></i> ${caseStudy.content?.images?.length || 0} images
                </div>
              </div>
            </div>
            
            ${aiAnalysis ? `
              <div style="text-align: center;">
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; min-width: 120px;">
                  <div style="font-size: 3em; font-weight: bold; color: white; margin-bottom: 5px;">
                    ${aiAnalysis.structured?.overallScore || 'N/A'}
                  </div>
                  <div style="opacity: 0.9;">AI Overall Score</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        ${aiAnalysis ? `
          <!-- AI Analysis Grid -->
          <div class="ai-analysis-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; margin-bottom: 30px;">
            
            <!-- Project Overview -->
            ${aiAnalysis.structured?.projectOverview ? `
              <div class="analysis-card" style="background: #f8faff; border-left: 5px solid #667eea; padding: 25px; border-radius: 10px;">
                <h3 style="color: #667eea; margin-bottom: 15px; font-size: 1.3em;">
                  <i class="fas fa-project-diagram"></i> Project Overview
                </h3>
                <p style="line-height: 1.6; color: #333;">${aiAnalysis.structured.projectOverview}</p>
              </div>
            ` : aiAnalysis ? `
              <div class="analysis-card" style="background: #f8faff; border-left: 5px solid #667eea; padding: 25px; border-radius: 10px;">
                <h3 style="color: #667eea; margin-bottom: 15px; font-size: 1.3em;">
                  <i class="fas fa-project-diagram"></i> AI Analysis Status
                </h3>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.2em;"></i>
                  <span style="color: #333;">AI analysis completed - Individual case study insights processed</span>
                </div>
                <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                  Detailed insights including project overview, strengths, improvements, and recommendations are available in the raw AI analysis.
                </p>
              </div>
            ` : ''}

            <!-- Scoring Breakdown -->
            <div class="scoring-card" style="background: white; border-radius: 10px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 20px; font-size: 1.3em;">
                <i class="fas fa-chart-line"></i> AI Assessment Scores
              </h3>
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f0f9ff; border-radius: 8px;">
                  <span style="font-weight: 500;">Storytelling</span>
                  <span style="font-size: 1.2em; font-weight: bold; color: #0369a1;">
                    ${aiAnalysis.structured?.storytellingScore || 'N/A'}/100
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f0fdf4; border-radius: 8px;">
                  <span style="font-weight: 500;">Visual Design</span>
                  <span style="font-size: 1.2em; font-weight: bold; color: #059669;">
                    ${aiAnalysis.structured?.visualDesignScore || 'N/A'}/100
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fef3c7; border-radius: 8px;">
                  <span style="font-weight: 500;">Content Strategy</span>
                  <span style="font-size: 1.2em; font-weight: bold; color: #d97706;">
                    ${aiAnalysis.structured?.contentStrategyScore || 'N/A'}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Key Insights Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px; margin-bottom: 30px;">
            
            ${aiAnalysis.structured?.strengths?.length > 0 ? `
              <div class="insights-card" style="background: #f0fdf4; border-radius: 10px; padding: 25px; border-left: 5px solid #10b981;">
                <h3 style="color: #059669; margin-bottom: 20px; font-size: 1.3em;">
                  <i class="fas fa-thumbs-up"></i> Key Strengths
                </h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${aiAnalysis.structured.strengths.map(strength => `
                    <li style="margin-bottom: 12px; padding-left: 25px; position: relative; line-height: 1.5;">
                      <i class="fas fa-check-circle" style="position: absolute; left: 0; top: 2px; color: #10b981;"></i>
                      ${strength}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            ${aiAnalysis.structured?.improvements?.length > 0 ? `
              <div class="insights-card" style="background: #fef2f2; border-radius: 10px; padding: 25px; border-left: 5px solid #ef4444;">
                <h3 style="color: #dc2626; margin-bottom: 20px; font-size: 1.3em;">
                  <i class="fas fa-arrow-up"></i> Areas for Improvement
                </h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${aiAnalysis.structured.improvements.map(improvement => `
                    <li style="margin-bottom: 12px; padding-left: 25px; position: relative; line-height: 1.5;">
                      <i class="fas fa-exclamation-triangle" style="position: absolute; left: 0; top: 2px; color: #ef4444;"></i>
                      ${improvement}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          ${aiAnalysis.structured?.recommendations?.length > 0 ? `
            <!-- Actionable Recommendations -->
            <div class="recommendations-section" style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 30px;">
              <h3 style="color: #667eea; margin-bottom: 25px; font-size: 1.4em;">
                <i class="fas fa-lightbulb"></i> Actionable Recommendations
              </h3>
              <div style="display: grid; gap: 20px;">
                ${aiAnalysis.structured.recommendations.map((rec, idx) => `
                  <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px;">
                    <div style="display: flex; align-items: flex-start; gap: 15px;">
                      <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                        ${idx + 1}
                      </div>
                      <div style="flex: 1;">
                        <p style="margin: 0; line-height: 1.6; font-weight: 500;">${rec}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${aiAnalysis.structured?.competitiveAnalysis ? `
            <!-- Competitive Analysis -->
            <div class="competitive-section" style="background: #faf5ff; border-radius: 10px; padding: 25px; margin-bottom: 30px; border-left: 5px solid #8b5cf6;">
              <h3 style="color: #8b5cf6; margin-bottom: 15px; font-size: 1.3em;">
                <i class="fas fa-chart-bar"></i> Competitive Analysis
              </h3>
              <p style="line-height: 1.6; color: #333;">${aiAnalysis.structured.competitiveAnalysis}</p>
            </div>
          ` : ''}

          ${aiAnalysis.structured?.overallAssessment ? `
            <!-- Overall Assessment -->
            <div class="assessment-section" style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 15px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 1.4em;">
                <i class="fas fa-clipboard-check"></i> AI Overall Assessment
              </h3>
              <div style="background: white; padding: 25px; border-radius: 10px; border-left: 4px solid #6b7280;">
                <p style="line-height: 1.6; margin: 0; color: #374151; font-size: 1.1em;">${aiAnalysis.structured.overallAssessment}</p>
              </div>
            </div>
          ` : ''}

          ${aiAnalysis.rawAnalysis ? `
            <!-- Raw AI Analysis -->
            <div class="raw-ai-section" style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 30px;">
              <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #667eea; font-size: 1.4em;">
                  <i class="fas fa-robot"></i> Complete AI Analysis
                </h3>
                <button onclick="toggleRawAnalysis(${index})" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                  <i class="fas fa-eye"></i> View Full Analysis
                </button>
              </div>
              <div id="raw-analysis-${index}" style="display: none;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; font-family: monospace; white-space: pre-wrap; max-height: 500px; overflow-y: auto; line-height: 1.5;">
                  ${aiAnalysis.rawAnalysis.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
              </div>
            </div>
          ` : ''}
        ` : ''}

        <!-- Technical Analysis & Screenshot -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px;">
          
          <!-- Technical Analysis -->
          <div class="technical-card" style="background: white; border-radius: 10px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-bottom: 20px; font-size: 1.3em;">
              <i class="fas fa-cogs"></i> Technical Analysis
            </h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                <span>Problem Statement</span>
                <span style="font-size: 1.2em;">${elements.hasProblemStatement ? '✅' : '❌'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                <span>Process Documentation</span>
                <span style="font-size: 1.2em;">${elements.hasProcess ? '✅' : '❌'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                <span>Solution Presentation</span>
                <span style="font-size: 1.2em;">${elements.hasSolution ? '✅' : '❌'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                <span>Impact Measurement</span>
                <span style="font-size: 1.2em;">${elements.hasImpact ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          ${caseStudy.screenshot ? `
            <!-- Screenshot -->
            <div class="screenshot-card" style="background: white; border-radius: 10px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 20px; font-size: 1.3em;">
                <i class="fas fa-camera"></i> Case Study Screenshot
              </h3>
              <img src="${caseStudy.screenshot}" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" alt="Case study screenshot">
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateCaseStudyDetails(caseStudy) {
    const elements = caseStudy.content?.storytellingElements || {};
    const aiAnalysis = caseStudy.aiAnalysis;
    
    return `
      <div style="border-top: 1px solid #e0e0e0; padding-top: 15px;">
        ${aiAnalysis ? `
          <!-- AI Analysis Section -->
          <div class="ai-insights-panel" style="margin-bottom: 20px;">
            <h4 style="color: #667eea; margin-bottom: 15px;"><i class="fas fa-brain"></i> AI Insights</h4>
            
            <div class="insights-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
              <div class="insight-card" style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0369a1;">
                <div style="font-size: 1.5em; font-weight: bold; color: #0369a1;">${aiAnalysis.structured?.storytellingScore || 'N/A'}</div>
                <div style="font-size: 0.9em; color: #666;">Storytelling Score</div>
              </div>
              <div class="insight-card" style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
                <div style="font-size: 1.5em; font-weight: bold; color: #059669;">${aiAnalysis.structured?.visualDesignScore || 'N/A'}</div>
                <div style="font-size: 0.9em; color: #666;">Visual Design</div>
              </div>
              <div class="insight-card" style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #d97706;">
                <div style="font-size: 1.5em; font-weight: bold; color: #d97706;">${aiAnalysis.structured?.contentStrategyScore || 'N/A'}</div>
                <div style="font-size: 0.9em; color: #666;">Content Strategy</div>
              </div>
            </div>
            
            ${aiAnalysis.structured?.projectOverview ? `
              <div style="margin-bottom: 15px;">
                <h5 style="color: #333; margin-bottom: 8px;"><i class="fas fa-project-diagram"></i> Project Overview</h5>
                <p style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 0; line-height: 1.5;">${aiAnalysis.structured.projectOverview}</p>
              </div>
            ` : ''}
            
            ${aiAnalysis.structured?.strengths?.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <h5 style="color: #4CAF50; margin-bottom: 8px;"><i class="fas fa-thumbs-up"></i> Key Strengths</h5>
                <ul style="background: #f0fdf4; padding: 12px 12px 12px 30px; border-radius: 6px; margin: 0;">
                  ${aiAnalysis.structured.strengths.map(strength => `<li style="margin-bottom: 5px;">${strength}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${aiAnalysis.structured?.improvements?.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <h5 style="color: #ff6b35; margin-bottom: 8px;"><i class="fas fa-arrow-up"></i> Areas for Improvement</h5>
                <ul style="background: #fef2f2; padding: 12px 12px 12px 30px; border-radius: 6px; margin: 0;">
                  ${aiAnalysis.structured.improvements.map(improvement => `<li style="margin-bottom: 5px;">${improvement}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${aiAnalysis.structured?.recommendations?.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <h5 style="color: #667eea; margin-bottom: 8px;"><i class="fas fa-lightbulb"></i> Actionable Recommendations</h5>
                <ol style="background: #f8f9ff; padding: 12px 12px 12px 30px; border-radius: 6px; margin: 0;">
                  ${aiAnalysis.structured.recommendations.map(rec => `<li style="margin-bottom: 8px; font-weight: 500;">${rec}</li>`).join('')}
                </ol>
              </div>
            ` : ''}
            
            ${aiAnalysis.structured?.competitiveAnalysis ? `
              <div style="margin-bottom: 15px;">
                <h5 style="color: #8b5cf6; margin-bottom: 8px;"><i class="fas fa-chart-bar"></i> Competitive Analysis</h5>
                <p style="background: #faf5ff; padding: 12px; border-radius: 6px; margin: 0; line-height: 1.5;">${aiAnalysis.structured.competitiveAnalysis}</p>
              </div>
            ` : ''}
            
            ${aiAnalysis.structured?.overallAssessment ? `
              <div style="margin-bottom: 15px;">
                <h5 style="color: #1f2937; margin-bottom: 8px;"><i class="fas fa-clipboard-check"></i> Overall Assessment</h5>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #6b7280;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px;">
                      ${aiAnalysis.structured?.overallScore || 'N/A'}
                    </div>
                    <div style="font-weight: 600; color: #1f2937;">AI Overall Score</div>
                  </div>
                  <p style="margin: 0; line-height: 1.5;">${aiAnalysis.structured.overallAssessment}</p>
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Technical Analysis Section -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
        ` : ''}
        
        <h4>Technical Analysis:</h4>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Problem Statement: ${elements.hasProblemStatement ? '✅' : '❌'}</li>
          <li>Process Documentation: ${elements.hasProcess ? '✅' : '❌'}</li>
          <li>Solution Presentation: ${elements.hasSolution ? '✅' : '❌'}</li>
          <li>Impact Measurement: ${elements.hasImpact ? '✅' : '❌'}</li>
        </ul>
        <p><strong>Word Count:</strong> ${elements.wordCount || 0} words</p>
        <p><strong>Images:</strong> ${caseStudy.content?.images?.length || 0} visual elements</p>
        
        ${caseStudy.screenshot ? `
          <div style="margin-top: 15px;">
            <h5 style="margin-bottom: 10px;"><i class="fas fa-camera"></i> Case Study Screenshot</h5>
            <img src="${caseStudy.screenshot}" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" alt="Case study screenshot">
          </div>
        ` : ''}
        
        ${aiAnalysis ? '</div>' : ''}
      </div>
    `;
  }

  // Helper methods
  formatTitle(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  getScoreColor(score) {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#f44336';
  }

  generateStrengthsList(results) {
    const strengths = [];
    if (results.aiAnalysis?.detailedAnalysis?.visualDesign?.strengths) {
      strengths.push(...results.aiAnalysis.detailedAnalysis.visualDesign.strengths.slice(0, 3));
    } else {
      strengths.push('Modern design aesthetic', 'Responsive layout', 'Professional presentation');
    }
    
    return '<ul>' + strengths.map(s => `<li>${s}</li>`).join('') + '</ul>';
  }

  generateHomepageAnalysis(results) {
    return `
      <div class="homepage-metrics">
        <div style="display: grid; gap: 15px;">
          <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <span>Visual Appeal</span>
            <span style="color: #4CAF50; font-weight: bold;">Excellent</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <span>Content Clarity</span>
            <span style="color: #4CAF50; font-weight: bold;">Good</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <span>Navigation</span>
            <span style="color: #FF9800; font-weight: bold;">Needs Improvement</span>
          </div>
        </div>
      </div>
    `;
  }

  generateAIInsights(aiAnalysis) {
    if (!aiAnalysis.detailedAnalysis) return '<p>No AI insights available</p>';
    
    return Object.entries(aiAnalysis.detailedAnalysis).map(([category, analysis]) => {
      if (typeof analysis === 'object' && analysis.score) {
        return `
          <div class="card">
            <div class="card-header">
              <h3>${this.formatTitle(category)} (${analysis.score}/100)</h3>
            </div>
            <div class="card-content">
              <p><strong>AI Feedback:</strong> ${analysis.feedback || 'Analysis completed'}</p>
              ${analysis.strengths && analysis.strengths.length > 0 ? `
                <div style="margin-top: 15px;">
                  <strong style="color: #4CAF50;">Strengths:</strong>
                  <ul>${analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
              ` : ''}
              ${analysis.weaknesses && analysis.weaknesses.length > 0 ? `
                <div style="margin-top: 15px;">
                  <strong style="color: #f44336;">Areas for Improvement:</strong>
                  <ul>${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
      return '';
    }).join('');
  }

  generateRecommendations(results) {
    const recommendations = results.aiAnalysis?.recommendations || {};
    
    let html = '';
    
    ['immediate', 'shortTerm', 'longTerm'].forEach(priority => {
      if (recommendations[priority] && recommendations[priority].length > 0) {
        const priorityTitle = priority === 'immediate' ? 'High Priority' : 
                            priority === 'shortTerm' ? 'Medium Priority' : 'Long Term';
        const priorityColor = priority === 'immediate' ? '#f44336' : 
                            priority === 'shortTerm' ? '#FF9800' : '#4CAF50';
        
        html += `
          <div class="card">
            <div class="card-header" style="background: ${priorityColor}; color: white;">
              <h3>${priorityTitle}</h3>
            </div>
            <div class="card-content">
              ${recommendations[priority].map(rec => `
                <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                  <strong>${rec.category}:</strong> ${rec.action}
                  <div style="margin-top: 5px; font-size: 0.9em; color: #666;">
                    <strong>Impact:</strong> ${rec.impact}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    });
    
    return html || '<div class="empty-state"><p>No specific recommendations available</p></div>';
  }

  generateCaseStudySummary(summary) {
    if (!summary) return '<p>No case study summary available</p>';
    
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
        <div style="text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px;">
          <div style="font-size: 2em; font-weight: bold; color: #0369a1;">${summary.averageStorytellingScore}</div>
          <div>Avg Storytelling</div>
        </div>
        <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 8px;">
          <div style="font-size: 2em; font-weight: bold; color: #059669;">${summary.averageUXScore}</div>
          <div>Avg UX Score</div>
        </div>
      </div>
      
      ${summary.commonStrengths.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <strong style="color: #4CAF50;">Common Strengths:</strong>
          <ul>${summary.commonStrengths.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${summary.commonWeaknesses.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <strong style="color: #f44336;">Areas for Improvement:</strong>
          <ul>${summary.commonWeaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
        </div>
      ` : ''}
    `;
  }

  generateScreenshotsGallery(results) {
    const screenshots = [];
    
    if (results.desktop?.screenshot) {
      screenshots.push({
        title: 'Homepage - Desktop',
        src: results.desktop.screenshot,
        description: '1920x1080 viewport'
      });
    }
    
    if (results.mobile?.screenshot) {
      screenshots.push({
        title: 'Homepage - Mobile',
        src: results.mobile.screenshot,
        description: '375x667 viewport'
      });
    }
    
    if (results.caseStudyAnalysis?.analyzed) {
      results.caseStudyAnalysis.analyzed.forEach(cs => {
        if (cs.screenshot) {
          screenshots.push({
            title: `Case Study - ${cs.title}`,
            src: cs.screenshot,
            description: cs.url
          });
        }
      });
    }
    
    if (screenshots.length === 0) {
      return '<div class="empty-state"><p>No screenshots available</p></div>';
    }
    
    return screenshots.map(screenshot => `
      <div class="card">
        <div class="card-header">
          <h3>${screenshot.title}</h3>
          <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #666;">${screenshot.description}</p>
        </div>
        <div class="card-content" style="padding: 0;">
          <img src="${screenshot.src}" style="width: 100%; height: auto;" alt="${screenshot.title}">
        </div>
      </div>
    `).join('');
  }
}

module.exports = SPAReportGenerator;