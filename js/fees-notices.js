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

// ----------------------------------------------------
// DATE & DEADLINE UTILITIES (NON-DESTRUCTIVE)
// ----------------------------------------------------
function normalizeDateToIso(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
}

function formatFeeDate(isoStr) {
    if (!isoStr) return 'No Deadline';
    try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return isoStr;
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        return isoStr;
    }
}

function getDeadlineMeta(dueDateStr, status) {
    if (status === 'PAID') {
        return {
            isPaid: true,
            isOverdue: false,
            isImminent: false,
            daysDiff: 0,
            formattedDate: formatFeeDate(dueDateStr),
            badgeHtml: `<span class="deadline-pill deadline-cleared">✓ Paid</span>`
        };
    }

    if (!dueDateStr) {
        return {
            isPaid: false,
            isOverdue: false,
            isImminent: false,
            daysDiff: 999,
            formattedDate: 'Open',
            badgeHtml: `<span class="deadline-pill deadline-upcoming">📅 Open</span>`
        };
    }

    const dueTime = new Date(dueDateStr).setHours(23, 59, 59, 999);
    const nowTime = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.round((dueTime - nowTime) / (1000 * 60 * 60 * 24));
    const formattedDate = formatFeeDate(dueDateStr);

    if (diffDays < 0) {
        const overdueDays = Math.abs(diffDays);
        return {
            isPaid: false,
            isOverdue: true,
            isImminent: false,
            daysDiff: diffDays,
            formattedDate: formattedDate,
            badgeHtml: `<span class="deadline-pill deadline-overdue" title="Payment deadline was ${formattedDate}">🚨 Overdue (${overdueDays}d)</span>`
        };
    } else if (diffDays <= 5) {
        return {
            isPaid: false,
            isOverdue: false,
            isImminent: true,
            daysDiff: diffDays,
            formattedDate: formattedDate,
            badgeHtml: `<span class="deadline-pill deadline-imminent" title="Payment deadline: ${formattedDate}">⚠️ ${diffDays === 0 ? 'Due Today!' : diffDays + 'd left'}</span>`
        };
    } else {
        return {
            isPaid: false,
            isOverdue: false,
            isImminent: false,
            daysDiff: diffDays,
            formattedDate: formattedDate,
            badgeHtml: `<span class="deadline-pill deadline-upcoming" title="Payment deadline: ${formattedDate}">📅 ${formattedDate}</span>`
        };
    }
}

