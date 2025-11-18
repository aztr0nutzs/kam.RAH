## Kam.RAH Android Client Setup

This guide brings the React Native / Expo client online and connected to your running backend.

---

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`) – optional but handy
- Android Studio (install the SDK + create at least one virtual device)
- Backend/API running locally or reachable over the network

---

### 2. Install dependencies

```bash
cd mobile
npm install
```

---

### 3. Running the app

#### Emulator (recommended)

```bash
# In one terminal
cd backend && npm run dev

# In another terminal
cd mobile
npx expo start        # Metro bundler + QR / commands
npx expo run:android  # Builds native binary & launches selected emulator
```

Expo will default to LAN mode. Press `a` in the Metro CLI to target an Android emulator automatically.

#### Physical device

1. Ensure the device and workstation share the same network.
2. Start the Expo bundler (`npx expo start`).
3. Install the Expo Go app on the device.
4. Scan the Metro QR code (or open the deeplink) to load the project.
5. Update the API base URL in the app’s **Settings** tab to point to your machine’s IP (e.g. `http://192.168.0.42:5000/api`).

---

### 4. Backend connectivity tips

- Android emulators reach the host machine via `10.0.2.2` (already the default in `mobile/src/config/appConfig.ts`).
- For Genymotion or other VMs the host IP may differ—adjust in-app Settings or edit `appConfig.ts`.
- Physical devices must hit an IP/hostname that resolves to your backend (consider ngrok, Tailscale, or VPN if on different networks).

---

### 5. Customizing endpoints

You can change the API + WebSocket URLs directly from the **Settings** tab in the app. Changes persist via AsyncStorage. Alternatively edit `mobile/src/config/appConfig.ts` before building:

```ts
export const appConfig = {
  API_BASE_URL: 'https://your-api.example.com/api',
  WS_URL: 'wss://your-api.example.com/ws/events',
};
```

---

### 6. Useful commands

| Command | Description |
| --- | --- |
| `npx expo start` | Starts Metro bundler (press `a` to launch Android) |
| `npx expo run:android` | Builds native binary + deploys to emulator/device |
| `npx expo start --clear` | Clears Metro cache |

---

### 7. Troubleshooting

- **Cannot reach backend**: confirm URLs, ensure backend listens on `0.0.0.0`, and check firewalls.
- **JWT errors on WS**: Mobile passes the same token to the WebSocket query string; verify auth works via REST first.
- **Slow reloads**: Try `expo start --tunnel` if LAN discovery fails, or clear caches (`watchman watch-del-all`, `expo start --clear`).

---

### 8. Localization, onboarding, and accessibility

- The client now ships with an onboarding carousel highlighting dashboard controls, offline queuing, and help resources. It automatically appears after the first authenticated session and can be relaunched by clearing `kamrah-mobile:onboarding-v1` via AsyncStorage.
- All operator-facing strings run through the localization layer (`LocalizationProvider`). English, Spanish, and Arabic are bundled, with RTL layout adjustments applied automatically. Use the **Settings → Language** picker to switch locales at runtime (persists via SecureStore) without reinstalling the app.
- Camera preview cards request WebP thumbnails and leverage `expo-image` caching (Glide/Fresco under the hood). When no preview URL exists the card collapses gracefully.
- Accessibility upgrades include focus management on camera detail screens, screen-reader announcements for offline events and auth errors, descriptive labels for interactive controls, and higher-contrast banners so large-font / TalkBack users can navigate safely.

Once the app is authenticated you’ll see the same cameras, logs, and automation tasks as the web dashboard, all backed by live API calls and WebSocket events.
