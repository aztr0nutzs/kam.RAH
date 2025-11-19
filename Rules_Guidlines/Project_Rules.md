1. Project Focus & Goal

Primary goal:
Complete and polish the KamRah mobile Android app as a production-ready client for the KamRah backend:

Android-first, built with Expo + React Native + TypeScript.

Secure, reliable, cyberpunk/futuristic UI.

Fully wired to the real backend API (/users, /cameras, /tasks, etc.).

Offline-aware via Realm and AsyncStorage.

Smooth navigation, onboarding, auth, dashboard, camera detail, logs, settings, and help flows.

When in doubt between mobile vs backend/web:

Always prioritize the mobile app in KamRah/mobile.

2. Tech Stack & Structure (Mobile Only)

Always assume the following stack for the app:

Framework: Expo (expo ~51.0.9)

Runtime: React Native (react-native 0.74.x)

Language: TypeScript (tsconfig extends "expo/tsconfig.base", strict: true)

State / Data:

Context providers in src/context/ (AuthContext, DataContext, LocalizationContext)

Realm for local persistence (src/persistence/)

AsyncStorage for lightweight key/value (src/config/appConfig.ts, onboarding, locale, etc.)

Networking:

HTTP via src/api/client.ts

Base URLs via src/config/appConfig.ts

Domain models: src/types/domain.ts

Navigation:

src/navigation/AppNavigator.tsx (root + tabs + stacks)

UI / Theme:

Components in src/components/

Screens in src/screens/

Theme in src/theme/

Localization in src/i18n/ + LocalizationContext

Key directories (mobile app only):

mobile/App.tsx – App bootstrap, providers, onboarding gate.

mobile/src/api/ – API client and route definitions.

mobile/src/config/ – appConfig.ts (API/WS urls, storage keys).

mobile/src/context/ – Auth, data, localization providers.

mobile/src/navigation/ – App navigator, stacks, tabs.

mobile/src/persistence/ – Realm config and schemas.

mobile/src/screens/ – Auth, Dashboard, CameraDetail, Logs, Settings, Help.

mobile/src/components/ – Reusable UI pieces (NeonButton, CameraCard, OfflineBanner, etc.).

mobile/src/utils/ – Helpers (formatting, logger, media, secureStore).

mobile/src/types/ – Domain types: Camera, Task, etc.

mobile/src/theme/ – Colors, typography, visual constants.

mobile/src/i18n/ – Translations and locale helpers.

3. Global Priorities

When modifying or generating code for KamRah/mobile:

Keep TypeScript strict

No any unless absolutely unavoidable and explicitly justified with comments.

Always respect existing types from src/types/domain.ts.

No placeholders / fake APIs

All networking must go through src/api/client.ts.

Do not add mock URLs or test endpoints.

Respect appConfig.API_BASE_URL and WS_URL. Use configuration patterns already present.

Preserve existing architecture

Use contexts (AuthContext, DataContext, LocalizationContext) instead of ad-hoc global variables.

Use Realm + AsyncStorage via existing helpers, not new storage libraries.

Don’t bypass central utilities (e.g., use captureError from src/utils/logger.ts for error logging).

Android-first UX

Optimize nav flows and layouts with Android in mind.

Ensure screens render correctly on typical phone sizes and orientations.

Avoid iOS-only APIs or behaviors unless guarded and necessary.

Cyberpunk UI, but usable

Reuse and extend existing theme and components.

Prefer NeonButton, StatusBadge, OfflineBanner, etc. over raw Button or unstyled Views.

Show connection status, camera status, recording state, and errors clearly.

Offline-aware and resilient

Respect NetInfo usage in DataContext.

When network is unavailable, rely on Realm data where possible.

Avoid crashes when API/WS are unreachable; surface errors gracefully.

4. Data & Networking Rules
4.1 API Client

All HTTP requests must use src/api/client.ts.

Use existing routes definitions (login, register, getCameras, createCamera, updateCameraSettings, toggleRecording, toggleFavorite, getTasks, updateTask, etc.).

If a new endpoint is needed:

Add it as a new entry to routes.

Use ApiRoute<TBody, TResponse> with proper generics.

Use transformRequest / transformResponse instead of inlining request/response manipulation in components.

Auth token management:

Use setAuthToken from api/client.ts.

Do not create duplicate token globals.

Error handling:

Throw and handle ApiClientError consistently.

Log via captureError from src/utils/logger.ts.

Show user-friendly errors via UI components or screen-level messaging, not raw JSON.

4.2 Configuration

Read connection settings from appConfig.ts:

API_BASE_URL

WS_URL

defaultConnectionSettings

STORAGE_KEYS, SECURE_STORAGE_KEYS

When adding any user-adjustable connection settings:

Use ConnectionSettings type.

Persist via AsyncStorage using STORAGE_KEYS.CONNECTION.

Provide clear input fields and validation in Settings.

5. State, Persistence & Domain Rules
5.1 Domain Types

Always use interfaces and enums from src/types/domain.ts:

Camera, CameraSettings, CameraStatus

Task, LogEntry, and any other provided domain types.

If new fields or types are needed:

Update domain.ts first.

Propagate those types through context, API, and UI as needed.

5.2 Contexts

AuthContext

Used for login, logout, storing auth state and token.

