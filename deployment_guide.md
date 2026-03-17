# 🚀 Deployment & Setup Guide: Daily Habit Journey

This guide will help you set up the application locally using Docker and Nginx with SSL, as well as prepare for production deployment on Vercel and Render.

---

## 🛠️ Local Setup (Docker + SSL)

### 1. Requirements
- Docker & Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) (for local SSL)

### 2. Generate SSL Certificates
We use `mkcert` to create trusted certificates for `localhost`.
```bash
# Install mkcert (if not already)
# On Ubuntu: sudo apt install mkcert
# On Mac: brew install mkcert

# Initialize mkcert (one-time setup)
mkcert -install

# Generate certificates in the project folder
cd Habbit-Tracker/nginx/certs
mkcert localhost
# This will create 'localhost.pem' and 'localhost-key.pem'
```

### 3. Run the Application
From the root directory:
```bash
docker-compose up --build
```
The application will be available at:
- **HTTPS**: [https://localhost:8443](https://localhost:8443)
- **HTTP**: [http://localhost:8080](http://localhost:8080)
- **MongoDB**: `localhost:27018` (for Compass)

---

## ☁️ Production Deployment

### 1. Backend (Render / Heroku)
- **Service Type**: Web Service (Node.js)
- **Environment Variables**:
  - `MONGODB_URI`: Your MongoDB Atlas connection string.
  - `JWT_SECRET`: A long, secure random string.
  - `NODE_ENV`: `production`
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && node server.js`

### 2. Frontend (Vercel / Netlify)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://api.yourdomain.com`).
- **Configuration**: Ensure you add a `vercel.json` (or similar) to handle SPA routing if not using a framework like Next.js. Vercel automatically detects Vite apps.

---

## 🛑 Security & Vulnerability Check
1. **JWT Security**: Currently using HTTP-only cookies (if configured) or Bearer tokens. For production, ensure `Secure=true` is set on cookies.
2. **CORS**: Ensure `CLIENT_URL` is set to your final frontend domain in the server's `.env`.
3. **Database**: Always use MongoDB Atlas with IP allow-listing and strong passwords.
4. **Secrets**: Never commit `.env` files to git. Use a `.gitignore`.
