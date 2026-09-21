/* ====================================================
   UI CONTROLLER, KPI STATS, DATA TABLE, TABS & TOUCH INSPECTION ENGINE
   Aesthetic Velvet Obsidian Glassmorphism & Neon Glows
==================================================== */

let currentActiveViewTab = 'all'; // 'all' | 'analytics' | 'marksheet' | 'table'
// Note: sortColumn and sortDirection can be initialized from data.js or defaulted safely
var sortColumn = (typeof sortColumn !== 'undefined') ? sortColumn : 'id';
var sortDirection = (typeof sortDirection !== 'undefined') ? sortDirection : 'asc';

// ----------------------------------------------------
// 1. TOOLTIP & DOCKED TOUCH INSPECTOR CONTROLLERS
// ----------------------------------------------------
let tooltipSelection = null;
let activeTouchPinned = false;

function getTooltip() {
    if (!tooltipSelection || tooltipSelection.empty()) {
        tooltipSelection = d3.select("#tooltip");
        if (tooltipSelection.empty()) {
            tooltipSelection = d3.select("body").append("div").attr("class", "tooltip").attr("id", "tooltip");
        }
    }
    return tooltipSelection;
}

// Global safe color tooltip formatter
function formatColorTooltip({
    color = "#6366f1",
    colorName = "Indicator",
    title = "Academic Metric",
    category = "PERFORMANCE",
    reason = "Dynamic Evaluation",
    stats = [],
    rule = "",
    actionHint = ""
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
            <div class="tooltip-reason-label">💡 TOUCH INSPECTION SUMMARY:</div>
            <div>${reason}</div>
        </div>
        ${stats.length ? `<div class="tooltip-metric-grid">${statsHtml}</div>` : ''}
        ${rule ? `<div style="font-size:10.5px; color:#94a3b8; margin-top:6px; padding-top:4px; border-top:1px solid rgba(255,255,255,0.08);">📋 <b>Evaluation Criteria:</b> ${rule}</div>` : ''}
        ${actionHint ? `<div class="tooltip-action-hint">👉 ${actionHint}</div>` : ''}
    `;
}

// Expose globally for charts.js or any caller
window.formatColorTooltip = formatColorTooltip;

// Update the docked Touch Inspector Bar at the bottom of the dashboard
function updateTouchInspectorHUD(payload) {
    const dock = d3.select("#touchInspectorDock");
    if (dock.empty()) return;

    dock.classed("idle", false);

    if (typeof payload === 'object' && payload.title) {
        d3.select("#touchDockIcon").text(payload.icon || "📊");
        d3.select("#touchDockTitle").html(`<span>${payload.title}</span>`);
        d3.select("#touchDockDesc").html(payload.desc || payload.reason || "Touch detected. Viewing complete analytical details.");
        if (payload.badge) d3.select("#touchDockBadge").text(payload.badge);
    } else if (typeof payload === 'string') {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = payload;
        const titleText = tempDiv.querySelector(".tooltip-title") ? tempDiv.querySelector(".tooltip-title").innerText : "Inspected Component";
        const reasonText = tempDiv.querySelector(".tooltip-reason-box div:last-child") ? tempDiv.querySelector(".tooltip-reason-box div:last-child").innerText : "Touch or hover element details";
        const categoryText = tempDiv.querySelector(".tooltip-color-name") ? tempDiv.querySelector(".tooltip-color-name").innerText : "DETAIL VIEW";

        d3.select("#touchDockIcon").text("🔍");
        d3.select("#touchDockTitle").html(`<span>${titleText}</span>`);
        d3.select("#touchDockDesc").text(reasonText);
        d3.select("#touchDockBadge").text(categoryText);
    }
}

function resetTouchInspectorHUD() {
    if (activeTouchPinned) return;
    const dock = d3.select("#touchInspectorDock");
    if (dock.empty()) return;
    dock.classed("idle", true);
    d3.select("#touchDockIcon").text("👆");
    d3.select("#touchDockTitle").text("Interactive Touch Inspector Active");
    d3.select("#touchDockDesc").text("Touch or hover over any KPI card, chart element, filter pill, or student row to inspect full details.");
    d3.select("#touchDockBadge").text("TOUCH READY");
}

function showTooltip(event, text) {
    const tt = getTooltip();
    let pageX = 0;
    let pageY = 0;

    if (event.touches && event.touches.length > 0) {
        pageX = event.touches[0].pageX;
        pageY = event.touches[0].pageY;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
        pageX = event.changedTouches[0].pageX;
        pageY = event.changedTouches[0].pageY;
    } else if (event.pageX !== undefined) {
        pageX = event.pageX;
        pageY = event.pageY;
    } else if (event.clientX !== undefined) {
        pageX = event.clientX + (window.scrollX || 0);
        pageY = event.clientY + (window.scrollY || 0);
    }

    tt.style("opacity", 1).html(text);

    const ttNode = tt.node();
    const ttWidth = ttNode ? (ttNode.offsetWidth || 300) : 300;
    const ttHeight = ttNode ? (ttNode.offsetHeight || 160) : 160;
    const winWidth = window.innerWidth;
    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;

    let left = pageX + 16;
    let top = pageY - 24;

    if (left + ttWidth > scrollX + winWidth - 16) {
        left = Math.max(scrollX + 12, pageX - ttWidth - 16);
    }
    if (top + ttHeight > scrollY + window.innerHeight - 16) {
        top = Math.max(scrollY + 12, pageY - ttHeight - 16);
    }
    if (top < scrollY + 10) {
        top = scrollY + 10;
    }

    tt.style("left", left + "px").style("top", top + "px");

    // Also update bottom Touch Inspector Dock
    updateTouchInspectorHUD(text);
}

function hideTooltip() {
    if (!activeTouchPinned) {
        getTooltip().style("opacity", 0);
        resetTouchInspectorHUD();
    }
}

// ----------------------------------------------------
// 2. TOUCH DETAIL GENERATORS FOR DASHBOARD COMPONENTS
// ----------------------------------------------------

function generateKpiTouchDetails(kpiId, data, isStudent) {
    const total = data.length;
    if (isStudent && total > 0) {
        const s = data[0];
        if (kpiId === 1) {
            return formatColorTooltip({
                color: "#6366f1",
                colorName: "Aggregate Performance",
                title: `📊 My Score: ${d3.format(".2f")(s.average)}%`,
                category: "STUDENT PROFILE",
                reason: `Total marks obtained: ${s.total} out of 400 across all 4 semester courses.`,
                stats: [
                    `📐 Mathematics: <b>${s.maths} / 100</b>`,
                    `🔬 Applied Science: <b>${s.science} / 100</b>`,
                    `📖 English Comm: <b>${s.english} / 100</b>`,
                    `💻 Programming: <b>${s.programming} / 100</b>`
                ],
                rule: "Cumulative aggregate divided by total subjects.",
                actionHint: "Click Marksheet Hub to inspect your printable progress card"
            });
        }
        if (kpiId === 2) {
            return formatColorTooltip({
                color: "#0ea5e9",
                colorName: "Academic Grade Point",
                title: `📈 Semester SGPA: ${s.gpa} / 10.0`,
                category: "CBCS EVALUATION",
                reason: `Official UGC Semester Grade Point Average computed based on 16.0 semester credit weightages.`,
                stats: [
                    `SGPA: <b>${s.gpa} / 10.0</b>`,
                    `Division: <b>${s.division}</b>`,
                    `Credits: <b>16.0 Earned</b>`
                ],
                rule: "Formula: Sum of (Course Credits * Grade Points) / Total Credits.",
                actionHint: "Qualifies for First Class Degree Honors"
            });
        }
        if (kpiId === 3) {
            return formatColorTooltip({
                color: s.status === 'Pass' ? "#10b981" : "#ef4444",
                colorName: "Semester Qualification",
                title: `🎓 Result: ${s.status.toUpperCase()} (Grade ${s.grade})`,
                category: "UGC STATUS",
                reason: s.status === 'Pass' ? "All 4 course papers cleared above qualifying minimum 35 marks." : "One or more course papers scored below qualifying threshold.",
                stats: [
                    `Status: <b>${s.status.toUpperCase()}</b>`,
                    `Overall Letter Grade: <b>Grade ${s.grade}</b>`,
                    `Qualifying Criteria: <b>Pass Threshold ≥ 35 Marks</b>`
                ],
                rule: "Zero backlogs permitted for semester clearance.",
                actionHint: "Official provisional transcript ready for download"
            });
        }
        if (kpiId === 4) {
            return formatColorTooltip({
                color: s.attendance >= 75 ? "#34d399" : "#fb7185",
                colorName: "Classroom Telemetry",
                title: `⏱ Attendance: ${s.attendance}%`,
                category: "ATTENDANCE RECORD",
                reason: s.attendance >= 75 ? "Full examination hall ticket eligibility granted." : "Attendance shortage alert: Minimum 75% required under university regulations.",
                stats: [
                    `Recorded Attendance: <b>${s.attendance}%</b>`,
                    `Eligibility: <b>${s.attendance >= 75 ? 'ELIGIBLE' : 'CONDONATION REQUIRED'}</b>`,
                    `Cutoff: <b>75% Standard Requirement</b>`
                ],
                rule: "Shortage below 65% triggers mandatory detention without medical condonation.",
                actionHint: s.attendance >= 75 ? "Excellent attendance record" : "Contact academic dean for condonation form"
            });
        }
        if (kpiId === 5) {
            return formatColorTooltip({
                color: "#a855f7",
                colorName: "Academic Discipline",
                title: `🏫 Department: ${s.department}`,
                category: "AFFILIATION",
                reason: `${DEPT_NAMES[s.department] || 'Engineering'} under BIET Autonomous Academic Framework.`,
                stats: [
                    `Department: <b>${s.department}</b>`,
                    `Roll Number: <b>${s.rollNo || '22A91A0504'}</b>`,
                    `Degree: <b>B.Tech 4-Year Autonomous CBCS</b>`
                ],
                rule: "Autonomous college curriculum approved by UGC & AICTE.",
                actionHint: "View cohort comparison in charts tab"
            });
        }
        if (kpiId === 6) {
            return formatColorTooltip({
                color: "#f59e0b",
                colorName: "Credit Accumulation",
                title: `📜 Credits Earned: 16.0 / 16.0`,
                category: "DEGREE AUDIT",
                reason: "Total Choice Based Credit System semester units earned upon clearing courses.",
                stats: [
                    `Course 1 (Maths): <b>4.0 Credits</b>`,
                    `Course 2 (Science): <b>4.0 Credits</b>`,
                    `Course 3 (English): <b>4.0 Credits</b>`,
                    `Course 4 (Programming): <b>4.0 Credits</b>`
                ],
                rule: "16.0 total credits required to complete Semester I evaluation.",
                actionHint: "All credits verified by Controller of Examinations"
            });
        }
    }

    // Faculty View KPIs
    const passedCount = data.filter(d => d.status === "Pass").length;
    const failCount = total - passedCount;
    const passPercentage = total === 0 ? 0 : (passedCount / total) * 100;
    const average = total === 0 ? 0 : d3.mean(data, d => d.average);
    const attendance = total === 0 ? 0 : d3.mean(data, d => d.attendance);

    if (kpiId === 1) { // Total Students
        const depts = {};
        data.forEach(s => depts[s.department] = (depts[s.department] || 0) + 1);
        const deptStr = Object.keys(depts).map(d => `<b>${d}</b>: ${depts[d]}`).join(" • ");
        const maleCount = data.filter(s => s.gender === "Male").length;
        const femaleCount = data.filter(s => s.gender === "Female").length;

        return formatColorTooltip({
            color: "#6366f1",
            colorName: "Enrolled Registry",
            title: `👥 Total Students: ${total} Active Records`,
            category: "COHORT AUDIT",
            reason: `Active student cohort enrolled across autonomous engineering branches for semester evaluation.`,
            stats: [
                `Active Enrollment: <b>${total} Students</b>`,
                `Department Breakdown: ${deptStr}`,
                `Demographics: <b>${maleCount} Male</b> / <b>${femaleCount} Female</b>`,
                `Evaluation Standard: <b>UGC 10-Point Letter Grading</b>`
            ],
            rule: "Every student record maintains validated semester grades across 4 subjects.",
            actionHint: "Touch any department pill to filter students instantly"
        });
    }

    if (kpiId === 2) { // Cohort Total %
        const mathsAvg = total === 0 ? 0 : d3.mean(data, d => d.maths);
        const sciAvg = total === 0 ? 0 : d3.mean(data, d => d.science);
        const engAvg = total === 0 ? 0 : d3.mean(data, d => d.english);
        const prgAvg = total === 0 ? 0 : d3.mean(data, d => d.programming);

        return formatColorTooltip({
            color: "#0ea5e9",
            colorName: "Performance Mean",
            title: `📊 Cohort Class Average: ${d3.format(".2f")(average)}%`,
            category: "AGGREGATE ANALYTICS",
            reason: `Institutional mean score across all subjects and departments for current active filter.`,
            stats: [
                `Overall Class Average: <b>${d3.format(".2f")(average)}%</b>`,
                `📐 Mathematics Avg: <b>${d3.format(".1f")(mathsAvg)}%</b>`,
                `🔬 Applied Science Avg: <b>${d3.format(".1f")(sciAvg)}%</b>`,
                `📖 English Comm Avg: <b>${d3.format(".1f")(engAvg)}%</b>`,
                `💻 Programming Avg: <b>${d3.format(".1f")(prgAvg)}%</b>`
            ],
            rule: "Class Average = Sum of all individual student marks / Total course attempts.",
            actionHint: "Touch chart cards below to inspect subject-wise distributions"
        });
    }

    if (kpiId === 3) { // Pass Status
        const distCount = data.filter(s => s.status === 'Pass' && s.average >= 80).length;
        const firstCount = data.filter(s => s.status === 'Pass' && s.average >= 60 && s.average < 80).length;
        const secondCount = data.filter(s => s.status === 'Pass' && s.average < 60).length;

        return formatColorTooltip({
            color: "#10b981",
            colorName: "Clearance Rate",
            title: `🎓 Pass Rate: ${d3.format(".1f")(passPercentage)}% (${passedCount}/${total} Cleared)`,
            category: "ACADEMIC CLEARANCE",
            reason: `${passedCount} of ${total} students satisfied all minimum qualification criteria with zero backlogs.`,
            stats: [
                `Passed Students: <b>${passedCount} (${d3.format(".1f")(passPercentage)}%)</b>`,
                `Arrears / Backlogs: <b>${failCount} (${d3.format(".1f")(100 - passPercentage)}%)</b>`,
                `Distinction Tier (≥80%): <b>${distCount} Students</b>`,
                `First Class Tier (60-79%): <b>${firstCount} Students</b>`,
                `Pass Class Tier (40-59%): <b>${secondCount} Students</b>`
            ],
            rule: "UGC Passing Rule: Candidate must achieve ≥35 marks in ALL 4 individual courses.",
            actionHint: "Touch '🟢 Passed' or '🔴 Arrears' pill to isolate groups"
        });
    }

    if (kpiId === 4) { // Attendance
        const eligibleCount = data.filter(s => s.attendance >= 75).length;
        const condonationCount = data.filter(s => s.attendance >= 65 && s.attendance < 75).length;
        const detainedCount = data.filter(s => s.attendance < 65).length;

        return formatColorTooltip({
            color: "#f59e0b",
            colorName: "Classroom Participation",
            title: `⏱ Average Attendance: ${d3.format(".1f")(attendance)}%`,
            category: "TELEMETRY AUDIT",
            reason: `Institutional classroom lecture and practical laboratory session presence telemetry.`,
            stats: [
                `Cohort Mean Attendance: <b>${d3.format(".1f")(attendance)}%</b>`,
                `Eligible for Exams (≥75%): <b>${eligibleCount} Students (${((eligibleCount/total)*100).toFixed(0)}%)</b>`,
                `Condonation Zone (65-74%): <b>${condonationCount} Students</b>`,
                `Detention Risk (<65%): <b>${detainedCount} Students</b>`
            ],
            rule: "University Exam Bye-Laws: 75% minimum classroom presence required.",
            actionHint: "Touch '⚠️ Low Attendance' to see all students with shortage"
        });
    }

    if (kpiId === 5) { // Cohort Topper
        let topper = data[0];
        let maxAvg = 0;
        data.forEach(s => {
            if (s.average > maxAvg) { maxAvg = s.average; topper = s; }
        });

        return formatColorTooltip({
            color: "#a855f7",
            colorName: "Gold Medalist",
            title: `🌟 Cohort Topper: ${topper ? topper.name : 'None'}`,
            category: "EXCELLENCE HONORS",
            reason: topper ? `Highest aggregate semester score across all engineering departments.` : `No student data available.`,
            stats: topper ? [
                `Student Name: <b>${topper.name}</b> (${topper.department})`,
                `Roll Number: <b>${topper.rollNo || '22A91A0504'}</b>`,
                `Grand Total: <b>${topper.total} / 400 (${d3.format(".2f")(topper.average)}%)</b>`,
                `Semester SGPA: <b>${topper.gpa} / 10.0 (Grade ${topper.grade})</b>`,
                `Breakdown: MTH: <b>${topper.maths}</b> | SCI: <b>${topper.science}</b> | ENG: <b>${topper.english}</b> | PRG: <b>${topper.programming}</b>`,
                `Attendance: <b>${topper.attendance}%</b> • Division: <b>${topper.division}</b>`
            ] : [`No data`],
            rule: "UGC Grade O (Outstanding): SGPA 10.0 awarded for scores ≥90%.",
            actionHint: "Click to open topper's official printable progress marksheet"
        });
    }

    if (kpiId === 6) { // Arrears / Remedials
        const failedStudents = data.filter(s => s.status === 'Fail');
        const failedNames = failedStudents.map(s => `${s.name} (${s.department})`).join(", ") || "None";

        return formatColorTooltip({
            color: "#f43f5e",
            colorName: "Remedial Intervention",
            title: `⚠️ Arrears / Backlogs: ${failCount} Students Flagged`,
            category: "ACADEMIC INTERVENTION",
            reason: failCount > 0 ? `Identified students who scored under 35 marks in one or more core subjects.` : `100% pass clearance achieved. No remedial coaching required.`,
            stats: [
                `Students Requiring Remedial: <b>${failCount} Students</b>`,
                `Affected Candidates: <b>${failedNames}</b>`,
                `Remedial Action: <b>Mandatory Tutorial Classes Scheduled</b>`,
                `Supplementary Exam: <b>Scheduled for Semester End Break</b>`
            ],
            rule: "Any individual subject score < 35 triggers automatic backlog (Grade F).",
            actionHint: "Click to filter Arrears list in the Master Records Table"
        });
    }

    return "";
}

function generateStudentTouchDetails(s) {
    const isPass = s.status === "Pass";
    const color = isPass ? (s.grade === 'O' ? '#10b981' : s.grade === 'A+' ? '#0ea5e9' : '#6366f1') : '#ef4444';
    return formatColorTooltip({
        color: color,
        colorName: `${s.department} • Roll #${s.id}`,
        title: `🎓 ${s.name} (${s.department})`,
        category: `GRADE ${s.grade} • ${s.status.toUpperCase()}`,
        reason: isPass ? `Passed all academic requirements with ${d3.format(".2f")(s.average)}% aggregate.` : `Arrear detected: Scored below 35 qualifying marks in one or more subjects.`,
        stats: [
            `📐 Mathematics: <b>${s.maths} / 100</b> (${s.maths >= 35 ? 'Pass' : 'FAIL'})`,
            `🔬 Applied Science: <b>${s.science} / 100</b> (${s.science >= 35 ? 'Pass' : 'FAIL'})`,
            `📖 English Comm: <b>${s.english} / 100</b> (${s.english >= 35 ? 'Pass' : 'FAIL'})`,
            `💻 Programming: <b>${s.programming} / 100</b> (${s.programming >= 35 ? 'Pass' : 'FAIL'})`,
            `📊 Grand Total: <b>${s.total} / 400 (${d3.format(".2f")(s.average)}%)</b>`,
            `🎯 Semester SGPA: <b>${s.gpa} / 10.0</b>`,
            `⏱ Attendance: <b>${s.attendance}%</b> (${s.attendance >= 75 ? 'Eligible' : 'Shortage Alert'})`,
            `📜 Academic Classification: <b>${s.division || 'Standard'}</b>`
        ],
        rule: "UGC 10-Point Scale: O(10), A+(9), A(8), B+(7), B(6), C(5), P(4), F(0).",
        actionHint: "Click 'Marksheet' to open and print official university certificate"
    });
}

