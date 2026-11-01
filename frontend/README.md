# 🎨 Frontend Layer — EduPulse

This directory contains all client-facing assets, user interfaces, D3.js visualization engines, and modular stylesheets for the EduPulse Academic Portal.

---

## 📂 Directory Structure

```
frontend/
├── index.html          # Bundled web application entry point
├── template.html       # Modular development template (links to css/ and js/)
├── uday.html           # Standalone offline distribution bundle
├── hardcopy.html       # Print-ready university grade report
├── kare-logo.png       # Official KARE University emblem
├── d3.v7.min.js        # Offline fallback library for D3.js v7
│
├── css/                # 🎨 Modular Stylesheets
│   ├── styles.css      # Core theme, variables, typography, and button tokens
│   ├── auth.css        # Glassmorphic aurora authentication gateway
│   ├── dashboard.css   # Main layout grid, navigation, KPI cards, tables
│   ├── charts.css      # D3 chart container dimensions, legends, tooltips
│   ├── marksheet.css   # UGC 10-Point Progress Card & @media print styles
│   ├── assignments.css # Assignment submission cards & grading modals
│   ├── fees-notices.css# Digital fee passbook & admit card generation
│   └── ai-explainer.css# Dual-persona AI Copilot floating panel
│
├── js/                 # ⚡ Client Controllers & Engines
│   ├── app.js          # Main bootstrap, event listeners, and navigation
│   ├── auth.js         # Authentication state, RBAC & Google Sign-In emulation
│   ├── charts.js       # D3.js visualizations (Donut, Bar, Scatter, Radar)
│   ├── data.js         # Default cohort constants and schema helpers
│   ├── marksheet.js    # UGC 10-point SGPA/CGPA evaluation engine
│   ├── ui.js           # Dynamic KPI cards, cohort table filtering & sorting
│   ├── assignments.js  # Coursework management & grading workflows
│   ├── fees-notices.js # Fee dues ledger, offline receipts & hall ticket gating
│   ├── ai-explainer.js # Dual-persona academic copilot logic
│   └── database.js     # Client-side localStorage persistence engine
│
├── presentation/       # 📽️ Interactive Presentation Slides Deck
│   └── index.html      # 10-slide HTML presentation with live embedded D3 charts
│
└── previews/           # 📸 Dashboard preview screenshots
```

---

## 🚀 Running the Frontend

### 1. Via the Backend Server (Recommended)
From project root:
```bash
npm run dev
# Serves the frontend at http://localhost:3000
```

### 2. Standalone / Offline
Double-click `frontend/uday.html` or `frontend/index.html` to open directly in any modern browser without requiring Node.js or internet connectivity.

