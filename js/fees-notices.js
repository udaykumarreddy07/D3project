/* ====================================================
   FEE PAYMENT PORTAL & NOTIFICATION BROADCAST CONTROLLER
   Full Student Self-Service & Faculty Cohort Administration
==================================================== */

// --- Default Institutional Notices ---
const DEFAULT_NOTICES = [
    {
        id: 1,
        title: "Autonomous Semester-End Exam Hall Ticket & Registration",
        category: "exam",
        priority: "urgent",
        date: "Today, 10:15 AM",
        body: "Registration for Autonomous End Semester Examinations is now open. Students must ensure minimum 75% biometric attendance and zero outstanding fee dues to generate digital hall tickets.",
        sender: "Prof. Rajesh Sharma (Controller of Examinations)",
        target: "All Cohorts"
    },
    {
        id: 2,
        title: "Semester VI Tuition & Autonomous Computing Lab Fee Clearance",
        category: "fee",
        priority: "urgent",
        date: "Yesterday, 02:40 PM",
        body: "The online fee portal is open for Semester VI. Students with pending examination or lab fees are advised to clear them online to receive instant digital receipts and exam clearance.",
        sender: "Accounts & Finance Section",
        target: "All Students"
    },
    {
        id: 3,
        title: "Project Viva-Voce & Technical Seminar Schedule Released",
        category: "academic",
        priority: "normal",
        date: "2 days ago",
        body: "Departmental project presentations and external viva examinations commence next week. Review project rubrics in the Academic Dossier and consult faculty guides.",
        sender: "Dean Academics & Head of Departments",
        target: "Final Year / Sem VI"
    }
];

// Helper to get or set notices
function getNoticesList() {
    const raw = (typeof safeGetItem === 'function') ? safeGetItem('portal_notices_v1') : localStorage.getItem('portal_notices_v1');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) { }
    }
    return DEFAULT_NOTICES;
}

function saveNoticesList(notices) {
    if (typeof safeSetItem === 'function') {
        safeSetItem('portal_notices_v1', JSON.stringify(notices));
    } else {
        localStorage.setItem('portal_notices_v1', JSON.stringify(notices));
    }
}

// Helper to get or set student fees database
function getStudentFeesDatabase() {
    const raw = (typeof safeGetItem === 'function') ? safeGetItem('portal_student_fees_v1') : localStorage.getItem('portal_student_fees_v1');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') return parsed;
        } catch (e) { }
    }
    return {};
}

function saveStudentFeesDatabase(data) {
    if (typeof safeSetItem === 'function') {
        safeSetItem('portal_student_fees_v1', JSON.stringify(data));
    } else {
        localStorage.setItem('portal_student_fees_v1', JSON.stringify(data));
    }
}

// Generate default fee records for a student
function getFeeDetailsForStudent(studentId) {
    studentId = Number(studentId) || 4;
    const db = getStudentFeesDatabase();
    if (db[studentId]) return db[studentId];

    // Standard fee structure per student
    const isExamDue = (studentId === 4 || studentId % 5 === 0);

    const feeProfile = {
        studentId: studentId,
        items: [
            {
                key: 'tuition',
                name: 'Semester VI Tuition & Academic Fee',
                category: 'Academic',
                amount: 65000,
                status: 'PAID',
                paidDate: '15 Jan 2026',
                txnId: `BIET-TXN-${100000 + Number(studentId)}`,
                receiptNo: `REC-2026-${String(studentId).padStart(4, '0')}-01`
            },
            {
                key: 'exam',
                name: 'Autonomous Examination & Valuation Fee',
                category: 'Examinations',
                amount: 2500,
                status: isExamDue ? 'DUE' : 'PAID',
                paidDate: isExamDue ? null : '20 Feb 2026',
                txnId: isExamDue ? null : `BIET-TXN-${200000 + Number(studentId)}`,
                receiptNo: isExamDue ? null : `REC-2026-${String(studentId).padStart(4, '0')}-02`
            },
            {
                key: 'lab',
                name: 'Autonomous Computing & High-Perf AI Lab Fee',
                category: 'Laboratories',
                amount: 4000,
                status: 'PAID',
                paidDate: '18 Jan 2026',
                txnId: `BIET-TXN-${300000 + Number(studentId)}`,
                receiptNo: `REC-2026-${String(studentId).padStart(4, '0')}-03`
            },
            {
                key: 'library',
                name: 'IEEE Digital Consortium & Library Membership',
                category: 'Facilities',
                amount: 1500,
                status: 'PAID',
                paidDate: '12 Jan 2026',
                txnId: `BIET-TXN-${400000 + Number(studentId)}`,
                receiptNo: `REC-2026-${String(studentId).padStart(4, '0')}-04`
            },
            {
                key: 'placement',
                name: 'Campus Placement & Corporate Readiness Training',
                category: 'Career Development',
                amount: 1000,
                status: 'PAID',
                paidDate: '10 Jan 2026',
                txnId: `BIET-TXN-${500000 + Number(studentId)}`,
                receiptNo: `REC-2026-${String(studentId).padStart(4, '0')}-05`
            }
        ]
    };

    db[studentId] = feeProfile;
    saveStudentFeesDatabase(db);
    return feeProfile;
}

// ----------------------------------------------------
// 1. NOTIFICATIONS ENGINE
// ----------------------------------------------------
function renderNoticesTicker() {
    const notices = getNoticesList();
    const latest = notices[0];
    const tickerEl = document.getElementById("portalTickerText");
    if (tickerEl && latest) {
        tickerEl.innerHTML = `<b>[${latest.priority.toUpperCase()}]</b> ${latest.title} &bull; <span style="color:#94a3b8;">${latest.sender}</span>`;
    }
    const badgeEl = document.getElementById("headerNoticeBadge");
    if (badgeEl) badgeEl.innerText = notices.length;
    const studBadge = document.getElementById("studUnreadNoticesBadge");
    if (studBadge) studBadge.innerText = notices.length;
}

function renderNoticesGrid(filter = 'all') {
    const notices = getNoticesList();
    const filtered = (filter === 'all') ? notices : notices.filter(n => n.category === filter);

    const renderToContainer = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; padding: 30px; text-align: center; color: #94a3b8;">No notices found for category '${filter}'.</div>`;
            return;
        }

        container.innerHTML = filtered.map(n => `
            <div class="notice-card ${n.category} ${n.priority === 'urgent' ? 'urgent' : ''}">
                <div class="notice-header-row">
                    <span class="notice-tag-badge tag-${n.category}">${n.category}</span>
                    <span class="notice-time">${n.date}</span>
                </div>
                <h3 class="notice-title">${n.title}</h3>
                <p class="notice-body">${n.body}</p>
                <div class="notice-footer">
                    <span class="notice-sender">📢 ${n.sender}</span>
                    <span style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px;">Target: ${n.target}</span>
                </div>
            </div>
        `).join('');
    };

    renderToContainer("studentNoticesGrid");
    renderToContainer("facultyNoticesGrid");
    renderNoticesTicker();
}

