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

# backend-memories
- The main Flask application object is named `app`.
- The primary application file is `app.py`.
- The SQLite database file is named `cyber_matrix.db`.
- The secure API key is read from the `CYBER_MATRIX_API_KEY` environment variable.
- The default host binding is `127.0.0.1`.
- The default port is `5000`.
- All secure, sanitized functions are in `secure_network_tools.py`.
- The system metrics are updated every 5 seconds in a background thread.
- Attack endpoints like `/api/attack/hydra` perform simulations only.
- Network interface control is handled by the `network_manager` instance.
- Legacy insecure scripts are `detect.py`, `networks.py`, and `kamkrk_v2.py`.
