# AI Assessment Creator

AI-powered question paper generator for educators. Built with Next.js, Express, MongoDB, Redis, and BullMQ.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for MongoDB + Redis)

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Set up API Key
Edit `backend/.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-...
```
*Without an API key, the app falls back to sample questions.*

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open App
Visit **http://localhost:3000**

## Architecture

```
Frontend (Next.js 14 + Zustand + Socket.io)
    ↕ HTTP / WebSocket
Backend (Express + BullMQ + Socket.io)
    ↕
Workers (LLM Generation, PDF Export)
    ↕
MongoDB (Data) + Redis (Cache/Queue)
```

## Project Structure

```
AIAssessmentCreator/
├── frontend/          # Next.js 14 App Router
│   ├── src/
│   │   ├── app/       # Pages (dashboard, create, generating, assessment)
│   │   ├── components/ # UI components (shadcn-style)
│   │   ├── store/     # Zustand state management
│   │   ├── lib/       # API client, WebSocket hook, utils
│   │   └── types/     # TypeScript types
│   └── ...
├── backend/           # Express + TypeScript
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── controllers/ # Request handlers
│   │   ├── models/    # Mongoose schemas
│   │   ├── workers/   # BullMQ workers (generation, PDF)
│   │   ├── services/  # LLM, PDF generation
│   │   ├── queues/    # BullMQ queue definitions
│   │   └── websocket/ # Socket.io setup
│   └── ...
└── docker-compose.yml # MongoDB + Redis
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/assignments | Create assignment + enqueue generation |
| GET | /api/assignments | List all assignments |
| GET | /api/assignments/:id | Get assignment |
| DELETE | /api/assignments/:id | Delete assignment |
| GET | /api/assessments/:id | Get generated assessment |
| POST | /api/assessments/:id/regenerate | Regenerate questions |
| GET | /api/assessments/:id/pdf | Download PDF |

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Zustand, Socket.io
- **Backend**: Express, TypeScript, Mongoose, BullMQ, Socket.io
- **Infrastructure**: MongoDB 7, Redis 7, Docker Compose
- **AI**: OpenAI GPT-4o (with fallback)
- **PDF**: Puppeteer