function openBroadcastModal() {
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can broadcast announcements.", "warning");
        return;
    }
    const modal = document.getElementById("broadcastNoticeModal");
    if (modal) modal.classList.add("active");
}

function closeBroadcastModal() {
    const modal = document.getElementById("broadcastNoticeModal");
    if (modal) modal.classList.remove("active");
}

function handleBroadcastNoticeSubmit(e) {
    if (e) e.preventDefault();
    if (!currentUser || currentUser.role !== 'Faculty') {
        showToast("Access Denied: Only faculty can broadcast announcements.", "warning");
        return;
    }

    const title = document.getElementById("noticeTitleInput")?.value?.trim();
    const category = document.getElementById("noticeCategoryInput")?.value || 'academic';
    const priority = document.getElementById("noticePriorityInput")?.value || 'normal';
    const target = document.getElementById("noticeTargetInput")?.value || 'All Cohorts';
    const body = document.getElementById("noticeBodyInput")?.value?.trim();

    if (!title || !body) {
        showToast("Please provide both title and announcement details.", "warning");
        return;
    }

    const newNotice = {
        id: Date.now(),
        title,
        category,
        priority,
        date: "Just Now",
        body,
        sender: `${currentUser.name} (${currentUser.department})`,
        target
    };

    const notices = getNoticesList();
    notices.unshift(newNotice);
    saveNoticesList(notices);

    closeBroadcastModal();
    renderNoticesGrid();

    // Reset Form
    const form = document.getElementById("broadcastNoticeForm");
    if (form) form.reset();

    showToast(`📢 Announcement Broadcasted to ${target}!`, "success");
}

// ----------------------------------------------------
// 2. STUDENT FEES ENGINE & INSTANT PAYMENT GATEWAY
// ----------------------------------------------------
let activePayItem = null;
let currentStudentFeeFilter = 'all';

