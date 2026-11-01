# ⚙️ Backend Layer — EduPulse

This directory contains the Node.js application server, RESTful API endpoints, automated reporting tools, build utilities, and document generation engines for the EduPulse Academic Portal.

---

## 📂 File Overview

| File | Description |
|---|---|
| `server.js` | Zero-dependency HTTP & REST API server serving `frontend/` static files and `/api/*` endpoints |
| `build.js` | Production bundler compiling modular HTML, CSS, JS, and base64 assets into single-file bundles |
| `report.js` | Terminal CLI academic audit tool for viewing cohort pass rates, department metrics, arrears, and toppers |
| `generate_ppt.js` | Automated 10-slide PowerPoint (`.pptx`) deck generator using `pptxgenjs` |
| `generate_hardcopy_pdf.js` | Headless Chrome print driver generating high-resolution A4 university marksheet PDFs |
| `capture_dashboards.js` | Puppeteer automation script capturing portal screenshots |

---

## 📡 REST API Specifications

The backend server exposes the following JSON endpoints:

### 1. Cohort Analytics
- **`GET /api/analytics`**
  - Returns total students, pass percentage, class average, department breakdown, subject averages, and valedictorian.

### 2. Student Records (CRUD)
- **`GET /api/students`** — Retrieve all student records (Optional query: `?department=CSE`).
- **`GET /api/students/:id`** — Retrieve a specific student by ID or roll number.
- **`POST /api/students`** — Create a new student record (JSON payload).
- **`PUT /api/students/:id`** — Update an existing student record (JSON payload).
- **`DELETE /api/students/:id`** — Remove a student record.

### 3. Specialized Academic Filters
- **`GET /api/arrears`** — Returns students scoring `< 35` in any subject (requiring remedial intervention).
- **`GET /api/toppers?limit=5`** — Returns top rank holders sorted by overall aggregate score.
- **`GET /api/health`** — Health check endpoint returning server status and timestamp.

---

## 💻 CLI Commands

Run these from the project root:

```bash
# Start backend server with browser auto-launch
npm run dev

# Run CLI terminal audit
npm run report

# Filter report by department
node backend/report.js --dept CSE

# Show students with arrears
node backend/report.js --arrears

# Show academic toppers
node backend/report.js --toppers

# Rebuild standalone bundle
npm run build
```

