# 🌍 Daily Habit Journey

A premium, production-ready SaaS platform for gamified habit tracking. Build consistency through a immersive 3D-evolving world, AI-driven guidance, and elite-grade security.

## 🚀 Key SaaS Features

- **🎮 3D World Evolution**: Watch your digital planet grow from a seedling to a lush ecosystem based on your consistency.
- **🧘 Deep Work Mode**: Integrated precision Pomodoro timer to help you focus on your "Deep Work" habits.
- **🤖 AI Habit Mentor**: Intelligent habit suggestions and consistency tips tailored to your progress.
- **🛡️ Streak Shields**: Protect your master streaks during emergencies (Unlocked at Level 5).
- **📊 Neural Analytics**: Month-by-month consistency boards and yearly archives.
- **🔐 Elite Security**: Multi-Factor Authentication (OTP), email verification, and CSRF protection.

## 🛠️ Modern Tech Stack

- **Frontend**: React 19, Framer Motion, Recharts, Tailwind CSS v4.
- **Backend**: Node.js, Express, MongoDB.
- **Distributed Architecture**: Redis (Broker), BullMQ (Workers), Cloudinary (Stateless Storage).
- **Monitoring**: Bull-board for background job visibility.

---

## 💻 Local Setup (Development)

### 1. Prerequisites
- Node.js v20+
- Docker & Docker Compose
- Redis (Optional, if not using Docker)

### 2. Configure Environment
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27018/habitjourney
JWT_SECRET=your_secret
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

### 3. Run with Docker (Recommended)
```bash
docker-compose up --build
```
The app will be available at `https://habittracker:8443` (mkcert) and `http://habittracker:8080` (redirects to HTTPS).

mkcert setup (one time):
```bash
mkcert -install
mkcert -cert-file ./nginx/certs/habittracker.pem -key-file ./nginx/certs/habittracker-key.pem habittracker
```

Add this to your hosts file:
```
127.0.0.1 habittracker
```

Notes:
- Redis runs as a Docker container in the compose file.
- MongoDB runs as a Docker container in the compose file (`mongodb://mongodb:27017/habitjourney`).
- `CLIENT_URL` should match the public frontend URL in production.

---

## 📦 Deployment & Scaling

### Statless Horizontal Scaling
The application is designed to be **Stateless**. You can spin up multiple server instances behind a load balancer. 
- All async tasks (Emails, Reminders) are processed by background workers.
- Session-less (JWT) Authentication.
- All uploads go to Cloudinary (No local disk dependency).

### Production Checklist
1. Set `NODE_ENV=production`.
2. Configure `RedisStore` for distributed rate limiting (Enabled by default).
3. Access queue metrics at `/admin/queues`.

---

## 🧭 Support
Built with ❤️ by the Anay Gupta.
