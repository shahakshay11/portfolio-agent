#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Ensure directories exist and serve static files
// Handle different deployment environments (local vs Render)
const baseDir = process.cwd(); // Use current working directory instead of __dirname
const reportsDir = path.join(baseDir, 'reports');
const publicDir = path.join(baseDir, 'public');

console.log('Server starting from __dirname:', __dirname);
console.log('Process working directory:', process.cwd());
console.log('Base directory for static files:', baseDir);
console.log('Reports directory:', reportsDir, '- exists:', fs.existsSync(reportsDir));
console.log('Public directory:', publicDir, '- exists:', fs.existsSync(publicDir));

// Debug: List contents of base directory
try {
  const baseContents = fs.readdirSync(baseDir);
  console.log('Base directory contents:', baseContents.join(', '));
  
  if (fs.existsSync(publicDir)) {
    const publicContents = fs.readdirSync(publicDir);
    console.log('Public directory contents:', publicContents.join(', '));
  }
} catch (error) {
  console.error('Error reading directories:', error.message);
}

// Ensure reports directory exists
fs.ensureDirSync(reportsDir);

app.use('/reports', express.static(reportsDir));
app.use(express.static(publicDir));

// Store active analyses
const activeAnalyses = new Map();

// Helper function to categorize log messages
function getCategoryFromMessage(message) {
  if (message.includes('EVALUATION') || message.includes('ANALYSIS')) {
    return 'phase';
  } else if (message.includes('Claude') || message.includes('AI')) {
    return 'ai';
  } else if (message.includes('Case study') || message.includes('case study')) {
    return 'casestudy';
  } else if (message.includes('screenshot') || message.includes('Screenshot')) {
    return 'screenshot';
  } else if (message.includes('viewport') || message.includes('mobile') || message.includes('desktop')) {
    return 'viewport';
  } else if (message.includes('Score:') || message.includes('score')) {
    return 'score';
  } else if (message.includes('Navigate') || message.includes('Loading')) {
    return 'navigation';
  } else if (message.includes('color') || message.includes('typography') || message.includes('design')) {
    return 'design';
  }
  return 'general';
}

// Routes
app.get('/', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  console.log('Looking for index.html at:', indexPath);
  
  // Check if file exists before trying to send it
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('index.html not found at:', indexPath);
    res.status(500).send(`
      <h1>Portfolio Analyzer</h1>
      <p>Error: Static files not found. Please check deployment configuration.</p>
      <p>Looking for: ${indexPath}</p>
      <p>__dirname: ${__dirname}</p>
      <p>process.cwd(): ${process.cwd()}</p>
      <p>publicDir: ${publicDir}</p>
      <p>Base directory contents: ${fs.readdirSync(baseDir).join(', ')}</p>
    `);
  }
});

