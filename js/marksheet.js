/* ====================================================
   UGC ACADEMIC MARKSHEET & INTERACTIVE GRADE ENGINE
   Standard 10-Point CBCS (Choice Based Credit System)
==================================================== */

// Standard 4-Subject Curriculum Matrix with Proper Academic Course Names
const COURSE_CURRICULUM = [
    { code: "CS501", name: "Engineering Mathematics - III", credits: 4, maxMarks: 100, passMarks: 35 },
    { code: "CS502", name: "Database Management Systems", credits: 4, maxMarks: 100, passMarks: 35 },
    { code: "CS503", name: "Design & Analysis of Algorithms", credits: 4, maxMarks: 100, passMarks: 35 },
    { code: "CS504", name: "Web Technologies & Programming", credits: 4, maxMarks: 100, passMarks: 35 }
];

let currentSelectedStudentId = 4; // Default to Sneha Devi
let isSimulatorActive = false;

/**
 * UGC 10-Point Scale Evaluator
 * Maps individual raw subject mark to Grade Point, Letter Grade, and Qualitative Description
 */
function getSubjectGradeInfo(rawMark) {
    const mark = Number(rawMark) || 0;
    if (mark >= 90) {
        return { grade: "O", gradePoint: 10, description: "Outstanding", isPass: true, badgeClass: "grade-O" };
    } else if (mark >= 80) {
        return { grade: "A", gradePoint: 9, description: "Excellent", isPass: true, badgeClass: "grade-A" };
    } else if (mark >= 70) {
        return { grade: "B", gradePoint: 8, description: "Very Good", isPass: true, badgeClass: "grade-B" };
    } else if (mark >= 60) {
        return { grade: "C", gradePoint: 7, description: "Good", isPass: true, badgeClass: "grade-C" };
    } else if (mark >= 35) {
        return { grade: "D", gradePoint: 6, description: "Pass", isPass: true, badgeClass: "grade-D" };
    } else {
        return { grade: "F", gradePoint: 0, description: "Fail / Arrear", isPass: false, badgeClass: "grade-F" };
    }
}

/**
 * Compatibility helper for single grade string
 */
function getSubjectGrade(mark) {
    return getSubjectGradeInfo(mark).grade;
}

/**
 * Compatibility helper for pass/fail determination
 */
function computeStatus(maths, science, english, programming) {
    const m = Number(maths) || 0;
    const s = Number(science) || 0;
    const e = Number(english) || 0;
    const p = Number(programming) || 0;
    if (m >= PASS_MARK_THRESHOLD && s >= PASS_MARK_THRESHOLD && e >= PASS_MARK_THRESHOLD && p >= PASS_MARK_THRESHOLD) {
        return "Pass";
    }
    return "Fail";
}

/**
 * Compute Overall Grade from SGPA / Average and Status
 */
function computeGrade(avg, status) {
    if (status === "Fail") return "F";
    if (avg >= 90) return "O";
    if (avg >= 80) return "A";
    if (avg >= 70) return "B";
    if (avg >= 60) return "C";
    if (avg >= 35) return "D";
    return "F";
}

/**
 * Compute UGC Academic Division / Classification
 */
function computeDivision(avg, status) {
    if (status === "Fail") return "Failed (Arrears in 1+ subjects)";
    if (avg >= 80) return "First Class with Distinction";
    if (avg >= 60) return "First Class";
    if (avg >= 50) return "Second Class";
    return "Pass Division";
}

/**
 * Comprehensive Semester Evaluation
 * Calculates Credits, Grade Points, Credit Points (Ci * GPi), SGPA, and Result Status
 */
function calculateSemesterEvaluation(student) {
    const m = Number(student.maths) || 0;
    const s = Number(student.science) || 0;
    const e = Number(student.english) || 0;
    const p = Number(student.programming) || 0;

    const mInfo = getSubjectGradeInfo(m);
    const sInfo = getSubjectGradeInfo(s);
    const eInfo = getSubjectGradeInfo(e);
    const pInfo = getSubjectGradeInfo(p);

    const subjects = [
        { code: "CS501", name: "Engineering Mathematics - III", credits: 4, maxMarks: 100, passMarks: 35, score: m, ...mInfo, creditPoints: 4 * mInfo.gradePoint },
        { code: "CS502", name: "Database Management Systems", credits: 4, maxMarks: 100, passMarks: 35, score: s, ...sInfo, creditPoints: 4 * sInfo.gradePoint },
        { code: "CS503", name: "Design & Analysis of Algorithms", credits: 4, maxMarks: 100, passMarks: 35, score: e, ...eInfo, creditPoints: 4 * eInfo.gradePoint },
        { code: "CS504", name: "Web Technologies & Programming", credits: 4, maxMarks: 100, passMarks: 35, score: p, ...pInfo, creditPoints: 4 * pInfo.gradePoint }
    ];

    const totalCredits = subjects.reduce((acc, sub) => acc + sub.credits, 0); // 16.0
    const totalCreditPoints = subjects.reduce((acc, sub) => acc + sub.creditPoints, 0);
    const creditsEarned = subjects.filter(sub => sub.isPass).reduce((acc, sub) => acc + sub.credits, 0);

    const isPass = subjects.every(sub => sub.isPass);
    const status = isPass ? "Pass" : "Fail";

    const totalMarks = m + s + e + p;
    const percentage = Number((totalMarks / 4).toFixed(2));
    
    // SGPA Formula: sum(Credit * GradePoint) / sum(Credits)
    const sgpa = Number((totalCreditPoints / totalCredits).toFixed(2));
    const overallGrade = computeGrade(percentage, status);
    const division = computeDivision(percentage, status);

    return {
        subjects,
        totalCredits,
        creditsEarned,
        totalCreditPoints,
        totalMarks,
        average: percentage,
        percentage,
        sgpa,
        overallGrade,
        status,
        isPass,
        division
    };
}