// Generate default fee records for a student
function getFeeDetailsForStudent(studentId) {
    studentId = Number(studentId) || 4;
    const db = getStudentFeesDatabase();
    if (db[studentId]) {
        // Non-destructive migration: preserve all previous data while ensuring new fields exist
        let modified = false;
        if (Array.isArray(db[studentId].items)) {
            db[studentId].items.forEach(it => {
                if (!it.dueDate) {
                    it.dueDate = (it.status === 'PAID')
                        ? (it.paidDate ? normalizeDateToIso(it.paidDate) : '2026-01-20')
                        : '2026-04-15';
                    modified = true;
                }
                if (!it.situation) {
                    it.situation = it.key === 'exam' ? 'Semester VI Regular Autonomous Exam' :
                                   it.key === 'tuition' ? 'Semester VI Regular Academic Fee' :
                                   it.key === 'lab' ? 'Autonomous AI & Computing Lab Facility' :
                                   it.key === 'library' ? 'Digital Library & Consortium Access' :
                                   it.key === 'placement' ? 'Corporate Readiness & Training' : 'Standard Institutional Fee';
                    modified = true;
                }
            });
            if (modified) {
                saveStudentFeesDatabase(db);
            }
        }
        return db[studentId];
    }

    // Standard fee structure per student
    const isExamDue = (studentId === 4 || studentId % 5 === 0);

    const feeProfile = {
        studentId: studentId,
        items: [
            {
                key: 'tuition',
                name: 'Semester VI Tuition & Academic Fee',
                category: 'Academic',
                situation: 'Semester VI Regular Academic Fee',
                amount: 65000,
                status: 'PAID',
                paidDate: '15 Jan 2026',
                dueDate: '2026-01-20',
                txnId: `KARE-TXN-${100000 + Number(studentId)}`,
                receiptNo: `REC-2026-${String(studentId).padStart(4, '0')}-01`
            },
            {
                key: 'exam',
                name: 'Autonomous Examination & Valuation Fee',
                category: 'Examinations',
                situation: isExamDue ? 'Autonomous End-Sem Exam Fee Clearance' : 'Standard Exam Registration',
                amount: 2500,
                status: isExamDue ? 'DUE' : 'PAID',
                paidDate: isExamDue ? null : '20 Feb 2026',
                dueDate: '2026-04-15',
                txnId: isExamDue ? null : `KARE-TXN-${200000 + Number(studentId)}`,
                receiptNo: isExamDue ? null : `REC-2026-${String(studentId).padStart(4, '0')}-02`
            },
            {
                key: 'lab',
                name: 'Autonomous Computing & High-Perf AI Lab Fee',
                category: 'Laboratories',
                situation: 'Autonomous AI & Computing Lab Facility',
                amount: 4000,
                status: 'PAID',
                paidDate: '18 Jan 2026',
                dueDate: '2026-01-25',
                txnId: `KARE-TXN-${300000 + Number(studentId)}`,
                receiptNo: `REC-2026-${String(studentId).padStart(4, '0')}-03`
            },
            {
                key: 'library',
                name: 'IEEE Digital Consortium & Library Membership',
                category: 'Facilities',
                situation: 'Digital Library & Consortium Access',
                amount: 1500,
                status: 'PAID',
                paidDate: '12 Jan 2026',
                dueDate: '2026-01-20',
                txnId: `KARE-TXN-${400000 + Number(studentId)}`,
                receiptNo: `REC-2026-${String(studentId).padStart(4, '0')}-04`
            },
            {
                key: 'placement',
                name: 'Campus Placement & Corporate Readiness Training',
                category: 'Career Development',
                situation: 'Corporate Readiness & Training',
                amount: 1000,
                status: 'PAID',
                paidDate: '10 Jan 2026',
                dueDate: '2026-01-20',
                txnId: `KARE-TXN-${500000 + Number(studentId)}`,
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

                const dlMeta = getDeadlineMeta(it.dueDate, it.status);

                return `
                    <div class="fee-item-row" style="${isDue ? 'background: rgba(244, 63, 94, 0.08); border-left: 4px solid #fb7185;' : ''}">
                        <div class="fee-item-left">
                            <div class="fee-item-icon" style="${isDue ? 'background: rgba(244, 63, 94, 0.2); border-color: #fb7185;' : ''}">
                                ${icon}
                            </div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span class="fee-item-name" style="${isDue ? 'color: #fff; font-weight: 800;' : ''}">${it.name}</span>
                                    ${it.isCustom ? `<span style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 1px 6px; border-radius: 4px; font-weight: 700;">SITUATIONAL</span>` : ''}
                                    ${it.situation ? `<span class="fee-situation-badge" title="${it.situation}">📋 ${it.situation}</span>` : ''}
                                </div>
                                <div class="fee-item-sub" style="margin-top: 3px;">
                                    Domain: <b style="color: #cbd5e1;">${it.category || 'Academic'}</b> &bull; 
                                    Ref: <span style="font-family: monospace; color: #a5b4fc;">${it.txnId || 'KARE/FEES/2026-' + it.key.toUpperCase()}</span> &bull; 
                                    ${isDue
                                        ? (dlMeta.isOverdue
                                            ? `<span style="color: #fb7185; font-weight: 800;">🚨 OVERDUE: Passed on ${dlMeta.formattedDate} (${Math.abs(dlMeta.daysDiff)}d overdue)</span>`
                                            : `<span style="color: #fbbf24; font-weight: 700;">⏰ Due Deadline: ${dlMeta.formattedDate} (${dlMeta.daysDiff === 0 ? 'Today' : dlMeta.daysDiff + 'd left'})</span>`
                                          )
                                        : 'Paid on ' + (it.paidDate || '15 Jan 2026')
                                    }
                                    ${it.paymentMode ? ` &bull; <span style="color: #94a3b8;">${it.paymentMode}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="fee-item-right">
                            <div class="fee-amount-block">
                                <div class="fee-amount-val" style="${isDue ? 'color: #fb7185; font-size: 18px;' : ''}">₹${it.amount.toLocaleString('en-IN')}</div>
                                <div style="margin-top: 3px; display: flex; gap: 4px; justify-content: flex-end; align-items: center;">
                                    <span class="fee-status-badge ${isDue ? 'status-due' : 'status-paid'}">
                                        ${isDue ? '● DUE NOW' : '✓ PAID'}
                                    </span>
                                    ${isDue ? dlMeta.badgeHtml : ''}
                                </div>
                            </div>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                ${isDue
                                    ? `<button type="button" class="btn btn-outline btn-sm" onclick="openAddCustomFeeModal()" style="border-color: #38bdf8; color: #38bdf8; font-weight: 700;">➕ Record Paid</button>`
                                    : `<button type="button" class="btn btn-outline btn-sm" onclick="openOfficialReceiptModal(${student.id}, '${it.key}')">📄 Receipt</button>`
                                }
                                ${it.isCustom ? `<button type="button" class="btn btn-outline btn-sm" style="color: #fb7185; border-color: rgba(244, 63, 94, 0.4); padding: 5px 8px;" title="Remove fee entry" onclick="deleteCustomFeePayment(${student.id}, '${it.key}')">🗑️</button>` : ''}
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
                        ${it.txnId || ('KARE-TXN-' + (100000 + studentId))}
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
                <h2>KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION (DEEMED TO BE UNIVERSITY)</h2>
                <div style="font-size: 11px; color: #64748b; font-weight: 700;">(UGC AUTONOMOUS &bull; ACCREDITED BY NAAC 'A+' & NBA)</div>
                <div style="font-size: 11px; color: #64748b;">Anand Nagar, Krishnankoil, Srivilliputtur, Tamil Nadu - 626126</div>
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
                <b>Official Certificate of Accounts:</b> This statement is an authentic institutional verification of accounts under KARE Deemed University CBCS regulations for the 2025-26 academic year. Valid for scholarship reimbursement, income-tax exemption claims (Section 80C), and autonomous admit card clearances.
            </div>

            <div class="receipt-stamp-row">
                <div>
                    <div class="receipt-seal" style="border-color: #4f46e5; color: #4f46e5;">✓ TREASURY CERTIFIED</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">KARE Finance Office &bull; Krishnankoil, Tamil Nadu</div>
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
                <h2>KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION (DEEMED TO BE UNIVERSITY)</h2>
                <div style="font-size: 11px; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">(UGC AUTONOMOUS &bull; ACCREDITED BY NAAC 'A+' & NBA)</div>
                <div style="font-size: 11px; color: #64748b;">Anand Nagar, Krishnankoil, Srivilliputtur, Tamil Nadu - 626126</div>
                <div class="receipt-badge">OFFICIAL FINANCIAL CLEARANCE E-RECEIPT</div>
            </div>

            <div class="receipt-meta-grid">
                <div class="receipt-meta-item">
                    <span>Receipt Number:</span>
                    <span>${item.receiptNo || 'REC-2026-0004-01'}</span>
                </div>
                <div class="receipt-meta-item">
                    <span>Transaction ID:</span>
                    <span>${item.txnId || 'KARE-TXN-100004'}</span>
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
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">KARE Finance & Treasury Verification</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: 'Brush Script MT', cursive; font-size: 20px; color: #1e1b4b;">R. K. Ramanathan</div>
                    <div style="font-size: 11px; font-weight: 700; color: #334155;">Finance Officer &bull; KARE (Deemed to be University)</div>
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
                <h2>KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION (DEEMED TO BE UNIVERSITY)</h2>
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
                        <span>KARE Campus &bull; Krishnankoil, Tamil Nadu (Hall 304, Seat CS-24)</span>
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
// 5. FACULTY COHORT MONITOR & SITUATIONAL FEE ENGINE
// ----------------------------------------------------
let facultyFeeFilterStatus = 'all';
let facultyFeeSearchTerm = '';
let currentFacultyManagingStudentId = null;

const FACULTY_SITUATION_PRESETS = {
    'remedial': {
        name: "Autonomous Remedial Examination Valuation Fee",
        category: "Examinations",
        amount: 1500,
        situation: "Supplementary registration for backlog subject evaluation",
        days: 14
    },
    'late_reg': {
        name: "Autonomous Late Registration Surcharge",
        category: "Penalties",
        amount: 500,
        situation: "Registration window missed by student; approved with standard late fee",
        days: 7
    },
    'lab_damage': {
        name: "AI Computing Lab Breakage & Consumables Fee",
        category: "Laboratories",
        amount: 1200,
        situation: "IoT microcontroller kit replacement and lab hardware surcharge",
        days: 14
    },
    'hostel_dues': {
        name: "Campus Hostel Accommodation & Dining Dues",
        category: "Hostel",
        amount: 24000,
        situation: "Semester VI boarding, power supply, and dining hall subscription",
        days: 21
    },
    'convocation': {
        name: "Autonomous Degree Convocation & Grade Sheet Fee",
        category: "Academic",
        amount: 3000,
        situation: "Consolidated grade card, autonomous degree scroll & graduation folder",
        days: 30
    },
    'waiver': {
        name: "Merit-cum-Need Academic Fee Concession",
        category: "Concession",
        amount: -5000,
        situation: "Fee concession sanctioned by Academic Council for financial hardship",
        days: 30
    },
    'custom': {
        name: "",
        category: "Academic",
        amount: 1000,
        situation: "",
        days: 14
    }
};

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
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px; color: #94a3b8;">Cohort student records loading or unavailable.</td></tr>`;
        return;
    }

    let totalDemand = 0;
    let totalCollected = 0;
    let totalClearedStudents = 0;
    let totalOverdueStudents = 0;

    // Filter cohort list
    let filteredStudents = studentList.filter(s => {
        const profile = getFeeDetailsForStudent(s.id);
        const sTotal = profile.items.reduce((acc, it) => acc + it.amount, 0);
        const sPaid = profile.items.filter(it => it.status === 'PAID').reduce((acc, it) => acc + it.amount, 0);
        const sDue = Math.max(0, sTotal - sPaid);
        const dueItems = profile.items.filter(it => it.status === 'DUE');

        const hasOverdue = dueItems.some(it => {
            const meta = getDeadlineMeta(it.dueDate, it.status);
            return meta.isOverdue;
        });

        totalDemand += sTotal;
        totalCollected += sPaid;
        if (sDue === 0) totalClearedStudents++;
        if (hasOverdue) totalOverdueStudents++;

        // Status filter
        if (facultyFeeFilterStatus === 'due' && sDue === 0) return false;
        if (facultyFeeFilterStatus === 'cleared' && sDue > 0) return false;
        if (facultyFeeFilterStatus === 'overdue' && !hasOverdue) return false;

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

        const dueItems = profile.items.filter(it => it.status === 'DUE');
        let deadlineBadge = `<span class="deadline-pill deadline-cleared">✓ Cleared</span>`;

        if (dueItems.length > 0) {
            // Sort due items by dueDate ascending to show nearest deadline
            const sorted = [...dueItems].sort((a, b) => {
                const da = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
                const db = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
                return da - db;
            });
            const earliest = sorted[0];
            const meta = getDeadlineMeta(earliest.dueDate, earliest.status);
            deadlineBadge = meta.badgeHtml;
        }

        return `
            <tr>
                <td><span style="font-family: monospace; font-size: 11px; color: #a5b4fc; font-weight: 700;">${rollNo}</span></td>
                <td>
                    <b>${s.name}</b>
                    ${profile.items.some(it => it.isCustom) ? `<span style="font-size: 9px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 1px 5px; border-radius: 3px; font-weight: 700; margin-left: 4px;">SITUATIONAL</span>` : ''}
                </td>
                <td><span style="background: rgba(99,102,241,0.15); color: #c7d2fe; font-size: 11px; padding: 2px 7px; border-radius: 4px; font-weight: 700;">${s.department}</span></td>
                <td><span style="color: ${avg >= 75 ? '#34d399' : '#fbbf24'}; font-weight: 700; font-size: 12px;">${avg.toFixed(1)}%</span></td>
                <td>₹${sTotal.toLocaleString('en-IN')}</td>
                <td style="color: #34d399; font-weight: 700;">₹${sPaid.toLocaleString('en-IN')}</td>
                <td style="color: ${sDue > 0 ? '#fb7185' : '#94a3b8'}; font-weight: 700;">₹${sDue.toLocaleString('en-IN')}</td>
                <td>${deadlineBadge}</td>
                <td>
                    <span class="fee-status-badge ${sDue === 0 ? 'status-paid' : 'status-due'}">
                        ${sDue === 0 ? '✓ CLEARED' : '● DUE PENDING'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="btn btn-outline btn-sm btn-table-action" onclick="openFacultyManageStudentFeesModal(${s.id})" title="Manage all fee items, edit amounts & deadlines" style="border-color: rgba(99,102,241,0.5); color: #c7d2fe; background: rgba(99,102,241,0.1);">
                            ⚙️ Manage
                        </button>
                        <button type="button" class="btn btn-outline btn-sm btn-table-action" onclick="openFacultyAddFeeModal(${s.id})" title="Add fee based on student situation" style="border-color: rgba(16,185,129,0.5); color: #34d399; background: rgba(16,185,129,0.1);">
                            ➕ Add
                        </button>
                        ${sDue > 0
                            ? `<button type="button" class="btn btn-outline btn-sm btn-table-action" onclick="sendIndividualFeeAlert(${s.id}, '${s.name}', ${sDue})" title="Send SMS / Email Reminder" style="border-color: rgba(244,63,94,0.4); color: #fb7185; background: rgba(244,63,94,0.08);">🔔</button>`
                            : ''
                        }
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rows.length > 0 ? rows.join('') : `<tr><td colspan="10" style="text-align: center; padding: 25px; color: #94a3b8;">No student fee records match current search / filter criteria.</td></tr>`;

    // Update KPI Pills
    const demandEl = document.getElementById("facFeeDemand");
    const collectedEl = document.getElementById("facFeeCollected");
    const pendingEl = document.getElementById("facFeePending");
    const overdueEl = document.getElementById("facFeeOverdueCount");
    const clearedEl = document.getElementById("facFeeClearedCount");

    if (demandEl) demandEl.innerText = `₹${(totalDemand / 100000).toFixed(2)} Lakhs`;
    if (collectedEl) collectedEl.innerText = `₹${(totalCollected / 100000).toFixed(2)} Lakhs`;
    if (pendingEl) pendingEl.innerText = `₹${((totalDemand - totalCollected) / 100000).toFixed(2)} Lakhs`;
    if (overdueEl) overdueEl.innerText = `${totalOverdueStudents} Students`;
    if (clearedEl) clearedEl.innerText = `${totalClearedStudents} / ${studentList.length} (${Math.round((totalClearedStudents / studentList.length) * 100)}%)`;

    // Highlight active filter button
    ['btnFacFeeAll', 'btnFacFeeDue', 'btnFacFeeOverdue', 'btnFacFeeCleared'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    const activeBtnId = facultyFeeFilterStatus === 'due' ? 'btnFacFeeDue' :
                        facultyFeeFilterStatus === 'overdue' ? 'btnFacFeeOverdue' :
                        facultyFeeFilterStatus === 'cleared' ? 'btnFacFeeCleared' : 'btnFacFeeAll';
    const activeBtn = document.getElementById(activeBtnId);
    if (activeBtn) activeBtn.classList.add('active');
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

// ----------------------------------------------------
// 6. FACULTY ADD FEE BASED ON SITUATION & DEADLINE
// ----------------------------------------------------
function openFacultyAddFeeModal(targetStudentId = null) {
    const modal = document.getElementById("facultyAddFeeModal");
    if (!modal) return;

    let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
        ? students
        : (typeof DEFAULT_STUDENTS !== 'undefined' ? DEFAULT_STUDENTS : []);

    const selectEl = document.getElementById("facAddFeeStudentSelect");
    if (selectEl) {
        let optionsHtml = `
            <option value="cohort_all">👥 Entire Cohort (All ${studentList.length} Students)</option>
            <option value="cohort_due">⚠️ Defaulter Cohort (Students with Pending Dues)</option>
            <optgroup label="Department Batch">
                <option value="dept_CSE">🏛️ CSE Department Students</option>
                <option value="dept_ECE">🏛️ ECE Department Students</option>
                <option value="dept_EEE">🏛️ EEE Department Students</option>
                <option value="dept_MECH">🏛️ MECH Department Students</option>
                <option value="dept_CIVIL">🏛️ CIVIL Department Students</option>
            </optgroup>
            <optgroup label="Individual Students">
        `;

        studentList.forEach(s => {
            const roll = s.rollNo || ('22A91A05' + String(s.id).padStart(2, '0'));
            optionsHtml += `<option value="student_${s.id}">${roll} - ${s.name} (${s.department})</option>`;
        });

        optionsHtml += `</optgroup>`;
        selectEl.innerHTML = optionsHtml;

        if (targetStudentId) {
            selectEl.value = `student_${targetStudentId}`;
        }
    }

    // Default deadline to +14 days from now
    setFacultyAddFeeDeadlineDays(14);

    // Apply default preset
    applyFacultyAddFeePreset('remedial');

    modal.classList.add("active");
}

function closeFacultyAddFeeModal() {
    const modal = document.getElementById("facultyAddFeeModal");
    if (modal) modal.classList.remove("active");
}

function applyFacultyAddFeePreset(presetKey) {
    const p = FACULTY_SITUATION_PRESETS[presetKey];
    if (!p) return;

    const nameInput = document.getElementById("facAddFeeName");
    const catInput = document.getElementById("facAddFeeCategory");
    const amtInput = document.getElementById("facAddFeeAmount");
    const sitInput = document.getElementById("facAddFeeSituation");

    if (nameInput) nameInput.value = p.name;
    if (catInput) catInput.value = p.category;
    if (amtInput) amtInput.value = p.amount;
    if (sitInput) sitInput.value = p.situation;

    if (p.days) setFacultyAddFeeDeadlineDays(p.days);
}

function setFacultyAddFeeDeadlineDays(days) {
    const dateInput = document.getElementById("facAddFeeDueDate");
    if (dateInput) {
        const future = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
        dateInput.value = future.toISOString().split('T')[0];
    }
}

function setFacultyAddFeeDeadlineDate(dateStr) {
    const dateInput = document.getElementById("facAddFeeDueDate");
    if (dateInput) dateInput.value = dateStr;
}

function handleFacultyAddFeeSubmit(e) {
    if (e) e.preventDefault();

    const targetVal = document.getElementById("facAddFeeStudentSelect")?.value;
    const name = document.getElementById("facAddFeeName")?.value?.trim();
    const category = document.getElementById("facAddFeeCategory")?.value || 'Academic';
    const situation = document.getElementById("facAddFeeSituation")?.value?.trim() || 'Faculty Special Assessment';
    const amount = Number(document.getElementById("facAddFeeAmount")?.value);
    const dueDate = document.getElementById("facAddFeeDueDate")?.value;
    const status = document.getElementById("facAddFeeStatus")?.value || 'DUE';
    const notes = document.getElementById("facAddFeeNotes")?.value?.trim() || '';

    if (!name || isNaN(amount)) {
        showToast("Please provide a valid fee name and amount.", "warning");
        return;
    }

    if (!dueDate) {
        showToast("Please specify a payment deadline date.", "warning");
        return;
    }

    let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
        ? students
        : (typeof DEFAULT_STUDENTS !== 'undefined' ? DEFAULT_STUDENTS : []);

    let targetStudentIds = [];

    if (targetVal === 'cohort_all') {
        targetStudentIds = studentList.map(s => s.id);
    } else if (targetVal === 'cohort_due') {
        targetStudentIds = studentList.filter(s => {
            const p = getFeeDetailsForStudent(s.id);
            const sTotal = p.items.reduce((acc, it) => acc + it.amount, 0);
            const sPaid = p.items.filter(it => it.status === 'PAID').reduce((acc, it) => acc + it.amount, 0);
            return (sTotal - sPaid) > 0;
        }).map(s => s.id);
    } else if (targetVal && targetVal.startsWith('dept_')) {
        const dept = targetVal.replace('dept_', '');
        targetStudentIds = studentList.filter(s => (s.department || '').toUpperCase() === dept.toUpperCase()).map(s => s.id);
    } else if (targetVal && targetVal.startsWith('student_')) {
        targetStudentIds = [Number(targetVal.replace('student_', ''))];
    } else if (!isNaN(Number(targetVal))) {
        targetStudentIds = [Number(targetVal)];
    }

    if (targetStudentIds.length === 0) {
        showToast("No target students matched selection.", "warning");
        return;
    }

    const db = getStudentFeesDatabase();
    const formattedPaidDate = status === 'PAID'
        ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : null;

    targetStudentIds.forEach(studentId => {
        if (!db[studentId]) getFeeDetailsForStudent(studentId);
        const profile = db[studentId];

        const itemKey = `sit_${Date.now()}_${studentId}_${Math.floor(Math.random() * 1000)}`;
        const newItem = {
            key: itemKey,
            name: name,
            category: category,
            situation: situation,
            amount: amount,
            status: status,
            dueDate: dueDate,
            paidDate: formattedPaidDate,
            txnId: status === 'PAID' ? `KARE-FAC-${Date.now().toString().slice(-6)}` : null,
            receiptNo: status === 'PAID' ? `REC-2026-${String(studentId).padStart(4, '0')}-${Date.now().toString().slice(-4)}` : null,
            notes: notes,
            isCustom: true,
            createdAt: new Date().toISOString()
        };

        profile.items.push(newItem);
    });

    saveStudentFeesDatabase(db);
    closeFacultyAddFeeModal();

    renderFacultyFeeMonitor();

    // If student manage modal is open, refresh it too
    if (currentFacultyManagingStudentId) {
        openFacultyManageStudentFeesModal(currentFacultyManagingStudentId);
    }

    // If student view is rendered, refresh it
    if (typeof renderStudentFeesView === 'function') {
        const stud = (typeof currentInspectedStudent !== 'undefined' && currentInspectedStudent)
            || (typeof students !== 'undefined' ? students.find(s => targetStudentIds.includes(s.id)) : null);
        if (stud) renderStudentFeesView(stud);
    }

    showToast(`✅ Situational fee "${name}" applied to ${targetStudentIds.length} student(s) with deadline ${formatFeeDate(dueDate)}!`, "success");
}

// ----------------------------------------------------
// 7. FACULTY MANAGE STUDENT FEES LEDGER & MODAL
// ----------------------------------------------------
function openFacultyManageStudentFeesModal(studentId) {
    studentId = Number(studentId) || 4;
    currentFacultyManagingStudentId = studentId;

    let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
        ? students
        : (typeof DEFAULT_STUDENTS !== 'undefined' ? DEFAULT_STUDENTS : []);

    const student = studentList.find(s => s.id === studentId) || { id: studentId, name: `Student #${studentId}`, department: 'CSE' };
    const profile = getFeeDetailsForStudent(studentId);

    const modal = document.getElementById("facultyManageStudentFeesModal");
    if (!modal) return;

    const sTotal = profile.items.reduce((acc, it) => acc + it.amount, 0);
    const sPaid = profile.items.filter(it => it.status === 'PAID').reduce((acc, it) => acc + it.amount, 0);
    const sDue = Math.max(0, sTotal - sPaid);
    const avg = Number(student.average || ((student.maths + student.science + student.english + student.programming) / 4) || 0);
    const rollNo = student.rollNo || ('22A91A05' + String(student.id).padStart(2, '0'));

    // Populate banner
    const bannerEl = document.getElementById("facManageStudentBanner");
    if (bannerEl) {
        bannerEl.innerHTML = `
            <div>
                <div style="font-size: 16px; font-weight: 800; color: #fff;">${student.name}</div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                    Roll: <span style="font-family: monospace; color: #38bdf8; font-weight: 700;">${rollNo}</span> &bull; 
                    Dept: <b style="color: #cbd5e1;">${student.department}</b> &bull; 
                    Academic Score: <b style="color: ${avg >= 75 ? '#34d399' : '#fbbf24'};">${avg.toFixed(1)}%</b>
                </div>
            </div>
            <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
                <div style="text-align: right;">
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">TOTAL DEMAND</div>
                    <div style="font-size: 16px; font-weight: 800; color: #38bdf8;">₹${sTotal.toLocaleString('en-IN')}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">COLLECTED</div>
                    <div style="font-size: 16px; font-weight: 800; color: #34d399;">₹${sPaid.toLocaleString('en-IN')}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">PENDING DUES</div>
                    <div style="font-size: 16px; font-weight: 800; color: ${sDue > 0 ? '#fb7185' : '#94a3b8'};">₹${sDue.toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <span class="fee-status-badge ${sDue === 0 ? 'status-paid' : 'status-due'}">
                        ${sDue === 0 ? '✓ 100% CLEARED' : '⚠️ DUES OUTSTANDING'}
                    </span>
                </div>
            </div>
        `;
    }

    // Populate Items List
    const listEl = document.getElementById("facManageFeeItemsList");
    if (listEl) {
        if (!profile.items || profile.items.length === 0) {
            listEl.innerHTML = `<div style="text-align: center; padding: 30px; color: #94a3b8;">No fee items recorded for this student.</div>`;
        } else {
            listEl.innerHTML = profile.items.map(it => {
                const isDue = it.status === 'DUE';
                const meta = getDeadlineMeta(it.dueDate, it.status);

                return `
                    <div class="faculty-fee-card ${isDue ? 'card-due' : 'card-paid'}">
                        <div style="flex: 1; min-width: 220px;">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <b style="font-size: 14px; color: #fff;">${it.name}</b>
                                <span style="font-size: 10px; background: rgba(99,102,241,0.2); color: #c7d2fe; padding: 1px 6px; border-radius: 4px; font-weight: 700;">${it.category || 'Academic'}</span>
                                ${it.isCustom ? `<span style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.4); padding: 1px 6px; border-radius: 4px; font-weight: 700;">SITUATIONAL</span>` : ''}
                            </div>
                            <div style="margin-top: 4px; font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>📋 <i>${it.situation || 'Standard Institutional Assessment'}</i></span>
                                ${it.notes ? `&bull; <span style="color: #cbd5e1;">Ref: ${it.notes}</span>` : ''}
                                ${it.paidDate ? `&bull; <span style="color: #34d399;">Paid: ${it.paidDate}</span>` : ''}
                            </div>
                        </div>

                        <div style="text-align: right; min-width: 140px;">
                            <div style="font-size: 16px; font-weight: 800; color: ${isDue ? '#fb7185' : '#34d399'};">
                                ₹${it.amount.toLocaleString('en-IN')}
                            </div>
                            <div style="margin-top: 4px; display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                                <span class="fee-status-badge ${isDue ? 'status-due' : 'status-paid'}">
                                    ${isDue ? '● DUE' : '✓ PAID'}
                                </span>
                                ${meta.badgeHtml}
                            </div>
                        </div>

                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button type="button" class="btn btn-outline btn-sm" onclick="openFacultyEditFeeModal(${studentId}, '${it.key}')" title="Edit fee details, situation, or deadline" style="padding: 4px 8px; font-size: 11px; border-color: rgba(245, 158, 11, 0.5); color: #fbbf24;">
                                ✏️ Edit
                            </button>
                            <button type="button" class="btn btn-outline btn-sm" onclick="toggleFacultyFeeItemStatus(${studentId}, '${it.key}')" title="${isDue ? 'Mark as Paid' : 'Revert to Due'}" style="padding: 4px 8px; font-size: 11px; ${isDue ? 'border-color: rgba(16,185,129,0.5); color: #34d399;' : 'border-color: rgba(244,63,94,0.4); color: #fb7185;'}">
                                ${isDue ? '✓ Clear' : '↺ Due'}
                            </button>
                            ${it.isCustom
                                ? `<button type="button" class="btn btn-outline btn-sm" onclick="deleteFacultyFeeItem(${studentId}, '${it.key}')" title="Delete fee item" style="padding: 4px 8px; font-size: 11px; border-color: rgba(244, 63, 94, 0.4); color: #fb7185;">🗑️</button>`
                                : ''
                            }
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    modal.classList.add("active");
}

function facultyQuickAddForCurrentStudent() {
    if (currentFacultyManagingStudentId) {
        openFacultyAddFeeModal(currentFacultyManagingStudentId);
    } else {
        openFacultyAddFeeModal();
    }
}

function closeFacultyManageStudentFeesModal() {
    const modal = document.getElementById("facultyManageStudentFeesModal");
    if (modal) modal.classList.remove("active");
}

// ----------------------------------------------------
// 8. FACULTY EDIT FEE ITEM MODAL
// ----------------------------------------------------
function openFacultyEditFeeModal(studentId, itemKey) {
    studentId = Number(studentId);
    const db = getStudentFeesDatabase();
    if (!db[studentId]) getFeeDetailsForStudent(studentId);
    const profile = db[studentId];
    if (!profile || !profile.items) return;

    const item = profile.items.find(x => x.key === itemKey);
    if (!item) {
        showToast("Fee item not found.", "warning");
        return;
    }

    let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
        ? students
        : (typeof DEFAULT_STUDENTS !== 'undefined' ? DEFAULT_STUDENTS : []);
    const student = studentList.find(s => s.id === studentId) || { id: studentId, name: `Student #${studentId}` };

    const modal = document.getElementById("facultyEditFeeModal");
    if (!modal) return;

    document.getElementById("facEditStudentId").value = studentId;
    document.getElementById("facEditItemKey").value = itemKey;
    document.getElementById("facEditStudentHeader").innerText = `Modifying fee for: ${student.name} (${student.rollNo || '22A91A05' + String(studentId).padStart(2,'0')})`;

    document.getElementById("facEditFeeName").value = item.name || '';
    document.getElementById("facEditFeeCategory").value = item.category || 'Academic';
    document.getElementById("facEditFeeSituation").value = item.situation || '';
    document.getElementById("facEditFeeAmount").value = item.amount || 0;
    document.getElementById("facEditFeeDueDate").value = item.dueDate ? normalizeDateToIso(item.dueDate) : new Date().toISOString().split('T')[0];
    document.getElementById("facEditFeeStatus").value = item.status || 'DUE';
    document.getElementById("facEditFeeNotes").value = item.notes || '';

    modal.classList.add("active");
}

function closeFacultyEditFeeModal() {
    const modal = document.getElementById("facultyEditFeeModal");
    if (modal) modal.classList.remove("active");
}

function setFacultyEditFeeDeadlineDays(days) {
    const dateInput = document.getElementById("facEditFeeDueDate");
    if (dateInput) {
        const future = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
        dateInput.value = future.toISOString().split('T')[0];
    }
}

function handleFacultyEditFeeSubmit(e) {
    if (e) e.preventDefault();

    const studentId = Number(document.getElementById("facEditStudentId")?.value);
    const itemKey = document.getElementById("facEditItemKey")?.value;
    const name = document.getElementById("facEditFeeName")?.value?.trim();
    const category = document.getElementById("facEditFeeCategory")?.value;
    const situation = document.getElementById("facEditFeeSituation")?.value?.trim() || '';
    const amount = Number(document.getElementById("facEditFeeAmount")?.value);
    const dueDate = document.getElementById("facEditFeeDueDate")?.value;
    const status = document.getElementById("facEditFeeStatus")?.value || 'DUE';
    const notes = document.getElementById("facEditFeeNotes")?.value?.trim() || '';

    if (!name || isNaN(amount)) {
        showToast("Please provide a valid fee name and amount.", "warning");
        return;
    }

    const db = getStudentFeesDatabase();
    if (!db[studentId] || !db[studentId].items) return;

    const item = db[studentId].items.find(x => x.key === itemKey);
    if (!item) return;

    item.name = name;
    item.category = category;
    item.situation = situation;
    item.amount = amount;
    item.dueDate = dueDate;
    item.notes = notes;

    // Handle status transition
    if (item.status !== status) {
        item.status = status;
        if (status === 'PAID') {
            item.paidDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            item.txnId = item.txnId || `KARE-FAC-${Date.now().toString().slice(-6)}`;
            item.receiptNo = item.receiptNo || `REC-2026-${String(studentId).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
        } else {
            item.paidDate = null;
            item.txnId = null;
        }
    }

    saveStudentFeesDatabase(db);
    closeFacultyEditFeeModal();

    // Refresh views
    if (currentFacultyManagingStudentId === studentId) {
        openFacultyManageStudentFeesModal(studentId);
    }
    renderFacultyFeeMonitor();

    if (typeof renderStudentFeesView === 'function') {
        let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
            ? students
            : (typeof DEFAULT_STUDENTS !== 'undefined' ? DEFAULT_STUDENTS : []);
        const s = studentList.find(x => x.id === studentId);
        if (s) renderStudentFeesView(s);
    }

    showToast(`✅ Fee item "${name}" updated with deadline ${formatFeeDate(dueDate)}!`, "success");
}

function toggleFacultyFeeItemStatus(studentId, itemKey) {
    studentId = Number(studentId);
    const db = getStudentFeesDatabase();
    if (!db[studentId] || !db[studentId].items) return;

    const item = db[studentId].items.find(x => x.key === itemKey);
    if (!item) return;

    if (item.status === 'PAID') {
        item.status = 'DUE';
        item.paidDate = null;
        item.txnId = null;
        showToast(`↺ Marked "${item.name}" as DUE.`, "info");
    } else {
        item.status = 'PAID';
        item.paidDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        item.txnId = `KARE-TXN-${Date.now().toString().slice(-6)}`;
        item.receiptNo = `REC-2026-${String(studentId).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
        showToast(`✓ Marked "${item.name}" as PAID.`, "success");
    }

    saveStudentFeesDatabase(db);

    if (currentFacultyManagingStudentId === studentId) {
        openFacultyManageStudentFeesModal(studentId);
    }
    renderFacultyFeeMonitor();

    if (typeof renderStudentFeesView === 'function') {
        let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
            ? students
            : (typeof DEFAULT_STUDENTS !== 'undefined' ? DEFAULT_STUDENTS : []);
        const s = studentList.find(x => x.id === studentId);
        if (s) renderStudentFeesView(s);
    }
}

function deleteFacultyFeeItem(studentId, itemKey) {
    if (!confirm("Are you sure you want to remove this fee record from this student's profile?")) return;

    studentId = Number(studentId);
    const db = getStudentFeesDatabase();
    if (!db[studentId] || !db[studentId].items) return;

    db[studentId].items = db[studentId].items.filter(x => x.key !== itemKey);
    saveStudentFeesDatabase(db);

    if (currentFacultyManagingStudentId === studentId) {
        openFacultyManageStudentFeesModal(studentId);
    }
    renderFacultyFeeMonitor();

    showToast("🗑️ Fee record removed successfully.", "info");
}

// ----------------------------------------------------
// 9. BATCH DEADLINE EXTENDER ENGINE
// ----------------------------------------------------
function openFacultyBatchDeadlineModal() {
    const modal = document.getElementById("facultyBatchDeadlineModal");
    if (!modal) return;

    setFacultyBatchDeadlineDays(14);
    modal.classList.add("active");
}

function closeFacultyBatchDeadlineModal() {
    const modal = document.getElementById("facultyBatchDeadlineModal");
    if (modal) modal.classList.remove("active");
}

function setFacultyBatchDeadlineDays(days) {
    const dateInput = document.getElementById("facBatchDueDate");
    if (dateInput) {
        const future = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
        dateInput.value = future.toISOString().split('T')[0];
    }
}

function setFacultyBatchDeadlineDate(dateStr) {
    const dateInput = document.getElementById("facBatchDueDate");
    if (dateInput) dateInput.value = dateStr;
}

function handleFacultyBatchDeadlineSubmit(e) {
    if (e) e.preventDefault();

    const scope = document.getElementById("facBatchScope")?.value || 'all_due';
    const dept = document.getElementById("facBatchTargetDept")?.value || 'all';
    const newDueDate = document.getElementById("facBatchDueDate")?.value;
    const reason = document.getElementById("facBatchReason")?.value?.trim() || 'Institutional deadline extension';
    const broadcastNotice = document.getElementById("facBatchBroadcastNotice")?.checked;

    if (!newDueDate) {
        showToast("Please choose a valid deadline date.", "warning");
        return;
    }

    let studentList = (typeof students !== 'undefined' && Array.isArray(students) && students.length > 0)
        ? students
        : (typeof DEFAULT_STUDENTS !== 'undefined' ? DEFAULT_STUDENTS : []);

    let targetStudents = studentList;
    if (dept !== 'all') {
        targetStudents = studentList.filter(s => (s.department || '').toUpperCase() === dept.toUpperCase());
    }

    const db = getStudentFeesDatabase();
    let updatedItemsCount = 0;

    targetStudents.forEach(s => {
        if (!db[s.id]) getFeeDetailsForStudent(s.id);
        const profile = db[s.id];
        if (!profile || !profile.items) return;

        profile.items.forEach(it => {
            if (it.status !== 'DUE') return;

            let matchesScope = false;
            if (scope === 'all_due') matchesScope = true;
            else if (scope === 'exam' && (it.category === 'Examinations' || it.key === 'exam')) matchesScope = true;
            else if (scope === 'tuition' && (it.category === 'Academic' || it.key === 'tuition')) matchesScope = true;
            else if (scope === 'lab' && (it.category === 'Laboratories' || it.key === 'lab')) matchesScope = true;

            if (matchesScope) {
                it.dueDate = newDueDate;
                it.situation = it.situation ? `${it.situation} (Deadline extended: ${reason})` : `Deadline extended: ${reason}`;
                updatedItemsCount++;
            }
        });
    });

    saveStudentFeesDatabase(db);
    closeFacultyBatchDeadlineModal();

    // Broadcast Notice if requested
    if (broadcastNotice) {
        const notices = getNoticesList();
        const noticeItem = {
            id: Date.now(),
            title: `DEADLINE EXTENSION: Fee Clearance Extended to ${formatFeeDate(newDueDate)}`,
            category: "fee",
            priority: "urgent",
            date: "Just Now",
            body: `The institutional deadline for outstanding fee dues has been officially extended to ${formatFeeDate(newDueDate)}. Authority Reason: "${reason}". Ensure clearance prior to the revised cutoff to avoid hall ticket withholding.`,
            sender: currentUser ? `${currentUser.name} (${currentUser.department})` : "Dean of Academics",
            target: dept === 'all' ? "All Cohorts" : `${dept} Department`
        };
        notices.unshift(noticeItem);
        saveNoticesList(notices);
        renderNoticesGrid();
    }

    renderFacultyFeeMonitor();
    if (currentFacultyManagingStudentId) {
        openFacultyManageStudentFeesModal(currentFacultyManagingStudentId);
    }

    showToast(`📅 Payment deadline extended to ${formatFeeDate(newDueDate)} for ${updatedItemsCount} pending fee records across ${targetStudents.length} students!`, "success");
}

// ----------------------------------------------------
// EXPOSE GLOBALS TO WINDOW
// ----------------------------------------------------
if (typeof window !== 'undefined') {
    window.getFeeDetailsForStudent = getFeeDetailsForStudent;
    window.getStudentFeesDatabase = getStudentFeesDatabase;
    window.saveStudentFeesDatabase = saveStudentFeesDatabase;
    window.getDeadlineMeta = getDeadlineMeta;
    window.formatFeeDate = formatFeeDate;

    window.renderFacultyFeeMonitor = renderFacultyFeeMonitor;
    window.filterFacultyFeeCohort = filterFacultyFeeCohort;
    window.searchFacultyFeeCohort = searchFacultyFeeCohort;
    window.sendBulkFeeReminders = sendBulkFeeReminders;
    window.sendIndividualFeeAlert = sendIndividualFeeAlert;

    window.openFacultyAddFeeModal = openFacultyAddFeeModal;
    window.closeFacultyAddFeeModal = closeFacultyAddFeeModal;
    window.applyFacultyAddFeePreset = applyFacultyAddFeePreset;
    window.setFacultyAddFeeDeadlineDays = setFacultyAddFeeDeadlineDays;
    window.setFacultyAddFeeDeadlineDate = setFacultyAddFeeDeadlineDate;
    window.handleFacultyAddFeeSubmit = handleFacultyAddFeeSubmit;

    window.openFacultyManageStudentFeesModal = openFacultyManageStudentFeesModal;
    window.closeFacultyManageStudentFeesModal = closeFacultyManageStudentFeesModal;
    window.facultyQuickAddForCurrentStudent = facultyQuickAddForCurrentStudent;

    window.openFacultyEditFeeModal = openFacultyEditFeeModal;
    window.closeFacultyEditFeeModal = closeFacultyEditFeeModal;
    window.setFacultyEditFeeDeadlineDays = setFacultyEditFeeDeadlineDays;
    window.handleFacultyEditFeeSubmit = handleFacultyEditFeeSubmit;

    window.toggleFacultyFeeItemStatus = toggleFacultyFeeItemStatus;
    window.deleteFacultyFeeItem = deleteFacultyFeeItem;

    window.openFacultyBatchDeadlineModal = openFacultyBatchDeadlineModal;
    window.closeFacultyBatchDeadlineModal = closeFacultyBatchDeadlineModal;
    window.setFacultyBatchDeadlineDays = setFacultyBatchDeadlineDays;
    window.setFacultyBatchDeadlineDate = setFacultyBatchDeadlineDate;
    window.handleFacultyBatchDeadlineSubmit = handleFacultyBatchDeadlineSubmit;
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
