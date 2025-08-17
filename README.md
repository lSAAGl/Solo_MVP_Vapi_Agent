# Solo MVP Vapi Agent

A sophisticated AI-powered sales automation platform that seamlessly integrates voice conversations with CRM functionality through Google Sheets integration and real-time webhook processing.

## 🚀 Overview

This project combines the power of AI voice assistants with automated lead management to create a complete sales workflow solution. Built with TypeScript and Express.js, it provides real-time call transcription, automated lead scoring, and integrated meeting booking capabilities.

## ✨ Key Features

### 🎯 **AI Voice Integration**
- **VAPI Assistant Integration**: Seamless voice AI interactions with customizable responses
- **Real-time Transcription**: Live call transcription with delta updates
- **Session Management**: Comprehensive call session tracking and management

### 📊 **Automated Lead Management**
- **Google Sheets CRM**: Automatic lead logging to Google Sheets with structured data
- **Lead Scoring**: Intelligent lead qualification and scoring system
- **Contact Tracking**: Phone and email capture with follow-up automation

### 🔧 **Meeting Automation**
- **Cal.com Integration**: Automated meeting booking link generation
- **Time Preference Handling**: Smart scheduling based on caller preferences
- **Booking Workflow**: Streamlined appointment setting process

### 📱 **Real-time Dashboard**
- **Live Call Monitoring**: Real-time call status and transcript viewing
- **WebSocket Integration**: Instant updates for call events and transcriptions
- **Health Monitoring**: System status and performance tracking

## 🏗️ Technical Architecture

### Backend Infrastructure
- **Express.js Server**: Robust API server with CORS support
- **TypeScript**: Full type safety and modern JavaScript features
- **WebSocket Server**: Real-time bidirectional communication
- **Google APIs**: Secure Google Sheets integration with JWT authentication

### API Endpoints
- `GET /` - Dashboard redirect
- `GET /health` - System health check
- `GET /dashboard` - Main dashboard interface
- `POST /webhooks/vapi` - VAPI webhook handler
- `POST /tools/book_meeting` - Meeting booking tool
- `POST /ingest/*` - Data ingestion endpoints

### Data Flow
1. **Voice Call Initiated** → VAPI processes conversation
2. **Webhooks Triggered** → Real-time event processing
3. **Lead Data Extracted** → Automated CRM logging
4. **Dashboard Updated** → Live monitoring interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Service Account with Sheets API access
- VAPI account and API keys
- Cal.com account (optional, for meeting booking)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lSAAGl/Solo_MVP_Vapi_Agent.git
   cd Solo_MVP_Vapi_Agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   
   # VAPI Configuration
   VAPI_PUBLIC_KEY=your_vapi_public_key
   VAPI_ASSISTANT_ID=your_assistant_id
   
   # Google Sheets Integration
   GOOGLE_SHEETS_ID=your_google_sheets_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
   ```

4. **Google Service Account Setup**
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create a Service Account and download credentials
   - Share your Google Sheet with the service account email
   - Add service account credentials to `credentials/google-service-account.json`

5. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

6. **Access the dashboard**
   Navigate to `http://localhost:3000/dashboard`

## 📋 Google Sheets Setup

Your Google Sheet should have a "Leads" tab with the following columns:
- **A**: Timestamp
- **B**: Name
- **C**: Company
- **D**: Role
- **E**: Phone/Email
- **F**: Need/Interest
- **G**: Objections
- **H**: Score (0-100)
- **I**: Next Step

## 🔧 Configuration

### VAPI Assistant Configuration
Configure your VAPI assistant to use the webhook endpoint:
```
https://your-domain.com/webhooks/vapi
```

### Tool Integration
The system includes a `book_meeting` tool that can be configured in your VAPI assistant to provide meeting booking capabilities.

## 📊 API Reference

### Webhook Events
- `call.started` - Call initiation tracking
- `transcript.delta` - Real-time transcription updates
- `call.ended` - Automatic lead logging and session cleanup

### WebSocket Events
- `call` - Call status updates
- `transcript` - Live transcription data
- `tool` - Tool execution results

## 🔒 Security Features

- **Environment Variable Protection**: Sensitive credentials stored securely
- **CORS Configuration**: Cross-origin request protection
- **Request Size Limiting**: 1MB JSON payload limit
- **Error Handling**: Comprehensive error catching and logging

## 🛠️ Development

### Project Structure
```
src/
├── dashboard/          # Frontend dashboard files
├── google/            # Google Sheets integration
├── routes/            # Express route handlers
│   ├── webhooks.ts    # Webhook processing
│   ├── tools.ts       # Tool implementations
│   └── ingest.ts      # Data ingestion
├── server.ts          # Main server configuration
├── tools.ts           # Tool definitions and utilities
└── ws.ts              # WebSocket server setup

tools/                 # Tool configuration files
credentials/           # Service account credentials
dist/                  # Compiled TypeScript output
```

### Available Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - TypeScript compilation
- `npm start` - Production server
- `npm test` - Run test suite (when implemented)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- [VAPI Documentation](https://docs.vapi.ai/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Cal.com API](https://cal.com/docs)

## 💡 Use Cases

- **Sales Teams**: Automate lead capture and qualification
- **Customer Support**: Track and analyze customer interactions
- **Appointment Booking**: Streamline scheduling workflows
- **Market Research**: Gather and organize conversation insights

---

**Built with ❤️ using TypeScript, Express.js, and AI-powered voice technology.**