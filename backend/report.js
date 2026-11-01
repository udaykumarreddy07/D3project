#!/usr/bin/env node
/**
 * EduPulse CLI Terminal Reporting & Academic Audit Utility
 * Analyzes cohort dataset, highlights arrears, toppers, and department metrics.
 * 
 * Usage:
 *   node backend/report.js
 *   node backend/report.js --dept CSE
 *   node backend/report.js --arrears
 *   node backend/report.js --toppers
 */

const db = require('../database/db');

const args = process.argv.slice(2);
const deptIndex = args.indexOf('--dept');
const targetDept = deptIndex !== -1 ? args[deptIndex + 1] : null;
const showArrears = args.includes('--arrears');
const showToppers = args.includes('--toppers');

console.log('\n' + '='.repeat(72));
console.log('       🎓 EDUPULSE ACADEMIC OPERATIONS & AUDIT REPORT');
console.log('       Kalasalingam Academy of Research and Education');
console.log('='.repeat(72));

const analytics = db.getAnalytics();
let students = db.getAllStudents();
let modeTitle = 'Full Cohort Overview';

if (targetDept) {
    students = db.getStudentsByDepartment(targetDept);
    modeTitle = `Filtered by Department: [${targetDept.toUpperCase()}]`;
} else if (showArrears) {
    students = db.getStudentsWithArrears();
    modeTitle = '⚠️ Students Requiring Remedial Intervention (Arrears / <35 Marks)';
} else if (showToppers) {
    students = db.getTopStudents(5);
    modeTitle = '🏆 Top 5 Academic Honor Roll (Highest Cumulative Averages)';
}

console.log(`\n📌 Mode: ${modeTitle} (Count: ${students.length})`);
console.log('-'.repeat(72));

if (students.length === 0) {
    console.log('No matching student records found.');
} else {
    const tableData = students.map((s, index) => {
        const avg = ((s.maths + s.science + s.english + s.programming) / 4).toFixed(1);
        const hasArrear = (s.maths < 35 || s.science < 35 || s.english < 35 || s.programming < 35);
        const subjects = `M:${s.maths} S:${s.science} E:${s.english} P:${s.programming}`;
        return {
            '#': index + 1,
            'Roll No': s.rollNo || `22A91A05${String(s.id).padStart(2, '0')}`,
            'Name': s.name,
            'Dept': s.department,
            'Marks Breakdown': subjects,
            'Avg': `${avg}%`,
            'Attd': `${s.attendance}%`,
            'Result': hasArrear ? 'FAIL / ARREAR' : 'PASS'
        };
    });
    console.table(tableData);
}

console.log('-'.repeat(72));
console.log('📊 Cohort Key Performance Indicators (Global):');
console.log(`   • Total Students Enrolled : ${analytics.totalStudents}`);
console.log(`   • Overall Pass Percentage : ${analytics.passRate} (${analytics.passedStudents}/${analytics.totalStudents} passed)`);
console.log(`   • Cohort Average Score    : ${analytics.classAverage}`);
console.log(`   • Valedictorian / Topper  : ${analytics.topPerformer.name} (${analytics.topPerformer.department}) — ${analytics.topPerformer.average}`);
console.log(`   • Subject Averages        : Maths: ${analytics.subjectAverages.maths}%, Sci: ${analytics.subjectAverages.science}%, Eng: ${analytics.subjectAverages.english}%, Prog: ${analytics.subjectAverages.programming}%`);
console.log('='.repeat(72) + '\n');
