/* ====================================================
   AI EXPLAINER & ACADEMIC COPILOT CONTROLLER
   Dual-Engine: Faculty Analytics Advisor & Student Academic Mentor
==================================================== */

let aiChatHistory = [];
let isAiExplainerOpen = false;

// Initial Welcome Presets
const FACULTY_WELCOME_MSG = {
    role: "assistant",
    time: "Just now",
    text: `👋 **Welcome, Professor!** I am your **Autonomous Academic Analytics AI Copilot**.
I can assist you with:
- 📊 **Cohort Analytics**: Deep dive into grade distributions, subject weaknesses, and toppers.
- ⚠️ **Student Interventions**: Identifying students requiring remedial coaching or attendance recovery.
- 📝 **Assignment Rubrics**: Drafting evaluation criteria, max marks allocation, and syllabus mapping.
- ⚖️ **Autonomous Regulations**: Pass/fail thresholds (min 35 marks), CBCS SGPA weighting, and examination eligibility.

*Click any prompt chip above or ask any doubt below!*`
};

const STUDENT_WELCOME_MSG = {
    role: "assistant",
    time: "Just now",
    text: `👋 **Hello!** I am your **Personal Academic Mentor & Doubt Clearing AI**.
I'm here to guide your studies and clear any academic doubts:
- 🎓 **Transcript & SGPA Breakdown**: Clear doubts on your subject scores, grade points, and semester percentage.
- 📝 **Assignments & Coursework**: Guidance on assignment requirements, due dates, and faculty feedback.
- 💡 **Concept Explanations**: Ask me to explain concepts in *Programming, D3.js, Maths, Science, or English*!
- 🎟️ **Exam Clearance**: Check your attendance eligibility (≥75%) and statutory clearance.

*How can I help you excel today?*`
};

// Initialize AI Explainer
function initAiExplainer() {
    const isFaculty = currentUser && currentUser.role === 'Faculty';
    const initialMsg = isFaculty ? FACULTY_WELCOME_MSG : STUDENT_WELCOME_MSG;

    // Reset or load history
    if (aiChatHistory.length === 0) {
        aiChatHistory = [initialMsg];
    }

    renderAiExplainerChat();
    updateAiRoleUI();
}

function updateAiRoleUI() {
    const isFaculty = currentUser && currentUser.role === 'Faculty';
    const titleEl = document.getElementById("aiExplainerTitle");
    const subEl = document.getElementById("aiExplainerSub");
    const roleBadge = document.getElementById("aiExplainerRoleBadge");
    const chipsContainer = document.getElementById("aiChipsContainer");

    if (titleEl) {
        titleEl.textContent = isFaculty ? "Faculty Analytics Copilot" : "Student Academic Mentor";
    }
    if (subEl) {
        subEl.textContent = isFaculty ? "BIET Cohort Intelligence & Evaluation Engine" : "Autonomous Doubt Solver & Study Assistant";
    }
    if (roleBadge) {
        roleBadge.textContent = isFaculty ? "👨‍🏫 FACULTY COPILOT" : "🎓 STUDENT MENTOR";
    }

    // Populate Dynamic Context Chips
    if (chipsContainer) {
        if (isFaculty) {
            chipsContainer.innerHTML = `
                <div class="ai-chip" onclick="handleAiChipClick('Summarize overall cohort performance and grade distribution')">📊 Cohort Summary</div>
                <div class="ai-chip" onclick="handleAiChipClick('Which students are at academic risk or need remedial attention?')">⚠️ At-Risk Students</div>
                <div class="ai-chip" onclick="handleAiChipClick('Explain CBCS SGPA grading criteria and pass marks threshold')">⚖️ Grading Rules</div>
                <div class="ai-chip" onclick="handleAiChipClick('Suggest evaluation rubrics for D3.js programming project')">📝 Project Rubric</div>
                <div class="ai-chip" onclick="handleAiChipClick('What are the statutory attendance requirements for exam hall tickets?')">🎟️ Exam Eligibility</div>
            `;
        } else {
            chipsContainer.innerHTML = `
                <div class="ai-chip" onclick="handleAiChipClick('Explain my current marks, percentage and SGPA breakdown')">🎓 My Marks & SGPA</div>
                <div class="ai-chip" onclick="handleAiChipClick('Am I eligible to appear for the autonomous semester exams?')">🎟️ Exam Eligibility</div>
                <div class="ai-chip" onclick="handleAiChipClick('Explain the D3.js assignment requirements and how to score full marks')">📝 Assignment Guide</div>
                <div class="ai-chip" onclick="handleAiChipClick('Explain D3.js scales, axes, and SVG transitions with a simple code snippet')">💡 Explain D3.js</div>
                <div class="ai-chip" onclick="handleAiChipClick('How can I improve my grades to achieve Grade O (≥90%)?')">📈 Study Tips for O Grade</div>
            `;
        }
    }
}

