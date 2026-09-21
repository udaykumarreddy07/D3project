const fs = require('fs');
const path = require('path');

// ----------------------------------------------------
// ANSI TERMINAL COLOR TOKENS
// ----------------------------------------------------
const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    
    // Foreground Colors
    cyan: "\x1b[36m",
    blue: "\x1b[34m",
    indigo: "\x1b[38;2;99;102;241m",
    emerald: "\x1b[38;2;16;185;129m",
    green: "\x1b[32m",
    amber: "\x1b[38;2;245;158;11m",
    yellow: "\x1b[33m",
    rose: "\x1b[38;2;244;63;94m",
    red: "\x1b[31m",
    purple: "\x1b[38;2;168;85;247m",
    slate: "\x1b[38;2;148;163;184m",
    white: "\x1b[37m",
    brightWhite: "\x1b[97m",

    // Background Highlights
    bgBlue: "\x1b[48;2;30;58;138m",
    bgDark: "\x1b[48;2;15;23;42m",
    bgEmerald: "\x1b[48;2;6;78;59m",
    bgRose: "\x1b[48;2;136;19;55m"
};

// Data Store Loader
const dataPath = path.join(__dirname, 'data', 'students.json');
if (!fs.existsSync(dataPath)) {
    console.error(c.red + '❌ Error: data/students.json file not found.' + c.reset);
    process.exit(1);
}

const rawStudents = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
rawStudents.forEach(s => {
    s.total = s.maths + s.science + s.english + s.programming;
    s.average = s.total / 4;
    s.status = (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35) ? 'Pass' : 'Fail';
});

// CLI Argument Handling
const args = process.argv.slice(2);
const filterDept = args.includes('--dept') ? args[args.indexOf('--dept') + 1] : null;
const showOnlyArrears = args.includes('--arrears');
const showOnlyToppers = args.includes('--toppers');

let students = rawStudents;
if (filterDept) {
    students = students.filter(s => s.department.toLowerCase() === filterDept.toLowerCase());
}
if (showOnlyArrears) {
    students = students.filter(s => s.status === 'Fail');
}
if (showOnlyToppers) {
    students = students.filter(s => s.status === 'Pass' && s.average >= 90);
}

// ----------------------------------------------------
// STATISTICAL ANALYTICS ENGINE
// ----------------------------------------------------
const total = students.length;
const passedList = students.filter(s => s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35);
const arrearsList = students.filter(s => s.maths < 35 || s.science < 35 || s.english < 35 || s.programming < 35);

const passRate = total ? ((passedList.length / total) * 100).toFixed(1) : "0.0";
const studentAverages = students.map(s => (s.maths + s.science + s.english + s.programming) / 4);
const classAvg = total ? (studentAverages.reduce((a, b) => a + b, 0) / total).toFixed(2) : "0.00";
const attAvg = total ? (students.map(s => s.attendance).reduce((a, b) => a + b, 0) / total).toFixed(1) : "0.0";

// Standard Deviation
const variance = total ? studentAverages.reduce((acc, val) => acc + Math.pow(val - Number(classAvg), 2), 0) / total : 0;
const stdDev = Math.sqrt(variance).toFixed(2);

// Topper Identification
let topStudent = students[0] || null;
let topAvg = 0;
students.forEach(s => {
    const avg = (s.maths + s.science + s.english + s.programming) / 4;
    if (avg > topAvg) {
        topAvg = avg;
        topStudent = s;
    }
});

// Department Aggregates
const deptStats = {};
students.forEach(s => {
    if (!deptStats[s.department]) deptStats[s.department] = { count: 0, totalAvg: 0, passed: 0, scores: [] };
    const avg = (s.maths + s.science + s.english + s.programming) / 4;
    deptStats[s.department].count++;
    deptStats[s.department].totalAvg += avg;
    deptStats[s.department].scores.push(avg);
    if (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35) {
        deptStats[s.department].passed++;
    }
});

// Subject-Specific Analysis
const subjectsMeta = [
    { key: 'maths', name: 'Mathematics-I (Linear Alg & Calc)', code: 'MA101BS' },
    { key: 'science', name: 'Applied Engineering Physics', code: 'AP102BS' },
    { key: 'english', name: 'Professional English Communication', code: 'EN103HS' },
    { key: 'programming', name: 'Python & Data Structures Fundamentals', code: 'CS104ES' }
];

