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

/* ----------------------------------------------------
   FACULTY COHORT VISUALIZATIONS
---------------------------------------------------- */
function renderFacultyVisualizations(data) {
    d3.select("#chartTitle1").html("📚 Cohort Subject Average Marks <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle2").html("🍩 Grade & Result Distribution <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle3").html("📈 Attendance vs Performance <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle4").html("⚖️ Gender-wise Performance <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");

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
        .on("click", function (event, d) {
            sortTable(d.key);
            showToast(`Sorted table by ${d.subject} marks (${d.colorName})`, "info");
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
            actionHint: `Click to sort table by ${d.subject}`
        },
        onClick: () => sortTable(d.key)
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
        .on("click", function (event, d) {
            const gradeFilter = d3.select("#gradeFilter");
            if (!gradeFilter.empty()) {
                gradeFilter.property("value", d.data.grade);
                updateDashboard();
                showToast(`Filtered dashboard to Grade ${d.data.grade} (${d.data.colorName})`, "info");
            }
        });

    path.transition()
        .duration(600)
        .attrTween("d", function (d) {
            const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) { return arc(i(t)); };
        });

    // Donut Center Text
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-3px")
        .attr("font-size", "26px")
        .attr("font-weight", "900")
        .attr("fill", "#ffffff")
        .text(data.length);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "18px")
        .attr("font-size", "10.5px")
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
                actionHint: `Click to filter table by Grade ${g}`
            },
            onClick: () => {
                const gradeFilter = d3.select("#gradeFilter");
                if (!gradeFilter.empty()) {
                    gradeFilter.property("value", g);
                    updateDashboard();
                }
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
        .on("click", function (event, d) {
            openProgressCard(d.id);
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
        .on("click", function (event, d) {
            const genderFilter = d3.select("#genderFilter");
            if (!genderFilter.empty()) {
                genderFilter.property("value", d.gender);
                updateDashboard();
                showToast(`Filtered table to ${d.gender} students (${d.colorName})`, "info");
            }
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
            actionHint: `Click to filter table by ${d.gender}`
        },
        onClick: () => {
            const genderFilter = d3.select("#genderFilter");
            if (!genderFilter.empty()) {
                genderFilter.property("value", d.gender);
                updateDashboard();
            }
        }
    }));

    renderChartLegend("#legendGenderChart", legendItems);
}

/* ----------------------------------------------------
   STUDENT INDIVIDUAL VISUALIZATIONS
---------------------------------------------------- */
function renderStudentVisualizations(student) {
    if (!student) return;

    d3.select("#chartTitle1").html("📊 My Subject Performance Breakdown <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle2").html("🍩 My Score Share (Out of 400) <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle3").html("📈 My Subject Comparison vs Class Average <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");
    d3.select("#chartTitle4").html("⏱ Attendance Eligibility Benchmark <span style='font-size:11px; font-weight:600; color:#94a3b8;'>• Touch color for meaning</span>");

    drawStudentSubjectChart(student);
    drawStudentPieChart(student);
    drawStudentComparisonChart(student);
    drawStudentAttendanceGauge(student);
}

