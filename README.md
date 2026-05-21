# PureScan

AI-powered food product analyzer for barcode-based nutrition, additive risk, allergen, and personalized health-fit scoring.

## Architecture

```text
Next.js frontend
    |
    v
Express backend
    |-- Open Food Facts API
    |-- MongoDB products + scan history
    v
FastAPI AI service
```

## Project Structure

```text
project-root/
  frontend/      Next.js 14 app
  backend/       Express API and MongoDB models
  ai-service/    FastAPI nutrition and ingredient risk engine
  database/      Optional local MongoDB helpers
```

## Local Setup

### AI Service

```bash
cd ai-service
py -3.9 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Runs on `http://localhost:8000`.

### Backend

Create `backend/.env` from `backend/.env.example`.

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000`.

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

## Main APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/products/barcode/:barcode/analyze` | Fetch product, run AI scoring, save scan |
| `GET` | `/api/products/search?q=...` | Search Open Food Facts products |
| `GET` | `/api/products/scans/recent` | Recent scan history |
| `POST` | AI `/analyze-product` | Nutrition and ingredient risk scoring |

## Deployment

### Render: AI Service

Root directory: `ai-service`

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
python main.py
```

Environment:

```env
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info
```

### Render: Backend

Root directory: `backend`

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
AI_SERVICE_URL=https://your-purescan-ai-service.onrender.com
NODE_ENV=production
FRONTEND_URL=https://your-purescan-frontend.vercel.app
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Vercel: Frontend

Root directory: `frontend`

Environment:

```env
NEXT_PUBLIC_API_URL=https://your-purescan-backend.onrender.com
```
https://flowscan-complete.vercel.app/
Build command:

```bash
npm run build
```

## Hackathon Demo Barcodes

Try these in the input box:

```text
3017620422003
737628064502
8901764012906
```

## Notes

PureScan uses Open Food Facts community data, so results are decision-support signals, not medical advice. The AI service currently uses an explainable rule-based model that can later be upgraded to a Scikit-learn classifier trained on labeled ingredient risk data.
#
