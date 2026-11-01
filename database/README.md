# 🗄️ Database Layer — EduPulse

This directory contains the database files, schema definitions, and the Node.js Data Access Object (DAO) for the EduPulse Academic Portal.

---

## 📂 File Overview

| File | Description |
|---|---|
| `students.json` | Master cohort dataset containing 22 student records across 5 academic departments |
| `db.js` | Node.js Data Access Layer providing CRUD methods, filtering, and aggregate analytics |
| `schema.json` | JSON Schema standard defining validation rules, minimum pass criteria, and constraints |

---

## 📊 Database Schema Summary

Each student record conforms to the following schema:

```json
{
  "id": 1,
  "rollNo": "22A91A0501",
  "name": "Arun Kumar",
  "department": "CSE",
  "gender": "Male",
  "maths": 88,
  "science": 91,
  "english": 85,
  "programming": 95,
  "attendance": 92
}
```

### Key Business Rules:
- **Passing Threshold:** Minimum 35 marks in each subject (`maths`, `science`, `english`, `programming`).
- **Eligible Attendance:** Minimum 75% for semester examinations.
- **Departments:** CSE, ECE, EEE, MECH, CIVIL.

---

## 🛠️ Usage in Node.js Backend

```javascript
const db = require('../database/db');

// Retrieve all students
const students = db.getAllStudents();

// Query by department
const cseStudents = db.getStudentsByDepartment('CSE');

// Query students with backlogs / arrears
const atRisk = db.getStudentsWithArrears();

// Get top 5 performers
const toppers = db.getTopStudents(5);

// Get real-time cohort analytics
const stats = db.getAnalytics();
console.log(`Class Average: ${stats.classAverage}, Pass Rate: ${stats.passRate}`);
```