// Start portfolio analysis
app.post('/api/analyze', async (req, res) => {
  const { url, options = {} } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Generate analysis ID
  const analysisId = Date.now().toString();
  
  // Build command arguments
  const args = [url];
  if (options.mobile) args.push('--mobile');
  if (options.accessibility) args.push('--accessibility');
  if (options.performance) args.push('--performance');
  if (options.ai) args.push('--ai');
  if (options.caseStudies) args.push('--case-studies');

  try {
    // Store analysis info
    activeAnalyses.set(analysisId, {
      url,
      status: 'running',
      startTime: new Date(),
      logs: [],
      results: null
    });

    // Start the analysis process - use direct node call for Vercel compatibility
    const evaluateScript = path.join(__dirname, 'src', 'evaluate.js');
    const child = spawn('node', [evaluateScript, ...args], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    let outputBuffer = '';
    let errorBuffer = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      
      // Display analysis logs in server console
      console.log(output.trimEnd());
      
      // Parse and categorize different types of logs
      const lines = output.split('\n').filter(line => line.trim());
      
      const analysis = activeAnalyses.get(analysisId);
      if (analysis) {
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            let logType = 'info';
            let cleanMessage = trimmedLine;
            
            // Categorize log types based on emoji/content
            if (trimmedLine.includes('🤖') || trimmedLine.includes('Claude')) {
              logType = 'ai';
            } else if (trimmedLine.includes('📸') || trimmedLine.includes('Screenshot')) {
              logType = 'screenshot';
            } else if (trimmedLine.includes('📖') || trimmedLine.includes('Case study')) {
              logType = 'casestudy';
            } else if (trimmedLine.includes('✅') || trimmedLine.includes('completed') || trimmedLine.includes('success')) {
              logType = 'success';
            } else if (trimmedLine.includes('⚠️') || trimmedLine.includes('warning') || trimmedLine.includes('failed')) {
              logType = 'warning';
            } else if (trimmedLine.includes('❌') || trimmedLine.includes('error')) {
              logType = 'error';
            } else if (trimmedLine.includes('🚀') || trimmedLine.includes('Starting')) {
              logType = 'start';
            } else if (trimmedLine.includes('🎯') || trimmedLine.includes('Score:')) {
              logType = 'score';
            }
            
            analysis.logs.push({
              type: logType,
              message: cleanMessage,
              timestamp: new Date(),
              category: getCategoryFromMessage(cleanMessage)
            });
          }
        });
      }
    });

    child.stderr.on('data', (data) => {
      const error = data.toString();
      errorBuffer += error;
      
      const analysis = activeAnalyses.get(analysisId);
      if (analysis) {
        const lines = error.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            analysis.logs.push({
              type: 'error',
              message: trimmedLine,
              timestamp: new Date(),
              category: 'system'
            });
          }
        });
      }
    });

    child.on('close', async (code) => {
      const analysis = activeAnalyses.get(analysisId);
      if (analysis) {
        if (code === 0) {
          analysis.status = 'completed';
          
          // Extract report paths from output (support both full and simplified analysis)
          const spaMatch = outputBuffer.match(/🎨 SPA Report: (.+)/);
          const mainMatch = outputBuffer.match(/📄 Main report: (.+)/);
          const indexMatch = outputBuffer.match(/📊 Index report: (.+)/);
          const simplifiedMatch = outputBuffer.match(/📄 Simplified report generated: (.+)/);
          const reportAccessMatch = outputBuffer.match(/🌐 Access your report at: (.+)/);
          
          analysis.results = {
            spaReport: spaMatch ? spaMatch[1] : null,
            mainReport: mainMatch ? mainMatch[1] : null,
            indexReport: indexMatch ? indexMatch[1] : null,
            simplifiedReport: simplifiedMatch ? simplifiedMatch[1] : null,
            reportUrl: reportAccessMatch ? reportAccessMatch[1] : null,
            output: outputBuffer,
            exitCode: code,
            isSimplified: outputBuffer.includes('Detected serverless environment')
          };
        } else {
          analysis.status = 'failed';
          analysis.error = errorBuffer;
        }
        analysis.endTime = new Date();
      }
    });

    res.json({
      analysisId,
      status: 'started',
      message: 'Portfolio analysis started'
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analysis status
app.get('/api/analysis/:id', (req, res) => {
  const analysisId = req.params.id;
  const analysis = activeAnalyses.get(analysisId);
  
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found' });
  }
  
  res.json(analysis);
});

// Get analysis logs (Server-Sent Events)
app.get('/api/analysis/:id/logs', (req, res) => {
  const analysisId = req.params.id;
  const analysis = activeAnalyses.get(analysisId);
  
  console.log(`SSE request for analysis ${analysisId}, found: ${!!analysis}`);
  
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  console.log(`SSE connection established for analysis ${analysisId}, existing logs: ${analysis.logs.length}`);

  // Send existing logs
  analysis.logs.forEach(log => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });

  // Track which logs we've already sent to avoid duplicates
  let lastLogCount = analysis.logs.length;

  // Keep connection alive and send new logs
  const interval = setInterval(() => {
    const currentAnalysis = activeAnalyses.get(analysisId);
    if (!currentAnalysis) {
      clearInterval(interval);
      res.end();
      return;
    }

    // Send any new logs that have been added
    if (currentAnalysis.logs.length > lastLogCount) {
      const newLogs = currentAnalysis.logs.slice(lastLogCount);
      console.log(`Streaming ${newLogs.length} new logs for analysis ${analysisId}`);
      newLogs.forEach(log => {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
      });
      lastLogCount = currentAnalysis.logs.length;
    }

    // Check if analysis is complete
    if (currentAnalysis.status !== 'running') {
      res.write(`data: ${JSON.stringify({
        type: 'status',
        message: `Analysis ${currentAnalysis.status}`,
        status: currentAnalysis.status,
        results: currentAnalysis.results
      })}\n\n`);
      
      clearInterval(interval);
      setTimeout(() => res.end(), 1000);
    }
  }, 500); // Check more frequently for better real-time updates

  req.on('close', () => {
    clearInterval(interval);
  });
});

// List recent reports
app.get('/api/reports', async (req, res) => {
  try {
    const reportsDir = path.join(__dirname, 'reports');
    const files = await fs.readdir(reportsDir);
    
    const reports = [];
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(reportsDir, file);
        const stats = await fs.stat(filePath);
        
        reports.push({
          filename: file,
          path: `/reports/${file}`,
          size: stats.size,
          created: stats.mtime,
          type: file.includes('spa') ? 'SPA' : 
                file.includes('homepage') ? 'Homepage' :
                file.includes('index') ? 'Index' :
                file.includes('case-study') ? 'Case Study' : 'Main'
        });
      }
    }
    
    reports.sort((a, b) => b.created - a.created);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    activeAnalyses: activeAnalyses.size
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Cleanup old analyses periodically
setInterval(() => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
  
  for (const [id, analysis] of activeAnalyses.entries()) {
    if (analysis.startTime.getTime() < cutoff) {
      activeAnalyses.delete(id);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Portfolio Analyzer Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🌐 To expose via ngrok: ngrok http ${PORT}`);
});

module.exports = app;