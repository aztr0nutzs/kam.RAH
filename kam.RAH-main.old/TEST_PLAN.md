# Kam.RAH Manual Test Plan

## 1. Backend/API smoke
1. `cd backend && npm run dev`.
2. Hit `GET /health` → `{ status: "ok" }`.
3. Register a user via `POST /api/users/register`.
4. Login via `POST /api/users/login` to obtain JWT.
5. Use JWT to `POST /api/cameras` with sample stream URL; verify `200` and Mongo entry.
6. `GET /api/cameras` returns the created camera.
7. `POST /api/cameras/:id/record` → status toggles between `ONLINE` and `RECORDING`.
8. `POST /api/tasks` (e.g., snapshot automation) returns task; `GET /api/tasks` lists it.
9. Swagger UI at `/api/docs` loads and lists the same endpoints.

## 2. Web dashboard
1. `npm run dev` (root) then open `http://localhost:5173`.
2. Login with credentials created above.
3. Accept consent modal → dashboard loads.
4. Verify cameras populate from backend; add a new camera via “Add Camera” modal.
5. Toggle favorite + recording; Status Bar shows log events, and Chrome dev tools confirm REST calls succeed.
6. Kill the backend temporarily → toast + log warns about WebSocket loss; restart backend and confirm auto-reconnect.
7. Logout via header menu; ensure session clears and login screen returns.

## 3. Mobile app
1. Follow `MOBILE_SETUP.md`, login with the same user.
2. Confirm dashboard camera list matches the web UI.
3. Tap a camera → detail screen; toggle recording/favorite and see changes reflect in web app (WebSocket).
4. Pull-to-refresh updates data.
5. Logs tab streams recent log events.
6. Settings tab: change API/WS to an invalid value, confirm errors; revert to working URLs.

## 4. Real-time channel
1. With web and mobile clients connected, delete a camera from web “Add Camera” modal (or via API).
2. Both clients remove the camera instantly and display log entries.
3. Create a task via API and confirm both clients receive `task_created`.

## 5. Edge cases
1. Attempt login with wrong credentials -> friendly error toast/message.
2. Try adding camera with invalid URL -> validation error surfacing from API.
3. Shut down MongoDB -> backend logs fatal error and exits gracefully.

Document any deviations or regressions before shipping changes. Use this checklist for every release candidate.