const subjectStats = subjectsMeta.map(sub => {
    const scores = students.map(s => s[sub.key]);
    const mean = total ? (scores.reduce((a, b) => a + b, 0) / total).toFixed(1) : 0;
    const min = total ? Math.min(...scores) : 0;
    const max = total ? Math.max(...scores) : 0;
    const subPassed = scores.filter(v => v >= 35).length;
    const subPassPct = total ? ((subPassed / total) * 100).toFixed(1) : 0;
    return { ...sub, mean, min, max, subPassed, subPassPct };
});

// Helper for ASCII Progress Bars
function renderAsciiBar(pct, width = 28, color = c.cyan) {
    const filledCount = Math.round((pct / 100) * width);
    const emptyCount = Math.max(0, width - filledCount);
    const filled = "█".repeat(filledCount);
    const empty = "░".repeat(emptyCount);
    return `${color}${filled}${c.slate}${empty}${c.reset}`;
}

// ----------------------------------------------------
// EXECUTIVE REPORT HEADER
// ----------------------------------------------------
console.log("");
console.log(c.indigo + "╔" + "═".repeat(84) + "╗" + c.reset);
console.log(c.indigo + "║" + c.brightWhite + c.bold + "  🏛️  BHARATH INSTITUTE OF ENGINEERING & TECHNOLOGY (AUTONOMOUS)                    " + c.indigo + "║" + c.reset);
console.log(c.indigo + "║" + c.slate + "      Office of the Controller of Examinations • UGC CBCS Academic Audit Report     " + c.indigo + "║" + c.reset);
console.log(c.indigo + "║" + c.dim + "      Accreditation: NAAC 'A+' Grade • NBA Tier-1 Accredited • NIRF Ranked           " + c.indigo + "║" + c.reset);
console.log(c.indigo + "╠" + "═".repeat(84) + "╣" + c.reset);
console.log(c.indigo + "║" + c.cyan + c.bold + "  📊 COHORT PERFORMANCE INTELLIGENCE & ACADEMIC AUDIT DOSSIER                       " + c.indigo + "║" + c.reset);
console.log(c.indigo + "╚" + "═".repeat(84) + "╝" + c.reset);

// Key Executive KPI Cards
console.log("\n" + c.bold + c.brightWhite + "  📌 EXECUTIVE KPI DASHBOARD SUMMARY" + c.reset);
console.log("  " + "─".repeat(84));
console.log(
    `  ${c.slate}Total Enrolled :${c.reset} ${c.bold}${c.brightWhite}${String(total).padEnd(4)}${c.reset} ` +
    `  ${c.slate}Clearance Rate :${c.reset} ${passRate >= 80 ? c.emerald : c.amber}${c.bold}${passRate}% (${passedList.length}/${total})${c.reset} ` +
    `  ${c.slate}Class Mean :${c.reset} ${c.bold}${c.cyan}${classAvg}%${c.reset} ` +
    `  ${c.slate}Attendance :${c.reset} ${c.bold}${c.purple}${attAvg}%${c.reset}`
);
console.log(
    `  ${c.slate}Cohort Variance:${c.reset} ${c.slate}σ = ${stdDev}${c.reset} ` +
    `  ${c.slate}Arrears / Backlogs:${c.reset} ${arrearsList.length ? c.rose : c.emerald}${c.bold}${arrearsList.length} Student(s)${c.reset} ` +
    `  ${c.slate}Gold Medalist:${c.reset} ${c.bold}${c.amber}${topStudent ? topStudent.name : 'N/A'} (${topAvg.toFixed(2)}%)${c.reset}`
);
console.log("  " + "─".repeat(84));

// ----------------------------------------------------
// 1. DEPARTMENTAL BENCHMARKING BARS
// ----------------------------------------------------
console.log("\n" + c.bold + c.brightWhite + "  🏢 DEPARTMENT-WISE PERFORMANCE BENCHMARKING" + c.reset);
console.log("  " + "─".repeat(84));
Object.keys(deptStats).forEach(dept => {
    const d = deptStats[dept];
    const avg = (d.totalAvg / d.count).toFixed(2);
    const passPct = ((d.passed / d.count) * 100).toFixed(0);
    const bar = renderAsciiBar(Number(avg), 26, avg >= 80 ? c.emerald : (avg >= 70 ? c.cyan : c.amber));
    const topperScore = Math.max(...d.scores).toFixed(1);
    console.log(
        `  ${c.bold}${dept.padEnd(6)}${c.reset} ` +
        `${bar} ` +
        `${c.bold}${String(avg + "%").padStart(7)}${c.reset} ` +
        `${c.dim}│${c.reset} Enrolled: ${c.brightWhite}${d.count}${c.reset} ` +
        `${c.dim}│${c.reset} Pass: ${passPct >= 90 ? c.emerald : c.amber}${passPct}%${c.reset} ` +
        `${c.dim}│${c.reset} Dept Peak: ${c.cyan}${topperScore}%${c.reset}`
    );
});
console.log("  " + "─".repeat(84));

