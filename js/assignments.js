/* ====================================================
   ACADEMIC ASSIGNMENTS & MARKS EVALUATION CONTROLLER
   Faculty Assignment Publishing, Student Submissions & Grading
==================================================== */

// Default Curated Institutional Assignments
const DEFAULT_ASSIGNMENTS = [
    {
        id: "asg-101",
        title: "D3.js Interactive Data Visualization & Chart Animations",
        subject: "Programming",
        department: "All",
        facultyName: "Prof. Rajesh Sharma",
        startDate: "2026-09-18",
        endDate: "2026-10-02",
        maxMarks: 25,
        instructions: "Implement dynamic D3.js SVG visualizations displaying cohort performance metrics, responsive chart scaling, and custom interactive tooltips. Submit source files or packaged zip with documentation.",
        submissions: [
            {
                studentId: 4,
                studentName: "Sneha Devi",
                studentRoll: "22A91A0504",
                department: "CSE",
                submittedAt: "2026-09-22 14:30",
                status: "Graded",
                submissionText: "Developed custom animated SVG bar charts, D3 scatter plots with quartile markers, and touch inspector dock for mobile devices. Included clean modular code.",
                fileName: "sneha_devi_d3_analytics_project.zip",
                fileSize: "2.4 MB",
                marksAwarded: 24,
                gradedAt: "2026-09-23 11:00",
                gradedBy: "Prof. Rajesh Sharma",
                feedback: "Exceptional implementation! The smooth transitions and color accessibility for data points are brilliant."
            },
            {
                studentId: 1,
                studentName: "Arun Kumar",
                studentRoll: "22A91A0501",
                department: "CSE",
                submittedAt: "2026-09-23 18:45",
                status: "Submitted",
                submissionText: "Created interactive bar charts and department donut breakdown with responsive resize listeners.",
                fileName: "arun_kumar_d3_visuals.js",
                fileSize: "68 KB",
                marksAwarded: null,
                gradedAt: null,
                gradedBy: null,
                feedback: ""
            },
            {
                studentId: 2,
                studentName: "Priya Sharma",
                studentRoll: "22A91A0402",
                department: "ECE",
                submittedAt: "2026-09-24 10:15",
                status: "Graded",
                submissionText: "Engineered multi-axis radar chart and parallel coordinate plots with D3 v7 brushes.",
                fileName: "priya_sharma_radar_charts.pdf",
                fileSize: "1.1 MB",
                marksAwarded: 23,
                gradedAt: "2026-09-24 16:30",
                gradedBy: "Prof. Rajesh Sharma",
                feedback: "Very thorough analysis and clean visual design. Good work on axes scaling!"
            }
        ]
    },
    {
        id: "asg-102",
        title: "Differential Calculus & Predictive Regression Modeling",
        subject: "Maths",
        department: "All",
        facultyName: "Dr. Sunita Rao",
        startDate: "2026-09-20",
        endDate: "2026-10-06",
        maxMarks: 20,
        instructions: "Solve the second-order partial differential equations and compute Pearson correlation coefficients on semester grade distributions. Include proofs and mathematical error margins.",
        submissions: [
            {
                studentId: 4,
                studentName: "Sneha Devi",
                studentRoll: "22A91A0504",
                department: "CSE",
                submittedAt: "2026-09-24 16:00",
                status: "Submitted",
                submissionText: "Attached complete mathematical step-by-step proofs for gradient descent equations and bivariate regression models.",
                fileName: "mathematical_proofs_sneha_devi.pdf",
                fileSize: "3.2 MB",
                marksAwarded: null,
                gradedAt: null,
                gradedBy: null,
                feedback: ""
            }
        ]
    },
    {
        id: "asg-103",
        title: "Applied Semiconductor Physics & Sensor Signal Processing",
        subject: "Science",
        department: "All",
        facultyName: "Prof. K. Venkatesh",
        startDate: "2026-09-24",
        endDate: "2026-10-10",
        maxMarks: 20,
        instructions: "Design a telemetry ingestion model for analog sensor transducers with noise filtering algorithms. Submit circuit diagram schematic and simulation waveforms.",
        submissions: []
    },
    {
        id: "asg-104",
        title: "Technical Writing & Autonomous Project Proposal Dossier",
        subject: "English",
        department: "All",
        facultyName: "Dr. Catherine M.",
        startDate: "2026-09-25",
        endDate: "2026-10-12",
        maxMarks: 15,
        instructions: "Prepare an executive engineering proposal outlining system architecture, Gantt schedule, cost estimations, and ethical compliance for autonomous systems.",
        submissions: []
    }
];

// Local Storage Handlers
function getAssignmentsList() {
    const raw = (typeof safeGetItem === 'function')
        ? safeGetItem('portal_assignments_v1')
        : localStorage.getItem('portal_assignments_v1');

    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            console.error("Error reading assignments storage:", e);
        }
    }
    return DEFAULT_ASSIGNMENTS;
}