function drawStudentSubjectChart(student) {
    const container = d3.select("#subjectChart");
    container.selectAll("*").remove();

    const node = d3.select("#subjectChart").node();
    const width = node ? (node.clientWidth || 500) : 500;
    const height = 300;
    const margin = { top: 30, right: 25, bottom: 45, left: 52 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const subjects = [
        { name: "Maths", score: student.maths, color: "#6366f1", colorName: "Royal Indigo (#6366f1)", domain: "Mathematics" },
        { name: "Science", score: student.science, color: "#0ea5e9", colorName: "Sky Blue (#0ea5e9)", domain: "Applied Science" },
        { name: "English", score: student.english, color: "#10b981", colorName: "Mint Green (#10b981)", domain: "Professional English" },
        { name: "Programming", score: student.programming, color: "#a855f7", colorName: "Neon Purple (#a855f7)", domain: "Programming & Code" }
    ];

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(subjects.map(d => d.name)).range([0, chartWidth]).padding(0.38);
    const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]).nice();

    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""));

    // Minimum Pass threshold 35 line
    svg.append("line")
        .attr("x1", 0).attr("y1", y(35))
        .attr("x2", chartWidth).attr("y2", y(35))
        .attr("stroke", "#f43f5e")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1.5);

    svg.selectAll(".bar")
        .data(subjects)
        .enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.score))
        .attr("height", d => chartHeight - y(d.score))
        .attr("rx", 6)
        .attr("fill", d => d.score >= 35 ? d.color : "#f43f5e")
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            const isPass = d.score >= 35;
            const barColor = isPass ? d.color : "#f43f5e";
            showTooltip(event, formatColorTooltip({
                color: barColor,
                colorName: isPass ? d.colorName : "Crimson Red (#f43f5e)",
                title: `${d.name}: ${d.score} / 100 Marks`,
                category: isPass ? "🟢 Subject Cleared" : "🔴 Arrear Warning",
                reason: isPass
                    ? `Color signifies your clearance in ${d.name} (${d.domain}) meeting the ≥ 35 passing standard.`
                    : `Crimson Red indicates an Arrear: your score (${d.score}) is below the required 35 minimum mark.`,
                stats: [`Your Score: <b>${d.score} / 100</b>`, `Status: <b>${isPass ? "Passed" : "Failed (<35)"}</b>`],
                rule: "Passing Criteria: Minimum 35 / 100"
            }));
        })
        .on("mousemove", function (event, d) {
            const isPass = d.score >= 35;
            showTooltip(event, formatColorTooltip({
                color: isPass ? d.color : "#f43f5e",
                colorName: isPass ? d.colorName : "Crimson Red (#f43f5e)",
                title: `${d.name}: ${d.score} / 100 Marks`,
                category: isPass ? "🟢 Subject Cleared" : "🔴 Arrear Warning",
                reason: isPass
                    ? `Color signifies clearance in ${d.name} (${d.domain}) meeting the ≥ 35 passing standard.`
                    : `Crimson Red indicates an Arrear: score (${d.score}) is below the 35 minimum mark.`,
                stats: [`Your Score: <b>${d.score} / 100</b>`, `Status: <b>${isPass ? "Passed" : "Failed (<35)"}</b>`]
            }));
        })
        .on("mouseleave", function () {
            hideTooltip();
        });

    svg.selectAll(".bar-lbl")
        .data(subjects)
        .enter()
        .append("text")
        .attr("x", d => x(d.name) + x.bandwidth() / 2)
        .attr("y", d => y(d.score) - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "800")
        .attr("fill", "#ffffff")
        .text(d => d.score);

    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x));
    svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    // Bottom Legend
    const legendItems = subjects.map(d => ({
        label: d.name,
        color: d.score >= 35 ? d.color : "#f43f5e",
        badge: `${d.score}/100`,
        info: {
            color: d.score >= 35 ? d.color : "#f43f5e",
            colorName: d.score >= 35 ? d.colorName : "Crimson Red (#f43f5e)",
            title: `${d.name} Score: ${d.score}/100`,
            category: d.domain,
            reason: d.score >= 35 ? `Clearance in ${d.name}` : `Arrear in ${d.name} (<35 marks)`,
            stats: [`Marks: <b>${d.score}/100</b>`]
        }
    }));
    renderChartLegend("#legendSubjectChart", legendItems);
}