// ----------------------------------------------------
// 2. SUBJECT MASTERY & COURSE CLEARANCE MATRIX
// ----------------------------------------------------
console.log("\n" + c.bold + c.brightWhite + "  📚 COURSE PAPER MASTERY & ATTENUATION MATRIX" + c.reset);
console.log("  " + "─".repeat(84));
console.log(
    `  ${c.slate}${"COURSE TITLE".padEnd(42)} ${"CODE".padEnd(9)} ${"MEAN".padStart(7)} ${"MIN".padStart(6)} ${"MAX".padStart(6)} ${"PASS RATE".padStart(10)}${c.reset}`
);
console.log("  " + "─".repeat(84));
subjectStats.forEach(sub => {
    const meanColor = sub.mean >= 80 ? c.emerald : (sub.mean >= 70 ? c.cyan : c.amber);
    const passColor = sub.subPassPct >= 90 ? c.emerald : (sub.subPassPct >= 75 ? c.amber : c.rose);
    console.log(
        `  ${c.brightWhite}${sub.name.padEnd(42)}${c.reset} ` +
        `${c.slate}${sub.code.padEnd(9)}${c.reset} ` +
        `${meanColor}${String(sub.mean + "%").padStart(7)}${c.reset} ` +
        `${c.slate}${String(sub.min).padStart(6)}${c.reset} ` +
        `${c.cyan}${String(sub.max).padStart(6)}${c.reset} ` +
        `${passColor}${String(sub.subPassPct + "%").padStart(10)}${c.reset}`
    );
});
console.log("  " + "─".repeat(84));

// ----------------------------------------------------
// 3. UGC 10-POINT SCALE GRADE DISTRIBUTION HISTOGRAM
// ----------------------------------------------------
console.log("\n" + c.bold + c.brightWhite + "  📈 UGC 10-POINT LETTER GRADE COHORT HISTOGRAM" + c.reset);
console.log("  " + "─".repeat(84));

const gradeTiers = [
    { label: "Grade O  (Outstanding - 10.0 GP, ≥90%)", key: "O", min: 90, color: c.amber },
    { label: "Grade A+ (Excellent   -  9.0 GP, 80-89%)", key: "A+", min: 80, max: 89.9, color: c.emerald },
    { label: "Grade A  (Very Good   -  8.0 GP, 70-79%)", key: "A", min: 70, max: 79.9, color: c.cyan },
    { label: "Grade B+ (Good        -  7.0 GP, 60-69%)", key: "B+", min: 60, max: 69.9, color: c.purple },
    { label: "Grade B  (Above Avg   -  6.0 GP, 50-59%)", key: "B", min: 50, max: 59.9, color: c.yellow },
    { label: "Grade C  (Average     -  5.0 GP, 40-49%)", key: "C", min: 40, max: 49.9, color: c.slate },
    { label: "Grade F  (Arrear/Fail -  0.0 GP,  <35%)", key: "F", isFail: true, color: c.rose }
];

gradeTiers.forEach(t => {
    let count = 0;
    if (t.isFail) {
        count = students.filter(s => s.maths < 35 || s.science < 35 || s.english < 35 || s.programming < 35).length;
    } else if (t.key === 'O') {
        count = students.filter(s => s.average >= 90 && s.status === 'Pass').length;
    } else if (t.key === 'A+') {
        count = students.filter(s => s.average >= 80 && s.average < 90 && s.status === 'Pass').length;
    } else if (t.key === 'A') {
        count = students.filter(s => s.average >= 70 && s.average < 80 && s.status === 'Pass').length;
    } else if (t.key === 'B+') {
        count = students.filter(s => s.average >= 60 && s.average < 70 && s.status === 'Pass').length;
    } else if (t.key === 'B') {
        count = students.filter(s => s.average >= 50 && s.average < 60 && s.status === 'Pass').length;
    } else if (t.key === 'C') {
        count = students.filter(s => s.average >= 40 && s.average < 50 && s.status === 'Pass').length;
    }

    const pct = total ? ((count / total) * 100).toFixed(1) : 0;
    const bar = renderAsciiBar(Number(pct), 22, t.color);
    console.log(
        `  ${t.color}${t.label.padEnd(44)}${c.reset} ` +
        `${bar} ` +
        `${c.bold}${String(count).padStart(3)} Students${c.reset} ` +
        `${c.dim}(${pct}%)${c.reset}`
    );
});
console.log("  " + "─".repeat(84));

