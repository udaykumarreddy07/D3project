# 📊 Academic Analytics & Student Marksheet Portal
## 🎯 Executive Project Overview & Technical Presentation Guide

---

## 📌 Executive Summary

The **Academic Analytics & Student Marksheet Portal** is an enterprise-grade academic evaluation and data visualization suite built for autonomous institutions and universities. It bridges the gap between raw student examination records and actionable institutional intelligence through **interactive D3.js visualizations**, **Role-Based Access Control (RBAC)**, and **automated UGC 10-point scale marksheet generation**.

---

## 🏛️ System Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                           ACADEMIC ANALYTICS PORTAL                               |
+-----------------------------------------------------------------------------------+
                                       |
    +----------------------------------+-----------------------------------+
    |                                  |                                   |
    v                                  v                                   v
+-----------------------+   +-----------------------+   +-----------------------+
|  PRESENTATION LAYER   |   |   APPLICATION LOGIC   |   |      DATA LAYER       |
|       (css/)          |   |        (js/)          |   |       (data/)         |
+-----------------------+   +-----------------------+   +-----------------------+
| • styles.css          |   | • data.js             |   | • students.json       |
|   (Tokens, Resets)    |   |   (Store, SafeCache)  |   |   (22-Student Cohort) |
| • auth.css            |   | • auth.js             |   | • LocalStorage        |
|   (Aurora Gateway)    |   |   (RBAC, Demo Auth)   |   |   (Remember Me)       |
| • dashboard.css       |   | • marksheet.js        |   | • SessionStorage      |
|   (KPIs, Data Table)  |   |   (UGC 10-Point GPA)  |   |   (Active Session)    |
| • charts.css          |   | • ui.js               |   | • Memory Fallback     |
|   (D3 SVG Styles)     |   |   (KPIs, Sort, Filter)|   |   (Defensive State)   |
| • marksheet.css       |   | • charts.js           |   +-----------------------+
|   (Print & Progress)  |   |   (D3 Visualizers)    |
+-----------------------+   | • app.js              |
                            |   (Event Bootstrap)   |
                            +-----------------------+
```

---

## 📁 Modular File Organization Breakdown

```
D3project/
├── index.html                                   # Main application entry point (Modular HTML)
├── presentation.html                            # Interactive web-based slide deck (Live D3 charts)
├── PROJECT_OVERVIEW_PRESENTATION.md             # This comprehensive presentation & viva guide
├── Academic_Analytics_Portal_Presentation.pptx  # 10-Slide Microsoft PowerPoint presentation deck
├── README.md                                    # Project documentation & setup guide
├── build.js                                     # Modular build & sync utility
├── generate_ppt.js                              # PowerPoint generation engine
│
├── css/                                         # 🎨 [Cascading Style Sheets Layer]
│   ├── styles.css                               # Global color variables (:root), resets, UI utilities
│   ├── auth.css                                 # Login Gateway, Aurora light animations & glassmorphism
│   ├── dashboard.css                            # Navigation header, KPI cards, filters, and data table
│   ├── charts.css                               # D3.js SVG chart wrappers, axes, tooltips & legends
│   └── marksheet.css                            # UGC Academic Progress Card & print stylesheet
│
├── js/                                          # ⚡ [JavaScript Application Logic Layer]
│   ├── data.js                                  # Cohort dataset, department maps & storage fallback
│   ├── auth.js                                  # Authentication engine, demo logins & role switcher
│   ├── marksheet.js                             # UGC 10-point GPA calculation & marksheet modal
│   ├── ui.js                                    # Dynamic KPI stats, data table, sorting & CSV exports
│   ├── charts.js                                # D3.js Visualizers (Bar, Donut, Scatter, Radar, Gauge)
│   └── app.js                                   # Main bootstrap, CRUD handlers & live simulation
│
└── data/                                        # 📊 [Persistent Data Layer]
    └── students.json                            # Standard 22-student cohort dataset (JSON)
```

---

## 📊 1. Department Performance Bar Graph Architecture

The flagship visualization of this project is the **Comparative Department Performance Bar Chart** rendered using **D3.js v7**:

```
 Marks (%)
  100 |     [90.2%]
   90 |     +-----+       [85.8%]
   80 |     |     |       +-----+       [79.4%]
   70 |     | CSE |       |     |       +-----+                     [73.2%]
   60 |     |     |       | ECE |       |     |       [69.8%]       +-----+
   50 |     |     |       |     |       | EEE |       +-----+       |     |
   40 |     |     |       |     |       |     |       |MECH |       |CIVIL|
   30 |     |     |       |     |       |     |       |     |       |     |
    0 +-----+-----+-------+-----+-------+-----+-------+-----+-------+-----+---> Department
              CSE           ECE           EEE           MECH          CIVIL
