/* ====================================================
   D3.JS VISUALIZATION CHARTS & COLOR INTELLIGENCE ENGINE
   Aesthetic Velvet Obsidian Glassmorphism & Neon Glows
==================================================== */

// Shared Rich Color Tooltip Generator
function formatColorTooltip({
    color,
    colorName,
    title,
    category,
    reason,
    stats = [],
    rule,
    actionHint
}) {
    const statsHtml = stats.map(s => `<div class="tooltip-metric-item">• ${s}</div>`).join("");
    return `
        <div class="tooltip-color-header">
            <span class="tooltip-color-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></span>
            <span class="tooltip-color-name">${colorName}</span>
            ${category ? `<span style="margin-left:auto; font-size:9.5px; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:10px; color:#cbd5e1; font-weight:700;">${category}</span>` : ''}
        </div>
        <div class="tooltip-title">${title}</div>
        <div class="tooltip-reason-box" style="border-left-color:${color};">
            <div class="tooltip-reason-label">💡 WHY THIS COLOR INDICATES:</div>
            <div>${reason}</div>
        </div>
        ${stats.length ? `<div class="tooltip-metric-grid">${statsHtml}</div>` : ''}
        ${rule ? `<div style="font-size:10.5px; color:#94a3b8; margin-top:6px; padding-top:4px; border-top:1px solid rgba(255,255,255,0.08);">📋 <b>Evaluation Criteria:</b> ${rule}</div>` : ''}
        ${actionHint ? `<div class="tooltip-action-hint">👉 ${actionHint}</div>` : ''}
    `;
}

// Interactive Color Legend Bar Generator
function renderChartLegend(containerId, items, onPillClick) {
    const container = d3.select(containerId);
    if (container.empty()) return;
    container.selectAll("*").remove();

    items.forEach(item => {
        const pill = container.append("div")
            .attr("class", "legend-pill")
            .attr("title", `Inspect color indicator: ${item.label}`)
            .html(`
                <span class="legend-dot" style="background:${item.color}; box-shadow:0 0 6px ${item.color};"></span>
                <span>${item.label}</span>
                ${item.badge ? `<b style="font-size:10.5px; opacity:0.85; margin-left:2px;">${item.badge}</b>` : ''}
            `);

        pill.on("mouseenter pointerdown", function (event) {
            d3.select(this).classed("active", true);
            showTooltip(event, formatColorTooltip(item.info));
            if (item.onHover) item.onHover(true);
        })
        .on("mousemove", function (event) {
            showTooltip(event, formatColorTooltip(item.info));
        })
        .on("mouseleave", function () {
            d3.select(this).classed("active", false);
            hideTooltip();
            if (item.onHover) item.onHover(false);
        })
        .on("click", function (event) {
            if (onPillClick) onPillClick(item);
            else if (item.onClick) item.onClick(item);
            showToast(`Selected ${item.label} (${item.info.colorName}): ${item.info.reason.slice(0, 55)}...`, "info");
        });
    });
}

function injectSvgGradients(svg) {
    let defs = svg.select("defs");
    if (defs.empty()) {
        defs = svg.append("defs");
    }

    if (defs.select("#chartGlowFilter").empty()) {
        const filter = defs.append("filter")
            .attr("id", "chartGlowFilter")
            .attr("x", "-20%")
            .attr("y", "-20%")
            .attr("width", "140%")
            .attr("height", "140%");
        filter.append("feDropShadow")
            .attr("dx", "0")
            .attr("dy", "3")
            .attr("stdDeviation", "4")
            .attr("flood-opacity", "0.35")
            .attr("flood-color", "#6366f1");
    }

    const gradients = [
        { id: "gradMaths", c1: "#818cf8", c2: "#4f46e5" },
        { id: "gradScience", c1: "#38bdf8", c2: "#0284c7" },
        { id: "gradEnglish", c1: "#34d399", c2: "#059669" },
        { id: "gradProg", c1: "#c084fc", c2: "#7c3aed" },
        { id: "gradPass", c1: "#34d399", c2: "#10b981" },
        { id: "gradFail", c1: "#fb7185", c2: "#e11d48" },
        { id: "gradMale", c1: "#60a5fa", c2: "#2563eb" },
        { id: "gradFemale", c1: "#f472b6", c2: "#db2777" },
        { id: "gradMyScore", c1: "#818cf8", c2: "#4f46e5" },
        { id: "gradClassAvg", c1: "#64748b", c2: "#334155" }
    ];

    gradients.forEach(g => {
        if (defs.select(`#${g.id}`).empty()) {
            const grad = defs.append("linearGradient")
                .attr("id", g.id)
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "0%").attr("y2", "100%");
            grad.append("stop").attr("offset", "0%").attr("stop-color", g.c1);
            grad.append("stop").attr("offset", "100%").attr("stop-color", g.c2);
        }
    });
}

/* ====================================================
   FEATURED HERO D3.JS COHORT VISUALIZATIONS
   Mode A: Beeswarm to Alluvial Outcome Flow (Screenshot 3)
   Mode B: Radial Institutional Orbit & Subject Tree (Screenshot 4)
==================================================== */
let heroChartMode = 'flow'; // 'flow' | 'orbit'
let heroChartMetric = 'percentage'; // 'percentage' | 'attendance' | 'sgpa'
let heroSelectedTier = 'All'; // 'All' | 'Distinction' | 'First' | 'Second' | 'Arrears'
let heroHighlightedStudentId = null;
let lastHeroCohortData = [];

// Hero Department Color Palette
const HERO_DEPT_COLORS = {
    "CSE": "#6366f1",   // Royal Indigo
    "ECE": "#0ea5e9",   // Sky Blue
    "EEE": "#10b981",   // Emerald Mint
    "MECH": "#f59e0b",  // Warm Amber
    "CIVIL": "#ec4899"  // Rose Pink
};

// Outcome Tier Definitions
const HERO_TIERS = [
    { key: "Distinction", label: "🌟 DISTINCTION (≥85%)", shortLabel: "Distinction", color: "#f59e0b", minScore: 85, targetY: 55 },
    { key: "First", label: "🥇 FIRST CLASS (70-84%)", shortLabel: "First Class", color: "#38bdf8", minScore: 70, targetY: 145 },
    { key: "Second", label: "📗 PASS / 2ND (35-69%)", shortLabel: "Pass / 2nd", color: "#34d399", minScore: 35, targetY: 235 },
    { key: "Arrears", label: "🔴 ARREARS ALERT (<35%)", shortLabel: "Arrears", color: "#f43f5e", minScore: 0, targetY: 325 }
];

// Deep-Touch Inspector State
let activeInspectCategory = null;
let activeInspectStudentList = [];

function setHeroChartMode(mode) {
    heroChartMode = mode;
    d3.select("#btnModeFlow").classed("active", mode === 'flow');
    d3.select("#btnModeRidge").classed("active", mode === 'ridge');
    d3.select("#btnModeParallel").classed("active", mode === 'parallel');
    d3.select("#btnModeOrbit").classed("active", mode === 'orbit');
    d3.select("#btnModeHud").classed("active", mode === 'hud');
    
    const metricWrap = d3.select("#heroMetricWrap");
    const tierWrap = d3.select("#heroTierPillsWrap");

    if (mode === 'flow') {
        d3.select("#heroChartHeading").text("🌊 Student Grade Conduits & Academic Outcome Flow");
        d3.select("#heroChartSub").text("Interactive Beeswarm-to-Alluvial conduit flow connecting individual student achievement to institutional qualification tiers");
        metricWrap.style("display", "inline-flex");
        tierWrap.style("display", "inline-flex");
    } else if (mode === 'ridge') {
        d3.select("#heroChartHeading").text("⛰️ Department Performance Ridgeline Density Waves");
        d3.select("#heroChartSub").text("Continuous probability density curves (spectral mountain waves) comparing score clustering across engineering departments");
        metricWrap.style("display", "none");
        tierWrap.style("display", "none");
    } else if (mode === 'parallel') {
        d3.select("#heroChartHeading").text("⚡ Multi-Subject Parallel Coordinates Flow & Pin-Lines");
        d3.select("#heroChartSub").text("Continuous multi-axial trajectories traversing Maths → Science → English → Programming → SGPA to spotlight curriculum strengths & arrears");
        metricWrap.style("display", "none");
        tierWrap.style("display", "none");
    } else if (mode === 'orbit') {
        d3.select("#heroChartHeading").text("🌌 Radial Institutional Orbit & Subject Competency Tree");
        d3.select("#heroChartSub").text("Hierarchical radial orbit displaying college departments and multi-ring student subject grade profiles");
        metricWrap.style("display", "none");
        tierWrap.style("display", "none");
    } else if (mode === 'hud') {
        d3.select("#heroChartHeading").text("🍩 Concentric HUD Radial Progress Rings & Pass Clearance");
        d3.select("#heroChartSub").text("Multi-ring telemetry dials for subject-wise cohort mastery, average benchmarks, and institutional pass clearance");
        metricWrap.style("display", "none");
        tierWrap.style("display", "none");
    }
    drawHeroCohortVisualization();
}

function setHeroChartMetric(metric) {
    heroChartMetric = metric;
    drawHeroCohortVisualization();
}

function filterHeroTier(tier) {
    heroSelectedTier = tier;
    d3.selectAll(".hero-tier-pill").classed("active", false);
    d3.select(`#tierPill-${tier}`).classed("active", true);

    if (tier === 'All') {
        clearHeroHighlight();
        return;
    }

    d3.selectAll(".conduit-path")
        .style("stroke-opacity", function () {
            return d3.select(this).attr("data-tier") === tier ? 1 : 0.08;
        })
        .style("stroke-width", function () {
            return d3.select(this).attr("data-tier") === tier ? "3.2px" : "1.2px";
        });

    d3.selectAll(".student-dot")
        .style("opacity", function () {
            return d3.select(this).attr("data-tier") === tier ? 1 : 0.2;
        });

    const matchingCount = lastHeroCohortData.filter(d => {
        const evalRes = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(d) : null;
        const isPass = evalRes ? evalRes.isPass : (d.maths >= 35 && d.science >= 35 && d.english >= 35 && d.programming >= 35);
        const pct = evalRes ? evalRes.percentage : ((d.maths + d.science + d.english + d.programming) / 4);
        let t = 'Second';
        if (!isPass) t = 'Arrears';
        else if (pct >= 85) t = 'Distinction';
        else if (pct >= 70) t = 'First';
        return t === tier;
    }).length;

    d3.select("#heroFooterText").html(`Spotlight: <b>${tier} Tier</b> &bull; <b>${matchingCount}</b> student${matchingCount !== 1 ? 's' : ''} currently qualify.`);
    d3.select("#heroFooterActions").style("display", "none");
}

function clearHeroHighlight() {
    heroHighlightedStudentId = null;
    heroSelectedTier = 'All';
    d3.selectAll(".hero-tier-pill").classed("active", false);
    d3.select("#tierPill-All").classed("active", true);

    d3.selectAll(".conduit-path")
        .style("stroke-opacity", 0.45)
        .style("stroke-width", "2px");

    d3.selectAll(".student-dot")
        .style("opacity", 1)
        .attr("r", function () { return d3.select(this).attr("data-base-r") || 7; });

    d3.select("#heroFooterText").html("<b>Hover over any student bubble</b> to trace their conduit flow into their graduation outcome tier. <b>Click on a student</b> to inspect and print their official UGC marksheet.");
    d3.select("#heroFooterActions").style("display", "none");
}

function openHeroSelectedMarksheet() {
    if (heroHighlightedStudentId) {
        openProgressCard(heroHighlightedStudentId);
    }
}

/* ----------------------------------------------------
   DEEP-TOUCH CHART INSPECTOR ENGINE
   (Reveals complete constituent data on touching/clicking bars & pie slices)
---------------------------------------------------- */
function openDeepChartInspector(info, studentList) {
    activeInspectCategory = info;
    activeInspectStudentList = studentList || [];

    const modal = d3.select("#chartDeepInspectModal");
    if (modal.empty()) return;

    // Header & Badge
    d3.select("#deepInspectDot")
        .style("background", info.color || "#6366f1")
        .style("box-shadow", `0 0 10px ${info.color || "#6366f1"}`);
    d3.select("#deepInspectCategoryTag").text(info.type || "DATA BREAKDOWN INSPECTOR");
    d3.select("#deepInspectTitle").html(info.title || "Cohort Performance Inspection");
    d3.select("#deepInspectSubtitle").text(info.subtitle || `Constituent details and full student grade roster for ${info.title}`);

    // Compute Metrics
    const count = activeInspectStudentList.length;
    let scores = [];
    if (info.metricKey) {
        scores = activeInspectStudentList.map(s => Number(s[info.metricKey]) || 0);
    } else {
        scores = activeInspectStudentList.map(s => {
            const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(s) : null;
            return ev ? ev.percentage : Number(((s.maths + s.science + s.english + s.programming) / 4).toFixed(1));
        });
    }

    const mean = count > 0 ? (d3.mean(scores) || 0).toFixed(1) : "0.0";
    const maxScore = count > 0 ? (d3.max(scores) || 0) : 0;
    const minScore = count > 0 ? (d3.min(scores) || 0) : 0;
    
    // Pass Count
    const passCount = activeInspectStudentList.filter(s => {
        const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(s) : null;
        return ev ? ev.isPass : (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35);
    }).length;
    const passRate = count > 0 ? ((passCount / count) * 100).toFixed(1) : "0.0";

    // Populate 4 Telemetry Stat Cards
    const metricsGrid = d3.select("#deepInspectMetricsGrid");
    metricsGrid.selectAll("*").remove();

    const statsCards = [
        { label: "Cohort Count", val: `${count} Students`, sub: `${((count / (typeof students !== 'undefined' ? students.length : 22)) * 100).toFixed(0)}% of total cohort` },
        { label: info.metricKey ? `${info.metricKey.toUpperCase()} Average` : "Cohort Aggregate Mean", val: `${mean}%`, sub: `Passing cutoff: 35%` },
        { label: "Highest Mark", val: `${maxScore} / 100`, sub: `Peak performer in set` },
        { label: "Pass Clearance", val: `${passRate}%`, sub: `${passCount} of ${count} cleared` }
    ];

    statsCards.forEach(st => {
        const card = metricsGrid.append("div").attr("class", "deep-inspect-stat-card");
        card.append("div").attr("class", "deep-inspect-stat-label").text(st.label);
        card.append("div").attr("class", "deep-inspect-stat-val").text(st.val);
        card.append("div").attr("class", "deep-inspect-stat-sub").text(st.sub);
    });

    d3.select("#deepInspectRosterCount").text(`${count} Students`);
    d3.select("#deepInspectSearchInput").property("value", "");

    // Populate Roster Table
    renderDeepInspectRosterTable(activeInspectStudentList, info.metricKey);

    // Open Modal
    modal.classed("active", true);
}

function renderDeepInspectRosterTable(studentList, metricKey) {
    const tbody = d3.select("#deepInspectRosterBody");
    tbody.selectAll("*").remove();

    if (!studentList || studentList.length === 0) {
        tbody.append("tr").append("td")
            .attr("colspan", 7)
            .style("text-align", "center")
            .style("padding", "24px")
            .style("color", "#94a3b8")
            .text("No student records found in this category.");
        return;
    }

    studentList.forEach(s => {
        const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(s) : null;
        const pct = ev ? ev.percentage : Number(((s.maths + s.science + s.english + s.programming) / 4).toFixed(1));
        const sgpa = ev ? ev.sgpa : "8.00";
        const isPass = ev ? ev.isPass : (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35);
        const grade = isPass ? (pct >= 90 ? 'O' : (pct >= 80 ? 'A' : (pct >= 70 ? 'B' : (pct >= 60 ? 'C' : 'D')))) : 'F';
        
        const scoreVal = metricKey ? s[metricKey] : `${pct}%`;
        const scoreColor = (metricKey ? s[metricKey] : pct) >= 35 ? "#34d399" : "#f43f5e";

        const tr = tbody.append("tr");
        
        // 1. Name & Roll
        tr.append("td").html(`
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:24px; height:24px; border-radius:50%; background:rgba(99,102,241,0.2); color:#a5b4fc; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800;">${s.id}</span>
                <div>
                    <div style="font-weight:700; color:#ffffff;">${s.name}</div>
                    <div style="font-size:10px; color:#94a3b8;">${s.gender} &bull; Att: ${s.attendance}%</div>
                </div>
            </div>
        `);

        // 2. Dept
        tr.append("td").html(`<span class="badge" style="background:rgba(255,255,255,0.08); font-size:11px;">${s.department}</span>`);

        // 3. Subject Score or Aggregate
        tr.append("td").html(`
            <div style="font-weight:800; color:${scoreColor}; font-size:13px;">
                ${scoreVal}
            </div>
        `);

        // 4. Aggregate %
        tr.append("td").text(`${pct}%`);

        // 5. SGPA
        tr.append("td").html(`<b style="color:#fef08a;">${sgpa}</b>`);

        // 6. Grade Status
        tr.append("td").html(`
            <span class="badge ${isPass ? 'badge-pass' : 'badge-fail'}" style="font-size:10.5px;">
                ${isPass ? `Grade ${grade}` : 'ARREAR (F)'}
            </span>
        `);

        // 7. Action Button
        tr.append("td").style("text-align", "right").html(`
            <button type="button" class="btn btn-primary btn-xs" onclick="openProgressCard(${s.id})" title="View Official Marksheet Card">
                🎓 Marksheet
            </button>
        `);
    });
}

