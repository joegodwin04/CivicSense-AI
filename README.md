# CivicSense AI

### 🌐 Live Deployment Links
- **Frontend Client**: [https://civicsense-ai.vercel.app](https://civicsense-ai.vercel.app)
- **Backend API Server**: [https://civicsense-api.onrender.com](https://civicsense-api.onrender.com)

---

### Decision Support System for Members of Parliament (MPs)

CivicSense AI is a next-generation civic intelligence dashboard and citizen engagement portal. It enables citizens to report constituency development issues (roads, water, healthcare, sanitation, education) using **text, voice, and image uploads**. Behind the scenes, the system connects directly to **Google Gemini AI** to automatically translate submissions, classify categories, analyze urgency, and cross-reference demographic and proximity data with critical local infrastructure (schools, hospitals, water supplies) to compute a live **Priority Score (1-100)** for decision makers.

---

## 🛠️ System Architecture

```mermaid
graph TD
    subgraph Client Application (Vite + React)
        CP[Citizen Voice Portal] -->|FormData with Text, Images, Voice| APIClient[Axios API Client]
        MPD[MP Intelligence Dashboard] -->|Auth JWT token| APIClient
        Map[Google Maps Component] <--|Dynamic Marker Overlay| APIClient
    end

    subgraph Backend Server (Express + Node.js)
        APIClient -->|Requests| App[Express app.js]
        App -->|Multer File Parsing| Router[citizenRoutes / authRoutes / dashboardRoutes]
        Router -->|Duplicate Detection: 150m radius & 14 days| GeoNear[MongoDB 2dsphere GeoNear]
        Router -->|Proximity Context| Haversine[Haversine Infra Filter]
        Router -->|Multimodal Input| Gemini[Google Gemini API]
    end

    subgraph Database & Cloud
        GeoNear --> DB[(MongoDB Atlas)]
        Gemini --> GeminiSDK[gemini-2.5-pro / gemini-2.5-flash]
    end
```

### Core Logic Features:
1. **Multimodal Analysis**: Accepts visual photo inputs (Gemini multimodal vision analysis) and voice inputs (Gemini speech transcription and translation) in local languages.
2. **Geospatial Deduplication / Clustering**: When a report is submitted, MongoDB runs a `$near` geospatial lookup (150m radius) within the last 14 days. If matched, the report increments the existing report's `duplicateCount` and recomputes the Priority Score using Gemini, preventing duplicate record spam.
3. **Demographic / Infrastructure Overlay**: Finds local critical infrastructure (schools, hospitals, etc.) within 1km using Haversine calculation, incorporating proximity risk factors into Gemini's prioritization.
4. **Messaging App Channel (WhatsApp Integration)**: Twilio-compatible Webhook stub at `/api/citizen/whatsapp` accepting incoming text/image payloads, running the exact same geocoding, duplicate checking, and Gemini classification pipelines.

---

## 🔑 Required API Keys & Env Variables

Create `.env` files in both directories following the templates:

### Backend Configuration (`server/.env`)
```env
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
MONGO_URI=your_mongodb_connection_uri
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_jwt_signing_secret
CLIENT_URL=http://localhost:5173
```

### Client Configuration (`client/.env`)
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_javascript_api_key
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
# Install root, client and server packages
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Seed Demo Accounts & Data
We supply scripts to populate the database for instant testing/evaluation:
```bash
# Seed the MP account (mp@civicsense.ai / password123)
npm run seed:mp --prefix server

# Seed 12 pre-categorized Bangalore requests with geolocation & duplicates
npm run seed:data --prefix server
```

### 3. Run Unit Tests (Native Node Runner)
Verify the Haversine distance functions and MongoDB Request schema validation limits:
```bash
npm test --prefix server
```

### 4. Run Locally
```bash
# Boots both frontend and backend concurrently
npm run dev
```
- **Citizen Portal**: `http://localhost:5173/citizen`
- **MP Dashboard (Gated)**: `http://localhost:5173/dashboard` (Log in with `mp@civicsense.ai` / `password123`)

---

## 📲 WhatsApp Webhook API Blueprints

For the "messaging app" input channel integration:
* **Endpoint**: `POST /api/citizen/whatsapp`
* **Content-Type**: `application/x-www-form-urlencoded`
* **Payload Parameters** (Standard Twilio webhook signature):
  - `From`: Sender identifier (e.g. `whatsapp:+919876543210`)
  - `Body`: Complaint description text
  - `NumMedia`: Optional attachment count (`1`)
  - `MediaUrl0`: Optional attachment file url (image, document, etc.)
  - `MediaContentType0`: Attachment MIME type (`image/jpeg`)
* **Response**: Returns standard TwiML XML confirmation replies immediately back to the WhatsApp screen.

---

## 📦 Deployment Configuration

- **Frontend**: Configured for **Vercel** deployment with SPA router redirection set up in `client/vercel.json`.
- **Backend**: Configured for **Render** deployment with build and variable blueprints set up in `render.yaml`.
- **CI / CD Pipeline**: Managed automatically via `.github/workflows/ci.yml` running lint, testing, and compilation tasks on every commit.

---

## 🖼️ User Interface Previews

### 1. Citizen Portal
*(Enables high-trust text, photo, and voice complaint filings in any regional language)*
![Citizen Submission Flow](https://raw.githubusercontent.com/joegodwin04/CivicSense-AI/main/client/public/previews/citizen_portal.png)

### 2. MP Decision Dashboard
*(Dense analytical grid prioritizing tasks using Gemini AI recommendation logs)*
![MP Dashboard](https://raw.githubusercontent.com/joegodwin04/CivicSense-AI/main/client/public/previews/dashboard.png)
