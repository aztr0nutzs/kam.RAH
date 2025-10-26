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

# frontend-rules
- Ensure every interactive element is connected to a live API endpoint.
- Replace all mock or static data with live data from the backend.
- Handle all API call failures gracefully without crashing the UI.
- Sanitize any data displayed in the UI that originates from the backend.
- Provide clear visual feedback for all user actions and operations.
- Send the API key with every request to a protected endpoint.
- Keep the user interface responsive and functional on different screen sizes.
- Do not expose raw error messages from the backend directly to the user.