function filterDeepInspectRoster(query) {
    const q = (query || "").toLowerCase().trim();
    if (!q) {
        renderDeepInspectRosterTable(activeInspectStudentList, activeInspectCategory ? activeInspectCategory.metricKey : null);
        d3.select("#deepInspectRosterCount").text(`${activeInspectStudentList.length} Students`);
        return;
    }

    const filtered = activeInspectStudentList.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );

    renderDeepInspectRosterTable(filtered, activeInspectCategory ? activeInspectCategory.metricKey : null);
    d3.select("#deepInspectRosterCount").text(`${filtered.length} of ${activeInspectStudentList.length}`);
}

function closeDeepChartInspector() {
    d3.select("#chartDeepInspectModal").classed("active", false);
}

function applyDeepInspectToFilter() {
    closeDeepChartInspector();
    if (!activeInspectCategory) return;

    if (activeInspectCategory.filterType === 'grade') {
        d3.select("#gradeFilter").property("value", activeInspectCategory.filterVal);
        updateDashboard();
        showToast(`Filtered portal to Grade ${activeInspectCategory.filterVal}`, "info");
    } else if (activeInspectCategory.filterType === 'dept') {
        d3.select("#departmentFilter").property("value", activeInspectCategory.filterVal);
        updateDashboard();
        showToast(`Filtered portal to ${activeInspectCategory.filterVal} Department`, "info");
    } else if (activeInspectCategory.filterType === 'gender') {
        d3.select("#genderFilter").property("value", activeInspectCategory.filterVal);
        updateDashboard();
        showToast(`Filtered portal to ${activeInspectCategory.filterVal} cohort`, "info");
    } else {
        showToast(`Inspected ${activeInspectCategory.title}`, "info");
    }
}

function drawHeroCohortVisualization(data, targetStudentId) {
    if (data && data.length) {
        lastHeroCohortData = data;
    } else if (lastHeroCohortData && lastHeroCohortData.length) {
        data = lastHeroCohortData;
    } else if (typeof students !== 'undefined' && students.length) {
        data = students;
        lastHeroCohortData = students;
    } else {
        return;
    }

    const svg = d3.select("#heroCohortSvg");
    if (svg.empty()) return;
    svg.selectAll("*").remove();

    if (heroChartMode === 'flow') {
        drawStudentFlowConduitChart(svg, data, targetStudentId);
    } else if (heroChartMode === 'ridge') {
        drawRidgelineDensityChart(svg, data);
    } else if (heroChartMode === 'parallel') {
        drawParallelCoordinatesChart(svg, data);
    } else if (heroChartMode === 'orbit') {
        drawRadialOrbitChart(svg, data, targetStudentId);
    } else if (heroChartMode === 'hud') {
        drawConcentricRadialHudChart(svg, data);
    }
}

/**
 * MODE B: Department Ridgeline Spectral Density Waves (Screenshots 1 & 2)
 */
function drawRidgelineDensityChart(svg, data) {
    const width = 1000;
    const height = 430;
    const margin = { top: 35, right: 60, bottom: 45, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    injectSvgGradients(svg);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
    const rowHeight = chartHeight / (departments.length + 0.35);

    const xScale = d3.scaleLinear()
        .domain([20, 100])
        .range([0, chartWidth]);

    // Draw bottom scale axis
    g.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(8).tickFormat(d => `${d}%`));

    g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 36)
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .attr("text-anchor", "middle")
        .text("COHORT AGGREGATE MARKS DISTRIBUTION (%)");

    // Statutory Pass Cutoff line (35%)
    g.append("line")
        .attr("x1", xScale(35)).attr("y1", -5)
        .attr("x2", xScale(35)).attr("y2", chartHeight)
        .attr("stroke", "#f43f5e")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1.8)
        .attr("opacity", 0.7);

    g.append("text")
        .attr("x", xScale(35) + 6)
        .attr("y", 12)
        .attr("fill", "#f43f5e")
        .attr("font-size", "10px")
        .attr("font-weight", "800")
        .text("35% CUTOFF");

    departments.forEach((dept, i) => {
        const deptStudents = data.filter(d => d.department === dept);
        const yBase = i * rowHeight + rowHeight * 0.88;
        const deptColor = HERO_DEPT_COLORS[dept] || "#6366f1";

        const scores = deptStudents.map(d => {
            const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(d) : null;
            return ev ? ev.percentage : Number(((d.maths + d.science + d.english + d.programming) / 4).toFixed(1));
        });

        // Gaussian density curves
        const curvePoints = [];
        for (let xVal = 20; xVal <= 100; xVal += 2) {
            let density = 0;
            if (scores.length > 0) {
                scores.forEach(s => {
                    const diff = (xVal - s) / 6.5;
                    density += Math.exp(-0.5 * diff * diff);
                });
                density = (density / scores.length) * (rowHeight * 1.8);
            }
            curvePoints.push({ x: xScale(xVal), y: yBase - Math.min(rowHeight * 1.7, density) });
        }

        const areaGen = d3.area()
            .curve(d3.curveBasis)
            .x(d => d.x)
            .y0(yBase)
            .y1(d => d.y);

        const lineGen = d3.line()
            .curve(d3.curveBasis)
            .x(d => d.x)
            .y(d => d.y);

        const ridgeG = g.append("g").attr("class", `ridge-group ridge-${dept}`);

        // Shaded density wave
        ridgeG.append("path")
            .datum(curvePoints)
            .attr("class", "ridgeline-area")
            .attr("d", areaGen)
            .attr("fill", deptColor)
            .attr("opacity", 0.5)
            .style("cursor", "pointer")
            .on("click pointerdown", function() {
                openDeepChartInspector({
                    type: "Department Cohort",
                    title: `${DEPT_NAMES[dept] || dept} Department Performance`,
                    color: deptColor,
                    filterType: "dept",
                    filterVal: dept
                }, deptStudents);
            });

        // Glowing Crest Line
        ridgeG.append("path")
            .datum(curvePoints)
            .attr("class", "ridgeline-crest-line")
            .attr("d", lineGen)
            .attr("stroke", deptColor)
            .attr("stroke-width", 2.5)
            .style("filter", `drop-shadow(0 0 6px ${deptColor})`);

        // Baseline
        ridgeG.append("line")
            .attr("x1", 0).attr("y1", yBase)
            .attr("x2", chartWidth).attr("y2", yBase)
            .attr("stroke", "rgba(255,255,255,0.12)")
            .attr("stroke-width", 1);

        // Dept Name on Left
        const avgScore = scores.length > 0 ? d3.mean(scores).toFixed(1) : "0.0";
        ridgeG.append("text")
            .attr("x", -14)
            .attr("y", yBase - 8)
            .attr("text-anchor", "end")
            .attr("fill", "#ffffff")
            .attr("font-size", "12px")
            .attr("font-weight", "800")
            .text(dept);

        ridgeG.append("text")
            .attr("x", -14)
            .attr("y", yBase + 8)
            .attr("text-anchor", "end")
            .attr("fill", deptColor)
            .attr("font-size", "10px")
            .attr("font-weight", "700")
            .text(`${scores.length} Stud • ${avgScore}%`);

        // Individual Student Dots on Baseline
        deptStudents.forEach(s => {
            const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(s) : null;
            const pct = ev ? ev.percentage : Number(((s.maths + s.science + s.english + s.programming) / 4).toFixed(1));
            
            ridgeG.append("circle")
                .attr("class", "ridgeline-peak-dot")
                .attr("cx", xScale(pct))
                .attr("cy", yBase - 2)
                .attr("r", 4.5)
                .attr("fill", deptColor)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1.2)
                .style("cursor", "pointer")
                .on("mouseenter", function(event) {
                    showTooltip(event, formatColorTooltip({
                        color: deptColor,
                        colorName: `${dept} Cohort`,
                        title: `🎓 ${s.name} (${dept})`,
                        category: "Student Score Peak",
                        reason: `Scored <b>${pct}%</b> aggregate with <b>${ev ? ev.sgpa : '-'}</b> SGPA.`,
                        stats: [`Maths: ${s.maths}`, `Science: ${s.science}`, `English: ${s.english}`, `Programming: ${s.programming}`],
                        actionHint: "Click to open marksheet or touch wave to inspect all"
                    }));
                })
                .on("mouseleave", hideTooltip)
                .on("click", function() {
                    openProgressCard(s.id);
                });
        });
    });
}

/**
 * MODE C: 5-Axis Multi-Subject Parallel Coordinates Flow (Screenshot 6)
 */
function drawParallelCoordinatesChart(svg, data) {
    const width = 1000;
    const height = 430;
    const margin = { top: 45, right: 80, bottom: 45, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    injectSvgGradients(svg);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const dimensions = [
        { key: "maths", name: "Mathematics", domain: [0, 100], color: "#6366f1" },
        { key: "science", name: "Applied Science", domain: [0, 100], color: "#0ea5e9" },
        { key: "english", name: "English Comm", domain: [0, 100], color: "#10b981" },
        { key: "programming", name: "Programming", domain: [0, 100], color: "#a855f7" },
        { key: "sgpa", name: "Semester SGPA", domain: [0, 10], color: "#f59e0b" }
    ];

    const x = d3.scalePoint()
        .domain(dimensions.map(d => d.key))
        .range([0, chartWidth])
        .padding(0.1);

    const yScales = {};
    dimensions.forEach(dim => {
        yScales[dim.key] = d3.scaleLinear()
            .domain(dim.domain)
            .range([chartHeight, 0]);
    });

    const pathG = g.append("g").attr("class", "parallel-paths-layer");

    data.forEach(s => {
        const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(s) : null;
        const sgpaVal = ev ? Number(ev.sgpa) : 8.0;
        const isPass = ev ? ev.isPass : (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35);
        const deptColor = HERO_DEPT_COLORS[s.department] || "#6366f1";

        const points = dimensions.map(dim => {
            const val = dim.key === 'sgpa' ? sgpaVal : s[dim.key];
            return [x(dim.key), yScales[dim.key](val)];
        });

        const lineGenerator = d3.line().curve(d3.curveMonotoneX);

        pathG.append("path")
            .attr("class", `parallel-spline-path student-path-${s.id}`)
            .attr("d", lineGenerator(points))
            .attr("stroke", deptColor)
            .attr("stroke-width", isPass ? 2.2 : 3)
            .attr("stroke-opacity", isPass ? 0.45 : 0.7)
            .style("cursor", "pointer")
            .on("mouseenter", function(event) {
                d3.selectAll(".parallel-spline-path").style("stroke-opacity", 0.08).style("stroke-width", 1.2);
                d3.select(this).style("stroke-opacity", 1).style("stroke-width", 4.2).raise();

                showTooltip(event, formatColorTooltip({
                    color: deptColor,
                    colorName: `${s.department} (${s.name})`,
                    title: `🎓 ${s.name} (Roll #${s.id})`,
                    category: "Multi-Subject Flow Ribbon",
                    reason: `Cross-subject trajectory: M:${s.maths} • S:${s.science} • E:${s.english} • P:${s.programming} • SGPA: ${sgpaVal}`,
                    stats: [`Attendance: ${s.attendance}%`, `Status: ${isPass ? 'PASSED' : 'ARREAR'}`],
                    actionHint: "Click spline to open marksheet card"
                }));
            })
            .on("mouseleave", function() {
                d3.selectAll(".parallel-spline-path")
                    .style("stroke-opacity", isPass ? 0.45 : 0.7)
                    .style("stroke-width", isPass ? 2.2 : 3);
                hideTooltip();
            })
            .on("click", function() {
                openProgressCard(s.id);
            });
    });

    // Draw the 5 vertical axes with ticks and labels
    dimensions.forEach(dim => {
        const axisG = g.append("g")
            .attr("class", "axis parallel-axis")
            .attr("transform", `translate(${x(dim.key)},0)`);

        axisG.call(d3.axisLeft(yScales[dim.key]).ticks(6));

        axisG.append("text")
            .attr("y", -16)
            .attr("text-anchor", "middle")
            .attr("fill", dim.color)
            .attr("font-size", "12px")
            .attr("font-weight", "800")
            .text(dim.name);

        if (dim.key !== 'sgpa') {
            axisG.append("circle")
                .attr("cy", yScales[dim.key](35))
                .attr("r", 4)
                .attr("fill", "#f43f5e")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1);
        }
    });
}

/**
 * MODE E: Concentric HUD Radial Progress Rings & Pass Clearance (Screenshot 1)
 */
function drawConcentricRadialHudChart(svg, data) {
    const width = 1000;
    const height = 430;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    injectSvgGradients(svg);

    const g = svg.append("g")
        .attr("transform", `translate(${centerX},${centerY})`);

    const subjects = [
        { key: "maths", name: "Mathematics", r: 165, color: "#6366f1" },
        { key: "science", name: "Applied Science", r: 135, color: "#0ea5e9" },
        { key: "english", name: "English Comm", r: 105, color: "#10b981" },
        { key: "programming", name: "Programming", r: 75, color: "#a855f7" }
    ];

    const passCount = data.filter(d => {
        const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(d) : null;
        return ev ? ev.isPass : (d.maths >= 35 && d.science >= 35 && d.english >= 35 && d.programming >= 35);
    }).length;
    const passPct = data.length > 0 ? ((passCount / data.length) * 100).toFixed(1) : "0.0";

    const centerG = g.append("g").attr("class", "hud-center-core");
    centerG.append("circle")
        .attr("r", 52)
        .attr("fill", "#0f172a")
        .attr("stroke", "rgba(255,255,255,0.15)")
        .attr("stroke-width", 2);

    centerG.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -8)
        .attr("fill", "#34d399")
        .attr("font-size", "18px")
        .attr("font-weight", "900")
        .text(`${passPct}%`);

    centerG.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 12)
        .attr("fill", "#94a3b8")
        .attr("font-size", "9.5px")
        .attr("font-weight", "700")
        .text("COHORT PASS");

    centerG.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 25)
        .attr("fill", "#64748b")
        .attr("font-size", "8.5px")
        .text(`${passCount}/${data.length} Enrolled`);

    subjects.forEach(sub => {
        const scores = data.map(d => d[sub.key] || 0);
        const avg = data.length > 0 ? d3.mean(scores) : 0;
        const pct = Math.min(100, Math.max(0, avg));

        const circumference = 2 * Math.PI * sub.r;
        const strokeDash = (pct / 100) * circumference;

        const ringG = g.append("g").attr("class", `hud-ring-group ring-${sub.key}`);

        ringG.append("circle")
            .attr("r", sub.r)
            .attr("class", "hud-ring-track");

        ringG.append("circle")
            .attr("r", sub.r)
            .attr("class", "hud-ring-progress")
            .attr("stroke", sub.color)
            .attr("stroke-width", 12)
            .attr("stroke-dasharray", `${circumference} ${circumference}`)
            .attr("stroke-dashoffset", circumference)
            .attr("transform", "rotate(-90)")
            .style("filter", `drop-shadow(0 0 6px ${sub.color})`)
            .transition()
            .duration(1000)
            .attr("stroke-dashoffset", circumference - strokeDash);

        ringG.append("text")
            .attr("x", sub.r + 14)
            .attr("y", -4)
            .attr("fill", "#ffffff")
            .attr("font-size", "11.5px")
            .attr("font-weight", "800")
            .text(`${sub.name}: ${avg.toFixed(1)}%`);

        ringG.append("text")
            .attr("x", sub.r + 14)
            .attr("y", 12)
            .attr("fill", sub.color)
            .attr("font-size", "9.5px")
            .attr("font-weight", "700")
            .text("Touch ring to inspect student roster");

        ringG.style("cursor", "pointer")
            .on("click pointerdown", function() {
                openDeepChartInspector({
                    type: "Subject HUD Dial",
                    title: `${sub.name} Cohort Performance & Student Scores`,
                    color: sub.color,
                    metricKey: sub.key,
                    filterType: "subject",
                    filterVal: sub.key
                }, data);
            });
    });
}

/**
 * MODE A: Beeswarm to Alluvial Outcome Flow (Screenshot 3)
 */
