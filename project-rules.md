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

# project-rules
- Always run security tests before committing changes.
- Ensure all code is formatted according to standard style guides.
- Update documentation to reflect any changes in code or functionality.
- Pin all dependency versions in `requirements.txt`.
- Never commit secrets or API keys directly into the repository.
- Use secure, sanitized functions from `secure_network_tools.py`.
- Do not introduce any code that uses `shell=True`.
- Ensure all new features have corresponding tests.
- Maintain a simulation-first approach for all offensive functions.
- Validate and sanitize all user-provided input on the backend.
- Run the application with `debug=False` in production.
- Bind the server to `127.0.0.1` unless explicitly deploying behind a proxy.
- All new API endpoints must be protected with authentication and rate limiting.
- Keep the user interface and backend logic strictly separated.
- Log important events, errors, and security-related actions.
- Remove dead or unused code from the project.