/**
 * Recalculate metrics on a student record
 */
function recalculateStudent(student) {
    student.maths = Number(student.maths) || 0;
    student.science = Number(student.science) || 0;
    student.english = Number(student.english) || 0;
    student.programming = Number(student.programming) || 0;
    student.attendance = Number(student.attendance) || 0;

    const evalRes = calculateSemesterEvaluation(student);
    student.total = evalRes.totalMarks;
    student.average = evalRes.percentage;
    student.gpa = evalRes.sgpa.toFixed(2);
    student.status = evalRes.status;
    student.grade = evalRes.overallGrade;
    student.division = evalRes.division;
    student.totalCreditPoints = evalRes.totalCreditPoints;
    student.creditsEarned = evalRes.creditsEarned;
}

/**
 * Recalculate metrics across all cohort students
 */
function recalculateAllMetrics() {
    students.forEach(recalculateStudent);
}

/**
 * Populate the student selector dropdown in Marksheet Hub
 */
function initStudentSelector() {
    const select = d3.select("#hubStudentSelect");
    if (select.empty()) return;

    select.selectAll("option").remove();
    students.forEach(s => {
        select.append("option")
            .attr("value", s.id)
            .text(`#${String(s.id).padStart(2, '0')} - ${s.name} (${s.department}) • ${d3.format(".1f")(s.average)}% [SGPA: ${s.gpa} | Gr. ${s.grade}]`);
    });

    select.property("value", currentSelectedStudentId);
}

/**
 * Switch student displayed in the Marksheet Hub
 */
function onHubStudentChange(studentId) {
    currentSelectedStudentId = parseInt(studentId);
    const student = students.find(s => s.id === currentSelectedStudentId);
    if (student) {
        populateMarksheet(student);
        syncSimulatorInputs(student);
    }
}

/**
 * Navigate to Previous or Next student in cohort
 */
function navigateHubStudent(direction) {
    const currentIndex = students.findIndex(s => s.id === currentSelectedStudentId);
    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = students.length - 1;
    if (newIndex >= students.length) newIndex = 0;

    const targetStudent = students[newIndex];
    if (targetStudent) {
        currentSelectedStudentId = targetStudent.id;
        const select = d3.select("#hubStudentSelect");
        if (!select.empty()) select.property("value", targetStudent.id);
        populateMarksheet(targetStudent);
        syncSimulatorInputs(targetStudent);
    }
}

/**
 * Random Student Selector
 */
function pickRandomStudent() {
    if (students.length === 0) return;
    const randIdx = Math.floor(Math.random() * students.length);
    const student = students[randIdx];
    currentSelectedStudentId = student.id;
    const select = d3.select("#hubStudentSelect");
    if (!select.empty()) select.property("value", student.id);
    populateMarksheet(student);
    syncSimulatorInputs(student);
    showToast(`Loaded marksheet for #${student.id} (${student.name})`, "info");
}

/**
 * Populate all marksheet DOM elements (both on-page & modal)
 */