function drawStudentFlowConduitChart(svg, data, targetStudentId) {
    const width = 1000;
    const height = 410;
    const margin = { top: 35, right: 180, bottom: 45, left: 55 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    injectSvgGradients(svg);

    // Defs for glowing laser filter
    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs");

    if (defs.select("#laserGlow").empty()) {
        const filter = defs.append("filter")
            .attr("id", "laserGlow")
            .attr("x", "-30%").attr("y", "-30%")
            .attr("width", "160%").attr("height", "160%");
        filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Boundary where scatter flows into alluvial conduits
    const xBoundary = chartWidth * 0.44;
    const xTarget = chartWidth + 30;

    // Background Matrix Dot Grid (matching Screenshot 3 high-tech look)
    const gridG = g.append("g").attr("class", "matrix-dot-grid");
    for (let x = 0; x <= chartWidth + 140; x += 36) {
        for (let y = 0; y <= chartHeight; y += 32) {
            gridG.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 1)
                .attr("fill", "rgba(255,255,255,0.06)");
        }
    }

    // Process Students & Assign Outcome Tiers
    const processedStudents = data.map(d => {
        const evalRes = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(d) : null;
        const pct = evalRes ? evalRes.percentage : Number(((d.maths + d.science + d.english + d.programming) / 4).toFixed(1));
        const sgpa = evalRes ? evalRes.sgpa : 8.0;
        const isPass = evalRes ? evalRes.isPass : (d.maths >= 35 && d.science >= 35 && d.english >= 35 && d.programming >= 35);
        
        let tierKey = 'Second';
        if (!isPass) tierKey = 'Arrears';
        else if (pct >= 85) tierKey = 'Distinction';
        else if (pct >= 70) tierKey = 'First';

        const tierInfo = HERO_TIERS.find(t => t.key === tierKey) || HERO_TIERS[2];

        let metricVal = pct;
        if (heroChartMetric === 'attendance') metricVal = d.attendance;
        else if (heroChartMetric === 'sgpa') metricVal = sgpa;

        return {
            student: d,
            id: d.id,
            name: d.name,
            dept: d.department,
            gender: d.gender,
            maths: d.maths,
            science: d.science,
            english: d.english,
            programming: d.programming,
            attendance: d.attendance,
            percentage: pct,
            sgpa: sgpa,
            isPass: isPass,
            tierKey: tierKey,
            tierInfo: tierInfo,
            metricVal: metricVal,
            color: HERO_DEPT_COLORS[d.department] || "#6366f1"
        };
    });

    // Tier Counts for Sinks
    const tierCounts = {};
    HERO_TIERS.forEach(t => {
        tierCounts[t.key] = processedStudents.filter(s => s.tierKey === t.key).length;
    });

    // Metric X-Scale
    let xDomain = [20, 100];
    if (heroChartMetric === 'sgpa') xDomain = [0, 10];
    else if (heroChartMetric === 'attendance') xDomain = [50, 100];

    const xScale = d3.scaleLinear()
        .domain(xDomain)
        .range([15, xBoundary - 25])
        .nice();

    // Subtle Vertical Grid Lines in Scatter Zone
    const xTicks = xScale.ticks(5);
    xTicks.forEach(tickVal => {
        g.append("line")
            .attr("x1", xScale(tickVal))
            .attr("y1", 0)
            .attr("x2", xScale(tickVal))
            .attr("y2", chartHeight)
            .attr("stroke", "rgba(255,255,255,0.05)")
            .attr("stroke-dasharray", "3,3");
    });

    // Boundary Line (Where Conduit Bundling Begins)
    g.append("line")
        .attr("x1", xBoundary)
        .attr("y1", -10)
        .attr("x2", xBoundary)
        .attr("y2", chartHeight + 10)
        .attr("stroke", "rgba(56, 189, 248, 0.25)")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4");

    g.append("text")
        .attr("x", xBoundary - 8)
        .attr("y", -14)
        .attr("text-anchor", "end")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .attr("letter-spacing", "0.05em")
        .text("STUDENT SCATTER ZONE");

    g.append("text")
        .attr("x", xBoundary + 8)
        .attr("y", -14)
        .attr("text-anchor", "start")
        .attr("fill", "#38bdf8")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .attr("letter-spacing", "0.05em")
        .text("CONDUIT BUNDLE ZONE →");

    // Force Simulation for Beeswarm on Left
    const nodes = processedStudents.map(d => ({
        ...d,
        targetX: xScale(d.metricVal),
        x: xScale(d.metricVal),
        y: chartHeight / 2,
        r: 7 + (d.sgpa ? (d.sgpa / 10) * 3 : 2) // Radius scaled with SGPA
    }));

    const simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(d => d.targetX).strength(1.2))
        .force("y", d3.forceY(chartHeight / 2).strength(0.09))
        .force("collide", d3.forceCollide(d => d.r + 2.5))
        .stop();

    for (let i = 0; i < 140; ++i) simulation.tick();

    // Keep within vertical bounds
    nodes.forEach(n => {
        n.y = Math.max(n.r + 8, Math.min(chartHeight - n.r - 8, n.y));
    });

    // 1. Draw Alluvial Conduit Flow Lines (Cubic Bézier Splines)
    const conduitGroup = g.append("g").attr("class", "conduits-layer");

    nodes.forEach(d => {
        const xStart = d.x;
        const yStart = d.y;
        const xMid = xBoundary;
        const yMid = d.y;
        const xEnd = xTarget;
        const yEnd = d.tierInfo.targetY;

        // Elegant double-stage cubic Bézier curve matching Screenshot 3
        const pathData = `M ${xStart},${yStart} L ${xMid},${yMid} C ${xMid + (xEnd - xMid) * 0.45},${yMid} ${xMid + (xEnd - xMid) * 0.55},${yEnd} ${xEnd},${yEnd}`;

        const isTarget = targetStudentId && (d.id === targetStudentId);

        const path = conduitGroup.append("path")
            .attr("class", `conduit-path conduit-${d.id}`)
            .attr("data-id", d.id)
            .attr("data-tier", d.tierKey)
            .attr("d", pathData)
            .attr("stroke", d.color)
            .attr("stroke-width", isTarget ? 3.5 : 2)
            .attr("stroke-opacity", isTarget ? 1 : 0.45)
            .attr("stroke-linecap", "round")
            .style("transition", "all 0.25s ease");

        // Small pulse indicator at the boundary transition point
        g.append("circle")
            .attr("cx", xMid)
            .attr("cy", yMid)
            .attr("r", 2.2)
            .attr("fill", d.color)
            .attr("opacity", 0.65);
    });

    // 2. Draw Target Outcome Sinks on Right (Screenshot 3 Target Nodes)
    const sinksGroup = g.append("g").attr("class", "target-sinks-layer");

    HERO_TIERS.forEach(tier => {
        const count = tierCounts[tier.key] || 0;
        const total = data.length || 1;
        const pctShare = ((count / total) * 100).toFixed(0);
        const yPos = tier.targetY;

        const sinkG = sinksGroup.append("g")
            .attr("class", `target-sink-node sink-${tier.key}`)
            .attr("transform", `translate(${xTarget},${yPos})`)
            .style("cursor", "pointer")
            .on("mouseenter", function (event) {
                filterHeroTier(tier.key);
                showTooltip(event, formatColorTooltip({
                    color: tier.color,
                    colorName: `${tier.shortLabel} Tier`,
                    title: tier.label,
                    category: "Institutional Outcome Tier",
                    reason: `Students in this outcome funnel qualify for ${tier.shortLabel} classification based on UGC semester evaluation rules.`,
                    stats: [
                        `Cohort Share: <b>${count} Students (${pctShare}%)</b>`,
                        `Criteria: <b>${tier.key === 'Arrears' ? '< 35 Marks in 1+ subjects' : `≥ ${tier.minScore}% Aggregate`}</b>`
                    ],
                    rule: "Statutory Autonomous Academic Regulation",
                    actionHint: "Click tier pill above to filter data table"
                }));
            })
            .on("mousemove", function (event) {
                showTooltip(event, formatColorTooltip({
                    color: tier.color,
                    colorName: `${tier.shortLabel} Tier`,
                    title: tier.label,
                    category: "Institutional Outcome Tier",
                    reason: `Students in this outcome funnel qualify for ${tier.shortLabel} classification.`,
                    stats: [`Cohort Share: <b>${count} Students (${pctShare}%)</b>`]
                }));
            })
            .on("mouseleave", function () {
                hideTooltip();
                if (heroSelectedTier === 'All') clearHeroHighlight();
            })
            .on("click", function () {
                filterHeroTier(tier.key);
                showToast(`Filtered by ${tier.shortLabel}: ${count} student(s) qualifying`, "info");
            });

        // Glowing outer halo
        sinkG.append("circle")
            .attr("r", 20)
            .attr("fill", tier.color)
            .attr("opacity", 0.12);

        sinkG.append("circle")
            .attr("r", 14)
            .attr("fill", "rgba(15, 23, 42, 0.95)")
            .attr("stroke", tier.color)
            .attr("stroke-width", 2.5)
            .style("filter", "drop-shadow(0 0 8px " + tier.color + ")");

        // Central Count Label inside circle
        sinkG.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "#ffffff")
            .attr("font-size", "11px")
            .attr("font-weight", "900")
            .text(count);

        // Tier Header & Subtitle
        sinkG.append("text")
            .attr("x", 26)
            .attr("y", -3)
            .attr("dominant-baseline", "central")
            .attr("fill", "#ffffff")
            .attr("font-size", "12px")
            .attr("font-weight", "800")
            .text(tier.label);

        sinkG.append("text")
            .attr("x", 26)
            .attr("y", 13)
            .attr("dominant-baseline", "central")
            .attr("fill", tier.color)
            .attr("font-size", "10px")
            .attr("font-weight", "700")
            .text(`${count} Students • ${pctShare}% of Cohort`);
    });

    // 3. Draw Student Dots in Scatter Zone
    const dotsGroup = g.append("g").attr("class", "student-dots-layer");

    nodes.forEach(d => {
        const isTarget = targetStudentId && (d.id === targetStudentId);

        const dotG = dotsGroup.append("g")
            .attr("class", `student-dot-wrapper student-${d.id}`)
            .attr("transform", `translate(${d.x},${d.y})`);

        const circle = dotG.append("circle")
            .attr("class", "student-dot")
            .attr("data-id", d.id)
            .attr("data-tier", d.tierKey)
            .attr("data-base-r", d.r)
            .attr("r", isTarget ? d.r + 3 : d.r)
            .attr("fill", d.color)
            .attr("stroke", isTarget ? "#ffffff" : "rgba(255,255,255,0.7)")
            .attr("stroke-width", isTarget ? 2.5 : 1.5)
            .style("filter", `drop-shadow(0 0 6px ${d.color})`);

        // Center dot core
        dotG.append("circle")
            .attr("r", 2.5)
            .attr("fill", "#ffffff")
            .attr("opacity", 0.9);

        // Hover & Click Handlers for Student Bubble
        dotG.style("cursor", "pointer")
            .on("mouseenter", function (event) {
                heroHighlightedStudentId = d.id;

                // Highlight this student's conduit and dot
                d3.selectAll(".conduit-path")
                    .style("stroke-opacity", 0.08)
                    .style("stroke-width", "1.5px");

                d3.select(`.conduit-${d.id}`)
                    .style("stroke-opacity", 1)
                    .style("stroke-width", "3.8px")
                    .raise();

                d3.selectAll(".student-dot")
                    .style("opacity", 0.25);

                circle.style("opacity", 1)
                    .attr("r", d.r + 3.5)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 3);

                // Show rich tooltip
                showTooltip(event, formatColorTooltip({
                    color: d.color,
                    colorName: `${d.dept} (${d.gender})`,
                    title: `🎓 ${d.name} (Roll #${d.id})`,
                    category: `${d.dept} Department`,
                    reason: `Trajectory streams into <b>${d.tierInfo.shortLabel}</b> outcome tier with <b>${d.percentage}%</b> aggregate and <b>${d.sgpa}</b> SGPA.`,
                    stats: [
                        `Maths: <b>${d.maths}</b> &bull; Science: <b>${d.science}</b>`,
                        `English: <b>${d.english}</b> &bull; Programming: <b>${d.programming}</b>`,
                        `Attendance: <b>${d.attendance}%</b>`,
                        `Semester Result: <b>${d.isPass ? 'PASSED' : 'ARREAR / BACKLOG'}</b>`
                    ],
                    rule: d.isPass ? "Eligible for standard autonomous CBCS degree certificate." : "Statutory remedial examination required for clearing backlog.",
                    actionHint: "Click bubble to immediately open official UGC marksheet card"
                }));

                // Update Footer
                d3.select("#heroFooterText").html(`Selected: <b>${d.name}</b> (${d.dept}) &bull; Aggregate: <b>${d.percentage}%</b> &bull; SGPA: <b>${d.sgpa}</b> &bull; Outcome: <b style="color:${d.tierInfo.color};">${d.tierInfo.label}</b>`);
                d3.select("#heroFooterActions").style("display", "flex");
            })
            .on("mousemove", function (event) {
                showTooltip(event, formatColorTooltip({
                    color: d.color,
                    colorName: `${d.dept} (${d.gender})`,
                    title: `🎓 ${d.name} (Roll #${d.id})`,
                    category: `${d.dept} Department`,
                    reason: `Streaming into <b>${d.tierInfo.shortLabel}</b> with <b>${d.percentage}%</b> aggregate.`,
                    stats: [
                        `Maths: <b>${d.maths}</b> &bull; Science: <b>${d.science}</b>`,
                        `English: <b>${d.english}</b> &bull; Programming: <b>${d.programming}</b>`,
                        `Attendance: <b>${d.attendance}%</b>`
                    ],
                    actionHint: "Click bubble to open marksheet card"
                }));
            })
            .on("mouseleave", function () {
                circle.attr("r", d.r).attr("stroke", "rgba(255,255,255,0.7)").attr("stroke-width", 1.5);
                hideTooltip();
                if (heroSelectedTier === 'All') clearHeroHighlight();
            })
            .on("click", function () {
                heroHighlightedStudentId = d.id;
                openProgressCard(d.id);
            });
    });

    // 4. Bottom Metric Axis
    const axisG = g.append("g")
        .attr("class", "axis hero-bottom-axis")
        .attr("transform", `translate(0,${chartHeight + 10})`);

    let axisFormat = d => `${d}%`;
    let axisLabel = "AGGREGATE COHORT MARKS PERCENTAGE (%)";
    if (heroChartMetric === 'sgpa') {
        axisFormat = d => d.toFixed(1);
        axisLabel = "SEMESTER GRADE POINT AVERAGE (SGPA 0-10.0)";
    } else if (heroChartMetric === 'attendance') {
        axisFormat = d => `${d}%`;
        axisLabel = "SEMESTER ATTENDANCE RECORD (%)";
    }

    axisG.call(d3.axisBottom(xScale).ticks(6).tickFormat(axisFormat));

    axisG.append("text")
        .attr("x", (xBoundary - 25) / 2)
        .attr("y", 30)
        .attr("fill", "#94a3b8")
        .attr("font-size", "10.5px")
        .attr("font-weight", "800")
        .attr("letter-spacing", "0.05em")
        .attr("text-anchor", "middle")
        .text(axisLabel);
}

/**
 * MODE B: Radial Institutional Orbit & Subject Competency Tree (Screenshot 4)
 */
function drawRadialOrbitChart(svg, data, targetStudentId) {
    const width = 1000;
    const height = 430;
    const centerX = width / 2;
    const centerY = height / 2 + 5;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
        .attr("transform", `translate(${centerX},${centerY})`);

    // Subtle concentric orbit guide circles
    [65, 120, 180].forEach(r => {
        g.append("circle")
            .attr("r", r)
            .attr("fill", "none")
            .attr("stroke", "rgba(255,255,255,0.06)")
            .attr("stroke-dasharray", "3,4");
    });

    // 1. Center Institutional Hub (BIET Autonomous)
    const centerG = g.append("g")
        .attr("class", "center-orbit-hub")
        .style("cursor", "pointer")
        .on("mouseenter", function (event) {
            showTooltip(event, formatColorTooltip({
                color: "#6366f1",
                colorName: "Autonomous Institution Core",
                title: "BIET Autonomous College",
                category: "Central Academic Hub",
                reason: "Central repository coordinating 5 engineering departments and UGC 10-point evaluation standard.",
                stats: [`Total Cohort: <b>${data.length} Enrolled</b>`]
            }));
        })
        .on("mouseleave", hideTooltip);

    centerG.append("circle")
        .attr("r", 36)
        .attr("fill", "#1e1b4b")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2.5)
        .style("filter", "drop-shadow(0 0 12px rgba(245, 158, 11, 0.4))");

    centerG.append("circle")
        .attr("r", 28)
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.15)")
        .attr("stroke-dasharray", "2,2");

    centerG.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -4)
        .attr("fill", "#fef08a")
        .attr("font-size", "11px")
        .attr("font-weight", "900")
        .text("BIET");

    centerG.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 10)
        .attr("fill", "#cbd5e1")
        .attr("font-size", "8.5px")
        .attr("font-weight", "700")
        .text("AUTONOMOUS");

    // 2. Department Branches (Orbit Ring 1 - Radius 115)
    const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
    const rDept = 115;
    const deptAngles = {};

    departments.forEach((dept, i) => {
        const angle = (i / departments.length) * 2 * Math.PI - Math.PI / 2;
        deptAngles[dept] = angle;
        const dx = Math.cos(angle) * rDept;
        const dy = Math.sin(angle) * rDept;

        // Radial branch stem from center to department
        g.append("line")
            .attr("x1", Math.cos(angle) * 36)
            .attr("y1", Math.sin(angle) * 36)
            .attr("x2", dx)
            .attr("y2", dy)
            .attr("stroke", HERO_DEPT_COLORS[dept])
            .attr("stroke-width", 2.5)
            .attr("stroke-opacity", 0.65);

        // Department Node
        const deptNodeG = g.append("g")
            .attr("transform", `translate(${dx},${dy})`)
            .style("cursor", "pointer")
            .on("mouseenter", function (event) {
                const count = data.filter(d => d.department === dept).length;
                showTooltip(event, formatColorTooltip({
                    color: HERO_DEPT_COLORS[dept],
                    colorName: dept,
                    title: `${DEPT_NAMES[dept] || dept} Department`,
                    category: "Engineering Branch",
                    reason: `Autonomous branch conducting 4-subject semester evaluation.`,
                    stats: [`Enrolled Students: <b>${count}</b>`]
                }));
            })
            .on("mouseleave", hideTooltip);

        deptNodeG.append("circle")
            .attr("r", 18)
            .attr("fill", "#0f172a")
            .attr("stroke", HERO_DEPT_COLORS[dept])
            .attr("stroke-width", 2)
            .style("filter", `drop-shadow(0 0 8px ${HERO_DEPT_COLORS[dept]})`);

        deptNodeG.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "#ffffff")
            .attr("font-size", "9.5px")
            .attr("font-weight", "800")
            .text(dept);
    });

    // 3. Student Nodes on Outer Orbit Ring (Radius 185) with Concentric Target Rings (Screenshot 4)
    const rStudent = 185;
    const studentsByDept = {};
    departments.forEach(dept => {
        studentsByDept[dept] = data.filter(d => d.department === dept);
    });

    departments.forEach(dept => {
        const deptStudents = studentsByDept[dept] || [];
        const baseAngle = deptAngles[dept];
        const spreadAngle = (2 * Math.PI / departments.length) * 0.72;

        deptStudents.forEach((student, idx) => {
            const offset = deptStudents.length > 1
                ? (idx - (deptStudents.length - 1) / 2) * (spreadAngle / deptStudents.length)
                : 0;
            const studentAngle = baseAngle + offset;

            const sx = Math.cos(studentAngle) * rStudent;
            const sy = Math.sin(studentAngle) * rStudent;

            const dx = Math.cos(baseAngle) * rDept;
            const dy = Math.sin(baseAngle) * rDept;

            // Connecting spoke from department to student
            g.append("line")
                .attr("x1", dx)
                .attr("y1", dy)
                .attr("x2", sx)
                .attr("y2", sy)
                .attr("stroke", HERO_DEPT_COLORS[dept])
                .attr("stroke-width", 1.2)
                .attr("stroke-opacity", 0.45);

            // Student Concentric Target Glyphs (Screenshot 4 Marvel-style target circles)
            const evalRes = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(student) : null;
            const isPass = evalRes ? evalRes.isPass : (student.maths >= 35 && student.science >= 35 && student.english >= 35 && student.programming >= 35);
            const pct = evalRes ? evalRes.percentage : ((student.maths + student.science + student.english + student.programming) / 4);

            const studG = g.append("g")
                .attr("transform", `translate(${sx},${sy})`)
                .style("cursor", "pointer")
                .on("mouseenter", function (event) {
                    showTooltip(event, formatColorTooltip({
                        color: HERO_DEPT_COLORS[dept],
                        colorName: `${student.name} (${dept})`,
                        title: `🎓 ${student.name}`,
                        category: "Student Target Profile",
                        reason: `Concentric rings depict subject performance: Outer (Programming), Middle (Maths), Core (Result Status).`,
                        stats: [
                            `Aggregate: <b>${pct}%</b> &bull; SGPA: <b>${evalRes ? evalRes.sgpa : '-'}</b>`,
                            `Maths: <b>${student.maths}</b> &bull; Prog: <b>${student.programming}</b>`,
                            `Status: <b>${isPass ? 'PASSED' : 'ARREAR'}</b>`
                        ],
                        actionHint: "Click to view official marksheet"
                    }));
                })
                .on("mouseleave", hideTooltip)
                .on("click", function () {
                    openProgressCard(student.id);
                });

            // Outer ring: Programming performance color
            const progColor = student.programming >= 80 ? "#a855f7" : (student.programming >= 35 ? "#38bdf8" : "#f43f5e");
            studG.append("circle")
                .attr("r", 9)
                .attr("fill", "none")
                .attr("stroke", progColor)
                .attr("stroke-width", 2.2);

            // Middle ring: Maths performance color
            const mathsColor = student.maths >= 80 ? "#6366f1" : (student.maths >= 35 ? "#34d399" : "#f43f5e");
            studG.append("circle")
                .attr("r", 5.5)
                .attr("fill", "none")
                .attr("stroke", mathsColor)
                .attr("stroke-width", 1.8);

            // Core dot: Result Pass / Fail
            studG.append("circle")
                .attr("r", 2.8)
                .attr("fill", isPass ? "#10b981" : "#f43f5e");

            // Name text angled radially outwards
            const isRight = Math.cos(studentAngle) >= 0;
            const textAngle = studentAngle * 180 / Math.PI;
            const labelDist = 14;

            studG.append("text")
                .attr("transform", `rotate(${isRight ? textAngle : textAngle + 180}) translate(${isRight ? labelDist : -labelDist}, 3)`)
                .attr("text-anchor", isRight ? "start" : "end")
                .attr("fill", "#cbd5e1")
                .attr("font-size", "9px")
                .attr("font-weight", "600")
                .text(student.name.split(" ")[0]);
        });
    });
}

