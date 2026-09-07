const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// Initialize Presentation
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches
pptx.author = 'Antigravity AI / BIET Academic Portal';
pptx.company = 'Bharath Institute of Engineering & Technology';
pptx.title = 'Academic Analytics & Student Marksheet Portal - Project Presentation';
pptx.subject = 'Modular Web Architecture, D3.js Visualizations & UGC 10-Point Marksheet Engine';

// Color Palette Constants
const C_BG_DARK = '090D16';      // Deep obsidian slate
const C_CARD_BG = '1E293B';      // Slate 800 card surface
const C_CARD_BORDER = '334155';  // Slate 700 border
const C_PRIMARY = '4F46E5';      // Indigo
const C_SECONDARY = '0EA5E9';    // Sky Blue
const C_ACCENT = '8B5CF6';       // Violet
const C_SUCCESS = '10B981';      // Emerald
const C_WARNING = 'F59E0B';      // Amber
const C_TEXT_WHITE = 'F8FAFC';   // White Slate
const C_TEXT_MUTED = '94A3B8';   // Slate 400
const C_TEXT_DARK = '0F172A';

// Helper: Add consistent header & branding to content slides
function addSlideHeader(slide, title, category, slideNum) {
    // Top category badge
    slide.addText(category.toUpperCase(), {
        x: 0.8, y: 0.4, w: 6.0, h: 0.3,
        fontSize: 10, bold: true, color: C_SECONDARY, fontFace: 'Arial',
        letterSpacing: 2
    });

    // Main Slide Title
    slide.addText(title, {
        x: 0.8, y: 0.7, w: 10.0, h: 0.6,
        fontSize: 22, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
    });

    // Header separator line
    slide.addShape(pptx.ShapeType.line, {
        x: 0.8, y: 1.35, w: 11.73, h: 0,
        line: { color: C_CARD_BORDER, width: 1 }
    });

    // Footer branding & page number
    slide.addText('Academic Analytics Portal | Bharath Institute (Autonomous)', {
        x: 0.8, y: 7.0, w: 8.0, h: 0.3,
        fontSize: 9, color: C_TEXT_MUTED, fontFace: 'Arial'
    });

    slide.addText(`Slide ${slideNum} of 10`, {
        x: 10.5, y: 7.0, w: 2.0, h: 0.3,
        fontSize: 9, color: C_TEXT_MUTED, fontFace: 'Arial', align: 'right'
    });
}

// ============================================================================
// SLIDE 1: TITLE / HERO SLIDE
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };

    // Decorative gradient glow cards
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 0.8, w: 11.73, h: 5.9,
        rectRadius: 0.2,
        fill: { color: '131D31' },
        line: { color: C_CARD_BORDER, width: 1.5 }
    });

    // Institute Tag
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.3, y: 1.3, w: 3.8, h: 0.4,
        rectRadius: 0.1,
        fill: { color: '1E1B4B' },
        line: { color: C_PRIMARY, width: 1 }
    });
    slide.addText('🏛️  BHARATH INSTITUTE (AUTONOMOUS)', {
        x: 1.3, y: 1.3, w: 3.8, h: 0.4,
        fontSize: 10, bold: true, color: 'A5B4FC', fontFace: 'Arial', align: 'center'
    });

    // Main Title
    slide.addText('Academic Analytics &\nStudent Marksheet Portal', {
        x: 1.3, y: 1.9, w: 10.5, h: 1.5,
        fontSize: 34, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial', lineSpacing: 38
    });

    // Subtitle
    slide.addText('Modular Web Architecture • D3.js Visualizations • UGC 10-Point Scale Grading Engine', {
        x: 1.3, y: 3.5, w: 10.5, h: 0.5,
        fontSize: 14, color: C_SECONDARY, fontFace: 'Arial', bold: true
    });

    // Description
    slide.addText('A production-grade, highly organized multi-tier academic evaluation platform featuring institutional analytics, dual-role RBAC (Faculty & Student), real-time cohort simulators, and high-fidelity printable marksheet generation.', {
        x: 1.3, y: 4.1, w: 10.5, h: 0.8,
        fontSize: 12, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 18
    });

    // Feature Badges at bottom
    const badges = [
        { label: '📁 Modular Folders (css/ js/ data/)', color: '312E81', text: 'C7D2FE' },
        { label: '📊 Live D3.js Charts & Bar Graphs', color: '075985', text: 'BAE6FD' },
        { label: '🎓 UGC 10-Point CGPA Calculator', color: '581C87', text: 'E9D5FF' },
        { label: '🔐 Dual-Role Session RBAC', color: '064E3B', text: 'A7F3D0' }
    ];

    badges.forEach((b, i) => {
        const bx = 1.3 + (i * 2.7);
        slide.addShape(pptx.ShapeType.roundRect, {
            x: bx, y: 5.3, w: 2.5, h: 0.6,
            rectRadius: 0.1,
            fill: { color: b.color },
            line: { color: C_CARD_BORDER, width: 1 }
        });
        slide.addText(b.label, {
            x: bx, y: 5.3, w: 2.5, h: 0.6,
            fontSize: 9, bold: true, color: b.text, fontFace: 'Arial', align: 'center'
        });
    });
}

