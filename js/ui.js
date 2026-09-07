/* ====================================================
   UI CONTROLLER, KPI STATS, DATA TABLE, TABS & QUICK FILTERS
==================================================== */

let currentActiveViewTab = 'all'; // 'all' | 'analytics' | 'marksheet' | 'table'

function showTooltip(event, text) {
    let pageX = event.pageX;
    let pageY = event.pageY;
    if (event.touches && event.touches.length > 0) {
        pageX = event.touches[0].pageX;
        pageY = event.touches[0].pageY;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
        pageX = event.changedTouches[0].pageX;
        pageY = event.changedTouches[0].pageY;
    }

    const tt = tooltip.node();
    tooltip
        .style("opacity", 1)
        .html(text);

    const ttWidth = tt ? (tt.offsetWidth || 280) : 280;
    const winWidth = window.innerWidth;

    let left = (pageX || 100) + 14;
    let top = (pageY || 100) - 28;

    if (left + ttWidth > winWidth - 20) {
        left = Math.max(10, (pageX || 100) - ttWidth - 14);
    }
    if (top < 10) {
        top = (pageY || 100) + 20;
    }

    tooltip
        .style("left", left + "px")
        .style("top", top + "px");
}

function hideTooltip() {
    tooltip.style("opacity", 0);
}

function openColorGuideModal() {
    d3.select("#colorGuideModal").classed("active", true);
}

function closeColorGuideModal() {
    d3.select("#colorGuideModal").classed("active", false);
}