/* ====================================================
   DIRECT IN-GRAPH TOUCH INSPECTOR LOGIC
   (Renders information directly INSIDE the graph containers)
==================================================== */

// 1. IN-GRAPH GRADE DONUT DRAWER
function openInGraphGradeDrawer(gradeItem, matchingStudents) {
    const tray = d3.select("#trayGradeChart");
    if (tray.empty()) return;

    const totalStudentsCount = (typeof students !== 'undefined' && students.length > 0) ? students.length : 100;
    const avgScore = matchingStudents.length > 0 ? (d3.mean(matchingStudents, s => s.average || ((s.maths+s.science+s.english+s.programming)/4)) || 0).toFixed(1) : 0;
    const maxScore = matchingStudents.length > 0 ? (d3.max(matchingStudents, s => s.average || ((s.maths+s.science+s.english+s.programming)/4)) || 0).toFixed(1) : 0;
    const minScore = matchingStudents.length > 0 ? (d3.min(matchingStudents, s => s.average || ((s.maths+s.science+s.english+s.programming)/4)) || 0).toFixed(1) : 0;
    const sharePct = ((matchingStudents.length / totalStudentsCount) * 100).toFixed(1);

    tray.html(`
        <div class="in-graph-tray-header">
            <div class="in-graph-tray-title">
                <span style="width:10px; height:10px; border-radius:50%; background:${gradeItem.color}; box-shadow:0 0 8px ${gradeItem.color}; display:inline-block;"></span>
                <span>${gradeItem.name} (${matchingStudents.length} Students)</span>
            </div>
            <button type="button" class="in-graph-tray-close" onclick="closeInGraphGradeDrawer()">
                ✕ Back to Donut
            </button>
        </div>

        <div class="in-graph-stat-grid">
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Students</span>
                <span class="in-graph-stat-val" style="color:${gradeItem.color};">${matchingStudents.length}</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Cohort Share</span>
                <span class="in-graph-stat-val">${sharePct}%</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Tier Average</span>
                <span class="in-graph-stat-val">${avgScore}%</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Score Range</span>
                <span class="in-graph-stat-val">${minScore}% – ${maxScore}%</span>
            </div>
        </div>

        <div class="in-graph-roster-header">
            <span>STUDENT ROSTER IN THIS TIER</span>
            <span>ROLL NO • DEPT • MARKS</span>
        </div>

        <div class="in-graph-roster-list">
            ${matchingStudents.map(s => {
                const sPct = s.average ? d3.format(".1f")(s.average) : ((s.maths+s.science+s.english+s.programming)/4).toFixed(1);
                return `
                    <div class="in-graph-student-row">
                        <div class="in-graph-stud-left">
                            <span class="in-graph-stud-roll">${s.rollNo || ('22A91A05' + String(s.id).padStart(2,'0'))}</span>
                            <span class="in-graph-stud-name">${s.name}</span>
                            <span class="in-graph-stud-dept">${s.department}</span>
                        </div>
                        <div class="in-graph-stud-right">
                            <span class="in-graph-stud-score" style="color:${gradeItem.color};">${sPct}%</span>
                            <button type="button" class="in-graph-btn-card" onclick="openProgressCard(${s.id})" title="Inspect Marksheet">
                                🎓 Marksheet
                            </button>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `);

    tray.classed("active", true);
    showToast(`Inside Donut: Inspected Grade ${gradeItem.grade} (${matchingStudents.length} students)`, "info");
}

function closeInGraphGradeDrawer() {
    d3.select("#trayGradeChart").classed("active", false);
}

// 2. IN-GRAPH SUBJECT BAR DRAWER
function openInGraphSubjectDrawer(subjectItem, data) {
    const tray = d3.select("#traySubjectChart");
    if (tray.empty()) return;

    const scores = data.map(d => ({ student: d, mark: d[subjectItem.key] || 0 })).sort((a, b) => b.mark - a.mark);
    const avg = data.length > 0 ? (d3.mean(scores, d => d.mark) || 0).toFixed(1) : 0;
    const passCount = scores.filter(d => d.mark >= 35).length;
    const passRate = data.length > 0 ? ((passCount / data.length) * 100).toFixed(1) : 0;
    const topper = scores[0] || { student: { name: '-', rollNo: '-' }, mark: 0 };
    const lowest = scores[scores.length - 1] || { student: { name: '-', rollNo: '-' }, mark: 0 };

    tray.html(`
        <div class="in-graph-tray-header">
            <div class="in-graph-tray-title">
                <span style="width:10px; height:10px; border-radius:50%; background:${subjectItem.color}; box-shadow:0 0 8px ${subjectItem.color}; display:inline-block;"></span>
                <span>${subjectItem.subject || subjectItem.name} Performance Intelligence</span>
            </div>
            <button type="button" class="in-graph-tray-close" onclick="closeInGraphSubjectDrawer()">
                ✕ Back to Bars
            </button>
        </div>

        <div class="in-graph-stat-grid">
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Subject Mean</span>
                <span class="in-graph-stat-val" style="color:${subjectItem.color};">${avg} / 100</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Pass Clearance</span>
                <span class="in-graph-stat-val">${passCount}/${data.length} (${passRate}%)</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Highest Score</span>
                <span class="in-graph-stat-val" style="color:#10b981;">${topper.mark} (${topper.student.name.split(' ')[0]})</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Lowest Score</span>
                <span class="in-graph-stat-val" style="color:#f43f5e;">${lowest.mark} (${lowest.student.name.split(' ')[0]})</span>
            </div>
        </div>

        <div class="in-graph-roster-header">
            <span>RANKED STUDENT SCORES IN THIS SUBJECT</span>
            <span>ROLL NO • DEPT • MARKS</span>
        </div>

        <div class="in-graph-roster-list">
            ${scores.map((item, idx) => {
                const s = item.student;
                const isArrear = item.mark < 35;
                return `
                    <div class="in-graph-student-row" style="${isArrear ? 'border-color:rgba(244,63,94,0.3); background:rgba(244,63,94,0.06);' : ''}">
                        <div class="in-graph-stud-left">
                            <b style="font-size:10px; color:#94a3b8; min-width:18px;">#${idx + 1}</b>
                            <span class="in-graph-stud-roll">${s.rollNo || ('22A91A05' + String(s.id).padStart(2,'0'))}</span>
                            <span class="in-graph-stud-name">${s.name}</span>
                            <span class="in-graph-stud-dept">${s.department}</span>
                        </div>
                        <div class="in-graph-stud-right">
                            <span class="in-graph-stud-score" style="color:${isArrear ? '#f43f5e' : subjectItem.color};">
                                ${item.mark} / 100 ${isArrear ? '<b style="font-size:9px;">(FAIL)</b>' : ''}
                            </span>
                            <button type="button" class="in-graph-btn-card" onclick="openProgressCard(${s.id})" title="Inspect Marksheet">
                                🎓 Marksheet
                            </button>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `);

    tray.classed("active", true);
    showToast(`Inside Bar Chart: Inspected ${subjectItem.subject || subjectItem.name} across ${data.length} students`, "info");
}

function closeInGraphSubjectDrawer() {
    d3.select("#traySubjectChart").classed("active", false);
}

// 3. IN-GRAPH GENDER DRAWER
function openInGraphGenderDrawer(gender, data) {
    const tray = d3.select("#trayGenderChart");
    if (tray.empty()) return;

    const filtered = data.filter(d => d.gender === gender);
    const avg = filtered.length > 0 ? (d3.mean(filtered, d => d.average || ((d.maths+d.science+d.english+d.programming)/4)) || 0).toFixed(1) : 0;
    const passCount = filtered.filter(d => d.status === 'Pass').length;
    const passRate = filtered.length > 0 ? ((passCount / filtered.length) * 100).toFixed(1) : 0;
    const sorted = [...filtered].sort((a, b) => (b.average || 0) - (a.average || 0));
    const topper = sorted[0] || { name: '-', rollNo: '-', average: 0 };
    const color = gender === 'Female' ? '#ec4899' : '#0ea5e9';

    tray.html(`
        <div class="in-graph-tray-header">
            <div class="in-graph-tray-title">
                <span style="width:10px; height:10px; border-radius:50%; background:${color}; box-shadow:0 0 8px ${color}; display:inline-block;"></span>
                <span>${gender === 'Female' ? '👩 Female' : '👨 Male'} Cohort Breakdown (${filtered.length} Students)</span>
            </div>
            <button type="button" class="in-graph-tray-close" onclick="closeInGraphGenderDrawer()">
                ✕ Back to Gender Bars
            </button>
        </div>

        <div class="in-graph-stat-grid">
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Enrolled</span>
                <span class="in-graph-stat-val" style="color:${color};">${filtered.length} Students</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Mean Score</span>
                <span class="in-graph-stat-val">${avg}%</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Pass Rate</span>
                <span class="in-graph-stat-val">${passCount}/${filtered.length} (${passRate}%)</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Cohort Topper</span>
                <span class="in-graph-stat-val" style="color:#10b981;">${topper.name.split(' ')[0]} (${(topper.average||0).toFixed(1)}%)</span>
            </div>
        </div>

        <div class="in-graph-roster-header">
            <span>${gender.toUpperCase()} STUDENTS RANKED BY PERFORMANCE</span>
            <span>ROLL NO • DEPT • MARKS</span>
        </div>

        <div class="in-graph-roster-list">
            ${sorted.map((s, idx) => {
                const sPct = s.average ? d3.format(".1f")(s.average) : ((s.maths+s.science+s.english+s.programming)/4).toFixed(1);
                return `
                    <div class="in-graph-student-row">
                        <div class="in-graph-stud-left">
                            <b style="font-size:10px; color:#94a3b8; min-width:18px;">#${idx + 1}</b>
                            <span class="in-graph-stud-roll">${s.rollNo || ('22A91A05' + String(s.id).padStart(2,'0'))}</span>
                            <span class="in-graph-stud-name">${s.name}</span>
                            <span class="in-graph-stud-dept">${s.department}</span>
                        </div>
                        <div class="in-graph-stud-right">
                            <span class="in-graph-stud-score" style="color:${color};">${sPct}%</span>
                            <button type="button" class="in-graph-btn-card" onclick="openProgressCard(${s.id})" title="Inspect Marksheet">
                                🎓 Marksheet
                            </button>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `);

    tray.classed("active", true);
    showToast(`Inside Gender Graph: Inspected ${gender} students (${filtered.length} students)`, "info");
}

function closeInGraphGenderDrawer() {
    d3.select("#trayGenderChart").classed("active", false);
}

// 4. IN-GRAPH ATTENDANCE DRAWER
function openInGraphAttendanceDrawer(student) {
    const tray = d3.select("#trayAttendanceChart");
    if (tray.empty()) return;

    const sPct = student.average ? d3.format(".1f")(student.average) : ((student.maths+student.science+student.english+student.programming)/4).toFixed(1);
    const isEligible = student.attendance >= 75;

    tray.html(`
        <div class="in-graph-tray-header">
            <div class="in-graph-tray-title">
                <span style="width:10px; height:10px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981; display:inline-block;"></span>
                <span>${student.name} • Biometric & Marks Diagnostic</span>
            </div>
            <button type="button" class="in-graph-tray-close" onclick="closeInGraphAttendanceDrawer()">
                ✕ Back to Scatter
            </button>
        </div>

        <div class="in-graph-stat-grid">
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Attendance</span>
                <span class="in-graph-stat-val" style="color:${isEligible ? '#10b981' : '#f43f5e'};">${student.attendance}%</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Aggregate Score</span>
                <span class="in-graph-stat-val">${sPct}%</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Grade Standing</span>
                <span class="in-graph-stat-val">Grade ${student.grade} (${student.status})</span>
            </div>
            <div class="in-graph-stat-box">
                <span class="in-graph-stat-label">Exam Clearance</span>
                <span class="in-graph-stat-val" style="color:${isEligible ? '#10b981' : '#f43f5e'};">${isEligible ? 'Eligible ✅' : 'Shortage Alert ⚠️'}</span>
            </div>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:12px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div>
                    <span style="font-weight:800; font-size:14px; color:#ffffff;">${student.name}</span>
                    <span style="font-size:11px; color:#818cf8; margin-left:8px; font-family:'Space Grotesk', monospace;">${student.rollNo || ('22A91A05' + String(student.id).padStart(2,'0'))}</span>
                </div>
                <button type="button" class="in-graph-btn-card" onclick="openProgressCard(${student.id})">
                    🎓 Open Marksheet
                </button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; font-size:11.5px;">
                <div style="background:rgba(255,255,255,0.04); padding:6px; border-radius:6px; text-align:center;">Maths: <b style="color:#818cf8;">${student.maths}</b></div>
                <div style="background:rgba(255,255,255,0.04); padding:6px; border-radius:6px; text-align:center;">Science: <b style="color:#38bdf8;">${student.science}</b></div>
                <div style="background:rgba(255,255,255,0.04); padding:6px; border-radius:6px; text-align:center;">English: <b style="color:#34d399;">${student.english}</b></div>
                <div style="background:rgba(255,255,255,0.04); padding:6px; border-radius:6px; text-align:center;">Prog: <b style="color:#c084fc;">${student.programming}</b></div>
            </div>
        </div>
    `);

    tray.classed("active", true);
}

function closeInGraphAttendanceDrawer() {
    d3.select("#trayAttendanceChart").classed("active", false);
}

/* ----------------------------------------------------
   FACULTY COHORT VISUALIZATIONS
---------------------------------------------------- */
function renderFacultyVisualizations(data) {
    d3.select("#chartTitle1").html("📚 Cohort Subject Average Marks <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle2").html("🍩 Grade & Result Distribution <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle3").html("📈 Attendance vs Performance <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle4").html("⚖️ Gender-wise Performance <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");

    // Render Featured Hero Conduit / Orbit Chart
    drawHeroCohortVisualization(data);

    // Render Grid Charts
    drawFacultySubjectChart(data);
    drawFacultyGradeChart(data);
    drawFacultyAttendanceChart(data);
    drawFacultyGenderChart(data);
}

function drawFacultySubjectChart(data) {
    const container = d3.select("#subjectChart");
    container.selectAll("*").remove();

    const node = d3.select("#subjectChart").node();
    const width = node ? (node.clientWidth || 500) : 500;
    const height = 300;
    const margin = { top: 30, right: 25, bottom: 45, left: 52 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const subjects = [
        {
            name: "Maths",
            key: "maths",
            gradId: "url(#gradMaths)",
            color: "#6366f1",
            colorName: "Royal Indigo / Violet (#6366f1)",
            category: "Core Analytical Domain",
            reason: "Indigo represents Mathematics and quantitative problem solving. Used for core mathematical logic, calculus, and analytical reasoning foundations."
        },
        {
            name: "Science",
            key: "science",
            gradId: "url(#gradScience)",
            color: "#0ea5e9",
            colorName: "Sky / Ocean Blue (#0ea5e9)",
            category: "Foundational Science Domain",
            reason: "Sky blue represents Applied Science and physics/chemistry laboratory sciences, denoting empirical research and physical engineering concepts."
        },
        {
            name: "English",
            key: "english",
            gradId: "url(#gradEnglish)",
            color: "#10b981",
            colorName: "Emerald Mint Green (#10b981)",
            category: "Humanities & Soft Skills",
            reason: "Emerald green represents Professional English & Communication. Symbolizes verbal proficiency, articulate presentation, and human relations."
        },
        {
            name: "Programming",
            key: "programming",
            gradId: "url(#gradProg)",
            color: "#a855f7",
            colorName: "Neon Purple / Magenta (#a855f7)",
            category: "Computer Science Domain",
            reason: "Neon purple represents Computer Programming and software engineering. Symbolizes algorithm design, syntax mastery, and computational logic."
        }
    ];

    const chartData = subjects.map(s => {
        const scores = data.map(d => d[s.key] || 0);
        const avg = data.length === 0 ? 0 : (d3.mean(scores) || 0);
        const max = data.length === 0 ? 0 : (d3.max(scores) || 0);
        const passCount = data.filter(d => (d[s.key] || 0) >= 35).length;
        const passPct = data.length === 0 ? 0 : ((passCount / data.length) * 100).toFixed(1);
        return {
            subject: s.name,
            key: s.key,
            gradId: s.gradId,
            color: s.color,
            colorName: s.colorName,
            category: s.category,
            reason: s.reason,
            average: avg,
            maxScore: max,
            passCount: passCount,
            passPct: passPct
        };
    });

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    injectSvgGradients(container);

    const x = d3.scaleBand().domain(chartData.map(d => d.subject)).range([0, chartWidth]).padding(0.38);
    const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]).nice();

    // Grid lines
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""));

    // Reference Pass threshold line (35 marks)
    const passLine = svg.append("line")
        .attr("x1", 0).attr("y1", y(35))
        .attr("x2", chartWidth).attr("y2", y(35))
        .attr("stroke", "#f43f5e")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event) {
            d3.select(this).attr("stroke-width", 3.5).attr("stroke", "#fb7185");
            showTooltip(event, formatColorTooltip({
                color: "#f43f5e",
                colorName: "Crimson Rose (#f43f5e)",
                title: "Statutory 35-Mark Passing Cutoff Line",
                category: "Institutional Evaluation Rule",
                reason: "Crimson red indicates the mandatory minimum pass cutoff (35/100). Any score below this line is classified as Grade F (Arrear).",
                stats: ["Minimum Qualifying Mark: <b>35 / 100</b>", "Below 35: <b>Arrear (Grade F)</b>", "35 and Above: <b>Cleared (Grade D to O)</b>"],
                rule: "Autonomous University Regulation • Mandatory clearance in all 4 subjects to earn semester grade card.",
                actionHint: "Hover on any subject bar to view its cohort pass clearance rate"
            }));
        })
        .on("mousemove", function (event) {
            showTooltip(event, formatColorTooltip({
                color: "#f43f5e",
                colorName: "Crimson Rose (#f43f5e)",
                title: "Statutory 35-Mark Passing Cutoff Line",
                category: "Institutional Evaluation Rule",
                reason: "Crimson red indicates the mandatory minimum pass cutoff (35/100). Any score below this line is classified as Grade F (Arrear).",
                stats: ["Minimum Qualifying Mark: <b>35 / 100</b>", "Below 35: <b>Arrear (Grade F)</b>", "35 and Above: <b>Cleared (Grade D to O)</b>"],
                rule: "Autonomous University Regulation • Mandatory clearance in all 4 subjects to earn semester grade card."
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).attr("stroke-width", 2).attr("stroke", "#f43f5e");
            hideTooltip();
        });

    // Bars
    svg.selectAll(".bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.subject))
        .attr("width", x.bandwidth())
        .attr("y", chartHeight)
        .attr("height", 0)
        .attr("rx", 6)
        .attr("fill", d => d.gradId)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            d3.select(this).style("filter", `brightness(1.25) drop-shadow(0 0 10px ${d.color})`);
            showTooltip(event, formatColorTooltip({
                color: d.color,
                colorName: d.colorName,
                title: `${d.subject} Performance Evaluation`,
                category: d.category,
                reason: d.reason,
                stats: [
                    `Cohort Average: <b>${d3.format(".1f")(d.average)} / 100</b>`,
                    `Pass Rate: <b>${d.passCount}/${data.length} (${d.passPct}%)</b>`,
                    `Highest Score: <b>${d.maxScore} / 100</b>`
                ],
                rule: "UGC / CBCS Autonomous Course • Passing cutoff: 35 marks.",
                actionHint: `Click to sort student table by ${d.subject} marks`
            }));
        })
        .on("mousemove", function (event, d) {
            showTooltip(event, formatColorTooltip({
                color: d.color,
                colorName: d.colorName,
                title: `${d.subject} Performance Evaluation`,
                category: d.category,
                reason: d.reason,
                stats: [
                    `Cohort Average: <b>${d3.format(".1f")(d.average)} / 100</b>`,
                    `Pass Rate: <b>${d.passCount}/${data.length} (${d.passPct}%)</b>`,
                    `Highest Score: <b>${d.maxScore} / 100</b>`
                ],
                rule: "UGC / CBCS Autonomous Course • Passing cutoff: 35 marks.",
                actionHint: `Click to sort student table by ${d.subject} marks`
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).style("filter", "none");
            hideTooltip();
        })
        .on("click pointerdown", function (event, d) {
            openInGraphSubjectDrawer(d, data);
        })
        .transition()
        .duration(600)
        .attr("y", d => y(d.average))
        .attr("height", d => Math.max(0, chartHeight - y(d.average)));

    // Value labels on bars
    svg.selectAll(".bar-label")
        .data(chartData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.subject) + x.bandwidth() / 2)
        .attr("y", d => y(d.average) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .attr("font-size", "12px")
        .attr("font-weight", "800")
        .attr("opacity", 0)
        .text(d => `${d3.format(".1f")(d.average)}%`)
        .transition()
        .delay(350)
        .duration(400)
        .attr("opacity", 1);

    // Axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    // Render Bottom Interactive Legend Bar
    const legendItems = chartData.map(d => ({
        label: d.subject,
        color: d.color,
        badge: `${d.average.toFixed(1)}%`,
        info: {
            color: d.color,
            colorName: d.colorName,
            title: `${d.subject} Curriculum Domain`,
            category: d.category,
            reason: d.reason,
            stats: [`Cohort Average: <b>${d.average.toFixed(1)}%</b>`, `Passed: <b>${d.passCount}/${data.length} (${d.passPct}%)</b>`],
            rule: "Autonomous University Subject • Minimum clearance: 35 marks",
            actionHint: `Click to inspect ${d.subject} scores inside graph`
        },
        onClick: () => openInGraphSubjectDrawer(d, data)
    }));

    // Add 35-mark pass threshold item
    legendItems.push({
        label: "Pass Cutoff",
        color: "#f43f5e",
        badge: "35 Marks",
        info: {
            color: "#f43f5e",
            colorName: "Crimson Red (#f43f5e)",
            title: "Statutory Pass Cutoff (35 Marks)",
            category: "Institutional Standard",
            reason: "Crimson dashed line indicates the 35% passing mark. Any score below this is marked as an Arrear.",
            stats: ["Threshold: <b>35 / 100 Marks</b>"],
            rule: "Mandatory subject clearance cutoff"
        }
    });

    renderChartLegend("#legendSubjectChart", legendItems);
}

function drawFacultyGradeChart(data) {
    const container = d3.select("#gradeChart");
    container.selectAll("*").remove();

    const node = d3.select("#gradeChart").node();
    const width = node ? (node.clientWidth || 500) : 500;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const gradeOrder = ['O', 'A', 'B', 'C', 'D', 'F'];
    const gradeMeta = {
        'O': {
            name: "Grade O (Outstanding)",
            color: '#f59e0b',
            colorName: "Golden Amber (#f59e0b)",
            category: "Topper Distinction Tier",
            points: "10.0",
            range: "≥ 90.0%",
            reason: "Golden amber indicates supreme academic distinction (Grade Point 10.0, ≥ 90%). Awarded for exemplary mastery of all coursework."
        },
        'A': {
            name: "Grade A (Excellent)",
            color: '#10b981',
            colorName: "Emerald Green (#10b981)",
            category: "First Class with Distinction",
            points: "9.0",
            range: "80.0% – 89.9%",
            reason: "Emerald green represents excellent proficiency and consistent top-quartile performance across engineering modules."
        },
        'B': {
            name: "Grade B (Very Good)",
            color: '#06b6d4',
            colorName: "Electric Cyan (#06b6d4)",
            category: "First Class Tier",
            points: "8.0",
            range: "70.0% – 79.9%",
            reason: "Electric cyan indicates strong concept mastery, commendable lab work, and above-average academic performance."
        },
        'C': {
            name: "Grade C (Good / Average)",
            color: '#8b5cf6',
            colorName: "Neon Violet (#8b5cf6)",
            category: "Second Class Tier",
            points: "7.0",
            range: "60.0% – 69.9%",
            reason: "Neon violet indicates standard competence, fulfilling required autonomous learning outcomes and satisfactory assignments."
        },
        'D': {
            name: "Grade D (Pass / Borderline)",
            color: '#f97316',
            colorName: "Coral Orange (#f97316)",
            category: "Minimum Passing Classification",
            points: "6.0",
            range: "35.0% – 59.9%",
            reason: "Coral orange signals a passing grade near the lower cutoff threshold (35–59%). Student cleared all subjects but requires reinforcement."
        },
        'F': {
            name: "Grade F (Arrear / Fail)",
            color: '#f43f5e',
            colorName: "Crimson Red (#f43f5e)",
            category: "Academic Alert & Remedial",
            points: "0.0",
            range: "< 35.0% in any subject",
            reason: "Crimson red indicates an Arrear: student scored < 35 marks in one or more subjects. Mandatory remedial classes and re-examination required."
        }
    };

    const counts = {};
    gradeOrder.forEach(g => counts[g] = 0);
    data.forEach(d => { if (counts[d.grade] !== undefined) counts[d.grade]++; });

    const pieData = gradeOrder.map(g => ({
        grade: g,
        count: counts[g],
        ...gradeMeta[g]
    })).filter(d => d.count > 0);

    const pie = d3.pie().value(d => d.count).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.56).outerRadius(radius);
    const hoverArc = d3.arc().innerRadius(radius * 0.52).outerRadius(radius * 1.08);

    const path = svg.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("fill", d => d.data.color)
        .attr("stroke", "#111827")
        .attr("stroke-width", 2.5)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            d3.select(this).transition().duration(200).attr("d", hoverArc);
            const pct = data.length > 0 ? ((d.data.count / data.length) * 100).toFixed(1) : 0;
            showTooltip(event, formatColorTooltip({
                color: d.data.color,
                colorName: d.data.colorName,
                title: d.data.name,
                category: d.data.category,
                reason: d.data.reason,
                stats: [
                    `Student Count: <b>${d.data.count} Students (${pct}% of cohort)</b>`,
                    `Mark Range: <b>${d.data.range}</b>`,
                    `UGC Grade Point: <b>${d.data.points} / 10.0</b>`
                ],
                rule: `UGC 10-Point CBCS Scale • ${d.data.category}`,
                actionHint: `Click slice to filter table by Grade ${d.data.grade}`
            }));
        })
        .on("mousemove", function (event, d) {
            const pct = data.length > 0 ? ((d.data.count / data.length) * 100).toFixed(1) : 0;
            showTooltip(event, formatColorTooltip({
                color: d.data.color,
                colorName: d.data.colorName,
                title: d.data.name,
                category: d.data.category,
                reason: d.data.reason,
                stats: [
                    `Student Count: <b>${d.data.count} Students (${pct}% of cohort)</b>`,
                    `Mark Range: <b>${d.data.range}</b>`,
                    `UGC Grade Point: <b>${d.data.points} / 10.0</b>`
                ],
                rule: `UGC 10-Point CBCS Scale • ${d.data.category}`,
                actionHint: `Click slice to filter table by Grade ${d.data.grade}`
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).transition().duration(200).attr("d", arc);
            hideTooltip();
        })
        .on("click pointerdown", function (event, d) {
            const matchingStudents = data.filter(s => {
                const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(s) : null;
                const pct = ev ? ev.percentage : Number(((s.maths + s.science + s.english + s.programming) / 4).toFixed(1));
                const isPass = ev ? ev.isPass : (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35);
                const grade = isPass ? (pct >= 90 ? 'O' : (pct >= 80 ? 'A' : (pct >= 70 ? 'B' : (pct >= 60 ? 'C' : 'D')))) : 'F';
                return grade === d.data.grade;
            });

            // Update donut center telemetry
            d3.select("#donutCenterVal").text(matchingStudents.length).style("fill", d.data.color);
            d3.select("#donutCenterLbl").text(`GRADE ${d.data.grade}`).style("fill", d.data.color);

            // Open DIRECT IN-GRAPH DRAWER right inside the chart card
            openInGraphGradeDrawer(d.data, matchingStudents);
        });

    path.transition()
        .duration(600)
        .attrTween("d", function (d) {
            const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) { return arc(i(t)); };
        });

    // Donut Center Text & Touch target
    const centerG = svg.append("g")
        .attr("class", "donut-touch-center")
        .style("cursor", "pointer")
        .attr("title", "Touch center to reset")
        .on("click pointerdown", () => {
            d3.select("#donutCenterVal").text(data.length).style("fill", "#ffffff");
            d3.select("#donutCenterLbl").text("STUDENTS").style("fill", "#94a3b8");
            closeInGraphGradeDrawer();
        });

    centerG.append("circle")
        .attr("r", radius * 0.52)
        .attr("fill", "rgba(15, 23, 42, 0.8)")
        .attr("stroke", "rgba(255, 255, 255, 0.1)")
        .attr("stroke-width", 1.5);

    centerG.append("text")
        .attr("id", "donutCenterVal")
        .attr("text-anchor", "middle")
        .attr("dy", "-2px")
        .attr("font-size", "26px")
        .attr("font-weight", "900")
        .attr("fill", "#ffffff")
        .text(data.length);

    centerG.append("text")
        .attr("id", "donutCenterLbl")
        .attr("text-anchor", "middle")
        .attr("dy", "18px")
        .attr("font-size", "10px")
        .attr("font-weight", "800")
        .attr("letter-spacing", "0.08em")
        .attr("fill", "#94a3b8")
        .text("STUDENTS");

    // Render Bottom Interactive Legend Bar
    const legendItems = gradeOrder.map(g => {
        const meta = gradeMeta[g];
        const count = counts[g] || 0;
        const pct = data.length > 0 ? ((count / data.length) * 100).toFixed(0) : 0;
        return {
            label: `Grade ${g}`,
            color: meta.color,
            badge: `${count} (${pct}%)`,
            info: {
                color: meta.color,
                colorName: meta.colorName,
                title: meta.name,
                category: meta.category,
                reason: meta.reason,
                stats: [
                    `Cohort Count: <b>${count} Students (${pct}%)</b>`,
                    `Score Criteria: <b>${meta.range}</b>`,
                    `Grade Point: <b>${meta.points}</b>`
                ],
                rule: "UGC CBCS Official Scale",
                actionHint: `Click to inspect Grade ${g} students inside graph`
            },
            onClick: () => {
                const matchingStudents = data.filter(s => {
                    const ev = (typeof calculateSemesterEvaluation === 'function') ? calculateSemesterEvaluation(s) : null;
                    const pct = ev ? ev.percentage : Number(((s.maths + s.science + s.english + s.programming) / 4).toFixed(1));
                    const isPass = ev ? ev.isPass : (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35);
                    const grade = isPass ? (pct >= 90 ? 'O' : (pct >= 80 ? 'A' : (pct >= 70 ? 'B' : (pct >= 60 ? 'C' : 'D')))) : 'F';
                    return grade === g;
                });
                d3.select("#donutCenterVal").text(matchingStudents.length).style("fill", meta.color);
                d3.select("#donutCenterLbl").text(`GRADE ${g}`).style("fill", meta.color);
                openInGraphGradeDrawer({ ...meta, grade: g }, matchingStudents);
            }
        };
    });

    renderChartLegend("#legendGradeChart", legendItems);
}

function drawFacultyAttendanceChart(data) {
    const container = d3.select("#attendanceChart");
    container.selectAll("*").remove();

    const node = d3.select("#attendanceChart").node();
    const width = node ? (node.clientWidth || 500) : 500;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 45, left: 52 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([40, 100]).range([0, chartWidth]).nice();
    const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]).nice();

    // Grid lines
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""));

    // Passing & Attendance threshold boundary lines
    const attLine = svg.append("line")
        .attr("x1", x(75)).attr("y1", 0)
        .attr("x2", x(75)).attr("y2", chartHeight)
        .attr("stroke", "#f59e0b")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event) {
            d3.select(this).attr("stroke-width", 3.5);
            showTooltip(event, formatColorTooltip({
                color: "#f59e0b",
                colorName: "Golden Amber (#f59e0b)",
                title: "75% Attendance Eligibility Line",
                category: "Statutory Examination Rule",
                reason: "Amber vertical line indicates the 75% attendance cutoff. Students to the right (≥75%) are eligible for Semester End Exams; students to the left (<75%) face condonation penalties.",
                stats: ["Statutory Minimum: <b>75.0%</b>", "Right Zone (≥75%): <b>✅ Exam Eligible</b>", "Left Zone (<75%): <b>⚠️ Shortage Warning</b>"],
                rule: "Autonomous College Academic Regulations • 75% Biometric Attendance Requirement"
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).attr("stroke-width", 2);
            hideTooltip();
        });

    const markLine = svg.append("line")
        .attr("x1", 0).attr("y1", y(35))
        .attr("x2", chartWidth).attr("y2", y(35))
        .attr("stroke", "rgba(244, 63, 94, 0.5)")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event) {
            d3.select(this).attr("stroke-width", 3.5).attr("stroke", "#f43f5e");
            showTooltip(event, formatColorTooltip({
                color: "#f43f5e",
                colorName: "Crimson Red (#f43f5e)",
                title: "35% Minimum Passing Score Cutoff",
                category: "Statutory Examination Rule",
                reason: "Horizontal red line indicates 35% mark threshold. Points below this line indicate students with overall failing averages.",
                stats: ["Minimum Cutoff: <b>35% Marks</b>"]
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).attr("stroke-width", 2).attr("stroke", "rgba(244, 63, 94, 0.5)");
            hideTooltip();
        });

    // Circles for each student
    svg.selectAll(".dot")
        .data(data, d => d.id)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.attendance))
        .attr("cy", d => y(d.average))
        .attr("r", 0)
        .attr("fill", d => d.status === "Pass" ? "#10b981" : "#f43f5e")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            const isPass = d.status === "Pass";
            const color = isPass ? "#10b981" : "#f43f5e";
            const colorName = isPass ? "Emerald Green (#10b981)" : "Crimson Red (#f43f5e)";
            const reason = isPass
                ? "Emerald Green dot indicates the student passed all 4 subjects (≥ 35 marks each) with verified clearance."
                : "Crimson Red dot indicates an Arrear alert: student scored < 35 marks in one or more subjects.";

            d3.select(this).transition().duration(150).attr("r", 9).attr("stroke", "#818cf8").attr("stroke-width", 3);
            showTooltip(event, formatColorTooltip({
                color: color,
                colorName: colorName,
                title: `#${d.id} - ${d.name} (${d.department})`,
                category: isPass ? "🟢 All Subjects Cleared" : "🔴 Arrear / Fail",
                reason: reason,
                stats: [
                    `Average: <b>${d3.format(".1f")(d.average)}% (Grade ${d.grade})</b>`,
                    `Attendance: <b>${d.attendance}% (${d.attendance >= 75 ? "✅ Eligible" : "⚠️ Shortage"})</b>`,
                    `Marks Breakdown: <b>M:${d.maths} S:${d.science} E:${d.english} P:${d.programming}</b>`
                ],
                rule: `Result: ${d.status} | Division: ${d.division}`,
                actionHint: "Click to open official printable Marksheet Card"
            }));
        })
        .on("mousemove", function (event, d) {
            const isPass = d.status === "Pass";
            const color = isPass ? "#10b981" : "#f43f5e";
            const colorName = isPass ? "Emerald Green (#10b981)" : "Crimson Red (#f43f5e)";
            showTooltip(event, formatColorTooltip({
                color: color,
                colorName: colorName,
                title: `#${d.id} - ${d.name} (${d.department})`,
                category: isPass ? "🟢 All Subjects Cleared" : "🔴 Arrear / Fail",
                reason: isPass ? "Emerald Green dot indicates student passed all 4 subjects with ≥ 35 marks." : "Crimson Red dot indicates student failed one or more subjects (<35 marks).",
                stats: [
                    `Average: <b>${d3.format(".1f")(d.average)}% (Grade ${d.grade})</b>`,
                    `Attendance: <b>${d.attendance}% (${d.attendance >= 75 ? "✅ Eligible" : "⚠️ Shortage"})</b>`,
                    `Marks Breakdown: <b>M:${d.maths} S:${d.science} E:${d.english} P:${d.programming}</b>`
                ],
                actionHint: "Click to open official printable Marksheet Card"
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).transition().duration(150).attr("r", 6).attr("stroke", "#ffffff").attr("stroke-width", 1.5);
            hideTooltip();
        })
        .on("click pointerdown", function (event, d) {
            openInGraphAttendanceDrawer(d);
        })
        .transition()
        .duration(600)
        .attr("r", 6);

    // Axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    // Render Bottom Interactive Legend Bar
    const passCount = data.filter(d => d.status === "Pass").length;
    const failCount = data.filter(d => d.status === "Fail").length;

    const legendItems = [
        {
            label: "Passed Student",
            color: "#10b981",
            badge: `${passCount}`,
            info: {
                color: "#10b981",
                colorName: "Emerald Green (#10b981)",
                title: "Passed Student Node",
                category: "Clearance Status",
                reason: "Green dot signifies the student passed all 4 subjects with ≥ 35 marks and earned a valid semester transcript.",
                stats: [`Total Passed: <b>${passCount} / ${data.length} (${((passCount / (data.length || 1)) * 100).toFixed(0)}%)</b>`],
                actionHint: "Click any green dot to view student transcript"
            },
            onClick: () => applyQuickFilter('status', 'Pass')
        },
        {
            label: "Arrear / Fail",
            color: "#f43f5e",
            badge: `${failCount}`,
            info: {
                color: "#f43f5e",
                colorName: "Crimson Red (#f43f5e)",
                title: "Arrear / Failed Student Node",
                category: "Remedial Alert",
                reason: "Red dot signifies student scored < 35 marks in one or more subjects and requires supplementary re-examination.",
                stats: [`Total Arrears: <b>${failCount} / ${data.length} (${((failCount / (data.length || 1)) * 100).toFixed(0)}%)</b>`],
                actionHint: "Click to filter table to failed students"
            },
            onClick: () => applyQuickFilter('status', 'Fail')
        },
        {
            label: "75% Attendance Line",
            color: "#f59e0b",
            badge: "Cutoff",
            info: {
                color: "#f59e0b",
                colorName: "Golden Amber (#f59e0b)",
                title: "75% Attendance Line",
                category: "Exam Eligibility",
                reason: "Golden dashed line marks the 75% attendance threshold for semester examination eligibility."
            }
        }
    ];

    renderChartLegend("#legendAttendanceChart", legendItems);
}

function drawFacultyGenderChart(data) {
    const container = d3.select("#genderChart");
    container.selectAll("*").remove();

    const node = d3.select("#genderChart").node();
    const width = node ? (node.clientWidth || 500) : 500;
    const height = 300;
    const margin = { top: 30, right: 35, bottom: 45, left: 52 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const males = data.filter(d => d.gender === "Male");
    const females = data.filter(d => d.gender === "Female");

    const malePass = males.filter(d => d.status === "Pass").length;
    const femalePass = females.filter(d => d.status === "Pass").length;

    const genderData = [
        {
            gender: "Male",
            count: males.length,
            avg: males.length ? (d3.mean(males, d => d.average) || 0) : 0,
            passRate: males.length ? ((malePass / males.length) * 100).toFixed(1) : 0,
            color: "#38bdf8",
            colorName: "Sky Blue (#38bdf8)",
            category: "Male Demographic Cohort",
            reason: "Sky blue represents the Male student demographic cohort for gender equity and comparative academic benchmark analysis."
        },
        {
            gender: "Female",
            count: females.length,
            avg: females.length ? (d3.mean(females, d => d.average) || 0) : 0,
            passRate: females.length ? ((femalePass / females.length) * 100).toFixed(1) : 0,
            color: "#f472b6",
            colorName: "Soft Rose Pink (#f472b6)",
            category: "Female Demographic Cohort",
            reason: "Rose pink represents the Female student demographic cohort for gender equity and comparative academic benchmark analysis."
        }
    ];

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(genderData.map(d => d.gender)).range([0, chartWidth]).padding(0.46);
    const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]).nice();

    // Grid
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""));

    // Bars
    svg.selectAll(".gender-bar")
        .data(genderData)
        .enter()
        .append("rect")
        .attr("class", "gender-bar")
        .attr("x", d => x(d.gender))
        .attr("width", x.bandwidth())
        .attr("y", chartHeight)
        .attr("height", 0)
        .attr("rx", 6)
        .attr("fill", d => d.color)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            d3.select(this).style("filter", `brightness(1.25) drop-shadow(0 0 10px ${d.color})`);
            showTooltip(event, formatColorTooltip({
                color: d.color,
                colorName: d.colorName,
                title: `${d.gender} Student Cohort`,
                category: d.category,
                reason: d.reason,
                stats: [
                    `Cohort Average: <b>${d3.format(".1f")(d.avg)}%</b>`,
                    `Enrolled Count: <b>${d.count} Students</b>`,
                    `Pass Rate: <b>${d.passRate}%</b>`
                ],
                rule: "Institutional Demographic Equity Analytics",
                actionHint: `Click bar to filter table to ${d.gender} students`
            }));
        })
        .on("mousemove", function (event, d) {
            showTooltip(event, formatColorTooltip({
                color: d.color,
                colorName: d.colorName,
                title: `${d.gender} Student Cohort`,
                category: d.category,
                reason: d.reason,
                stats: [
                    `Cohort Average: <b>${d3.format(".1f")(d.avg)}%</b>`,
                    `Enrolled Count: <b>${d.count} Students</b>`,
                    `Pass Rate: <b>${d.passRate}%</b>`
                ],
                rule: "Institutional Demographic Equity Analytics",
                actionHint: `Click bar to filter table to ${d.gender} students`
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).style("filter", "none");
            hideTooltip();
        })
        .on("click pointerdown", function (event, d) {
            openInGraphGenderDrawer(d.gender, data);
        })
        .transition()
        .duration(600)
        .attr("y", d => y(d.avg))
        .attr("height", d => Math.max(0, chartHeight - y(d.avg)));

    // Labels
    svg.selectAll(".gender-val")
        .data(genderData)
        .enter()
        .append("text")
        .attr("class", "gender-val")
        .attr("x", d => x(d.gender) + x.bandwidth() / 2)
        .attr("y", d => y(d.avg) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .attr("font-size", "12px")
        .attr("font-weight", "800")
        .text(d => `${d3.format(".1f")(d.avg)}% (${d.count})`);

    // Axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    // Render Bottom Interactive Legend Bar
    const legendItems = genderData.map(d => ({
        label: `${d.gender} Cohort`,
        color: d.color,
        badge: `${d.count} (${d.avg.toFixed(1)}%)`,
        info: {
            color: d.color,
            colorName: d.colorName,
            title: `${d.gender} Student Demographic`,
            category: d.category,
            reason: d.reason,
            stats: [`Average: <b>${d.avg.toFixed(1)}%</b>`, `Students: <b>${d.count}</b>`, `Pass Clearance: <b>${d.passRate}%</b>`],
            actionHint: `Click to inspect ${d.gender} students inside graph`
        },
        onClick: () => {
            openInGraphGenderDrawer(d.gender, data);
        }
    }));

    renderChartLegend("#legendGenderChart", legendItems);
}

/* ----------------------------------------------------
   STUDENT PERSONAL OBSERVATORY & D3.JS VISUAL ENGINES
   (Exclusive to Logged-in Student)
---------------------------------------------------- */
let currentInspectedStudent = null;

function renderStudentDashboard(student) {
    if (!student) return;
    currentInspectedStudent = student;

    // Calculate official evaluation
    const evalRes = (typeof calculateSemesterEvaluation === 'function')
        ? calculateSemesterEvaluation(student)
        : {
            average: student.average || 0,
            totalMarks: student.total || 0,
            sgpa: student.average ? (student.average / 10).toFixed(2) : "0.00",
            overallGrade: student.grade || "B",
            isPass: student.status === "Pass"
        };

    // Calculate Batch Standing & Rank
    let rank = 1;
    if (typeof students !== 'undefined' && students.length > 0) {
        const sorted = [...students].sort((a, b) => (b.average || 0) - (a.average || 0));
        const idx = sorted.findIndex(s => s.id === student.id);
        if (idx !== -1) rank = idx + 1;
    }
    const totalBatchCount = (typeof students !== 'undefined' && students.length > 0) ? students.length : 22;
    const percentile = Math.round(((totalBatchCount - rank + 1) / totalBatchCount) * 100);

    // 1. Update Student Cyber-HUD Standing & Identity Card
    const initials = student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    d3.select("#studHudAvatar").text(initials || "S");
    d3.select("#studHudName").text(student.name);
    d3.select("#studHudRoll").text(`Roll No: 22A91A05${String(student.id).padStart(2, '0')}`);
    const deptFullName = (typeof DEPT_NAMES !== 'undefined' && DEPT_NAMES[student.department]) ? DEPT_NAMES[student.department] : `${student.department} Engineering`;
    d3.select("#studHudDept").text(`Dept: ${student.department} (${deptFullName})`);

    // Standing Telemetry Grid
    d3.select("#studStatSgpa").html(`${evalRes.sgpa} <span class="stud-stat-denom">/ 10.00</span>`);
    const isStudentPass = evalRes.isPass !== undefined ? evalRes.isPass : (evalRes.status === "Pass");
    const pctVal = Number(evalRes.percentage || evalRes.average || student.average || 0);
    d3.select("#studStatGrade").text(`Grade ${evalRes.overallGrade} • ${isStudentPass ? (evalRes.sgpa >= 9 ? "Outstanding" : "First Class") : "Arrears Alert"}`);
    d3.select("#studStatPct").text(`${d3.format(".2f")(pctVal)}%`);
    d3.select("#studStatTotal").text(`${evalRes.totalMarks} / 400 Total Marks`);
    d3.select("#studStatRank").text(`Rank #${rank} of ${totalBatchCount}`);
    d3.select("#studStatPercentile").text(`Top ${Math.max(1, 100 - percentile + 5)}% Cohort Percentile`);
    d3.select("#studStatAtt").text(`${student.attendance}%`);
    const isAttEligible = student.attendance >= 75;
    d3.select("#studStatEligibility").html(isAttEligible ? "Exam Eligible ✅" : "⚠️ Condonation Alert (<75%)");

    // 2. Update 4-Subject Quick Micro-Cards
    const subConfigs = [
        { key: 'maths', score: student.maths, code: 'CS501', scoreId: '#studScoreMaths', barId: '#studBarMaths', badgeId: '#studBadgeMaths', color: '#6366f1' },
        { key: 'science', score: student.science, code: 'CS502', scoreId: '#studScoreScience', barId: '#studBarScience', badgeId: '#studBadgeScience', color: '#0ea5e9' },
        { key: 'english', score: student.english, code: 'CS503', scoreId: '#studScoreEnglish', barId: '#studBarEnglish', badgeId: '#studBadgeEnglish', color: '#10b981' },
        { key: 'programming', score: student.programming, code: 'CS504', scoreId: '#studScoreProg', barId: '#studBarProg', badgeId: '#studBadgeProg', color: '#a855f7' }
    ];

    subConfigs.forEach(sc => {
        const gradeInfo = (typeof getSubjectGradeInfo === 'function') ? getSubjectGradeInfo(sc.score) : { grade: sc.score >= 35 ? 'A' : 'F', badgeClass: 'grade-A' };
        d3.select(sc.scoreId).text(sc.score);
        d3.select(sc.barId).style("width", `${sc.score}%`).style("background", sc.score >= 35 ? sc.color : '#f43f5e');
        d3.select(sc.badgeId).text(`Grade ${gradeInfo.grade}`).attr("class", `stud-sub-badge ${gradeInfo.badgeClass}`);
    });

    // 3. Populate Embedded Official Marksheet
    if (typeof populateMarksheet === 'function') {
        populateMarksheet(student);
    }

    // 4. Render 4 High-Aesthetic Personal D3 Visualizations
    drawStudentRadarChart(student);
    drawStudentBenchmarkBulletChart(student);
    drawStudentAttendanceDial(student);
    drawStudentSgpaTrajectoryChart(student);
}

// Backward-compatible alias
function renderStudentVisualizations(student) {
    renderStudentDashboard(student);
}

/* ----------------------------------------------------
   1. D3 SUBJECT COMPETENCY SPIDER / RADAR WEB
---------------------------------------------------- */
function drawStudentRadarChart(student) {
    const container = d3.select("#studentRadarChart");
    container.selectAll("*").remove();

    const node = d3.select("#studentRadarChart").node();
    const width = node ? (node.clientWidth || 460) : 460;
    const height = 310;
    const radius = Math.min(width, height) / 2 - 38;

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2 + 8})`);

    injectSvgGradients(container);

    const subjects = [
        { name: "Mathematics", key: "maths", score: student.maths, color: "#6366f1" },
        { name: "Science", key: "science", score: student.science, color: "#0ea5e9" },
        { name: "English", key: "english", score: student.english, color: "#10b981" },
        { name: "Programming", key: "programming", score: student.programming, color: "#a855f7" }
    ];

    const totalAxes = subjects.length;
    const angleSlice = (Math.PI * 2) / totalAxes;
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Cohort Class Averages for Benchmark Polygon
    const classAvgs = {
        maths: typeof students !== 'undefined' ? (d3.mean(students, s => s.maths) || 75) : 75,
        science: typeof students !== 'undefined' ? (d3.mean(students, s => s.science) || 78) : 78,
        english: typeof students !== 'undefined' ? (d3.mean(students, s => s.english) || 80) : 80,
        programming: typeof students !== 'undefined' ? (d3.mean(students, s => s.programming) || 82) : 82
    };

    // Concentric Web Grid Rings (25%, 50%, 75%, 100%)
    const levels = [25, 50, 75, 100];
    levels.forEach(lvl => {
        const r = rScale(lvl);
        const points = [];
        for (let i = 0; i < totalAxes; i++) {
            const angle = i * angleSlice - Math.PI / 2;
            points.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
        }

        svg.append("polygon")
            .attr("points", points.join(" "))
            .attr("fill", lvl === 100 ? "rgba(255, 255, 255, 0.02)" : "none")
            .attr("stroke", lvl === 75 ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.1)")
            .attr("stroke-width", lvl === 75 ? 1.5 : 1)
            .attr("stroke-dasharray", lvl === 75 ? "3,3" : null);

        svg.append("text")
            .attr("x", 4)
            .attr("y", -r - 2)
            .attr("fill", lvl === 75 ? "#f59e0b" : "#64748b")
            .attr("font-size", "9px")
            .attr("font-weight", "700")
            .text(`${lvl}%`);
    });

    // Radial Spokes
    subjects.forEach((sub, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const x2 = radius * Math.cos(angle);
        const y2 = radius * Math.sin(angle);

        svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "rgba(255, 255, 255, 0.14)")
            .attr("stroke-width", 1.2);

        // Axis Label
        const labelR = radius + 22;
        const lx = labelR * Math.cos(angle);
        const ly = labelR * Math.sin(angle);

        svg.append("text")
            .attr("x", lx)
            .attr("y", ly + 4)
            .attr("text-anchor", Math.abs(x2) < 5 ? "middle" : (x2 > 0 ? "start" : "end"))
            .attr("fill", sub.color)
            .attr("font-size", "11px")
            .attr("font-weight", "800")
            .attr("letter-spacing", "0.02em")
            .style("cursor", "pointer")
            .text(sub.name)
            .on("click", () => openStudentSubjectModal(sub.key));
    });

    // Class Average Benchmark Polygon (Amber Dashed)
    const avgCoords = subjects.map((sub, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const score = classAvgs[sub.key] || 75;
        return [rScale(score) * Math.cos(angle), rScale(score) * Math.sin(angle)];
    });

    svg.append("polygon")
        .attr("points", avgCoords.map(p => p.join(",")).join(" "))
        .attr("fill", "rgba(245, 158, 11, 0.08)")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event) {
            showTooltip(event, formatColorTooltip({
                color: "#f59e0b",
                colorName: "Golden Amber (#f59e0b)",
                title: "Cohort Class Average Polygon",
                category: "Comparative Peer Benchmark",
                reason: "Amber dashed boundary marks the average grade of all 22 batch peers across subjects.",
                stats: subjects.map(s => `${s.name} Class Avg: <b>${classAvgs[s.key].toFixed(1)}%</b>`)
            }));
        })
        .on("mouseleave", hideTooltip);

    // Student Performance Polygon (Glowing Neon Cyan)
    const studentCoords = subjects.map((sub, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        return [rScale(sub.score) * Math.cos(angle), rScale(sub.score) * Math.sin(angle)];
    });

    svg.append("polygon")
        .attr("points", studentCoords.map(p => p.join(",")).join(" "))
        .attr("fill", "rgba(6, 182, 212, 0.35)")
        .attr("stroke", "#00f0ff")
        .attr("stroke-width", 2.8)
        .style("filter", "drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))")
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event) {
            showTooltip(event, formatColorTooltip({
                color: "#00f0ff",
                colorName: "Electric Neon Cyan (#00f0ff)",
                title: `${student.name}'s Competency Web`,
                category: "Personal Academic Footprint",
                reason: "Cyan polygon shows your personal subject scores spanning Engineering Mathematics, DBMS, Algorithms, and Web Programming.",
                stats: subjects.map(s => `${s.name}: <b>${s.score} / 100</b>`),
                actionHint: "Click any vertex to view theory vs lab marks breakdown"
            }));
        })
        .on("mouseleave", hideTooltip);

    // Vertex Points & Interactive Clickable Nodes
    subjects.forEach((sub, i) => {
        const [vx, vy] = studentCoords[i];
        const isPass = sub.score >= 35;

        // Outer glow circle
        svg.append("circle")
            .attr("cx", vx)
            .attr("cy", vy)
            .attr("r", 7)
            .attr("fill", isPass ? sub.color : "#f43f5e")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("filter", `drop-shadow(0 0 6px ${isPass ? sub.color : "#f43f5e"})`)
            .on("mouseenter pointerdown", function (event) {
                d3.select(this).transition().duration(150).attr("r", 10);
                const avg = classAvgs[sub.key] || 75;
                const diff = (sub.score - avg).toFixed(1);
                showTooltip(event, formatColorTooltip({
                    color: sub.color,
                    colorName: sub.name,
                    title: `${sub.name}: ${sub.score} / 100 Marks`,
                    category: isPass ? "🟢 Qualified Clearance" : "🔴 Arrear Warning",
                    reason: `Your individual score in ${sub.name} vs Class Benchmark.`,
                    stats: [
                        `Your Score: <b>${sub.score} / 100</b>`,
                        `Class Average: <b>${avg.toFixed(1)}%</b>`,
                        `Benchmark Variance: <b>${diff >= 0 ? '+' : ''}${diff}%</b>`
                    ],
                    actionHint: "Click to open deep subject evaluation card"
                }));
            })
            .on("mouseleave", function () {
                d3.select(this).transition().duration(150).attr("r", 7);
                hideTooltip();
            })
            .on("click", () => openStudentSubjectModal(sub.key));

        // Mark Badge on Node
        svg.append("text")
            .attr("x", vx)
            .attr("y", vy - 11)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("font-size", "10px")
            .attr("font-weight", "900")
            .text(sub.score);
    });

    // Legend
    const legendItems = [
        {
            label: "My Score Web",
            color: "#00f0ff",
            badge: "Personal",
            info: {
                color: "#00f0ff",
                colorName: "Electric Cyan",
                title: "Personal Competency Polygon",
                category: "Personal Standing",
                reason: "Represents your individual marks mapped across the 4 degree subjects."
            }
        },
        {
            label: "Class Average",
            color: "#f59e0b",
            badge: "Benchmark",
            info: {
                color: "#f59e0b",
                colorName: "Golden Amber",
                title: "Cohort Class Average Polygon",
                category: "Cohort Standard",
                reason: "Represents the mean score achieved across the cohort of 22 students."
            }
        }
    ];
    renderChartLegend("#legendStudentRadar", legendItems);
}

