# HabitJourney — Complete Deployment Guide
> Backend → **Docker** | Frontend → **Vercel**

---

## 🚨 STEP 0 — Rotate All Secrets (Do This First!)

The original repo committed real credentials. Rotate everything before any git push:

| Service | Where to rotate |
|---------|----------------|
| MongoDB Atlas | Atlas dashboard → Database Access → Edit user → New password |
| Upstash Redis | Upstash console → Your DB → Reset password |
| Gmail SMTP | Google Account → Security → App Passwords → Delete old, create new |
| Cloudinary | Cloudinary dashboard → Settings → Access Keys → Regenerate |
| JWT Secret | Generate a new one (invalidates existing sessions — that's fine) |

Generate new secrets with:
```bash
# JWT Secret (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Admin Secret (32 hex chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🧩 MongoDB Atlas Setup (Quick)
1. Create a free/shared cluster.
2. Create a database user (username + password).
3. Add your server IP to the Network Access allow-list.
4. Copy the connection string and replace the password.

## 📋 Summary of All Fixes Applied

| File | What was fixed |
|------|----------------|
| `.gitignore` | Now properly excludes `.env` (original pattern `*.env` didn't match it) |
| `render.yaml` | Removed broken client static-site block; added `ADMIN_SECRET` |
| `server/server.js` | Removed `csurf` (deprecated, broke cross-domain); fixed CORS; removed dead static serving |
| `server/services/AuthService.js` | OTP is now **hashed** before DB storage; forgotPassword no longer leaks whether email exists |
| `server/controllers/authController.js` | Cookies set with `sameSite:'none'` + `secure:true` in production — **required** for Vercel ↔ Render |
| `server/middleware/upload.js` | Switched to `memoryStorage` — Render's free tier has ephemeral disk; files written to disk are lost |
| `server/utils/cloudinary.js` | Uses `upload_stream` to accept a Buffer instead of a file path |
| `server/repositories/BaseRepository.js` | Added missing `update()` method — app would crash with `TypeError` without it |
| `server/workers/emailWorker.js` | Now passes `html` field through — all styled email templates were arriving as plain text |
| `server/routes/admin.js` | `/admin/queues` is now protected by `ADMIN_SECRET` token — was publicly accessible before |
| `server/.env.example` | Updated with all vars + TLS warning for Redis |
| `client/src/api/axios.js` | Removed CSRF interceptor that called `/api/csrf-token` before every mutation (endpoint no longer exists) |
| `client/vite.config.js` | Added dev proxy: `/api/*` → `localhost:5000` — no more CORS errors in local dev |
| `client/vercel.json` | **New file** — without this, refreshing any page on Vercel returns 404 |

---

## 🏠 Local Development

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Create `server/.env`
Copy `server/.env.example` → `server/.env` and fill in your values.

> **Redis tip:** For local dev you can use a local Redis instance:
> ```bash
> brew install redis && brew services start redis  # macOS
> # Then set: REDIS_URL=redis://127.0.0.1:6379
> ```

> **Docker tip:** For Docker Compose, the MongoDB URI is:
> `mongodb://mongodb:27017/habitjourney`

### 3. Start backend
```bash
cd server
npm run dev   # runs: node --watch server.js
# → http://localhost:5000
```

### 4. Start frontend
```bash
cd client
npm run dev
# → http://localhost:5173
# /api/* calls are auto-proxied to localhost:5000 — no .env needed
```

> ⚠️ Do NOT create a `client/.env` for local dev. The Vite proxy handles it.

---

## 🚀 Production Deployment (Do In This Order)

### Step 1 — Clean your git history and push

```bash
# Remove committed secrets from git tracking
git rm --cached server/.env 2>/dev/null || true
git rm --cached client/.env.production 2>/dev/null || true

# Commit all the fixes
git add .
git commit -m "fix: security fixes, deployment config for Render + Vercel"
git push origin main
```

---

### Step 2 — Deploy Backend with Docker (Recommended)

1. Provision a server (VM) and install Docker + Docker Compose.
2. Clone the repo on the server.
3. Create `server/.env` (values below).
4. Run:
```bash
docker-compose up -d --build
```
5. Your backend will be available at: `http://YOUR_SERVER_DOMAIN:8080`
6. Test it:
```bash
curl http://YOUR_SERVER_DOMAIN:8080/api/health
```

**server/.env (production values):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...  # Atlas or managed Mongo
CLIENT_URL=https://your-app.vercel.app
REDIS_URL=redis://redis:6379   # Redis container in docker-compose
JWT_SECRET=...
ADMIN_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=Daily Habit Journey
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

### Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add this **Environment Variable** in Vercel:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR_SERVER_DOMAIN/api` |

5. Click **Deploy**
6. Copy your frontend URL: `https://your-app.vercel.app`

---

### Step 4 — Connect Backend to Frontend (CORS)

1. Update `CLIENT_URL` in `server/.env` to your Vercel URL *(exact URL, no trailing slash)*
2. Restart Docker:
```bash
docker-compose up -d
```

---

### Step 5 — Verify Everything Works

```bash
# Health check
curl https://YOUR_SERVER_DOMAIN/api/health

# Then in your browser:
# 1. Open https://your-app.vercel.app
# 2. Sign up → check email for verification link
# 3. Verify email → log in → check email for OTP
# 4. Enter OTP → create a habit → mark it complete
# 5. Check /progress, /achievements, /world pages
```

---

## 🔒 Security Checklist

- [ ] All `.env` files are gitignored and not in the repo
- [ ] MongoDB password rotated
- [ ] Redis password rotated (if using managed Redis)
- [ ] Gmail App Password regenerated
- [ ] Cloudinary API keys regenerated
- [ ] `REDIS_URL` uses `redis://redis:6379` for Docker or `rediss://` for managed Redis
- [ ] `CLIENT_URL` on Render matches exact Vercel URL (no trailing slash)
- [ ] `NODE_ENV=production` on Render
- [ ] `ADMIN_SECRET` set — test at `/admin/queues?token=YOUR_SECRET`
- [ ] JWT secret is a random 64-char hex string

---

## 🐛 Troubleshooting

**CORS error in browser**
→ Check `CLIENT_URL` on Render exactly matches your Vercel URL (no trailing slash, correct https://)
→ Make sure Render redeployed after you set it

**Logs in immediately after login / auth doesn't persist**
→ Cookies aren't sticking cross-domain
→ Verify `NODE_ENV=production` on Render (enables `sameSite:'none'` + `secure:true`)
→ Vercel URL must be `https://` — secure cookies require HTTPS

**Server crashes on startup with Redis error**
→ `REDIS_URL` starts with `redis://` — change to `rediss://` (double 's' for TLS)

**Emails arrive with no styling (plain text)**
→ Already fixed in `emailWorker.js` — the `html` field is now passed through

**Profile picture upload fails**
→ Already fixed — `multer` now uses `memoryStorage` and Cloudinary uses `upload_stream`
→ Check `CLOUDINARY_*` env vars are set correctly on Render

**404 on page refresh in browser (e.g. /dashboard → 404)**
→ `client/vercel.json` must exist with the rewrite rule
→ Redeploy Vercel after adding the file

**Backend not reachable from Vercel**
→ Ensure port `8080` is open on your server firewall
→ Ensure DNS points to the server IP

**OTP code not working**
→ Already fixed — OTPs are now hashed before storage and comparison
→ Check SMTP credentials — if email isn't arriving, the OTP never gets sent
→ Check Render logs for email worker errors
