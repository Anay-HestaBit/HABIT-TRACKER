# 🧠 Project Context: Daily Habit Journey

This prompt is designed to give an AI agent a comprehensive understanding of the "Daily Habit Journey" project, its architecture, and its core features.

---

## 🎯 Overview
**Daily Habit Journey** is a gamified habit-tracking platform built with a focus on emotional reward and visual progression. Users stay consistent with real-world habits to evolve a digital world, earning XP and unlocking badges.

### Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion (animations), Lucide Icons.
- **Backend**: Node.js, Express, Winston Logger.
- **Database**: MongoDB (Mongoose).
- **Architecture**: Controller-Service-Repository (CSR) pattern for maintainable, SaaS-grade code.
- **Security**: JWT-based authentication, Bcrypt password hashing.
- **Infrastructure**: Dockerized (Multi-stage builds), Nginx Reverse Proxy with SSL termination.
  - **Ports**: 8080 (HTTP), 8443 (HTTPS), 27018 (MongoDB).

---

## 🧱 Key Components

### 1. Backend Architecture (server/)
- **Models**: Defines schemas for `User`, `Habit`, `Progress`, and `Badge`.
- **Controllers**: Handle HTTP requests and response logic.
- **Services**: Business logic layer (e.g., calculating XP, managing streaks).
- **Repositories**: Data access layer (Mongoose queries).
- **Utils**: Professional logging and helpers.

### 2. Frontend Experience (client/src/)
- **Contexts**: `AuthContext` (User state), `ThemeContext` (Light/Dark mode).
- **Pages**:
  - `Landing`: Animated introduction.
  - `Dashboard`: Personalized greeting and habit statistics.
  - `Habits`: Habit management and completion.
  - `Progress`: Visual heatmap and analytics.
  - `World`: Visual representation of habit-driven world growth.
  - `UserGuide`: Onboarding for new citizens.
  - `Settings`: Profile management and account deletion.

---

## 🌈 Special Features
- **Visual World State**: A `worldState` field in the User model that evolves based on level and streaks.
- **Streak Shields**: Protection against habit resets.
- **Professional Polish**: Glassmorphism UI, smooth animations, and a responsive design system.

---

## 👩‍💻 How to Use This Context
Provide this file to any AI coding assistant to:
- Explain existing logic before requesting changes.
- Ensure new features follow the established CSR pattern.
- Debug authentication or database integration issues.
- Maintain consistency in the visual design system.