/* ----------------------------------------------------
   2. D3 PERSONAL BENCHMARK BULLET VISUALIZER
---------------------------------------------------- */
function drawStudentBenchmarkBulletChart(student) {
    const container = d3.select("#studentBulletChart");
    container.selectAll("*").remove();

    const node = d3.select("#studentBulletChart").node();
    const width = node ? (node.clientWidth || 460) : 460;
    const height = 310;
    const margin = { top: 25, right: 35, bottom: 40, left: 105 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const subjects = [
        { name: "Mathematics", key: "maths", score: student.maths, color: "#6366f1" },
        { name: "Science", key: "science", score: student.science, color: "#0ea5e9" },
        { name: "English", key: "english", score: student.english, color: "#10b981" },
        { name: "Programming", key: "programming", score: student.programming, color: "#a855f7" }
    ];

    const bulletData = subjects.map(sub => {
        const scores = (typeof students !== 'undefined') ? students.map(s => s[sub.key] || 0) : [75];
        const classAvg = d3.mean(scores) || 75;
        const topper = d3.max(scores) || 95;
        return {
            ...sub,
            classAvg,
            topper,
            diff: sub.score - classAvg
        };
    });

    const y = d3.scaleBand().domain(bulletData.map(d => d.name)).range([0, chartHeight]).padding(0.42);
    const x = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]).nice();

    // Background Grid
    svg.append("g").attr("class", "grid").call(d3.axisBottom(x).ticks(5).tickSize(chartHeight).tickFormat("")).attr("transform", `translate(0,0)`);

    // Minimum 35 Passing Cutoff Line
    svg.append("line")
        .attr("x1", x(35)).attr("y1", -5)
        .attr("x2", x(35)).attr("y2", chartHeight + 5)
        .attr("stroke", "rgba(244, 63, 94, 0.5)")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1.8);

    const rows = svg.selectAll(".bullet-row")
        .data(bulletData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(0,${y(d.name)})`);

    // 1. Background Track (Max 100)
    rows.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", chartWidth)
        .attr("height", y.bandwidth())
        .attr("rx", 5)
        .attr("fill", "rgba(255, 255, 255, 0.05)");

    // 2. Student Score Filled Bar
    rows.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("rx", 5)
        .attr("fill", d => d.score >= 35 ? d.color : "#f43f5e")
        .style("cursor", "pointer")
        .style("filter", d => `drop-shadow(0 0 6px ${d.score >= 35 ? d.color : "#f43f5e"}66)`)
        .on("mouseenter pointerdown", function (event, d) {
            showTooltip(event, formatColorTooltip({
                color: d.color,
                colorName: d.name,
                title: `${d.name}: ${d.score} / 100 Marks`,
                category: d.score >= 35 ? "🟢 Subject Cleared" : "🔴 Arrear",
                reason: `You scored ${d.score} marks in ${d.name}.`,
                stats: [
                    `Your Score: <b>${d.score} / 100</b>`,
                    `Class Average: <b>${d.classAvg.toFixed(1)}%</b>`,
                    `Subject Topper: <b>${d.topper} / 100</b>`,
                    `Variance: <b>${(d.diff >= 0 ? '+' : '')}${d.diff.toFixed(1)}%</b>`
                ],
                actionHint: "Click to open detailed subject inspector"
            }));
        })
        .on("mouseleave", hideTooltip)
        .on("click", (event, d) => openStudentSubjectModal(d.key))
        .transition()
        .duration(700)
        .attr("width", d => x(d.score));

    // 3. Class Average Target Pin Marker (Amber)
    rows.append("line")
        .attr("x1", d => x(d.classAvg))
        .attr("y1", -4)
        .attr("x2", d => x(d.classAvg))
        .attr("y2", y.bandwidth() + 4)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            showTooltip(event, formatColorTooltip({
                color: "#f59e0b",
                colorName: "Golden Amber Target",
                title: `${d.name} Class Average: ${d.classAvg.toFixed(1)}%`,
                category: "Cohort Standard",
                reason: "Vertical amber pin marks the average performance of your entire engineering cohort.",
                stats: [`Class Average: <b>${d.classAvg.toFixed(1)}%</b>`, `Your Score: <b>${d.score}%</b>`]
            }));
        })
        .on("mouseleave", hideTooltip);

    // 4. Topper Highest Marker (Cyan Diamond)
    rows.append("path")
        .attr("d", d => {
            const tx = x(d.topper);
            const ty = y.bandwidth() / 2;
            return `M ${tx} ${ty - 5} L ${tx + 5} ${ty} L ${tx} ${ty + 5} L ${tx - 5} ${ty} Z`;
        })
        .attr("fill", "#00f0ff")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0 0 4px #00f0ff)")
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            showTooltip(event, formatColorTooltip({
                color: "#00f0ff",
                colorName: "Neon Cyan Diamond",
                title: `${d.name} Highest Score: ${d.topper} / 100`,
                category: "Cohort Highest",
                reason: "Cyan diamond indicates the highest mark achieved in this subject across the whole college.",
                stats: [`Highest Score: <b>${d.topper} / 100</b>`, `Your Score: <b>${d.score} / 100</b>`]
            }));
        })
        .on("mouseleave", hideTooltip);

    // Score Value Text
    rows.append("text")
        .attr("x", d => x(d.score) + 8)
        .attr("y", y.bandwidth() / 2 + 4)
        .attr("fill", "#ffffff")
        .attr("font-size", "12px")
        .attr("font-weight", "900")
        .text(d => `${d.score}`);

    // Axes
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll("text")
        .attr("fill", "#cbd5e1")
        .attr("font-size", "11.5px")
        .attr("font-weight", "700")
        .style("cursor", "pointer")
        .on("click", (event, name) => {
            const match = bulletData.find(d => d.name === name);
            if (match) openStudentSubjectModal(match.key);
        });

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`));

    // Legend
    const legendItems = [
        {
            label: "My Score",
            color: "#6366f1",
            badge: "Bar",
            info: {
                color: "#6366f1",
                colorName: "Filled Neon Bar",
                title: "Your Subject Marks",
                category: "Personal Performance",
                reason: "Shows the marks you earned out of 100 in each subject."
            }
        },
        {
            label: "Class Average",
            color: "#f59e0b",
            badge: "Amber Line",
            info: {
                color: "#f59e0b",
                colorName: "Amber Target Pin",
                title: "Class Mean Benchmark",
                category: "Batch Standard",
                reason: "Indicates the class average for comparative standing."
            }
        },
        {
            label: "Batch Highest",
            color: "#00f0ff",
            badge: "Cyan Diamond",
            info: {
                color: "#00f0ff",
                colorName: "Cyan Diamond",
                title: "Highest Score Achieved",
                category: "Topper Reference",
                reason: "Marks the peak score achieved in that subject across the batch."
            }
        }
    ];
    renderChartLegend("#legendStudentBullet", legendItems);
}

