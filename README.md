# AI広告分析ダッシュボード

AI-Driven Ads Measurement & Analysis System — portfolio project.

## Stack

- **Backend**: NestJS + AWS Lambda (`@vendia/serverless-express`) + Gemini API
- **Frontend**: Next.js 15 (App Router) + Recharts + Tailwind CSS 4
- **Monorepo**: npm workspaces

## Setup

### 1. Install dependencies

```bash
npm install          # root (links workspaces)
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
# backend
cp backend/.env.example backend/.env
# Set your Gemini API key:
# GEMINI_API_KEY=your_key_here

# frontend
cp frontend/.env.local.example frontend/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001 (default)
```

### 3. Run locally

```bash
# Terminal 1 — backend (port 3001)
npm run dev:backend

# Terminal 2 — frontend (port 3000)
npm run dev:frontend
```

Open http://localhost:3000

## API Endpoints

| Method | Path                  | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | /ads/summary          | Aggregated metrics per medium   |
| GET    | /ads/daily            | Daily spend for chart           |
| POST   | /analysis/generate    | Generate AI analysis via Gemini |

## Deploy

The backend is designed for AWS Lambda + API Gateway via `@vendia/serverless-express`.
The Lambda handler is exported from `backend/src/lambda.ts`.
