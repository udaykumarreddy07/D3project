/**
 * EduPulse Database Access Layer (Node.js DAO)
 * Manages persistent storage, cohort analytics, and data access for the Academic Portal
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'students.json');

// Full 22-student cohort fallback for resilient zero-config serverless deployments
const FALLBACK_STUDENTS = [
    { id: 1, name: "Arun Kumar", rollNo: "22A91A0501", department: "CSE", gender: "Male", maths: 88, science: 91, english: 85, programming: 95, attendance: 92 },
    { id: 2, name: "Priya Sharma", rollNo: "22A91A0502", department: "ECE", gender: "Female", maths: 92, science: 89, english: 94, programming: 90, attendance: 95 },
    { id: 3, name: "Rahul Raj", rollNo: "22A91A0503", department: "EEE", gender: "Male", maths: 75, science: 78, english: 70, programming: 82, attendance: 85 },
    { id: 4, name: "Sneha Devi", rollNo: "22A91A0504", department: "CSE", gender: "Female", maths: 96, science: 94, english: 91, programming: 97, attendance: 98 },
    { id: 5, name: "Vijay Kumar", rollNo: "22A91A0505", department: "MECH", gender: "Male", maths: 65, science: 72, english: 68, programming: 70, attendance: 78 },
    { id: 6, name: "Anjali Reddy", rollNo: "22A91A0506", department: "CIVIL", gender: "Female", maths: 82, science: 80, english: 85, programming: 78, attendance: 88 },
    { id: 7, name: "Karthik Rao", rollNo: "22A91A0507", department: "CSE", gender: "Male", maths: 90, science: 86, english: 88, programming: 92, attendance: 94 },
    { id: 8, name: "Divya Singh", rollNo: "22A91A0508", department: "ECE", gender: "Female", maths: 78, science: 84, english: 80, programming: 85, attendance: 90 },
    { id: 9, name: "Rohit Kumar", rollNo: "22A91A0509", department: "EEE", gender: "Male", maths: 55, science: 62, english: 60, programming: 58, attendance: 70 },
    { id: 10, name: "Meena Devi", rollNo: "22A91A0510", department: "CSE", gender: "Female", maths: 89, science: 93, english: 90, programming: 94, attendance: 96 },
    { id: 11, name: "Suresh Babu", rollNo: "22A91A0511", department: "MECH", gender: "Male", maths: 72, science: 68, english: 75, programming: 70, attendance: 82 },
    { id: 12, name: "Lakshmi Priya", rollNo: "22A91A0512", department: "CIVIL", gender: "Female", maths: 91, science: 88, english: 92, programming: 89, attendance: 93 },
    { id: 13, name: "Manoj Kumar", rollNo: "22A91A0513", department: "ECE", gender: "Male", maths: 83, science: 79, english: 81, programming: 86, attendance: 87 },
    { id: 14, name: "Pooja Rani", rollNo: "22A91A0514", department: "EEE", gender: "Female", maths: 95, science: 90, english: 94, programming: 96, attendance: 97 },
    { id: 15, name: "Ajay Kumar", rollNo: "22A91A0515", department: "CSE", gender: "Male", maths: 48, science: 55, english: 52, programming: 50, attendance: 65 },
    { id: 16, name: "Harini Rao", rollNo: "22A91A0516", department: "ECE", gender: "Female", maths: 86, science: 91, english: 87, programming: 90, attendance: 92 },
    { id: 17, name: "Gokul Raj", rollNo: "22A91A0517", department: "MECH", gender: "Male", maths: 69, science: 73, english: 71, programming: 67, attendance: 76 },
    { id: 18, name: "Swathi Reddy", rollNo: "22A91A0518", department: "CIVIL", gender: "Female", maths: 88, science: 85, english: 90, programming: 87, attendance: 91 },
    { id: 19, name: "Naveen Kumar", rollNo: "22A91A0519", department: "EEE", gender: "Male", maths: 77, science: 74, english: 79, programming: 81, attendance: 84 },
    { id: 20, name: "Keerthana Devi", rollNo: "22A91A0520", department: "CSE", gender: "Female", maths: 93, science: 96, english: 92, programming: 95, attendance: 99 },
    { id: 21, name: "Ramesh Gupta", rollNo: "22A91A0521", department: "MECH", gender: "Male", maths: 32, science: 45, english: 38, programming: 40, attendance: 72 },
    { id: 22, name: "Deepa Verma", rollNo: "22A91A0522", department: "CIVIL", gender: "Female", maths: 28, science: 31, english: 42, programming: 30, attendance: 68 }
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
                return FALLBACK_STUDENTS;
            }
        } catch (err) {
            return this.cache || FALLBACK_STUDENTS;
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
            this.cache = students;
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
