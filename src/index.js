#!/usr/bin/env node

const { program } = require('commander');
const PortfolioEvaluator = require('./evaluators/portfolio-evaluator');
const ReportGenerator = require('./reporters/report-generator');

program
  .name('portfolio-agent')
  .description('AI-powered design portfolio evaluation system')
  .version('1.0.0');

program
  .command('evaluate')
  .description('Evaluate a design portfolio')
  .argument('<url>', 'Portfolio URL to evaluate')
  .option('-o, --output <dir>', 'Output directory for reports', './reports')
  .option('-f, --format <type>', 'Report format (json|html|pdf)', 'html')
  .option('--mobile', 'Include mobile evaluation')
  .option('--accessibility', 'Run accessibility audit')
  .option('--performance', 'Run performance analysis')
  .action(async (url, options) => {
    console.log(`🔍 Evaluating portfolio: ${url}`);
    
    try {
      const evaluator = new PortfolioEvaluator();
      const results = await evaluator.evaluate(url, {
        includeMobile: options.mobile,
        runAccessibility: options.accessibility,
        runPerformance: options.performance
      });
      
      const reporter = new ReportGenerator();
      const reportPath = await reporter.generate(results, {
        format: options.format,
        outputDir: options.output
      });
      
      console.log(`✅ Evaluation complete! Report saved to: ${reportPath}`);
      console.log(`📊 Overall Score: ${results.overallScore}/100`);
      
    } catch (error) {
      console.error('❌ Evaluation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Evaluate multiple portfolios from a list')
  .argument('<file>', 'JSON file containing portfolio URLs')
  .option('-o, --output <dir>', 'Output directory for reports', './reports')
  .action(async (file, options) => {
    console.log(`📋 Running batch evaluation from: ${file}`);
    // Implementation for batch processing
  });

program
  .command('compare')
  .description('Compare multiple portfolios')
  .argument('<urls...>', 'Portfolio URLs to compare')
  .option('-o, --output <dir>', 'Output directory for comparison report', './reports')
  .action(async (urls, options) => {
    console.log(`🔀 Comparing ${urls.length} portfolios`);
    // Implementation for portfolio comparison
  });

program.parse();

module.exports = { program };