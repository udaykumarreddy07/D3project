/* ====================================================
   APPLICATION CONTROLLER, CRUD & INITIALIZATION
==================================================== */
function openAddStudentModal() {
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can add student records.", "danger");
        return;
    }

    d3.select("#modalTitle").text("Add New Student Record");
    d3.select("#editStudentId").property("value", "");
    d3.select("#studentName").property("value", "");
    d3.select("#studentDepartment").property("value", "CSE");
    d3.select("#studentGender").property("value", "Male");
    d3.select("#studentAttendance").property("value", "85");
    d3.select("#markMaths").property("value", "");
    d3.select("#markScience").property("value", "");
    d3.select("#markEnglish").property("value", "");
    d3.select("#markProgramming").property("value", "");
    d3.select("#previewGrade").text("Avg: 0.0 | Status: -");
    d3.select("#saveButton").text("Save Record");

    d3.select("#studentModal").classed("active", true);
    const nameEl = document.getElementById("studentName");
    if (nameEl) nameEl.focus();
}

function editStudent(id) {
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can edit student records.", "danger");
        return;
    }

    const student = students.find(s => s.id === id);
    if (!student) return;

    d3.select("#modalTitle").text("Edit Student Academic Record");
    d3.select("#editStudentId").property("value", student.id);
    d3.select("#studentName").property("value", student.name);
    d3.select("#studentDepartment").property("value", student.department);
    d3.select("#studentGender").property("value", student.gender);
    d3.select("#studentAttendance").property("value", student.attendance);
    d3.select("#markMaths").property("value", student.maths);
    d3.select("#markScience").property("value", student.science);
    d3.select("#markEnglish").property("value", student.english);
    d3.select("#markProgramming").property("value", student.programming);

    updateGradePreview();
    d3.select("#saveButton").text("Update Record");
    d3.select("#studentModal").classed("active", true);
}

function deleteStudent(id) {
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can delete student records.", "danger");
        return;
    }

    const student = students.find(s => s.id === id);
    if (!student) return;

    if (confirm(`Permanently delete student record #${student.id} (${student.name})?`)) {
        students = students.filter(s => s.id !== id);
        if (typeof currentSelectedStudentId !== 'undefined' && currentSelectedStudentId === id) {
            currentSelectedStudentId = students.length > 0 ? students[0].id : null;
        }
        saveDataToStorage();
        if (typeof initStudentSelector === 'function') initStudentSelector();
        updateDashboard();
        showToast(`Deleted student #${id}`, "danger");
    }
}

function closeStudentModal() {
    d3.select("#studentModal").classed("active", false);
}

function updateGradePreview() {
    const maths = Number(d3.select("#markMaths").property("value")) || 0;
    const science = Number(d3.select("#markScience").property("value")) || 0;
    const english = Number(d3.select("#markEnglish").property("value")) || 0;
    const programming = Number(d3.select("#markProgramming").property("value")) || 0;

    const total = maths + science + english + programming;
    const avg = total / 4;
    const status = computeStatus(maths, science, english, programming);
    const grade = computeGrade(avg, status);

    d3.select("#previewGrade").html(`
        Total: <b>${total} / 400</b> | Pct: <b>${d3.format(".2f")(avg)}%</b> | Status: <b style="color:${status === 'Pass' ? '#10b981' : '#ef4444'}">${status}</b> | Grade: <b>${grade}</b>
    `);
}

// Backward compatibility alias for modal preview
window.calculateModalPreview = updateGradePreview;

function handleSaveStudent(e) {
    if (e) e.preventDefault();

    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can modify student records.", "danger");
        return;
    }

    const editId = d3.select("#editStudentId").property("value");
    const name = d3.select("#studentName").property("value").trim();
    const department = d3.select("#studentDepartment").property("value");
    const gender = d3.select("#studentGender").property("value");
    const attendance = Number(d3.select("#studentAttendance").property("value")) || 0;
    const maths = Number(d3.select("#markMaths").property("value")) || 0;
    const science = Number(d3.select("#markScience").property("value")) || 0;
    const english = Number(d3.select("#markEnglish").property("value")) || 0;
    const programming = Number(d3.select("#markProgramming").property("value")) || 0;

    if (attendance < 0 || attendance > 100 || maths < 0 || maths > 100 || science < 0 || science > 100 || english < 0 || english > 100 || programming < 0 || programming > 100) {
        showToast("Marks and attendance must be between 0 and 100.", "warning");
        return;
    }

    if (editId) {
        const student = students.find(s => s.id === parseInt(editId));
        if (student) {
            student.name = name;
            student.department = department;
            student.gender = gender;
            student.attendance = attendance;
            student.maths = maths;
            student.science = science;
            student.english = english;
            student.programming = programming;
            recalculateStudent(student);
            showToast(`Updated record for ${name}`, "success");
        }
    } else {
        const nextId = students.length > 0 ? (d3.max(students, d => d.id) + 1) : 1;
        const deptCodes = { "CSE": "05", "ECE": "04", "EEE": "02", "MECH": "03", "CIVIL": "01" };
        const deptCode = deptCodes[department] || "05";
        const rollNo = `22A91A${deptCode}${String(nextId).padStart(2, '0')}`;
        const newStudent = {
            id: nextId,
            rollNo: rollNo,
            name,
            department,
            gender,
            attendance,
            maths,
            science,
            english,
            programming
        };
        recalculateStudent(newStudent);
        students.push(newStudent);
        showToast(`Added new student ${name}`, "success");
    }

    saveDataToStorage();
    if (typeof initStudentSelector === 'function') initStudentSelector();
    closeStudentModal();
    updateDashboard();
}

