# 🧠 Master Project Context: Daily Habit Journey

This document provides a comprehensive, high-fidelity overview of the "Daily Habit Journey" project. It is designed to allow any AI or developer to understand the full technical stack, architectural patterns, and business logic of the application instantly.

---

## 🎯 Project Overview
**Daily Habit Journey** is a premium, gamified habit-tracking SaaS. It transforms personal growth into a visual journey where staying consistent with habits evolves a digital "World."

### Core Philosophy
- **Emotional Reward**: Visual feedback (World growth) for consistency.
- **Gamification**: XP, Levels, Badges, and Streaks.
- **Privacy & Security**: SaaS-grade authentication and data protection.

---

## 🏗️ Technical Architecture

### 1. Backend (SaaS-Grade CSR Pattern)
Located in `/server`, the backend follows a strict **Controller-Service-Repository (CSR)** pattern:
- **Models** (`/models`): Mongoose schemas for `User`, `Habit`, `Progress`, `Reward`, and `Reflection`.
- **Controllers** (`/controllers`): Handle HTTP request/response logic and input validation.
- **Services** (`/services`): Contain raw business logic (e.g., XP calculation, streak protection logic, state evolution).
- **Repositories** (`/repositories`): Dedicated data access layer for optimized Mongoose queries.
- **Middleware**:
  - `auth.js`: JWT verification and user injection.
  - `errorHandler.js`: Global centralized error handling and logging.
- **Logging**: Uses **Winston** for professional production-level logging and audit trails.

### 2. Frontend (Modern React 19 + Vite 6)
Located in `/client`, the frontend uses a highly interactive, animated design system:
- **Design System**: Vanilla CSS with Tailwind 4. Focused on **Glassmorphism**, smooth transitions (**Framer Motion**), and premium iconography (**Lucide**).
- **Theming**: Context-based `ThemeContext` supporting **Dark** and **Light** modes with persistence.
- **State Management**: React Context for Auth and UI state.
- **Pages**:
  - `Landing`: Feature overview and conversion points.
  - `Dashboard`: Personalized user state, quick stats, and level progress.
  - `Habits`: CRUD for habits with "Complete" functionality and streak tracking.
  - `Progress/Analytics`: LeetCode-style **52-week heatmap** and Recharts-based growth curves.
  - `World`: 3D-like visual state evolving based on user level (e.g., Level 5 = Forest, Level 10 = City).
  - `UserGuide`: Integrated onboarding documentation.
  - `Settings`: Profile management and secure **Account Deletion**.

---

## 🛡️ Security Suite
- **Auth**: JWT stored in **HttpOnly Cookies** with `Secure` and `SameSite` flags.
- **Encryption**: `bcryptjs` for salted password hashing.
- **Protection**:
  - `helmet`: Secure HTTP headers.
  - `express-rate-limit`: DDoS and brute-force protection (100 req/15min).
  - `cors`: Restricted to specific client origins.
- **Validation**: Strict schema validation using Mongoose and Express helpers.

---

## 🚀 Infrastructure & Deployment
The app is fully containerized for one-click deployment:
- **Orchestration**: `docker-compose.yml` manages 4 services:
  - `client`: Vite build served via Nginx (Port 80).
  - `server`: Node.js Express API (Port 5000).
  - `mongo`: Database (Port 27017 mapped to 27018 on host).
  - `nginx`: Primary reverse proxy with **SSL termination**.
- **Port Mappings**:
  - **HTTPS**: `8443` (Default secure access)
  - **HTTP**: `8080` (Auto-redirects to HTTPS)
  - **MongoDB**: `27018`
- **SSL**: Uses `mkcert` generated certificates for local and staging environments.

---

## 📈 Gamification Logic
- **XP Formula**: `XP = Habits_Completed * Streak_Multiplier`.
- **Leveling**: Level increases every 1000 XP.
- **Shields**: Users earn "Streak Shields" after 7-day consistency to protect against one-day lapses.
- **Badges**: 10+ unlockable achievements (e.g., "Early Bird", "Unstoppable").

---

## 📂 Project Structure
```text
Habbit-Tracker/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios instance/interceptors
│   │   ├── components/      # Reusable UI (Layout, Cards)
│   │   ├── context/        # Auth & Theme Contexts
│   │   ├── hooks/          # Custom hooks (useHabits)
│   │   ├── pages/          # All App Views
│   │   └── utils/          # Formatting & Date helpers
├── server/                 # Node.js Backend
│   ├── controllers/        # Request Handlers
│   ├── middleware/         # Auth, Security, Error
│   ├── models/             # DB Schemas
│   ├── repositories/       # Data Access
│   ├── routes/             # API Endpoints
│   ├── services/           # Business Logic
│   └── utils/              # Logger & Helpers
├── nginx/                  # SSL & Reverse Proxy Configs
├── docker-compose.yml      # Full Stack Orchestration
└── deployment_guide.md     # Production Setup Instructions
```

---

## 👩‍💻 Developer Guidelines
1. **CSR Flow**: Always add logic to a `Service`, then expose via `Controller`.
2. **Theming**: Use `text-foreground` and `bg-background` CSS variables; avoid hardcoded colors.
3. **Animations**: Use `LayoutGroup` for smooth list transitions in habits.
4. **Environment**: Sync `.env.example` when adding secret keys.
