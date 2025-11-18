# Kam.RAH Mobile Enhancement – Delivery Rules

Codex and collaborators must adhere to these directives so every milestone in the enhancement plan ships predictably and safely.

## 1. Execution Phases
- Align each task with the five phases in the published plan. State the phase/sub-phase in PR descriptions.
- Never mix scope from different phases in one branch/PR.

## 2. Branching & Commits
- Feature branches per task (`phase2/offline-sync-workmanager`).
- Commits: single concern, include testing notes + ticket ID.
- Rebase before merge; avoid force-pushing shared branches.

## 3. Coding Standards
- React Native code in TypeScript, native modules in Kotlin.
- Enforce ESLint/Prettier + TypeScript strict mode + ktlint.
- Pure functions for hooks/services; UI components remain dumb.
- Validate inputs on client & server via shared validation utilities.

## 4. Error Handling & Logging
- Centralized error propagation (Redux middleware / React Query boundaries).
- Wrap navigation, sensor, and API calls in try/catch; show friendly fallbacks.
- Route all logs through Sentry/Crashlytics helpers; scrub PII before sending payloads.

## 5. Offline & Sync
- Mirror backend schemas in Room/Realm entities.
- Queue offline mutations and surface sync states in UI.
- Schedule WorkManager jobs with network/battery constraints; respect Doze/App Standby.

## 6. Security & Auth
- OAuth2/OIDC for auth; refresh + revoke flows implemented.
- Store tokens only via EncryptedSharedPreferences/Keystore.
- TLS everywhere, with certificate pinning when feasible; no plaintext secrets in repo.

## 7. Push, Analytics, Compliance
- Push: FCM + explicit consent + opt-out paths; manage tokens per user/device.
- Analytics: follow defined event schema (onboarding, camera interactions, errors); include Firebase Performance.
- Compliance: maintain data inventory, consent records, privacy policy, and data export/delete endpoints; involve legal for GDPR/COPPA.

## 8. Accessibility & Internationalization
- Externalize strings, support RTL + dynamic font scaling.
- Audit with Android Accessibility Scanner every release; fix announcements, focus order, contrast.

## 9. Testing & CI
- Maintain ≥80% unit coverage (Jest/RNTL/JUnit).
- Integration/UI suites (Detox/Espresso) must pass before merge.
- CI (GitHub Actions/Bitrise) pipeline: lint → unit → integration → build → artifact upload.
- Keep mock services (msw.js/WireMock) and QA datasets current.

## 10. Performance & Resources
- Profile with Android Studio Profiler/Hermes pre/post change.
- Optimize FlatList/RecyclerView usage, memoize selectors, lazy-load heavy modules.
- Convert media to WebP/AVIF, leverage CDN + Glide/Fresco caching.

## 11. Documentation & Reviews
- Update README, MOBILE_SETUP, TEST_PLAN, and architecture docs when behavior changes.
- Record architectural choices in ADRs.
- Require at least one mobile + one backend reviewer when touching shared contracts.

## 12. Release Management
- Release flow: internal QA → closed beta → staged production.
- Monitor crash/analytics dashboards for 48h before ramping rollout.
- Maintain rollback procedures and hotfix branches.

Violations of these rules block merges until resolved.