function drawStudentPieChart(student) {
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

    const subjects = [
        { name: "Maths", score: student.maths, color: "#6366f1", colorName: "Royal Indigo (#6366f1)" },
        { name: "Science", score: student.science, color: "#0ea5e9", colorName: "Sky Blue (#0ea5e9)" },
        { name: "English", score: student.english, color: "#10b981", colorName: "Mint Green (#10b981)" },
        { name: "Programming", score: student.programming, color: "#a855f7", colorName: "Neon Purple (#a855f7)" }
    ];

    const total = student.total || 400;
    const pie = d3.pie().value(d => d.score).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.56).outerRadius(radius);
    const hoverArc = d3.arc().innerRadius(radius * 0.52).outerRadius(radius * 1.08);

    svg.selectAll(".arc")
        .data(pie(subjects))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#111827")
        .attr("stroke-width", 2.5)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            d3.select(this).transition().duration(200).attr("d", hoverArc);
            const pct = ((d.data.score / total) * 100).toFixed(1);
            showTooltip(event, formatColorTooltip({
                color: d.data.color,
                colorName: d.data.colorName,
                title: `${d.data.name} Score Contribution`,
                category: "Score Share of 400 Marks",
                reason: `Color represents your marks in ${d.data.name}, contributing ${pct}% of your total score.`,
                stats: [
                    `Subject Marks: <b>${d.data.score} / 100</b>`,
                    `Contribution: <b>${pct}% of Grand Total</b>`
                ],
                rule: "Cumulative CBCS Grade Evaluation"
            }));
        })
        .on("mousemove", function (event, d) {
            const pct = ((d.data.score / total) * 100).toFixed(1);
            showTooltip(event, formatColorTooltip({
                color: d.data.color,
                colorName: d.data.colorName,
                title: `${d.data.name} Score Contribution`,
                category: "Score Share of 400 Marks",
                reason: `Color represents your marks in ${d.data.name}, contributing ${pct}% of your total score.`,
                stats: [
                    `Subject Marks: <b>${d.data.score} / 100</b>`,
                    `Contribution: <b>${pct}% of Grand Total</b>`
                ]
            }));
        })
        .on("mouseleave", function () {
            d3.select(this).transition().duration(200).attr("d", arc);
            hideTooltip();
        });

    svg.append("text").attr("text-anchor", "middle").attr("dy", "-3px").attr("font-size", "24px").attr("font-weight", "900").attr("fill", "#ffffff").text(student.total);
    svg.append("text").attr("text-anchor", "middle").attr("dy", "18px").attr("font-size", "10.5px").attr("font-weight", "800").attr("letter-spacing", "0.08em").attr("fill", "#94a3b8").text("/ 400 MARKS");

    const legendItems = subjects.map(d => ({
        label: d.name,
        color: d.color,
        badge: `${d.score}`,
        info: {
            color: d.color,
            colorName: d.colorName,
            title: `${d.name}: ${d.score}/100`,
            category: "Score Share",
            reason: `Contribution of ${d.name} marks to your grand total.`,
            stats: [`Marks: <b>${d.score} / 100</b>`]
        }
    }));
    renderChartLegend("#legendGradeChart", legendItems);
}

function drawStudentComparisonChart(student) {
    const container = d3.select("#attendanceChart");
    container.selectAll("*").remove();

    const node = d3.select("#attendanceChart").node();
    const width = node ? (node.clientWidth || 500) : 500;
    const height = 300;
    const margin = { top: 30, right: 25, bottom: 45, left: 52 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const avgMaths = d3.mean(students, s => s.maths) || 75;
    const avgSci = d3.mean(students, s => s.science) || 75;
    const avgEng = d3.mean(students, s => s.english) || 75;
    const avgProg = d3.mean(students, s => s.programming) || 75;

    const compData = [
        { sub: "Maths", myScore: student.maths, classAvg: avgMaths },
        { sub: "Science", myScore: student.science, classAvg: avgSci },
        { sub: "English", myScore: student.english, classAvg: avgEng },
        { sub: "Prog", myScore: student.programming, classAvg: avgProg }
    ];

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand().domain(compData.map(d => d.sub)).range([0, chartWidth]).padding(0.32);
    const x1 = d3.scaleBand().domain(['my', 'avg']).range([0, x0.bandwidth()]).padding(0.1);
    const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]).nice();

    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""));

    const groups = svg.selectAll(".sub-grp").data(compData).enter().append("g").attr("transform", d => `translate(${x0(d.sub)},0)`);

    groups.append("rect")
        .attr("x", x1('my'))
        .attr("width", x1.bandwidth())
        .attr("y", d => y(d.myScore))
        .attr("height", d => chartHeight - y(d.myScore))
        .attr("rx", 4)
        .attr("fill", "#6366f1")
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            showTooltip(event, formatColorTooltip({
                color: "#6366f1",
                colorName: "Royal Indigo (#6366f1)",
                title: `My Score in ${d.sub}: ${d.myScore}%`,
                category: "Personal Performance",
                reason: "Indigo bar indicates your personal individual score in this subject.",
                stats: [`My Score: <b>${d.myScore}%</b>`, `Class Average: <b>${d.classAvg.toFixed(1)}%</b>`, `Difference: <b>${(d.myScore - d.classAvg >= 0 ? '+' : '')}${(d.myScore - d.classAvg).toFixed(1)}%</b>`]
            }));
        })
        .on("mouseleave", hideTooltip);

    groups.append("rect")
        .attr("x", x1('avg'))
        .attr("width", x1.bandwidth())
        .attr("y", d => y(d.classAvg))
        .attr("height", d => chartHeight - y(d.classAvg))
        .attr("rx", 4)
        .attr("fill", "#475569")
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event, d) {
            showTooltip(event, formatColorTooltip({
                color: "#475569",
                colorName: "Slate Grey (#475569)",
                title: `Class Average in ${d.sub}: ${d.classAvg.toFixed(1)}%`,
                category: "Cohort Benchmark",
                reason: "Slate Grey bar represents the institutional class cohort average for peer comparison.",
                stats: [`Class Average: <b>${d.classAvg.toFixed(1)}%</b>`, `My Score: <b>${d.myScore}%</b>`]
            }));
        })
        .on("mouseleave", hideTooltip);

    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x0));
    svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    const legendItems = [
        {
            label: "My Score",
            color: "#6366f1",
            info: {
                color: "#6366f1",
                colorName: "Royal Indigo",
                title: "My Subject Score",
                category: "Personal Metric",
                reason: "Indigo represents your own earned marks in each subject."
            }
        },
        {
            label: "Class Average",
            color: "#475569",
            info: {
                color: "#475569",
                colorName: "Slate Grey",
                title: "Cohort Benchmark",
                category: "Institutional Metric",
                reason: "Slate Grey represents the average mark scored by all 22 students in your batch."
            }
        }
    ];
    renderChartLegend("#legendAttendanceChart", legendItems);
}

