CYBER-MATRIX v8.0 — Project Requirements Document (PRD)

Source inspected: Kam.krk_v2.o-cursor-fix-dashboard-mock-data-and-initiate-scan-d803.zip (contents analyzed)
Goal: Clear product description, tech mapping for each function, and a milestone roadmap you can use as a build compass. I inspected the repo (method summary at the end) and built this PRD from the actual files — no guesswork.


---

Executive summary — what this app is (short & blunt)

CYBER-MATRIX v8.0 is a modular web dashboard and backend suite that performs system monitoring, network discovery, port and vulnerability scanning, device detection and (in the repo) both real and simulated network/security actions. The project includes:

a single-page front-end dashboard (kamkrk_v2.html) with charts and console UI,

a Flask-based API gateway (app.py) exposing many /api/... endpoints,

modular service scripts for network/discovery/wifi/detection (networks.py, detect.py, kamkrk_v2.py) and hardened/simulated replacements (*_secure.py, secure_network_tools.py),

a small SQLite DB (cyber_matrix.db) for persistence,

tests and a security validation suite.


Who it’s for: instructors, blue-team labs, security researchers running authorized experiments in controlled environments, or a defensive monitoring team wanting a lab/testbed. Not for uncontrolled offensive use. The codebase contains both vulnerable/real-operation code and safe/simulated implementations — use the secure modules for training and harden/limit anything that can execute external commands.


---

1 — High-level product description (what it does & how it functions)

Primary functions

1. Dashboard UI — real-time charts, scan results, console output, control panels (implemented in kamkrk_v2.html). Front-end polls or fetches backend APIs and renders charts (Chart.js) and interactive controls.


2. API Gateway & Orchestration — app.py is the central Flask app exposing UI endpoints and API routes for system metrics, network discovery, port/vuln scanning, attack modules, charts and console-execute (some endpoints accept JSON and return JSON).


3. Network Discovery & Device Info — modules networks.py / networks_secure.py provide local IP, router info, discovered networks and devices.


4. Device Detection & Wi-Fi Tools — detect.py / detect_secure.py and kamkrk_v2.py / kamkrk_v2_secure.py implement Wi-Fi/Android device functionalities and (in the secure files) simulations of sensitive actions.


5. Security Tools Library — secure_network_tools.py centralizes sanitized/simulated implementations (input validation, sanitized command execution, simulation results).


6. Persistence & Logging — SQLite DB cyber_matrix.db for basic persistence, plus cyber_matrix.log.


7. Automation & deployment scripts — auto-install.sh, start.sh, guides and docs.



How it functions (data flow)
UI → HTTP(S) → Flask API (app.py) → either:

orchestration code in app.py that calls internal helpers, or

dedicated microservices modules (the repo runs multiple local Flask apps on different ports for modular features) → results saved to DB/logs → UI polls/requests charts and displays results.



---

2 — Technologies underlying each major function (and purpose)

I’ve mapped technology to function so you can make engineering decisions faster.

Frontend (Dashboard)

File(s): kamkrk_v2.html

Tech: HTML/CSS with Tailwind CDN, Chart.js for charts, vanilla JS for fetch/XHR logic.

Purpose: Interactive user control, visualization of scan results, system metrics, console output.


API & Orchestration

File(s): app.py

Tech: Python 3 + Flask (core), Flask-Limiter (rate limiting), Flask-CORS/Talisman (security hardening present in requirements), standard libraries (json, threading, subprocess, logging, ipaddress)

