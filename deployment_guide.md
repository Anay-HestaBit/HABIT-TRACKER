# 🚀 Professional Deployment Guide

This guide details how to deploy the **Daily Habit Journey** in a production-ready, distributed environment.

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

### 2. Cache & Broker (Redis)
Use **Redis Cloud**, **AWS ElastiCache**, or a dedicated Redis container.
- `REDIS_URL` is required for BullMQ and Rate Limiting.

### 3. Media Storage (Cloudinary)
Sign up for a free/pro account at [Cloudinary](https://cloudinary.com/).
- Populate `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

---

## 🐳 Docker Deployment (The "Gold Standard")

### Configuration
Update your `docker-compose.yml` environment section:
```yaml
server:
  environment:
    - NODE_ENV=production
    - MONGODB_URI=mongodb://...
    - REDIS_URL=redis://...
    - CLOUDINARY_URL=cloudinary://...
```

### Deployment Commands
```bash
# Build and start the production stack
docker-compose -f docker-compose.yml up -d --build

# Scale the API server (if needed)
docker-compose up -d --scale server=3
```

---

## 🛡️ Security Posture
1. **SSL/TLS**: The provided Nginx config supports SSL. Ensure you provide valid certificates in `nginx/certs`.
2. **CSRF**: Automatic protection is enabled. Ensure `CLIENT_URL` is set to your production domain.
3. **MFA**: Email-based OTP is mandatory for all logins.
4. **Queue Monitoring**: Accessible at `yourdomain.com/admin/queues`. Note: In production, you should add OIDC or Basic Auth to this route.

---

## 📊 Health Checks
- **API Health**: `GET /api/health` returns `status: ok`.
- **Database**: Pinged every 10s by Docker healthcheck.
- **Redis**: Pinged every 10s by Docker healthcheck.