// ============================================================================
// SLIDE 2: EXECUTIVE SUMMARY & CORE OBJECTIVES
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Project Overview & Key Objectives', 'Executive Summary', 2);

    const cards = [
        {
            title: '1. Modular Architecture',
            icon: '📁',
            color: C_PRIMARY,
            desc: 'Refactored single-file monolithic codebase into dedicated language subfolders (css/, js/, data/) for maximum maintainability, clean separation of concerns, and team scalability.'
        },
        {
            title: '2. Institutional D3.js Analytics',
            icon: '📊',
            color: C_SECONDARY,
            desc: 'Interactive visual cohort analytics with department performance bar charts, pass/fail donuts, subject correlation scatter plots, and student radar gauges.'
        },
        {
            title: '3. UGC 10-Point Marksheet Engine',
            icon: '🎓',
            color: C_ACCENT,
            desc: 'Automated evaluation according to standard Indian UGC / Autonomous University guidelines: Letter Grade (O to F), Grade Points (10 to 0), SGPA/CGPA, and pass criteria.'
        },
        {
            title: '4. Dual-Role RBAC & Security',
            icon: '🔐',
            color: C_SUCCESS,
            desc: 'Role-Based Access Control separating Faculty Administration (full CRUD, live simulator, CSV export) and Student Self-Service (personalized scorecard & marksheets).'
        }
    ];

    cards.forEach((c, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = 0.8 + (col * 6.0);
        const y = 1.6 + (row * 2.5);

        slide.addShape(pptx.ShapeType.roundRect, {
            x: x, y: y, w: 5.7, h: 2.2,
            rectRadius: 0.15,
            fill: { color: C_CARD_BG },
            line: { color: C_CARD_BORDER, width: 1 }
        });

        // Top accent bar
        slide.addShape(pptx.ShapeType.rect, {
            x: x, y: y, w: 5.7, h: 0.08,
            fill: { color: c.color }
        });

        // Card Title
        slide.addText(`${c.icon}  ${c.title}`, {
            x: x + 0.3, y: y + 0.25, w: 5.1, h: 0.4,
            fontSize: 16, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });

        // Card Description
        slide.addText(c.desc, {
            x: x + 0.3, y: y + 0.75, w: 5.1, h: 1.25,
            fontSize: 11.5, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 16
        });
    });
}

