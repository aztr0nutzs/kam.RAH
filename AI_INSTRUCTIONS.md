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

# AI Assistant Instructions - CYBER-MATRIX v8.0

## 🎯 Mandatory Reading Protocol

**CRITICAL**: Before executing any action, AI assistants (Cursor, VS Code Copilot, etc.) **MUST** follow this protocol:

### Step-by-Step Enforcement Process

1. **Determine Context**
   - Identify which module, feature, or area is involved in the task
   - Determine if the task involves: backend, frontend, testing, deployment, configuration, security, or documentation

2. **Locate Relevant Documentation**
   - Read the corresponding markdown file(s) for specific instructions
   - Check module-specific files first, then general guidelines
   - Use the priority order defined below if multiple files apply

3. **Apply Rules Precisely**
   - Follow all rules exactly as stated in the documentation
   - Never skip or ignore documented instructions
   - If uncertain, reference higher-priority documentation

4. **Use Fallback Guidelines**
   - If no specific file exists for the task area, use `docs/general-guidelines.md`
   - When in doubt, reference `docs/project-rules.md` first

5. **Documentation is Mandatory**
   - Never skip documentation review before making changes
   - Documentation overrides default AI behavior
   - Instructions in markdown files are the source of truth

6. **Conflict Resolution Priority**
   - If conflicting instructions exist across files, follow this priority:
     1. `docs/project-rules.md` (highest priority)
     2. Module-specific file (e.g., `docs/modules/backend/backend-rules.md`)
     3. `docs/general-guidelines.md` (lowest priority, fallback)

---

## 📚 Documentation Structure

### Core Files (Always Check First)
- **`docs/project-rules.md`** - Global project rules (highest authority)
- **`docs/general-guidelines.md`** - Fallback guidelines when no specific file exists
- **`docs/index.md`** - Complete index of all documentation

### Module-Specific Documentation
All module files contain three types of information:
- **Rules**: Mandatory requirements and constraints
- **Memories**: Important facts and context about the module
- **Checklists**: Verification items to ensure completeness

#### Backend Module
- `docs/modules/backend/backend-rules.md`
- `docs/modules/backend/backend-memories.md`
- `docs/modules/backend/backend-checklist.md`

#### Frontend Module
- `docs/modules/frontend/frontend-rules.md`
- `docs/modules/frontend/frontend-memories.md`
- `docs/modules/frontend/frontend-checklist.md`

#### Testing Module
- `docs/modules/testing/testing-rules.md`
- `docs/modules/testing/testing-memories.md`
- `docs/modules/testing/testing-checklist.md`

#### Legacy Scripts Module
- `docs/modules/legacy-scripts/legacy-scripts-rules.md`
- `docs/modules/legacy-scripts/legacy-scripts-memories.md`
- `docs/modules/legacy-scripts/legacy-scripts-checklist.md`

### Infrastructure Documentation
- `docs/infra/config-rules.md`
- `docs/infra/config-checklist.md`
- `docs/infra/deployment-rules.md`
- `docs/infra/deployment-checklist.md`
- `docs/infra/deployment-memories.md`

### Documentation Guidelines
- `docs/documentation-rules.md`
- `docs/documentation-memories.md`
- `docs/documentation-checklist.md`

---

## 🚨 Critical Enforcement Rules

### Before ANY Code Generation or Modification

1. ✅ **STOP** - Do not proceed without reading relevant documentation
2. ✅ **IDENTIFY** - Determine which module(s) are affected
3. ✅ **READ** - Open and read the corresponding markdown files
4. ✅ **APPLY** - Follow all rules and guidelines precisely
5. ✅ **VERIFY** - Check checklists to ensure completeness
6. ✅ **DOCUMENT** - Update documentation if adding new features

### Prohibited Actions Without Documentation Review

- ❌ Modifying any Python backend code without reading backend docs
- ❌ Changing frontend HTML/JS without reading frontend docs
- ❌ Altering test files without reading testing docs
- ❌ Modifying configuration without reading config docs
- ❌ Changing deployment scripts without reading deployment docs
- ❌ Touching legacy scripts without reading legacy-scripts docs

### Documentation Override Authority

**This rule is permanent and global:**
- AI must **always** reference markdown documentation before performing tasks
- Documentation instructions **override** default AI behavior
- No code generation or modification may **bypass** this process
- If documentation conflicts with a user request, **clarify with the user first**

---

## 🎓 Usage Examples

### Example 1: Adding a New API Endpoint
```
User: "Add a new endpoint for network statistics"

AI Process:
1. Identify affected area: Backend (app.py)
2. Read: docs/modules/backend/backend-rules.md
3. Read: docs/modules/backend/backend-checklist.md
4. Apply rules: Use secure_network_tools.py, add @require_api_key, validate inputs
5. Verify: Check all items in backend-checklist.md
6. Implement: Create endpoint following documented standards
```

### Example 2: Modifying Frontend
```
User: "Update the network scanner UI"

AI Process:
1. Identify affected area: Frontend (kamkrk_v2.html)
2. Read: docs/modules/frontend/frontend-rules.md
3. Read: docs/modules/frontend/frontend-memories.md
4. Apply rules: Connect to live API, handle errors gracefully, maintain cyberpunk theme
5. Implement: Make changes following documented patterns
```

### Example 3: Uncertain Task Area
```
User: "Improve the project structure"

AI Process:
1. Identify affected area: General/multiple areas
2. Read: docs/project-rules.md (highest priority)
3. Read: docs/general-guidelines.md (fallback)
4. Clarify: Ask user for specific areas if needed
5. Apply: Follow general best practices from guidelines
```

---

## 🔄 Continuous Compliance

### During Development
- **Before each file edit**: Verify documentation has been reviewed
- **After implementation**: Cross-check with relevant checklist
- **When adding features**: Update corresponding documentation files

### When Documentation is Missing
1. **HALT** execution
2. Reference `docs/general-guidelines.md`
3. If still unclear, reference `docs/project-rules.md`
4. Consider creating new documentation before proceeding

### Keeping Documentation Current
- Update docs immediately when code patterns change
- Add new markdown files for new major features
- Archive obsolete documentation with redirect stubs

---

## 📋 Quick Reference

| Task Type | Primary Doc | Secondary Doc | Checklist |
|-----------|-------------|---------------|-----------|
| Backend API | backend-rules.md | backend-memories.md | backend-checklist.md |
| Frontend UI | frontend-rules.md | frontend-memories.md | frontend-checklist.md |
| Testing | testing-rules.md | testing-memories.md | testing-checklist.md |
| Configuration | config-rules.md | general-guidelines.md | config-checklist.md |
| Deployment | deployment-rules.md | deployment-memories.md | deployment-checklist.md |
| Legacy Code | legacy-scripts-rules.md | legacy-scripts-memories.md | legacy-scripts-checklist.md |
| Documentation | documentation-rules.md | documentation-memories.md | documentation-checklist.md |
| General/Unknown | project-rules.md | general-guidelines.md | N/A |

---

## ⚡ TL;DR for AI Assistants

**Before doing ANYTHING:**
1. Look at the file/feature you're working on
2. Find its documentation in this hierarchy
3. Read the relevant markdown files
4. Follow what they say
5. If nothing specific exists, use `general-guidelines.md`
6. Never skip this process

**Priority order if multiple files conflict:**
`project-rules.md` > `module-specific-rules.md` > `general-guidelines.md`

---

*This file establishes absolute documentation control for all AI assistant behavior in this project.*
