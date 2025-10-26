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

# backend-rules
- Use secure tools from `secure_network_tools.py` for all OS commands.
- Ensure all new API endpoints require an API key for access.
- Validate and sanitize all inputs received from API requests.
- Never use `shell=True` in any subprocess calls.
- Write all database queries using parameterized statements.
- Keep all attack functionality as educational simulations.
- Log all errors and security-relevant events to `cyber_matrix.log`.
- Add rate limiting to any new computationally expensive endpoint.
- Define dependencies with specific versions in `requirements.txt`.
- Keep the default network binding to `127.0.0.1` for security.