function showToast(message, type = "info") {
    const container = d3.select("#toastContainer");
    let icon = "ℹ️";
    if (type === "success") icon = "🎓";
    if (type === "danger") icon = "🗑️";
    if (type === "warning") icon = "⚠️";

    const toast = container.append("div")
        .attr("class", `toast toast-${type}`)
        .html(`<span>${icon}</span> <span>${message}</span>`);

    setTimeout(() => {
        toast
            .style("transition", "all 0.3s ease")
            .style("opacity", "0")
            .style("transform", "translateX(100%)");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Switch between Main Navigation Views: All Information / Analytics / Marksheet Hub / Master Table
function switchViewTab(tab) {
    currentActiveViewTab = tab;

    d3.selectAll(".vertical-nav-btn, .nav-view-btn").classed("active", false);
    d3.select(`#tabView-${tab}`).classed("active", true);

    const analyticsSection = d3.select("#analyticsSection");
    const marksheetSection = d3.select("#marksheetHubSection");
    const tableSection = d3.select("#tableSection");

    const student = students.find(s => s.id === currentSelectedStudentId) || students[0];

    if (tab === 'all') {
        analyticsSection.style("display", "block");
        marksheetSection.style("display", "block");
        tableSection.style("display", "block");
        if (student) {
            initStudentSelector();
            populateMarksheet(student);
            syncSimulatorInputs(student);
        }
    } else if (tab === 'analytics') {
        analyticsSection.style("display", "block");
        marksheetSection.style("display", "none");
        tableSection.style("display", "block");
        const el = document.getElementById("analyticsSection");
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'marksheet') {
        analyticsSection.style("display", "none");
        marksheetSection.style("display", "block");
        tableSection.style("display", "none");
        if (student) {
            initStudentSelector();
            populateMarksheet(student);
            syncSimulatorInputs(student);
        }
        const el = document.getElementById("marksheetHubSection");
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'table') {
        analyticsSection.style("display", "none");
        marksheetSection.style("display", "none");
        tableSection.style("display", "block");
        const el = document.getElementById("tableSection");
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Quick Filter Pills Handler
function applyQuickFilter(filterType, val) {
    d3.selectAll(".quick-filter-pill").classed("active", false);

    if (filterType === 'all') {
        resetFilters();
        d3.select("#pill-all").classed("active", true);
        showToast("Showing all cohort records", "info");
        return;
    }

    if (filterType === 'dept') {
        d3.select("#departmentFilter").property("value", val);
        d3.select(`#pill-dept-${val}`).classed("active", true);
        showToast(`Filtered to ${val} Department`, "info");
    } else if (filterType === 'status') {
        d3.select("#statusFilter").property("value", val);
        d3.select(`#pill-status-${val.toLowerCase()}`).classed("active", true);
        showToast(`Filtered to ${val} students`, "info");
    } else if (filterType === 'topper') {
        d3.select("#gradeFilter").property("value", "O");
        d3.select("#pill-toppers").classed("active", true);
        showToast("Filtered to Top Rankers (Grade O, ≥90%)", "info");
    } else if (filterType === 'attendance') {
        // Special search / filter for low attendance
        d3.select("#statusFilter").property("value", "All");
        d3.select("#pill-low-att").classed("active", true);
        showToast("Showing students with Attendance Shortage (<75%)", "warning");
    }

    updateDashboard();
}

function updateKPIs(data, isStudent) {
    let kpiList = [];

    if (isStudent && data.length > 0) {
        const student = data[0];
        kpiList = [
            { id: 1, icon: "📊", title: "My Total Percentage", value: `${d3.format(".2f")(student.average)}%`, subtext: `Grand Total: ${student.total} / 400 Marks` },
            { id: 2, icon: "📈", title: "Semester SGPA", value: `${student.gpa} / 10`, subtext: student.division },
            { id: 3, icon: student.status === "Pass" ? "🟢" : "🔴", title: "Result & Grade", value: `${student.status.toUpperCase()} (Gr. ${student.grade})`, subtext: student.status === "Pass" ? "Passed all 4 subjects" : "Below 35 in 1+ subjects" },
            { id: 4, icon: "⏱", title: "My Attendance", value: `${student.attendance}%`, subtext: student.attendance >= 75 ? "Eligible for Exams" : "⚠️ Attendance Shortage" },
            { id: 5, icon: "🏫", title: "My Department", value: student.department, subtext: `${DEPT_NAMES[student.department] || 'Engineering'}` },
            { id: 6, icon: "📜", title: "Credits Earned", value: `${student.status === "Pass" ? "16.0" : (student.creditsEarned || "12.0")} / 16`, subtext: "CBCS 10-point scheme" }
        ];

        // Sidebar Snapshot
        d3.select("#sidebarTotalEnrolled").text("Personal Record");
        d3.select("#sidebarClassMean").text(`${d3.format(".2f")(student.average)}%`);
        d3.select("#sidebarPassClearance").text(student.status.toUpperCase());
        d3.select("#sidebarAvgAttendance").text(`${student.attendance}%`);
    } else {
        const total = data.length;
        const average = total === 0 ? 0 : d3.mean(data, d => d.average);
        const passedCount = data.filter(d => d.status === "Pass").length;
        const passPercentage = total === 0 ? 0 : (passedCount / total) * 100;
        const attendance = total === 0 ? 0 : d3.mean(data, d => d.attendance);
        const failCount = total - passedCount;

        // Top student finder
        let topperName = "-";
        let topperScore = "-";
        if (data.length > 0) {
            const topStudent = [...data].sort((a, b) => b.average - a.average)[0];
            if (topStudent) {
                topperName = topStudent.name;
                topperScore = `${d3.format(".1f")(topStudent.average)}% (SGPA: ${topStudent.gpa})`;
            }
        }

        kpiList = [
            { id: 1, icon: "👥", title: "Total Students", value: total, subtext: `${students.length} total cohort enrolled` },
            { id: 2, icon: "📊", title: "Cohort Total %", value: `${d3.format(".2f")(average)}%`, subtext: "Mean aggregate score" },
            { id: 3, icon: "🎓", title: "Passed Students", value: `${passedCount} (${d3.format(".1f")(passPercentage)}%)`, subtext: `${passedCount} of ${total} passed (&ge;35)` },
            { id: 4, icon: "⏱", title: "Avg Attendance", value: `${d3.format(".1f")(attendance)}%`, subtext: "Cohort attendance rate" },
            { id: 5, icon: "🌟", title: "Cohort Topper", value: topperName, subtext: topperScore },
            { id: 6, icon: failCount > 0 ? "⚠️" : "✅", title: "Arrears / Remedials", value: `${failCount} Students`, subtext: failCount > 0 ? "Require remedial tutoring" : "100% Pass Clearance" }
        ];

        // Sidebar Snapshot
        d3.select("#sidebarTotalEnrolled").text(`${total} Students`);
        d3.select("#sidebarClassMean").text(`${d3.format(".1f")(average)}%`);
        d3.select("#sidebarPassClearance").text(`${passedCount}/${total} (${d3.format(".0f")(passPercentage)}%)`);
        d3.select("#sidebarAvgAttendance").text(`${d3.format(".1f")(attendance)}%`);
    }

    kpiList.forEach(k => {
        d3.select(`#kpiIcon${k.id}`).text(k.icon);
        d3.select(`#kpiTitle${k.id}`).text(k.title);
        d3.select(`#kpiValue${k.id}`).text(k.value);
        d3.select(`#kpiSubtext${k.id}`).html(k.subtext);
    });
}

function updateTable(data, isStudent) {
    const tableBody = d3.select("#studentTable");

    if (isStudent) {
        d3.select("#tableSectionHeading").text("📋 My Academic Evaluation & Marksheet");
        d3.select("#tableRecordCount").html(`Displaying personal record for <b>${currentUser.name}</b>`);
        d3.select("#thActions").style("display", "none");
    } else {
        d3.select("#tableSectionHeading").text("📋 Student Academic Records & Progress Cards");
        d3.select("#tableRecordCount").html(`Displaying <b>${data.length}</b> of <b>${students.length}</b> students`);
        d3.select("#thActions").style("display", "");
    }

    if (data.length === 0) {
        tableBody.selectAll("tr").remove();
        tableBody.append("tr")
            .append("td")
            .attr("colspan", isStudent ? 14 : 15)
            .style("text-align", "center")
            .style("padding", "30px")
            .style("color", "#64748b")
            .html("No matching records found.");
        return;
    }

    const maxAverage = d3.max(students, d => d.average);

    const rows = tableBody.selectAll("tr")
        .data(data, d => d.id)
        .join(
            enter => enter.append("tr")
                .style("opacity", 0)
                .call(enter => enter.transition().duration(250).style("opacity", 1)),
            update => update,
            exit => exit.remove()
        );

    rows.html(d => {
        let tags = '';
        if (d.average === maxAverage && maxAverage > 0 && d.status === "Pass") {
            tags += '<span class="tag-topper">🌟 Topper</span>';
        }
        if (d.attendance < 75) {
            tags += '<span class="tag-low-att">⚠️ Low Att.</span>';
        }

        const attColor = d.attendance >= 85 ? '#34d399' : d.attendance >= 75 ? '#fbbf24' : '#fb7185';
        const actionsHtml = !isStudent ? `
            <td style="text-align: center;">
                <div class="actions-cell">
                    <button type="button" class="btn-action-icon" title="Edit Student Record" onclick="editStudent(${d.id})">✏️</button>
                    <button type="button" class="btn-action-icon btn-action-delete" title="Delete Student" onclick="deleteStudent(${d.id})">🗑️</button>
                </div>
            </td>
        ` : '';

        return `
            <td style="font-weight: 800; text-align: center; color: #818cf8;">#${d.id}</td>
            <td style="font-weight: 700;">${d.name} ${tags}</td>
            <td style="text-align: center;"><span class="badge badge-dept">${d.department}</span></td>
            <td style="text-align: center;">${d.gender}</td>
            <td style="text-align: center; font-family: 'Space Grotesk', monospace; font-weight: 700;">${formatSubjectScore(d.maths)}</td>
            <td style="text-align: center; font-family: 'Space Grotesk', monospace; font-weight: 700;">${formatSubjectScore(d.science)}</td>
            <td style="text-align: center; font-family: 'Space Grotesk', monospace; font-weight: 700;">${formatSubjectScore(d.english)}</td>
            <td style="text-align: center; font-family: 'Space Grotesk', monospace; font-weight: 700;">${formatSubjectScore(d.programming)}</td>
            <td style="font-weight: 800; text-align: center; color: #e2e8f0; font-family: 'Space Grotesk', monospace;">${d.total} / 400</td>
            <td style="text-align: center;"><span class="badge-percentage">${d3.format(".2f")(d.average)}%</span></td>
            <td style="text-align: center;"><span style="color:${attColor}; font-weight:800; font-family: 'Space Grotesk', monospace;">${d.attendance}%</span></td>
            <td style="text-align: center;"><span class="badge ${d.status === 'Pass' ? 'status-pass' : 'status-fail'}">${d.status === 'Pass' ? 'PASS' : 'FAIL'}</span></td>
            <td style="text-align: center;"><span class="badge grade-${d.grade}">Gr. ${d.grade}</span></td>
            <td style="text-align: center;">
                <button type="button" class="btn-progress-card" 
                        onclick="openProgressCard(${d.id})"
                        title="View Official University Marksheet">
                    🎓 Marksheet
                </button>
            </td>
            ${actionsHtml}
        `;
    });
}

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    updateTableHeaders();
    updateDashboard();
}

function updateTableHeaders() {
    d3.selectAll("#tableHeaderRow th").classed("sorted-asc", false).classed("sorted-desc", false);
    const headerCols = {
        id: 0, name: 1, department: 2, gender: 3,
        maths: 4, science: 5, english: 6, programming: 7,
        total: 8, average: 9, percentage: 9, attendance: 10, status: 11, grade: 12
    };
    const idx = headerCols[sortColumn];
    if (idx !== undefined) {
        d3.selectAll("#tableHeaderRow th").filter((d, i) => i === idx)
            .classed(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc', true);
    }
}

function getFilteredData() {
    if (currentUser && currentUser.role === 'Student') {
        const myStudent = getStudentForUser(currentUser);
        return myStudent ? [myStudent] : [];
    }

    const department = d3.select("#departmentFilter").node() ? d3.select("#departmentFilter").property("value") : "All";
    const gender = d3.select("#genderFilter").node() ? d3.select("#genderFilter").property("value") : "All";
    const status = d3.select("#statusFilter").node() ? d3.select("#statusFilter").property("value") : "All";
    const grade = d3.select("#gradeFilter").node() ? d3.select("#gradeFilter").property("value") : "All";
    const search = d3.select("#searchInput").node() ? d3.select("#searchInput").property("value").toLowerCase().trim() : "";

    let filtered = students.filter(student => {
        const matchesDept = (department === "All" || student.department === department);
        const matchesGender = (gender === "All" || student.gender === gender);
        const matchesStatus = (status === "All" || student.status === status);
        const matchesGrade = (grade === "All" || student.grade === grade);
        const matchesSearch = student.name.toLowerCase().includes(search) || String(student.id).includes(search);
        return matchesDept && matchesGender && matchesStatus && matchesGrade && matchesSearch;
    });

    // Check if Low Attendance quick filter is active
    if (d3.select("#pill-low-att").classed("active")) {
        filtered = filtered.filter(s => s.attendance < 75);
    }

    return filtered;
}

function resetFilters() {
    d3.select("#departmentFilter").property("value", "All");
    d3.select("#genderFilter").property("value", "All");
    d3.select("#statusFilter").property("value", "All");
    d3.select("#gradeFilter").property("value", "All");
    d3.select("#searchInput").property("value", "");
    d3.selectAll(".quick-filter-pill").classed("active", false);
    d3.select("#pill-all").classed("active", true);
    updateDashboard();
}

function exportToCSV() {
    const data = getFilteredData();
    if (data.length === 0) {
        showToast("No student records available to export.", "warning");
        return;
    }

    const headers = ["ID", "Name", "Department", "Gender", "Maths", "Science", "English", "Programming", "Total_400", "Percentage", "Attendance_Pct", "Status", "Grade", "Division"];
    const rows = data.map(s => [
        s.id,
        `"${s.name}"`,
        s.department,
        s.gender,
        s.maths,
        s.science,
        s.english,
        s.programming,
        s.total,
        s.average.toFixed(2),
        s.attendance,
        s.status,
        s.grade,
        `"${s.division}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Academic_Students_Evaluation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${data.length} student records to CSV!`, "success");
}