function generateFilterTouchDetails(filterType, val) {
    const allData = students;
    if (filterType === 'all') {
        return formatColorTooltip({
            color: "#6366f1",
            colorName: "Cohort Scope",
            title: `👥 View All Students (${allData.length})`,
            category: "FILTER PRESET",
            reason: `Resets all filters to include every student across all 5 engineering departments.`,
            stats: [
                `Total Enrolled: <b>${allData.length} Students</b>`,
                `Passing Clearance: <b>${allData.filter(s => s.status === 'Pass').length} Passed</b>`,
                `Class Mean: <b>${d3.mean(allData, s => s.average).toFixed(1)}%</b>`
            ],
            rule: "Complete cohort telemetry without department or grade exclusions.",
            actionHint: "Touch to activate this view"
        });
    }
    if (filterType === 'topper') {
        const toppers = allData.filter(s => s.grade === 'O');
        return formatColorTooltip({
            color: "#10b981",
            colorName: "Distinction Honors",
            title: `🌟 Grade O Toppers (${toppers.length} Students)`,
            category: "ACADEMIC MERIT",
            reason: `Students achieving aggregate scores ≥90% with SGPA 10.0 across all courses.`,
            stats: [
                `Count: <b>${toppers.length} Toppers</b>`,
                `Toppers: <b>${toppers.map(s => s.name).join(", ")}</b>`,
                `Minimum Required: <b>360 / 400 Marks</b>`
            ],
            rule: "Grade O is the highest academic award under UGC guidelines.",
            actionHint: "Touch to filter table to Toppers only"
        });
    }
    if (filterType === 'status') {
        const subset = allData.filter(s => s.status === val);
        return formatColorTooltip({
            color: val === 'Pass' ? "#10b981" : "#ef4444",
            colorName: "Result Filter",
            title: `${val === 'Pass' ? '🟢 Passed Students' : '🔴 Arrears & Backlogs'} (${subset.length})`,
            category: "EXAM CLEARANCE",
            reason: val === 'Pass' ? `Students who secured ≥35 marks in all 4 subjects.` : `Students with marks <35 in one or more course papers.`,
            stats: [
                `Student Count: <b>${subset.length} of ${allData.length}</b>`,
                `Percentage of Cohort: <b>${((subset.length/allData.length)*100).toFixed(1)}%</b>`
            ],
            rule: val === 'Pass' ? "Eligible for semester marksheet certification." : "Requires supplementary examination re-test.",
            actionHint: `Touch to view ${val} list in table`
        });
    }
    if (filterType === 'attendance') {
        const subset = allData.filter(s => s.attendance < 75);
        return formatColorTooltip({
            color: "#f59e0b",
            colorName: "Attendance Shortage",
            title: `⚠️ Low Attendance (<75%) (${subset.length} Students)`,
            category: "ELIGIBILITY AUDIT",
            reason: `Students flagged for falling below mandatory 75% classroom attendance threshold.`,
            stats: [
                `Flagged Students: <b>${subset.length} Students</b>`,
                `Names: <b>${subset.map(s => `${s.name} (${s.attendance}%)`).join(", ")}</b>`
            ],
            rule: "Shortage requires formal condonation approval before exam clearance.",
            actionHint: "Touch to inspect low attendance records"
        });
    }
    if (filterType === 'dept') {
        const subset = allData.filter(s => s.department === val);
        const passCount = subset.filter(s => s.status === 'Pass').length;
        const deptAvg = d3.mean(subset, s => s.average).toFixed(1);
        return formatColorTooltip({
            color: "#0ea5e9",
            colorName: DEPT_NAMES[val] || val,
            title: `🏢 Department of ${val} (${subset.length} Students)`,
            category: "DEPARTMENT AUDIT",
            reason: `Cohort performance statistics specifically for the ${val} engineering discipline.`,
            stats: [
                `Students: <b>${subset.length} Enrolled</b>`,
                `Department Average: <b>${deptAvg}%</b>`,
                `Pass Clearance: <b>${passCount} / ${subset.length} (${((passCount/subset.length)*100).toFixed(0)}%)</b>`
            ],
            rule: "Autonomous college engineering departmental curriculum.",
            actionHint: `Touch to isolate ${val} department data`
        });
    }
    return "";
}