// ============================================================================
// SLIDE 3: SYSTEM ARCHITECTURE & FOLDER MODULARIZATION
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Layered System Architecture & Directory Tree', 'Technical Architecture', 3);

    // Left Column: Architecture Tree Card
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.6, w: 5.6, h: 5.1,
        rectRadius: 0.15,
        fill: { color: '0C1322' },
        line: { color: C_PRIMARY, width: 1.5 }
    });

    slide.addText('📁 Project Directory Organization', {
        x: 1.1, y: 1.8, w: 5.0, h: 0.35,
        fontSize: 14, bold: true, color: C_SECONDARY, fontFace: 'Arial'
    });

    const dirTree = `D3project/
├── index.html          (Main HTML Entry Point)
├── README.md           (Documentation Guide)
├── build.js            (Build & Sync Engine)
│
├── css/                (🎨 Stylesheets Layer)
│   ├── styles.css      (Global tokens & UI)
│   ├── auth.css        (Login Gateway & Aurora)
│   ├── dashboard.css   (KPIs & Data Table)
│   ├── charts.css      (D3 SVG Styling)
│   └── marksheet.css   (Progress Card & Print)
│
├── js/                 (⚡ Application Logic Layer)
│   ├── data.js         (Storage & Cohort Data)
│   ├── auth.js         (RBAC & Demo Logins)
│   ├── marksheet.js    (UGC GPA Calculator)
│   ├── ui.js           (KPIs, Tables & Filters)
│   ├── charts.js       (D3 Data Visualizers)
│   └── app.js          (Bootstrap & Event Hub)
│
└── data/               (📊 Data Layer)
    └── students.json   (22-Student JSON Dataset)`;

    slide.addText(dirTree, {
        x: 1.0, y: 2.2, w: 5.2, h: 4.3,
        fontSize: 9.5, color: 'E2E8F0', fontFace: 'Courier New', lineSpacing: 13
    });

    // Right Column: Architectural Principles
    const principles = [
        {
            title: '🎨 Presentation Layer (css/)',
            desc: 'Modular CSS architecture organized by component responsibility: global design tokens, aurora auth overlays, responsive data grids, SVG chart styling, and print formatting.',
            border: C_SECONDARY
        },
        {
            title: '⚡ Business Logic Layer (js/)',
            desc: 'Zero-framework vanilla ES6+ modules. Separates data stores, authentication flows, academic calculation engines, D3 visual rendering, and UI DOM manipulation.',
            border: C_PRIMARY
        },
        {
            title: '📊 Persistent Data Layer (data/)',
            desc: 'Portable JSON cohort data storage coupled with an intelligent multi-tiered storage wrapper (LocalStorage -> SessionStorage -> In-Memory Fallback).',
            border: C_SUCCESS
        }
    ];

    principles.forEach((p, idx) => {
        const y = 1.6 + (idx * 1.7);
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 6.7, y: y, w: 5.8, h: 1.5,
            rectRadius: 0.12,
            fill: { color: C_CARD_BG },
            line: { color: p.border, width: 1.2 }
        });

        slide.addText(p.title, {
            x: 7.0, y: y + 0.15, w: 5.2, h: 0.35,
            fontSize: 13, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });

        slide.addText(p.desc, {
            x: 7.0, y: y + 0.55, w: 5.2, h: 0.85,
            fontSize: 10.5, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 14
        });
    });
}

// ============================================================================
// SLIDE 4: FRONTEND TECHNOLOGY STACK & DESIGN SYSTEM
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Technology Stack & Modern Design System', 'Design & Engineering', 4);

    // Left Box: Technology Stack
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.6, w: 5.6, h: 5.1,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 }
    });

    slide.addText('🛠️ Core Technology Stack', {
        x: 1.1, y: 1.85, w: 5.0, h: 0.35,
        fontSize: 15, bold: true, color: C_SECONDARY, fontFace: 'Arial'
    });

    const stackItems = [
        { name: 'Vanilla JavaScript (ES6+)', desc: 'Zero external dependencies for business logic. Pure performance, instant startup, and modular maintenance.' },
        { name: 'D3.js v7 (Data-Driven Documents)', desc: 'Custom dynamic SVG data binding, responsive scale linear/band projections, animated transitions, and hover tooltips.' },
        { name: 'Semantic HTML5', desc: 'Accessible document structure with modal overlays, SVG graphics, and responsive data containers.' },
        { name: 'Advanced CSS3 & Glassmorphism', desc: 'Aurora light animations, backdrop-filter blurs, radial gradients, flex/grid layouts, and dedicated print stylesheet.' }
    ];

    stackItems.forEach((item, i) => {
        const iy = 2.3 + (i * 1.05);
        slide.addText(`• ${item.name}`, {
            x: 1.1, y: iy, w: 5.0, h: 0.3,
            fontSize: 12, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });
        slide.addText(item.desc, {
            x: 1.3, y: iy + 0.3, w: 4.8, h: 0.65,
            fontSize: 10, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 13
        });
    });

    // Right Box: Design System & Color Tokens
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.7, y: 1.6, w: 5.8, h: 5.1,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 }
    });

    slide.addText('🎨 Design System Tokens & Typography', {
        x: 7.0, y: 1.85, w: 5.2, h: 0.35,
        fontSize: 15, bold: true, color: C_ACCENT, fontFace: 'Arial'
    });

    // Color Swatches
    const swatches = [
        { label: 'Primary Indigo', hex: '#4F46E5', color: C_PRIMARY },
        { label: 'Sky Blue Secondary', hex: '#0EA5E9', color: C_SECONDARY },
        { label: 'Violet Accent', hex: '#8B5CF6', color: C_ACCENT },
        { label: 'Emerald Success', hex: '#10B981', color: C_SUCCESS },
        { label: 'Amber Warning', hex: '#F59E0B', color: C_WARNING },
        { label: 'Obsidian Dark Base', hex: '#090D16', color: '090D16' }
    ];

    swatches.forEach((sw, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = 7.0 + (col * 2.7);
        const sy = 2.4 + (row * 0.7);

        slide.addShape(pptx.ShapeType.roundRect, {
            x: sx, y: sy, w: 0.45, h: 0.45,
            rectRadius: 0.08,
            fill: { color: sw.color },
            line: { color: C_TEXT_WHITE, width: 0.8 }
        });

        slide.addText(`${sw.label}\n${sw.hex}`, {
            x: sx + 0.55, y: sy - 0.05, w: 2.0, h: 0.5,
            fontSize: 9, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial', lineSpacing: 11
        });
    });

    // Typography Info
    slide.addShape(pptx.ShapeType.line, {
        x: 7.0, y: 4.8, w: 5.2, h: 0,
        line: { color: C_CARD_BORDER, width: 1 }
    });

    slide.addText('🔤 Google Fonts Typography Hierarchy', {
        x: 7.0, y: 5.0, w: 5.2, h: 0.3,
        fontSize: 12, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
    });

    slide.addText('• Headings & Numbers: Outfit & Space Grotesk (High legibility)\n• Body & Data Tables: Plus Jakarta Sans (Clean modern sans-serif)\n• Institutional Seals & Certificates: Cinzel (Classical serif)', {
        x: 7.0, y: 5.4, w: 5.2, h: 1.1,
        fontSize: 10, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 15
    });
}