function simulateRealtimePush() {
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Real-time event trigger is restricted to faculty.", "warning");
        return;
    }

    if (students.length === 0) return;

    const randomIndex = Math.floor(Math.random() * students.length);
    const targetStudent = students[randomIndex];
    const subjects = ['maths', 'science', 'english', 'programming'];
    const randomSub = subjects[Math.floor(Math.random() * subjects.length)];

    const oldMark = targetStudent[randomSub];
    const delta = (Math.floor(Math.random() * 9) - 3);
    const newMark = Math.min(100, Math.max(25, oldMark + (delta === 0 ? 3 : delta)));

    targetStudent[randomSub] = newMark;
    recalculateAllMetrics();
    saveDataToStorage();
    updateDashboard();

    const subTitle = randomSub.charAt(0).toUpperCase() + randomSub.slice(1);
    showToast(`⚡ Live Push: ${targetStudent.name} (${targetStudent.department}) ${subTitle} updated to ${newMark}`, "info");
}

function openNoticesModalOrTab() {
    if (currentUser && currentUser.role === 'Student') {
        if (typeof switchStudentTab === 'function') switchStudentTab('notices');
    } else {
        if (typeof switchViewTab === 'function') switchViewTab('broadcast');
    }
}

function updateDashboard() {
    const isStudent = currentUser && currentUser.role === 'Student';

    if (isStudent) {
        d3.select("#facultyDashboardView").style("display", "none");
        d3.select("#studentDashboardView").style("display", "block");
        const studentObj = (typeof getStudentForUser === 'function') ? getStudentForUser(currentUser) : (students.find(s => s.id === 4) || students[0]);
        if (studentObj) {
            if (typeof renderStudentDashboard === 'function') {
                renderStudentDashboard(studentObj);
            }
            if (typeof renderStudentFeesView === 'function') {
                renderStudentFeesView(studentObj);
            }
            if (typeof renderStudentAssignments === 'function') {
                renderStudentAssignments(studentObj);
            }
        }
        if (typeof renderNoticesGrid === 'function') {
            renderNoticesGrid();
        }
        if (typeof updateAssignmentBadges === 'function') {
            updateAssignmentBadges();
        }
    } else {
        d3.select("#facultyDashboardView").style("display", "block");
        d3.select("#studentDashboardView").style("display", "none");
        const data = getFilteredData();
        updateKPIs(data, false);
        updateTable(data, false);
        renderFacultyVisualizations(data);
        if (typeof renderFacultyFeeMonitor === 'function') {
            renderFacultyFeeMonitor();
        }
        if (typeof renderFacultyAssignments === 'function') {
            renderFacultyAssignments();
        }
        if (typeof renderNoticesGrid === 'function') {
            renderNoticesGrid();
        }
        if (typeof updateAssignmentBadges === 'function') {
            updateAssignmentBadges();
        }
    }
}

// Attach Event Listeners
d3.select("#departmentFilter").on("change", updateDashboard);
d3.select("#genderFilter").on("change", updateDashboard);
d3.select("#statusFilter").on("change", updateDashboard);
d3.select("#gradeFilter").on("change", updateDashboard);
d3.select("#searchInput").on("input", updateDashboard);

d3.select("#studentModal").on("click", function (e) {
    if (e.target === this) closeStudentModal();
});

d3.select("#progressCardModal").on("click", function (e) {
    if (e.target === this) closeProgressCardModal();
});

d3.select(window).on("resize", () => {
    updateDashboard();
});

// Initialize App
initializeData();
updateTableHeaders();
initStudentSelector();
if (students.length > 0) {
    const initStudent = students.find(s => s.id === 4) || students[0];
    populateMarksheet(initStudent);
    syncSimulatorInputs(initStudent);
    if (typeof renderStudentFeesView === 'function') {
        renderStudentFeesView(initStudent);
    }
}
if (typeof renderFacultyFeeMonitor === 'function') {
    renderFacultyFeeMonitor();
}
checkInitialAuth();
if (typeof initAiExplainer === 'function') initAiExplainer();