function drawStudentAttendanceGauge(student) {
    const container = d3.select("#genderChart");
    container.selectAll("*").remove();

    const node = d3.select("#genderChart").node();
    const width = node ? (node.clientWidth || 500) : 500;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = container
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2 + 30})`);

    const bgArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius).startAngle(-Math.PI / 2).endAngle(Math.PI / 2);

    const scoreAngle = -Math.PI / 2 + (student.attendance / 100) * Math.PI;
    const valArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius).startAngle(-Math.PI / 2).endAngle(scoreAngle);

    const isEligible = student.attendance >= 75;
    const arcColor = isEligible ? "#10b981" : "#f43f5e";

    svg.append("path").attr("d", bgArc).attr("fill", "#1e293b");
    svg.append("path").attr("d", valArc).attr("fill", arcColor)
        .style("cursor", "pointer")
        .on("mouseenter pointerdown", function (event) {
            showTooltip(event, formatColorTooltip({
                color: arcColor,
                colorName: isEligible ? "Emerald Green (#10b981)" : "Crimson Red (#f43f5e)",
                title: `Attendance: ${student.attendance}%`,
                category: isEligible ? "✅ Exam Eligible" : "⚠️ Attendance Shortage",
                reason: isEligible
                    ? "Emerald Green confirms regular attendance (≥ 75%), fully qualifying you for Semester End Examinations."
                    : "Crimson Red signals an attendance shortage (< 75%), requiring institutional condonation approval.",
                stats: [`Your Attendance: <b>${student.attendance}%</b>`, `Required Cutoff: <b>75%</b>`],
                rule: "Autonomous University Biometric Attendance Regulation"
            }));
        })
        .on("mouseleave", hideTooltip);

    svg.append("text").attr("text-anchor", "middle").attr("dy", "-20px").attr("font-size", "28px").attr("font-weight", "900").attr("fill", "#ffffff").text(`${student.attendance}%`);
    svg.append("text").attr("text-anchor", "middle").attr("dy", "8px").attr("font-size", "12px").attr("font-weight", "700").attr("fill", isEligible ? "#34d399" : "#fb7185")
        .text(isEligible ? "✅ Eligible for Semester Exams" : "⚠️ Attendance Shortage (<75%)");

    const legendItems = [
        {
            label: isEligible ? "Eligible (≥75%)" : "Shortage (<75%)",
            color: arcColor,
            badge: `${student.attendance}%`,
            info: {
                color: arcColor,
                colorName: isEligible ? "Emerald Green" : "Crimson Red",
                title: `Attendance Status: ${student.attendance}%`,
                category: "Eligibility Status",
                reason: isEligible ? "≥ 75% attendance qualifies for semester exams." : "< 75% attendance triggers condonation requirements."
            }
        }
    ];
    renderChartLegend("#legendGenderChart", legendItems);
}