// ============================================================================
// SLIDE 5: ARCHITECTURE BAR GRAPH & COHORT PERFORMANCE ANALYTICS
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Department Performance Comparison & D3 Pipeline', 'Cohort Analytics', 5);

    // Left Side: Real Native PowerPoint Bar Chart
    const barChartData = [
        {
            name: 'Average Marks (%)',
            labels: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
            values: [90.2, 85.8, 79.4, 69.8, 73.2]
        },
        {
            name: 'Pass Rate (%)',
            labels: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
            values: [100.0, 100.0, 100.0, 80.0, 75.0]
        }
    ];

    const chartOptions = {
        x: 0.8, y: 1.6, w: 6.8, h: 5.0,
        barDir: 'col',
        barGrouping: 'clustered',
        chartColors: [C_PRIMARY, C_SECONDARY],
        chartColorsOpacity: 90,
        valAxisMinVal: 0,
        valAxisMaxVal: 110,
        showValue: true,
        dataLabelColor: 'FFFFFF',
        dataLabelFontSize: 8,
        catAxisLabelColor: 'CBD5E1',
        valAxisLabelColor: 'CBD5E1',
        valAxisLineShow: false,
        catAxisLineShow: true,
        showLegend: true,
        legendPos: 't',
        legendColor: 'CBD5E1',
        legendFontSize: 10,
        fill: C_CARD_BG,
        line: { color: C_CARD_BORDER, width: 1 }
    };

    slide.addChart(pptx.ChartType.bar, barChartData, chartOptions);

    // Right Side: Technical Explanation of the D3.js Bar Graph Architecture
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 7.9, y: 1.6, w: 4.6, h: 5.0,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 }
    });

    slide.addText('📊 D3.js Bar Chart Pipeline', {
        x: 8.2, y: 1.85, w: 4.0, h: 0.35,
        fontSize: 14, bold: true, color: C_SECONDARY, fontFace: 'Arial'
    });

    const pipelineSteps = [
        { title: '1. Data Aggregation (`d3.rollup`)', desc: 'Rolls up raw student arrays by department into mean subject scores and pass percentage tallies.' },
        { title: '2. Band & Linear Scaling', desc: '`d3.scaleBand()` partitions X-axis categories with padding; `d3.scaleLinear()` maps domain [0, 100] to SVG pixel heights.' },
        { title: '3. SVG Gradient Injection', desc: 'Dynamically attaches linear gradients (`#barGradCSE`, `#barGradECE`) for sleek illuminated bar visuals.' },
        { title: '4. Dynamic Transitions & Tooltips', desc: 'Bars animate from height 0 using `.transition().duration(800)`; floating mouse tooltips reveal precise department metrics.' }
    ];

    pipelineSteps.forEach((st, i) => {
        const sy = 2.35 + (i * 1.0);
        slide.addText(st.title, {
            x: 8.2, y: sy, w: 4.0, h: 0.25,
            fontSize: 11, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });
        slide.addText(st.desc, {
            x: 8.2, y: sy + 0.25, w: 4.0, h: 0.65,
            fontSize: 9.5, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 13
        });
    });
}

