/**
 * EduPulse Database Access Layer (Node.js DAO)
 * Manages persistent storage, cohort analytics, and data access for the Academic Portal
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'students.json');

// Default fallback student data if JSON file is missing or corrupted
const FALLBACK_STUDENTS = [
    { id: 1, name: "Arun Kumar", rollNo: "22A91A0501", department: "CSE", gender: "Male", maths: 88, science: 91, english: 85, programming: 95, attendance: 92 },
    { id: 2, name: "Priya Sharma", rollNo: "22A91A0502", department: "ECE", gender: "Female", maths: 92, science: 89, english: 94, programming: 90, attendance: 95 },
    { id: 3, name: "Rahul Raj", rollNo: "22A91A0503", department: "EEE", gender: "Male", maths: 75, science: 78, english: 70, programming: 82, attendance: 85 },
    { id: 4, name: "Sneha Devi", rollNo: "22A91A0504", department: "CSE", gender: "Female", maths: 96, science: 94, english: 91, programming: 97, attendance: 98 },
    { id: 5, name: "Vijay Kumar", rollNo: "22A91A0505", department: "MECH", gender: "Male", maths: 65, science: 72, english: 68, programming: 70, attendance: 78 }
];

class Database {
    constructor(filePath = DB_FILE) {
        this.filePath = filePath;
        this.cache = null;
    }

    /**
     * Read all students from disk or cache
     */
    getAllStudents() {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf-8');
                this.cache = JSON.parse(data);
                return this.cache;
            } else {
                this.cache = [...FALLBACK_STUDENTS];
                this.saveAllStudents(this.cache);
                return this.cache;
            }
        } catch (err) {
            console.error('[Database Error] Failed to read students:', err.message);
            return this.cache || [...FALLBACK_STUDENTS];
        }
    }

    /**
     * Persist students to disk
     */
    saveAllStudents(students) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(students, null, 2), 'utf-8');
            this.cache = students;
            return true;
        } catch (err) {
            console.error('[Database Error] Failed to write students:', err.message);
            return false;
        }
    }

    /**
     * Find a student by ID or roll number
     */
    getStudentById(id) {
        const students = this.getAllStudents();
        return students.find(s => String(s.id) === String(id) || s.rollNo === id) || null;
    }

    /**
     * Filter students by department
     */
    getStudentsByDepartment(department) {
        const students = this.getAllStudents();
        return students.filter(s => s.department.toUpperCase() === department.toUpperCase());
    }

    /**
     * Get students with arrears (marks < 35 in any subject)
     */
    getStudentsWithArrears() {
        const students = this.getAllStudents();
        return students.filter(s => s.maths < 35 || s.science < 35 || s.english < 35 || s.programming < 35);
    }

    /**
     * Get top performers ranked by aggregate average
     */
    getTopStudents(limit = 5) {
        const students = this.getAllStudents();
        const scored = students.map(s => {
            const avg = (s.maths + s.science + s.english + s.programming) / 4;
            return { ...s, average: avg };
        });
        scored.sort((a, b) => b.average - a.average);
        return scored.slice(0, limit);
    }

    /**
     * Insert a new student record
     */
    insertStudent(studentData) {
        const students = this.getAllStudents();
        const newId = students.length > 0 ? Math.max(...students.map(s => Number(s.id) || 0)) + 1 : 1;
        const newStudent = {
            id: newId,
            name: studentData.name || 'New Student',
            rollNo: studentData.rollNo || `22A91A05${String(newId).padStart(2, '0')}`,
            department: (studentData.department || 'CSE').toUpperCase(),
            gender: studentData.gender || 'Male',
            maths: Number(studentData.maths) || 0,
            science: Number(studentData.science) || 0,
            english: Number(studentData.english) || 0,
            programming: Number(studentData.programming) || 0,
            attendance: Number(studentData.attendance) || 75
        };
        students.push(newStudent);
        this.saveAllStudents(students);
        return newStudent;
    }

    /**
     * Update an existing student record
     */
    updateStudent(id, updateData) {
        const students = this.getAllStudents();
        const index = students.findIndex(s => String(s.id) === String(id));
        if (index === -1) return null;

        students[index] = {
            ...students[index],
            ...updateData,
            id: students[index].id // Preserve immutable ID
        };
        this.saveAllStudents(students);
        return students[index];
    }

    /**
     * Delete student by ID
     */
    deleteStudent(id) {
        const students = this.getAllStudents();
        const initialLength = students.length;
        const filtered = students.filter(s => String(s.id) !== String(id));
        if (filtered.length === initialLength) return false;
        this.saveAllStudents(filtered);
        return true;
    }

    /**
     * Calculate aggregate cohort analytics
     */
    getAnalytics() {
        const students = this.getAllStudents();
        const total = students.length;
        if (total === 0) return { total: 0 };

        const passed = students.filter(s => s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35).length;
        const passRate = ((passed / total) * 100).toFixed(1);
        const avgs = students.map(s => (s.maths + s.science + s.english + s.programming) / 4);
        const classAverage = (avgs.reduce((a, b) => a + b, 0) / total).toFixed(2);

        // Subject averages
        const subjectAverages = {
            maths: (students.reduce((acc, s) => acc + s.maths, 0) / total).toFixed(1),
            science: (students.reduce((acc, s) => acc + s.science, 0) / total).toFixed(1),
            english: (students.reduce((acc, s) => acc + s.english, 0) / total).toFixed(1),
            programming: (students.reduce((acc, s) => acc + s.programming, 0) / total).toFixed(1)
        };

        // Department breakdown
        const departments = {};
        students.forEach(s => {
            const dept = s.department || 'OTHER';
            if (!departments[dept]) {
                departments[dept] = { count: 0, totalMarks: 0, passed: 0 };
            }
            departments[dept].count++;
            const sAvg = (s.maths + s.science + s.english + s.programming) / 4;
            departments[dept].totalMarks += sAvg;
            if (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35) {
                departments[dept].passed++;
            }
        });

        const departmentStats = {};
        for (const [dept, data] of Object.entries(departments)) {
            departmentStats[dept] = {
                count: data.count,
                average: (data.totalMarks / data.count).toFixed(2),
                passRate: ((data.passed / data.count) * 100).toFixed(1) + '%'
            };
        }

        // Top student
        let topStudent = students[0];
        let topAvg = 0;
        students.forEach(s => {
            const a = (s.maths + s.science + s.english + s.programming) / 4;
            if (a > topAvg) {
                topAvg = a;
                topStudent = s;
            }
        });

        return {
            totalStudents: total,
            passedStudents: passed,
            failedStudents: total - passed,
            passRate: `${passRate}%`,
            classAverage: `${classAverage}%`,
            subjectAverages,
            departmentStats,
            topPerformer: {
                id: topStudent.id,
                name: topStudent.name,
                department: topStudent.department,
                average: `${topAvg.toFixed(2)}%`
            }
        };
    }
}

// Export singleton instance and class
const db = new Database();
module.exports = db;
module.exports.Database = Database;
