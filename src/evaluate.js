#!/usr/bin/env node

const PortfolioEvaluator = require('./evaluators/portfolio-evaluator');
const MultiReportGenerator = require('./reporters/multi-report-generator');
const SPAReportGenerator = require('./reporters/spa-report-generator');

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