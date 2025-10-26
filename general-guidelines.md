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

# General Guidelines

## Overview
Use this file when no specific markdown file exists for a task. These are the fallback guidelines that apply to all areas of the CYBER-MATRIX v8.0 project when module-specific documentation is not available.

---

## 🎯 Core Principles

### 1. Security First
- **Never** introduce code that could create security vulnerabilities
- Always validate and sanitize user inputs
- Never use `shell=True` in subprocess calls
- Use parameterized queries for all database operations
- Follow the principle of least privilege

### 2. Documentation Driven
- Never make arbitrary changes without a documented basis
- If unsure about a change, halt and reference `docs/project-rules.md`
- Document any new addition with a markdown file before coding
- Keep documentation synchronized with code changes
- All new features must be documented before implementation

### 3. Code Quality Standards
- Follow best practices in security, architecture, and consistency
- Write clean, readable, and maintainable code
- Use meaningful variable and function names
- Add comments for complex logic
- Follow PEP 8 style guide for Python code
- Maintain consistent code formatting throughout the project

### 4. Architecture Consistency
- Respect directory structure and naming conventions at all times
- Keep backend and frontend strictly separated
- Use established patterns for similar functionality
- Don't introduce new dependencies without justification
- Follow the existing project structure

---

## 🔧 Development Guidelines

### Code Structure
- **Maintain clear function boundaries**: Each function should do one thing well
- **Avoid code duplication**: Extract common functionality into reusable functions
- **Use appropriate abstractions**: Don't over-engineer, but don't under-engineer either
- **Follow SOLID principles**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion

### Naming Conventions
- **Files**: Use snake_case for Python files (e.g., `network_tools.py`)
- **Functions**: Use snake_case for function names (e.g., `scan_network()`)
- **Classes**: Use PascalCase for class names (e.g., `NetworkScanner`)
- **Constants**: Use UPPER_CASE for constants (e.g., `DEFAULT_PORT`)
- **Variables**: Use snake_case for variables (e.g., `target_ip`)

### Error Handling
- Always handle potential errors gracefully
- Provide meaningful error messages
- Log errors appropriately
- Never expose sensitive information in error messages
- Return appropriate HTTP status codes for API endpoints

### Testing
- Write tests for all new functionality
- Ensure tests pass before committing changes
- Maintain test coverage above 80%
- Test both success and failure cases
- Include edge case testing

---

## 🛡️ Security Guidelines

### Input Validation
- Validate all user inputs before processing
- Use whitelist validation when possible
- Sanitize inputs to prevent injection attacks
- Validate data types, ranges, and formats
- Never trust client-side validation alone

### Authentication & Authorization
- Require API keys for all sensitive endpoints
- Validate API keys on every protected request
- Use environment variables for secrets
- Never hardcode credentials
- Implement rate limiting on sensitive endpoints

### Data Protection
- Never log sensitive information
- Encrypt sensitive data at rest
- Use secure communication protocols
- Follow data minimization principles
- Implement proper access controls

### Dependency Management
- Keep all dependencies up to date
- Pin dependency versions in `requirements.txt`
- Regularly scan for vulnerabilities
- Remove unused dependencies
- Review dependency security advisories

---

## 📝 Documentation Standards

### Code Documentation
- Add docstrings to all functions and classes
- Document parameters, return values, and exceptions
- Include usage examples for complex functions
- Keep comments up to date with code changes
- Use clear and concise language

### Markdown Documentation
- Use proper markdown formatting
- Include table of contents for long documents
- Add code examples where appropriate
- Keep documentation concise and scannable
- Update documentation when code changes

### API Documentation
- Document all endpoints with their parameters
- Include request and response examples
- Specify required headers and authentication
- Document error responses
- Keep API docs synchronized with implementation

---

## 🔄 Version Control

### Git Practices
- Write clear, descriptive commit messages
- Make atomic commits (one logical change per commit)
- Use feature branches for new development
- Keep commits focused and small
- Don't commit generated files or build artifacts

### Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Capitalize the first letter
- Keep the first line under 50 characters
- Provide detailed description in the body if needed
- Reference issue numbers when applicable

### Branch Management
- Use descriptive branch names
- Delete branches after merging
- Keep branches up to date with main
- Resolve conflicts carefully
- Review changes before merging

---

## 🧪 Quality Assurance

### Before Committing
- ✅ Run all tests and ensure they pass
- ✅ Check for linting errors
- ✅ Verify code follows project conventions
- ✅ Update documentation if needed
- ✅ Review changes yourself before pushing

### Code Review Checklist
- Does the code follow project standards?
- Are there any security vulnerabilities?
- Is the code well-documented?
- Are there adequate tests?
- Is the code maintainable?

### Performance Considerations
- Avoid unnecessary database queries
- Cache data when appropriate
- Use efficient algorithms and data structures
- Profile code for performance bottlenecks
- Optimize only when necessary (avoid premature optimization)

---

## 🎨 User Experience

### Frontend Development
- Maintain consistency with existing UI/UX
- Ensure responsive design for all screen sizes
- Provide clear feedback for user actions
- Handle loading states appropriately
- Make error messages user-friendly

### API Design
- Follow RESTful conventions
- Use appropriate HTTP methods
- Return consistent response formats
- Include proper status codes
- Version APIs when making breaking changes

### Accessibility
- Follow WCAG guidelines
- Ensure keyboard navigation works
- Use semantic HTML
- Provide alt text for images
- Test with screen readers

---

## 🚨 When in Doubt

If you encounter a situation not covered by this document:

1. **STOP** - Don't proceed without proper guidance
2. **Reference** `docs/project-rules.md` for higher-level guidance
3. **Search** for similar patterns in the existing codebase
4. **Consult** module-specific documentation if applicable
5. **Ask** for clarification if still uncertain

---

## 📋 Quick Decision Tree

```
Is there a module-specific doc for this task?
├── YES → Use module-specific doc
└── NO  → Continue to next question

Does project-rules.md cover this?
├── YES → Follow project-rules.md
└── NO  → Continue to next question

Is this covered in general-guidelines.md?
├── YES → Follow these guidelines
└── NO  → HALT and ask for guidance
```

---

## ⚖️ Priority of Guidelines

When guidelines conflict or overlap:

1. **Security always wins** - Security requirements override everything
2. **Project-rules.md** - Global rules take precedence
3. **Module-specific rules** - Specific rules override general ones
4. **General-guidelines.md** - This document is the fallback
5. **Common sense** - Use good judgment when rules don't cover a case

---

## 🔄 Maintaining These Guidelines

### When to Update
- New patterns emerge in the codebase
- Security best practices evolve
- Project requirements change
- Common issues are discovered
- Team processes improve

### How to Update
- Propose changes through pull requests
- Get team review and approval
- Update related documentation
- Announce changes to the team
- Archive old versions if needed

---

*Remember: These guidelines exist to maintain quality, security, and consistency. When in doubt, err on the side of caution and ask for guidance.*
