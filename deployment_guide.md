# 🚀 Professional Deployment Guide

This guide details how to deploy **Habitcraft** in a production-ready, distributed environment.

---

## 🏗️ Distributed Architecture Overview
The application uses a **Producer-Worker** model to ensure high availability and responsiveness.
- **API Server**: Handles requests, generates JWTs, and producers jobs.
- **Workers**: Process background tasks like OTP emails and daily reminders.
- **Redis**: Acts as the central message broker and rate-limiter store.
- **Cloudinary**: Serves as the stateless storage for all user media.

---

## ☁️ Cloud Infrastructure Requirements

### 1. Database (MongoDB)
Use **MongoDB Atlas** or a managed Mongo service. 
- Ensure you have the `MONGODB_URI` connection string.
- Enable IP allow-listing for your server instances.

### MongoDB Atlas Quick Setup
1. Create a free/shared cluster.
2. Create a database user (username + password).
3. Add your server IP to the Network Access allow-list.
4. Copy the connection string and replace the password.

### 2. Cache & Broker (Redis)
Use **Redis Cloud**, **AWS ElastiCache**, or a dedicated Redis container.
- `REDIS_URL` is required for BullMQ and Rate Limiting.
- For Docker deployments in this repo, Redis runs as a container and the app uses `redis://redis:6379`.

### 3. Media Storage (Cloudinary)
Sign up for a free/pro account at [Cloudinary](https://cloudinary.com/).
- Populate `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

---

## 🐳 Docker Deployment (The "Gold Standard")

### Configuration
Update your `server/.env` with production values (same keys as local):
```env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/habitjourney
CLIENT_URL=https://your-frontend.vercel.app
REDIS_URL=redis://redis:6379  # Container name from docker-compose
JWT_SECRET=...
ADMIN_SECRET=...
RESEND_API_KEY=...
RESEND_FROM=Habitcraft <no-reply@yourdomain.com>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Deployment Commands
```bash
# Build and start the production stack
docker-compose up -d --build

# Scale the API server (if needed)
docker-compose up -d --scale server=3
```

---

## 🛡️ Security Posture
1. **SSL/TLS**: Terminate TLS at your host load balancer or replace the Nginx config with SSL certificates.
2. **CSRF**: Automatic protection is enabled. Ensure `CLIENT_URL` is set to your production domain.
3. **MFA**: Email-based OTP is mandatory for all logins.
4. **Queue Monitoring**: Accessible at `yourdomain.com/admin/queues`. Note: In production, you should add OIDC or Basic Auth to this route.

---

## 📊 Health Checks
- **API Health**: `GET /api/health` returns `status: ok`.
- **Database**: Pinged every 10s by Docker healthcheck.
- **Redis**: Pinged every 10s by Docker healthcheck.

---

## 🌐 Frontend on Vercel + Backend on Docker (Recommended)

### Step 1 — Deploy Backend with Docker
1. Provision a server (VM) and install Docker + Docker Compose.
2. Clone the repo and set `server/.env` with production values.
3. Run:
```bash
docker-compose up -d --build
```
4. Expose port `8080` from the host (Nginx reverse proxy in the compose file).

### Step 2 — Deploy Frontend on Vercel
1. Import the repo in Vercel.
2. **Root Directory**: `client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Add env var:
  - `VITE_API_URL=https://your-backend-domain.com/api`

### Step 3 — Connect CORS
Update `CLIENT_URL` in `server/.env` to your Vercel URL and restart:
```bash
docker-compose up -d
```