// ============================================================================
// SLIDE 6: AUTHENTICATION & SECURITY SYSTEM (auth.js / auth.css)
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Dual-Role Authentication Gateway & RBAC', 'Security & Access Control', 6);

    // Left Box: RBAC Matrix
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.6, w: 5.7, h: 5.1,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_PRIMARY, width: 1.2 }
    });

    slide.addText('👥 Role-Based Access Control (RBAC)', {
        x: 1.1, y: 1.85, w: 5.1, h: 0.35,
        fontSize: 15, bold: true, color: C_PRIMARY, fontFace: 'Arial'
    });

    // Faculty Role Details
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.1, y: 2.3, w: 5.1, h: 1.9,
        rectRadius: 0.1,
        fill: { color: '172554' },
        line: { color: C_SECONDARY, width: 1 }
    });
    slide.addText('👨‍🏫 FACULTY / ADMIN ROLE (`admin`)', {
        x: 1.3, y: 2.45, w: 4.7, h: 0.3,
        fontSize: 12, bold: true, color: '93C5FD', fontFace: 'Arial'
    });
    slide.addText('• Complete Student Record CRUD (Add, Edit, Delete)\n• Live Cohort Performance Simulator & Stress Testing\n• Batch Official Marksheet Viewer & CSV Report Export\n• Full Cohort Analytics across all 5 Engineering Departments', {
        x: 1.3, y: 2.8, w: 4.7, h: 1.3,
        fontSize: 10, color: 'E2E8F0', fontFace: 'Arial', lineSpacing: 15
    });

    // Student Role Details
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.1, y: 4.4, w: 5.1, h: 1.9,
        rectRadius: 0.1,
        fill: { color: '3B0764' },
        line: { color: C_ACCENT, width: 1 }
    });
    slide.addText('🎓 STUDENT ROLE (`sneha`, `arun`)', {
        x: 1.3, y: 4.55, w: 4.7, h: 0.3,
        fontSize: 12, bold: true, color: 'D8B4FE', fontFace: 'Arial'
    });
    slide.addText('• Personalized Academic Welcome Banner & Subject Breakdown\n• Immediate UGC Progress Card & Official Marksheet Generation\n• Individual Subject Radar & Attendance Gauge Visualizations\n• Restricted Access: Hidden Faculty Management & CRUD Controls', {
        x: 1.3, y: 4.9, w: 4.7, h: 1.3,
        fontSize: 10, color: 'E2E8F0', fontFace: 'Arial', lineSpacing: 15
    });

    // Right Box: Security Features
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.8, y: 1.6, w: 5.7, h: 5.1,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 }
    });

    slide.addText('🔐 Security & Session Layer (`auth.js`)', {
        x: 7.1, y: 1.85, w: 5.1, h: 0.35,
        fontSize: 15, bold: true, color: C_SUCCESS, fontFace: 'Arial'
    });

    const secFeatures = [
        { title: 'Aurora Wave Overlay (`auth.css`)', desc: 'Full-screen luminous animated background, glowing particles, grid sweep animations, and password reveal toggle.' },
        { title: 'Three-Tier Storage Persistence', desc: '`safeSetItem()` / `safeGetItem()` engine seamlessly cascades from LocalStorage (Remember Me) -> SessionStorage -> In-Memory Fallback.' },
        { title: 'Instant Demo Accounts', desc: 'Pre-seeded fast-login tokens for instant evaluator testing without manual password typing.' },
        { title: 'Header Role Switcher', desc: 'Seamless live role switching mechanism allowing administrators to preview the exact UI as seen by any student.' }
    ];

    secFeatures.forEach((sf, i) => {
        const y = 2.3 + (i * 1.05);
        slide.addText(`• ${sf.title}`, {
            x: 7.1, y: y, w: 5.1, h: 0.25,
            fontSize: 11, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });
        slide.addText(sf.desc, {
            x: 7.3, y: y + 0.25, w: 4.8, h: 0.65,
            fontSize: 9.5, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 13
        });
    });
}