// ----------------------------------------------------
// 3. CORE UI FORMATTING & TOASTS
// ----------------------------------------------------

// Format individual subject score with visual mini indicator bar
function formatVisualScore(val, color) {
    const num = Number(val) || 0;
    const isArrear = num < PASS_MARK_THRESHOLD;
    const barWidth = Math.min(100, Math.max(0, num));
    return `
        <div class="visual-score-wrap" style="display:flex; flex-direction:column; gap:3px; min-width:64px;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700; font-size:12px; color:${isArrear ? '#ef4444' : '#f1f5f9'}; font-family:'Space Grotesk', monospace;">
                <span>${num}</span>
                ${isArrear ? '<span style="font-size:9.5px; color:#ef4444; font-weight:800; background:rgba(239,68,68,0.15); padding:1px 4px; border-radius:4px;">FAIL</span>' : ''}
            </div>
            <div style="width:100%; height:4px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden;">
                <div style="width:${barWidth}%; height:100%; background:${isArrear ? '#ef4444' : color}; border-radius:2px; box-shadow:0 0 4px ${isArrear ? '#ef4444' : color};"></div>
            </div>
        </div>
    `;
}

function openColorGuideModal() {
    d3.select("#colorGuideModal").classed("active", true);
}

function closeColorGuideModal() {
    d3.select("#colorGuideModal").classed("active", false);
}