function saveAssignmentsList(assignments) {
    if (typeof safeSetItem === 'function') {
        safeSetItem('portal_assignments_v1', JSON.stringify(assignments));
    } else {
        localStorage.setItem('portal_assignments_v1', JSON.stringify(assignments));
    }
    updateAssignmentBadges();
}

// Compute due status: "active", "soon", or "closed"
function computeDueStatus(endDateStr) {
    const now = new Date();
    const end = new Date(endDateStr + "T23:59:59");
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Closed / Past Due", class: "asg-due-closed", days: diffDays };
    if (diffDays <= 3) return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, class: "asg-due-soon", days: diffDays };
    return { label: `Active (${diffDays} days left)`, class: "asg-due-active", days: diffDays };
}

// Format date nicely
function formatDisplayDate(dateStr) {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

// Update Badges on Nav Buttons
function updateAssignmentBadges() {
    const assignments = getAssignmentsList();
    const currStudent = (typeof getStudentForUser === 'function')
        ? getStudentForUser(currentUser)
        : (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null);

    if (currStudent) {
        const pendingCount = assignments.filter(a => {
            const sub = (a.submissions || []).find(s => s.studentId === currStudent.id);
            return !sub;
        }).length;

        const badge = document.getElementById("studPendingAssignmentsBadge");
        if (badge) {
            badge.textContent = pendingCount;
            badge.style.display = pendingCount > 0 ? "inline-block" : "none";
        }
    }
}

/* ====================================================
   FACULTY ASSIGNMENT CONTROLLER
==================================================== */
let currentFacultySubjectFilter = "All";
let currentFacultySearchTerm = "";
let currentGradingAssignmentId = null;

function renderFacultyAssignments() {
    const assignments = getAssignmentsList();
    const cohortSize = (typeof students !== 'undefined' && students.length > 0) ? students.length : 25;

    // Filter assignments
    let filtered = assignments;
    if (currentFacultySubjectFilter !== "All") {
        filtered = filtered.filter(a => a.subject.toLowerCase() === currentFacultySubjectFilter.toLowerCase());
    }
    if (currentFacultySearchTerm.trim() !== "") {
        const term = currentFacultySearchTerm.toLowerCase();
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(term) ||
            a.subject.toLowerCase().includes(term) ||
            (a.instructions && a.instructions.toLowerCase().includes(term))
        );
    }

    // Calculate Telemetry Metrics
    const totalAssignments = assignments.length;
    let totalSubmissions = 0;
    let totalGraded = 0;
    let totalScoresSum = 0;
    let totalPossibleSum = 0;

    assignments.forEach(a => {
        const subs = a.submissions || [];
        totalSubmissions += subs.length;
        subs.forEach(s => {
            if (s.status === 'Graded' && s.marksAwarded !== null && s.marksAwarded !== undefined) {
                totalGraded++;
                totalScoresSum += Number(s.marksAwarded);
                totalPossibleSum += Number(a.maxMarks);
            }
        });
    });

    const pendingReview = totalSubmissions - totalGraded;
    const avgScorePct = totalPossibleSum > 0 ? Math.round((totalScoresSum / totalPossibleSum) * 100) : 88;

    // Update KPI Displays
    const facTotalAsg = document.getElementById("facTotalAsg");
    const facTotalSub = document.getElementById("facTotalSub");
    const facGradedCount = document.getElementById("facGradedCount");
    const facPendingReview = document.getElementById("facPendingReview");
    const facAvgScore = document.getElementById("facAvgScore");

    if (facTotalAsg) facTotalAsg.textContent = totalAssignments;
    if (facTotalSub) facTotalSub.textContent = totalSubmissions;
    if (facGradedCount) facGradedCount.textContent = totalGraded;
    if (facPendingReview) facPendingReview.textContent = pendingReview;
    if (facAvgScore) facAvgScore.textContent = `${avgScorePct}%`;

    // Render Grid Cards
    const gridContainer = document.getElementById("facultyAssignmentsGrid");
    if (!gridContainer) return;

    if (filtered.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: rgba(15, 23, 42, 0.6); border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.1);">
                <div style="font-size: 32px; margin-bottom: 10px;">📝</div>
                <h3 style="color: #fff; margin-bottom: 6px;">No Assignments Found</h3>
                <p style="color: #94a3b8; font-size: 13px;">No assignments match the selected filter criteria. Click "+ Create Assignment" to publish one.</p>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = filtered.map(asg => {
        const subs = asg.submissions || [];
        const gradedCount = subs.filter(s => s.status === 'Graded').length;
        const subCount = subs.length;
        const dueInfo = computeDueStatus(asg.endDate);
        const subjClass = `subj-${(asg.subject || 'programming').toLowerCase()}`;
        const pctSubmitted = cohortSize > 0 ? Math.min(100, Math.round((subCount / cohortSize) * 100)) : 0;

        return `
            <div class="asg-card" id="asg-card-${asg.id}">
                <div>
                    <div class="asg-card-top">
                        <span class="asg-subject-pill ${subjClass}">
                            <span>📚</span> ${asg.subject}
                        </span>
                        <span class="asg-marks-badge">Max Marks: ${asg.maxMarks}</span>
                    </div>

                    <h3 class="asg-card-title">${asg.title}</h3>
                    <div class="asg-card-desc">${asg.instructions || 'No detailed instructions provided.'}</div>

                    <!-- Timeline Bar -->
                    <div class="asg-dates-bar">
                        <div class="asg-date-item">
                            <span class="asg-date-lbl">Assigned Date</span>
                            <span class="asg-date-val">${formatDisplayDate(asg.startDate)}</span>
                        </div>
                        <span class="asg-date-divider">➔</span>
                        <div class="asg-date-item">
                            <span class="asg-date-lbl">Submission Due</span>
                            <span class="asg-date-val">${formatDisplayDate(asg.endDate)}</span>
                        </div>
                        <span class="asg-due-pill ${dueInfo.class}">${dueInfo.label}</span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="asg-progress-wrap">
                        <div class="asg-progress-meta">
                            <span class="asg-progress-lbl">Student Submissions</span>
                            <span class="asg-progress-stat">${subCount} / ${cohortSize} (${pctSubmitted}%) &bull; <b style="color: #34d399;">${gradedCount} Graded</b></span>
                        </div>
                        <div class="asg-progress-track">
                            <div class="asg-progress-fill" style="width: ${pctSubmitted}%;"></div>
                        </div>
                    </div>
                </div>

                <div class="asg-card-footer">
                    <div class="asg-faculty-badge">
                        <span>👨‍🏫</span> ${asg.facultyName || 'Faculty Instructor'}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="openGradingModal('${asg.id}')" style="background: linear-gradient(135deg, #6366f1, #4f46e5); font-weight: 700;">
                            📋 Review & Grade (${subCount})
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="openCreateAssignmentModal('${asg.id}')" title="Edit Assignment">
                            ✏️
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="deleteAssignment('${asg.id}')" title="Delete Assignment" style="color: #fb7185; border-color: rgba(251, 113, 133, 0.3);">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function filterFacultyAssignmentsBySubject(subj) {
    currentFacultySubjectFilter = subj;
    renderFacultyAssignments();
}

function handleFacultyAssignmentSearch(val) {
    currentFacultySearchTerm = val;
    renderFacultyAssignments();
}

// Open Create or Edit Modal
function openCreateAssignmentModal(editId = null) {
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can create or edit assignments.", "danger");
        return;
    }

    const modal = document.getElementById("createAssignmentModal");
    if (!modal) return;

    if (editId) {
        const assignments = getAssignmentsList();
        const asg = assignments.find(a => a.id === editId);
        if (!asg) return;

        document.getElementById("asgModalTitle").textContent = "Edit Assignment Details";
        document.getElementById("asgEditId").value = asg.id;
        document.getElementById("asgTitleInput").value = asg.title;
        document.getElementById("asgSubjectInput").value = asg.subject;
        document.getElementById("asgDeptInput").value = asg.department || "All";
        document.getElementById("asgStartDateInput").value = asg.startDate;
        document.getElementById("asgEndDateInput").value = asg.endDate;
        document.getElementById("asgMaxMarksInput").value = asg.maxMarks;
        document.getElementById("asgInstructionsInput").value = asg.instructions || "";
        document.getElementById("asgSubmitBtn").textContent = "Update Assignment";
    } else {
        const todayStr = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 14);
        const dueStr = nextWeek.toISOString().split('T')[0];

        document.getElementById("asgModalTitle").textContent = "Publish New Assignment";
        document.getElementById("asgEditId").value = "";
        document.getElementById("asgTitleInput").value = "";
        document.getElementById("asgSubjectInput").value = "Programming";
        document.getElementById("asgDeptInput").value = "All";
        document.getElementById("asgStartDateInput").value = todayStr;
        document.getElementById("asgEndDateInput").value = dueStr;
        document.getElementById("asgMaxMarksInput").value = "25";
        document.getElementById("asgInstructionsInput").value = "";
        document.getElementById("asgSubmitBtn").textContent = "Publish Assignment to All Students";
    }

    modal.classList.add("active");
}

function closeCreateAssignmentModal() {
    const modal = document.getElementById("createAssignmentModal");
    if (modal) modal.classList.remove("active");
}

function handleSaveAssignment(e) {
    if (e) e.preventDefault();

    const editId = document.getElementById("asgEditId").value;
    const title = document.getElementById("asgTitleInput").value.trim();
    const subject = document.getElementById("asgSubjectInput").value;
    const dept = document.getElementById("asgDeptInput").value;
    const startDate = document.getElementById("asgStartDateInput").value;
    const endDate = document.getElementById("asgEndDateInput").value;
    const maxMarks = Number(document.getElementById("asgMaxMarksInput").value) || 25;
    const instructions = document.getElementById("asgInstructionsInput").value.trim();

    if (!title || !startDate || !endDate) {
        showToast("Please fill in assignment title and valid start/end dates.", "warning");
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showToast("End date must be on or after start date.", "warning");
        return;
    }

    let assignments = getAssignmentsList();

    if (editId) {
        const idx = assignments.findIndex(a => a.id === editId);
        if (idx !== -1) {
            assignments[idx].title = title;
            assignments[idx].subject = subject;
            assignments[idx].department = dept;
            assignments[idx].startDate = startDate;
            assignments[idx].endDate = endDate;
            assignments[idx].maxMarks = maxMarks;
            assignments[idx].instructions = instructions;
            saveAssignmentsList(assignments);
            showToast(`Assignment "${title}" updated successfully!`, "success");
        }
    } else {
        const newAsg = {
            id: `asg-${Date.now()}`,
            title: title,
            subject: subject,
            department: dept,
            facultyName: currentUser ? currentUser.name : "Prof. Rajesh Sharma",
            startDate: startDate,
            endDate: endDate,
            maxMarks: maxMarks,
            instructions: instructions,
            submissions: []
        };
        assignments.unshift(newAsg);
        saveAssignmentsList(assignments);

        // Also broadcast an institutional alert automatically
        if (typeof getNoticesList === 'function' && typeof saveNoticesList === 'function') {
            const notices = getNoticesList();
            notices.unshift({
                id: Date.now(),
                title: `New Assignment Published: ${title} (${subject})`,
                category: "academic",
                priority: "normal",
                date: "Just now",
                body: `New assignment for ${subject} has been assigned with deadline ${formatDisplayDate(endDate)}. Maximum marks: ${maxMarks}. Submit your solutions via student portal.`,
                sender: currentUser ? currentUser.name : "Academic Section",
                target: dept === "All" ? "All Cohorts" : `${dept} Department`
            });
            saveNoticesList(notices);
        }

        showToast(`Assignment published to all enrolled students!`, "success");
    }

    closeCreateAssignmentModal();
    renderFacultyAssignments();
    if (typeof updateDashboard === 'function') updateDashboard();
}

function deleteAssignment(id) {
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can delete assignments.", "danger");
        return;
    }

    let assignments = getAssignmentsList();
    const asg = assignments.find(a => a.id === id);
    if (!asg) return;

    if (confirm(`Permanently remove assignment "${asg.title}" and all associated student submissions?`)) {
        assignments = assignments.filter(a => a.id !== id);
        saveAssignmentsList(assignments);
        renderFacultyAssignments();
        showToast("Assignment removed.", "info");
    }
}

/* ====================================================
   FACULTY GRADING & SUBMISSION REVIEW MODAL
==================================================== */
let gradingFilter = "all"; // "all" | "submitted" | "graded" | "pending"

function openGradingModal(asgId) {
    currentGradingAssignmentId = asgId;
    const assignments = getAssignmentsList();
    const asg = assignments.find(a => a.id === asgId);
    if (!asg) return;

    const modal = document.getElementById("gradingModal");
    if (!modal) return;

    // Set Header Info
    document.getElementById("gradeModalTitle").textContent = asg.title;
    document.getElementById("gradeModalMeta").innerHTML = `
        <span class="asg-subject-pill subj-${asg.subject.toLowerCase()}">${asg.subject}</span>
        <span>Max Marks: <b>${asg.maxMarks}</b></span> &bull;
        <span>Due Date: <b>${formatDisplayDate(asg.endDate)}</b></span> &bull;
        <span>Target: <b>${asg.department || 'All Cohorts'}</b></span>
    `;

    renderGradingStudentTable();
    modal.classList.add("active");
}

function closeGradingModal() {
    const modal = document.getElementById("gradingModal");
    if (modal) modal.classList.remove("active");
    currentGradingAssignmentId = null;
    renderFacultyAssignments();
}

function setGradingFilter(filter) {
    gradingFilter = filter;
    document.querySelectorAll(".grading-filter-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`gradeFilter-${filter}`);
    if (activeBtn) activeBtn.classList.add("active");
    renderGradingStudentTable();
}

function renderGradingStudentTable() {
    if (!currentGradingAssignmentId) return;

    const assignments = getAssignmentsList();
    const asg = assignments.find(a => a.id === currentGradingAssignmentId);
    if (!asg) return;

    const tbody = document.getElementById("gradingTableBody");
    if (!tbody) return;

    const cohort = (typeof students !== 'undefined' && students.length > 0) ? students : [
        { id: 4, name: "Sneha Devi", rollNo: "22A91A0504", department: "CSE" },
        { id: 1, name: "Arun Kumar", rollNo: "22A91A0501", department: "CSE" },
        { id: 2, name: "Priya Sharma", rollNo: "22A91A0402", department: "ECE" }
    ];

    const subs = asg.submissions || [];

    // Filter students
    let rowsHtml = "";
    let matchCount = 0;

    cohort.forEach(stud => {
        const sub = subs.find(s => s.studentId === stud.id);
        const hasSubmitted = !!sub;
        const isGraded = hasSubmitted && sub.status === 'Graded' && sub.marksAwarded !== null;

        if (gradingFilter === 'submitted' && !hasSubmitted) return;
        if (gradingFilter === 'graded' && !isGraded) return;
        if (gradingFilter === 'pending' && (!hasSubmitted || isGraded)) return;

        matchCount++;

        let statusBadge = `<span class="fee-status-badge status-due" style="font-size: 11px;">⚪ Not Submitted</span>`;
        let submissionCell = `<span style="color: #64748b; font-size: 12px;">No submission uploaded yet</span>`;
        let markVal = "";
        let feedbackVal = "";

        if (hasSubmitted) {
            if (isGraded) {
                statusBadge = `<span class="fee-status-badge status-paid" style="font-size: 11px;">✓ Graded (${sub.marksAwarded}/${asg.maxMarks})</span>`;
            } else {
                statusBadge = `<span class="asg-due-pill asg-due-soon" style="font-size: 11px;">⏳ Awaiting Marks</span>`;
            }

            submissionCell = `
                <div style="font-size: 12px; margin-bottom: 4px;">
                    <b style="color: #cbd5e1;">${sub.submittedAt || 'Recently'}</b>: 
                    <span style="color: #94a3b8;">${sub.submissionText || 'Submission completed.'}</span>
                </div>
                ${sub.fileName ? `
                    <div class="asg-file-pill" onclick="simulateDownloadFile('${sub.fileName}')" title="Click to view file">
                        <span>📎</span> <b>${sub.fileName}</b> (${sub.fileSize || '1.5 MB'})
                    </div>
                ` : ''}
            `;

            markVal = sub.marksAwarded !== null && sub.marksAwarded !== undefined ? sub.marksAwarded : "";
            feedbackVal = sub.feedback || "";
        }

        rowsHtml += `
            <tr id="grade-row-${stud.id}">
                <td style="font-weight: 700; color: #38bdf8;">${stud.rollNo || '22A91A050' + stud.id}</td>
                <td>
                    <div style="font-weight: 700; color: #fff;">${stud.name}</div>
                    <div style="font-size: 11px; color: #94a3b8;">Dept: ${stud.department}</div>
                </td>
                <td>${statusBadge}</td>
                <td style="max-width: 280px;">${submissionCell}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <input type="number" class="grade-input-box" id="input-mark-${stud.id}"
                            value="${markVal}" min="0" max="${asg.maxMarks}" placeholder="0"
                            ${!hasSubmitted ? 'title="Student has not submitted yet, but you can enter provisional score"' : ''}
                        >
                        <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">/ ${asg.maxMarks}</span>
                    </div>
                </td>
                <td>
                    <input type="text" class="feedback-input-box" id="input-feedback-${stud.id}"
                        value="${feedbackVal.replace(/"/g, '&quot;')}" placeholder="e.g. Well researched, good chart layout...">
                </td>
                <td style="text-align: right;">
                    <button type="button" class="btn btn-primary btn-sm" onclick="saveStudentGrade('${asg.id}', ${stud.id})" style="background: linear-gradient(135deg, #10b981, #059669); font-weight: 700; padding: 6px 12px;">
                        💾 Save
                    </button>
                </td>
            </tr>
        `;
    });

    if (matchCount === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #94a3b8;">
                    No student records matching filter "<b>${gradingFilter}</b>".
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = rowsHtml;
    }
}

// Save single student grade
function saveStudentGrade(asgId, studentId) {
    const markInput = document.getElementById(`input-mark-${studentId}`);
    const feedbackInput = document.getElementById(`input-feedback-${studentId}`);
    if (!markInput) return;

    const assignments = getAssignmentsList();
    const asg = assignments.find(a => a.id === asgId);
    if (!asg) return;

    const mark = Number(markInput.value);
    if (isNaN(mark) || mark < 0 || mark > asg.maxMarks) {
        showToast(`Please enter a valid mark between 0 and ${asg.maxMarks}.`, "warning");
        markInput.focus();
        return;
    }

    const feedback = feedbackInput ? feedbackInput.value.trim() : "";

    // Find student in cohort
    const studentObj = (typeof students !== 'undefined') ? students.find(s => s.id === studentId) : null;
    const studentName = studentObj ? studentObj.name : `Student #${studentId}`;
    const studentRoll = studentObj ? studentObj.rollNo : `22A91A050${studentId}`;
    const studentDept = studentObj ? studentObj.department : "CSE";

    if (!asg.submissions) asg.submissions = [];
    let sub = asg.submissions.find(s => s.studentId === studentId);

    if (sub) {
        sub.marksAwarded = mark;
        sub.feedback = feedback;
        sub.status = "Graded";
        sub.gradedAt = new Date().toLocaleString();
        sub.gradedBy = currentUser ? currentUser.name : "Faculty Evaluator";
    } else {
        // Teacher awards grade directly even before formal upload
        asg.submissions.push({
            studentId: studentId,
            studentName: studentName,
            studentRoll: studentRoll,
            department: studentDept,
            submittedAt: new Date().toLocaleString(),
            status: "Graded",
            submissionText: "Direct Faculty Evaluation / Offline Hardcopy Submission",
            fileName: null,
            fileSize: null,
            marksAwarded: mark,
            gradedAt: new Date().toLocaleString(),
            gradedBy: currentUser ? currentUser.name : "Faculty Evaluator",
            feedback: feedback
        });
    }

    saveAssignmentsList(assignments);
    showToast(`Marks saved for ${studentName}: ${mark} / ${asg.maxMarks}`, "success");
    renderGradingStudentTable();
}

