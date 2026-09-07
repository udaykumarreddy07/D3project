# 🛠️ Step-by-Step Project Development Guide & Code Architecture

> **Complete technical blueprint detailing the 8 development stages of the Academic Analytics & Marksheet Portal.**

---

## 🗺️ 8-Stage Development Lifecycle Overview

```
+---------------------------------------------------------------------------------------------------+
| STAGE 1: Data Modeling & Schema Design       -> js/data.js (Student Dataset & Safe Storage)       |
| STAGE 2: HTML5 Layout & CSS3 Glassmorphism    -> index.html, css/styles.css, css/auth.css          |
| STAGE 3: RBAC Authentication & Session State  -> js/auth.js (Admin vs Student Role Switcher)       |
| STAGE 4: Academic Grading & SGPA Algorithms   -> js/marksheet.js (UGC 10-Point Grading Standard)   |
| STAGE 5: Interactive D3.js Data Visualizations-> js/charts.js (SVG Bar, Donut, Scatter, Radar)     |
| STAGE 6: Dynamic Data Grid & CRUD Engine      -> js/ui.js (Search, Multi-column Sort, Filter, CSV) |
| STAGE 7: UGC Marksheet Progress Card & Print  -> js/marksheet.js, css/marksheet.css (@media print) |
| STAGE 8: Live Push Simulator & Feedback Engine-> js/app.js (Real-time Stream, Toast Notifications) |
+---------------------------------------------------------------------------------------------------+
```

---

## 📝 Stage 1: Data Modeling & Schema Design (`js/data.js`)

### 1.1 Student Schema
Each student record is modeled with academic attributes, department affiliation, and subject marks:
```javascript
const student = {
    id: 1,
    name: "Arun Kumar",
    department: "CSE",
    gender: "Male",
    maths: 88,
    science: 91,
    english: 85,
    programming: 95,
    attendance: 92
};
```

### 1.2 Defensive Multi-Tier Storage Wrapper
To ensure uninterrupted execution across diverse browser security configurations:
```javascript
const memoryStorage = {};

function safeGetItem(key) {
    try {
        return localStorage.getItem(key) || sessionStorage.getItem(key) || memoryStorage[key] || null;
    } catch (e) {
        return memoryStorage[key] || null;
    }
}

function safeSetItem(key, val, remember = true) {
    memoryStorage[key] = val;
    try {
        if (remember) {
            localStorage.setItem(key, val);
        } else {
            sessionStorage.setItem(key, val);
        }
    } catch (e) { }
}
```

---

## 🎨 Stage 2: HTML5 Layout & CSS3 Glassmorphism UI Shell

### 2.1 CSS Custom Properties (`css/styles.css`)
```css
:root {
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --accent-cyan: #06b6d4;
    --accent-green: #10b981;
    --accent-red: #ef4444;
    --bg-dark: #0f172a;
    --card-bg: rgba(30, 41, 59, 0.7);
    --border-glass: rgba(255, 255, 255, 0.08);
    --font-main: 'Inter', sans-serif;
    --font-heading: 'Outfit', sans-serif;
}
```

### 2.2 Modern Glassmorphism & Aurora Glow (`css/auth.css`)
```css
.glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
}
```

---

## 🔐 Stage 3: RBAC Authentication & Session State (`js/auth.js`)

### 3.1 Role Distinction & Permission Enforcing
```javascript
function applyRoleBasedUI() {
    const user = getCurrentUser();
    if (!user) return showLoginModal();

    if (user.role === "Faculty") {
        document.getElementById("facultyControls").style.display = "flex";
        document.getElementById("studentBanner").style.display = "none";
        renderFacultyVisualizations(getFilteredStudents());
    } else {
        document.getElementById("facultyControls").style.display = "none";
        document.getElementById("studentBanner").style.display = "block";
        renderStudentVisualizations(user.id);
    }
}
```

---

## 📐 Stage 4: Academic Grading & SGPA Algorithms (`js/marksheet.js`)

### 4.1 UGC 10-Point Scale Converter
```javascript
function getSubjectGrade(mark) {
    if (mark >= 90) return { grade: "O",  point: 10, desc: "Outstanding" };
    if (mark >= 80) return { grade: "A+", point: 9,  desc: "Excellent" };
    if (mark >= 70) return { grade: "A",  point: 8,  desc: "Very Good" };
    if (mark >= 60) return { grade: "B+", point: 7,  desc: "Good" };
    if (mark >= 50) return { grade: "B",  point: 6,  desc: "Above Average" };
    if (mark >= 40) return { grade: "C",  point: 5,  desc: "Average" };
    if (mark >= 35) return { grade: "P",  point: 4,  desc: "Pass" };
    return { grade: "F", point: 0, desc: "Fail" };
}
```

### 4.2 SGPA Formula Calculation
```javascript
function computeSGPA(student) {
    const credits = { maths: 4, science: 4, english: 3, programming: 4 };
    const totalCredits = 15;
    const weightedPoints = 
        (getSubjectGrade(student.maths).point * credits.maths) +
        (getSubjectGrade(student.science).point * credits.science) +
        (getSubjectGrade(student.english).point * credits.english) +
        (getSubjectGrade(student.programming).point * credits.programming);
    return (weightedPoints / totalCredits).toFixed(2);
}
```

---

## 📊 Stage 5: Interactive D3.js Visualizations (`js/charts.js`)

### 5.1 Subject Average Bar Chart with Click-to-Sort
```javascript
function drawSubjectChart(data) {
    const svg = d3.select("#subjectChart");
    const xScale = d3.scaleBand().domain(["Maths", "Science", "English", "Programming"]).range([0, width]).padding(0.3);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.subject))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.average))
        .attr("height", d => height - yScale(d.average))
        .on("click", (event, d) => sortTable(d.subject.toLowerCase()));
}
```

---

## 🔍 Stage 6: Dynamic Data Grid & CRUD Engine (`js/ui.js`)

### 6.1 Multi-Column Sorting & Filtering
```javascript
function sortTable(columnKey) {
    sortDirection = (currentSortCol === columnKey && sortDirection === 'asc') ? 'desc' : 'asc';
    currentSortCol = columnKey;
    students.sort((a, b) => {
        let valA = a[columnKey], valB = b[columnKey];
        return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    renderStudentTable();
}
```

---

## 📄 Stage 7: UGC Marksheet Progress Card & A4 Print Engine (`css/marksheet.css`)

```css
@media print {
    body * { visibility: hidden; }
    #marksheetModal, #marksheetModal * { visibility: visible; }
    .modal-backdrop, .no-print { display: none !important; }
    #marksheetModal {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: #ffffff !important;
        color: #000000 !important;
    }
}
```

---

## ⚡ Stage 8: Real-Time Live Push Simulator (`js/app.js`)

```javascript
let simulatorInterval = null;

function toggleLiveSimulation(enable) {
    if (enable) {
        simulatorInterval = setInterval(() => {
            const randomIdx = Math.floor(Math.random() * students.length);
            const delta = (Math.random() * 6 - 3); // -3 to +3 marks
            students[randomIdx].maths = Math.min(100, Math.max(0, Math.round(students[randomIdx].maths + delta)));
            recalculateAllMetrics();
            updateDashboard();
            highlightTableRow(students[randomIdx].id);
        }, 3000);
    } else {
        clearInterval(simulatorInterval);
    }
}
```