function renderStudentFeesView(student, filter) {
    if (filter) currentStudentFeeFilter = filter;
    else filter = currentStudentFeeFilter || 'all';

    if (!student) {
        student = (typeof currentInspectedStudent !== 'undefined' && currentInspectedStudent)
            || (typeof getStudentForUser === 'function' && typeof currentUser !== 'undefined' && currentUser ? getStudentForUser(currentUser) : null)
            || (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null)
            || (typeof students !== 'undefined' && students.length > 0 ? students[0] : null)
            || { id: 4, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };
    }
    const studentId = Number(student.id) || 4;
    const feeProfile = getFeeDetailsForStudent(studentId);

    const totalFees = feeProfile.items.reduce((acc, it) => acc + it.amount, 0);
    const paidFees = feeProfile.items.filter(it => it.status === 'PAID').reduce((acc, it) => acc + it.amount, 0);
    const dueFees = Math.max(0, totalFees - paidFees);
    const isCleared = dueFees === 0;

    const dueItems = feeProfile.items.filter(it => it.status === 'DUE');
    const paidItems = feeProfile.items.filter(it => it.status === 'PAID');
    const firstDueItem = dueItems.length > 0 ? dueItems[0] : null;

    // Update Hero Candidate Info
    const candidateInfoEl = document.getElementById("studFeeHeroCandidateInfo");
    if (candidateInfoEl) {
        candidateInfoEl.innerHTML = `Candidate: <b style="color: #fff;">${student.name}</b> &bull; Roll: <b style="color: #38bdf8;">${student.rollNo || '22A91A05' + String(student.id).padStart(2, '0')}</b> &bull; Dept: <b style="color: #fff;">${student.department}</b> &bull; Status: <span style="color: ${isCleared ? '#34d399' : '#fbbf24'}; font-weight: 700;">${isCleared ? '✅ All Fees Cleared' : '⚠️ Outstanding Dues Pending'}</span>`;
    }

    // Update Top Instant Pay Button (if present)
    const topPayBtn = document.getElementById("btnStudentInstantPayTop");
    if (topPayBtn) {
        if (isCleared) {
            topPayBtn.innerHTML = "<span>✅ All Fees Cleared (₹0)</span>";
            topPayBtn.style.background = "rgba(16, 185, 129, 0.2)";
            topPayBtn.style.border = "1px solid #10b981";
            topPayBtn.style.color = "#34d399";
            topPayBtn.onclick = () => showToast("All statutory fees are cleared! Examination admit card is unlocked.", "success");
        } else {
            topPayBtn.innerHTML = `<span>➕ Record Paid Fee</span>`;
            topPayBtn.style.background = "linear-gradient(135deg, #38bdf8, #0284c7)";
            topPayBtn.style.border = "none";
            topPayBtn.style.color = "#fff";
            topPayBtn.onclick = () => openAddCustomFeeModal();
        }
    }

    // Update Hero Stats
    const totalEl = document.getElementById("studFeeTotal");
    const paidEl = document.getElementById("studFeePaid");
    const dueEl = document.getElementById("studFeeDue");
    const clearanceEl = document.getElementById("studFeeClearanceStatus");
    const dialEl = document.getElementById("studFeeDial");

    if (totalEl) totalEl.innerText = `₹${totalFees.toLocaleString('en-IN')}`;
    if (paidEl) paidEl.innerText = `₹${paidFees.toLocaleString('en-IN')}`;
    if (dueEl) dueEl.innerText = `₹${dueFees.toLocaleString('en-IN')}`;

    const paidPct = totalFees > 0 ? Math.min(100, Math.round((paidFees / totalFees) * 100)) : 100;
    if (dialEl) {
        dialEl.style.background = `conic-gradient(#10b981 0% ${paidPct}%, rgba(239, 68, 68, 0.4) ${paidPct}% 100%)`;
        const innerPct = dialEl.querySelector(".fee-dial-pct");
        if (innerPct) innerPct.innerText = `${paidPct}%`;
    }

    if (clearanceEl) {
        clearanceEl.innerHTML = isCleared
            ? `<span class="fee-status-badge status-paid" style="font-size: 13px; padding: 6px 14px;">✅ ALL DUES CLEARED • EXAM ADMIT CARD UNLOCKED & ISSUED</span>`
            : `<span class="fee-status-badge status-due" style="font-size: 13px; padding: 6px 14px;">⚠️ ₹${dueFees.toLocaleString('en-IN')} OUTSTANDING • CLEAR DUES TO UNLOCK ADMIT CARD</span>`;
    }

    // Update Filter Tab Counts & Active Classes
    const cAll = document.getElementById("countFeeAll");
    const cDue = document.getElementById("countFeeDue");
    const cPaid = document.getElementById("countFeePaid");
    if (cAll) cAll.innerText = feeProfile.items.length;
    if (cDue) cDue.innerText = dueItems.length;
    if (cPaid) cPaid.innerText = paidItems.length;

    document.querySelectorAll(".fee-filter-btn").forEach(btn => btn.classList.remove("active"));
    const activeFilterBtn = document.getElementById(`feeFilter-${filter}`);
    if (activeFilterBtn) activeFilterBtn.classList.add("active");

    // Filter Items for display
    let displayItems = feeProfile.items;
    if (filter === 'due') {
        displayItems = feeProfile.items.filter(it => it.status === 'DUE');
    } else if (filter === 'paid') {
        displayItems = feeProfile.items.filter(it => it.status === 'PAID');
    }

    // Render Fee Item Rows
    const listContainer = document.getElementById("studFeeItemsList");
    if (listContainer) {
        if (displayItems.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 35px 20px; text-align: center; color: #94a3b8; background: rgba(15, 23, 42, 0.4);">
                    <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
                    <div style="font-size: 15px; font-weight: 700; color: #f8fafc;">No ${filter === 'due' ? 'Pending Dues' : 'Fee Items'} Found</div>
                    <div style="font-size: 12px; margin-top: 4px;">${filter === 'due' ? 'You have cleared all statutory and institutional fees for this term.' : 'Use the "+ Add Fee You Paid" button above to record payments.'}</div>
                </div>
            `;
        } else {
            listContainer.innerHTML = displayItems.map(it => {
                const isDue = it.status === 'DUE';
                const icon = it.icon || (
                    it.key === 'tuition' ? '🏛️' :
                    it.key === 'exam' ? '📝' :
                    it.key === 'lab' ? '💻' :
                    it.key === 'placement' ? '🚀' :
                    it.key === 'library' ? '📚' :
                    it.category && it.category.toLowerCase().includes('hostel') ? '🏨' :
                    it.category && it.category.toLowerCase().includes('transport') ? '🚌' :
                    it.category && it.category.toLowerCase().includes('re-eval') ? '📑' : '💳'
                );

                return `
                    <div class="fee-item-row" style="${isDue ? 'background: rgba(244, 63, 94, 0.08); border-left: 4px solid #fb7185;' : ''}">
                        <div class="fee-item-left">
                            <div class="fee-item-icon" style="${isDue ? 'background: rgba(244, 63, 94, 0.2); border-color: #fb7185;' : ''}">
                                ${icon}
                            </div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span class="fee-item-name" style="${isDue ? 'color: #fff; font-weight: 800;' : ''}">${it.name}</span>
                                    ${it.isCustom ? `<span style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 1px 6px; border-radius: 4px; font-weight: 700;">SELF-RECORDED</span>` : ''}
                                </div>
                                <div class="fee-item-sub">
                                    Domain: <b style="color: #cbd5e1;">${it.category || 'Academic'}</b> &bull; 
                                    Ref: <span style="font-family: monospace; color: #a5b4fc;">${it.txnId || 'BIET/FEES/2026-' + it.key.toUpperCase()}</span> &bull; 
                                    ${isDue ? '<span style="color:#fbbf24; font-weight: 700;">⚠️ Due: 25 Mar 2026 (Admit Card Mandatory)</span>' : 'Paid on ' + (it.paidDate || '15 Jan 2026')}
                                    ${it.paymentMode ? ` &bull; <span style="color: #94a3b8;">${it.paymentMode}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="fee-item-right">
                            <div class="fee-amount-block">
                                <div class="fee-amount-val" style="${isDue ? 'color: #fb7185; font-size: 18px;' : ''}">₹${it.amount.toLocaleString('en-IN')}</div>
                                <div>
                                    <span class="fee-status-badge ${isDue ? 'status-due' : 'status-paid'}">
                                        ${isDue ? '● DUE NOW' : '✓ PAID'}
                                    </span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                ${isDue
                                    ? `<button type="button" class="btn btn-outline btn-sm" onclick="openAddCustomFeeModal()" style="border-color: #38bdf8; color: #38bdf8; font-weight: 700;">➕ Record Paid</button>`
                                    : `<button type="button" class="btn btn-outline btn-sm" onclick="openOfficialReceiptModal(${student.id}, '${it.key}')">📄 Receipt</button>`
                                }
                                ${it.isCustom ? `<button type="button" class="btn btn-outline btn-sm" style="color: #fb7185; border-color: rgba(244, 63, 94, 0.4); padding: 5px 8px;" title="Remove self-recorded fee entry" onclick="deleteCustomFeePayment(${student.id}, '${it.key}')">🗑️</button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Update Hall Ticket status widget
    const htStatusPill = document.getElementById("studHallTicketStatusPill");
    const htActionBtn = document.getElementById("studHallTicketActionBtn");
    if (htStatusPill) {
        htStatusPill.className = isCleared ? "fee-status-badge status-paid" : "fee-status-badge status-due";
        htStatusPill.innerText = isCleared ? "✅ ADMIT CARD UNLOCKED & ISSUED" : "⚠️ WITHHELD (FEE DUES PENDING)";
    }
    if (htActionBtn) {
        if (isCleared) {
            htActionBtn.disabled = false;
            htActionBtn.style.opacity = "1";
            htActionBtn.innerHTML = "<span>🎟️ View & Download Official Hall Ticket (PDF)</span>";
            htActionBtn.onclick = () => openOfficialHallTicketModal(student.id);
        } else {
            htActionBtn.disabled = false;
            htActionBtn.style.opacity = "1";
            htActionBtn.innerHTML = `<span>➕ Record Exam Fee Payment to Unlock Hall Ticket</span>`;
            htActionBtn.style.background = "linear-gradient(135deg, #38bdf8, #0284c7)";
            htActionBtn.onclick = () => openAddCustomFeeModal();
        }
    }

    // DYNAMICALLY POPULATE OFFICIAL FEE PAYMENT PASSBOOK & TRANSACTION LEDGER
    const passbookBody = document.getElementById("studFeePassbookBody");
    if (passbookBody) {
        if (paidItems.length === 0) {
            passbookBody.innerHTML = `
                <tr>
                    <td colspan="7" style="padding: 24px; text-align: center; color: #94a3b8;">
                        No fee payments recorded yet. Pay pending dues online or use "+ Record / Add Paid Fee" to record offline transactions.
                    </td>
                </tr>
            `;
        } else {
            passbookBody.innerHTML = paidItems.map(it => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 10px; color: #cbd5e1;">${it.paidDate || '15 Jan 2026'}</td>
                    <td style="padding: 12px 10px; font-family: monospace; color: #a5b4fc; font-size: 11px;">
                        ${it.txnId || ('BIET-TXN-' + (100000 + studentId))}
                    </td>
                    <td style="padding: 12px 10px; font-weight: 600;">
                        ${it.name}
                        ${it.isCustom ? `<span style="font-size: 9px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 1px 4px; border-radius: 3px; margin-left: 5px;">CUSTOM</span>` : ''}
                    </td>
                    <td style="padding: 12px 10px; color: #94a3b8; font-size: 12px;">
                        ${it.paymentMode || (it.key === 'tuition' ? 'Net Banking (Axis)' : it.key === 'lab' ? 'UPI (PhonePe)' : it.key === 'library' ? 'UPI (GPay)' : it.key === 'placement' ? 'Debit Card' : 'Online Gateway')}
                    </td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: 700; color: #34d399;">₹${it.amount.toLocaleString('en-IN')}</td>
                    <td style="padding: 12px 10px; text-align: center;"><span class="fee-status-badge status-paid">✓ SUCCESS</span></td>
                    <td style="padding: 12px 10px; text-align: right; white-space: nowrap;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="openOfficialReceiptModal(${student.id}, '${it.key}')">📄 Receipt</button>
                        ${it.isCustom ? `<button type="button" class="btn btn-outline btn-sm" style="color: #fb7185; border-color: rgba(244,63,94,0.3); margin-left: 4px;" title="Remove Entry" onclick="deleteCustomFeePayment(${student.id}, '${it.key}')">🗑️</button>` : ''}
                    </td>
                </tr>
            `).join('');
        }
    }
}

function filterStudentFeeSchedule(filter) {
    currentStudentFeeFilter = filter;
    const student = (typeof currentInspectedStudent !== 'undefined' && currentInspectedStudent)
        || (typeof getStudentForUser === 'function' && typeof currentUser !== 'undefined' && currentUser ? getStudentForUser(currentUser) : null)
        || (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null)
        || { id: 4, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };
    renderStudentFeesView(student, filter);
}

function escapeJs(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ----------------------------------------------------
// CUSTOM FEE ENTRY CONTROLLER (STUDENTS SELF-REPORT PAID FEES)
// ----------------------------------------------------
const FEE_PRESETS = {
    'hostel': { name: "Campus AC Hostel & Mess Facility Fee", category: "Hostel & Living", amount: 45000, icon: "🏨" },
    'transport': { name: "College Transport & Bus Pass Route Fee", category: "Transport", amount: 18000, icon: "🚌" },
    'exam': { name: "Autonomous Semester-End Exam & Valuation Fee", category: "Examinations", amount: 2500, icon: "📝" },
    'tuition': { name: "Semester VI Tuition & Academic Instruction Fee", category: "Academic", amount: 65000, icon: "🏛️" },
    'lab': { name: "Autonomous Computing & High-Perf AI Lab Fee", category: "Laboratories", amount: 4000, icon: "💻" },
    'reeval': { name: "Autonomous Script Re-evaluation & Challenge Fee", category: "Examinations", amount: 1000, icon: "📑" },
    'library': { name: "IEEE Digital Consortium & Library Membership", category: "Facilities", amount: 1500, icon: "📚" },
    'convocation': { name: "Degree Convocation & Consolidated Certificate Fee", category: "Institutional", amount: 3000, icon: "🎓" },
    'symposium': { name: "National Tech Fest & Hackathon Registration Fee", category: "Co-Curricular", amount: 750, icon: "🏆" }
};

function openAddCustomFeeModal() {
    const student = (typeof currentInspectedStudent !== 'undefined' && currentInspectedStudent)
        || (typeof getStudentForUser === 'function' && typeof currentUser !== 'undefined' && currentUser ? getStudentForUser(currentUser) : null)
        || (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null)
        || { id: 4, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };

    const modal = document.getElementById("addCustomFeeModal");
    if (!modal) return;

    const studentInfoEl = document.getElementById("customFeeStudentInfo");
    if (studentInfoEl) {
        studentInfoEl.innerHTML = `Student: <b style="color: #fff;">${student.name}</b> (${student.rollNo || '22A91A0504'}) &bull; ${student.department}`;
    }

    const form = document.getElementById("addCustomFeeForm");
    if (form) form.reset();

    const dateInput = document.getElementById("customFeeDate");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    const refInput = document.getElementById("customFeeRef");
    if (refInput) {
        refInput.value = `UTR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    modal.classList.add("active");
}

function closeAddCustomFeeModal() {
    const modal = document.getElementById("addCustomFeeModal");
    if (modal) modal.classList.remove("active");
}

function applyFeePreset(presetKey) {
    const preset = FEE_PRESETS[presetKey];
    if (!preset) return;

    const nameInput = document.getElementById("customFeeName");
    const catInput = document.getElementById("customFeeCategory");
    const amtInput = document.getElementById("customFeeAmount");

    if (nameInput) nameInput.value = preset.name;
    if (catInput) catInput.value = preset.category;
    if (amtInput) amtInput.value = preset.amount;

    showToast(`Applied preset: ${preset.name} (₹${preset.amount.toLocaleString('en-IN')})`, "info");
}

function generateRandomUtr() {
    const refInput = document.getElementById("customFeeRef");
    if (refInput) {
        refInput.value = `UTR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
}

function handleAddCustomFeeSubmit(e) {
    if (e) e.preventDefault();

    const student = (typeof currentInspectedStudent !== 'undefined' && currentInspectedStudent)
        || (typeof getStudentForUser === 'function' && typeof currentUser !== 'undefined' && currentUser ? getStudentForUser(currentUser) : null)
        || (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null)
        || { id: 4, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };

    const studentId = Number(student.id) || 4;
    const name = document.getElementById("customFeeName").value.trim();
    const category = document.getElementById("customFeeCategory").value;
    const amount = Number(document.getElementById("customFeeAmount").value);
    const dateVal = document.getElementById("customFeeDate").value;
    const mode = document.getElementById("customFeeMode").value;
    const refId = document.getElementById("customFeeRef").value.trim() || `UTR-${Date.now().toString().slice(-6)}`;
    const statusVal = document.getElementById("customFeeStatus") ? document.getElementById("customFeeStatus").value : "PAID";
    const notes = document.getElementById("customFeeNotes") ? document.getElementById("customFeeNotes").value.trim() : "";

    if (!name || isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid fee name and amount.", "warning");
        return;
    }

    const formattedDate = dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const db = getStudentFeesDatabase();
    if (!db[studentId]) getFeeDetailsForStudent(studentId);
    const profile = db[studentId];

    // Check if the student is recording payment for an existing DUE item (e.g. Exam Fee)
    const existingDueMatch = profile.items.find(it => it.status === 'DUE' && (
        it.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(it.name.toLowerCase()) ||
        (it.key === 'exam' && name.toLowerCase().includes('exam'))
    ));

    let createdOrUpdatedKey = `custom_${Date.now()}`;

    if (existingDueMatch && statusVal === 'PAID') {
        // Clear existing due item!
        existingDueMatch.status = 'PAID';
        existingDueMatch.paidDate = formattedDate;
        existingDueMatch.txnId = refId;
        existingDueMatch.paymentMode = mode;
        existingDueMatch.receiptNo = `REC-2026-${String(studentId).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
        if (notes) existingDueMatch.notes = notes;
        createdOrUpdatedKey = existingDueMatch.key;
    } else {
        const newItem = {
            key: createdOrUpdatedKey,
            name: name,
            category: category,
            amount: amount,
            status: statusVal,
            paidDate: statusVal === 'PAID' ? formattedDate : null,
            txnId: statusVal === 'PAID' ? refId : null,
            receiptNo: statusVal === 'PAID' ? `REC-2026-${String(studentId).padStart(4, '0')}-${Date.now().toString().slice(-4)}` : null,
            paymentMode: mode,
            notes: notes,
            isCustom: true
        };
        profile.items.push(newItem);
    }

    saveStudentFeesDatabase(db);
    closeAddCustomFeeModal();

    renderStudentFeesView(student);
    if (typeof renderFacultyFeeMonitor === 'function') renderFacultyFeeMonitor();

    showToast(`✅ Fee record "${name}" (₹${amount.toLocaleString('en-IN')}) saved successfully!`, "success");

    // If paid, show receipt
    if (statusVal === 'PAID') {
        setTimeout(() => {
            openOfficialReceiptModal(studentId, createdOrUpdatedKey);
        }, 300);
    }
}

function deleteCustomFeePayment(studentId, itemKey) {
    studentId = Number(studentId) || 4;
    const db = getStudentFeesDatabase();
    if (!db[studentId]) return;

    const item = db[studentId].items.find(i => i.key === itemKey);
    if (!item) return;

    if (!item.isCustom) {
        showToast("Statutory CBCS curriculum fee heads cannot be deleted.", "warning");
        return;
    }

    const shouldDelete = (typeof confirm === 'function') 
        ? confirm(`Remove self-recorded fee entry "${item.name}" (₹${item.amount.toLocaleString('en-IN')})?`)
        : true;

    if (shouldDelete) {
        db[studentId].items = db[studentId].items.filter(i => i.key !== itemKey);
        saveStudentFeesDatabase(db);

        const student = (typeof students !== 'undefined') ? students.find(s => s.id === studentId) : null;
        renderStudentFeesView(student);
        if (typeof renderFacultyFeeMonitor === 'function') renderFacultyFeeMonitor();
        showToast("Self-recorded fee entry removed from ledger.", "info");
    }
}

// ----------------------------------------------------
// CONSOLIDATED ANNUAL FEE STATEMENT
// ----------------------------------------------------
function openConsolidatedFeeModal(studentId) {
    if (!studentId) {
        const student = (typeof currentInspectedStudent !== 'undefined' && currentInspectedStudent)
            || (typeof getStudentForUser === 'function' && typeof currentUser !== 'undefined' && currentUser ? getStudentForUser(currentUser) : null)
            || (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null)
            || { id: 4, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };
        studentId = student.id;
    }
    studentId = Number(studentId) || 4;
    const student = (typeof students !== 'undefined' ? students.find(s => s.id === studentId) : null)
        || { id: studentId, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };

    const profile = getFeeDetailsForStudent(studentId);
    const totalFees = profile.items.reduce((acc, it) => acc + it.amount, 0);
    const paidFees = profile.items.filter(it => it.status === 'PAID').reduce((acc, it) => acc + it.amount, 0);
    const dueFees = Math.max(0, totalFees - paidFees);

    const modal = document.getElementById("consolidatedFeeStatementModal");
    const body = document.getElementById("consolidatedFeeStatementBody");
    if (!modal || !body) return;

    body.innerHTML = `
        <div class="receipt-paper" style="border-top: 6px solid #6366f1;">
            <div class="receipt-watermark" style="font-size: 50px;">STATEMENT</div>
            <div class="receipt-header">
                <h2>BHARAT INSTITUTE OF ENGINEERING & TECHNOLOGY</h2>
                <div style="font-size: 11px; color: #64748b; font-weight: 700;">(UGC AUTONOMOUS &bull; ACCREDITED BY NAAC 'A+' & NBA)</div>
                <div style="font-size: 11px; color: #64748b;">Mangalpally (V), Ibrahimpatnam (M), Hyderabad, Telangana - 501510</div>
                <div class="receipt-badge" style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: #fff;">
                    OFFICIAL CONSOLIDATED ANNUAL FEE STATEMENT &bull; ACADEMIC YEAR 2025-26
                </div>
            </div>

            <div class="receipt-meta-grid" style="margin-bottom: 15px;">
                <div class="receipt-meta-item">
                    <span>Student Name:</span>
                    <span>${student.name}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Roll / Hall Ticket No:</span>
                    <span style="font-family: monospace; color: #4f46e5;">${student.rollNo || '22A91A0504'}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Degree & Branch:</span>
                    <span>B.Tech - ${student.department} (Semester VI)</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Statement Date:</span>
                    <span>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Total Realized Fees:</span>
                    <span style="color: #059669; font-size: 14px;">₹${paidFees.toLocaleString('en-IN')}.00</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Current Dues Status:</span>
                    <span style="color: ${dueFees === 0 ? '#059669' : '#dc2626'}; font-size: 14px;">
                        ${dueFees === 0 ? '✓ ZERO OUTSTANDING DUES' : `⚠️ ₹${dueFees.toLocaleString('en-IN')}.00 PENDING`}
                    </span>
                </div>
            </div>

            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Fee Head Description</th>
                        <th>Domain / Classification</th>
                        <th>Txn Ref / UTR</th>
                        <th>Payment Status</th>
                        <th style="text-align: right;">Amount (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    ${profile.items.map((it, idx) => `
                        <tr>
                            <td>${idx + 1}</td>
                            <td>
                                <b>${it.name}</b>
                                ${it.isCustom ? `<span style="font-size: 9px; color: #6366f1; margin-left: 4px;">[Recorded]</span>` : ''}
                            </td>
                            <td>${it.category || 'Academic'}</td>
                            <td style="font-family: monospace; font-size: 11px; color: #4f46e5;">${it.txnId || '-'}</td>
                            <td>
                                <span style="font-weight: 700; color: ${it.status === 'PAID' ? '#059669' : '#dc2626'};">
                                    ${it.status === 'PAID' ? '✓ PAID (' + (it.paidDate || '15 Jan 2026') + ')' : '● PENDING DUE'}
                                </span>
                            </td>
                            <td style="text-align: right; font-weight: 700;">₹${it.amount.toLocaleString('en-IN')}.00</td>
                        </tr>
                    `).join('')}
                    <tr class="receipt-total-row">
                        <td colspan="5" style="text-align: right;">Total Demand:</td>
                        <td style="text-align: right;">₹${totalFees.toLocaleString('en-IN')}.00</td>
                    </tr>
                    <tr style="background: #f1f5f9; font-weight: 700;">
                        <td colspan="5" style="text-align: right; color: #059669;">Total Amount Paid & Realized:</td>
                        <td style="text-align: right; color: #059669;">₹${paidFees.toLocaleString('en-IN')}.00</td>
                    </tr>
                    <tr style="background: ${dueFees > 0 ? '#fef2f2' : '#f0fdf4'}; font-weight: 800;">
                        <td colspan="5" style="text-align: right; color: ${dueFees > 0 ? '#dc2626' : '#059669'};">Net Outstanding Balance:</td>
                        <td style="text-align: right; color: ${dueFees > 0 ? '#dc2626' : '#059669'};">₹${dueFees.toLocaleString('en-IN')}.00</td>
                    </tr>
                </tbody>
            </table>

            <div style="font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1; margin-top: 15px;">
                <b>Official Certificate of Accounts:</b> This statement is an authentic institutional verification of accounts under BIET CBCS regulations for the 2025-26 academic year. Valid for scholarship reimbursement, income-tax exemption claims (Section 80C), and autonomous admit card clearances.
            </div>

            <div class="receipt-stamp-row">
                <div>
                    <div class="receipt-seal" style="border-color: #4f46e5; color: #4f46e5;">✓ TREASURY CERTIFIED</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">BIET Accounts Office &bull; Autonomous Registry</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: 'Brush Script MT', cursive; font-size: 22px; color: #1e1b4b;">R. K. Ramanathan</div>
                    <div style="font-size: 11px; font-weight: 700; color: #334155;">Accounts Officer &bull; Finance Division</div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add("active");
}

function closeConsolidatedFeeModal() {
    const modal = document.getElementById("consolidatedFeeStatementModal");
    if (modal) modal.classList.remove("active");
}

function openStudentFeePaymentHub() {
    if (typeof quickSwitchRole === 'function' && (!currentUser || currentUser.role !== 'Student')) {
        quickSwitchRole('Student');
    }
    if (typeof switchStudentTab === 'function') {
        switchStudentTab('fees');
    }
    const student = (typeof currentInspectedStudent !== 'undefined' && currentInspectedStudent)
        || (typeof getStudentForUser === 'function' && typeof currentUser !== 'undefined' && currentUser ? getStudentForUser(currentUser) : null)
        || (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null)
        || { id: 4, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };

    if (typeof renderStudentFeesView === 'function') {
        renderStudentFeesView(student);
    }
}

function openPaymentGatewayModal(studentId, itemKey, amount, itemName) {
    // Online pay fee method removed - redirect to self-reporting / recording paid fee
    openAddCustomFeeModal();
}

if (typeof window !== 'undefined') {
    window.openStudentFeePaymentHub = openStudentFeePaymentHub;
    window.openPaymentGatewayModal = openPaymentGatewayModal;
    window.openAddCustomFeeModal = openAddCustomFeeModal;
    window.closeAddCustomFeeModal = closeAddCustomFeeModal;
    window.applyFeePreset = applyFeePreset;
    window.generateRandomUtr = generateRandomUtr;
    window.handleAddCustomFeeSubmit = handleAddCustomFeeSubmit;
    window.deleteCustomFeePayment = deleteCustomFeePayment;
    window.openConsolidatedFeeModal = openConsolidatedFeeModal;
    window.closeConsolidatedFeeModal = closeConsolidatedFeeModal;
    window.filterStudentFeeSchedule = filterStudentFeeSchedule;
    window.renderStudentFeesView = renderStudentFeesView;
}

function closePaymentGatewayModal() {
    const modal = document.getElementById("feePaymentModal");
    if (modal) modal.classList.remove("active");
}

// ----------------------------------------------------
// 3. OFFICIAL RECEIPT GENERATOR & MODAL
// ----------------------------------------------------
function openOfficialReceiptModal(studentId, itemKey) {
    studentId = Number(studentId) || 4;
    const db = getStudentFeesDatabase();
    if (!db[studentId]) getFeeDetailsForStudent(studentId);
    const profile = db[studentId];
    const item = profile.items.find(i => i.key === itemKey) || profile.items[0];

    const student = (typeof students !== 'undefined' ? students.find(s => s.id === studentId) : null)
        || { id: studentId, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };

    const modal = document.getElementById("feeReceiptModal");
    const body = document.getElementById("feeReceiptModalBody");
    if (!modal || !body) return;

    body.innerHTML = `
        <div class="receipt-paper">
            <div class="receipt-watermark">PAID</div>
            <div class="receipt-header">
                <h2>BHARAT INSTITUTE OF ENGINEERING & TECHNOLOGY</h2>
                <div style="font-size: 11px; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">(UGC AUTONOMOUS &bull; ACCREDITED BY NAAC 'A+' & NBA)</div>
                <div style="font-size: 11px; color: #64748b;">Mangalpally (V), Ibrahimpatnam (M), Hyderabad, Telangana - 501510</div>
                <div class="receipt-badge">OFFICIAL FINANCIAL CLEARANCE E-RECEIPT</div>
            </div>

            <div class="receipt-meta-grid">
                <div class="receipt-meta-item">
                    <span>Receipt Number:</span>
                    <span>${item.receiptNo || 'REC-2026-0004-01'}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Transaction ID:</span>
                    <span>${item.txnId || 'BIET-TXN-100004'}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Student Name:</span>
                    <span>${student.name}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Hall Ticket / Roll No:</span>
                    <span>${student.rollNo || '22A91A05' + String(student.id).padStart(2, '0')}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Program / Branch:</span>
                    <span>B.Tech - ${student.department} (Semester VI)</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Payment Date:</span>
                    <span>${item.paidDate || 'Today'}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Payment Channel:</span>
                    <span>Autonomous Instant Gateway (256-Bit SSL)</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Verification Status:</span>
                    <span style="color: #10b981;">✓ BANK CONFIRMED (UTR OK)</span>
                </div>
            </div>

            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Fee Head Description</th>
                        <th>Academic Term</th>
                        <th>Classification</th>
                        <th style="text-align: right;">Amount (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td><b>${item.name}</b></td>
                        <td>Academic Year 2025-26 &bull; Sem VI</td>
                        <td>${item.category}</td>
                        <td style="text-align: right; font-weight: 700;">₹${item.amount.toLocaleString('en-IN')}.00</td>
                    </tr>
                    <tr class="receipt-total-row">
                        <td colspan="4" style="text-align: right;">Total Amount Realized:</td>
                        <td style="text-align: right; color: #047857;">₹${item.amount.toLocaleString('en-IN')}.00</td>
                    </tr>
                </tbody>
            </table>

            <div style="font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                <b>Statutory Notice:</b> This computer-generated verified electronic transaction certificate confirms full institutional realization of statutory fee dues under autonomous CBCS regulations. Valid for examination hall ticket issuance and semester registration.
            </div>

            <div class="receipt-stamp-row">
                <div>
                    <div class="receipt-seal">✓ INSTITUTIONALLY CLEARED</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">BIET Accounts & Treasury Verification</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: 'Brush Script MT', cursive; font-size: 20px; color: #1e1b4b;">R. K. Ramanathan</div>
                    <div style="font-size: 11px; font-weight: 700; color: #334155;">Accounts Officer &bull; BIET Autonomous</div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add("active");
}

function closeOfficialReceiptModal() {
    const modal = document.getElementById("feeReceiptModal");
    if (modal) modal.classList.remove("active");
}

// ----------------------------------------------------
// 4. OFFICIAL DIGITAL EXAMINATION HALL TICKET MODAL
// ----------------------------------------------------
function openOfficialHallTicketModal(studentId) {
    studentId = Number(studentId) || 4;
    const student = (typeof students !== 'undefined' ? students.find(s => s.id === studentId) : null)
        || { id: studentId, name: "Sneha Devi", department: "CSE", rollNo: "22A91A0504" };

    const modal = document.getElementById("hallTicketModal");
    const body = document.getElementById("hallTicketModalBody");
    if (!modal || !body) return;

    body.innerHTML = `
        <div class="receipt-paper" style="border-top: 5px solid #6366f1;">
            <div class="receipt-watermark" style="color: rgba(99,102,241,0.06);">ADMIT CARD</div>
            <div class="receipt-header">
                <h2>BHARAT INSTITUTE OF ENGINEERING & TECHNOLOGY</h2>
                <div style="font-size: 11px; color: #64748b; font-weight: 700;">(UGC AUTONOMOUS &bull; EXAMINATIONS BRANCH)</div>
                <div class="receipt-badge" style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: #fff;">
                    OFFICIAL END-SEMESTER EXAMINATION HALL TICKET &bull; APRIL 2026
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 100px; gap: 15px; margin-bottom: 18px; align-items: center;">
                <div class="receipt-meta-grid" style="margin-bottom: 0;">
                    <div class="receipt-meta-item">
                        <span>Candidate Name:</span>
                        <span>${student.name}</span>
                    </div>
                    <div class="receipt-meta-item">
                        <span>Hall Ticket Number:</span>
                        <span style="color: #4f46e5; font-size: 14px;">${student.rollNo || '22A91A0504'}</span>
                    </div>
                    <div class="receipt-meta-item">
                        <span>Course & Branch:</span>
                        <span>B.Tech - ${student.department} (Semester VI)</span>
                    </div>
                    <div class="receipt-meta-item">
                        <span>Examination Center:</span>
                        <span>BIET Campus &bull; Block-3 (Room 304, Seat CS-24)</span>
                    </div>
                    <div class="receipt-meta-item">
                        <span>Biometric Attendance:</span>
                        <span style="color: #059669;">94% (Eligible &bull; > 75%)</span>
                    </div>
                    <div class="receipt-meta-item">
                        <span>Fee Clearance:</span>
                        <span style="color: #059669;">✓ 100% CLEARED (No Outstanding Dues)</span>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="width: 85px; height: 95px; border: 2px solid #cbd5e1; border-radius: 8px; background: #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 28px;">
                        👩‍🎓
                        <span style="font-size: 9px; color: #64748b; font-weight: 700; margin-top: 4px;">VERIFIED</span>
                    </div>
                </div>
            </div>

            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Subject Code</th>
                        <th>Subject Title</th>
                        <th>Session</th>
                        <th style="text-align: center;">Invigilator Sign</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>08-Apr-2026 (10:00 AM)</td>
                        <td><b>CS601PC</b></td>
                        <td>Machine Learning & Predictive Systems</td>
                        <td>FN (Forenoon)</td>
                        <td style="text-align: center; color: #94a3b8;">___________</td>
                    </tr>
                    <tr>
                        <td>11-Apr-2026 (10:00 AM)</td>
                        <td><b>CS602PC</b></td>
                        <td>Compiler Design & Code Generation</td>
                        <td>FN (Forenoon)</td>
                        <td style="text-align: center; color: #94a3b8;">___________</td>
                    </tr>
                    <tr>
                        <td>15-Apr-2026 (10:00 AM)</td>
                        <td><b>CS603PC</b></td>
                        <td>Design & Analysis of Algorithms</td>
                        <td>FN (Forenoon)</td>
                        <td style="text-align: center; color: #94a3b8;">___________</td>
                    </tr>
                    <tr>
                        <td>18-Apr-2026 (10:00 AM)</td>
                        <td><b>CS604PE</b></td>
                        <td>Cloud Computing & Distributed DevOps</td>
                        <td>FN (Forenoon)</td>
                        <td style="text-align: center; color: #94a3b8;">___________</td>
                    </tr>
                </tbody>
            </table>

            <div class="receipt-stamp-row">
                <div>
                    <div class="receipt-seal" style="border-color: #4f46e5; color: #4f46e5;">✓ CONTROLLER OF EXAMS SEAL</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: 'Brush Script MT', cursive; font-size: 20px; color: #1e1b4b;">Prof. Rajesh Sharma</div>
                    <div style="font-size: 11px; font-weight: 700; color: #334155;">Controller of Examinations (Autonomous)</div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add("active");
}

function closeOfficialHallTicketModal() {
    const modal = document.getElementById("hallTicketModal");
    if (modal) modal.classList.remove("active");
}

// ----------------------------------------------------
// 5. FACULTY COHORT MONITOR
// ----------------------------------------------------
// ----------------------------------------------------
// 5. FACULTY COHORT MONITOR
// ----------------------------------------------------
let facultyFeeFilterStatus = 'all';
let facultyFeeSearchTerm = '';

function renderFacultyFeeMonitor() {
    let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
        ? students
        : null;

    if (!studentList) {
        const saved = (typeof safeGetItem === 'function') ? safeGetItem('student_dashboard_data_v6_100') : localStorage.getItem('student_dashboard_data_v6_100');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) studentList = parsed;
            } catch (e) {}
        }
    }

    if (!studentList && typeof DEFAULT_STUDENTS !== 'undefined') {
        studentList = DEFAULT_STUDENTS;
    }

    const tableBody = document.getElementById("facultyFeeCohortTableBody");
    if (!tableBody) return;

    if (!studentList || studentList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px; color: #94a3b8;">Cohort student records loading or unavailable.</td></tr>`;
        return;
    }

    let totalDemand = 0;
    let totalCollected = 0;
    let totalClearedStudents = 0;

    // Filter cohort list
    let filteredStudents = studentList.filter(s => {
        const profile = getFeeDetailsForStudent(s.id);
        const sTotal = profile.items.reduce((acc, it) => acc + it.amount, 0);
        const sPaid = profile.items.filter(it => it.status === 'PAID').reduce((acc, it) => acc + it.amount, 0);
        const sDue = Math.max(0, sTotal - sPaid);

        totalDemand += sTotal;
        totalCollected += sPaid;
        if (sDue === 0) totalClearedStudents++;

        // Status filter
        if (facultyFeeFilterStatus === 'due' && sDue === 0) return false;
        if (facultyFeeFilterStatus === 'cleared' && sDue > 0) return false;

        // Search term
        if (facultyFeeSearchTerm) {
            const term = facultyFeeSearchTerm.toLowerCase();
            const roll = (s.rollNo || ('22A91A05' + String(s.id).padStart(2, '0'))).toLowerCase();
            const name = (s.name || '').toLowerCase();
            const dept = (s.department || '').toLowerCase();
            if (!roll.includes(term) && !name.includes(term) && !dept.includes(term)) return false;
        }

        return true;
    });

    const rows = filteredStudents.map(s => {
        const profile = getFeeDetailsForStudent(s.id);
        const sTotal = profile.items.reduce((acc, it) => acc + it.amount, 0);
        const sPaid = profile.items.filter(it => it.status === 'PAID').reduce((acc, it) => acc + it.amount, 0);
        const sDue = Math.max(0, sTotal - sPaid);
        const rollNo = s.rollNo || ('22A91A05' + String(s.id).padStart(2, '0'));
        const avg = Number(s.average || ((s.maths + s.science + s.english + s.programming) / 4) || 0);

        return `
            <tr>
                <td><span style="font-family: monospace; font-size: 11px; color: #a5b4fc; font-weight: 700;">${rollNo}</span></td>
                <td><b>${s.name}</b></td>
                <td><span style="background: rgba(99,102,241,0.15); color: #c7d2fe; font-size: 11px; padding: 2px 7px; border-radius: 4px; font-weight: 700;">${s.department}</span></td>
                <td><span style="color: ${avg >= 75 ? '#34d399' : '#fbbf24'}; font-weight: 700; font-size: 12px;">${avg.toFixed(1)}%</span></td>
                <td>₹${sTotal.toLocaleString('en-IN')}</td>
                <td style="color: #34d399; font-weight: 700;">₹${sPaid.toLocaleString('en-IN')}</td>
                <td style="color: ${sDue > 0 ? '#fb7185' : '#94a3b8'}; font-weight: 700;">₹${sDue.toLocaleString('en-IN')}</td>
                <td>
                    <span class="fee-status-badge ${sDue === 0 ? 'status-paid' : 'status-due'}">
                        ${sDue === 0 ? '✓ CLEARED' : '● DUE PENDING'}
                    </span>
                </td>
                <td>
                    ${sDue > 0
                        ? `<button type="button" class="btn btn-outline btn-sm" onclick="sendIndividualFeeAlert(${s.id}, '${s.name}', ${sDue})">🔔 Ping Alert</button>`
                        : `<span style="font-size: 11px; color: #34d399; font-weight: 600;">✓ Hall Ticket Issued</span>`
                    }
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rows.length > 0 ? rows.join('') : `<tr><td colspan="9" style="text-align: center; padding: 25px; color: #94a3b8;">No student fee records match current search / filter criteria.</td></tr>`;

    // Update KPI Pills
    const demandEl = document.getElementById("facFeeDemand");
    const collectedEl = document.getElementById("facFeeCollected");
    const pendingEl = document.getElementById("facFeePending");
    const clearedEl = document.getElementById("facFeeClearedCount");

    if (demandEl) demandEl.innerText = `₹${(totalDemand / 100000).toFixed(2)} Lakhs`;
    if (collectedEl) collectedEl.innerText = `₹${(totalCollected / 100000).toFixed(2)} Lakhs`;
    if (pendingEl) pendingEl.innerText = `₹${((totalDemand - totalCollected) / 100000).toFixed(2)} Lakhs`;
    if (clearedEl) clearedEl.innerText = `${totalClearedStudents} / ${studentList.length} (${Math.round((totalClearedStudents / studentList.length) * 100)}%)`;
}

function filterFacultyFeeCohort(status) {
    facultyFeeFilterStatus = status || 'all';
    renderFacultyFeeMonitor();
}

function searchFacultyFeeCohort(query) {
    facultyFeeSearchTerm = (query || '').trim();
    renderFacultyFeeMonitor();
}

function sendBulkFeeReminders() {
    const notices = getNoticesList();
    const reminderNotice = {
        id: Date.now(),
        title: "URGENT: Clear Semester VI Exam Fee Before Examination Freeze",
        category: "fee",
        priority: "urgent",
        date: "Just Now",
        body: "Statutory Examination & Valuation fee dues must be cleared through the online portal immediately. Automated hall ticket generation freezes tomorrow at 5:00 PM.",
        sender: "Dr. K. Srinivas (Head of Department, CSE)",
        target: "Defaulter Cohort"
    };
    notices.unshift(reminderNotice);
    saveNoticesList(notices);
    renderNoticesGrid();
    showToast("🔔 Bulk SMS & Portal Reminder Dispatched to Defaulters!", "success");
}

function sendIndividualFeeAlert(studentId, studentName, amountDue) {
    showToast(`🔔 SMS & Email Notification Sent to ${studentName} for Pending Due of ₹${amountDue.toLocaleString('en-IN')}`, "info");
}

if (typeof window !== 'undefined') {
    window.renderFacultyFeeMonitor = renderFacultyFeeMonitor;
    window.filterFacultyFeeCohort = filterFacultyFeeCohort;
    window.searchFacultyFeeCohort = searchFacultyFeeCohort;
    window.sendBulkFeeReminders = sendBulkFeeReminders;
    window.sendIndividualFeeAlert = sendIndividualFeeAlert;
}

// ----------------------------------------------------
// INITIALIZATION HOOK
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    try {
        renderNoticesTicker();
        renderNoticesGrid();
        renderFacultyFeeMonitor();
    } catch (e) {
        console.warn("Fee & Notice Controller init deferred:", e);
    }
});
