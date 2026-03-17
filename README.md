# 🌍 Daily Habit Journey

A production-ready full-stack gamified habit tracking platform where your consistency visually builds and evolves a digital world.

## 🚀 Features

- **🎮 Gamified Progression**: Earn XP, level up, and unlock 8 unique badges.
- **🌳 Evolving Visual World**: Procedurally generated SVG tree that grows branches and leaves based on your habits.
- **🔐 Secure Auth**: JWT-based authentication with HTTP-only cookies and bcrypt hashing.
- **📊 Advanced Analytics**: Interactive charts (Recharts) and a consistency heatmap.
- **📔 Reflection Mode**: Daily mindful journaling with mood tracking.
- **🔥 Streak Logic**: Smart streak calculation with "Streak Shield" protection.
- **✨ Premium UI**: Dark mode default, glassmorphism, and smooth Framer Motion animations.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB, JWT, Bcrypt.
- **Security**: Helmet, Rate Limiting, Input Validation (express-validator), CORS.

---

## 💻 Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally (port 27017) or a MongoDB Atlas URI.

### 2. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd Habbit-Tracker

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/daily-habit-journey
JWT_SECRET=your_super_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 4. Run the Application
Start both the backend and frontend in separate terminals:

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🧭 MongoDB Compass Connection

1. Open **MongoDB Compass**.
2. Paste the connection string: `mongodb://localhost:27017`
3. Click **Connect**.
4. You will see the `daily-habit-journey` database once you start creating habits or users.

---

## 📦 Deployment Instructions

### Backend (Render / Heroku)
1. Add `NODE_ENV=production` to environment variables.
2. Set `MONGODB_URI` to your Atlas connection string.
3. The server is configured to serve static frontend files if `NODE_ENV` is `production`.

### Frontend (Vercel)
1. Set `VITE_API_URL` to your backend URL.
2. Run `npm run build` to generate the `dist` folder.