// ============================================================================
// SLIDE 7: UGC 10-POINT GRADING & MARKSHEET ENGINE
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'UGC 10-Point Academic Grading & Marksheet Engine', 'Grading & Evaluation', 7);

    // Left Side: UGC Grade Scale Table
    const tableHeader = [
        { text: 'Score Range', options: { bold: true, color: 'FFFFFF', fill: C_PRIMARY, fontSize: 10, align: 'center' } },
        { text: 'Grade', options: { bold: true, color: 'FFFFFF', fill: C_PRIMARY, fontSize: 10, align: 'center' } },
        { text: 'Points', options: { bold: true, color: 'FFFFFF', fill: C_PRIMARY, fontSize: 10, align: 'center' } },
        { text: 'Description', options: { bold: true, color: 'FFFFFF', fill: C_PRIMARY, fontSize: 10 } },
        { text: 'Academic Status', options: { bold: true, color: 'FFFFFF', fill: C_PRIMARY, fontSize: 10, align: 'center' } }
    ];

    const tableRows = [
        tableHeader,
        [{ text: '90 - 100', options: { align: 'center' } }, { text: 'O', options: { bold: true, align: 'center', color: '10B981' } }, { text: '10', options: { align: 'center' } }, { text: 'Outstanding' }, { text: 'Passed (First Class Dist.)', options: { align: 'center' } }],
        [{ text: '80 - 89', options: { align: 'center' } }, { text: 'A+', options: { bold: true, align: 'center', color: '10B981' } }, { text: '9', options: { align: 'center' } }, { text: 'Excellent' }, { text: 'Passed (First Class)', options: { align: 'center' } }],
        [{ text: '70 - 79', options: { align: 'center' } }, { text: 'A', options: { bold: true, align: 'center', color: '0EA5E9' } }, { text: '8', options: { align: 'center' } }, { text: 'Very Good' }, { text: 'Passed (First Class)', options: { align: 'center' } }],
        [{ text: '60 - 69', options: { align: 'center' } }, { text: 'B+', options: { bold: true, align: 'center', color: '0EA5E9' } }, { text: '7', options: { align: 'center' } }, { text: 'Good' }, { text: 'Passed (Second Class)', options: { align: 'center' } }],
        [{ text: '50 - 59', options: { align: 'center' } }, { text: 'B', options: { bold: true, align: 'center', color: 'F59E0B' } }, { text: '6', options: { align: 'center' } }, { text: 'Above Average' }, { text: 'Passed (Second Class)', options: { align: 'center' } }],
        [{ text: '40 - 49', options: { align: 'center' } }, { text: 'C', options: { bold: true, align: 'center', color: 'F59E0B' } }, { text: '5', options: { align: 'center' } }, { text: 'Average' }, { text: 'Passed (Pass Division)', options: { align: 'center' } }],
        [{ text: '35 - 39', options: { align: 'center' } }, { text: 'P', options: { bold: true, align: 'center', color: 'EAB308' } }, { text: '4', options: { align: 'center' } }, { text: 'Pass Threshold' }, { text: 'Passed (Pass Division)', options: { align: 'center' } }],
        [{ text: '0 - 34', options: { align: 'center' } }, { text: 'F', options: { bold: true, align: 'center', color: 'EF4444' } }, { text: '0', options: { align: 'center' } }, { text: 'Fail / Re-appear' }, { text: 'FAILED (Backlog)', options: { align: 'center', bold: true, color: 'EF4444' } }]
    ];

    slide.addTable(tableRows, {
        x: 0.8, y: 1.6, w: 6.8, h: 4.8,
        colW: [1.2, 0.8, 0.8, 1.8, 2.2],
        color: C_TEXT_WHITE,
        fontSize: 9,
        fill: C_CARD_BG,
        border: { color: C_CARD_BORDER, pt: 1 }
    });

    // Right Side: Marksheet Generation Features
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 7.9, y: 1.6, w: 4.6, h: 4.8,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 }
    });

    slide.addText('📜 Official Marksheet Modal', {
        x: 8.2, y: 1.85, w: 4.0, h: 0.35,
        fontSize: 14, bold: true, color: C_ACCENT, fontFace: 'Arial'
    });

    const marksheetDetails = [
        { title: '• Autonomous College Header', desc: 'Institutional seal, serial numbers, examination month/year, and student demographic details.' },
        { title: '• Subject-Wise Breakdown', desc: 'Evaluates Maths, Science, English, Programming with Max Marks (100), Min Pass Marks (35), Obtained Marks, and UGC Letter Grades.' },
        { title: '• Formula: CGPA & SGPA', desc: 'Calculates overall grade point average using UGC formula: SGPA = Σ(Credits × Grade Points) / Total Credits.' },
        { title: '• High-Fidelity `@media print`', desc: 'Dedicated print layout stripping navigation bars, applying A4 dimensions, high-contrast borders, and signatures area.' }
    ];

    marksheetDetails.forEach((md, i) => {
        const my = 2.3 + (i * 1.0);
        slide.addText(md.title, {
            x: 8.2, y: my, w: 4.0, h: 0.25,
            fontSize: 11, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });
        slide.addText(md.desc, {
            x: 8.2, y: my + 0.25, w: 4.0, h: 0.65,
            fontSize: 9.5, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 13
        });
    });
}

