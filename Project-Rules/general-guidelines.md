# General Development Guidelines

These guidelines represent the best practices and conventions adopted for this project. Following them ensures consistency, readability, and maintainability of the codebase.

## Code Style & Conventions

*   **General:** Adhere to the project's existing code style. Use the configured linter (`ESLint`, `Ruff`, etc.) and code formatter (`Prettier`, `Black`) before committing.
*   **Frontend (React/TypeScript):**
    *   Use functional components with hooks.
    *   Maintain a clear component hierarchy. Place shared components in `components/` and page-level components in `views/` or `pages/`.
    *   Use CSS variables (defined in `index.html`) for all styling to maintain the cyberpunk theme. Avoid inline styles for theming.
    *   Props should be strongly typed using TypeScript interfaces.
*   **Backend (Node.js/Express):**
    *   Follow a standard Model-View-Controller (MVC) pattern where applicable (Models, Routes, Controllers).
    *   Use `async/await` for all asynchronous operations. Avoid callback pyramids.
    *   Centralize logic in service layers rather than putting it directly in controller functions.
    *   Use the provided error handling middleware; don't use raw `try...catch` blocks to send responses.

## State Management (Frontend)

*   **Principle:** Lift state up. The `App.tsx` component serves as the primary owner of global application state.
*   **Component State:** Use `useState` only for UI state that is truly local to a component (e.g., whether a dropdown is open). Data that affects other components or should be persisted via API calls belongs in a higher-level state manager.
*   **Data Fetching:** All interactions with the backend should go through the centralized API client in `src/lib/api.js`. This ensures consistent handling of authentication tokens, request retries, and error notifications.

## Error Handling & Logging

*   **Frontend:**
    *   Never let an API error result in a blank screen or an unresponsive UI.
    *   Use the centralized API client to catch errors and display user-friendly toast notifications via the `addNotification` function.
    *   Use component error boundaries for containing rendering errors.
*   **Backend:**
    *   Use structured logging (JSON format). Log levels should be used appropriately (`info`, `warn`, `error`).
    *   Never log sensitive information like passwords, API keys, or session tokens in plain text.
    *   Errors should be propagated to the central error handling middleware, which will format a consistent JSON response. Do not expose raw error stacks in production responses.

## Accessibility (A11y)

*   **Keyboard Navigation:** All interactive elements (buttons, inputs, links, tabs) must be focusable and operable using the keyboard alone. The focus order must be logical.
*   **ARIA Roles:** Use appropriate ARIA (Accessible Rich Internet Applications) roles and attributes, especially for custom components that don't have native semantics (e.g., custom dropdowns, modals).
*   **Semantic HTML:** Use semantic HTML elements (`<nav>`, `<main>`, `<aside>`, `<button>`) wherever possible.
*   **Labels & Contrast:** All form inputs must have associated `<label>`s. Text must meet WCAG AA contrast ratio standards against its background.

## Commit Messages

*   Follow the **Conventional Commits** specification. This helps in automating changelog generation and makes the Git history easy to understand.
*   **Format:** `<type>(<scope>): <subject>`
    *   **Examples:**
        *   `feat(api): add endpoint for camera PTZ control`
        *   `fix(ui): correct focus order in settings modal`
        *   `docs(api): update GET /cameras response schema`
        *   `chore(deps): upgrade express to version 4.19.2`
        *   `test(e2e): add smoke test for recording workflow`