// ----------------------------------------------------
// 4. AT-RISK STUDENTS & REMEDIAL INTERVENTION ALERT
// ----------------------------------------------------
if (arrearsList.length > 0) {
    console.log("\n" + c.rose + c.bold + "  ⚠️  ACADEMIC INTERVENTION & ARREAR REMEDIATION PROTOCOL" + c.reset);
    console.log("  " + "─".repeat(84));
    arrearsList.forEach(s => {
        const failedSubs = [];
        if (s.maths < 35) failedSubs.push(`Maths (${s.maths})`);
        if (s.science < 35) failedSubs.push(`Science (${s.science})`);
        if (s.english < 35) failedSubs.push(`English (${s.english})`);
        if (s.programming < 35) failedSubs.push(`Programming (${s.programming})`);

        console.log(
            `  ${c.rose}• #${String(s.id).padEnd(2)} ${s.name.padEnd(16)} [${s.department}]${c.reset} ` +
            `${c.slate}Att: ${s.attendance}%${c.reset} ` +
            `${c.dim}│${c.reset} Deficit Course(s): ${c.bold}${c.rose}${failedSubs.join(", ")}${c.reset} ` +
            `${c.dim}│${c.reset} Action: ${c.amber}Special Remedial Coaching Scheduled${c.reset}`
        );
    });
    console.log("  " + "─".repeat(84));
}

// ----------------------------------------------------
// 5. MASTER STUDENT ROSTER (FIRST 8 PREVIEW)
// ----------------------------------------------------
console.log("\n" + c.bold + c.brightWhite + "  📋 STUDENT TRANSCRIPT ROSTER SUMMARY (SAMPLE BATCH)" + c.reset);
console.log("  " + "─".repeat(84));
console.log(
    `  ${c.slate}${"ID".padEnd(4)} ${"STUDENT NAME".padEnd(18)} ${"DEPT".padEnd(7)} ${"MTH".padStart(4)} ${"SCI".padStart(4)} ${"ENG".padStart(4)} ${"PRG".padStart(4)} ${"TOT".padStart(5)} ${"PCT".padStart(7)} ${"SGPA".padStart(6)} ${"STATUS".padStart(8)}${c.reset}`
);
console.log("  " + "─".repeat(84));

const sampleList = students.slice(0, 10);
sampleList.forEach(s => {
    const tot = s.maths + s.science + s.english + s.programming;
    const avg = (tot / 4).toFixed(1);
    const isPass = s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35;
    const sgpa = isPass ? ((avg / 10) * 1.05 > 10 ? 10.0 : (avg / 10)).toFixed(2) : "0.00";
    const statusStr = isPass ? `${c.emerald}PASS${c.reset}` : `${c.rose}FAIL${c.reset}`;
    const nameColor = isPass && avg >= 90 ? c.amber : c.brightWhite;

    console.log(
        `  ${c.slate}#${String(s.id).padEnd(3)}${c.reset} ` +
        `${nameColor}${s.name.padEnd(18)}${c.reset} ` +
        `${c.cyan}${s.department.padEnd(7)}${c.reset} ` +
        `${s.maths < 35 ? c.rose : c.slate}${String(s.maths).padStart(4)}${c.reset} ` +
        `${s.science < 35 ? c.rose : c.slate}${String(s.science).padStart(4)}${c.reset} ` +
        `${s.english < 35 ? c.rose : c.slate}${String(s.english).padStart(4)}${c.reset} ` +
        `${s.programming < 35 ? c.rose : c.slate}${String(s.programming).padStart(4)}${c.reset} ` +
        `${c.bold}${String(tot).padStart(5)}${c.reset} ` +
        `${c.cyan}${String(avg + "%").padStart(7)}${c.reset} ` +
        `${c.purple}${String(sgpa).padStart(6)}${c.reset} ` +
        `${statusStr.padStart(16)}`
    );
});
console.log("  " + "─".repeat(84));

// Footer Tip & Commands
console.log(
    `  ${c.slate}Showing ${c.brightWhite}${sampleList.length}${c.slate} of ${c.brightWhite}${students.length}${c.slate} records. ` +
    `CLI Flags: ${c.cyan}--dept <CSE|ECE|EEE|MECH|CIVIL>${c.slate} │ ${c.rose}--arrears${c.slate} │ ${c.amber}--toppers${c.reset}`
);
console.log(
    `  ${c.emerald}🌐 Live Web Dashboard : ${c.brightWhite}http://localhost:3000${c.reset}\n`
);
