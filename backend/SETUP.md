# Backend Setup for Deployment - Quick Start

## ✅ Files Created/Updated

```
backend/
├── ✅ requirements.txt       (pinned versions)
├── ✅ Procfile               (deployment config)
├── ✅ runtime.txt            (Python 3.11.6)
├── ✅ .gitignore             (excludes unnecessary files)
├── ✅ .env.example           (environment template)
├── ✅ DEPLOYMENT.md          (full deployment guide)
├── ✅ main.py                (updated for production)
└── ✅ (other files)
```

## 🚀 Quick Deployment Steps

### 1. Verify All Files Are Ready

```bash
cd /home/swastik/Desktop/BillPrediction/backend

# Check if files exist
ls -la | grep -E "requirements.txt|Procfile|runtime.txt|.gitignore|.env.example|DEPLOYMENT.md"
```

Expected output shows all 6 files ✅

### 2. Test Locally Before Deploying

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# In another terminal, test health endpoint
curl http://127.0.0.1:5000/health
```

Expected output:
```json
{"status": "healthy", "database": "connected"}
```

### 3. Push to GitHub

```bash
cd /home/swastik/Desktop/BillPrediction

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit - BillInsight backend ready for deployment"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/BillPrediction.git

# Push
git branch -M main
git push -u origin main
```

### 4. Deploy to Render (FREE!)

**Steps:**

1. Go to https://dashboard.render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select your `BillPrediction` repository
5. Configuration:
   ```
   Name: billprediction-api
   Branch: main
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Add Environment Variables:
   - `CORS_ORIGINS`: `https://billprediction.vercel.app,http://localhost:3000`
   - `RELOAD`: `False`
7. Click "Create Web Service"
8. Wait 2-3 minutes for deployment
9. Copy service URL (e.g., `https://billprediction-api.onrender.com`)

### 5. Verify Deployment

```bash
# Test health endpoint
curl https://billprediction-api.onrender.com/health

# Test registration
curl -X POST https://billprediction-api.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@test.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

## 📋 Deployment Checklist

- [ ] All requirements.txt dependencies have versions
- [ ] Procfile exists and has correct command
- [ ] runtime.txt specifies Python 3.11.6
- [ ] .gitignore excludes __pycache__, venv, .env
- [ ] main.py uses environment variables
- [ ] Code tested locally
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Service deployed on Render
- [ ] Health endpoint working
- [ ] API endpoints tested
- [ ] CORS_ORIGINS updated with frontend URL

## 🔧 Key Configuration Files

### requirements.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pydantic==2.4.2
```

### Procfile
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### runtime.txt
```
python-3.11.6
```

### Environment Variables (Set on Render)
```
CORS_ORIGINS=https://billprediction.vercel.app,http://localhost:3000
RELOAD=False
```

## 🆘 Troubleshooting

### "Build failed"
- Check requirements.txt has correct format
- Verify Python version in runtime.txt
- Check Procfile syntax

### "CORS error"
```
Error: "No 'Access-Control-Allow-Origin' header"
Solution: Update CORS_ORIGINS with your frontend URL
```

### "Health endpoint returns 503"
- Check database migration ran
- Check `bills.db` has proper permissions
- Review Render logs

### "Service keeps spinning down"
- Free tier spins after 15 mins inactivity
- Upgrade to paid plan
- Or set up uptime monitor to keep alive

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide with:
- Detailed step-by-step instructions
- Multiple deployment platforms
- Environment variables explanation
- Monitoring and logging
- Security checklist
- Troubleshooting

## 🎯 What's Next

After backend deployment:

1. ✅ Backend deployed to Render
2. → Deploy Frontend to Vercel (frontend setup needed)
3. → Connect frontend to backend URL
4. → Test entire application
5. → Go live!

## 📞 Support

- **Render Support**: https://render.com/support
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Health Check**: `GET /health` endpoint

---

**Backend deployment files ready to go!** 🚀

Use the steps above to deploy your backend or follow [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