function showToast(message, type = "info") {
    const container = d3.select("#toastContainer");
    let icon = "ℹ️";
    if (type === "success") icon = "🎓";
    if (type === "danger") icon = "🗑️";
    if (type === "warning") icon = "⚠️";

    const toast = container.append("div")
        .attr("class", `toast toast-${type}`)
        .html(`<span>${icon}</span> <span>${message}</span>`);

    setTimeout(() => {
        toast
            .style("transition", "all 0.3s ease")
            .style("opacity", "0")
            .style("transform", "translateX(100%)");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Switch between Main Navigation Views: All Information / Analytics / Marksheet Hub / Master Table
function switchViewTab(tab) {
    currentActiveViewTab = tab;

    d3.selectAll(".horizontal-nav-btn").classed("active", false);
    d3.select(`#tabView-${tab}`).classed("active", true);

    const analyticsSection = d3.select("#analyticsSection");
    const marksheetSection = d3.select("#marksheetHubSection");
    const tableSection = d3.select("#tableSection");

    const student = students.find(s => s.id === currentSelectedStudentId) || students[0];

    if (tab === 'all') {
        analyticsSection.style("display", "block");
        marksheetSection.style("display", "block");
        tableSection.style("display", "block");
        if (student) {
            initStudentSelector();
            populateMarksheet(student);
            syncSimulatorInputs(student);
        }
    } else if (tab === 'analytics') {
        analyticsSection.style("display", "block");
        marksheetSection.style("display", "none");
        tableSection.style("display", "block");
        const el = document.getElementById("analyticsSection");
        if (el && typeof el.scrollIntoView === 'function') {
            try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { el.scrollIntoView(); }
        }
    } else if (tab === 'marksheet') {
        analyticsSection.style("display", "none");
        marksheetSection.style("display", "block");
        tableSection.style("display", "none");
        if (student) {
            initStudentSelector();
            populateMarksheet(student);
            syncSimulatorInputs(student);
        }
        const el = document.getElementById("marksheetHubSection");
        if (el && typeof el.scrollIntoView === 'function') {
            try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { el.scrollIntoView(); }
        }
    } else if (tab === 'table') {
        analyticsSection.style("display", "none");
        marksheetSection.style("display", "none");
        tableSection.style("display", "block");
        const el = document.getElementById("tableSection");
        if (el && typeof el.scrollIntoView === 'function') {
            try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { el.scrollIntoView(); }
        }
    }
}

// Quick Filter Pills Handler
function applyQuickFilter(filterType, val) {
    d3.selectAll(".quick-filter-pill").classed("active", false);

    if (filterType === 'all') {
        resetFilters();
        d3.select("#pill-all").classed("active", true);
        showToast("Showing all cohort records", "info");
        return;
    }

    if (filterType === 'dept') {
        d3.select("#departmentFilter").property("value", val);
        d3.select(`#pill-dept-${val}`).classed("active", true);
        showToast(`Filtered to ${val} Department`, "info");
    } else if (filterType === 'status') {
        d3.select("#statusFilter").property("value", val);
        d3.select(`#pill-status-${val.toLowerCase()}`).classed("active", true);
        showToast(`Filtered to ${val} students`, "info");
    } else if (filterType === 'topper') {
        d3.select("#gradeFilter").property("value", "O");
        d3.select("#pill-toppers").classed("active", true);
        showToast("Filtered to Top Rankers (Grade O, ≥90%)", "info");
    } else if (filterType === 'attendance') {
        d3.select("#statusFilter").property("value", "All");
        d3.select("#pill-low-att").classed("active", true);
        showToast("Showing students with Attendance Shortage (<75%)", "warning");
    }

    updateDashboard();
}

// ----------------------------------------------------
// 4. KPI CARDS UPDATE & TOUCH ATTACHMENTS
// ----------------------------------------------------

function updateKPIs(data, isStudent) {
    let kpiList = [];

    if (isStudent && data.length > 0) {
        const student = data[0];
        kpiList = [
            { id: 1, icon: "📊", title: "My Total Percentage", value: `${d3.format(".2f")(student.average)}%` },
            { id: 2, icon: "📈", title: "Semester SGPA", value: `${student.gpa} / 10` },
            { id: 3, icon: student.status === "Pass" ? "🟢" : "🔴", title: "Result & Grade", value: `${student.status.toUpperCase()} (Gr. ${student.grade})` },
            { id: 4, icon: "⏱", title: "My Attendance", value: `${student.attendance}%` },
            { id: 5, icon: "🏫", title: "My Department", value: student.department },
            { id: 6, icon: "📜", title: "Credits Earned", value: `${student.status === "Pass" ? "16.0" : ((student.creditsEarned !== undefined ? student.creditsEarned : 12.0) + ".0")} / 16` }
        ];

        // Sidebar Snapshot
        d3.select("#sidebarTotalEnrolled").text("Personal Record");
        d3.select("#sidebarClassMean").text(`${d3.format(".2f")(student.average)}%`);
        d3.select("#sidebarPassClearance").text(student.status.toUpperCase());
        d3.select("#sidebarAvgAttendance").text(`${student.attendance}%`);
    } else {
        const total = data.length;
        const average = total === 0 ? 0 : d3.mean(data, d => d.average);
        const passedCount = data.filter(d => d.status === "Pass").length;
        const passPercentage = total === 0 ? 0 : (passedCount / total) * 100;
        const attendance = total === 0 ? 0 : d3.mean(data, d => d.attendance);
        const failCount = total - passedCount;

        // Top student finder
        let topperName = "-";
        if (data.length > 0) {
            const topStudent = [...data].sort((a, b) => b.average - a.average)[0];
            if (topStudent) {
                topperName = topStudent.name;
            }
        }

        kpiList = [
            { id: 1, icon: "👥", title: "Total Students", value: total },
            { id: 2, icon: "📊", title: "Cohort Total %", value: `${d3.format(".2f")(average)}%` },
            { id: 3, icon: "🎓", title: "Passed Students", value: `${passedCount} (${d3.format(".1f")(passPercentage)}%)` },
            { id: 4, icon: "⏱", title: "Avg Attendance", value: `${d3.format(".1f")(attendance)}%` },
            { id: 5, icon: "🌟", title: "Cohort Topper", value: topperName },
            { id: 6, icon: failCount > 0 ? "⚠️" : "✅", title: "Arrears / Remedials", value: `${failCount} Students` }
        ];

        // Sidebar Snapshot
        d3.select("#sidebarTotalEnrolled").text(`${total} Students`);
        d3.select("#sidebarClassMean").text(`${d3.format(".1f")(average)}%`);
        d3.select("#sidebarPassClearance").text(`${passedCount}/${total} (${d3.format(".0f")(passPercentage)}%)`);
        d3.select("#sidebarAvgAttendance").text(`${d3.format(".1f")(attendance)}%`);
    }

    // Bind each KPI Card with Clean View + Touch-to-Reveal Handlers
    kpiList.forEach(k => {
        d3.select(`#kpiIcon${k.id}`).text(k.icon);
        d3.select(`#kpiTitle${k.id}`).text(k.title);
        d3.select(`#kpiValue${k.id}`).text(k.value);
        
        // Clean dynamic touch indicator instead of permanent wall of text
        d3.select(`#kpiSubtext${k.id}`).html(`<span class="kpi-touch-indicator">👆 Touch for deep details</span>`);

        const cardEl = d3.select(`#kpiTitle${k.id}`).node() ? d3.select(d3.select(`#kpiTitle${k.id}`).node().closest(".kpi-card")) : null;
        if (cardEl && !cardEl.empty()) {
            cardEl
                .on("pointerenter touchstart", function (event) {
                    d3.select(this).classed("touch-active", true);
                    const detailHtml = generateKpiTouchDetails(k.id, data, isStudent);
                    showTooltip(event, detailHtml);
                })
                .on("pointermove", function (event) {
                    const detailHtml = generateKpiTouchDetails(k.id, data, isStudent);
                    showTooltip(event, detailHtml);
                })
                .on("pointerleave touchend", function () {
                    d3.select(this).classed("touch-active", false);
                    hideTooltip();
                })
                .on("click", function (event) {
                    const detailHtml = generateKpiTouchDetails(k.id, data, isStudent);
                    showTooltip(event, detailHtml);
                    if (k.id === 5) {
                        const topStudent = [...data].sort((a, b) => b.average - a.average)[0];
                        if (topStudent) openProgressCard(topStudent.id);
                    } else if (k.id === 6 && !isStudent) {
                        applyQuickFilter('status', 'Fail');
                    } else if (k.id === 3 && !isStudent) {
                        applyQuickFilter('status', 'Pass');
                    }
                });
        }
    });

    // Attach touch listeners to cohort snapshot pills in the filter bar
    d3.selectAll(".cohort-snap-pill").each(function () {
        const snap = d3.select(this);
        const text = snap.text();
        snap
            .on("pointerenter touchstart", function (event) {
                snap.classed("touch-active", true);
                showTooltip(event, formatColorTooltip({
                    color: "#6366f1",
                    colorName: "Live Snapshot",
                    title: `📊 Cohort Status: ${text.trim()}`,
                    category: "SNAPSHOT METRIC",
                    reason: "Current active filter sample statistics.",
                    stats: [
                        `Total in view: <b>${data.length} Students</b>`,
                        `Pass rate: <b>${data.length ? ((data.filter(s => s.status === 'Pass').length / data.length) * 100).toFixed(1) : 0}%</b>`
                    ],
                    rule: "Recalculates dynamically whenever filters or student scores change.",
                    actionHint: "Touch to review complete cohort metrics"
                }));
            })
            .on("pointerleave touchend", function () {
                snap.classed("touch-active", false);
                hideTooltip();
            });
    });

    // Attach touch listeners to all quick filter pills
    d3.selectAll(".quick-filter-pill").each(function () {
        const pill = d3.select(this);
        const id = pill.attr("id") || "";
        let filterType = 'all';
        let filterVal = '';

        if (id === 'pill-toppers') { filterType = 'topper'; }
        else if (id === 'pill-status-pass') { filterType = 'status'; filterVal = 'Pass'; }
        else if (id === 'pill-status-fail') { filterType = 'status'; filterVal = 'Fail'; }
        else if (id === 'pill-low-att') { filterType = 'attendance'; }
        else if (id.startsWith('pill-dept-')) { filterType = 'dept'; filterVal = id.replace('pill-dept-', ''); }

        pill
            .on("pointerenter touchstart", function (event) {
                pill.classed("touch-active", true);
                showTooltip(event, generateFilterTouchDetails(filterType, filterVal));
            })
            .on("pointerleave touchend", function () {
                pill.classed("touch-active", false);
                hideTooltip();
            });
    });
}

// ----------------------------------------------------
// 5. MASTER TABLE WITH TOUCH-TO-REVEAL STUDENT PROFILES
// ----------------------------------------------------

function updateTable(data, isStudent) {
    const tableBody = d3.select("#studentTable");

    if (isStudent) {
        d3.select("#tableSectionHeading").text("📋 My Academic Evaluation & Marksheet");
        d3.select("#tableRecordCount").html(`Displaying personal record for <b>${currentUser.name}</b> (Touch row for breakdown)`);
        d3.select("#thActions").style("display", "none");
    } else {
        d3.select("#tableSectionHeading").text("📋 Student Academic Records & Progress Cards");
        d3.select("#tableRecordCount").html(`Displaying <b>${data.length}</b> of <b>${students.length}</b> students • <i>Touch any row to view complete subject evaluation</i>`);
        d3.select("#thActions").style("display", "");
    }

    tableBody.selectAll("tr").filter(function () {
        return !this.__data__ || this.__data__.id === undefined;
    }).remove();

    if (data.length === 0) {
        tableBody.selectAll("tr").remove();
        tableBody.append("tr")
            .attr("class", "no-records-row")
            .append("td")
            .attr("colspan", isStudent ? 14 : 15)
            .style("text-align", "center")
            .style("padding", "30px")
            .style("color", "#64748b")
            .html("No matching records found.");
        return;
    }

    const maxAverage = d3.max(students, d => d.average);

    const rows = tableBody.selectAll("tr")
        .data(data, (d, i) => (d && d.id !== undefined ? d.id : `row-${i}`))
        .join(
            enter => enter.append("tr")
                .style("opacity", 0)
                .call(enter => enter.transition().duration(250).style("opacity", 1)),
            update => update,
            exit => exit.remove()
        );

    rows.html(d => {
        let tags = '';
        if (d.average === maxAverage && maxAverage > 0 && d.status === "Pass") {
            tags += '<span class="tag-topper">🌟 Topper</span>';
        }
        if (d.attendance < 75) {
            tags += '<span class="tag-low-att">⚠️ Low Att.</span>';
        }

        const attColor = d.attendance >= 85 ? '#34d399' : d.attendance >= 75 ? '#fbbf24' : '#fb7185';
        const actionsHtml = !isStudent ? `
            <td style="text-align: center;">
                <div class="actions-cell">
                    <button type="button" class="btn-action-icon" title="Edit Student Record" onclick="editStudent(${d.id})">✏️</button>
                    <button type="button" class="btn-action-icon btn-action-delete" title="Delete Student" onclick="deleteStudent(${d.id})">🗑️</button>
                </div>
            </td>
        ` : '';

        return `
            <td style="font-weight: 800; text-align: center; color: #818cf8;">#${d.id}</td>
            <td style="font-weight: 700;">
                <div>${d.name} ${tags}</div>
                <div style="font-size: 10.5px; color: #818cf8; font-family: 'Space Grotesk', monospace; font-weight: 600; margin-top: 1px;">${d.rollNo || ('22A91A05' + String(d.id).padStart(2,'0'))}</div>
            </td>
            <td style="text-align: center;"><span class="badge badge-dept">${d.department}</span></td>
            <td style="text-align: center;">${d.gender}</td>
            <td>${formatVisualScore(d.maths, '#6366f1')}</td>
            <td>${formatVisualScore(d.science, '#0ea5e9')}</td>
            <td>${formatVisualScore(d.english, '#10b981')}</td>
            <td>${formatVisualScore(d.programming, '#a855f7')}</td>
            <td style="font-weight: 800; text-align: center; color: #e2e8f0; font-family: 'Space Grotesk', monospace;">${d.total} / 400</td>
            <td style="text-align: center;"><span class="badge-percentage">${d3.format(".2f")(d.average)}%</span></td>
            <td style="text-align: center;"><span style="color:${attColor}; font-weight:800; font-family: 'Space Grotesk', monospace;">${d.attendance}%</span></td>
            <td style="text-align: center;"><span class="badge ${d.status === 'Pass' ? 'status-pass' : 'status-fail'}">${d.status === 'Pass' ? 'PASS' : 'FAIL'}</span></td>
            <td style="text-align: center;"><span class="badge grade-${d.grade}">Gr. ${d.grade}</span></td>
            <td style="text-align: center;">
                <button type="button" class="btn-progress-card" 
                        onclick="openProgressCard(${d.id})"
                        title="View Official University Marksheet">
                    🎓 Marksheet
                </button>
            </td>
            ${actionsHtml}
        `;
    });

    // Attach Touch & Hover Listeners to EVERY Student Row
    rows
        .on("pointerenter touchstart", function (event, d) {
            d3.select(this).classed("touch-active", true);
            showTooltip(event, generateStudentTouchDetails(d));
        })
        .on("pointermove", function (event, d) {
            showTooltip(event, generateStudentTouchDetails(d));
        })
        .on("pointerleave touchend", function () {
            d3.select(this).classed("touch-active", false);
            hideTooltip();
        });
}

// ----------------------------------------------------
// 6. SORTING, FILTERING & CSV EXPORT
// ----------------------------------------------------

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = (['maths', 'science', 'english', 'programming', 'total', 'average', 'attendance'].includes(column)) ? 'desc' : 'asc';
    }

    const GRADE_RANKS = { 'O': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'F': 0 };

    students.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (sortColumn === 'grade') {
            const rankA = GRADE_RANKS[valA] !== undefined ? GRADE_RANKS[valA] : -1;
            const rankB = GRADE_RANKS[valB] !== undefined ? GRADE_RANKS[valB] : -1;
            return sortDirection === 'asc' ? rankA - rankB : rankB - rankA;
        }

        if (typeof valA === 'string') {
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? (Number(valA) || 0) - (Number(valB) || 0) : (Number(valB) || 0) - (Number(valA) || 0);
    });

    updateTableHeaders();
    updateTable(getFilteredData(), currentUser && currentUser.role === 'Student');
}

