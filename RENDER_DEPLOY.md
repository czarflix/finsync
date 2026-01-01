# Render Deployment Guide for FinSync Pro

## Prerequisites
- GitHub account with this repository pushed
- Render account (free tier works)
- API Keys ready:
  - `OPENAI_API_KEY` (from OpenAI)
  - `TAVILY_API_KEY` (from Tavily)
  - `HF_TOKEN` (from HuggingFace)

---

## Quick Deploy (Blueprint)

1. Push this repo to GitHub
2. Go to https://render.com
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and configure everything
6. Add environment variables in the dashboard:
   - `OPENAI_API_KEY`
   - `TAVILY_API_KEY`
   - `HF_TOKEN`
7. Deploy!

---

## Manual Deploy (Step by Step)

### Step 1: Deploy Backend

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   ```
   Name: finsync-backend
   Root Directory: backend
   Runtime: Python
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Add Environment Variables:
   ```
   PYTHON_VERSION = 3.11.0
   OPENAI_API_KEY = sk-...
   TAVILY_API_KEY = tvly-...
   HF_TOKEN = hf_...
   ```
5. Click **Create Web Service**

### Step 2: Deploy Frontend

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect your GitHub repo
3. Configure:
   ```
   Name: finsync-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. Add Environment Variable:
   ```
   VITE_API_URL = https://finsync-backend.onrender.com
   ```
5. Click **Create Static Site**

---

## Important Settings

### Python Version
The `.python-version` file specifies 3.11.0. This is critical because:
- `faiss-cpu` doesn't have wheels for Python 3.13+
- 3.11 is stable and well-supported

### Environment Variables (Backend)
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT | ✅ Yes |
| `TAVILY_API_KEY` | Tavily API key for web search | ✅ Yes |
| `HF_TOKEN` | HuggingFace token for embeddings | ✅ Yes |
| `PYTHON_VERSION` | Python version | ✅ Yes (3.11.0) |

### Frontend API URL
Update `frontend/src/config.js` before deploying, OR set `VITE_API_URL`:

```javascript
// For production, this should be your Render backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

---

## Troubleshooting

### Error: No matching distribution for faiss-cpu
**Fix:** Set `PYTHON_VERSION=3.11.0` in Render environment variables.

### Error: ValidationError: api_key - Input should be a valid string
**Fix:** Make sure `HF_TOKEN` is set in Render's environment variables (not just locally).

### Error: 404 Repository Not Found for all-MiniLM-L6-v2
**Fix:** Already fixed! We use `sentence-transformers/all-MiniLM-L6-v2`.

### Frontend can't connect to backend
**Fix:** 
1. Check backend deployed and running (visit `/health` endpoint)
2. Set `VITE_API_URL` to your backend URL
3. CORS is already set to allow all origins

---

## Memory Usage (Free Tier Compatible)

| Component | RAM Usage |
|-----------|-----------|
| FastAPI Server | ~50MB |
| FAISS Vector Store | ~20-100MB (depends on docs) |
| LangChain | ~30MB |
| **Total** | ~100-200MB (well under 512MB limit) |

We use HuggingFace Inference API for embeddings (no local model), which keeps RAM low.

---

## URLs After Deployment

- **Backend:** `https://finsync-backend.onrender.com`
- **Frontend:** `https://finsync-frontend.onrender.com`
- **Health Check:** `https://finsync-backend.onrender.com/health`

---

## Post-Deployment Testing

1. Visit backend health check: `https://your-backend.onrender.com/health`
2. Open frontend: `https://your-frontend.onrender.com`
3. Upload a test PDF
4. Ask: "What's in my document?"
5. Ask: "What's the Nifty 50 today?" (tests web search)

If all works, you're deployed! 🚀
