/* ====================================================
   AUTHENTICATION CONTROLLER & ROLE MANAGEMENT
==================================================== */
let currentAuthUser = null;
let currentUserRole = "Faculty";

        function switchAuthTab(tab) {
            if (tab === 'signin') {
                d3.select("#tabSignIn").classed("active", true);
                d3.select("#tabRegister").classed("active", false);
                d3.select("#signInForm").style("display", "block");
                d3.select("#registerForm").style("display", "none");
            } else {
                d3.select("#tabSignIn").classed("active", false);
                d3.select("#tabRegister").classed("active", true);
                d3.select("#signInForm").style("display", "none");
                d3.select("#registerForm").style("display", "block");
            }
        }

        function selectRole(role) {
            selectedLoginRole = role;
            if (role === 'Faculty') {
                d3.select("#roleOptFaculty").classed("selected", true);
                d3.select("#roleOptStudent").classed("selected", false);
            } else {
                d3.select("#roleOptStudent").classed("selected", true);
                d3.select("#roleOptFaculty").classed("selected", false);
            }
        }

        function selectRegRole(role) {
            selectedRegRole = role;
            if (role === 'Faculty') {
                d3.select("#regRoleFaculty").classed("selected", true);
                d3.select("#regRoleStudent").classed("selected", false);
            } else {
                d3.select("#regRoleStudent").classed("selected", true);
                d3.select("#regRoleFaculty").classed("selected", false);
            }
        }

        function togglePwdVisibility(inputId, btn) {
            const inputSel = d3.select(`#${inputId}`);
            const currType = inputSel.property("type");
            if (currType === "password") {
                inputSel.property("type", "text");
                d3.select(btn).text("🙈");
            } else {
                inputSel.property("type", "password");
                d3.select(btn).text("👁️");
            }
        }

        function handleSignIn(e) {
            if (e) e.preventDefault();
            const username = d3.select("#loginUsername").property("value").trim().toLowerCase();
            const password = d3.select("#loginPassword").property("value");
            const remember = d3.select("#rememberMe").property("checked");

            const users = getUsersDB();
            let matchedUser = users.find(u => u.username.toLowerCase() === username && u.password === password);

            if (!matchedUser) {
                // Check default demo credentials directly
                if (username === "admin" && (password === "admin123" || password === "admin")) {
                    matchedUser = DEFAULT_AUTH_USERS[0];
                } else if (username === "sneha" && (password === "pass123" || password === "sneha")) {
                    matchedUser = DEFAULT_AUTH_USERS[1];
                } else if (username === "arun" && (password === "pass123" || password === "arun")) {
                    matchedUser = DEFAULT_AUTH_USERS[2];
                } else if (username === "priya" && (password === "pass123" || password === "priya")) {
                    matchedUser = DEFAULT_AUTH_USERS[3];
                }
            }

            if (matchedUser) {
                authenticateSession(matchedUser, remember);
            } else {
                showToast("Invalid credentials. Try demo: admin / admin123 or sneha / pass123", "danger");
            }
        }

        function handleRegister(e) {
            if (e) e.preventDefault();
            const fullName = d3.select("#regFullName").property("value").trim();
            const username = d3.select("#regUsername").property("value").trim().toLowerCase();
            const dept = d3.select("#regDepartment").property("value");
            const password = d3.select("#regPassword").property("value");

            if (!fullName || !username || !password) {
                showToast("Please fill in all registration fields.", "warning");
                return;
            }

            const users = getUsersDB();
            if (users.some(u => u.username.toLowerCase() === username)) {
                showToast("Username already registered. Please choose another.", "warning");
                return;
            }

            let linkedStudentId = null;
            if (selectedRegRole === 'Student') {
                let existingMatch = students.find(s => s.name.toLowerCase() === fullName.toLowerCase());
                if (existingMatch) {
                    linkedStudentId = existingMatch.id;
                } else {
                    const nextId = students.length > 0 ? (d3.max(students, s => s.id) + 1) : 1;
                    const deptCodes = { "CSE": "05", "ECE": "04", "EEE": "02", "MECH": "03", "CIVIL": "01" };
                    const deptCode = deptCodes[dept] || "05";
                    const rollNo = `22A91A${deptCode}${String(nextId).padStart(2, '0')}`;
                    const newStudent = {
                        id: nextId,
                        rollNo: rollNo,
                        name: fullName,
                        department: dept,
                        gender: "Male",
                        attendance: 88,
                        maths: 85,
                        science: 88,
                        english: 82,
                        programming: 90
                    };
                    recalculateStudent(newStudent);
                    students.push(newStudent);
                    saveDataToStorage();
                    if (typeof initStudentSelector === 'function') initStudentSelector();
                    linkedStudentId = nextId;
                }
            }

            const newUser = {
                username: username,
                password: password,
                name: fullName,
                role: selectedRegRole,
                department: dept,
                studentId: linkedStudentId
            };

            users.push(newUser);
            saveUsersDB(users);
            showToast(`Account created for ${fullName}! Launching dashboard...`, "success");
            authenticateSession(newUser, true);
        }

        function handleGoogleSignIn() {
            const role = selectedLoginRole || "Faculty";
            const googleUser = role === "Faculty" ? {
                username: "google_prof_sharma",
                name: "Prof. Sharma (Google)",
                role: "Faculty",
                department: "CSE",
                studentId: null,
                email: "sharma@biet.edu.in",
                avatar: "PS"
            } : {
                username: "google_sneha",
                name: "Sneha Devi (Google)",
                role: "Student",
                department: "CSE",
                studentId: 4,
                email: "sneha.devi@student.biet.edu.in",
                avatar: "SD"
            };

            showToast("Connecting to Google Institutional Account...", "info");
            setTimeout(() => {
                authenticateSession(googleUser, true);
                showToast(`Signed in with Google as ${googleUser.name}`, "success");
            }, 300);
        }

        function quickLogin(demoKey) {
            let target = null;
            if (demoKey === 'admin') target = DEFAULT_AUTH_USERS[0];
            else if (demoKey === 'sneha') target = DEFAULT_AUTH_USERS[1];
            else if (demoKey === 'arun') target = DEFAULT_AUTH_USERS[2];
            else if (demoKey === 'priya') target = DEFAULT_AUTH_USERS[3];

            if (target) {
                d3.select("#loginUsername").property("value", target.username);
                d3.select("#loginPassword").property("value", target.password);
                selectRole(target.role);
                authenticateSession(target, true);
            }
        }

        function quickSwitchRole(role) {
            if (role === 'Faculty') {
                currentUser = DEFAULT_AUTH_USERS[0];
                window.location.hash = '#faculty';
            } else {
                currentUser = DEFAULT_AUTH_USERS[1]; // Sneha Devi
                window.location.hash = '#student';
            }
            safeSetItem('portal_current_session_v2', JSON.stringify(currentUser));
            applyRoleBasedUI();
            showToast(`Switched to ${currentUser.role} mode (${currentUser.name})`, "info");
        }

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#student') {
                if (!currentUser || currentUser.role !== 'Student') {
                    quickSwitchRole('Student');
                }
            } else if (window.location.hash === '#faculty' || window.location.hash === '#admin') {
                if (!currentUser || currentUser.role !== 'Faculty') {
                    quickSwitchRole('Faculty');
                }
            }
        });

        function authenticateSession(userObj, remember = true) {
            currentUser = userObj;
            const sessionData = JSON.stringify(currentUser);
            safeSetItem('portal_current_session_v2', sessionData, remember);

            const gateway = d3.select("#loginGateway");
            gateway.classed("authenticated", true);

            // Ensure gateway is hidden after CSS animation
            setTimeout(() => {
                if (gateway.classed("authenticated")) {
                    gateway.style("display", "none");
                }
            }, 400);

            applyRoleBasedUI();
            showToast(`Signed in as ${currentUser.name} (${currentUser.role})`, "success");
        }

        function logoutUser() {
            currentUser = null;
            safeRemoveItem('portal_current_session_v2');

            closeProgressCardModal();
            closeStudentModal();

            const gateway = d3.select("#loginGateway");
            gateway.style("display", "flex");
            setTimeout(() => {
                gateway.classed("authenticated", false);
            }, 10);

            showToast("Signed out. Academic session locked.", "info");
        }

        function checkInitialAuth() {
            const saved = safeGetItem('portal_current_session_v2');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.name) {
                        currentUser = parsed;
                        d3.select("#loginGateway").classed("authenticated", true).style("display", "none");
                        applyRoleBasedUI();
                        return;
                    }
                } catch (e) { }
            }
            // Auto-login into Faculty or Student view based on hash or default to Faculty
            if (window.location.hash === '#student') {
                quickLogin('sneha');
                return;
            }

            // Default auto-login to Faculty view so the complete dashboard and all D3 visualizations render immediately
            quickLogin('admin');
        }

        function applyRoleBasedUI() {
            if (!currentUser) return;

            const isFaculty = currentUser.role === 'Faculty';
            const isStudent = currentUser.role === 'Student';

            // Update Header Information
            const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
            d3.select("#userAvatarText").text(initials || "U");
            d3.select("#userDisplayName").text(currentUser.name);
            d3.select("#userDisplayRole").text(`${currentUser.role} • ${currentUser.department}`);

            d3.select("#btnSwitchFaculty").classed("active", isFaculty);
            d3.select("#btnSwitchStudent").classed("active", isStudent);

            if (isFaculty) {
                d3.select("#portalHeaderTitle").html(`
                    <span style="color: #38bdf8; font-family: 'Space Grotesk', sans-serif; font-weight: 800; letter-spacing: -0.5px;">⚡ EduPulse</span> &bull; Faculty Intelligence & Marksheets
                    <span class="badge-version" style="background: rgba(255,255,255,0.25);">👨‍🏫 Faculty Portal</span>
                `);
                d3.select("#portalHeaderSub").text("EduPulse Intelligent Campus Analytics • Full Cohort Tracking, D3.js Charts, Assignments & Marksheet Management");
                d3.select("#facultyDashboardView").style("display", "block");
                d3.select("#studentDashboardView").style("display", "none");
            } else {
                d3.select("#portalHeaderTitle").html(`
                    <span style="color: #38bdf8; font-family: 'Space Grotesk', sans-serif; font-weight: 800; letter-spacing: -0.5px;">⚡ EduPulse</span> &bull; Student Academic Observatory
                    <span class="badge-version" style="background: rgba(16, 185, 129, 0.35); border-color: #34d399;">🎓 Student Portal</span>
                `);
                d3.select("#portalHeaderSub").text("EduPulse Intelligent Campus Analytics • Verified Academic Transcript, Assignments, Fee Records & Progress Cards");
                d3.select("#facultyDashboardView").style("display", "none");
                d3.select("#studentDashboardView").style("display", "block");
            }

            d3.selectAll(".faculty-control").style("display", isFaculty ? "" : "none");
            d3.selectAll(".student-control").style("display", isStudent ? "" : "none");

            updateDashboard();
            if (isFaculty) {
                switchViewTab('all');
            } else {
                if (typeof switchStudentTab === 'function') switchStudentTab('overview');
            }
        }

        function getStudentForUser(user) {
            if (!user) return null;
            if (user.studentId) {
                const match = students.find(s => s.id === user.studentId);
                if (match) return match;
            }
            const matchByName = students.find(s => s.name.toLowerCase() === user.name.toLowerCase());
            if (matchByName) return matchByName;
            return students[0];
        }

        function openCurrentStudentCard() {
            const student = getStudentForUser(currentUser);
            if (student) {
                openProgressCard(student.id);
            } else {
                showToast("Student profile not found.", "warning");
            }
        }
