# Project Rules

This document outlines the mandatory rules and non-negotiable standards for all development work on this project. Adherence to these rules is critical for maintaining quality, security, and stability.

## 1. Zero Mock Data in Production

*   **Rule:** No mock data, simulated logic, or sample fixtures are permitted in the production runtime environment.
*   **Enforcement:**
    *   The `scripts/validate-no-mocks.js` script **must** be run as part of the CI pipeline. A build will fail if any mock artifacts are detected in the production bundle.
    *   Development-only mocks must be explicitly gated by `process.env.NODE_ENV !== 'production'` or a similar mechanism that is stripped from production builds.

## 2. API Contract is Law

*   **Rule:** The frontend **must** integrate with the canonical backend API as defined in `docs/api.md`. All UI controls that trigger a state change or action must correspond to a real API call.
*   **Enforcement:**
    *   All `// TODO: API` markers must be resolved before a feature is considered complete.
    *   Integration tests (`tests/integration/`) will validate the contracts for every endpoint. Pull requests with failing integration tests will be rejected.
    *   The frontend must use the centralized API client (`src/lib/api.js`), which handles authentication, retries, and error handling. No direct `fetch` calls should be made from components.

## 3. Security is Not Optional

*   **Authentication:** All sensitive endpoints must be protected. JWTs must be used, stored securely (e.g., HttpOnly cookies), and include short expiry times with a refresh token mechanism.
*   **Authorization:** Role-Based Access Control (RBAC) middleware (`admin`, `operator`, `viewer`) must be applied to endpoints based on the principle of least privilege.
*   **Input Validation:** All incoming data from any client must be rigorously validated and sanitized on the server-side.
*   **Policy Gating:** Any privileged or potentially destructive action (e.g., enabling network monitor mode) requires a two-step approval process via the `/api/actions` endpoints.
*   **Audit Logging:** All authentication events, configuration changes, and policy-gated actions **must** be logged to the append-only `audit.log`.
*   **Secure Defaults:** All services must bind to `127.0.0.1` by default. WAN exposure must be an explicit, documented configuration change.

## 4. Builds Must Be Deterministic and Verifiable

*   **Rule:** Every build must be reproducible. The same commit must always produce a byte-for-byte identical artifact.
*   **Enforcement:**
    *   All package dependencies must be locked (`package-lock.json`). Use `npm ci` for installations in CI/CD.
    *   The `build-pack.sh` script is the canonical way to produce release artifacts.
    *   The `scripts/verify_build.sh` script **must** be run after packaging to validate artifact checksums. This report is a required artifact for releases.

## 5. Comprehensive and Automated Testing is Mandatory

*   **Backend Unit Tests:** Every controller, service, and utility function must have corresponding unit tests.
*   **API Integration Tests:** The entire API surface must be covered by integration tests that start the server and make real HTTP requests, asserting response codes and schemas.
*   **Frontend E2E Smoke Test:** The `test/run_smoke.sh` script must pass. It verifies the critical path of the application: loading the dashboard, registering a camera, and interacting with its controls.
*   **Test-Driven Mentality:** New features should be accompanied by new tests. Bug fixes must include a regression test.

## 6. Documentation Must Be Kept Current

*   **Rule:** Documentation is not an afterthought; it is a deliverable.
*   **Enforcement:**
    *   `docs/api.md`: Must be updated with any changes to API endpoints, request bodies, or response shapes.
    *   `docs/security.md`: Must reflect the current authentication, authorization, and key management architecture.
    *   `docs/build.md`: Must contain the exact, up-to-date steps for building and releasing the project.
    *   `docs/CHANGELOG.md`: Must be updated for every pull request with a clear, concise summary of changes.