```

### 🔍 Technical D3.js Rendering Pipeline:
1. **Data Aggregation (`d3.rollup`)**:
   - Groups raw student records by engineering department (`CSE`, `ECE`, `EEE`, `MECH`, `CIVIL`).
   - Computes statistical averages for aggregate marks, attendance, and pass/fail counts.
2. **Coordinate Scales**:
   - `d3.scaleBand()`: Maps categorical department names evenly along the horizontal X-axis.
   - `d3.scaleLinear()`: Maps domain `[0, 100]` continuously to SVG vertical pixel heights.
3. **Animated Transitions (`.transition().duration(800)`)**:
   - Bars smoothly rise from `Y = 0` to their target height upon initialization and whenever data filters update.
4. **SVG Gradients & Tooltips**:
   - Injects linear SVG gradients (`#barGradCSE`, `#barGradECE`) for sleek luminous visuals.
   - Interactive mouse hover listeners attach floating tooltips showing exact student counts and pass rates.

---

## 🎓 2. UGC 10-Point Academic Grading Scale

The evaluation engine adheres to the standard Indian **UGC 10-point Letter Grading System**:

| Score Range | Letter Grade | Grade Points (GP) | Description | Academic Result |
|:---:|:---:|:---:|---|:---:|
| **90 – 100** | **O** | **10** | Outstanding | Passed (First Class with Distinction) |
| **80 – 89** | **A+** | **9** | Excellent | Passed (First Class) |
| **70 – 79** | **A** | **8** | Very Good | Passed (First Class) |
| **60 – 69** | **B+** | **7** | Good | Passed (Second Class) |
| **50 – 59** | **B** | **6** | Above Average | Passed (Second Class) |
| **40 – 49** | **C** | **5** | Average | Passed (Pass Division) |
| **35 – 39** | **P** | **4** | Pass Threshold | Passed (Pass Division) |
| **0 – 34** | **F** | **0** | Fail / Re-appear | **FAILED (Backlog)** |

### 📐 Key Evaluation Rules:
- **Pass Threshold**: A student must secure **&ge; 35 marks** in *each subject* (Maths, Science, English, Programming). A score `< 35` in any single subject results in an overall **Fail (F)** status.
- **SGPA Formula**:
  $$\text{SGPA} = \frac{\sum (\text{Credits}_i \times \text{Grade Point}_i)}{\sum \text{Credits}_i}$$

---

## 🔐 3. Dual-Role RBAC (Role-Based Access Control)

| Feature / Action | 👨‍🏫 Faculty / Admin (`admin`) | 🎓 Student (`sneha`, `arun`) |
|---|:---:|:---:|
| **Global Cohort Analytics** | ✅ Full Access | 🚫 Hidden |
| **Student Record CRUD (Add/Edit/Delete)** | ✅ Full Access | 🚫 Hidden |
| **Live Score Push Simulator** | ✅ Full Access | 🚫 Hidden |
| **CSV Export of Cohort Data** | ✅ Full Access | 🚫 Hidden |
| **Personalized SGPA & Radar Chart** | 🚫 Cohort View | ✅ Instant Self-View |
| **Official Marksheet Generation** | ✅ Batch View | ✅ Personal View |
| **Print / PDF Marksheet Export** | ✅ Available | ✅ Available |

---

## 💡 4. Top Technical Highlights & Viva Q&A

### Q1: Why use Vanilla JavaScript instead of React / Angular?
> **Answer**: Vanilla JS offers zero-dependency execution, instant page load speeds without compilation overhead, 100% standard web compatibility, and clean pedagogical transparency for understanding DOM and D3.js mechanics.

### Q2: How does D3.js handle responsive resizing?
> **Answer**: Through SVG `viewBox` coordinate systems combined with `window.addEventListener('resize', updateDashboard)`, recalculating scale ranges on viewport changes.

### Q3: How is data persisted without a backend server?
> **Answer**: Using a defensive 3-tier storage wrapper in `data.js` (`safeSetItem` / `safeGetItem`) that cascades gracefully: `localStorage` &rarr; `sessionStorage` &rarr; In-Memory State.

### Q4: How is the print format styled for the official marksheet?
> **Answer**: Through `css/marksheet.css` utilizing `@media print` rules to strip portal navigation headers, remove backdrop blurs, enforce high-contrast borders, and guarantee crisp A4 dimensions.

---

## 🚀 5. How to Run & Present

- **Interactive Presentation Deck**: Open **[presentation.html](file:///c:/Users/udayk/OneDrive/Desktop/D3project/presentation.html)** (Press `F` for Fullscreen, `←`/`→` to navigate).
- **Microsoft PowerPoint Deck**: Open **[Academic_Analytics_Portal_Presentation.pptx](file:///c:/Users/udayk/OneDrive/Desktop/D3project/Academic_Analytics_Portal_Presentation.pptx)**.
- **Live Web Portal**: Open **[index.html](file:///c:/Users/udayk/OneDrive/Desktop/D3project/index.html)** in any browser.
- **Demo Credentials**:
  - Faculty: `admin` / `admin123`
  - Student: `sneha` / `pass123`
  - Student: `arun` / `pass123`