Purpose: Main gateway exposing /api/* endpoints, coordinating scans, returning JSON for charts, running attack/conduct modules (note: some attack endpoints exist and must be locked/disabled for production).


Network/Device Modules

Files: networks.py, networks_secure.py, detect.py, detect_secure.py, kamkrk_v2.py, kamkrk_v2_secure.py

Tech: scapy (packet operations), netifaces, socket, subprocess (careful — source contains both safe and unsafe patterns), ipaddress

Purpose: Discover networks, enumerate devices, probe routers, simulate or (in insecure files) perform active operations.


Core library (secure/simulated)

File: secure_network_tools.py

Tech: Python with strict input validation, simulation logic, sanitized command wrappers, logging

Purpose: Centralized secure implementations and simulation outputs for training use — recommended as the default runtime in non-lab deployments.


Persistence & config

Files: cyber_matrix.db (SQLite), requirements.txt, start.sh, auto-install.sh

Tech: SQLite for simple persistence/logging; shell scripts for bootstrap.

Purpose: lightweight DB for scan history + scripts to install and boot.


Testing & validation

Files: test_security.py, security_validation.py

Tech: Unit tests and validators that check input sanitation, IP validation, and secure defaults.

Purpose: Provide baseline security checks — expand these.



---

3 — API & Surface map (what endpoints exist — implemented where)

I extracted and enumerated the routes in the repo. Below are the important ones (grouped). I flagged anything that executes external commands / attacks for immediate security review.

> Note: Where two variants exist (*_secure.py vs *.py) the _secure files return simulated results and include input sanitization. Prefer those for training/staging.



System & metrics (app.py)

/ → index (serves dashboard)

/api/system/metrics → returns CPU/RAM/disk metrics

/api/system/metrics/history → historical metrics

Chart feeds: /api/charts/* (scan_results, port_status, vulnerability, system_metrics)


Network discovery / device info

/api/network/scan → network range scan (app.py)

/api/network/devices → list devices on network (app.py)

networks.py and networks_secure.py expose:

/networks/discover

/ip/local

/devices/info

/router/info

/network/scan (secure)



Port & vuln scanning

/api/port/scan → port scanning (app.py)

/api/vulnerability/scan → vulnerability scan (app.py)


Console & integrations — potentially dangerous

/api/console/execute → remote console execution (HIGH RISK if enabled publicly)

/api/attack/hydra and /api/attack/metasploit → wrappers/endpoints for external attack tools (present in app.py); must be restricted to local lab or removed.


Wi-Fi & device attack endpoints (in kamkrk_v2 / detect)

/attack/deauth

/attack/wpa_psk

/detection/brute_force (simulated in secure variants)


Actionable note: any endpoint that triggers subprocess or shell=True, or runs Hydra/Metasploit, or performs deauths, must be isolated behind strong auth, network separation and allowlist of host bindings, or removed from production.


---

4 — Security posture (issues found & recommended defaults)

I found both the vulnerable and hardened implementations in the archive. The repo itself documents fixes, but do not rely on that alone. Key security points:

High-risk items (immediate attention)

Console execute endpoint (/api/console/execute) — allows execution of arbitrary commands. Either remove, restrict to localhost + strong auth + audit, or replace with a safe command sandbox that limits allowed commands.

Attack endpoints (hydra, metasploit, deauth, wpa_psk) — present; these are dual-use. Only keep as simulations (secure modules), or require multi-factor, RBAC, and out-of-band approval. Do not expose on public networks.

Subprocess usage — some modules call external commands. Confirm all use shell=False and sanitize inputs. secure_network_tools.py is a model implementation; non-secure files must be retired or hardened.

Debug/Host settings — ensure Flask debug=False and host binding 127.0.0.1 or behind a TLS-terminating reverse proxy in production.

Authentication — repo includes require_api_key decorator in places, and rate limiting. Use strong API keys or OAuth2/JWT and RBAC.

Transport Security — serve over HTTPS, enforce HSTS (Flask-Talisman present in requirements).

Secrets management — never commit keys or credentials to the repo; use environment variables or secret manager.


Good things already present

secure_network_tools.py — centralized, validated simulation code with explicit "educational use only" notes.

requirements.txt references security-minded libs (Flask-Limiter, Talisman).

Tests and security_validation.py exist — extend these.



---

5 — Functional requirements (detailed)

Below are each of the app’s core functions with what must be delivered for each, tech to use, and security acceptance checks.

A. Dashboard / UX

Deliverable: polished SPA dashboard with configurable refresh, charting, tables for networks/devices, interactive console (read-only by default).

Tech: kamkrk_v2.html, Chart.js, Tailwind CSS.

Acceptance: UI loads over HTTPS, charts update without leaking raw system commands, console does not allow command submission unless user has admin rights.


B. API Gateway

Deliverable: app.py hardened, all endpoints require authentication and rate limiting. Sensitive endpoints disabled by default.

Tech: Flask, Flask-Limiter, Flask-Talisman, environment-configured secrets.

Acceptance: All API responses sanitized; test harness confirms require_api_key enforced; rate-limit tests pass.


C. Network discovery

Deliverable: reliable discovery using scapy or nmap wrappers, returning BSSID, SSID, channel, encryption, device IP/MAC.

Tech: scapy, netifaces, modules in networks_secure.py.

Acceptance: No CLI injection paths; input IP ranges validated using ipaddress; results limited to configured network scopes.


D. Port scanner & vulnerability probe

Deliverable: scanning pipeline that runs in a sandboxed worker queue; integrates with vulnerability signature DB (or simulated for training).

Tech: Python scanner wrappers (no shell=True), worker (Celery/Redis) recommended for scaling.

Acceptance: scan requests queued, restricted, and cannot execute arbitrary OS commands; vulnerability results tagged as “simulated” unless run in approved lab mode.


E. Attack simulation & detection

Deliverable: only simulated attack operations for training by default (implementations in *_secure.py); toggle to real tools only in isolated lab with explicit opt-in.

Tech: secure_network_tools.py (simulations)

Acceptance: Simulation mode cannot be switched to live automatically; enabling live mode requires environment flag + admin acknowledgement + legal policy acceptance popup.


F. Persistence & history

Deliverable: Schema for SQLite or better (Postgres recommended for production); audit trails for commands and API calls.

Tech: SQLite for dev, Postgres for production; migrations with Alembic.

Acceptance: audit logs immutable, rotation/policy in place, data retention policy documented.



---

6 — Non-functional requirements

Auth & RBAC: All endpoints require auth. Admin vs operator vs viewer roles. /api/console/execute only admin.

Secure defaults: Bind services to 127.0.0.1, run behind reverse proxy, enforce TLS, HSTS, CSP.

Rate limiting: Global and per-IP limits on intensive endpoints (Flask-Limiter present).

Input validation: Use ipaddress and strict whitelists for allowed characters. All user inputs sanitized.

Test coverage: >90% for sanitizers, 80% for API endpoints (mock secure modules).

Observability: Structured logs, rotating, with metrics endpoint for Prometheus.

Deployment: Docker images with minimal base, image scanning in CI.



---

7 — Project milestone stages (the compass)

I will not give you an ETA, but this ordered milestone list with tasks and acceptance criteria is your engineering compass. Execute them sequentially and mark done only when acceptance criteria pass.

Milestone 0 — Repository audit & safety lockdown (Immediate)

Tasks

Identify and disable any public-facing console/execute and attack/* endpoints (comment them out or gate behind LAB_MODE environment variable set to false).

Force debug=False and bind to 127.0.0.1.

Ensure require_api_key decorates all non-public endpoints; rotate API keys.

Add startup check: if LIVE_ATTACKS_ENABLED is true, require FORCE_APPROVAL=true env var + admin CLI acceptance.


Deliverables

Hardened branch safe/default with attack endpoints disabled.

PR with diff and tests showing endpoints return 403 when not authorized.


Acceptance

Automated test asserts console/execute returns 403 when LAB_MODE=false.



Milestone 1 — Secure core & simulation-first architecture

Tasks

Make secure_network_tools.py the default backend for UI calls.

Refactor app.py to call secure modules by default; keep legacy modules in /legacy/.

Add environment-based feature flag: MODE=simulation|lab|production.


Deliverables

app.py new flow, docs updated.


Acceptance

UI returns simulation results by default; no subprocess calls triggered in normal runs.



Milestone 2 — Authentication & RBAC

Tasks

Implement OAuth2/JWT or API key + RBAC module; integrate with require_api_key.

Add Admin console for key management; audit logs for token issuance.


Deliverables

Auth middleware, tests, and docs.


Acceptance

Role-based unit tests proving viewer cannot access admin endpoints.



Milestone 3 — Queueing & sandboxed execution

Tasks

Move heavy/long scans into a worker queue (Celery/Redis or RQ).

No direct synchronous subprocess execution from request threads.


Deliverables

Worker service, task monitor endpoints, job status APIs.


Acceptance

Stress test shows API remains responsive during heavy scans.



Milestone 4 — CI/CD, containerization & image security

Tasks

Add Dockerfile, docker-compose for dev, GitHub Actions CI for tests, dependabot/Snyk checks.

Image scanning in pipeline.


Deliverables

Build pipelines with gates (no merges if security checks fail).


Acceptance

Passing CI with vulnerability threshold defined.



Milestone 5 — Hardening & compliance

Tasks

Add TLS, CSP, HSTS, secure cookie flags, secret management.

Run SAST (Bandit, Flawfinder) and DAST in staging.


Deliverables

Security checklist, remediation PRs.


Acceptance

Zero critical findings in final scan.



Milestone 6 — Observability & logging

Tasks

Add structured logs, rotate, ship to centralized store; add Prometheus exporter.


Deliverables

Dashboards for uptime/throughput/errors.


Acceptance

Alert configured for anomaly detection.



Milestone 7 — Documentation, training & licensing

Tasks

Finalize README, INSTALL, DEPLOYMENT_GUIDE, USER_INSTRUCTIONS, a short legal/acceptable-use policy for lab.

Training mode docs for instructors: how to create simulation scenarios.


Deliverables

Docs, a short tutorial for safe lab usage, and a license file.


Acceptance

Dry-run training session without a single command executing external tools.



Milestone 8 — Production readiness / staged rollout

Tasks

Deploy to staging, do pen-test in isolated lab, run acceptance tests.


Deliverables

Rollout checklist, runbook, incident response plan.


Acceptance

Staging pen-test completed; fixes merged; sign-off from security owner.




---

8 — Immediate action plan (what to run right now)

1. Check out a safe/default branch and force the app to use secure_network_tools.py and _secure modules by default. Confirm UI calls route to those modules.


2. Disable or gate /api/console/execute, /api/attack/* behind LAB_MODE = true.


3. **Set DEBUG=False and bind to 127.0.0.1** in all start scripts (start.shetc.). Add runtime check: refuse0.0.0.0unlessFORCE_BIND` is set.


4. Run security validation tests: python3 test_security.py and inspect failures — fix inputs that allow injection.


5. Add auth: enforce require_api_key on all endpoints; rotate keys.


6. Add CI test that runs security_validation.py & test_security.py on each PR.


7. Document in the repo root: USAGE_POLICY.md with explicit allowed use and requirement for authorized tests.




---

9 — File inventory (quick map of repo files -> role)

app.py — Main Flask gateway (charts, orchestration, attack endpoints present). Primary control point.

kamkrk_v2.html — Frontend dashboard (charts, console). Uses Chart.js and Tailwind.

kamkrk_v2.py / kamkrk_v2_secure.py — Wi-Fi / Android modules (vulnerable vs secure/simulated).

detect.py / detect_secure.py — Device detection (vuln vs sim).

networks.py / networks_secure.py — Network discovery and scanning (vuln vs sim).

secure_network_tools.py — Central secured/simulated library — use this by default.

test_security.py, security_validation.py — Tests and validation helpers.

requirements.txt — dependencies (scapy, Flask, Flask-Limiter, Flask-Talisman, etc.)

auto-install.sh, start.sh — installation & startup scripts.

cyber_matrix.db, cyber_matrix.log — DB & log (local).

*.md — docs: README, PROJECT_SUMMARY, INSTALLATION_GUIDE, SECURITY_REPORT, DEPLOYMENT_GUIDE, TROUBLESHOOTING_GUIDE, USER_INSTRUCTIONS.



---

10 — Alternatives & future architecture ideas (brief)

Replace SQLite with Postgres for concurrency/scale and to enable row-level auditing.

Microservices: keep the modular Flask apps but containerize each module with clear API contracts. Use an API gateway (e.g., Traefik) and mutual TLS between services.

Queueing & sandboxing: task queue (Celery) with resource-limited containers for any risky action.

Auth: OAuth2 + short-lived tokens and RBAC (Keycloak or Auth0 for production).

Telemetry: Prometheus + Grafana + centralized logging (ELK or Loki).

Simulate-first mindset: Ship simulation modules as default; allow live lab mode with attestation and audit.



---

11 — How I inspected the repo (step-by-step, so you can reproduce)

I performed an automated static inspection of the archive to extract the facts above:

1. Opened the zip and enumerated files under Kam.krk_v2.../.


2. Parsed Python files for @app.route decorators to build a route map and identify dangerous endpoints (console/attack endpoints).


3. Reviewed requirements.txt to list tech dependencies.


4. Located _secure.py and secure_network_tools.py to identify the safe/simulated implementations vs the potentially dangerous ones (kamkrk_v2.py, detect.py, networks.py).


5. Read SECURITY_REPORT.md and PROJECT_SUMMARY.md to confirm repo claims and cross-checked that secure modules exist.


6. Scanned HTML for UI element IDs and chart placeholders to understand front-end surface and mapping toward backend chart endpoints.



(If you want the raw route extraction I used — formatted as a JSON or CSV — I can paste it in the repo or produce a file. Note: I will not include step-by-step commands for activating attack modules or show exploit commands — that’s intentional and safe.)


---

12 — Practical summary / immediate checklist you can apply in 30–60 minutes

[ ] Create branch safe/default and force UI → secure modules.

[ ] Ensure DEBUG=False & host=127.0.0.1 in scripts.

[ ] Gate or disable /api/console/execute and /api/attack/*.

[ ] Run python3 test_security.py and fix failures.

[ ] Add API key enforcement to any unprotected endpoint.

[ ] Add a short USAGE_POLICY.md clarifying authorized/enforced use and liability.

[ ] Add CI job that runs tests + static analyzer (Bandit).



---

Final candid note (because you asked me to tell it like it is)

This repo looks like a near-complete, flashy training/monitoring dashboard — but it contains dual personalities: one side is a hardened simulation-first system (*_secure.py, secure_network_tools.py), and the other side keeps real tools and endpoints that can execute system commands and external attack tools. If you ship the “real” endpoints without strict controls you’ll be shipping a weapon. If you convert this to a simulation-first lab platform, it becomes an excellent teaching tool. I recommend the latter as the default posture.

If you want, I can now:

generate a safe branch patch that toggles the app to simulation-first (edits to app.py + start.sh + a MODE env-check), or

produce an endpoint inventory CSV listing every route, its file, and a severity flag (safe/simulated/risky).


Pick one and I’ll produce it instantly. No waiting, no background jobs.


