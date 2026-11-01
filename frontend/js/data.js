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
    },
    {
        "id": 2,
        "rollNo": "22A91A0502",
        "name": "Priya Sharma",
        "department": "CSE",
        "gender": "Female",
        "maths": 92,
        "science": 89,
        "english": 94,
        "programming": 90,
        "attendance": 95
    },
    {
        "id": 3,
        "rollNo": "22A91A0503",
        "name": "Rahul Raj",
        "department": "CSE",
        "gender": "Male",
        "maths": 75,
        "science": 78,
        "english": 70,
        "programming": 82,
        "attendance": 85
    },
    {
        "id": 4,
        "rollNo": "22A91A0504",
        "name": "Sneha Devi",
        "department": "CSE",
        "gender": "Female",
        "maths": 96,
        "science": 94,
        "english": 91,
        "programming": 97,
        "attendance": 98
    },
    {
        "id": 5,
        "rollNo": "22A91A0505",
        "name": "Karthik Rao",
        "department": "CSE",
        "gender": "Male",
        "maths": 90,
        "science": 86,
        "english": 88,
        "programming": 92,
        "attendance": 94
    },
    {
        "id": 6,
        "rollNo": "22A91A0506",
        "name": "Meena Devi",
        "department": "CSE",
        "gender": "Female",
        "maths": 89,
        "science": 93,
        "english": 90,
        "programming": 94,
        "attendance": 96
    },
    {
        "id": 7,
        "rollNo": "22A91A0507",
        "name": "Ajay Kumar",
        "department": "CSE",
        "gender": "Male",
        "maths": 48,
        "science": 55,
        "english": 52,
        "programming": 50,
        "attendance": 65
    },
    {
        "id": 8,
        "rollNo": "22A91A0508",
        "name": "Keerthana Devi",
        "department": "CSE",
        "gender": "Female",
        "maths": 93,
        "science": 96,
        "english": 92,
        "programming": 95,
        "attendance": 99
    },
    {
        "id": 9,
        "rollNo": "22A91A0509",
        "name": "Vikram Varma",
        "department": "CSE",
        "gender": "Male",
        "maths": 84,
        "science": 88,
        "english": 82,
        "programming": 86,
        "attendance": 90
    },
    {
        "id": 10,
        "rollNo": "22A91A0510",
        "name": "Bhavana Reddy",
        "department": "CSE",
        "gender": "Female",
        "maths": 91,
        "science": 89,
        "english": 93,
        "programming": 92,
        "attendance": 95
    },
    {
        "id": 11,
        "rollNo": "22A91A0511",
        "name": "Rohan Sen",
        "department": "CSE",
        "gender": "Male",
        "maths": 78,
        "science": 82,
        "english": 76,
        "programming": 80,
        "attendance": 88
    },
    {
        "id": 12,
        "rollNo": "22A91A0512",
        "name": "Pooja Nair",
        "department": "CSE",
        "gender": "Female",
        "maths": 85,
        "science": 87,
        "english": 89,
        "programming": 91,
        "attendance": 93
    },
    {
        "id": 13,
        "rollNo": "22A91A0513",
        "name": "Siddharth Jain",
        "department": "CSE",
        "gender": "Male",
        "maths": 92,
        "science": 90,
        "english": 88,
        "programming": 94,
        "attendance": 96
    },
    {
        "id": 14,
        "rollNo": "22A91A0514",
        "name": "Ananya Roy",
        "department": "CSE",
        "gender": "Female",
        "maths": 88,
        "science": 86,
        "english": 90,
        "programming": 89,
        "attendance": 92
    },
    {
        "id": 15,
        "rollNo": "22A91A0515",
        "name": "Gaurav Mishra",
        "department": "CSE",
        "gender": "Male",
        "maths": 62,
        "science": 68,
        "english": 65,
        "programming": 70,
        "attendance": 78
    },
    {
        "id": 16,
        "rollNo": "22A91A0516",
        "name": "Ishita Das",
        "department": "CSE",
        "gender": "Female",
        "maths": 94,
        "science": 92,
        "english": 95,
        "programming": 96,
        "attendance": 97
    },
    {
        "id": 17,
        "rollNo": "22A91A0517",
        "name": "Manish Tiwari",
        "department": "CSE",
        "gender": "Male",
        "maths": 58,
        "science": 64,
        "english": 60,
        "programming": 62,
        "attendance": 72
    },
    {
        "id": 18,
        "rollNo": "22A91A0518",
        "name": "Tanvi Agarwal",
        "department": "CSE",
        "gender": "Female",
        "maths": 86,
        "science": 88,
        "english": 85,
        "programming": 90,
        "attendance": 91
    },
    {
        "id": 19,
        "rollNo": "22A91A0519",
        "name": "Nikhil Sharma",
        "department": "CSE",
        "gender": "Male",
        "maths": 72,
        "science": 75,
        "english": 70,
        "programming": 78,
        "attendance": 84
    },
    {
        "id": 20,
        "rollNo": "22A91A0520",
        "name": "Swati Ghosh",
        "department": "CSE",
        "gender": "Female",
        "maths": 89,
        "science": 91,
        "english": 87,
        "programming": 92,
        "attendance": 94
    },
    {
        "id": 21,
        "rollNo": "22A91A0401",
        "name": "Divya Singh",
        "department": "ECE",
        "gender": "Female",
        "maths": 78,
        "science": 84,
        "english": 80,
        "programming": 85,
        "attendance": 90
    },
    {
        "id": 22,
        "rollNo": "22A91A0402",
        "name": "Manoj Kumar",
        "department": "ECE",
        "gender": "Male",
        "maths": 83,
        "science": 79,
        "english": 81,
        "programming": 86,
        "attendance": 87
    },
    {
        "id": 23,
        "rollNo": "22A91A0403",
        "name": "Harini Rao",
        "department": "ECE",
        "gender": "Female",
        "maths": 86,
        "science": 91,
        "english": 87,
        "programming": 90,
        "attendance": 92
    },
    {
        "id": 24,
        "rollNo": "22A91A0404",
        "name": "Pradeep Joshi",
        "department": "ECE",
        "gender": "Male",
        "maths": 74,
        "science": 78,
        "english": 72,
        "programming": 80,
        "attendance": 85
    },
    {
        "id": 25,
        "rollNo": "22A91A0405",
        "name": "Kavya Madhavan",
        "department": "ECE",
        "gender": "Female",
        "maths": 92,
        "science": 90,
        "english": 93,
        "programming": 95,
        "attendance": 96
    },
    {
        "id": 26,
        "rollNo": "22A91A0406",
        "name": "Tarun Teja",
        "department": "ECE",
        "gender": "Male",
        "maths": 68,
        "science": 72,
        "english": 70,
        "programming": 74,
        "attendance": 80
    },
    {
        "id": 27,
        "rollNo": "22A91A0407",
        "name": "Aishwarya Iyer",
        "department": "ECE",
        "gender": "Female",
        "maths": 95,
        "science": 93,
        "english": 96,
        "programming": 94,
        "attendance": 98
    },
    {
        "id": 28,
        "rollNo": "22A91A0408",
        "name": "Varun Sandesh",
        "department": "ECE",
        "gender": "Male",
        "maths": 80,
        "science": 84,
        "english": 82,
        "programming": 86,
        "attendance": 89
    },
    {
        "id": 29,
        "rollNo": "22A91A0409",
        "name": "Deepthi Pillai",
        "department": "ECE",
        "gender": "Female",
        "maths": 88,
        "science": 86,
        "english": 90,
        "programming": 89,
        "attendance": 93
    },
    {
        "id": 30,
        "rollNo": "22A91A0410",
        "name": "Kiran Varma",
        "department": "ECE",
        "gender": "Male",
        "maths": 76,
        "science": 80,
        "english": 78,
        "programming": 82,
        "attendance": 86
    },
    {
        "id": 31,
        "rollNo": "22A91A0411",
        "name": "Shreya Ghoshal",
        "department": "ECE",
        "gender": "Female",
        "maths": 91,
        "science": 93,
        "english": 90,
        "programming": 94,
        "attendance": 97
    },
    {
        "id": 32,
        "rollNo": "22A91A0412",
        "name": "Aditya Kashyap",
        "department": "ECE",
        "gender": "Male",
        "maths": 82,
        "science": 85,
        "english": 80,
        "programming": 88,
        "attendance": 91
    },
    {
        "id": 33,
        "rollNo": "22A91A0413",
        "name": "Madhuri Dixit",
        "department": "ECE",
        "gender": "Female",
        "maths": 87,
        "science": 89,
        "english": 86,
        "programming": 90,
        "attendance": 94
    },
    {
        "id": 34,
        "rollNo": "22A91A0414",
        "name": "Ashwin Sundar",
        "department": "ECE",
        "gender": "Male",
        "maths": 70,
        "science": 74,
        "english": 68,
        "programming": 76,
        "attendance": 82
    },
    {
        "id": 35,
        "rollNo": "22A91A0415",
        "name": "Lavanya Tripathi",
        "department": "ECE",
        "gender": "Female",
        "maths": 89,
        "science": 92,
        "english": 88,
        "programming": 91,
        "attendance": 95
    },
    {
        "id": 36,
        "rollNo": "22A91A0416",
        "name": "Chetan Bhagat",
        "department": "ECE",
        "gender": "Male",
        "maths": 65,
        "science": 70,
        "english": 66,
        "programming": 72,
        "attendance": 79
    },
    {
        "id": 37,
        "rollNo": "22A91A0417",
        "name": "Sandhya Menon",
        "department": "ECE",
        "gender": "Female",
        "maths": 84,
        "science": 86,
        "english": 82,
        "programming": 88,
        "attendance": 90
    },
    {
        "id": 38,
        "rollNo": "22A91A0418",
        "name": "Vikas Khanna",
        "department": "ECE",
        "gender": "Male",
        "maths": 79,
        "science": 82,
        "english": 77,
        "programming": 84,
        "attendance": 88
    },
    {
        "id": 39,
        "rollNo": "22A91A0419",
        "name": "Preeti Zinta",
        "department": "ECE",
        "gender": "Female",
        "maths": 90,
        "science": 88,
        "english": 92,
        "programming": 93,
        "attendance": 96
    },
    {
        "id": 40,
        "rollNo": "22A91A0420",
        "name": "Naveen Chawla",
        "department": "ECE",
        "gender": "Male",
        "maths": 30,
        "science": 45,
        "english": 40,
        "programming": 38,
        "attendance": 68
    },
    {
        "id": 41,
        "rollNo": "22A91A0201",
        "name": "Rohit Kumar",
        "department": "EEE",
        "gender": "Male",
        "maths": 55,
        "science": 62,
        "english": 60,
        "programming": 58,
        "attendance": 70
    },
    {
        "id": 42,
        "rollNo": "22A91A0202",
        "name": "Pooja Rani",
        "department": "EEE",
        "gender": "Female",
        "maths": 95,
        "science": 90,
        "english": 94,
        "programming": 96,
        "attendance": 97
    },
    {
        "id": 43,
        "rollNo": "22A91A0203",
        "name": "Naveen Kumar",
        "department": "EEE",
        "gender": "Male",
        "maths": 77,
        "science": 74,
        "english": 79,
        "programming": 81,
        "attendance": 84
    },
    {
        "id": 44,
        "rollNo": "22A91A0204",
        "name": "Sunil Gavaskar",
        "department": "EEE",
        "gender": "Male",
        "maths": 82,
        "science": 80,
        "english": 84,
        "programming": 86,
        "attendance": 90
    },
    {
        "id": 45,
        "rollNo": "22A91A0205",
        "name": "Anupama Nair",
        "department": "EEE",
        "gender": "Female",
        "maths": 88,
        "science": 86,
        "english": 90,
        "programming": 89,
        "attendance": 93
    },
    {
        "id": 46,
        "rollNo": "22A91A0206",
        "name": "Harish Kalyan",
        "department": "EEE",
        "gender": "Male",
        "maths": 70,
        "science": 75,
        "english": 72,
        "programming": 78,
        "attendance": 82
    },
    {
        "id": 47,
        "rollNo": "22A91A0207",
        "name": "Meenakshi Sundaram",
        "department": "EEE",
        "gender": "Female",
        "maths": 91,
        "science": 93,
        "english": 89,
        "programming": 94,
        "attendance": 96
    },
    {
        "id": 48,
        "rollNo": "22A91A0208",
        "name": "Surya Prakash",
        "department": "EEE",
        "gender": "Male",
        "maths": 74,
        "science": 78,
        "english": 72,
        "programming": 80,
        "attendance": 85
    },
    {
        "id": 49,
        "rollNo": "22A91A0209",
        "name": "Revathi Ram",
        "department": "EEE",
        "gender": "Female",
        "maths": 86,
        "science": 89,
        "english": 84,
        "programming": 90,
        "attendance": 92
    },
    {
        "id": 50,
        "rollNo": "22A91A0210",
        "name": "Dinesh Karthik",
        "department": "EEE",
        "gender": "Male",
        "maths": 80,
        "science": 82,
        "english": 78,
        "programming": 85,
        "attendance": 88
    },
    {
        "id": 51,
        "rollNo": "22A91A0211",
        "name": "Bhanu Priya",
        "department": "EEE",
        "gender": "Female",
        "maths": 93,
        "science": 95,
        "english": 91,
        "programming": 96,
        "attendance": 98
    },
    {
        "id": 52,
        "rollNo": "22A91A0212",
        "name": "Sanjay Dutt",
        "department": "EEE",
        "gender": "Male",
        "maths": 64,
        "science": 68,
        "english": 62,
        "programming": 70,
        "attendance": 76
    },
    {
        "id": 53,
        "rollNo": "22A91A0213",
        "name": "Yamuna Rani",
        "department": "EEE",
        "gender": "Female",
        "maths": 87,
        "science": 85,
        "english": 89,
        "programming": 91,
        "attendance": 94
    },
    {
        "id": 54,
        "rollNo": "22A91A0214",
        "name": "Nitin Gadkari",
        "department": "EEE",
        "gender": "Male",
        "maths": 76,
        "science": 79,
        "english": 74,
        "programming": 82,
        "attendance": 86
    },
    {
        "id": 55,
        "rollNo": "22A91A0215",
        "name": "Urmila Rao",
        "department": "EEE",
        "gender": "Female",
        "maths": 89,
        "science": 91,
        "english": 88,
        "programming": 92,
        "attendance": 95
    },
    {
        "id": 56,
        "rollNo": "22A91A0216",
        "name": "Jagadish Babu",
        "department": "EEE",
        "gender": "Male",
        "maths": 72,
        "science": 76,
        "english": 70,
        "programming": 78,
        "attendance": 83
    },
    {
        "id": 57,
        "rollNo": "22A91A0217",
        "name": "Sarita Devi",
        "department": "EEE",
        "gender": "Female",
        "maths": 85,
        "science": 87,
        "english": 83,
        "programming": 89,
        "attendance": 91
    },
    {
        "id": 58,
        "rollNo": "22A91A0218",
        "name": "Raghuvaran V",
        "department": "EEE",
        "gender": "Male",
        "maths": 68,
        "science": 72,
        "english": 66,
        "programming": 74,
        "attendance": 80
    },
    {
        "id": 59,
        "rollNo": "22A91A0219",
        "name": "Nalini C",
        "department": "EEE",
        "gender": "Female",
        "maths": 92,
        "science": 94,
        "english": 90,
        "programming": 95,
        "attendance": 97
    },
    {
        "id": 60,
        "rollNo": "22A91A0220",
        "name": "Kishore Kumar",
        "department": "EEE",
        "gender": "Male",
        "maths": 32,
        "science": 42,
        "english": 38,
        "programming": 35,
        "attendance": 66
    },
    {
        "id": 61,
        "rollNo": "22A91A0301",
        "name": "Vijay Kumar",
        "department": "MECH",
        "gender": "Male",
        "maths": 65,
        "science": 72,
        "english": 68,
        "programming": 70,
        "attendance": 78
    },
    {
        "id": 62,
        "rollNo": "22A91A0302",
        "name": "Suresh Babu",
        "department": "MECH",
        "gender": "Male",
        "maths": 72,
        "science": 68,
        "english": 75,
        "programming": 70,
        "attendance": 82
    },
    {
        "id": 63,
        "rollNo": "22A91A0303",
        "name": "Gokul Raj",
        "department": "MECH",
        "gender": "Male",
        "maths": 69,
        "science": 73,
        "english": 71,
        "programming": 67,
        "attendance": 76
    },
    {
        "id": 64,
        "rollNo": "22A91A0304",
        "name": "Ramesh Gupta",
        "department": "MECH",
        "gender": "Male",
        "maths": 32,
        "science": 45,
        "english": 38,
        "programming": 40,
        "attendance": 72
    },
    {
        "id": 65,
        "rollNo": "22A91A0305",
        "name": "Mahesh Bhupathi",
        "department": "MECH",
        "gender": "Male",
        "maths": 84,
        "science": 86,
        "english": 82,
        "programming": 88,
        "attendance": 90
    },
    {
        "id": 66,
        "rollNo": "22A91A0306",
        "name": "Kiran Kumar",
        "department": "MECH",
        "gender": "Male",
        "maths": 78,
        "science": 82,
        "english": 76,
        "programming": 80,
        "attendance": 86
    },
    {
        "id": 67,
        "rollNo": "22A91A0307",
        "name": "Rajesh K",
        "department": "MECH",
        "gender": "Male",
        "maths": 74,
        "science": 78,
        "english": 70,
        "programming": 82,
        "attendance": 84
    },
    {
        "id": 68,
        "rollNo": "22A91A0308",
        "name": "Lokesh Kanagaraj",
        "department": "MECH",
        "gender": "Male",
        "maths": 88,
        "science": 90,
        "english": 86,
        "programming": 92,
        "attendance": 94
    },
    {
        "id": 69,
        "rollNo": "22A91A0309",
        "name": "Dhanush Raja",
        "department": "MECH",
        "gender": "Male",
        "maths": 80,
        "science": 84,
        "english": 78,
        "programming": 86,
        "attendance": 88
    },
    {
        "id": 70,
        "rollNo": "22A91A0310",
        "name": "Venkatesh D",
        "department": "MECH",
        "gender": "Male",
        "maths": 76,
        "science": 80,
        "english": 74,
        "programming": 82,
        "attendance": 85
    },
    {
        "id": 71,
        "rollNo": "22A91A0311",
        "name": "Chiranjeevi K",
        "department": "MECH",
        "gender": "Male",
        "maths": 90,
        "science": 92,
        "english": 88,
        "programming": 94,
        "attendance": 96
    },
    {
        "id": 72,
        "rollNo": "22A91A0312",
        "name": "Balakrishna N",
        "department": "MECH",
        "gender": "Male",
        "maths": 70,
        "science": 75,
        "english": 68,
        "programming": 76,
        "attendance": 81
    },
    {
        "id": 73,
        "rollNo": "22A91A0313",
        "name": "Nagarjuna A",
        "department": "MECH",
        "gender": "Male",
        "maths": 86,
        "science": 88,
        "english": 84,
        "programming": 90,
        "attendance": 92
    },
    {
        "id": 74,
        "rollNo": "22A91A0314",
        "name": "Pawan Kalyan",
        "department": "MECH",
        "gender": "Male",
        "maths": 82,
        "science": 85,
        "english": 80,
        "programming": 88,
        "attendance": 90
    },
    {
        "id": 75,
        "rollNo": "22A91A0315",
        "name": "Prabhas Raju",
        "department": "MECH",
        "gender": "Male",
        "maths": 92,
        "science": 94,
        "english": 90,
        "programming": 95,
        "attendance": 97
    },
    {
        "id": 76,
        "rollNo": "22A91A0316",
        "name": "Allu Arjun",
        "department": "MECH",
        "gender": "Male",
        "maths": 89,
        "science": 91,
        "english": 87,
        "programming": 93,
        "attendance": 95
    },
    {
        "id": 77,
        "rollNo": "22A91A0317",
        "name": "Ram Charan",
        "department": "MECH",
        "gender": "Male",
        "maths": 87,
        "science": 89,
        "english": 85,
        "programming": 91,
        "attendance": 93
    },
    {
        "id": 78,
        "rollNo": "22A91A0318",
        "name": "Junior NTR",
        "department": "MECH",
        "gender": "Male",
        "maths": 91,
        "science": 93,
        "english": 89,
        "programming": 94,
        "attendance": 96
    },
    {
        "id": 79,
        "rollNo": "22A91A0319",
        "name": "Vijay Deverakonda",
        "department": "MECH",
        "gender": "Male",
        "maths": 75,
        "science": 78,
        "english": 72,
        "programming": 80,
        "attendance": 84
    },
    {
        "id": 80,
        "rollNo": "22A91A0320",
        "name": "Nani Ghanta",
        "department": "MECH",
        "gender": "Male",
        "maths": 83,
        "science": 86,
        "english": 81,
        "programming": 88,
        "attendance": 90
    },
    {
        "id": 81,
        "rollNo": "22A91A0101",
        "name": "Anjali Reddy",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 82,
        "science": 80,
        "english": 85,
        "programming": 78,
        "attendance": 88
    },
    {
        "id": 82,
        "rollNo": "22A91A0102",
        "name": "Lakshmi Priya",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 91,
        "science": 88,
        "english": 92,
        "programming": 89,
        "attendance": 93
    },
    {
        "id": 83,
        "rollNo": "22A91A0103",
        "name": "Swathi Reddy",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 88,
        "science": 85,
        "english": 90,
        "programming": 87,
        "attendance": 91
    },
    {
        "id": 84,
        "rollNo": "22A91A0104",
        "name": "Deepa Verma",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 28,
        "science": 31,
        "english": 42,
        "programming": 30,
        "attendance": 68
    },
    {
        "id": 85,
        "rollNo": "22A91A0105",
        "name": "Sravani Varma",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 86,
        "science": 89,
        "english": 84,
        "programming": 90,
        "attendance": 92
    },
    {
        "id": 86,
        "rollNo": "22A91A0106",
        "name": "Gowtham Raju",
        "department": "CIVIL",
        "gender": "Male",
        "maths": 74,
        "science": 78,
        "english": 72,
        "programming": 80,
        "attendance": 85
    },
    {
        "id": 87,
        "rollNo": "22A91A0107",
        "name": "Pranitha Subhash",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 89,
        "science": 91,
        "english": 87,
        "programming": 93,
        "attendance": 95
    },
    {
        "id": 88,
        "rollNo": "22A91A0108",
        "name": "Kalyan Ram",
        "department": "CIVIL",
        "gender": "Male",
        "maths": 78,
        "science": 82,
        "english": 76,
        "programming": 84,
        "attendance": 87
    },
    {
        "id": 89,
        "rollNo": "22A91A0109",
        "name": "Radhika Sarath",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 84,
        "science": 87,
        "english": 82,
        "programming": 89,
        "attendance": 90
    },
    {
        "id": 90,
        "rollNo": "22A91A0110",
        "name": "Srinivas A",
        "department": "CIVIL",
        "gender": "Male",
        "maths": 70,
        "science": 75,
        "english": 68,
        "programming": 76,
        "attendance": 82
    },
    {
        "id": 91,
        "rollNo": "22A91A0111",
        "name": "Soundarya Raghu",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 93,
        "science": 95,
        "english": 91,
        "programming": 96,
        "attendance": 98
    },
    {
        "id": 92,
        "rollNo": "22A91A0112",
        "name": "Mohanlal V",
        "department": "CIVIL",
        "gender": "Male",
        "maths": 88,
        "science": 90,
        "english": 86,
        "programming": 92,
        "attendance": 94
    },
    {
        "id": 93,
        "rollNo": "22A91A0113",
        "name": "Mammootty P",
        "department": "CIVIL",
        "gender": "Male",
        "maths": 85,
        "science": 88,
        "english": 84,
        "programming": 90,
        "attendance": 92
    },
    {
        "id": 94,
        "rollNo": "22A91A0114",
        "name": "Suhasini M",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 90,
        "science": 92,
        "english": 88,
        "programming": 94,
        "attendance": 96
    },
    {
        "id": 95,
        "rollNo": "22A91A0115",
        "name": "Kamal Haasan",
        "department": "CIVIL",
        "gender": "Male",
        "maths": 94,
        "science": 96,
        "english": 92,
        "programming": 97,
        "attendance": 98
    },
    {
        "id": 96,
        "rollNo": "22A91A0116",
        "name": "Rajinikanth S",
        "department": "CIVIL",
        "gender": "Male",
        "maths": 92,
        "science": 94,
        "english": 90,
        "programming": 95,
        "attendance": 97
    },
    {
        "id": 97,
        "rollNo": "22A91A0117",
        "name": "Jayasudha B",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 82,
        "science": 85,
        "english": 80,
        "programming": 88,
        "attendance": 90
    },
    {
        "id": 98,
        "rollNo": "22A91A0118",
        "name": "Shobana C",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 91,
        "science": 93,
        "english": 89,
        "programming": 94,
        "attendance": 96
    },
    {
        "id": 99,
        "rollNo": "22A91A0119",
        "name": "Sridevi Kapoor",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 95,
        "science": 96,
        "english": 93,
        "programming": 98,
        "attendance": 99
    },
    {
        "id": 100,
        "rollNo": "22A91A0120",
        "name": "Tabu Hashmi",
        "department": "CIVIL",
        "gender": "Female",
        "maths": 31,
        "science": 44,
        "english": 39,
        "programming": 36,
        "attendance": 69
    }
];

        let students = [];
        let sortColumn = 'id';
        let sortDirection = 'asc';

        // Pre-configured Demo Users
        const DEFAULT_AUTH_USERS = [
            { username: "admin", password: "admin123", name: "Prof. Rajesh Sharma", role: "Faculty", department: "CSE" },
            { username: "sneha", password: "pass123", name: "Sneha Devi", role: "Student", studentId: 4, department: "CSE" },
            { username: "arun", password: "pass123", name: "Arun Kumar", role: "Student", studentId: 1, department: "CSE" },
            { username: "priya", password: "pass123", name: "Priya Sharma", role: "Student", studentId: 2, department: "CSE" }
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
            const saved = safeGetItem('student_dashboard_data_v6_100');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length >= 100) { students = parsed; } else { students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS)); }
                } catch (e) {
                    students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
                }
            } else {
                students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
            }
            recalculateAllMetrics();
        }

        function saveDataToStorage() {
            safeSetItem('student_dashboard_data_v6_100', JSON.stringify(students));
        }

        function resetToDefaultData() {
            if (!currentUser || currentUser.role !== 'Faculty') {
                showToast("Reset is restricted to faculty administrators.", "warning");
                return;
            }

            if (confirm("Reset all student records back to standard cohort defaults?")) {
                students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
                recalculateAllMetrics();
                if (typeof currentSelectedStudentId !== 'undefined') {
                    currentSelectedStudentId = 4;
                }
                saveDataToStorage();
                if (typeof initStudentSelector === 'function') {
                    initStudentSelector();
                }
                updateDashboard();
                showToast("Dashboard reset to default data", "info");
            }
        }