// Bulk Award Marks to All Currently Displayed Students
function bulkAwardFullMarks() {
    if (!currentGradingAssignmentId) return;
    const assignments = getAssignmentsList();
    const asg = assignments.find(a => a.id === currentGradingAssignmentId);
    if (!asg) return;

    if (!confirm(`Auto-award full marks (${asg.maxMarks}/${asg.maxMarks}) to all submitted students who are pending review?`)) return;

    let count = 0;
    (asg.submissions || []).forEach(sub => {
        if (sub.marksAwarded === null || sub.marksAwarded === undefined) {
            sub.marksAwarded = asg.maxMarks;
            sub.status = "Graded";
            sub.gradedAt = new Date().toLocaleString();
            sub.gradedBy = currentUser ? currentUser.name : "Faculty Evaluator";
            sub.feedback = sub.feedback || "Satisfies all rubric requirements. Approved.";
            count++;
        }
    });

    saveAssignmentsList(assignments);
    showToast(`Auto-graded ${count} submitted student assignments!`, "success");
    renderGradingStudentTable();
}

/* ====================================================
   STUDENT ASSIGNMENTS CONTROLLER
==================================================== */
let currentStudentSubmittingAsgId = null;

function renderStudentAssignments(studentObj) {
    if (!studentObj) {
        studentObj = (typeof getStudentForUser === 'function')
            ? getStudentForUser(currentUser)
            : (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null);
    }
    if (!studentObj) return;

    const assignments = getAssignmentsList();

    // Filter assignments for student (All or Student's Department)
    const applicable = assignments.filter(a =>
        !a.department || a.department === "All" || a.department === studentObj.department
    );

    // Compute Student Stats
    const totalAssigned = applicable.length;
    let submittedCount = 0;
    let gradedCount = 0;
    let studentScoreSum = 0;
    let studentMaxSum = 0;

    applicable.forEach(asg => {
        const sub = (asg.submissions || []).find(s => s.studentId === studentObj.id);
        if (sub) {
            submittedCount++;
            if (sub.status === 'Graded' && sub.marksAwarded !== null && sub.marksAwarded !== undefined) {
                gradedCount++;
                studentScoreSum += Number(sub.marksAwarded);
                studentMaxSum += Number(asg.maxMarks);
            }
        }
    });

    const pendingCount = totalAssigned - submittedCount;
    const avgScorePct = studentMaxSum > 0 ? Math.round((studentScoreSum / studentMaxSum) * 100) : 0;

    // Update Student KPI Cards
    const studTotalAsg = document.getElementById("studTotalAsg");
    const studSubmittedCount = document.getElementById("studSubmittedCount");
    const studGradedCount = document.getElementById("studGradedCount");
    const studPendingAsg = document.getElementById("studPendingAsg");
    const studAvgAsgScore = document.getElementById("studAvgAsgScore");

    if (studTotalAsg) studTotalAsg.textContent = totalAssigned;
    if (studSubmittedCount) studSubmittedCount.textContent = submittedCount;
    if (studGradedCount) studGradedCount.textContent = gradedCount;
    if (studPendingAsg) studPendingAsg.textContent = pendingCount;
    if (studAvgAsgScore) studAvgAsgScore.textContent = studentMaxSum > 0 ? `${avgScorePct}%` : 'N/A';

    updateAssignmentBadges();

    // Render Student Grid
    const gridContainer = document.getElementById("studentAssignmentsGrid");
    if (!gridContainer) return;

    if (applicable.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: rgba(15, 23, 42, 0.6); border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.1);">
                <div style="font-size: 32px; margin-bottom: 10px;">🎉</div>
                <h3 style="color: #fff; margin-bottom: 6px;">No Active Assignments</h3>
                <p style="color: #94a3b8; font-size: 13px;">You have no pending assignments in your academic queue right now.</p>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = applicable.map(asg => {
        const sub = (asg.submissions || []).find(s => s.studentId === studentObj.id);
        const hasSubmitted = !!sub;
        const isGraded = hasSubmitted && sub.status === 'Graded' && sub.marksAwarded !== null;
        const dueInfo = computeDueStatus(asg.endDate);
        const subjClass = `subj-${(asg.subject || 'programming').toLowerCase()}`;

        // Build individual status block
        let statusBlock = "";

        if (isGraded) {
            const scorePct = Math.round((sub.marksAwarded / asg.maxMarks) * 100);
            statusBlock = `
                <div class="asg-student-score-box">
                    <div class="asg-score-top">
                        <div>
                            <span style="font-size: 11px; font-weight: 800; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.5px;">✓ Evaluated & Marked</span>
                            <div class="asg-score-badge">${sub.marksAwarded} <span style="font-size: 13px; color: #94a3b8;">/ ${asg.maxMarks} (${scorePct}%)</span></div>
                        </div>
                        <span class="fee-status-badge status-paid" style="font-size: 11px;">GRADE RECORDED</span>
                    </div>

                    ${sub.feedback ? `
                        <div class="asg-score-feedback">
                            "<b>Faculty Feedback:</b> ${sub.feedback}"
                            <div style="text-align: right; font-size: 10px; color: #94a3b8; margin-top: 4px;">— ${sub.gradedBy || asg.facultyName}</div>
                        </div>
                    ` : ''}

                    ${sub.fileName ? `
                        <div class="asg-file-pill" onclick="simulateDownloadFile('${sub.fileName}')" title="Your submitted file">
                            <span>📎</span> <b>${sub.fileName}</b> (${sub.fileSize || '1.8 MB'})
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (hasSubmitted) {
            statusBlock = `
                <div class="asg-sub-submitted-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="color: #38bdf8; font-weight: 700;">⏳ Assignment Submitted</span>
                        <span class="asg-due-pill asg-due-soon" style="font-size: 10px;">Awaiting Faculty Marks</span>
                    </div>
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 6px;">
                        Submitted on: <b style="color: #cbd5e1;">${sub.submittedAt || 'Recently'}</b>
                    </div>
                    ${sub.fileName ? `
                        <div class="asg-file-pill" onclick="simulateDownloadFile('${sub.fileName}')">
                            <span>📎</span> <b>${sub.fileName}</b> (${sub.fileSize || '1.2 MB'})
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            statusBlock = `
                <div class="asg-pending-sub-box">
                    <div>
                        <div style="color: #fbbf24; font-weight: 700;">⚠️ Not Yet Submitted</div>
                        <div style="color: #94a3b8; font-size: 11px;">Upload your solution before ${formatDisplayDate(asg.endDate)}</div>
                    </div>
                    <button type="button" class="btn btn-primary btn-sm" onclick="openStudentSubmitModal('${asg.id}')" style="background: linear-gradient(135deg, #10b981, #059669); font-weight: 800;">
                        📤 Submit Now
                    </button>
                </div>
            `;
        }

        return `
            <div class="asg-card" id="stud-asg-${asg.id}">
                <div>
                    <div class="asg-card-top">
                        <span class="asg-subject-pill ${subjClass}">
                            <span>📚</span> ${asg.subject}
                        </span>
                        <span class="asg-marks-badge">Max Score: ${asg.maxMarks}</span>
                    </div>

                    <h3 class="asg-card-title">${asg.title}</h3>
                    <div class="asg-card-desc">${asg.instructions || 'Review the coursework requirements and upload your files.'}</div>

                    <!-- Timeline Bar -->
                    <div class="asg-dates-bar">
                        <div class="asg-date-item">
                            <span class="asg-date-lbl">Start Date</span>
                            <span class="asg-date-val">${formatDisplayDate(asg.startDate)}</span>
                        </div>
                        <span class="asg-date-divider">➔</span>
                        <div class="asg-date-item">
                            <span class="asg-date-lbl">Due Date</span>
                            <span class="asg-date-val">${formatDisplayDate(asg.endDate)}</span>
                        </div>
                        <span class="asg-due-pill ${dueInfo.class}">${dueInfo.label}</span>
                    </div>

                    <!-- Status / Feedback Box -->
                    ${statusBlock}
                </div>

                <div class="asg-card-footer">
                    <div class="asg-faculty-badge">
                        <span>👨‍🏫</span> ${asg.facultyName || 'Faculty Guide'}
                    </div>
                    <div>
                        ${hasSubmitted ? `
                            <button type="button" class="btn btn-outline btn-sm" onclick="openStudentSubmitModal('${asg.id}')" style="font-size: 11px;">
                                🔄 Re-submit Solution
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary btn-sm" onclick="openStudentSubmitModal('${asg.id}')" style="background: linear-gradient(135deg, #10b981, #059669); font-weight: 800; font-size: 12px;">
                                📤 Upload Solution
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

/* ====================================================
   STUDENT SUBMISSION MODAL
==================================================== */
let currentSelectedFile = null;

function openStudentSubmitModal(asgId) {
    currentStudentSubmittingAsgId = asgId;
    const assignments = getAssignmentsList();
    const asg = assignments.find(a => a.id === asgId);
    if (!asg) return;

    const modal = document.getElementById("studentSubmitModal");
    if (!modal) return;

    document.getElementById("submitModalTitle").textContent = asg.title;
    document.getElementById("submitModalMeta").innerHTML = `
        <span class="asg-subject-pill subj-${asg.subject.toLowerCase()}">${asg.subject}</span>
        <span>Max Marks: <b>${asg.maxMarks}</b></span> &bull;
        <span>Due Date: <b style="color: #fbbf24;">${formatDisplayDate(asg.endDate)}</b></span>
    `;
    document.getElementById("submitModalInstructions").textContent = asg.instructions || "Please submit your solution.";

    const currStudent = (typeof getStudentForUser === 'function')
        ? getStudentForUser(currentUser)
        : (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null);

    const prevSub = currStudent ? (asg.submissions || []).find(s => s.studentId === currStudent.id) : null;

    if (prevSub) {
        document.getElementById("submitNotesInput").value = prevSub.submissionText || "";
        document.getElementById("selectedFileName").textContent = prevSub.fileName ? `Selected file: ${prevSub.fileName}` : "";
        currentSelectedFile = prevSub.fileName ? { name: prevSub.fileName, sizeStr: prevSub.fileSize || "1.5 MB" } : null;
    } else {
        document.getElementById("submitNotesInput").value = "";
        document.getElementById("selectedFileName").textContent = "";
        currentSelectedFile = null;
    }

    modal.classList.add("active");
}

function closeStudentSubmitModal() {
    const modal = document.getElementById("studentSubmitModal");
    if (modal) modal.classList.remove("active");
    currentStudentSubmittingAsgId = null;
    currentSelectedFile = null;
}

function handleFileInputChange(e) {
    const file = e.target.files[0];
    if (file) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        currentSelectedFile = {
            name: file.name,
            sizeStr: `${sizeMb} MB`
        };
        const labelEl = document.getElementById("selectedFileName");
        if (labelEl) {
            labelEl.textContent = `Selected: ${file.name} (${currentSelectedFile.sizeStr})`;
            labelEl.style.color = "#34d399";
        }
    }
}

function handleStudentSubmission(e) {
    if (e) e.preventDefault();

    if (!currentStudentSubmittingAsgId) return;

    const currStudent = (typeof getStudentForUser === 'function')
        ? getStudentForUser(currentUser)
        : (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null);

    if (!currStudent) {
        showToast("Student profile not found.", "warning");
        return;
    }

    const notes = document.getElementById("submitNotesInput").value.trim();

    if (!notes && !currentSelectedFile) {
        showToast("Please provide solution comments/notes or attach a solution file.", "warning");
        return;
    }

    const assignments = getAssignmentsList();
    const asg = assignments.find(a => a.id === currentStudentSubmittingAsgId);
    if (!asg) return;

    if (!asg.submissions) asg.submissions = [];
    const existingIdx = asg.submissions.findIndex(s => s.studentId === currStudent.id);

    const submissionRecord = {
        studentId: currStudent.id,
        studentName: currStudent.name,
        studentRoll: currStudent.rollNo,
        department: currStudent.department,
        submittedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: existingIdx !== -1 && asg.submissions[existingIdx].status === 'Graded' ? 'Graded' : 'Submitted',
        submissionText: notes || "Solution uploaded by student.",
        fileName: currentSelectedFile ? currentSelectedFile.name : (currStudent.name.toLowerCase().replace(/\s+/g, '_') + '_assignment_submission.pdf'),
        fileSize: currentSelectedFile ? currentSelectedFile.sizeStr : "1.8 MB",
        marksAwarded: existingIdx !== -1 ? asg.submissions[existingIdx].marksAwarded : null,
        gradedAt: existingIdx !== -1 ? asg.submissions[existingIdx].gradedAt : null,
        gradedBy: existingIdx !== -1 ? asg.submissions[existingIdx].gradedBy : null,
        feedback: existingIdx !== -1 ? asg.submissions[existingIdx].feedback : ""
    };

    if (existingIdx !== -1) {
        asg.submissions[existingIdx] = submissionRecord;
    } else {
        asg.submissions.push(submissionRecord);
    }

    saveAssignmentsList(assignments);
    showToast(`Assignment "${asg.title}" submitted successfully!`, "success");

    closeStudentSubmitModal();
    renderStudentAssignments(currStudent);
}

// Simulate viewing/downloading an attachment file
function simulateDownloadFile(fileName) {
    showToast(`Opening / Downloading submission asset: ${fileName}`, "info");
}
