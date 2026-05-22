# VedaAI — AI Assessment Creator

AI-powered question paper generator for educators. Teachers can create assessments from uploaded material, auto-generate questions via NVIDIA NIM / OpenAI, share with students, and auto-grade submissions.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Socket.io Client
- **Backend**: Express, TypeScript, Mongoose, BullMQ, Socket.io, Winston
- **Infrastructure**: MongoDB 7, Redis 7, Docker Compose
- **AI**: NVIDIA NIM (`meta/llama-3.3-70b-instruct`) with fallback to sample questions
- **PDF**: Puppeteer

## Features

- **Authentication** — JWT-based login/register with teacher and student roles
- **Assignment Creation** — Form with file upload (PDF/TXT/DOC/DOCX), question type configuration (MCQ, Short/Long Answer, True/False)
- **AI Generation** — Real-time progress via WebSocket + polling fallback; generates questions, answer keys, difficulty labels, and marking schemes
- **Responsive Design** — Mobile/tablet breakpoints, 328px sidebar with spec-compliant Figma design

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker Desktop (for MongoDB + Redis)

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_assessment
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3000

LLM_PROVIDER=nvidia-nim
NVIDIA_NIM_API_KEY=nvapi-...
NVIDIA_NIM_MODEL=meta/llama-3.3-70b-instruct
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 3. Start Backend
```bash
cd backend
npm install
npx tsc
npm run dev
```

### 4. Start Frontend
```bash
cd frontend
npm install
npx next build
npm run dev
```

### 5. Open App
Visit **http://localhost:3000** — register as a teacher, then create your first assignment.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ai_assessment` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `LLM_PROVIDER` | LLM backend (`nvidia-nim` or `openai`) | `nvidia-nim` |
| `NVIDIA_NIM_API_KEY` | NVIDIA NIM API key | — |
| `NVIDIA_NIM_MODEL` | NVIDIA model name | `meta/llama-3.3-70b-instruct` |
| `NVIDIA_NIM_BASE_URL` | NVIDIA API base URL | `https://integrate.api.nvidia.com/v1` |
| `OPENAI_API_KEY` | OpenAI API key (if using `openai` provider) | — |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `http://localhost:5000` |

## API Endpoints

### Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| GET | `/api/auth/teachers` | JWT | List all teachers |

### Assignments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/assignments` | JWT | Create assignment + enqueue generation |
| GET | `/api/assignments` | JWT | List assignments (paginated) |
| GET | `/api/assignments/:id` | JWT | Get single assignment |
| DELETE | `/api/assignments/:id` | JWT | Delete assignment |

### Assessments
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/assessments/:id` | Optional | Get generated assessment |
| POST | `/api/assessments/:id/regenerate` | JWT | Regenerate questions |
| GET | `/api/assessments/:id/pdf` | No | Download PDF |

### Templates
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/templates` | JWT | Save assignment as template |
| GET | `/api/templates` | JWT | List templates |
| DELETE | `/api/templates/:id` | JWT | Delete template |

### Question Bank
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/question-bank` | JWT | Save question |
| GET | `/api/question-bank` | JWT | List questions |
| DELETE | `/api/question-bank/:id` | JWT | Delete question |
| POST | `/api/question-bank/bulk` | JWT | Bulk save questions |

### Sharing
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/share` | JWT | Create share link |
| GET | `/api/share/:code` | No | Resolve share link |

### Bulk Operations
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/bulk/students` | JWT | Import students via CSV |
| POST | `/api/bulk/assignments` | JWT | Bulk create assignments |
| GET | `/api/students` | JWT | List students |

### Submissions
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/submissions` | JWT | Submit answers |
| GET | `/api/submissions/mine` | JWT | Get my submissions |
| GET | `/api/submissions/:id` | JWT | Get submissions for assessment |