function updateTableHeaders() {
    d3.selectAll("#tableHeaderRow th").classed("sorted-asc sorted-desc", false);
    const cols = ['id', 'name', 'department', 'gender', 'maths', 'science', 'english', 'programming', 'total', 'average', 'attendance', 'status', 'grade'];
    const idx = cols.indexOf(sortColumn);
    if (idx !== -1 && idx !== undefined) {
        d3.selectAll("#tableHeaderRow th").filter((d, i) => i === idx)
            .classed(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc', true);
    }
}

function getFilteredData() {
    if (currentUser && currentUser.role === 'Student') {
        const myStudent = getStudentForUser(currentUser);
        return myStudent ? [myStudent] : [];
    }

    const department = d3.select("#departmentFilter").node() ? d3.select("#departmentFilter").property("value") : "All";
    const gender = d3.select("#genderFilter").node() ? d3.select("#genderFilter").property("value") : "All";
    const status = d3.select("#statusFilter").node() ? d3.select("#statusFilter").property("value") : "All";
    const grade = d3.select("#gradeFilter").node() ? d3.select("#gradeFilter").property("value") : "All";
    const search = d3.select("#searchInput").node() ? d3.select("#searchInput").property("value").toLowerCase().trim() : "";

    let filtered = students.filter(student => {
        const matchesDept = (department === "All" || student.department === department);
        const matchesGender = (gender === "All" || student.gender === gender);
        const matchesStatus = (status === "All" || student.status === status);
        const matchesGrade = (grade === "All" || student.grade === grade);
        const matchesSearch = student.name.toLowerCase().includes(search) || String(student.id).includes(search) || (student.rollNo && student.rollNo.toLowerCase().includes(search));
        return matchesDept && matchesGender && matchesStatus && matchesGrade && matchesSearch;
    });

    if (d3.select("#pill-low-att").classed("active")) {
        filtered = filtered.filter(s => s.attendance < 75);
    }

    return filtered;
}

function resetFilters() {
    d3.select("#departmentFilter").property("value", "All");
    d3.select("#genderFilter").property("value", "All");
    d3.select("#statusFilter").property("value", "All");
    d3.select("#gradeFilter").property("value", "All");
    d3.select("#searchInput").property("value", "");
    d3.selectAll(".quick-filter-pill").classed("active", false);
    d3.select("#pill-all").classed("active", true);
    updateDashboard();
}

function exportToCSV() {
    const data = getFilteredData();
    if (data.length === 0) {
        showToast("No student records available to export.", "warning");
        return;
    }

    const headers = ["ID", "Name", "Department", "Gender", "Maths", "Science", "English", "Programming", "Total_400", "Percentage", "Attendance_Pct", "Status", "Grade", "Division"];
    const rows = data.map(s => [
        s.id,
        `"${s.name}"`,
        s.department,
        s.gender,
        s.maths,
        s.science,
        s.english,
        s.programming,
        s.total,
        s.average.toFixed(2),
        s.attendance,
        s.status,
        s.grade,
        `"${s.division}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    if (window.URL && typeof window.URL.createObjectURL === 'function') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Academic_Students_Evaluation_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(url);
        }
        showToast(`Exported ${data.length} student records to CSV!`, "success");
    } else {
        showToast(`Exported ${data.length} student records.`, "success");
    }
}

// ----------------------------------------------------
// 7. CHART CARDS & MARKSHEET TOUCH INSPECTION INITIALIZER
// ----------------------------------------------------

function initChartTouchInspectors() {
    const chartCards = [
        { id: "#cardSubjectChart", title: "📚 Cohort Subject Average Marks", desc: "Compares mean performance across Mathematics, Applied Science, English Communication, and Programming Fundamentals.", color: "#6366f1" },
        { id: "#cardGradeChart", title: "🍩 UGC Grade Distribution", desc: "Visualizes student cohort breakdown into UGC letter grade tiers from Grade O (Outstanding) to Grade F (Arrear).", color: "#10b981" },
        { id: "#cardAttendanceChart", title: "📈 Attendance vs Performance Scatter", desc: "Analyzes statistical correlation between classroom lecture attendance percentage and final semester marks.", color: "#f59e0b" },
        { id: "#cardGenderChart", title: "⚖️ Gender-wise Academic Performance", desc: "Compares academic achievement metrics between Male and Female students in the cohort.", color: "#a855f7" }
    ];

    chartCards.forEach(c => {
        const card = d3.select(c.id);
        if (!card.empty()) {
            const header = card.select(".chart-header");
            (header.empty() ? card : header)
                .on("pointerenter touchstart", function (event) {
                    showTooltip(event, formatColorTooltip({
                        color: c.color,
                        colorName: "Chart Telemetry",
                        title: c.title,
                        category: "D3.JS VISUALIZER",
                        reason: c.desc,
                        stats: [
                            `Active Engine: <b>Interactive D3.js v7 SVG</b>`,
                            `Interactivity: <b>Touch bars/slices for student drawers</b>`
                        ],
                        rule: "Click any bar or slice to open student roster drawer.",
                        actionHint: "Touch individual bars or slices for student drilldown"
                    }));
                })
                .on("pointerleave touchend", function () {
                    hideTooltip();
                });
        }
    });
}

// Initialize on script load
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initChartTouchInspectors);
} else {
    initChartTouchInspectors();
}

// ----------------------------------------------------
// 8. EXECUTIVE DOSSIER & SVG CHART VECTOR EXPORT
// ----------------------------------------------------

function exportChartSvg(svgId, filename = "Academic_D3_Chart") {
    const svgEl = document.getElementById(svgId);
    if (!svgEl) {
        showToast("Chart SVG element not found.", "warning");
        return;
    }

    try {
        const clonedSvg = svgEl.cloneNode(true);
        clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

        const bbox = svgEl.getBoundingClientRect();
        const width = svgEl.getAttribute("width") || bbox.width || 600;
        const height = svgEl.getAttribute("height") || bbox.height || 350;
        clonedSvg.setAttribute("width", width);
        clonedSvg.setAttribute("height", height);

        // Inject high-contrast dark background for standalone vector viewing
        const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bgRect.setAttribute("width", "100%");
        bgRect.setAttribute("height", "100%");
        bgRect.setAttribute("fill", "#0f172a");
        clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(clonedSvg);

        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        if (window.URL && typeof window.URL.createObjectURL === 'function') {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (typeof URL.revokeObjectURL === 'function') {
                URL.revokeObjectURL(url);
            }
            showToast(`Exported ${filename}.svg vector graphic!`, "success");
        }
    } catch (e) {
        console.error("SVG export error:", e);
        showToast("SVG export failed: " + e.message, "danger");
    }
}

function openExecutiveReportModal() {
    populateExecutiveDossier();
    d3.select("#executiveReportModal").classed("active", true);
}

function closeExecutiveReportModal() {
    d3.select("#executiveReportModal").classed("active", false);
}

function populateExecutiveDossier() {
    const container = d3.select("#execDossierBody");
    if (container.empty()) return;

    const data = students || [];
    const total = data.length;
    const passedList = data.filter(s => s.status === 'Pass');
    const arrearsList = data.filter(s => s.status === 'Fail');
    const passRate = total ? ((passedList.length / total) * 100).toFixed(1) : "0.0";
    const averages = data.map(s => s.average);
    const classAvg = total ? (averages.reduce((a, b) => a + b, 0) / total).toFixed(2) : "0.00";
    const attAvg = total ? (data.map(s => s.attendance).reduce((a, b) => a + b, 0) / total).toFixed(1) : "0.0";

    let topper = data[0];
    data.forEach(s => { if (s.average > (topper ? topper.average : 0)) topper = s; });

    // Dept stats
    const deptStats = {};
    data.forEach(s => {
        if (!deptStats[s.department]) deptStats[s.department] = { count: 0, totalAvg: 0, passed: 0, max: 0 };
        deptStats[s.department].count++;
        deptStats[s.department].totalAvg += s.average;
        if (s.status === 'Pass') deptStats[s.department].passed++;
        if (s.average > deptStats[s.department].max) deptStats[s.department].max = s.average;
    });

    const deptRows = Object.keys(deptStats).map(dept => {
        const d = deptStats[dept];
        const avg = (d.totalAvg / d.count).toFixed(2);
        const passPct = ((d.passed / d.count) * 100).toFixed(1);
        return `
            <tr>
                <td style="font-weight: 700; color: #818cf8;">${dept}</td>
                <td>${d.count} Students</td>
                <td><span class="badge ${passPct >= 90 ? 'status-pass' : 'status-fail'}">${passPct}%</span></td>
                <td style="font-weight: 700; font-family: 'Space Grotesk', monospace;">${avg}%</td>
                <td style="color: #34d399; font-weight: 700;">${d.max.toFixed(1)}%</td>
            </tr>
        `;
    }).join('');

    // Subject stats
    const subjects = [
        { name: "Mathematics-I (Calculus & Linear Algebra)", key: "maths", code: "MA101BS" },
        { name: "Applied Engineering Physics", key: "science", code: "AP102BS" },
        { name: "Professional English Communication", key: "english", code: "EN103HS" },
        { name: "Python & Data Structures Fundamentals", key: "programming", code: "CS104ES" }
    ];

    const subRows = subjects.map(sub => {
        const scores = data.map(s => s[sub.key]);
        const mean = total ? (scores.reduce((a, b) => a + b, 0) / total).toFixed(1) : 0;
        const min = total ? Math.min(...scores) : 0;
        const max = total ? Math.max(...scores) : 0;
        const passed = scores.filter(v => v >= 35).length;
        const pct = total ? ((passed / total) * 100).toFixed(1) : 0;
        return `
            <tr>
                <td style="font-weight: 600; color: #f1f5f9;">${sub.name}</td>
                <td style="font-family: 'Space Grotesk', monospace; color: #a5b4fc;">${sub.code}</td>
                <td style="font-weight: 800; color: #38bdf8;">${mean}%</td>
                <td>${min}</td>
                <td style="color: #34d399; font-weight: 700;">${max}</td>
                <td><span class="badge ${pct >= 90 ? 'status-pass' : 'status-fail'}">${pct}%</span></td>
            </tr>
        `;
    }).join('');

    // Arrears row
    let arrearsHtml = '';
    if (arrearsList.length > 0) {
        arrearsHtml = `
            <div class="dossier-card" style="border-color: rgba(244, 63, 94, 0.4); background: rgba(136, 19, 55, 0.15);">
                <div class="dossier-card-title" style="color: #fb7185;">
                    <span>⚠️ Remedial Coaching & At-Risk Intervention Schedule</span>
                </div>
                <p style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 10px;">
                    Pursuant to Academic Regulation Section 7.2, mandatory remedial laboratory & tutorial interventions have been logged for the following candidate(s):
                </p>
                <table class="dossier-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Dept</th>
                            <th>Attendance</th>
                            <th>Deficit Course(s)</th>
                            <th>Intervention Protocol</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${arrearsList.map(s => {
                            const defs = [];
                            if (s.maths < 35) defs.push(`Maths (${s.maths})`);
                            if (s.science < 35) defs.push(`Science (${s.science})`);
                            if (s.english < 35) defs.push(`English (${s.english})`);
                            if (s.programming < 35) defs.push(`Programming (${s.programming})`);
                            return `
                                <tr>
                                    <td style="font-weight: 700;">#${s.id} ${s.name}</td>
                                    <td>${s.department}</td>
                                    <td style="color: ${s.attendance < 75 ? '#fb7185' : '#fbbf24'}; font-weight: 700;">${s.attendance}%</td>
                                    <td style="color: #fb7185; font-weight: 700;">${defs.join(', ')}</td>
                                    <td><span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">Remedial Module B</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    container.html(`
        <div class="dossier-stats-grid">
            <div class="dossier-stat-box">
                <div class="val">${total}</div>
                <div class="lbl">Total Enrolled</div>
            </div>
            <div class="dossier-stat-box">
                <div class="val" style="color: ${passRate >= 80 ? '#34d399' : '#fbbf24'}">${passRate}%</div>
                <div class="lbl">Clearance Rate</div>
            </div>
            <div class="dossier-stat-box">
                <div class="val" style="color: #38bdf8">${classAvg}%</div>
                <div class="lbl">Class Mean Average</div>
            </div>
            <div class="dossier-stat-box">
                <div class="val" style="color: #a855f7">${attAvg}%</div>
                <div class="lbl">Attendance Mean</div>
            </div>
            <div class="dossier-stat-box">
                <div class="val" style="color: #fbbf24">${topper ? topper.name.split(' ')[0] : 'N/A'}</div>
                <div class="lbl">Gold Medalist (${topper ? topper.average.toFixed(1) : 0}%)</div>
            </div>
        </div>

        <div class="dossier-card">
            <div class="dossier-card-title">
                <span>🏢 Department-Wise Clearance Benchmarking</span>
            </div>
            <table class="dossier-table">
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Cohort Strength</th>
                        <th>Pass Rate</th>
                        <th>Mean Aggregate</th>
                        <th>Peak Performer</th>
                    </tr>
                </thead>
                <tbody>
                    ${deptRows}
                </tbody>
            </table>
        </div>

        <div class="dossier-card">
            <div class="dossier-card-title">
                <span>📚 Autonomous CBCS Course Paper Attenuation Matrix</span>
            </div>
            <table class="dossier-table">
                <thead>
                    <tr>
                        <th>Course Module</th>
                        <th>Course Code</th>
                        <th>Cohort Mean</th>
                        <th>Lowest Mark</th>
                        <th>Highest Mark</th>
                        <th>Paper Clearance</th>
                    </tr>
                </thead>
                <tbody>
                    ${subRows}
                </tbody>
            </table>
        </div>

        ${arrearsHtml}
    `);
}

