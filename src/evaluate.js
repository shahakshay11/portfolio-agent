#!/usr/bin/env node

const PortfolioEvaluator = require('./evaluators/portfolio-evaluator');
const MultiReportGenerator = require('./reporters/multi-report-generator');
const SPAReportGenerator = require('./reporters/spa-report-generator');
const fs = require('fs-extra');
const path = require('path');

// Simplified analysis for serverless environments
async function createSimplifiedAnalysis(url, options) {
  console.log('📋 Creating simplified portfolio analysis...');
  
  try {
    // Basic URL validation and info extraction
    const urlObj = new URL(url);
    
    return {
      url: url,
      domain: urlObj.hostname,
      timestamp: new Date().toISOString(),
      analysis: {
        homepage: {
          url: url,
          title: `Portfolio Analysis - ${urlObj.hostname}`,
          description: 'Simplified analysis mode - full browser testing not available in serverless environment',
          accessibility: {
            score: 'N/A',
            message: 'Accessibility testing requires browser automation'
          },
          performance: {
            score: 'N/A', 
            message: 'Performance testing requires browser automation'
          },
          design: {
            message: 'Visual design analysis requires browser automation for screenshots and DOM inspection'
          }
        },
        caseStudies: [],
        summary: {
          totalPages: 1,
          totalIssues: 0,
          recommendations: [
            'Deploy to an environment that supports browser automation for full analysis',
            'Consider using Railway, Render, or a VPS for complete portfolio evaluation',
            'This simplified mode provides basic URL validation and AI analysis only'
          ]
        }
      },
      metadata: {
        evaluationMode: 'simplified',
        browserAutomation: false,
        aiAnalysis: options.enableAI,
        environment: 'serverless'
      }
    };
  } catch (error) {
    console.error('❌ Error creating simplified analysis:', error.message);
    throw error;
  }
}

async function generateSimplifiedReports(results) {
  console.log('📄 Generating simplified reports...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.join(process.cwd(), 'reports');
  
  // Ensure reports directory exists
  await fs.ensureDir(reportsDir);
  
  // Generate a simple HTML report
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simplified Portfolio Analysis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .recommendations { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .recommendations ul { margin: 10px 0; padding-left: 20px; }
        .timestamp { color: #6c757d; font-size: 14px; text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Portfolio Analysis Report</h1>
            <h2>${results.domain}</h2>
            <p><strong>URL:</strong> <a href="${results.url}" target="_blank">${results.url}</a></p>
        </div>
        
        <div class="warning">
            <h3>⚠️ Simplified Analysis Mode</h3>
            <p>This analysis was generated in simplified mode because browser automation is not available in the current serverless environment.</p>
        </div>
        
        <div class="info">
            <h3>🔍 Analysis Details</h3>
            <ul>
                <li><strong>Environment:</strong> ${results.metadata.environment}</li>
                <li><strong>Browser Automation:</strong> ${results.metadata.browserAutomation ? 'Available' : 'Not Available'}</li>
                <li><strong>AI Analysis:</strong> ${results.metadata.aiAnalysis ? 'Enabled' : 'Disabled'}</li>
                <li><strong>Evaluation Mode:</strong> ${results.metadata.evaluationMode}</li>
            </ul>
        </div>
        
        <div class="recommendations">
            <h3>💡 Recommendations for Full Analysis</h3>
            <ul>
                ${results.analysis.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="info">
            <h3>🚀 Alternative Deployment Options</h3>
            <p>For complete portfolio analysis with browser automation, consider deploying to:</p>
            <ul>
                <li><strong>Railway:</strong> Full Node.js support with browser automation</li>
                <li><strong>Render:</strong> Free tier with full browser capabilities</li>
                <li><strong>Fly.io:</strong> Docker-based deployment with browser support</li>
                <li><strong>VPS/Cloud Server:</strong> Complete control over the environment</li>
            </ul>
        </div>
        
        <div class="timestamp">
            Generated on ${new Date(results.timestamp).toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  
  const reportPath = path.join(reportsDir, `simplified-analysis-${timestamp}.html`);
  await fs.writeFile(reportPath, htmlContent, 'utf8');
  
  console.log(`📄 Simplified report generated: ${reportPath}`);
  console.log(`🌐 Access your report at: /reports/${path.basename(reportPath)}`);
  
  return reportPath;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node src/evaluate.js <url> [options]');
    console.log('Options:');
    console.log('  --mobile       Include mobile evaluation');
    console.log('  --accessibility Run accessibility audit');
    console.log('  --performance  Run performance analysis');
    console.log('  --ai           Enable AI-powered analysis (requires ANTHROPIC_API_KEY)');
    return;
  }

  const url = args[0];
  const options = {
    includeMobile: args.includes('--mobile'),
    runAccessibility: args.includes('--accessibility'),
    runPerformance: args.includes('--performance'),
    enableAI: args.includes('--ai') || process.env.ENABLE_AI_ANALYSIS === 'true',
    analyzeCaseStudies: args.includes('--case-studies') || true // Default to true
  };

  console.log(`🔍 Evaluating portfolio: ${url}`);
  console.log(`📱 Mobile testing: ${options.includeMobile ? 'Yes' : 'No'}`);
  console.log(`♿ Accessibility testing: ${options.runAccessibility ? 'Yes' : 'No'}`);
  console.log(`⚡ Performance testing: ${options.runPerformance ? 'Yes' : 'No'}`);
  console.log(`🤖 AI analysis: ${options.enableAI ? 'Yes' : 'No'}`);
  console.log(`📖 Case study analysis: ${options.analyzeCaseStudies ? 'Yes' : 'No'}`);
  console.log('');

  try {
    // Check if we're in a serverless environment (like Vercel) but allow Render to use full analysis
    const isServerless = (process.env.VERCEL || process.env.LAMBDA_RUNTIME_DIR) && !process.env.RENDER;
    
    if (isServerless) {
      console.log('🌐 Detected serverless environment - using simplified analysis mode');
      // Create simplified results without browser automation
      const results = await createSimplifiedAnalysis(url, options);
      await generateSimplifiedReports(results);
      return;
    }
    
    const evaluator = new PortfolioEvaluator();
    const results = await evaluator.evaluate(url, options);
    
    // Generate both multi-report and SPA versions
    const reporter = new MultiReportGenerator();
    const reportPaths = await reporter.generateMultipleReports(results, {
      outputDir: './reports'
    });
    
    const spaReporter = new SPAReportGenerator();
    const spaReportPath = await spaReporter.generateSPAReport(results, {
      outputDir: './reports'
    });
    
    console.log('');
    console.log('✅ Evaluation complete!');
    console.log(`📊 Overall Score: ${results.overallScore}/100`);
    console.log(`🎨 SPA Report: ${spaReportPath}`);
    console.log(`📄 Main report: ${reportPaths.main}`);
    console.log(`🏠 Homepage report: ${reportPaths.homepage}`);
    console.log(`📊 Index report: ${reportPaths.index}`);
    
    if (reportPaths.caseStudies && reportPaths.caseStudies.length > 0) {
      console.log(`📖 Case study reports: ${reportPaths.caseStudies.length} generated`);
      reportPaths.caseStudies.forEach(cs => {
        console.log(`   - ${cs.title}: ${cs.filepath}`);
      });
    }
    
    // Display key findings
    if (results.subjectiveMetrics?.recommendations?.length > 0) {
      console.log('');
      console.log('🔍 Key Recommendations:');
      results.subjectiveMetrics.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.suggestion}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Evaluation failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

main();