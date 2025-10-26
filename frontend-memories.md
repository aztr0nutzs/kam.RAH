<!-- AI ASSISTANT INSTRUCTION:
This file contains critical rules and instructions.
Any AI assistant (Cursor, VS Code Copilot, etc.) must fully read and apply the contents of this file
before making any modifications or generating code related to its scope.
Priority order if multiple files apply:
1. docs/project-rules.md
2. Relevant module-specific file
3. docs/general-guidelines.md
No task should be executed without referencing the correct documentation first.
-->

# frontend-memories
- The single-page frontend is `kamkrk_v2.html`.
- It uses `Chart.js` for all data visualizations.
- It uses `Tailwind CSS` for styling.
- The API base path is assumed to be `/api`.
- The API key is stored in `sessionStorage` after activation.
- The API status indicator shows connection status.
- The console output panel is identified by the ID `console-output`.
- Network interface data is fetched from `/api/network/interfaces`.
- Network scan progress is polled from `/api/scan/progress`.