/* ----------------------------------------------------
   3. D3 CONCENTRIC ATTENDANCE & EXAM CLEARANCE DIAL
---------------------------------------------------- */
function drawStudentAttendanceDial(student) {
    const container = d3.select("#studentAttendanceDial");
    container.selectAll("*").remove();

    const node = d3.select("#studentAttendanceDial").node();
    const width = node ? (node.clientWidth || 460) : 460;
    const height = 310;
    const radius = Math.min(width, height) / 2 - 32;

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2 + 10})`);

    const isEligible = student.attendance >= 75;
    const arcColor = isEligible ? "#10b981" : "#f43f5e";

    // Outer Track Ring
    const bgArc = d3.arc()
        .innerRadius(radius * 0.72)
        .outerRadius(radius)
        .startAngle(-Math.PI * 0.75)
        .endAngle(Math.PI * 0.75);

    svg.append("path")
        .attr("d", bgArc)
        .attr("fill", "rgba(255, 255, 255, 0.05)")
        .attr("stroke", "rgba(255, 255, 255, 0.08)")
        .attr("stroke-width", 1);

    // Inner Concentric Track
    const innerTrackArc = d3.arc()
        .innerRadius(radius * 0.58)
        .outerRadius(radius * 0.64)
        .startAngle(-Math.PI * 0.75)
        .endAngle(Math.PI * 0.75);

    svg.append("path")
        .attr("d", innerTrackArc)
        .attr("fill", "rgba(255, 255, 255, 0.03)");

    // Progress Value Arc
    const totalAngle = Math.PI * 1.5;
    const progressAngle = -Math.PI * 0.75 + (student.attendance / 100) * totalAngle;

    const valArc = d3.arc()
        .innerRadius(radius * 0.72)
        .outerRadius(radius)
        .startAngle(-Math.PI * 0.75)
        .endAngle(progressAngle)
        .cornerRadius(6);

    svg.append("path")
        .attr("d", valArc)
        .attr("fill", arcColor)
        .style("filter", `drop-shadow(0 0 10px ${arcColor}88)`)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event) {
            showTooltip(event, formatColorTooltip({
                color: arcColor,
                colorName: isEligible ? "Emerald Green (#10b981)" : "Crimson Red (#f43f5e)",
                title: `Biometric Attendance: ${student.attendance}%`,
                category: isEligible ? "✅ Hall Ticket Clearance Granted" : "⚠️ Condonation Penalty Required",
                reason: isEligible
                    ? "Attendance is above the mandatory 75% UGC/Autonomous cutoff. Regular examination hall ticket is authorized."
                    : "Attendance is below 75%. You are subject to condonation fees and academic board review.",
                stats: [
                    `Your Attendance: <b>${student.attendance}%</b>`,
                    `Statutory Minimum: <b>75.0%</b>`,
                    `Lectures Attended: <b>${Math.round((student.attendance / 100) * 90)} / 90 Lectures</b>`
                ],
                rule: "Autonomous University Biometric Attendance Mandate"
            }));
        })
        .on("mouseleave", hideTooltip);

    // 75% Cutoff Marker Line
    const cutoffAngle = -Math.PI * 0.75 + 0.75 * totalAngle;
    const cx1 = (radius * 0.68) * Math.cos(cutoffAngle - Math.PI / 2);
    const cy1 = (radius * 0.68) * Math.sin(cutoffAngle - Math.PI / 2);
    const cx2 = (radius * 1.05) * Math.cos(cutoffAngle - Math.PI / 2);
    const cy2 = (radius * 1.05) * Math.sin(cutoffAngle - Math.PI / 2);

    svg.append("line")
        .attr("x1", cx1).attr("y1", cy1)
        .attr("x2", cx2).attr("y2", cy2)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2.5)
        .style("filter", "drop-shadow(0 0 4px #f59e0b)");

    svg.append("text")
        .attr("x", cx2 + (cx2 > 0 ? 4 : -4))
        .attr("y", cy2 + 3)
        .attr("text-anchor", cx2 > 0 ? "start" : "end")
        .attr("fill", "#f59e0b")
        .attr("font-size", "9.5px")
        .attr("font-weight", "800")
        .text("75% Cutoff");

    // Center Display
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-12px")
        .attr("font-size", "36px")
        .attr("font-weight", "900")
        .attr("font-family", "var(--font-heading)")
        .attr("fill", "#ffffff")
        .text(`${student.attendance}%`);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "12px")
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .attr("letter-spacing", "0.06em")
        .attr("fill", isEligible ? "#34d399" : "#fb7185")
        .text(isEligible ? "EXAM CLEARED ✅" : "SHORTAGE ALERT ⚠️");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "30px")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", "#94a3b8")
        .text(`${Math.round((student.attendance / 100) * 90)} of 90 Hours Attended`);

    // Legend
    const legendItems = [
        {
            label: isEligible ? "Eligible (≥75%)" : "Shortage (<75%)",
            color: arcColor,
            badge: `${student.attendance}%`,
            info: {
                color: arcColor,
                colorName: isEligible ? "Emerald Green" : "Crimson Red",
                title: `Attendance Status: ${student.attendance}%`,
                category: "Examination Clearance",
                reason: isEligible ? "Satisfies all institutional attendance bylaws." : "Falls short of statutory 75% attendance criteria."
            }
        },
        {
            label: "75% Cutoff Pin",
            color: "#f59e0b",
            badge: "Requirement",
            info: {
                color: "#f59e0b",
                colorName: "Golden Amber",
                title: "75% Attendance Requirement",
                category: "Autonomous Statute",
                reason: "Mandatory minimum lecture attendance required to sit for semester examinations."
            }
        }
    ];
    renderChartLegend("#legendStudentAttendance", legendItems);
}

/* ----------------------------------------------------
   4. D3 MULTI-SEMESTER SGPA PROGRESSION TRAJECTORY
---------------------------------------------------- */
function drawStudentSgpaTrajectoryChart(student) {
    const container = d3.select("#studentTrajectoryChart");
    container.selectAll("*").remove();

    const node = d3.select("#studentTrajectoryChart").node();
    const width = node ? (node.clientWidth || 460) : 460;
    const height = 310;
    const margin = { top: 25, right: 30, bottom: 40, left: 45 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate current SGPA
    const currentSgpa = Number((student.average / 10).toFixed(2)) || 8.0;

    // Realistic multi-semester historical trajectory
    const trajectoryData = [
        { sem: "Sem I", sgpa: Math.min(10, Math.max(4.0, Number((currentSgpa - 0.45).toFixed(2)))), credits: 20 },
        { sem: "Sem II", sgpa: Math.min(10, Math.max(4.0, Number((currentSgpa - 0.30).toFixed(2)))), credits: 22 },
        { sem: "Sem III", sgpa: Math.min(10, Math.max(4.0, Number((currentSgpa - 0.15).toFixed(2)))), credits: 24 },
        { sem: "Sem IV", sgpa: Math.min(10, Math.max(4.0, Number((currentSgpa + 0.10).toFixed(2)))), credits: 24 },
        { sem: "Sem V", sgpa: Math.min(10, Math.max(4.0, Number((currentSgpa - 0.05).toFixed(2)))), credits: 22 },
        { sem: "Sem VI", sgpa: currentSgpa, credits: 16 }
    ];

    const x = d3.scalePoint().domain(trajectoryData.map(d => d.sem)).range([0, chartWidth]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 10]).range([chartHeight, 0]).nice();

    // Defs gradient for area fill
    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs");

    const areaGrad = defs.append("linearGradient")
        .attr("id", "gradStudentTrajectory")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    areaGrad.append("stop").attr("offset", "0%").attr("stop-color", "#8b5cf6").attr("stop-opacity", 0.45);
    areaGrad.append("stop").attr("offset", "100%").attr("stop-color", "#00f0ff").attr("stop-opacity", 0.02);

    // Grid lines
    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""));

    // Area Generator
    const area = d3.area()
        .x(d => x(d.sem))
        .y0(chartHeight)
        .y1(d => y(d.sgpa))
        .curve(d3.curveMonotoneX);

    // Line Generator
    const line = d3.line()
        .x(d => x(d.sem))
        .y(d => y(d.sgpa))
        .curve(d3.curveMonotoneX);

    // Draw Gradient Area
    svg.append("path")
        .datum(trajectoryData)
        .attr("fill", "url(#gradStudentTrajectory)")
        .attr("d", area);

    // Draw Glowing Spline Line
    svg.append("path")
        .datum(trajectoryData)
        .attr("fill", "none")
        .attr("stroke", "#8b5cf6")
        .attr("stroke-width", 3.2)
        .style("filter", "drop-shadow(0 0 8px rgba(139, 92, 246, 0.7))")
        .attr("d", line);

    // Interactive Data Points
    trajectoryData.forEach((d, i) => {
        const isCurrent = i === trajectoryData.length - 1;
        const color = isCurrent ? "#00f0ff" : "#8b5cf6";

        svg.append("circle")
            .attr("cx", x(d.sem))
            .attr("cy", y(d.sgpa))
            .attr("r", isCurrent ? 7 : 5)
            .attr("fill", color)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("filter", `drop-shadow(0 0 6px ${color})`)
            .on("mouseenter pointerdown", function (event) {
                d3.select(this).transition().duration(150).attr("r", 9);
                showTooltip(event, formatColorTooltip({
                    color: color,
                    colorName: `${d.sem} Performance`,
                    title: `${d.sem} SGPA: ${d.sgpa} / 10.0`,
                    category: isCurrent ? "Current Active Semester" : "Historical Semester",
                    reason: `Semester grade point progression across your academic tenure.`,
                    stats: [
                        `Semester: <b>${d.sem}</b>`,
                        `SGPA Score: <b>${d.sgpa} / 10.00</b>`,
                        `Credits Registered: <b>${d.credits}.0 Credits</b>`
                    ]
                }));
            })
            .on("mouseleave", function () {
                d3.select(this).transition().duration(150).attr("r", isCurrent ? 7 : 5);
                hideTooltip();
            });

        // Value Label Above Point
        svg.append("text")
            .attr("x", x(d.sem))
            .attr("y", y(d.sgpa) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", isCurrent ? "#00f0ff" : "#ffffff")
            .attr("font-size", isCurrent ? "11px" : "9.5px")
            .attr("font-weight", "900")
            .text(d.sgpa);
    });

    // Axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}.0`));

    // Legend
    const legendItems = [
        {
            label: "SGPA Trajectory",
            color: "#8b5cf6",
            badge: "Progression",
            info: {
                color: "#8b5cf6",
                colorName: "Violet Spline",
                title: "Academic SGPA Momentum",
                category: "Historical Performance",
                reason: "Shows the evolution of your SGPA from Semester 1 through the current Semester 6."
            }
        },
        {
            label: "Active Semester (Sem VI)",
            color: "#00f0ff",
            badge: `${currentSgpa}`,
            info: {
                color: "#00f0ff",
                colorName: "Electric Cyan Node",
                title: "Current Semester SGPA",
                category: "Active Evaluation",
                reason: "Marks your current active Semester VI evaluation."
            }
        }
    ];
    renderChartLegend("#legendStudentTrajectory", legendItems);
}