function populateMarksheet(student) {
    if (!student) return;

    const deptFullName = DEPT_NAMES[student.department] || `${student.department} Engineering`;
    const regNo = student.rollNo || `22A91A05${String(student.id).padStart(2, '0')}`;
    const serial = `BIET/2026/UG/${String(student.id).padStart(4, '0')}`;
    const certHash = `BIET-DIGI-CERT-2026-${String(student.id).padStart(4, '0')}-${(student.id * 739 + 1042).toString(16).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    const evalRes = calculateSemesterEvaluation(student);

    // Update Text Elements across both on-page and modal progress cards
    d3.selectAll(".val-cardSerialNo").text(serial);
    d3.selectAll(".val-cardCertHash").text(certHash);
    d3.selectAll(".val-cardStudentName").text(student.name);
    d3.selectAll(".val-cardStudentID").text(regNo);
    d3.selectAll(".val-cardStudentDept").text(`${student.department} - ${deptFullName}`);
    d3.selectAll(".val-cardStudentGender").text(student.gender);
    d3.selectAll(".val-cardIssueDate").text(dateStr);

    // Render Table Rows with clean subject title, NO bottom progress line, NO max/min columns
    const tableBodies = [d3.select("#cardMarksTableBody"), d3.select("#hubMarksTableBody"), d3.select("#studMarksTableBody")];
    tableBodies.forEach(tbody => {
        if (tbody.empty()) return;
        const rows = tbody.selectAll("tr").data(evalRes.subjects, d => d.code).join("tr");
        rows.html(sub => {
            const isPass = sub.isPass;
            return `
                <td style="font-weight: 700; color: #475569; font-family: 'Space Grotesk', monospace; text-align: center;">${sub.code}</td>
                <td>
                    <div style="font-weight: 700; color: #0f172a; font-size: 13px; line-height: 1.3;">${sub.name}</div>
                </td>
                <td style="text-align: center; font-weight: 700; color: #334155;">${sub.credits}.0</td>
                <td style="text-align: center; font-weight: 800; color: ${isPass ? '#0f172a' : '#b91c1c'}; font-size: 13.5px;">${sub.score}</td>
                <td style="text-align: center;"><span class="badge ${sub.badgeClass}">${sub.grade}</span></td>
                <td style="text-align: center; font-weight: 800; color: #4f46e5; font-family: 'Space Grotesk', monospace;">${sub.gradePoint}</td>
                <td style="text-align: center; font-weight: 800; color: #0f172a; font-family: 'Space Grotesk', monospace;">${sub.creditPoints}.0</td>
                <td style="text-align: center;">
                    <span class="badge ${isPass ? 'status-pass' : 'status-fail'}">
                        ${isPass ? 'PASS' : 'FAIL'}
                    </span>
                </td>
            `;
        });
    });

    // Grand Totals and Footers
    d3.selectAll(".val-cardGrandTotal").text(`${evalRes.totalMarks} / ${TOTAL_MARKS_MAX}`);
    d3.selectAll(".val-cardTotalCreditPoints").text(`${evalRes.totalCreditPoints}.0`);
    d3.selectAll(".val-cardOverallGradeCell").html(`<span class="badge ${evalRes.status === 'Pass' ? 'grade-' + evalRes.overallGrade.replace('+', 'plus') : 'grade-F'}">Grade ${evalRes.overallGrade}</span>`);
    d3.selectAll(".val-cardOverallStatusCell").html(`<span class="badge ${evalRes.status === 'Pass' ? 'status-pass' : 'status-fail'}">${evalRes.status.toUpperCase()}</span>`);

    // Summary Blocks
    d3.selectAll(".val-cardAverage").text(`${d3.format(".2f")(evalRes.percentage)}%`);
    d3.selectAll(".val-cardGPA").text(`${evalRes.sgpa.toFixed(2)} / 10.0`);
    d3.selectAll(".val-cardGrade").text(`Grade ${evalRes.overallGrade}`);
    d3.selectAll(".val-cardDivision").text(evalRes.division);

    // Official Stamp and Status Seal (Clean & Compact)
    const stampHtml = evalRes.status === "Pass" ? `
        <div class="stamp-status-badge stamp-pass">
            <span>🎓</span> RESULT: PASSED &bull; CREDITS: ${evalRes.creditsEarned}.0 / 16.0
        </div>
    ` : `
        <div class="stamp-status-badge stamp-fail">
            <span>⚠️</span> RESULT: RE-APPEAR / ARREARS &bull; CREDITS: ${evalRes.creditsEarned}.0 / 16.0
        </div>
    `;
    d3.selectAll(".val-cardStampContainer").html(stampHtml);

    // Draw Radar Comparison Chart in Hub
    renderHubRadar(student);

    // Render Dynamic Unique Department & Officer Signatures
    renderMarksheetSignatures(student);
}

/**
 * Open Progress Card Modal (for single student click)
 */
function openProgressCard(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    currentSelectedStudentId = student.id;
    const select = d3.select("#hubStudentSelect");
    if (!select.empty()) select.property("value", student.id);

    populateMarksheet(student);
    syncSimulatorInputs(student);

    d3.select("#progressCardModal").classed("active", true);
}

/**
 * Close Progress Card Modal
 */
function closeProgressCardModal() {
    d3.select("#progressCardModal").classed("active", false);
}

/**
 * View First Passing Student Card
 */
function viewFirstPassedCard() {
    const passedStudent = students.find(s => s.status === "Pass");
    if (passedStudent) {
        openProgressCard(passedStudent.id);
    } else {
        showToast("No passing students found in cohort.", "info");
    }
}

/**
 * Synchronize What-If Simulator sliders with current student
 */
function syncSimulatorInputs(student) {
    if (!student || d3.select("#simMaths").empty()) return;
    d3.select("#simMaths").property("value", student.maths);
    d3.select("#simMathsVal").text(student.maths);

    d3.select("#simScience").property("value", student.science);
    d3.select("#simScienceVal").text(student.science);

    d3.select("#simEnglish").property("value", student.english);
    d3.select("#simEnglishVal").text(student.english);

    d3.select("#simProg").property("value", student.programming);
    d3.select("#simProgVal").text(student.programming);

    updateSimulatorPreview();
}

/**
 * Live recalculation when sliders move
 */
function updateSimulatorPreview() {
    if (d3.select("#simMaths").empty()) return;
    const m = Number(d3.select("#simMaths").property("value")) || 0;
    const s = Number(d3.select("#simScience").property("value")) || 0;
    const e = Number(d3.select("#simEnglish").property("value")) || 0;
    const p = Number(d3.select("#simProg").property("value")) || 0;

    d3.select("#simMathsVal").text(m);
    d3.select("#simScienceVal").text(s);
    d3.select("#simEnglishVal").text(e);
    d3.select("#simProgVal").text(p);

    const originalStudent = students.find(st => st.id === currentSelectedStudentId) || students[0];
    const simulatedStudent = {
        ...originalStudent,
        maths: m,
        science: s,
        english: e,
        programming: p
    };

    const evalRes = calculateSemesterEvaluation(simulatedStudent);

    d3.select("#simTotalDisplay").text(`${evalRes.totalMarks} / ${TOTAL_MARKS_MAX}`);
    d3.select("#simPctDisplay").text(`${d3.format(".2f")(evalRes.percentage)}%`);
    d3.select("#simSgpaDisplay").text(`${evalRes.sgpa.toFixed(2)} / 10.0`);
    d3.select("#simGradeDisplay").html(`<span class="badge ${evalRes.status === 'Pass' ? 'grade-' + evalRes.overallGrade.replace('+', 'plus') : 'grade-F'}">Grade ${evalRes.overallGrade}</span>`);
    d3.select("#simStatusDisplay").html(`<span class="badge ${evalRes.status === 'Pass' ? 'status-pass' : 'status-fail'}">${evalRes.status.toUpperCase()}</span>`);

    simulatedStudent.total = evalRes.totalMarks;
    simulatedStudent.average = evalRes.percentage;
    simulatedStudent.gpa = evalRes.sgpa.toFixed(2);
    simulatedStudent.status = evalRes.status;
    simulatedStudent.grade = evalRes.overallGrade;
    simulatedStudent.division = evalRes.division;
    simulatedStudent.totalCreditPoints = evalRes.totalCreditPoints;
    simulatedStudent.creditsEarned = evalRes.creditsEarned;

    populateMarksheet(simulatedStudent);
}

/**
 * Reset Simulator to Original Database Marks
 */
function resetSimulator() {
    const student = students.find(s => s.id === currentSelectedStudentId);
    if (student) {
        if (!d3.select("#simMaths").empty()) syncSimulatorInputs(student);
        populateMarksheet(student);
        showToast("Simulator reset to student's verified academic marks.", "info");
    }
}

/**
 * Trigger Official Print Dialog
 */
function printProgressCard() {
    window.print();
}

/**
 * Copy Academic Summary / Transcript to Clipboard
 */
function copyTranscriptSummary() {
    const student = students.find(s => s.id === currentSelectedStudentId);
    if (!student) return;

    const evalRes = calculateSemesterEvaluation(student);
    const summaryText = `
🏛️ BHARATH INSTITUTE OF ENGINEERING & TECHNOLOGY (AUTONOMOUS)
OFFICIAL ACADEMIC TRANSCRIPT & SEMESTER PROGRESS REPORT
------------------------------------------------------------
Student Name: ${student.name}
Roll Number: ${student.rollNo || (`22A91A05${String(student.id).padStart(2, '0')}`)}
Department: ${student.department} (${DEPT_NAMES[student.department] || ''})
Date of Issue: ${new Date().toLocaleDateString()}
------------------------------------------------------------
COURSES & MARKS SECURED:
1. CS501 Engineering Mathematics - III: ${student.maths} / 100 (Gr. ${getSubjectGrade(student.maths)})
2. CS502 Database Management Systems: ${student.science} / 100 (Gr. ${getSubjectGrade(student.science)})
3. CS503 Design & Analysis of Algorithms: ${student.english} / 100 (Gr. ${getSubjectGrade(student.english)})
4. CS504 Web Technologies & Programming: ${student.programming} / 100 (Gr. ${getSubjectGrade(student.programming)})
------------------------------------------------------------
Grand Total: ${evalRes.totalMarks} / 400 (${evalRes.percentage}%)
Total Credits: ${evalRes.totalCredits}.0 | Earned: ${evalRes.creditsEarned}.0
Total Credit Points: ${evalRes.totalCreditPoints}.0
Semester SGPA: ${evalRes.sgpa.toFixed(2)} / 10.00
Final Grade: Grade ${evalRes.overallGrade}
Academic Result: ${evalRes.status.toUpperCase()} (${evalRes.division})
------------------------------------------------------------
Verified & Approved by Controller of Examinations.
    `.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryText)
            .then(() => showToast("Academic transcript copied to clipboard!", "success"))
            .catch(() => showToast("Failed to copy to clipboard.", "warning"));
    } else {
        showToast("Clipboard access not supported in this browser.", "info");
    }
}

/**
 * Render SVG Competency Radar in Marksheet Hub
 */
function renderHubRadar(student) {
    const svg = d3.select("#hubRadarSvg");
    if (svg.empty()) return;
    svg.selectAll("*").remove();

    const width = 260;
    const height = 220;
    const radius = 75;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    // Web Levels (25%, 50%, 75%, 100%)
    [25, 50, 75, 100].forEach(lvl => {
        const r = (lvl / 100) * radius;
        g.append("circle")
            .attr("r", r)
            .attr("fill", lvl % 50 === 0 ? "rgba(241, 245, 249, 0.6)" : "none")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-dasharray", lvl === 100 ? "none" : "2,2");
    });

    const avgMaths = d3.mean(students, s => s.maths) || 75;
    const avgSci = d3.mean(students, s => s.science) || 75;
    const avgEng = d3.mean(students, s => s.english) || 75;
    const avgProg = d3.mean(students, s => s.programming) || 75;

    const axes = [
        { name: "Maths", score: student.maths, avg: avgMaths, angle: 0 },
        { name: "Science", score: student.science, avg: avgSci, angle: Math.PI / 2 },
        { name: "English", score: student.english, avg: avgEng, angle: Math.PI },
        { name: "Prog", score: student.programming, avg: avgProg, angle: (3 * Math.PI) / 2 }
    ];

    // Axis Lines & Labels
    axes.forEach(axis => {
        const x = Math.cos(axis.angle - Math.PI / 2) * radius;
        const y = Math.sin(axis.angle - Math.PI / 2) * radius;

        g.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", x).attr("y2", y)
            .attr("stroke", "#cbd5e1");

        const lx = Math.cos(axis.angle - Math.PI / 2) * (radius + 20);
        const ly = Math.sin(axis.angle - Math.PI / 2) * (radius + 16);

        g.append("text")
            .attr("x", lx)
            .attr("y", ly)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "#475569")
            .attr("font-size", "11px")
            .attr("font-weight", "700")
            .text(`${axis.name} (${axis.score})`);
    });

    // Student Score Polygon
    const studentPts = axes.map(a => {
        const r = (a.score / 100) * radius;
        return [Math.cos(a.angle - Math.PI / 2) * r, Math.sin(a.angle - Math.PI / 2) * r];
    });
    const sPath = studentPts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ") + " Z";

    g.append("path")
        .attr("d", sPath)
        .attr("fill", "rgba(79, 70, 229, 0.25)")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 2.5);

    studentPts.forEach(p => {
        g.append("circle")
            .attr("cx", p[0])
            .attr("cy", p[1])
            .attr("r", 4.5)
            .attr("fill", "#4f46e5")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.5);
    });
}

/**
 * Format score display with fail warning badge if below 35
 */
function formatSubjectScore(score) {
    if (score < PASS_MARK_THRESHOLD) {
        return `<span class="mark-failed" title="Failed: score < 35">${score} ⚠️</span>`;
    }
    return `<span>${score}</span>`;
}

/* ----------------------------------------------------
   ACADEMIC SIGNATORY PROFILES & DIGITAL VERIFICATION
---------------------------------------------------- */
const DEPARTMENT_SIGNATORIES = {
    CSE: {
        name: "Prof. R. K. Sharma",
        title: "M.Tech, (Ph.D.)",
        role: "HOD & Professor, CSE",
        department: "Computer Science & Engineering",
        color: "#1d4ed8",
        keyId: "BIET-FAC-CSE-0194",
        path: "M10 30 C18 20, 24 8, 30 14 C36 18, 30 38, 38 28 C45 18, 52 14, 60 22 C68 26, 72 34, 80 24 C88 16, 96 14, 108 22 C116 26, 124 18, 134 14 M16 28 C38 26, 68 28, 122 24 M28 34 C44 32, 70 34, 100 32"
    },
    ECE: {
        name: "Dr. Ananya Varma",
        title: "M.Tech, Ph.D. (IIT-M)",
        role: "HOD & Professor, ECE",
        department: "Electronics & Communication Engg",
        color: "#0284c7",
        keyId: "BIET-FAC-ECE-0211",
        path: "M12 28 C20 12, 28 6, 36 12 C44 18, 38 34, 46 26 C52 18, 58 12, 68 18 C76 22, 82 32, 90 20 C98 12, 108 24, 118 16 C124 12, 130 18, 136 14 M14 34 C36 30, 68 32, 126 28"
    },
    EEE: {
        name: "Prof. M. S. Reddy",
        title: "M.E., FIE",
        role: "HOD & Professor, EEE",
        department: "Electrical & Electronics Engg",
        color: "#0f766e",
        keyId: "BIET-FAC-EEE-0188",
        path: "M8 32 C14 16, 20 8, 26 18 C32 28, 38 12, 44 22 C50 32, 58 18, 66 26 C74 14, 82 28, 92 18 C102 26, 112 16, 122 22 C128 26, 132 20, 136 16 M12 36 C40 32, 75 34, 130 30"
    },
    MECH: {
        name: "Dr. Vikram Patel",
        title: "Ph.D. (IISc), FIE",
        role: "HOD & Professor, MECH",
        department: "Mechanical Engineering",
        color: "#4338ca",
        keyId: "BIET-FAC-MECH-0245",
        path: "M10 26 C18 12, 26 6, 32 16 C38 26, 42 36, 50 24 C58 14, 66 28, 76 18 C84 10, 94 22, 104 14 C114 26, 122 18, 132 12 M8 32 C35 30, 75 32, 128 28 M115 22 C122 28, 128 32, 134 30"
    },
    CIVIL: {
        name: "Prof. K. Venkatesh",
        title: "M.Tech, MISTE",
        role: "HOD & Professor, CIVIL",
        department: "Civil Engineering",
        color: "#0369a1",
        keyId: "BIET-FAC-CIV-0167",
        path: "M14 30 C22 18, 28 8, 34 16 C40 24, 34 36, 44 26 C52 16, 62 20, 72 24 C82 28, 88 16, 98 22 C108 28, 116 18, 126 14 C132 12, 136 18, 138 20 M18 36 C42 34, 78 36, 132 30"
    }
};

const CONTROLLER_SIGNATORY = {
    name: "Dr. K. Ramanathan",
    title: "Ph.D., FIE",
    role: "Controller of Examinations",
    department: "Office of the Controller of Examinations (Autonomous)",
    color: "#1e3a8a",
    keyId: "BIET-COE-OFFICIAL-8890",
    path: "M12 34 C16 18, 22 6, 28 12 C34 18, 26 38, 38 24 C46 14, 54 32, 65 18 C74 10, 84 28, 95 16 C104 8, 114 24, 126 14 M8 38 C30 34, 60 36, 128 30 M110 18 C118 12, 125 10, 132 14"
};

const PRINCIPAL_SIGNATORY = {
    name: "Dr. S. N. V. Prasad",
    title: "M.Tech, Ph.D., FIE",
    role: "Principal & Chairman, Academic Council",
    department: "Principal's Office & Academic Directorate",
    color: "#0f172a",
    keyId: "BIET-PRIN-OFFICIAL-0012",
    path: "M8 26 C16 10, 24 6, 30 12 C36 18, 32 36, 42 26 C50 16, 56 12, 66 18 C75 24, 80 12, 92 16 C102 20, 110 10, 124 14 C128 16, 132 20, 135 18 M14 32 C38 30, 72 32, 128 26 M122 30 C125 30, 128 30, 130 30 M134 30 C136 30, 138 30, 140 30"
};

let lastActiveSignatoryKey = "BIET-COE-OFFICIAL-8890";

function renderMarksheetSignatures(student) {
    const deptSig = DEPARTMENT_SIGNATORIES[student.department] || DEPARTMENT_SIGNATORIES.CSE;

    // 1. Department Faculty Signature SVG & Text (Unique for each department!)
    const facultySvgHtml = `
        <svg class="sig-svg" viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="${deptSig.path}" stroke="${deptSig.color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    d3.selectAll(".val-cardSigFacultySvg").html(facultySvgHtml);
    d3.selectAll(".val-cardSigFacultyName").text(deptSig.name);
    d3.selectAll(".val-cardSigFacultyRole").text(deptSig.role);

    // 2. Controller of Examinations Signature SVG
    const coeSvgHtml = `
        <svg class="sig-svg" viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="${CONTROLLER_SIGNATORY.path}" stroke="${CONTROLLER_SIGNATORY.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    d3.selectAll(".val-cardSigCoeSvg").html(coeSvgHtml);

    // 3. Principal & Academic Dean Signature SVG
    const principalSvgHtml = `
        <svg class="sig-svg" viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="${PRINCIPAL_SIGNATORY.path}" stroke="${PRINCIPAL_SIGNATORY.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    d3.selectAll(".val-cardSigPrincipalSvg").html(principalSvgHtml);

    // 4. Interactive Tooltip Listeners on Signatures
    d3.selectAll(".val-cardSigFaculty")
        .on("mouseenter pointerdown", function (event) {
            showTooltip(event, `
                <div style="font-weight:800; font-size:13px; color:#ffffff;">✍️ ${deptSig.name}</div>
                <div style="font-size:11px; color:#93c5fd;">${deptSig.title} &bull; ${deptSig.role}</div>
                <div style="font-size:10.5px; color:#cbd5e1; margin-top:4px;">🏛️ ${deptSig.department}</div>
                <div style="font-size:10px; color:#34d399; margin-top:4px;">🔐 Key ID: <b>${deptSig.keyId}</b> (Verified)</div>
                <div style="font-size:10px; color:#38bdf8; margin-top:6px; border-top:1px dashed rgba(255,255,255,0.15); padding-top:4px;">👉 Click to view official digital certificate</div>
            `);
        })
        .on("mouseleave", hideTooltip);

    d3.selectAll(".val-cardSigCoe")
        .on("mouseenter pointerdown", function (event) {
            showTooltip(event, `
                <div style="font-weight:800; font-size:13px; color:#ffffff;">✍️ ${CONTROLLER_SIGNATORY.name}</div>
                <div style="font-size:11px; color:#93c5fd;">${CONTROLLER_SIGNATORY.title} &bull; ${CONTROLLER_SIGNATORY.role}</div>
                <div style="font-size:10.5px; color:#cbd5e1; margin-top:4px;">🏛️ ${CONTROLLER_SIGNATORY.department}</div>
                <div style="font-size:10px; color:#34d399; margin-top:4px;">🔐 Key ID: <b>${CONTROLLER_SIGNATORY.keyId}</b> (Verified)</div>
                <div style="font-size:10px; color:#38bdf8; margin-top:6px; border-top:1px dashed rgba(255,255,255,0.15); padding-top:4px;">👉 Click to view official digital certificate</div>
            `);
        })
        .on("mouseleave", hideTooltip);

    d3.selectAll(".val-cardSigPrincipal")
        .on("mouseenter pointerdown", function (event) {
            showTooltip(event, `
                <div style="font-weight:800; font-size:13px; color:#ffffff;">✍️ ${PRINCIPAL_SIGNATORY.name}</div>
                <div style="font-size:11px; color:#93c5fd;">${PRINCIPAL_SIGNATORY.title} &bull; ${PRINCIPAL_SIGNATORY.role}</div>
                <div style="font-size:10.5px; color:#cbd5e1; margin-top:4px;">🏛️ ${PRINCIPAL_SIGNATORY.department}</div>
                <div style="font-size:10px; color:#34d399; margin-top:4px;">🔐 Key ID: <b>${PRINCIPAL_SIGNATORY.keyId}</b> (Verified)</div>
                <div style="font-size:10px; color:#38bdf8; margin-top:6px; border-top:1px dashed rgba(255,255,255,0.15); padding-top:4px;">👉 Click to view official digital certificate</div>
            `);
        })
        .on("mouseleave", hideTooltip);
}

