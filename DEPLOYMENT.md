# Deployment Guide

This guide covers deploying the Inventory & Order Management System using free hosting platforms.

## Overview

| Component  | Platform | Free Tier |
|-----------|----------|-----------|
| Backend   | Render   | Free Web Service + Free PostgreSQL |
| Frontend  | Vercel   | Free Hobby plan |

---

## Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:

```bash
cd "Technical Assessment"
git init
git add .
git commit -m "Initial commit: Inventory & Order Management System"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New → PostgreSQL**
3. Configure:
   - **Name**: `inventory-db`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Database**
5. Copy the **Internal Database URL** (starts with `postgresql://`)

### 2.2 Create Backend Web Service

1. Click **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `inventory-api`
   - **Region**: Same as database
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Plan**: Free
4. Add **Environment Variables**:
   - `DATABASE_URL` = (paste the Internal Database URL from step 2.1)
   - `CORS_ORIGINS` = `https://<your-frontend>.vercel.app` (update after deploying frontend)
5. Click **Create Web Service**
6. Wait for the build to complete. Note the service URL (e.g., `https://inventory-api-xxxx.onrender.com`)

### 2.3 Push Backend Docker Image to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build the image
docker build -t <your-dockerhub-username>/inventory-backend:latest ./backend

# Push to Docker Hub
docker push <your-dockerhub-username>/inventory-backend:latest
```

Your Docker Hub image URL: `https://hub.docker.com/r/<your-dockerhub-username>/inventory-backend`

---

## Step 3: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - `VITE_API_URL` = `https://inventory-api-xxxx.onrender.com` (your Render backend URL)
6. Click **Deploy**
7. Note the frontend URL (e.g., `https://your-app.vercel.app`)

---

## Step 4: Update CORS Origins

After deploying the frontend, go back to Render:

1. Open your backend Web Service
2. Go to **Environment**
3. Update `CORS_ORIGINS` to include your Vercel frontend URL:
   ```
   https://your-app.vercel.app
   ```
4. Click **Save Changes** — Render will auto-redeploy

---

## Step 5: Verify Deployment

1. Open the **Backend API**:
   - `https://inventory-api-xxxx.onrender.com/` → Should return health check JSON
   - `https://inventory-api-xxxx.onrender.com/docs` → Swagger UI

2. Open the **Frontend**:
   - `https://your-app.vercel.app` → Should load the dashboard
   - Create a product → verify it appears in the list
   - Create a customer → verify it appears in the list
   - Create an order → verify stock is deducted

---

## Troubleshooting

### Backend returns 500 errors
- Check the Render logs for database connection issues
- Verify `DATABASE_URL` is correct and uses `postgresql://` (not `postgres://`)

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly in Vercel (no trailing slash)
- Verify `CORS_ORIGINS` on Render includes the exact Vercel URL
- Redeploy the frontend after changing `VITE_API_URL`

### Render free tier spins down
- Free Render services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- This is expected behavior on the free tier

---

## Submission Checklist

- [ ] GitHub repository URL: `https://github.com/<username>/<repo>`
- [ ] Docker Hub image: `https://hub.docker.com/r/<username>/inventory-backend`
- [ ] Live frontend URL: `https://your-app.vercel.app`
- [ ] Live backend URL: `https://inventory-api-xxxx.onrender.com`
