# Deployment Guide

This deploys the backend + database on **Render**, the backend image on **Docker Hub**,
and the frontend on **Vercel**.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Inventory & order management system"
git branch -M main
git remote add origin https://github.com/<you>/inventory-system.git
git push -u origin main
```

## 2. Push the backend image to Docker Hub

```bash
cd backend
docker build -t <dockerhub-username>/inventory-backend:1.0 .
docker login
docker push <dockerhub-username>/inventory-backend:1.0
```

Your image link will be:
`https://hub.docker.com/r/<dockerhub-username>/inventory-backend`

## 3. Database on Render

1. Render dashboard → **New → PostgreSQL**.
2. Pick the free plan, create it.
3. Copy the **Internal Database URL** (used by the backend service).

## 4. Backend on Render

1. **New → Web Service** → connect your GitHub repo.
2. Root directory: `backend`. Render auto-detects the `Dockerfile`.
3. Add environment variables:
   - `DATABASE_URL` → the Render Postgres URL from step 3
   - `CORS_ORIGINS` → your Vercel URL (add it after step 5; can use `*` temporarily)
   - `LOW_STOCK_THRESHOLD` → `10`
4. Deploy. Your API will live at `https://<service>.onrender.com`.
   Confirm `https://<service>.onrender.com/docs` loads.

## 5. Frontend on Vercel

1. Vercel → **Add New → Project** → import the same repo.
2. Root directory: `frontend`. Framework preset: **Vite**.
3. Environment variable:
   - `VITE_API_URL` → `https://<service>.onrender.com`
4. Deploy. You'll get `https://<project>.vercel.app`.

## 6. Wire CORS

Go back to the Render backend service and set `CORS_ORIGINS` to your real Vercel URL
(e.g. `https://<project>.vercel.app`), then redeploy. This lets the browser talk to the API.

## Final submission checklist

- [ ] GitHub repo link (frontend + backend)
- [ ] Docker Hub image link for the backend
- [ ] Live frontend URL (Vercel)
- [ ] Live backend API URL (Render `/docs`)

> Note: Render's free tier sleeps after ~15 min idle, so the first request after a pause
> takes ~30–50s to wake up. Mention this if a grader sees a slow first load.
