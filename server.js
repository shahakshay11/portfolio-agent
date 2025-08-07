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
// Try multiple possible locations for the files
const possibleBaseDirs = [
  __dirname,                           // Current directory (local)  
  process.cwd(),                      // Process working directory
  path.dirname(__dirname),            // Parent directory if running from subdirectory
  '/opt/render/project/src',          // Render current location
  '/opt/render/project',              // Render project root
  path.join(process.cwd(), '..'),     // Parent of current working directory
];

let baseDir = __dirname; // Default
let publicDir = null;
let reportsDir = null;

// Find the correct base directory by checking where public folder exists
for (const dir of possibleBaseDirs) {
  const testPublicDir = path.join(dir, 'public');
  const testIndexFile = path.join(testPublicDir, 'index.html');
  
  console.log(`Checking for public directory at: ${testPublicDir}`);
  console.log(`Checking for index.html at: ${testIndexFile}`);
  
  if (fs.existsSync(testIndexFile)) {
    baseDir = dir;
    publicDir = testPublicDir;
    reportsDir = path.join(dir, 'reports');
    console.log(`✅ Found files! Using base directory: ${baseDir}`);
    break;
  }
}

// If we still haven't found the files, use defaults and log the issue
if (!publicDir) {
  publicDir = path.join(__dirname, 'public');
  reportsDir = path.join(__dirname, 'reports');
  console.log(`❌ Could not find public directory in any expected location`);
}

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