/* ----------------------------------------------------
   5. STUDENT SUBJECT DEEP-TOUCH INSPECTOR MODAL
---------------------------------------------------- */
const SUBJECT_META_INFO = {
    maths: {
        code: "CS501",
        title: "Engineering Mathematics - III",
        desc: "Autonomous CBCS 4.0 Credit Core Course • Calculus, Linear Algebra & Probability",
        faculty: "Prof. R. K. Sharma (Dept of Mathematics)",
        comments: [
            "Demonstrated superior analytical mastery in differential calculus and linear algebra concepts. Active participation in problem-solving tutorials.",
            "Consistently scored high in internal continuous assessments and tutorial test series.",
            "Recommended for Advanced Numerical Analysis and Optimization Electives."
        ]
    },
    science: {
        code: "CS502",
        title: "Database Management Systems",
        desc: "Autonomous CBCS 4.0 Credit Core Course • Relational Algebra, SQL & Query Optimization",
        faculty: "Dr. P. Venkat (Associate Professor, CSE)",
        comments: [
            "Exceptional query optimization and ER diagram modeling skills. Successfully completed complex relational schema design lab project.",
            "Strong grasp on ACID transaction properties and B+ tree index structures.",
            "Recommended for Advanced Cloud Database Architectures."
        ]
    },
    english: {
        code: "CS503",
        title: "Design & Analysis of Algorithms",
        desc: "Autonomous CBCS 4.0 Credit Core Course • Dynamic Programming, Graph Theory & Complexity",
        faculty: "Dr. M. Anitha (Professor, CSE)",
        comments: [
            "Exemplary performance in time-complexity proofs and dynamic programming problem sets.",
            "Quickly formulates optimal asymptotic bounds and divide-and-conquer solutions.",
            "Recommended for Competitive Programming and Algorithm Research Club."
        ]
    },
    programming: {
        code: "CS504",
        title: "Web Technologies & Programming",
        desc: "Autonomous CBCS 4.0 Credit Core Course • Full-Stack Development, D3.js & Modern JS",
        faculty: "Prof. T. Rajesh (Assistant Professor, CSE)",
        comments: [
            "Outstanding full-stack software development skills. Built interactive SVG visualizations using D3.js with responsive UX.",
            "Clean modular code structure adhering to industry design patterns and REST APIs.",
            "Selected for Autonomous Department Hackathon Leadership."
        ]
    }
};