New auth-related behaviors (auto-login, token refresh, “remember me”) must integrate here.

DataContext

Acts as the single source of truth for:

Cameras

Tasks

Logs

Network status

New data operations (e.g., new camera actions, bulk updates) should be implemented here, not directly in screens.

LocalizationContext

Any language or text behavior beyond plain strings must integrate with this.

Use translation keys and translate/useTranslation utilities.

5.3 Realm & Offline Behavior

Use existing models in src/persistence/schema.ts and src/persistence/index.ts.

When adding new persisted data:

Define Realm schema entry.

Use Realm hooks/patterns already present.

Avoid writing raw Realm logic inside screens; keep it in centralized data layer (DataContext or dedicated persistence helpers).

6. Screens & Navigation Rules
6.1 Navigation

Root navigation lives in src/navigation/AppNavigator.tsx.

Any new screen must:

Be placed in src/screens/.

Be registered in the appropriate navigator (stack/tab) in AppNavigator.tsx.

Have a clear type entry in the corresponding navigator param list (e.g., DashboardStackParamList, etc.).

Preserve types for navigation params (CameraDetail: { cameraId: string }, etc.).

6.2 Screen Responsibilities

AuthScreen

Handles login and registration flows via api/client.ts (login, register).

Integrates with AuthContext for token & user state.

Provides basic validation and clear error messaging.

Should not duplicate auth logic elsewhere.

DashboardScreen

Shows camera list, status, and key metrics using CameraCard and other components.

Data comes from DataContext (not direct API calls in the screen).

Supports pull-to-refresh or similar reload behavior, calling context actions.

CameraDetailScreen

Shows details for a single camera, identified by cameraId.

Supports:

Updating camera settings via updateCameraSettings.

Toggling recording via toggleRecording.

Toggling favorites via toggleFavorite.

Uses neon/styled controls consistent with the design system.

LogsScreen

Displays logs from Realm / DataContext.

Uses LogEntryItem component.

Enables filtering/search (if implemented) but must always remain performant on mobile.

SettingsScreen

Allows user to:

View/edit connection settings (API base URL, WS URL).

Adjust app preferences (e.g., theme, language via LocalizationContext).

Uses AsyncStorage and/or SecureStore via existing helpers for persistence.

HelpScreen

Provides in-app guidance, basic troubleshooting steps, and app info.

Should not hard-code backend URLs or secrets.

7. UI / UX & Theming

Use src/theme/ for colors, spacing, typography; do not hard-code random colors.

Prefer existing components:

NeonButton for primary actions.

OfflineBanner for connectivity problems.

StatusBadge to show camera state (ONLINE, OFFLINE, RECORDING).

OnboardingCarousel for the first-time experience.

ShieldedBoundary for error boundaries and crash protection.

When creating new components:

Place them in src/components/, not in screens.

Make them:

Typed with TypeScript.

Reused where possible (no duplication across screens).

Compatible with the neon/cyberpunk style (dark backgrounds, bright purples/cyans, readable contrast).

8. Error Handling, Logging & Security

All unexpected errors in business logic should:

Be captured via captureError in src/utils/logger.ts.

Avoid exposing internal details directly to the user.

Never log:

Raw passwords.

Tokens.

Sensitive personal info.

Use expo-secure-store via src/utils/secureStore.ts for auth and other sensitive data.

Continue wrapping the app tree in <ShieldedBoundary> as in App.tsx.

9. Commands & Verification

When you add or modify mobile code, assume the developer will run:

cd KamRah/mobile

# Install dependencies
npm install

# Check type correctness
npx tsc --noEmit

# Run the app in Expo
npm run android

# or
npm start


You must:

Keep code compilable/type-safe under the existing tsconfig.

Avoid adding dependencies that are not supported by Expo SDK 51 unless absolutely necessary and justified in comments.

10. Style & Implementation Conventions

Use functional components and React hooks.

Prefer useCallback, useMemo, and useRef where needed, but don’t over-optimize prematurely.

Keep files focused:

Screens = layout + view logic + wiring to context.

Components = reusable building blocks.

Contexts = data flow, side effects, and persistence.

Utils = pure helpers without React state.

When returning code:

Provide complete, ready-to-paste file contents for any changed file.

Avoid fragments that require manual merging, unless absolutely necessary and clearly marked.

11. What to Prioritize Next (Guidance for the AI)

When asked for improvements or next steps on the mobile app, prioritize:

End-to-end auth flow

Robust login/register.

Token persistence and auto-login.

Proper error states and retry flows.

Camera dashboard

Stable list of cameras with statuses and quick actions.

Fails gracefully on network errors; uses cached data when offline.

Camera detail & controls

Full control over camera settings (brightness, contrast, night vision, resolution, FPS, codec, PTZ, etc.).

Recording toggle and favorite toggle wired to real API routes.

Logs & monitoring

Clear logs UI that helps debug camera events.

Correct read/write behavior with Realm.

Settings & connection

Editable connection settings with validation.

Simple way to restore defaults from defaultConnectionSettings.

Onboarding & localization

Onboarding only for new users until dismissed (respecting ONBOARDING_KEY).

Basic localization support via LocalizationContext and i18n.

By following these rules, always treat KamRah/mobile as a real production mobile app, not a playground.
Every change should move the Android client closer to a complete, stable, real-world-ready release.