// ============================================================================
// SLIDE 8: D3.JS VISUALIZATION SUITE
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Interactive D3.js Visualization Suite (charts.js)', 'Data Visualizations', 8);

    const charts = [
        {
            title: '1. Department Average Bar Chart',
            type: 'Bar / Column Chart',
            desc: 'Visualizes mean aggregate scores across all 5 engineering streams with animated bar rise, color coding, and department comparison benchmarks.',
            color: C_PRIMARY
        },
        {
            title: '2. Pass vs Fail Cohort Donut',
            type: 'Donut Arc Chart',
            desc: 'Real-time percentage breakdown of qualifying students vs backlogs with hover slice expansion, tooltip percentages, and center ratio readout.',
            color: C_SUCCESS
        },
        {
            title: '3. Subject Correlation Scatter Plot',
            type: 'Scatter / Bubble Plot',
            desc: 'Plots Mathematics vs Programming scores to reveal multi-disciplinary aptitude correlations with department-colored student nodes.',
            color: C_SECONDARY
        },
        {
            title: '4. Student Radar & Gauge Dial',
            type: 'Radar / Radial Gauge',
            desc: 'Personalized 4-axis subject proficiency polygon and semi-circular attendance needle gauge for individual student evaluation.',
            color: C_ACCENT
        }
    ];

    charts.forEach((ch, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = 0.8 + (col * 6.0);
        const y = 1.6 + (row * 2.5);

        slide.addShape(pptx.ShapeType.roundRect, {
            x: x, y: y, w: 5.7, h: 2.2,
            rectRadius: 0.15,
            fill: { color: C_CARD_BG },
            line: { color: C_CARD_BORDER, width: 1 }
        });

        slide.addShape(pptx.ShapeType.rect, {
            x: x, y: y, w: 5.7, h: 0.08,
            fill: { color: ch.color }
        });

        slide.addText(ch.title, {
            x: x + 0.3, y: y + 0.2, w: 5.1, h: 0.35,
            fontSize: 14, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });

        slide.addText(`Type: ${ch.type}`, {
            x: x + 0.3, y: y + 0.55, w: 5.1, h: 0.25,
            fontSize: 10, bold: true, color: ch.color, fontFace: 'Arial'
        });

        slide.addText(ch.desc, {
            x: x + 0.3, y: y + 0.85, w: 5.1, h: 1.15,
            fontSize: 10.5, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 14
        });
    });
}

// ============================================================================
// SLIDE 9: UI CONTROLLERS, DATA TABLE & SIMULATOR (ui.js / app.js)
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Dynamic UI Controllers, Filters & Live Simulation', 'Application Engine', 9);

    const uiFeatures = [
        {
            title: '⚡ Dynamic KPI Summary Cards',
            desc: 'Instant calculation and display of Total Active Students, Class Aggregate Average, Overall Pass Percentage, and Highest Cohort Scorer with animated counters.'
        },
        {
            title: '🔍 Multi-Parameter Filter & Search Pipeline',
            desc: 'Real-time multi-criteria filtering by Department (CSE/ECE/EEE/MECH/CIVIL), Gender, Pass/Fail Status, Grade (O to F), combined with instant substring student search.'
        },
        {
            title: '🔄 Multi-Column Sortable Student Table',
            desc: 'Clickable table headers enabling ascending/descending sorting by ID, Name, Department, Individual Subjects, Total, Average, Attendance, and Letter Grade.'
        },
        {
            title: '🚀 Live Push Simulator & CSV Data Export',
            desc: 'Simulates live IoT/exam score pushes with instant chart re-renders; includes an automated client-side RFC 4180 compliant CSV export generator.'
        }
    ];

    uiFeatures.forEach((uf, idx) => {
        const y = 1.6 + (idx * 1.25);
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8, y: y, w: 11.73, h: 1.1,
            rectRadius: 0.12,
            fill: { color: C_CARD_BG },
            line: { color: C_CARD_BORDER, width: 1 }
        });

        slide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0, y: y + 0.15, w: 0.8, h: 0.8,
            rectRadius: 0.08,
            fill: { color: '131D31' },
            line: { color: C_PRIMARY, width: 1 }
        });

        slide.addText(`${idx + 1}`, {
            x: 1.0, y: y + 0.25, w: 0.8, h: 0.6,
            fontSize: 16, bold: true, color: C_SECONDARY, fontFace: 'Arial', align: 'center'
        });

        slide.addText(uf.title, {
            x: 2.0, y: y + 0.15, w: 10.3, h: 0.3,
            fontSize: 13, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });

        slide.addText(uf.desc, {
            x: 2.0, y: y + 0.45, w: 10.3, h: 0.55,
            fontSize: 10.5, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 14
        });
    });
}