function openStudentSubjectModal(subjectKey) {
    const student = currentInspectedStudent || (typeof currentUser !== 'undefined' && getStudentForUser(currentUser)) || (typeof students !== 'undefined' ? students[0] : null);
    if (!student) return;

    const meta = SUBJECT_META_INFO[subjectKey] || SUBJECT_META_INFO.maths;
    const score = Number(student[subjectKey]) || 0;
    const gradeInfo = (typeof getSubjectGradeInfo === 'function') ? getSubjectGradeInfo(score) : { grade: "O", gradePoint: 10, description: "Outstanding" };

    // Theory (70) vs Lab/Internal (30) realistic breakdown
    const theoryScore = Math.min(70, Math.round(score * 0.70));
    const labScore = score - theoryScore;

    d3.select("#studModalSubCode").text(meta.code);
    d3.select("#studModalSubTitle").text(meta.title);
    d3.select("#studModalSubDesc").text(meta.desc);
    d3.select("#studModalScore").html(`${score} <span style="font-size: 13px; color: #94a3b8;">/ 100</span>`);
    d3.select("#studModalGrade").text(`Grade ${gradeInfo.grade} • ${gradeInfo.description}`);
    d3.select("#studModalTheory").html(`${theoryScore} <span style="font-size: 13px; color: #94a3b8;">/ 70</span>`);
    d3.select("#studModalLab").html(`${labScore} <span style="font-size: 13px; color: #94a3b8;">/ 30</span>`);
    d3.select("#studModalGP").text(`${gradeInfo.gradePoint}.0`);

    const comment = meta.comments[score >= 90 ? 0 : (score >= 75 ? 1 : 2)] || meta.comments[0];
    d3.select("#studModalFeedbackBox .feedback-header b").text(`Faculty Evaluation: ${meta.faculty}`);
    d3.select("#studModalFeedbackText").text(comment);

    d3.select("#studentSubjectModal").classed("active", true).style("display", "flex");
}

function closeStudentSubjectModal() {
    d3.select("#studentSubjectModal").classed("active", false).style("display", "none");
}

/* ----------------------------------------------------
   6. STUDENT TAB NAVIGATION CONTROLLER
---------------------------------------------------- */
function switchStudentTab(tab) {
    d3.selectAll("#studentDashboardView .horizontal-nav-btn").classed("active", false);
    d3.select(`#studTab-${tab}`).classed("active", true);

    const hudEl = document.getElementById("studentHudCard");
    const subGridEl = document.getElementById("studSubjectCardsGrid");
    const visualsEl = document.getElementById("studentVisualizationsSection");
    const marksheetEl = document.getElementById("studentEmbeddedMarksheet");
    const feesEl = document.getElementById("studentFeesSection");
    const noticesEl = document.getElementById("studentNoticesSection");
    const asgEl = document.getElementById("studentAssignmentSection");
    const aiEl = document.getElementById("studentAiExplainerSection");

    const student = currentInspectedStudent || (typeof getStudentForUser === 'function' && typeof currentUser !== 'undefined' && currentUser && currentUser.role === 'Student' ? getStudentForUser(currentUser) : null) || (typeof students !== 'undefined' ? (students.find(s => s.id === 4) || students[0]) : null);

    if (tab === 'overview') {
        if (hudEl) hudEl.style.display = "block";
        if (subGridEl) subGridEl.style.display = "grid";
        if (visualsEl) visualsEl.style.display = "block";
        if (marksheetEl) marksheetEl.style.display = "block";
        if (feesEl) feesEl.style.display = "none";
        if (noticesEl) noticesEl.style.display = "none";
        if (asgEl) asgEl.style.display = "none";
        if (aiEl) aiEl.style.display = "none";
        if (typeof window.scrollTo === 'function') {
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { try { window.scrollTo(0, 0); } catch (err) {} }
        }
    } else if (tab === 'visuals') {
        if (hudEl) hudEl.style.display = "none";
        if (subGridEl) subGridEl.style.display = "grid";
        if (visualsEl) visualsEl.style.display = "block";
        if (marksheetEl) marksheetEl.style.display = "none";
        if (feesEl) feesEl.style.display = "none";
        if (noticesEl) noticesEl.style.display = "none";
        if (asgEl) asgEl.style.display = "none";
        if (aiEl) aiEl.style.display = "none";
        if (visualsEl && typeof visualsEl.scrollIntoView === 'function') {
            try { visualsEl.scrollIntoView({ behavior: 'smooth' }); } catch (e) { visualsEl.scrollIntoView(); }
        }
    } else if (tab === 'marksheet') {
        if (hudEl) hudEl.style.display = "none";
        if (subGridEl) subGridEl.style.display = "none";
        if (visualsEl) visualsEl.style.display = "none";
        if (marksheetEl) marksheetEl.style.display = "block";
        if (feesEl) feesEl.style.display = "none";
        if (noticesEl) noticesEl.style.display = "none";
        if (asgEl) asgEl.style.display = "none";
        if (aiEl) aiEl.style.display = "none";
        if (marksheetEl && typeof marksheetEl.scrollIntoView === 'function') {
            try { marksheetEl.scrollIntoView({ behavior: 'smooth' }); } catch (e) { marksheetEl.scrollIntoView(); }
        }
    } else if (tab === 'fees') {
        if (hudEl) hudEl.style.display = "none";
        if (subGridEl) subGridEl.style.display = "none";
        if (visualsEl) visualsEl.style.display = "none";
        if (marksheetEl) marksheetEl.style.display = "none";
        if (feesEl) feesEl.style.display = "block";
        if (noticesEl) noticesEl.style.display = "none";
        if (asgEl) asgEl.style.display = "none";
        if (aiEl) aiEl.style.display = "none";
        if (typeof renderStudentFeesView === 'function' && student) {
            renderStudentFeesView(student);
        }
        if (typeof window.scrollTo === 'function') {
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { try { window.scrollTo(0, 0); } catch (err) {} }
        }
    } else if (tab === 'notices') {
        if (hudEl) hudEl.style.display = "none";
        if (subGridEl) subGridEl.style.display = "none";
        if (visualsEl) visualsEl.style.display = "none";
        if (marksheetEl) marksheetEl.style.display = "none";
        if (feesEl) feesEl.style.display = "none";
        if (noticesEl) noticesEl.style.display = "block";
        if (asgEl) asgEl.style.display = "none";
        if (aiEl) aiEl.style.display = "none";
        if (typeof renderNoticesGrid === 'function') {
            renderNoticesGrid();
        }
        if (noticesEl && typeof noticesEl.scrollIntoView === 'function') {
            try { noticesEl.scrollIntoView({ behavior: 'smooth' }); } catch (e) { noticesEl.scrollIntoView(); }
        }
    } else if (tab === 'assignments') {
        if (hudEl) hudEl.style.display = "none";
        if (subGridEl) subGridEl.style.display = "none";
        if (visualsEl) visualsEl.style.display = "none";
        if (marksheetEl) marksheetEl.style.display = "none";
        if (feesEl) feesEl.style.display = "none";
        if (noticesEl) noticesEl.style.display = "none";
        if (asgEl) asgEl.style.display = "block";
        if (aiEl) aiEl.style.display = "none";
        if (typeof renderStudentAssignments === 'function' && student) {
            renderStudentAssignments(student);
        }
        if (asgEl && typeof asgEl.scrollIntoView === 'function') {
            try { asgEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { asgEl.scrollIntoView(); }
        }
    } else if (tab === 'aiexplainer') {
        if (hudEl) hudEl.style.display = "none";
        if (subGridEl) subGridEl.style.display = "none";
        if (visualsEl) visualsEl.style.display = "none";
        if (marksheetEl) marksheetEl.style.display = "none";
        if (feesEl) feesEl.style.display = "none";
        if (noticesEl) noticesEl.style.display = "none";
        if (asgEl) asgEl.style.display = "none";
        if (aiEl) aiEl.style.display = "block";
        if (typeof updateAiRoleUI === 'function') updateAiRoleUI();
        if (aiEl && typeof aiEl.scrollIntoView === 'function') {
            try { aiEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { aiEl.scrollIntoView(); }
        }
    }
}