// Routes - Embedded HTML fallback for Render deployment issues
app.get('/', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  
  // Check if file exists before trying to send it
  if (fs.existsSync(indexPath)) {
    console.log('✅ Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  } else {
    console.log('⚠️ Public directory not found, serving embedded HTML');
    
    // Serve embedded HTML as fallback
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Analyzer - AI-Powered Design Evaluation</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #faf5ff 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .glass-effect { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .btn-primary { background: linear-gradient(to right, #0284c7, #c026d3); color: white; font-weight: 700; padding: 1rem 2rem; border-radius: 0.75rem; border: none; cursor: pointer; width: 100%; transition: all 0.3s; }
        .btn-primary:hover { background: linear-gradient(to right, #0369a1, #a21caf); transform: scale(1.02); }
        .form-input { width: 100%; padding: 1rem; padding-left: 2.5rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.5); }
        .form-input:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1); }
        .nav-tab { padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.3s; }
        .nav-tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .alert { position: fixed; top: 1rem; right: 1rem; padding: 1rem; border-radius: 0.5rem; color: white; z-index: 1000; max-width: 300px; }
        .alert-success { background: #10b981; }
        .alert-error { background: #ef4444; }
        .hidden { display: none; }
        .grid { display: grid; gap: 1rem; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 768px) { .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); } }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="gradient-bg" style="padding: 4rem 0;">
        <div class="container" style="text-align: center;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 5rem; height: 5rem; margin-bottom: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 1rem;">
                <i class="fas fa-chart-line" style="font-size: 2rem;"></i>
            </div>
            <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: 1rem;">Portfolio Analyzer</h1>
            <p style="font-size: 1.25rem; color: rgba(255,255,255,0.9); max-width: 42rem; margin: 0 auto;">
                AI-powered design evaluation with Claude AI integration for comprehensive portfolio analysis
            </p>
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 1.5rem; gap: 1rem;">
                <span style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; background: rgba(34, 197, 94, 0.2); color: rgba(220, 252, 231, 1);">
                    <div style="width: 0.5rem; height: 0.5rem; background: #4ade80; border-radius: 50%; margin-right: 0.5rem; animation: pulse 2s infinite;"></div>
                    AI Analysis Active
                </span>
                <span style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; background: rgba(59, 130, 246, 0.2); color: rgba(191, 219, 254, 1);">
                    <i class="fas fa-robot" style="margin-right: 0.5rem;"></i>
                    Claude Integration
                </span>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container" style="padding: 3rem 1rem;">
        <!-- Navigation Tabs -->
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; flex-wrap: wrap; justify-content: center; background: rgba(255,255,255,0.6); backdrop-filter: blur(16px); border-radius: 1rem; padding: 0.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                <button onclick="showTab('analyze', this)" class="nav-tab active" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-play-circle"></i>
                    <span>Analyze Portfolio</span>
                </button>
                <button onclick="showTab('reports', this)" class="nav-tab" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-file-chart-pie"></i>
                    <span>View Reports</span>
                </button>
                <button onclick="showTab('status', this)" class="nav-tab" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-heartbeat"></i>
                    <span>System Status</span>
                </button>
            </div>
        </div>

        <!-- Analyze Tab -->
        <div id="analyze-tab" class="tab-content active">
            <div style="max-width: 56rem; margin: 0 auto;">
                <div style="background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2rem;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h2 style="font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">Start New Analysis</h2>
                        <p style="color: #4b5563;">Enter a portfolio URL to begin comprehensive AI-powered evaluation</p>
                    </div>
                    
                    <form id="analysis-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <!-- URL Input -->
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151;">Portfolio URL</label>
                            <div style="position: relative;">
                                <div style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                    <i class="fas fa-globe" style="color: #9ca3af;"></i>
                                </div>
                                <input type="url" id="portfolio-url" placeholder="https://www.example.com" required class="form-input">
                            </div>
                        </div>

                        <!-- Analysis Options -->
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: #1f2937;">Analysis Options</h3>
                            <div class="grid md:grid-cols-2">
                                <label style="display: flex; align-items: center; padding: 1rem; background: linear-gradient(to right, #fefce8, #fef3c7); border: 2px solid #fde68a; border-radius: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="ai" checked style="margin-right: 0.75rem;">
                                    <div>
                                        <div style="font-weight: 600; color: #1f2937;">🤖 AI Analysis</div>
                                        <div style="font-size: 0.875rem; color: #4b5563;">Claude AI-powered insights</div>
                                    </div>
                                </label>
                                <label style="display: flex; align-items: center; padding: 1rem; background: linear-gradient(to right, #faf5ff, #f3e8ff); border: 2px solid #e9d5ff; border-radius: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="case-studies" checked style="margin-right: 0.75rem;">
                                    <div>
                                        <div style="font-weight: 600; color: #1f2937;">📖 Case Study Analysis</div>
                                        <div style="font-size: 0.875rem; color: #4b5563;">Individual project evaluation</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div style="padding-top: 1.5rem;">
                            <button type="submit" class="btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                                <i class="fas fa-rocket"></i>
                                <span>Start Analysis</span>
                                <div>✨</div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Reports Tab -->
        <div id="reports-tab" class="tab-content">
            <div style="max-width: 72rem; margin: 0 auto; text-align: center;">
                <h2 style="font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">Generated Reports</h2>
                <p style="color: #4b5563; margin-bottom: 2rem;">Browse and access your portfolio analysis reports</p>
                <div id="reports-list" class="grid md:grid-cols-2" style="gap: 1.5rem;"></div>
            </div>
        </div>

        <!-- Status Tab -->
        <div id="status-tab" class="tab-content">
            <div style="max-width: 56rem; margin: 0 auto; text-align: center;">
                <h2 style="font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">Analysis Status</h2>
                <p style="color: #4b5563; margin-bottom: 2rem;">Monitor your portfolio analysis in real-time</p>
                <div id="analysis-status" style="display: none;"></div>
                <div id="system-status" style="background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2rem;"></div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer style="margin-top: 4rem; padding: 2rem 0; border-top: 1px solid #e5e7eb;">
        <div class="container" style="text-align: center; color: #4b5563;">
            <p>&copy; 2025 Portfolio Analyzer. Powered by Claude AI and Playwright automation.</p>
        </div>
    </footer>

    <!-- Alert Container -->
    <div id="alerts-container" style="position: fixed; top: 1rem; right: 1rem; z-index: 50;"></div>

    <script>
        let currentAnalysisId = null;
        let eventSource = null;

        // Tab Management
        function showTab(tabName, targetElement) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(tabName + '-tab').classList.add('active');
            if (targetElement) targetElement.classList.add('active');
            
            if (tabName === 'reports') loadReports();
            if (tabName === 'status') loadSystemStatus();
        }

        // Alert functions
        function showAlert(message, type = 'success') {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-' + type;
            alertDiv.textContent = message;
            document.getElementById('alerts-container').appendChild(alertDiv);
            setTimeout(() => alertDiv.remove(), 5000);
        }

        // Form submission
        document.getElementById('analysis-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const url = document.getElementById('portfolio-url').value;
            const options = {
                ai: document.getElementById('ai').checked,
                caseStudies: document.getElementById('case-studies').checked
            };
            
            try {
                const submitButton = e.target.querySelector('button[type="submit"]');
                const originalContent = submitButton.innerHTML;
                submitButton.setAttribute('data-original-content', originalContent);
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Analysis...';
                submitButton.disabled = true;
                
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, options })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    currentAnalysisId = result.analysisId;
                    startAnalysisMonitoring(result.analysisId);
                    showTab('status', document.querySelector('button[onclick*="status"]'));
                    showAlert('Analysis started successfully!', 'success');
                } else {
                    showAlert('Error: ' + result.error, 'error');
                }
                
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
                
            } catch (error) {
                showAlert('Network error: ' + error.message, 'error');
                const submitButton = e.target.querySelector('button[type="submit"]');
                const originalContent = submitButton.getAttribute('data-original-content') || submitButton.innerHTML;
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
            }
        });

        // Analysis monitoring
        function startAnalysisMonitoring(analysisId) {
            const statusDiv = document.getElementById('analysis-status');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<p style="text-align: center; padding: 2rem;">🔄 Analysis in progress...</p>';
            
            if (eventSource) eventSource.close();
            
            eventSource = new EventSource('/api/analysis/' + analysisId + '/logs');
            
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                
                if (data.type === 'status') {
                    if (data.status === 'completed') {
                        statusDiv.innerHTML += '<p style="color: green; font-weight: bold;">✅ Analysis completed!</p>';
                        if (data.results && data.results.reportUrl) {
                            statusDiv.innerHTML += '<p><a href="' + data.results.reportUrl + '" target="_blank" style="color: #0284c7;">📄 View Report</a></p>';
                        }
                        eventSource.close();
                        loadReports();
                    } else if (data.status === 'failed') {
                        statusDiv.innerHTML += '<p style="color: red; font-weight: bold;">❌ Analysis failed</p>';
                        eventSource.close();
                    }
                } else {
                    const logColor = data.type === 'error' ? 'red' : data.type === 'success' ? 'green' : '#666';
                    statusDiv.innerHTML += '<p style="color: ' + logColor + '; font-family: monospace; font-size: 0.875rem;">' + data.message + '</p>';
                    statusDiv.scrollTop = statusDiv.scrollHeight;
                }
            };
        }

        // Load reports
        async function loadReports() {
            try {
                const response = await fetch('/api/reports');
                const reports = await response.json();
                
                const reportsList = document.getElementById('reports-list');
                reportsList.innerHTML = '';
                
                if (reports.length === 0) {
                    reportsList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #6b7280;">No reports generated yet</p>';
                    return;
                }
                
                reports.forEach(report => {
                    const reportCard = document.createElement('div');
                    reportCard.style.cssText = 'background: rgba(255,255,255,0.8); padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
                    reportCard.innerHTML = 
                        '<h3 style="font-weight: 600; margin-bottom: 0.5rem;">' + report.type + '</h3>' +
                        '<p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem;">' + new Date(report.created).toLocaleDateString() + '</p>' +
                        '<a href="' + report.path + '" target="_blank" style="color: #0284c7; text-decoration: none;">📄 View Report</a>';
                    reportsList.appendChild(reportCard);
                });
            } catch (error) {
                console.error('Failed to load reports:', error);
            }
        }

        // Load system status
        async function loadSystemStatus() {
            try {
                const response = await fetch('/api/health');
                const status = await response.json();
                
                const systemStatusDiv = document.getElementById('system-status');
                systemStatusDiv.innerHTML = 
                    '<h3 style="font-weight: 600; margin-bottom: 1rem;">System Status</h3>' +
                    '<p><strong>Status:</strong> ' + status.status + '</p>' +
                    '<p><strong>Active Analyses:</strong> ' + status.activeAnalyses + '</p>' +
                    '<p><strong>Timestamp:</strong> ' + new Date(status.timestamp).toLocaleString() + '</p>';
            } catch (error) {
                document.getElementById('system-status').innerHTML = '<p style="color: red;">❌ Failed to load system status</p>';
            }
        }

        // Initialize
        loadReports();
        loadSystemStatus();
    </script>
</body>
</html>`);
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