function showSignatoryVerification(type) {
    const student = students.find(s => s.id === currentSelectedStudentId) || students[0];
    let sig = CONTROLLER_SIGNATORY;
    if (type === 'faculty') {
        sig = DEPARTMENT_SIGNATORIES[student.department] || DEPARTMENT_SIGNATORIES.CSE;
    } else if (type === 'principal') {
        sig = PRINCIPAL_SIGNATORY;
    }

    lastActiveSignatoryKey = sig.keyId;

    const modalBody = d3.select("#sigModalBody");
    if (modalBody.empty()) return;

    modalBody.html(`
        <div style="display:flex; align-items:center; gap:16px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:14px; margin-bottom:14px;">
            <div style="width:130px; height:45px; display:flex; align-items:center; justify-content:center; background:#ffffff; border-radius:6px; border:1px solid #cbd5e1; padding:4px;">
                <svg viewBox="0 0 140 44" fill="none" style="width:100%; height:100%;">
                    <path d="${sig.path}" stroke="${sig.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div>
                <div style="font-weight:900; font-size:16px; color:#0f172a;">${sig.name}</div>
                <div style="font-size:12px; font-weight:700; color:#4f46e5;">${sig.title} &bull; ${sig.role}</div>
                <div style="font-size:11px; color:#64748b;">${sig.department}</div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; font-size:12px;">
            <div style="background:#f1f5f9; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
                <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#64748b;">Signatory Key ID</div>
                <div style="font-family:'Space Grotesk', monospace; font-weight:800; color:#0f172a; margin-top:2px;">${sig.keyId}</div>
            </div>
            <div style="background:#f1f5f9; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
                <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#64748b;">Cryptographic Hash</div>
                <div style="font-family:'Space Grotesk', monospace; font-weight:800; color:#15803d; margin-top:2px;">SHA-256 &bull; VALID</div>
            </div>
            <div style="background:#f1f5f9; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
                <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#64748b;">Student Record Endorsed</div>
                <div style="font-weight:800; color:#0f172a; margin-top:2px;">#${student.id} - ${student.name} (${student.department})</div>
            </div>
            <div style="background:#f1f5f9; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
                <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#64748b;">Endorsement Status</div>
                <div style="font-weight:800; color:#15803d; margin-top:2px;">✅ Officially Certified &amp; Recorded</div>
            </div>
        </div>

        <div style="font-size:11.5px; color:#475569; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px 14px; line-height:1.45;">
            ℹ️ <b>Institutional Verification Note:</b> This digital signature is issued under the authority of BIET Autonomous Academic Regulations and UGC CBCS Guidelines.
        </div>
    `);

    d3.select("#sigModalHeading").html(`<span>🔐</span> ${sig.name} - Digital Signature Certificate`);
    d3.select("#sigVerifyModal").classed("active", true);
}

