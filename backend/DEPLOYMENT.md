# Backend Deployment Guide

This guide covers deploying the BillInsight FastAPI backend to production platforms.

## 📋 Prerequisites

- Python 3.11+
- Git
- GitHub account
- Deployment platform account (Render, Railway, or Fly.io)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Backend Files ✅ DONE

The following files are already created:
- `requirements.txt` - Python dependencies with pinned versions
- `Procfile` - Deployment configuration
- `runtime.txt` - Python version specification
- `.gitignore` - Files to exclude from git
- `main.py` - Updated with environment variables

### Step 2: Push Code to GitHub

```bash
# Navigate to project root
cd /home/swastik/Desktop/BillPrediction

# Initialize git (if not already done)
git init

# Create root .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env.local
.env.*.local
*.pyc
__pycache__/
bills.db
venv/
.next/
.DS_Store
EOF

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - BillInsight app with authentication"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/BillPrediction.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy on Render (Recommended for Free Tier)

**Why Render?**
- Best free tier for Python
- 750 hours/month included
- Free PostgreSQL option
- Auto-deploys from GitHub

#### Deploy Steps:

1. **Go to Render Dashboard**
   - https://dashboard.render.com
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Choose the branch: `main`

3. **Configure Service**
   ```
   Name:           billprediction-api
   Environment:    Python 3
   Region:         Choose closest to your users
   Branch:         main
   Build Command:  pip install -r requirements.txt
   Start Command:  uvicorn main:app --host 0.0.0.0 --port $PORT
   Plan:           Free
   ```

4. **Add Environment Variables**
   - Click "Environment"
   - Add these variables:
     ```
     CORS_ORIGINS=https://billprediction.vercel.app,http://localhost:3000
     RELOAD=False
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (~2-3 minutes)
   - Copy the service URL: `https://billprediction-api.onrender.com`

#### Important Notes:
- Free tier services spin down after 15 minutes of inactivity
- To keep alive, ping the `/health` endpoint periodically
- Database (`bills.db`) stores in service filesystem (wiped on redeploy)
- Persistent data requires Render PostgreSQL (paid)

### Step 4: Deploy on Railway (Alternative)

**Why Railway?**
- $5/month free credit
- Better idle time handling
- PostgreSQL available

#### Deploy Steps:

1. **Go to Railway Dashboard**
   - https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Deploy from GitHub repo

3. **Configure**
   - Select your repository
   - Choose `backend` directory
   - Add environment variables

### Step 5: Deploy on Fly.io (Alternative)

**Why Fly.io?**
- Global deployment
- Better performance
- Free tier available

#### Deploy Steps:

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
cd backend
flyctl launch

# Configure when prompted
# Then deploy:
flyctl deploy
```

## 🔧 Environment Variables

Set these on your deployment platform:

| Variable | Value | Description |
|----------|-------|-------------|
| `CORS_ORIGINS` | `https://billprediction.vercel.app` | Frontend URL |
| `RELOAD` | `False` | Disable reload in production |
| `PORT` | (auto-set) | Server port |
| `HOST` | `0.0.0.0` | Server host |

## 🧪 Testing Deployment

### Health Check
```bash
curl https://billprediction-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Test API Endpoints
```bash
# Register user
curl -X POST https://billprediction-api.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Make prediction
curl -X POST https://billprediction-api.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{"units": 150.5, "user_id": null}'
```

## 📝 Local Testing Before Deployment

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run locally
python main.py

# Test in another terminal
curl http://127.0.0.1:5000/health
```

## 🔐 Production Security Checklist

- [ ] Set `RELOAD=False` in production
- [ ] Update `CORS_ORIGINS` with actual frontend URL
- [ ] Don't commit `.env` files
- [ ] Use strong database credentials
- [ ] Enable HTTPS (handled by Render)
- [ ] Monitor error logs regularly
- [ ] Set up alerts for crashes

## 📊 Database

### Local Development
- Database: `bills.db` (SQLite)
- Auto-creates on first run
- Stored in `/backend/bills.db`

### Production (Render)
- Database: `bills.db` stored in `/var/data/`
- Persists within service lifecycle
- Reset on service redeploy
- For persistence, upgrade to PostgreSQL

## 🐛 Troubleshooting

### Build Fails: "No such file or directory"
```
✓ Ensure Procfile exists in backend directory
✓ Check requirements.txt path
✓ Verify main.py exists
```

### API Returns 500 Error
```
✓ Check logs: `flyctl logs` or Render dashboard
✓ Verify CORS_ORIGINS is set
✓ Ensure database initialized
```

### Service Won't Start (Render Free Tier)
```
✓ May need to ping /health endpoint regularly
✓ Consider upgrading plan
✓ Or use Railway/Fly alternative
```

### CORS Errors from Frontend
```
✓ Update CORS_ORIGINS environment variable
✓ Include complete URL: https://example.com
✓ Separate multiple origins with comma
✓ Restart service after changing env vars
```

## 📈 Monitoring

### Render Console
- Service URL shows in dashboard
- Logs visible in real-time
- Restart button available

### Health Monitoring
- Health endpoint: `GET /health`
- Monitor with uptime service:
  ```
  https://uptimerobot.com
  https://freshping.com
  ```

## 🚀 Continuous Deployment

After deployment, any push to GitHub auto-deploys:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Auto-deploys within 1-2 minutes!
```

## 📱 Next Steps

1. ✅ Backend deployed
2. Deploy Frontend to Vercel (see FRONTEND_DEPLOYMENT.md)
3. Connect frontend to backend URL
4. Test entire application
5. Monitor logs and errors

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Python Docs**: https://docs.python.org/3
- **Status Pages**:
  - Render: https://status.render.com
  - Railway: https://status.railway.app

## 📝 Quick Reference

```bash
# View deployment logs
flyctl logs

# Restart service
flyctl restart

# Check service status
flyctl status

# View environment variables
flyctl config show
```

---

**Backend Deployment Complete!** 🎉

Your API is now live and ready to receive requests from the frontend.
