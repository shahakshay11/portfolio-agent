# Portfolio Analyzer Web Server Setup

## 🚀 Quick Start

### 1. Start the Web Server
```bash
npm run server
```

The server will start on `http://localhost:3000`

### 2. Expose via Ngrok (Optional)
To make it accessible from anywhere:

```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# Expose the local server
ngrok http 3000
```

Copy the generated ngrok URL (e.g., `https://abc123.ngrok.io`) to access from any device.

## 🌐 Web Interface Features

### **Dashboard Overview**
- **Analyze Portfolio**: Submit new portfolio URLs for analysis
- **View Reports**: Browse previously generated reports
- **Analysis Status**: Monitor system health and active analyses

### **Analysis Options**
- ✅ **Mobile Analysis** - Test responsive design
- ✅ **Accessibility Audit** - WCAG compliance checking
- ✅ **Performance Testing** - Page speed and optimization
- ✅ **AI Analysis** - Claude AI-powered insights (Enabled by default)
- ✅ **Case Study Analysis** - Individual project evaluation (Enabled by default)

### **Real-time Features**
- **Live Progress Monitoring** - See analysis progress in real-time
- **Console Logs** - View detailed analysis logs
- **Instant Results** - Access reports immediately upon completion
- **Report Management** - Browse and access all generated reports

## 📊 API Endpoints

### Start Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://www.example.com",
  "options": {
    "mobile": true,
    "accessibility": true,
    "performance": true,
    "ai": true,
    "caseStudies": true
  }
}
```

### Get Analysis Status
```http
GET /api/analysis/:id
```

### Stream Analysis Logs
```http
GET /api/analysis/:id/logs
```

### List Reports
```http
GET /api/reports
```

### Health Check
```http
GET /api/health
```

## 🎯 Usage Examples

### **Example 1: Basic Portfolio Analysis**
1. Open `http://localhost:3000`
2. Enter portfolio URL: `https://www.vyomikaparikh.com`
3. Enable "AI Analysis" and "Case Study Analysis"
4. Click "Start Analysis"
5. Monitor progress in real-time
6. Access generated reports

### **Example 2: Comprehensive Analysis**
1. Enter URL: `https://snehashetty.framer.website/`
2. Enable all options:
   - Mobile Analysis
   - Accessibility Audit
   - Performance Testing
   - AI Analysis
   - Case Study Analysis
3. Click "Start Analysis"
4. View detailed progress logs
5. Download multiple report formats

### **Example 3: Remote Access via Ngrok**
1. Start server: `npm run server`
2. In new terminal: `ngrok http 3000`
3. Copy ngrok URL: `https://abc123.ngrok.io`
4. Share with team members
5. Access from any device/location

## 🔧 Server Configuration

### **Environment Variables**
```bash
PORT=3000                    # Server port (default: 3000)
ANTHROPIC_API_KEY=sk-ant-... # Claude AI API key
ENABLE_AI_ANALYSIS=true      # Enable AI analysis by default
```

### **File Structure**
```
portfolio_agent/
├── server.js              # Web server
├── public/                 # Web interface files
│   ├── index.html         # Main dashboard
│   └── app.js            # Frontend JavaScript
├── reports/               # Generated reports (served statically)
└── src/                  # Analysis engine
```

## 📈 Performance Notes

- **Concurrent Analyses**: Server supports multiple concurrent analyses
- **Memory Management**: Old analyses are cleaned up automatically (24h retention)
- **File Serving**: Reports are served statically for fast access
- **Real-time Updates**: Server-Sent Events for live progress monitoring

## 🛡️ Security Considerations

- **Local Network**: Server runs on localhost by default
- **Ngrok Tunneling**: Use ngrok for secure external access
- **API Keys**: Store Anthropic API key in `.env` file
- **CORS Enabled**: Allows cross-origin requests for development

## 🐛 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   Error: listen EADDRINUSE :::3000
   ```
   Solution: Use different port: `PORT=3001 npm run server`

2. **Dependencies Missing**
   ```bash
   npm install
   ```

3. **Analysis Stuck**
   - Check server logs
   - Restart server if needed
   - Clear browser cache

4. **Reports Not Loading**
   - Ensure reports directory exists
   - Check file permissions
   - Verify report paths in API response

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Server Console**:
   ```
   🚀 Portfolio Analyzer Server running on port 3000
   📊 Dashboard: http://localhost:3000
   🌐 To expose via ngrok: ngrok http 3000
   ```

2. **Web Interface**: Clean dashboard with three main tabs

3. **Analysis Progress**: Real-time logs and status updates

4. **Generated Reports**: Multiple report formats with AI insights

The web server provides a complete interface for running portfolio analyses with the same powerful features as the CLI, but with an intuitive web interface accessible from anywhere!