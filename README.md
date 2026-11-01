# ⚡ EduPulse — Intelligent Campus Analytics & Marksheet Portal
> **A high-performance, modular autonomous college portal featuring D3.js Visualizations, UGC 10-Point Grading, Faculty Assignment Grading, AI Academic Explainer, and Institutional Fee Tracking.**

[![GitHub Repository](https://img.shields.io/badge/GitHub-udaykumarreddy07%2FD3project-blue?logo=github)](https://github.com/udaykumarreddy07/D3project)
[![Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20D3.js%20v7%20%7C%20CSS3%20%7C%20Node.js-green)]()
[![Grading Standard](https://img.shields.io/badge/Standard-UGC%2010--Point%20CBCS-orange)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

---

## 📑 Table of Contents
1. [Overview & Highlights](#-1-overview--highlights)
2. [High-Level Architecture](#-2-high-level-architecture)
3. [System Workflows](#-3-system-workflows)
   - [A. Assignment Management & Grading Workflow](#a-assignment-management--grading-workflow)
   - [B. Student Fee Realization & Hall Ticket Workflow](#b-student-fee-realization--hall-ticket-workflow)
   - [C. AI Explainer & Academic Copilot Workflow](#c-ai-explainer--academic-copilot-workflow)
   - [D. Marksheet Generation & UGC 10-Point Evaluation](#d-marksheet-generation--ugc-10-point-evaluation)
4. [Modular Directory Structure](#-4-modular-directory-structure)
5. [Module-by-Module Technical Deep Dive](#-5-module-by-module-technical-deep-dive)
6. [Role-Based Access Control (RBAC)](#-6-role-based-access-control-rbac)
7. [Getting Started & Local Setup](#-7-getting-started--local-setup)
8. [Demo Credentials](#-8-demo-credentials)
9. [Presentation & Export Assets](#-9-presentation--export-assets)

---

## 🌟 1. Overview & Highlights

This project is an **Autonomous College Academic Operations & Analytics Portal**. It unifies academic cohort tracking, continuous internal evaluation, financial clearances, and real-time guidance into a single web application:

1. **Zero-Framework Vanilla Core**:
   - Engineered in pure semantic HTML5, modern CSS3 (Custom Properties, Glassmorphism, Print CSS), and ES6+ JavaScript.
   - Powered by **D3.js v7** for data visualization without heavy framework overhead.
2. **Dual-Role RBAC (Faculty vs. Student)**:
   - 👨‍🏫 **Faculty Portal**: Live cohort KPI cards, full CRUD student record management, real-time score simulator, assignment creator with evaluation rubrics, student submission grading modal with live feedback, and cohort fee audit monitor.
   - 🎓 **Student Portal**: Personalized GPA/CGPA summary, D3 radar proficiency chart, assignment submission portal with marks/feedback view, itemized fee schedule, self-reporting payment ledger, official verifiable receipts, and autonomous exam hall ticket release.
3. **AI Explainer & Academic Copilot**:
   - Built-in contextual AI mentor for both faculty (cohort interventions, assignment rubrics, UGC regulation queries) and students (concept explanations, SGPA improvement plans, examination eligibility).
4. **Institutional Fee Management**:
   - Clear itemized fee schedules ("what fees they have to pay").
   - Offline & online transaction self-reporting ("record what fees they paid" with UTR, bank challan, or counter receipts).
   - Tamper-evident printable institutional receipts, passbook transaction logs, and annual fee statements.
5. **Print-Ready Academic Marksheets**:
   - Pixel-perfect `@media print` CSS for authentic university marksheet cards formatted for standard A4 printing.

---

## 🏗️ 2. High-Level Architecture

The system follows a clean **3-Tier Modular Architecture** separated into `frontend`, `backend`, and `database`:

```mermaid
graph TD
    subgraph Presentation ["Presentation Layer (frontend/)"]
        UI["Semantic HTML5 Shell (frontend/index.html & template.html)"]
        CSS["Modular CSS System (frontend/css/)"]
        D3["D3.js v7 Visualization Engine"]
        CONTROLLER["Client Controllers (frontend/js/)"]
    end

    subgraph Service ["Backend & API Layer (backend/)"]
        SERVER["HTTP & REST Server (backend/server.js)"]
        API["REST APIs (/api/students, /api/analytics, /api/arrears)"]
        BUILD["Asset Bundler (backend/build.js)"]
        REPORT["CLI Audit Engine (backend/report.js)"]
    end

    subgraph Storage ["Database & Storage Layer (database/)"]
        DB["Data Access Object DAO (database/db.js)"]
        STORE["Master Cohort Store (database/students.json)"]
        SCHEMA["Data Validation Schema (database/schema.json)"]
        LS["localStorage (Offline Client Fallback)"]
    end

    UI --> CSS
    UI --> CONTROLLER
    CONTROLLER --> D3
    CONTROLLER -.->|Fetch/Sync| API
    CONTROLLER --> LS
    SERVER --> API
    API --> DB
    BUILD --> UI
    REPORT --> DB
    DB --> STORE
```

---

## 🔄 3. System Workflows

### A. Assignment Management & Grading Workflow
Faculty can assign coursework with start and end dates visible to all students; students can submit their work directly from their dashboard; faculty can inspect and grade every submission with feedback:

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as 👨‍🏫 Faculty
    actor Student as 🎓 Student
    participant Hub as 📋 Assignment System (assignments.js)
    participant Storage as 💾 LocalStorage / State

    Faculty->>Hub: Create Assignment (Title, Dept, Start Date, End Date, Max Marks, Rubric)
    Hub->>Storage: Save Assignment to System Database
    Storage-->>Hub: Broadcast update to Cohort
    Student->>Hub: Switch to 'Assignments' Tab
    Hub-->>Student: Display Active, Upcoming & Graded Assignments
    Student->>Hub: Submit Solution (Repository Link / Notes)
    Hub->>Storage: Store Submission (Status: 'SUBMITTED', Timestamp)
    Faculty->>Hub: Open 'Review & Grade Submissions' Modal
    Hub-->>Faculty: Display Submissions for each Student
    Faculty->>Hub: Enter Awarded Marks & Feedback Note
    Hub->>Storage: Update Submission (Status: 'GRADED', Marks, GradedAt)
    Student->>Hub: View Updated Score, Performance Badge & Feedback
```

---

### B. Student Fee Realization & Hall Ticket Workflow
Students review their fee schedule, record payments made via bank challan/counter/UPI, inspect verified receipts, and automatically unlock their autonomous semester examination hall ticket:

```mermaid
flowchart TD
    A[Student Enters 'Fees & Dues' Tab] --> B{Review Statutory Fee Schedule}
    B -->|Check Itemized Heads| C[Tuition, Autonomous Exam, Lab, Library, Campus Tech]
    C --> D{Are Dues Pending?}
    
    D -->|Yes: Exam Fee Pending ₹2,500| E[Hall Ticket Withheld / Locked]
    E --> F[Student Records Paid Fee: Bank Challan / Counter Cash / UTR Ref]
    F --> G[Submit '+ Record Paid Fee' Modal]
    G --> H[Update Fee Database & Transaction Ledger]
    H --> I[Generate Official Verifiable Institutional Receipt]
    
    D -->|No: Outstanding = ₹0| J[Clearance Verified: 100% Realized]
    H --> J
    J --> K[🎉 Semester Examination Hall Ticket UNLOCKED]
    K --> L[View & Download Official Admit Card PDF]
```

---

### C. AI Explainer & Academic Copilot Workflow
The dual-engine AI assistant serves both user personas with zero setup:

```mermaid
flowchart LR
    A[User clicks '🤖 AI Explainer' floating action button or header pill] --> B{Detect Active Role}
    
    B -->|Faculty Persona| C[Analytics & Academic Copilot]
    C --> C1[Identify At-Risk Students & Remedial Plans]
    C --> C2[Generate Assignment Evaluation Rubrics]
    C --> C3[Analyze Subject-Wise Grade Bottlenecks]
    
    B -->|Student Persona| D[Academic Mentor & Doubt Solver]
    D --> D1[Explain Core Engineering Concepts]
    D --> D2[Calculate Required Exam Marks for CGPA Goals]
    D --> D3[Check Attendance & Hall Ticket Regulations]
```

---

### D. Marksheet Generation & UGC 10-Point Evaluation

```mermaid
flowchart TD
    A[Raw Student Subject Marks: 0 - 100] --> B[Evaluate Subject Minimum Threshold: &ge; 35 marks]
    B -->|Any Subject < 35| C[Subject Status: Fail / Arrear - GP: 0]
    B -->|All Subjects &ge; 35| D[Map to UGC 10-Point Scale]
    
    D --> E[O: 90-100 / A+: 80-89 / A: 70-79 / B+: 60-69 / B: 50-59 / C: 40-49 / P: 35-39]
    E --> F["Calculate SGPA = &sum;(Credits &times; GP) / &sum;Credits"]
    F --> G[Determine Division: Distinction / First Class / Second Class / Pass]
    G --> H[Render Official Marksheet Modal with College Seal & QR Code]
    H --> I[Print-ready via Ctrl+P or 'Print Marksheet' button]
```

---

## 📁 4. Modular Directory Structure

```
D3project/
├── frontend/                                    # 🎨 Presentation & Client UI Layer
│   ├── index.html                               # Production web application entry point
│   ├── template.html                            # Modular development template
│   ├── uday.html                                # Standalone offline distribution bundle
│   ├── hardcopy.html                            # Print-ready university grade report
│   ├── kare-logo.png                            # Official KARE University emblem
│   ├── d3.v7.min.js                             # D3.js v7 local offline fallback library
│   ├── css/                                     # 🎨 Modular Stylesheets
│   │   ├── styles.css                           # Design tokens, variables, buttons & tooltips
│   │   ├── auth.css                             # Aurora glassmorphism authentication gateway
│   │   ├── dashboard.css                        # Layout grid, KPI cards & table dock
│   │   ├── charts.css                           # D3.js SVG chart containers & legends
│   │   ├── marksheet.css                        # UGC Progress Card & @media print styles
│   │   ├── assignments.css                      # Coursework submission & grading modals
│   │   ├── fees-notices.css                     # Fee ledger, digital passbook & admit cards
│   │   └── ai-explainer.css                     # Dual-persona AI Copilot floating panel
│   ├── js/                                      # ⚡ Client Controllers & Engines
│   │   ├── app.js                               # Main bootstrap & event dispatch
│   │   ├── auth.js                              # Session management & RBAC switching
│   │   ├── charts.js                            # D3 visualizations (Donut, Bar, Scatter, Radar)
│   │   ├── data.js                              # Default cohort constants & course maps
│   │   ├── marksheet.js                         # UGC 10-point GPA & SGPA calculation engine
│   │   ├── ui.js                                # Dynamic KPI cards, cohort filters & sorting
│   │   ├── assignments.js                       # Coursework intake & faculty evaluation
│   │   ├── fees-notices.js                      # Fee schedule, offline receipts & hall tickets
│   │   ├── ai-explainer.js                      # Dual-persona AI academic mentor
│   │   └── database.js                          # Client-side localStorage persistence engine
│   └── presentation/                            # 📽️ Slide Presentation Subsystem
│       └── index.html                           # 10-slide HTML presentation with live D3 charts
│
├── backend/                                     # ⚙️ Application Server & Services Layer
│   ├── server.js                                # Zero-dependency HTTP & REST API server
│   ├── build.js                                 # Production bundler for single-file compilation
│   ├── report.js                                # CLI terminal academic audit utility
│   ├── generate_ppt.js                          # Automated PowerPoint deck generator
│   ├── generate_hardcopy_pdf.js                 # Headless print engine for A4 PDF reports
│   └── capture_dashboards.js                    # Automated screenshot capture utility
│
├── database/                                    # 🗄️ Database & Persistence Layer
│   ├── students.json                            # Master cohort JSON dataset (22 students)
│   ├── db.js                                    # Node.js DAO (CRUD, queries, cohort analytics)
│   ├── schema.json                              # JSON Schema validation specification
│   └── README.md                                # Database layer documentation & usage
│
├── package.json                                 # Project dependencies and script runner
├── README.md                                    # GitHub repository guide
└── vercel.json                                  # Production deployment routing
```

---

## 🧠 5. Module-by-Module Technical Deep Dive

| Module | Location | Primary Responsibilities |
|---|---|---|
| **Database DAO** | [`database/db.js`](database/db.js)<br>[`database/students.json`](database/students.json) | High-performance data access layer providing CRUD operations, cohort analytics calculation, arrears filtering, and topper ranking. |
| **Backend REST API** | [`backend/server.js`](backend/server.js) | Serves frontend static files and exposes REST endpoints (`/api/students`, `/api/analytics`, `/api/arrears`, `/api/toppers`). |
| **CLI Academic Audit** | [`backend/report.js`](backend/report.js) | Terminal reporting tool with flags for department filters (`--dept`), arrears (`--arrears`), and toppers (`--toppers`). |
| **Assignment Hub** | [`frontend/js/assignments.js`](frontend/js/assignments.js)<br>[`frontend/css/assignments.css`](frontend/css/assignments.css) | Handles faculty assignment authoring (title, start date, due date, max marks, rubrics), student submission intake, and grading modal. |
| **Fees & Passbook** | [`frontend/js/fees-notices.js`](frontend/js/fees-notices.js)<br>[`frontend/css/fees-notices.css`](frontend/css/fees-notices.css) | Powers student fee schedules, self-reported offline payment recording, passbook ledger, printable receipts, and exam hall ticket clearance. |
| **AI Academic Copilot** | [`frontend/js/ai-explainer.js`](frontend/js/ai-explainer.js)<br>[`frontend/css/ai-explainer.css`](frontend/css/ai-explainer.css) | Powers floating dual-role academic advisor with automated response engines for student doubts and faculty cohort diagnostics. |
| **D3 Visualizations** | [`frontend/js/charts.js`](frontend/js/charts.js)<br>[`frontend/css/charts.css`](frontend/css/charts.css) | Implements D3.js coordinate scales, pie/donut charts, correlation scatter plots, and student radar proficiencies. |
| **UGC Marksheets** | [`frontend/js/marksheet.js`](frontend/js/marksheet.js)<br>[`frontend/css/marksheet.css`](frontend/css/marksheet.css) | Computes UGC 10-point GP, SGPA, and renders tamper-proof progress cards with university seals, QR verification, and print styles. |
| **Authentication** | [`frontend/js/auth.js`](frontend/js/auth.js)<br>[`frontend/css/auth.css`](frontend/css/auth.css) | Manages quick-login presets, session tokens, and dynamic role-based UI switching (`applyRoleBasedUI`). |

---

## 🔐 6. Role-Based Access Control (RBAC)

The portal implements strict client-side role differentiation:

```
┌─────────────────────────────────┬─────────────────┬─────────────────┐
│ Feature / Capability            │ Faculty / Admin │ Student         │
├─────────────────────────────────┼─────────────────┼─────────────────┤
│ Cohort KPI Metrics & Overview   │ ✅ Yes          │ ❌ Restricted   │
│ Full Student CRUD (Add/Edit/Del)│ ✅ Yes          │ ❌ Restricted   │
│ Live Score Simulator            │ ✅ Yes          │ ❌ Restricted   │
│ Batch Marksheet Generator       │ ✅ Yes          │ ❌ Restricted   │
│ Create Assignments & Set Dates  │ ✅ Yes          │ ❌ Restricted   │
│ Review & Grade Submissions      │ ✅ Yes          │ ❌ Restricted   │
│ Submit Coursework / Assignments │ ❌ Restricted   │ ✅ Yes          │
│ Personalized SGPA & Radar Chart │ ❌ Restricted   │ ✅ Yes          │
│ Record Paid Fee / Self-Report   │ ❌ Restricted   │ ✅ Yes          │
│ Official Marksheet & Admit Card │ 👁️ View Batch   │ 📄 Personal     │
│ AI Academic Copilot             │ 📊 Analytics    │ 🎓 Doubt Mentor │
└─────────────────────────────────┴─────────────────┴─────────────────┘
```

---

## 🚀 7. Getting Started & Local Setup

### Prerequisites
- Node.js (v14+ recommended) or any static HTTP web server.

### 1. Clone the Repository
```bash
git clone https://github.com/udaykumarreddy07/D3project.git
cd D3project
```

### 2. Start the Local Server
```bash
npm run dev
```
The server will start at **`http://localhost:3000`** (or next available port).

### 3. Build & Synchronize Distribution Bundle
If you modify modular files in `css/` or `js/`, synchronize the all-in-one `uday.html` bundle with:
```bash
npm run build
```

### 4. Run Instant CLI Terminal Report
Generate an instantaneous terminal audit without starting a browser:
```bash
npm run report
```
*Filter by department*: `node report.js --dept CSE`  
*Show only backlogs/arrears*: `node report.js --arrears`  
*Show toppers*: `node report.js --toppers`

---

## 🔑 8. Demo Credentials

The portal includes one-click instant demo login chips on the login screen:

| Role | Username | Password | Default Student Profile |
|---|---|---|---|
| **Faculty / Admin** | `admin` | `admin123` | Full Autonomous Academic Control |
| **Student (Topper)** | `sneha` | `pass123` | **Sneha Devi** (Roll: 22A91A0504, Dept: CSE, Grade: O, SGPA: 9.80) |
| **Student** | `arun` | `pass123` | **Arun Kumar** (Roll: 22A91A0501, Dept: CSE, Grade: A+, SGPA: 9.20) |

---

## 📽️ 9. Presentation & Export Assets

- 🌐 **[`presentation.html`](presentation.html)**: Interactive browser slide presentation containing an embedded interactive D3 bar graph with live data toggling.
- 📊 **[`Academic_Analytics_Portal_Presentation.pptx`](Academic_Analytics_Portal_Presentation.pptx)**: 10-slide 16:9 widescreen PowerPoint deck with native editable charts.
- 📑 **[`uday.html`](uday.html)**: Standalone single-file build capable of running offline on any browser without server dependencies.

---

### 👨‍💻 Developed by
**Uday Kumar Reddy**  
Autonomous Academic Systems & Web Development  
GitHub: [@udaykumarreddy07](https://github.com/udaykumarreddy07)
