# 🎓 Academic Analytics & Marksheet Portal — Complete Beginner's Guide

> **A quick, complete learning manual covering project architecture, tools, UGC grading rules, and D3.js data visualization.**

---

## 🌟 1. Project Overview & Problem Solved
This project is an **Autonomous College Academic Analytics & Marksheet Portal** built for university faculty and students.
- **Problem**: University student performance data is often trapped in static spreadsheets with no visual insights, and generating official marksheets with GPA and UGC grades requires tedious manual work.
- **Solution**: An all-in-one web portal that turns student exam marks into **real-time D3.js interactive charts** and generates **official, A4 print-ready UGC semester marksheets** with single-click PDF export.

---

## 🛠️ 2. Tools & Technologies Used
```
+---------------------------------------------------------------------------------------------------+
| HTML5 (Semantic Structure)  -> Defines layouts, data tables, SVG holders, and modal dialogs.      |
| CSS3 (Glassmorphism & Print)-> Glassmorphism styling, glowing Aurora animations, & @media print.  |
| JavaScript (ES6+ Vanilla)   -> Core logic: array methods (.map, .filter, .reduce), sorting & CRUD |
| D3.js (v7 SVG Visualizer)   -> Dynamic vector charts: Subject Bar, Pass/Fail Donut, Scatter Plot. |
| Web Storage (LocalStorage)  -> 3-tier resilient storage to preserve student edits across reloads. |
| Node.js & PptxGenJS         -> Automated generation of 10-slide PowerPoint presentation deck.     |
+---------------------------------------------------------------------------------------------------+
```

---

## 📁 3. Project Directory & File Architecture
```
D3project/
├── index.html            # Main web portal entry point (open in any browser)
├── presentation.html     # Interactive web presentation with live animated D3 chart
├── Academic_Analytics... # 10-slide PowerPoint presentation deck (.pptx)
├── BEGINNER_GUIDE.md     # This complete beginner reference guide
├── generate_ppt.js       # Node.js script to compile the PowerPoint presentation
│
├── css/                  # 🎨 [Styling Layer]
│   ├── styles.css        # Global CSS variables, design tokens, buttons, and toasts
│   ├── auth.css          # Full-screen glowing Aurora login gateway and glass cards
│   ├── dashboard.css     # KPI summary cards, filter bars, and sortable data table
│   ├── charts.css        # D3.js SVG chart wrappers, axis lines, and tooltips
│   └── marksheet.css     # Official UGC progress card styling and A4 @media print rules
│
├── js/                   # ⚡ [Application Logic Layer]
│   ├── data.js           # 22-student cohort dataset and safe LocalStorage wrapper
│   ├── auth.js           # Role-Based Access Control (RBAC), login sessions, and tokens
│   ├── marksheet.js      # UGC 10-point GPA calculation and progress card modal builder
│   ├── ui.js             # Table rendering, live search, multi-column sort, and KPI math
│   ├── charts.js         # 4 interactive D3.js visualizations and animated transitions
│   └── app.js            # Main bootstrap orchestrator, CRUD handlers, and live simulator
│
└── data/students.json    # Standalone JSON export of the 22-student cohort dataset
```

---

## 🧠 4. Core Features & Business Logic

### A. Dual-Role Access Control (RBAC)
- **👨‍🏫 Faculty (`admin` / `admin123`)**: Full cohort view, KPI metrics, CRUD (Add/Edit/Delete), Live Score Simulator, and CSV export.
- **🎓 Student (`sneha` / `pass123`)**: Private personalized scorecard, subject radar proficiency chart, attendance gauge, and marksheet download.

### B. UGC 10-Point Letter Grading System
The portal strictly implements the Indian UGC academic standard across 4 subjects (Maths, Science, English, Programming):

| Marks Range | Letter Grade | Grade Point (GP) | Classification | Status |
|:---:|:---:|:---:|---|:---:|
| **90 – 100** | **O** | **10** | Outstanding | Passed (Distinction) |
| **80 – 89** | **A+** | **9** | Excellent | Passed (First Class) |
| **70 – 79** | **A** | **8** | Very Good | Passed (First Class) |
| **60 – 69** | **B+** | **7** | Good | Passed (Second Class) |
| **50 – 59** | **B** | **6** | Above Average | Passed (Second Class) |
| **40 – 49** | **C** | **5** | Average | Passed (Pass Division) |
| **35 – 39** | **P** | **4** | Pass Threshold | Passed (Pass Division) |
| **0 – 34** | **F** | **0** | Fail / Re-appear | **FAILED (Backlog)** |

- **Pass Rule**: Student must score $\ge 35$ in **all 4 subjects**. If any subject is $< 35$, the result is **FAIL (F)**.
- **SGPA Formula**: $\text{SGPA} = \frac{\sum (\text{Credits}_i \times \text{GP}_i)}{\sum \text{Credits}_i} = \frac{(4 \times \text{GP}_{\text{Math}}) + (4 \times \text{GP}_{\text{Sci}}) + (3 \times \text{GP}_{\text{Eng}}) + (4 \times \text{GP}_{\text{Prog}})}{15}$

---

## 📊 5. How D3.js Visualizations Work
1. **Coordinate Scales**: `d3.scaleBand()` maps department/subject names to X-coordinates; `d3.scaleLinear()` maps marks (0–100) to Y-pixel heights.
2. **Data-Join (`.data().enter().append()`)**: Connects raw student data arrays to real SVG elements (`<rect>`, `<path>`, `<circle>`).
3. **Smooth Animations**: `.transition().duration(800)` animates rising bars and expanding donut slices dynamically.
4. **4 Interactive Charts**:
   - **Subject Average Bar Chart**: Shows cohort averages; clicking a bar sorts the table by that subject.
   - **Grade Donut Chart**: Shows grade distributions; clicking a slice filters the table by grade.
   - **Attendance vs Performance Scatter Plot**: Explores attendance correlation; clicking a dot opens that student's marksheet.
   - **Student Subject Radar Chart**: Visualizes individual student strengths vs class average.

---

## 🔄 6. Step-by-Step Execution Flow
1. **Open `index.html`** &rarr; `auth.js` checks session storage.
2. If not logged in &rarr; Displays glowing Aurora login gateway.
3. User logs in &rarr; `applyRoleBasedUI()` configures Faculty or Student mode.
4. `recalculateAllMetrics()` computes totals, letter grades, and SGPA.
5. `updateKPICards()` & `renderStudentTable()` display cohort metrics and sortable rows.
6. `renderFacultyVisualizations()` draws interactive animated SVG charts using D3.js.
7. Click **"Marksheet"** &rarr; `openProgressCard()` generates the UGC progress card &rarr; Click **"Print"** for A4 PDF export.

---

## 🚀 7. How to Run & Demo Credentials
- **Run**: Double-click `index.html` in any web browser (no installation or server needed).
- **Faculty Login**: Username: `admin` | Password: `admin123`
- **Student Login**: Username: `sneha` (Top Ranker) or `arun` | Password: `pass123`
- **Reset Data**: Click the **Reset Cohort** button in the navbar if you ever want to restore original default marks.