// ============================================================================
// SLIDE 10: CONCLUSION & FUTURE ROADMAP
// ============================================================================
{
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };
    addSlideHeader(slide, 'Project Conclusion & Future Roadmap', 'Summary & Roadmap', 10);

    // Left Box: Key Accomplishments
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.6, w: 5.7, h: 5.1,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_SUCCESS, width: 1.2 }
    });

    slide.addText('🏆 Key Technical Accomplishments', {
        x: 1.1, y: 1.85, w: 5.1, h: 0.35,
        fontSize: 15, bold: true, color: C_SUCCESS, fontFace: 'Arial'
    });

    const accomplishments = [
        '✅ Modular Language Subfolder Structure (css/, js/, data/)',
        '✅ Interactive D3.js Data-Driven Visualizations & Bar Graphs',
        '✅ Official UGC 10-Point Grading Scale & Progress Marksheet',
        '✅ Robust Role-Based Access Control (Faculty vs Student)',
        '✅ Zero-Dependency Fast Vanilla ES6+ Engine with 100% Reliability',
        '✅ Full Responsiveness & High-Fidelity Print Layout Support'
    ];

    accomplishments.forEach((ac, i) => {
        slide.addText(ac, {
            x: 1.1, y: 2.4 + (i * 0.65), w: 5.1, h: 0.5,
            fontSize: 11, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });
    });

    // Right Box: Future Roadmap
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.8, y: 1.6, w: 5.7, h: 5.1,
        rectRadius: 0.15,
        fill: { color: C_CARD_BG },
        line: { color: C_SECONDARY, width: 1.2 }
    });

    slide.addText('🚀 Future Enhancements Roadmap', {
        x: 7.1, y: 1.85, w: 5.1, h: 0.35,
        fontSize: 15, bold: true, color: C_SECONDARY, fontFace: 'Arial'
    });

    const roadmap = [
        { title: '1. Relational Database Backend', desc: 'Integrate PostgreSQL / Cloud Firestore via Firebase Data Connect for institutional scale.' },
        { title: '2. Multi-Semester Cumulative CGPA', desc: 'Expand grading engine across all 8 semesters to compute Cumulative GPA and transcript generation.' },
        { title: '3. Automated PDF Report Dispatch', desc: 'Automated digital signature stamping and automated parent/student email notification triggers.' },
        { title: '4. AI Academic Risk Predictor', desc: 'Machine learning regression model predicting potential student backlogs early in the semester.' }
    ];

    roadmap.forEach((rm, i) => {
        const y = 2.4 + (i * 1.05);
        slide.addText(rm.title, {
            x: 7.1, y: y, w: 5.1, h: 0.25,
            fontSize: 11.5, bold: true, color: C_TEXT_WHITE, fontFace: 'Arial'
        });
        slide.addText(rm.desc, {
            x: 7.3, y: y + 0.25, w: 4.9, h: 0.65,
            fontSize: 10, color: C_TEXT_MUTED, fontFace: 'Arial', lineSpacing: 13
        });
    });
}

// Generate Presentation File
const outputPath = path.join(__dirname, 'Academic_Analytics_Portal_Presentation.pptx');
pptx.writeFile({ fileName: outputPath })
    .then(fileName => {
        console.log(`Presentation generated successfully at: ${fileName}`);
    })
    .catch(err => {
        console.error('Error generating PPTX:', err);
    });