// Toggle Modal / Drawer
function toggleAiExplainer(forceOpen = null) {
    const modal = document.getElementById("aiExplainerModal");
    if (!modal) return;

    if (forceOpen !== null) {
        isAiExplainerOpen = forceOpen;
    } else {
        isAiExplainerOpen = !isAiExplainerOpen;
    }

    if (isAiExplainerOpen) {
        modal.classList.add("active");
        updateAiRoleUI();
        renderAiExplainerChat();
        const inputField = document.getElementById("aiChatInput");
        if (inputField) inputField.focus();
    } else {
        modal.classList.remove("active");
    }
}

// Handle Quick Chip Click
function handleAiChipClick(query) {
    const inputField = document.getElementById("aiChatInput");
    if (inputField) {
        inputField.value = query;
        sendAiMessage();
    }
}

// Render Messages
function renderAiExplainerChat() {
    const chatBody = document.getElementById("aiChatBody");
    if (!chatBody) return;

    chatBody.innerHTML = aiChatHistory.map(msg => {
        const isUser = msg.role === 'user';
        const formattedText = formatAiMarkdown(msg.text);

        return `
            <div class="ai-message ${isUser ? 'ai-msg-user' : 'ai-msg-assistant'}">
                <div class="ai-msg-avatar">
                    ${isUser ? '👤' : '✨'}
                </div>
                <div class="ai-msg-bubble">
                    ${formattedText}
                </div>
            </div>
        `;
    }).join("");

    chatBody.scrollTop = chatBody.scrollHeight;
}

// Lightweight Markdown Formatter
function formatAiMarkdown(rawText) {
    if (!rawText) return "";
    let formatted = rawText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // Italics
    formatted = formatted.replace(/\*(.*?)\*/g, '<i>$1</i>');
    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.4); padding: 10px; border-radius: 8px; overflow-x: auto; font-size: 11px; margin: 8px 0; color: #34d399;"><code>$1</code></pre>');
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bullet points
    formatted = formatted.replace(/^- (.*$)/gim, '• $1<br>');
    // Newlines
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

// Send Message Handler
function sendAiMessage(e) {
    if (e) e.preventDefault();

    const inputField = document.getElementById("aiChatInput");
    if (!inputField) return;

    const query = inputField.value.trim();
    if (!query) return;

    // Add User Message
    aiChatHistory.push({
        role: "user",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: query
    });

    inputField.value = "";
    renderAiExplainerChat();

    // Show Typing Indicator
    const chatBody = document.getElementById("aiChatBody");
    const typingId = `ai-typing-${Date.now()}`;
    if (chatBody) {
        chatBody.insertAdjacentHTML('beforeend', `
            <div class="ai-message ai-msg-assistant" id="${typingId}">
                <div class="ai-msg-avatar">✨</div>
                <div class="ai-typing-indicator">
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                </div>
            </div>
        `);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Process Query with Knowledge Reasoning Engine
    setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        const responseText = generateAiReasoning(query);
        aiChatHistory.push({
            role: "assistant",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: responseText
        });

        renderAiExplainerChat();
    }, 450);
}

function clearAiChat() {
    aiChatHistory = [];
    initAiExplainer();
    showToast("AI Explainer conversation cleared.", "info");
}

