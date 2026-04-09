# Habitcraft 🌍

Habitcraft is a production-grade, gamified SaaS Habit Tracker. The application transforms the routine task of building daily habits into a rewarding, visual RPG-like experience. Users can establish daily routines, log detailed encrypted journal entries, and watch their own unique "Visual World" tree grow and evolve in real-time as they accumulate experience points (XP) and maintain consistency streaks.

## Features ✨

* **Gamified Progression**: Level up your character and watch your personal World Tree evolve as you consistently complete habits.
* **Encrypted Journaling**: Built-in 256-bit AES encryption ensures your daily reflections remain strictly private and secure in the database.
* **Interactive SaaS Onboarding**: New users automatically receive a dynamic, animated pop-over tour highlighting key dashboard features on their first login.
* **Consistency Heatmaps**: Track your daily progress with beautiful, familiar contribution board visualizations.
* **Automated Reminders**: Configurable email worker processes utilizing `BullMQ` to dispatch daily email recaps to users.
* **Premium UI**: Ultra-modern, responsive glass-morphism interface powered by TailwindCSS and Framer Motion.

## Tech Stack 🛠

* **Frontend**: React 19, Vite, TailwindCSS v4, Framer Motion, Driver.js 
* **Backend**: Node.js, Express, Mongoose
* **Database**: MongoDB (Primary Data), Redis (Background Queues & Rate Limiting)
* **Authentication**: JWT secured by hardened `httpOnly` cross-site partitioned cookies
* **Email Provider**: Resend

## Setup Instructions 🚀

### Local Docker Environment (Recommended)

1. Ensure Docker Desktop is installed.
2. Clone the repository and navigate into the root directory.
3. Generate the required master configuration file:
   ```bash
   cp .env.example server/.env
   # Make sure to populate the JWT_SECRET and JOURNAL_ENCRYPTION_KEY inside `server/.env`
   ```
4. Build and boot the containerized ecosystem:
   ```bash
   docker compose up -d --build
   ```
5. Navigate to `https://localhost:8443` in your browser.

### Manual Environment

1. Ensure MongoDB and Redis daemons are running locally on your hardware.
2. Clone the repository.
3. Configure the `server/.env` and `client/.env.local` files individually.
4. **Boot Backend**: Navigate to `cd server` -> `npm install` -> `npm run dev`.
5. **Boot Frontend**: Navigate into `cd client` -> `npm install` -> `npm run dev`.

## Developer Notes

* To manage the background email queues, visit your configured host at `/admin/queues` and supply the `ADMIN_SECRET` query token.
* Passwords and journaling schemas natively redact sensitive payloads prior to REST transit. Do not remove the `verifyEmail` or `journalCrypto` hooks inside the controllers!
