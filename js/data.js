/* ====================================================
   DATA STORE, CONSTANTS & PERSISTENCE HELPERS
==================================================== */
// Academic Grading & Evaluation Constants
const PASS_MARK_THRESHOLD = 35;
const TOTAL_MARKS_MAX = 400;
const TOTAL_SEMESTER_CREDITS = 16.0;

// Storage helper with safe in-memory fallback
const memoryStorage = {};
        function safeGetItem(key) {
            try {
                return localStorage.getItem(key) || sessionStorage.getItem(key) || memoryStorage[key] || null;
            } catch (e) {
                return memoryStorage[key] || null;
            }
        }
        function safeSetItem(key, val, remember = true) {
            memoryStorage[key] = val;
            try {
                if (remember) {
                    localStorage.setItem(key, val);
                } else {
                    sessionStorage.setItem(key, val);
                }
            } catch (e) { }
        }
        function safeRemoveItem(key) {
            delete memoryStorage[key];
            try {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            } catch (e) { }
        }

        // Department Mapping
        const DEPT_NAMES = {
            "CSE": "Computer Science & Engineering",
            "ECE": "Electronics & Communication Engineering",
            "EEE": "Electrical & Electronics Engineering",
            "MECH": "Mechanical Engineering",
            "CIVIL": "Civil Engineering"
        };

        // Standard Default Cohort Data (22 Students)
        const DEFAULT_STUDENTS = [
            { id: 1, name: "Arun Kumar", department: "CSE", gender: "Male", maths: 88, science: 91, english: 85, programming: 95, attendance: 92 },
            { id: 2, name: "Priya Sharma", department: "ECE", gender: "Female", maths: 92, science: 89, english: 94, programming: 90, attendance: 95 },
            { id: 3, name: "Rahul Raj", department: "EEE", gender: "Male", maths: 75, science: 78, english: 70, programming: 82, attendance: 85 },
            { id: 4, name: "Sneha Devi", department: "CSE", gender: "Female", maths: 96, science: 94, english: 91, programming: 97, attendance: 98 },
            { id: 5, name: "Vijay Kumar", department: "MECH", gender: "Male", maths: 65, science: 72, english: 68, programming: 70, attendance: 78 },
            { id: 6, name: "Anjali Reddy", department: "CIVIL", gender: "Female", maths: 82, science: 80, english: 85, programming: 78, attendance: 88 },
            { id: 7, name: "Karthik Rao", department: "CSE", gender: "Male", maths: 90, science: 86, english: 88, programming: 92, attendance: 94 },
            { id: 8, name: "Divya Singh", department: "ECE", gender: "Female", maths: 78, science: 84, english: 80, programming: 85, attendance: 90 },
            { id: 9, name: "Rohit Kumar", department: "EEE", gender: "Male", maths: 55, science: 62, english: 60, programming: 58, attendance: 70 },
            { id: 10, name: "Meena Devi", department: "CSE", gender: "Female", maths: 89, science: 93, english: 90, programming: 94, attendance: 96 },
            { id: 11, name: "Suresh Babu", department: "MECH", gender: "Male", maths: 72, science: 68, english: 75, programming: 70, attendance: 82 },
            { id: 12, name: "Lakshmi Priya", department: "CIVIL", gender: "Female", maths: 91, science: 88, english: 92, programming: 89, attendance: 93 },
            { id: 13, name: "Manoj Kumar", department: "ECE", gender: "Male", maths: 83, science: 79, english: 81, programming: 86, attendance: 87 },
            { id: 14, name: "Pooja Rani", department: "EEE", gender: "Female", maths: 95, science: 90, english: 94, programming: 96, attendance: 97 },
            { id: 15, name: "Ajay Kumar", department: "CSE", gender: "Male", maths: 48, science: 55, english: 52, programming: 50, attendance: 65 },
            { id: 16, name: "Harini Rao", department: "ECE", gender: "Female", maths: 86, science: 91, english: 87, programming: 90, attendance: 92 },
            { id: 17, name: "Gokul Raj", department: "MECH", gender: "Male", maths: 69, science: 73, english: 71, programming: 67, attendance: 76 },
            { id: 18, name: "Swathi Reddy", department: "CIVIL", gender: "Female", maths: 88, science: 85, english: 90, programming: 87, attendance: 91 },
            { id: 19, name: "Naveen Kumar", department: "EEE", gender: "Male", maths: 77, science: 74, english: 79, programming: 81, attendance: 84 },
            { id: 20, name: "Keerthana Devi", department: "CSE", gender: "Female", maths: 93, science: 96, english: 92, programming: 95, attendance: 99 },
            { id: 21, name: "Ramesh Gupta", department: "MECH", gender: "Male", maths: 32, science: 45, english: 38, programming: 40, attendance: 72 },
            { id: 22, name: "Deepa Verma", department: "CIVIL", gender: "Female", maths: 28, science: 31, english: 42, programming: 30, attendance: 68 }
        ];

        let students = [];
        let sortColumn = 'id';
        let sortDirection = 'asc';

        // Pre-configured Demo Users
        const DEFAULT_AUTH_USERS = [
            { username: "admin", password: "admin123", name: "Prof. Rajesh Sharma", role: "Faculty", department: "CSE" },
            { username: "sneha", password: "pass123", name: "Sneha Devi", role: "Student", studentId: 4, department: "CSE" },
            { username: "arun", password: "pass123", name: "Arun Kumar", role: "Student", studentId: 1, department: "CSE" },
            { username: "priya", password: "pass123", name: "Priya Sharma", role: "Student", studentId: 2, department: "ECE" }
        ];

        let currentUser = null;
        let selectedLoginRole = 'Faculty';
        let selectedRegRole = 'Student';

        function getUsersDB() {
            const saved = safeGetItem('portal_users_db_v2');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Merge default users if missing
                        DEFAULT_AUTH_USERS.forEach(defU => {
                            if (!parsed.some(u => u.username.toLowerCase() === defU.username.toLowerCase())) {
                                parsed.push(defU);
                            }
                        });
                        return parsed;
                    }
                } catch (e) { }
            }
            return DEFAULT_AUTH_USERS;
        }

        function saveUsersDB(users) {
            safeSetItem('portal_users_db_v2', JSON.stringify(users));
        }

        function initializeData() {
            const saved = safeGetItem('student_dashboard_data_v5');
            if (saved) {
                try {
                    students = JSON.parse(saved);
                } catch (e) {
                    students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
                }
            } else {
                students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
            }
            recalculateAllMetrics();
        }

        function saveDataToStorage() {
            safeSetItem('student_dashboard_data_v5', JSON.stringify(students));
        }

        function resetToDefaultData() {
            if (!currentUser || currentUser.role !== 'Faculty') {
                showToast("Reset is restricted to faculty administrators.", "warning");
                return;
            }

            if (confirm("Reset all student records back to standard cohort defaults?")) {
                students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
                recalculateAllMetrics();
                saveDataToStorage();
                updateDashboard();
                showToast("Dashboard reset to default data", "info");
            }
        }
