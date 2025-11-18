# Kam.RAH – Cyberpunk Security Platform

Kam.RAH is an end-to-end command center for managing home or facility cameras with a neon, cyberpunk aesthetic. The repository now contains:

- **Vite + React** operations console (this folder)
- **Node.js/Express/MongoDB** backend API + WebSocket gateway (`/backend`)
- **Expo/React Native** Android client (`/mobile`)

All surfaces share the same real APIs, JWT auth, and real-time event channel.

---

## Repository layout

```
.
├── App.tsx                  # Web dashboard entry
├── backend/                 # Express API + WebSocket server
├── mobile/                  # Expo React Native app
├── components/, hooks/, …   # Web UI modules
├── config/appConfig.ts      # Web client API/WS config
├── MOBILE_SETUP.md          # Detailed Android instructions
└── TEST_PLAN.md             # Manual regression checklist
```

---

## Backend (Node.js/Express)

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` → `.env` and fill in:

   | Variable | Description |
   | --- | --- |
   | `PORT` / `HOST` | Server bind info (default `5000` / `0.0.0.0`) |
   | `MONGO_URI` | MongoDB connection string |
   | `JWT_SECRET` | Strong secret for signing JWTs |
   | `CLIENT_ORIGINS` | Comma-separated origins allowed by CORS |
   | `WS_PATH` | WebSocket path (default `/ws/events`) |
   | `REQUIRE_AUTH` | Keep `true` in production; `false` only for dev bypass |

3. **Run**
   ```bash
   npm run dev           # nodemon + hot reload
   npm start             # production mode
   ```

4. **Docs & Monitoring**
   - REST docs: `http://<host>:<port>/api/docs` (Swagger UI)
   - WS endpoint: `ws://<host>:<port><WS_PATH>` — requires `?token=<JWT>` when auth is enabled.

---

## Web dashboard (Vite + React)

1. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
2. **Configure**

   Create `.env.local` (Vite loads `VITE_*`):

   ```
   VITE_API_BASE_URL=http://127.0.0.1:5000/api
   VITE_WS_URL=ws://127.0.0.1:5000/ws/events
   VITE_REQUIRE_AUTH=true
   ```

   You can also edit `config/appConfig.ts` for defaults.

3. **Usage**
   - Login/Registration modal establishes a JWT session stored in `localStorage`.
   - All camera CRUD + controls hit the real API, while the Status Bar consumes the secured WebSocket feed.

---

## Android client (Expo + React Native)

The mobile app mirrors the dashboard experience with auth, camera grid, detail controls, real-time logs, and configurable endpoints.

1. **Read `MOBILE_SETUP.md`** for full instructions.
2. Quick start:
   ```bash
   cd mobile
   npm install
   npx expo start
   npx expo run:android   # build & run on emulator/device
   ```
3. **Connecting to local backend**
   - Default config targets `http://10.0.2.2:5000` / `ws://10.0.2.2:5000/ws/events` (Android emulator loopback).
   - Change endpoints directly inside the app (Settings tab) or edit `mobile/src/config/appConfig.ts`.

---

## Testing & validation

- `TEST_PLAN.md` tracks the manual sanity suite (auth, camera CRUD, real-time updates, mobile views).
- REST compliance verified via Swagger.
- Web and mobile clients surface network errors to the user via neon toasts.

For automated testing, wire your preferred framework against the documented API endpoints.

---

## Helpful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run Vite dashboard |
| `npm run build` | Build dashboard assets |
| `cd backend && npm run dev` | Run Express + WS with nodemon |
| `cd mobile && npx expo start` | Launch Expo Metro bundler |

---

## Notes & next steps

- Physical video streams should expose HLS/WebRTC URLs stored in the `Camera.url` field. The UI currently treats them as opaque and expects your preferred player integration at deployment time.
- For production, front the API with TLS-enabled proxies and ensure MongoDB + JWT secrets reside in a secure vault.
- Extend `taskRoutes`/`taskController` for advanced automation (cron runners, device control) as your hardware integration evolves.