function showSealVerification() {
    const modalBody = d3.select("#sigModalBody");
    if (modalBody.empty()) return;

    modalBody.html(`
        <div style="text-align:center; padding:10px 0;">
            <div style="width:80px; height:80px; margin:0 auto 10px auto;">
                <svg viewBox="0 0 80 80" fill="none" style="width:100%; height:100%;">
                    <circle cx="40" cy="40" r="38" stroke="#1e3a8a" stroke-width="2" stroke-dasharray="4,2"/>
                    <circle cx="40" cy="40" r="33" stroke="#1e3a8a" stroke-width="1.2"/>
                    <circle cx="40" cy="40" r="14" fill="rgba(30, 58, 138, 0.08)" stroke="#1e3a8a" stroke-width="1"/>
                    <text x="40" y="24" font-size="5.5" font-weight="900" fill="#1e3a8a" text-anchor="middle" letter-spacing="1">BIET AUTONOMOUS</text>
                    <text x="40" y="42.5" font-size="7.5" font-weight="900" fill="#1e3a8a" text-anchor="middle" font-family="'Cinzel', serif">SEAL</text>
                    <text x="40" y="60" font-size="4.5" font-weight="800" fill="#1e3a8a" text-anchor="middle" letter-spacing="0.5">★ EXAM BRANCH ★</text>
                </svg>
            </div>
            <div style="font-weight:900; font-size:16px; color:#0f172a;">BHARATH INSTITUTE OF ENGINEERING & TECHNOLOGY</div>
            <div style="font-size:12px; font-weight:800; color:#4f46e5; margin-top:2px;">UGC AUTONOMOUS INSTITUTION &bull; ESTD. 1998</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; font-size:12px; margin:14px 0;">
            <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; display:flex; justify-content:space-between;">
                <span style="color:#64748b;">Statutory Accreditation:</span>
                <b style="color:#15803d;">NAAC 'A++' Grade (Highest Institutional Rating)</b>
            </div>
            <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; display:flex; justify-content:space-between;">
                <span style="color:#64748b;">Regulatory Approval:</span>
                <b style="color:#0f172a;">AICTE, New Delhi &amp; UGC Autonomous Status</b>
            </div>
            <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; display:flex; justify-content:space-between;">
                <span style="color:#64748b;">University Affiliation:</span>
                <b style="color:#0f172a;">Jawaharlal Nehru Technological University (JNTUH)</b>
            </div>
        </div>
    `);

    d3.select("#sigModalHeading").html(`<span>🏛️</span> Institutional University Seal & Accreditation`);
    d3.select("#sigVerifyModal").classed("active", true);
}

function closeSigVerifyModal() {
    d3.select("#sigVerifyModal").classed("active", false);
}

function copySigCertCode() {
    if (lastActiveSignatoryKey) {
        navigator.clipboard.writeText(lastActiveSignatoryKey).then(() => {
            showToast(`Copied certificate key: ${lastActiveSignatoryKey}`, "success");
        }).catch(() => {
            showToast(`Certificate key: ${lastActiveSignatoryKey}`, "info");
        });
    } else {
        showToast("Certificate Key copied to clipboard", "info");
    }
}