/* ====================================================
   AI REASONING & KNOWLEDGE BASE ENGINE
==================================================== */
function generateAiReasoning(query) {
    const q = query.toLowerCase();
    const isFaculty = currentUser && currentUser.role === 'Faculty';
    const currStudent = (typeof getStudentForUser === 'function')
        ? getStudentForUser(currentUser)
        : (typeof students !== 'undefined' ? students.find(s => s.id === 4) : null);

    const cohort = (typeof students !== 'undefined' && students.length > 0) ? students : [];
    const assignments = (typeof getAssignmentsList === 'function') ? getAssignmentsList() : [];

    // --- 1. D3.JS / DATA VISUALIZATION CONCEPT DOUBTS ---
    if (q.includes("d3") || q.includes("svg") || q.includes("chart") || q.includes("scale") || q.includes("transition")) {
        return `📊 **D3.js Data Visualization Concepts & Mechanics**
D3.js (Data-Driven Documents v7) binds dataset records directly to SVG and HTML elements.

**Key Architectural Concepts:**
1. **Scales (\`d3.scaleLinear\`, \`d3.scaleBand\`)**: Maps mathematical data domain to visual pixel range.
\`\`\`javascript
const xScale = d3.scaleBand()
  .domain(data.map(d => d.name))
  .range([0, width])
  .padding(0.2);

const yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0]);
\`\`\`
2. **Axes (\`d3.axisBottom\`, \`d3.axisLeft\`)**: Automatically generates tick marks, labels, and coordinate grids.
3. **Data Join / Enter-Update-Exit**:
   - \`.enter()\`: Creates new DOM elements for added data points.
   - \`.merge()\`: Applies updates to both existing and new nodes.
   - \`.exit().remove()\`: Cleans up deleted records with smooth fade-outs.
4. **Smooth Transitions**:
\`\`\`javascript
svg.selectAll(".bar")
  .transition()
  .duration(800)
  .ease(d3.easeCubicOut)
  .attr("y", d => yScale(d.score));
\`\`\`
**Rubric Tip**: Ensure charts include responsive viewBox attributes and dynamic tooltips on mouseover/touch!`;
    }

    // --- 2. SGPA / GRADING & FORMULA DOUBTS ---
    if (q.includes("sgpa") || q.includes("cgpa") || q.includes("grade") || q.includes("calculate") || q.includes("formula") || q.includes("percentage")) {
        let personalContext = "";
        if (!isFaculty && currStudent) {
            personalContext = `\n\n📌 **Your Verified Standing (${currStudent.name}):**
- Maths: **${currStudent.maths}** | Science: **${currStudent.science}** | English: **${currStudent.english}** | Programming: **${currStudent.programming}**
- Total: **${currStudent.total} / 400** (${currStudent.average.toFixed(2)}%)
- Calculated SGPA: **${(currStudent.average / 10).toFixed(2)} / 10** (Grade **${currStudent.grade}**)`;
        }

        return `⚖️ **Autonomous CBCS SGPA & Grading Formula**
Under the Autonomous Choice Based Credit System (CBCS):

1. **Credit Weighting Formula**:
$$\\text{SGPA} = \\frac{\\sum (C_i \\times G_i)}{\\sum C_i}$$
Where $C_i$ = Subject Credits (4 credits per core course), $G_i$ = Grade Point scored.

2. **Letter Grade Mapping**:
- **Grade O (Outstanding)**: $\\ge 90\\%$ (Grade Point: 10)
- **Grade A+ (Excellent)**: $80\\% - 89.9\\%$ (Grade Point: 9)
- **Grade A (Very Good)**: $70\\% - 79.9\\%$ (Grade Point: 8)
- **Grade B+ (Good)**: $60\\% - 69.9\\%$ (Grade Point: 7)
- **Grade B (Above Average)**: $50\\% - 59.9\\%$ (Grade Point: 6)
- **Grade C (Pass Minimum)**: $35\\% - 49.9\\%$ (Grade Point: 5)
- **Grade F (Fail / Arrear)**: $< 35\\%$ (Grade Point: 0)

3. **Pass Criteria**: Minimum 35% in every individual theory paper and 40% aggregate.${personalContext}`;
    }

    // --- 3. EXAM ELIGIBILITY / ATTENDANCE / HALL TICKET DOUBTS ---
    if (q.includes("eligib") || q.includes("attendance") || q.includes("hall ticket") || q.includes("fee") || q.includes("admit card")) {
        if (!isFaculty && currStudent) {
            const att = currStudent.attendance || 88;
            const attOk = att >= 75;
            return `🎟️ **Semester Examination Hall Ticket & Eligibility Status**
**Candidate:** ${currStudent.name} (${currStudent.rollNo})

1. **Biometric Attendance Check**:
   - Required: **75.0%**
   - Your Attendance: **${att}%** ➔ ${attOk ? '✅ **QUALIFIED**' : '❌ **SHORTAGE (Condonation Required)**'}
2. **Statutory Financial Clearance**:
   - Examination & Valuation Fee: ₹2,500
   - Clearance Status: **Online Payment Channel Active**
3. **Verdict**: ${attOk ? 'You meet the 75% attendance threshold! Once statutory examination dues are finalized, your verified QR-coded Hall Ticket unlocks automatically.' : 'Attendance is below 75%. Please submit a medical condonation application to the Dean of Academics.'}`;
        }

        return `🎟️ **Autonomous Examination Clearance & Statutory Norms**
For all undergraduate and post-graduate cohorts:
- **Biometric Attendance Threshold**: Minimum **75%** overall attendance across lecture and laboratory sessions. Condonation permitted between 65% - 74.9% only on documented medical grounds with principal approval.
- **Financial Dues**: Zero pending balance for Semester Tuition and Examination Valuation fees.
- **Admit Card Generation**: Instant digital issuance with encrypted verification signature once clearance is certified by the accounts section.`;
    }

    // --- 4. ASSIGNMENTS / SUBMISSION DOUBTS ---
    if (q.includes("assignment") || q.includes("homework") || q.includes("due") || q.includes("submission") || q.includes("mark")) {
        if (!isFaculty && currStudent) {
            const mySubs = [];
            assignments.forEach(a => {
                const sub = (a.submissions || []).find(s => s.studentId === currStudent.id);
                mySubs.push({ asg: a, sub: sub });
            });

            const pending = mySubs.filter(x => !x.sub);
            const graded = mySubs.filter(x => x.sub && x.sub.status === 'Graded');

            return `📝 **My Assignment Status & Coursework Summary**
- **Total Published Coursework**: ${assignments.length} assignments
- **Evaluated & Graded**: ${graded.length} (${graded.map(g => `${g.asg.subject}: ${g.sub.marksAwarded}/${g.asg.maxMarks}`).join(", ") || "None yet"})
- **Pending Submission**: ${pending.length} ${pending.length > 0 ? `(Deadline priority: ${pending[0].asg.title} - due ${pending[0].asg.endDate})` : "None - all submitted! 🎉"}

**How to Score Full Marks:**
1. Upload clean PDF documentation or code archives via the **Upload Solution** button.
2. Address each rubric point detailed in the assignment guidelines.
3. Submit prior to the deadline to avoid late submission penalties!`;
        }

        // Faculty context
        let totalSubs = 0;
        let totalGraded = 0;
        assignments.forEach(a => {
            const s = a.submissions || [];
            totalSubs += s.length;
            totalGraded += s.filter(x => x.status === 'Graded').length;
        });

        return `📝 **Faculty Coursework Administration Overview**
- Active Assignments: **${assignments.length}**
- Total Student Submissions: **${totalSubs}**
- Evaluated & Marks Recorded: **${totalGraded}**
- Pending Review: **${totalSubs - totalGraded}**

**Recommendation**: Navigate to the **Assignments & Grading** tab to view student attachments, award numerical scores out of maximum marks, and furnish personalized feedback!`;
    }

    // --- 5. COHORT / AT-RISK STUDENTS (FACULTY INQUIRY) ---
    if (isFaculty && (q.includes("at-risk") || q.includes("risk") || q.includes("fail") || q.includes("cohort") || q.includes("remedial") || q.includes("topper"))) {
        const failing = cohort.filter(s => s.status === 'Fail' || s.average < 50);
        const toppers = [...cohort].sort((a, b) => b.average - a.average).slice(0, 3);
        const avgCohort = cohort.length > 0
            ? ((typeof d3 !== 'undefined' && typeof d3.mean === 'function')
                ? d3.mean(cohort, s => s.average)
                : cohort.reduce((acc, curr) => acc + (curr.average || 0), 0) / cohort.length).toFixed(1)
            : "78.0";

        return `📊 **Cohort Academic Audit & Diagnostic Telemetry**
- **Enrolled Cohort Size**: ${cohort.length} Students
- **Batch Average Percentage**: **${avgCohort}%**
- **Identified At-Risk Students (<50% or Arrears)**: **${failing.length}** students
${failing.map(s => `  • **${s.name}** (${s.rollNo}, ${s.department}): Avg **${s.average.toFixed(1)}%**, Maths: ${s.maths}, Prog: ${s.programming}`).join("\n") || "  • None! All students are currently passing."}

- **Top Cohort Performers**:
${toppers.map((t, idx) => `  ${idx + 1}. **${t.name}** (${t.department}) - **${t.average.toFixed(1)}%** (Grade ${t.grade})`).join("\n")}

**Pedagogical Intervention Plan**:
1. Schedule 45-minute remedial peer-learning sessions for students scoring <40 in Programming.
2. Offer practice problem sets with step-by-step solutions in Differential Equations.`;
    }

    // --- 6. STUDENT PERSONAL IMPROVEMENT TIPS ---
    if (!isFaculty && (q.includes("improve") || q.includes("tips") || q.includes("study") || q.includes("score") || q.includes("o grade"))) {
        const weakest = currStudent ? [
            { name: "Maths", score: currStudent.maths },
            { name: "Science", score: currStudent.science },
            { name: "English", score: currStudent.english },
            { name: "Programming", score: currStudent.programming }
        ].sort((a, b) => a.score - b.score)[0] : { name: "English", score: 82 };

        return `📈 **Targeted Action Plan to Achieve Grade 'O' ($\\ge 90\\%$)**
Your primary growth focus subject is **${weakest.name}** (Current score: **${weakest.score}**).

**Strategic Roadmap:**
1. **Bridge the Marks Delta**:
   - You need approximately **+${Math.max(1, 92 - weakest.score)} marks** in ${weakest.name} to push your semester aggregate to Outstanding (Grade O).
2. **Continuous Evaluation Leverage**:
   - Ensure 100% on internal coursework assignments (these count for 25% of your final semester grade).
3. **Examination Blueprint**:
   - Focus on Unit 3 & Unit 4 autonomous question bank questions, as they historically carry 40% weight in semester-end exams.
4. **Peer Benchmarking**:
   - Review top scoring projects in the **Academic Dossier** to benchmark coding standards and documentation rigor.`;
    }

    // --- 7. GENERAL SMART FALLBACK ---
    if (isFaculty) {
        return `🤖 **Faculty Academic Assistant Query Analysis**
Regarding *"_${query}_"*:

- **System Context**: Cohort of ${cohort.length} students across CSE, ECE, EEE, MECH, and CIVIL departments.
- **Workflow Suggestion**:
  - To view or edit grades: Open the **Master Records Gradebook** or **Marksheet Hub**.
  - To assign projects: Open the **Assignments & Grading** tab and click **+ Create New Assignment**.
  - To notify students: Open the **Broadcasts & Notices** tab.

Feel free to ask specific questions about any student (e.g. *"Analyze Arun Kumar"* or *"Explain pass rules"*).`;
    } else {
        return `🤖 **Student Academic Mentor Response**
Regarding *"_${query}_"*:

- **Your Academic Profile**: ${currStudent ? currStudent.name : 'Enrolled Student'} (${currStudent ? currStudent.department : 'CSE'} Dept)
- **Continuous Evaluation**: ${assignments.length} assignments active in your portal.
- **Next Recommended Action**:
  - Visit **My Assignments & Marks** to submit solutions before deadlines.
  - Check **My Semester Marksheet** for verified subject grades.

Need a specific concept explained? Ask me: *"Explain D3 transitions"*, *"Calculate my SGPA"*, or *"How to get full assignment marks"*!`;
    }
}
