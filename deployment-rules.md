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

# deployment-rules
- Always run installation scripts with `sudo` for required permissions.
- Make all necessary shell scripts executable using `chmod +x`.
- Review scripts before execution to understand all actions they perform.
- Ensure the target operating system is supported by the script.
- Set environment variables like `CYBER_MATRIX_API_KEY` before running.
- Use the `auto-install-enhanced.sh` for the most reliable setup.
- Check installation logs for any errors after running a script.
- Stop the application using a dedicated script or service command.
- Do not run installation scripts on a system with conflicting services.
- Always back up important data before running a system-wide installer.
