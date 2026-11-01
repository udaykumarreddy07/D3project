/**
 * EduPulse Backend Application Server
 * Serves frontend static assets, provides RESTful API endpoints,
 * connects with the database layer, and logs cohort analytics.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const db = require('../database/db');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

// Helper: send JSON response
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data, null, 2));
}

// Helper: read request body
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // ====================================================
    // REST API ENDPOINTS (/api/*)
    // ====================================================
    if (pathname.startsWith('/api/')) {
        try {
            // Health Check
            if (pathname === '/api/health') {
                return sendJson(res, 200, {
                    status: 'online',
                    version: '2.0.0',
                    timestamp: new Date().toISOString()
                });
            }

            // Analytics & Statistics
            if (pathname === '/api/analytics') {
                return sendJson(res, 200, db.getAnalytics());
            }

            // Arrears / At-Risk Students
            if (pathname === '/api/arrears') {
                return sendJson(res, 200, db.getStudentsWithArrears());
            }

            // Toppers / High Achievers
            if (pathname === '/api/toppers') {
                const limit = parseInt(parsedUrl.searchParams.get('limit') || '5', 10);
                return sendJson(res, 200, db.getTopStudents(limit));
            }

            // Students CRUD: /api/students and /api/students/:id
            if (pathname === '/api/students' || pathname.startsWith('/api/students/')) {
                const parts = pathname.split('/').filter(Boolean); // ['api', 'students', 'id?']
                const id = parts[2];

                if (req.method === 'GET') {
                    if (id) {
                        const student = db.getStudentById(id);
                        if (!student) return sendJson(res, 404, { error: 'Student not found' });
                        return sendJson(res, 200, student);
                    } else {
                        const dept = parsedUrl.searchParams.get('department');
                        if (dept) {
                            return sendJson(res, 200, db.getStudentsByDepartment(dept));
                        }
                        return sendJson(res, 200, db.getAllStudents());
                    }
                }

                if (req.method === 'POST') {
                    const body = await parseRequestBody(req);
                    const created = db.insertStudent(body);
                    return sendJson(res, 201, created);
                }

                if (req.method === 'PUT' && id) {
                    const body = await parseRequestBody(req);
                    const updated = db.updateStudent(id, body);
                    if (!updated) return sendJson(res, 404, { error: 'Student not found' });
                    return sendJson(res, 200, updated);
                }

                if (req.method === 'DELETE' && id) {
                    const deleted = db.deleteStudent(id);
                    if (!deleted) return sendJson(res, 404, { error: 'Student not found' });
                    return sendJson(res, 200, { success: true, message: `Student ${id} deleted` });
                }
            }

            return sendJson(res, 404, { error: 'API endpoint not found' });
        } catch (err) {
            console.error('API Error:', err);
            return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
        }
    }

    // ====================================================
    // STATIC FRONTEND FILE SERVING
    // ====================================================
    let decodedUrl;
    try {
        decodedUrl = decodeURIComponent(pathname);
    } catch {
        decodedUrl = pathname;
    }

    if (decodedUrl === '/' || decodedUrl === '') {
        decodedUrl = '/index.html';
    }

    // Resolve file inside frontend directory
    let filePath = path.join(FRONTEND_DIR, decodedUrl);

    // If path points to a directory, check for index.html inside
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        const indexInDir = path.join(filePath, 'index.html');
        if (fs.existsSync(indexInDir)) {
            filePath = indexInDir;
        }
    }

    // Fallback: check project root if not found in frontend (for presentation pptx, etc.)
    if (!fs.existsSync(filePath)) {
        const rootCandidate = path.join(__dirname, '..', decodedUrl);
        if (fs.existsSync(rootCandidate) && !fs.statSync(rootCandidate).isDirectory()) {
            filePath = rootCandidate;
        }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found: ' + decodedUrl);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

function printConsoleSummary(activePort) {
    console.log('\n' + '='.repeat(68));
    console.log('       🎓 ACADEMIC ANALYTICS & STUDENT MARKSHEET PORTAL');
    console.log('       🏗️  Modular Architecture: Frontend / Backend / Database');
    console.log('='.repeat(68));

    try {
        const stats = db.getAnalytics();
        const list = db.getAllStudents();

        console.log(`📊 Cohort Analytics Summary:`);
        console.log(`   • Total Students : ${stats.totalStudents}`);
        console.log(`   • Pass Rate      : ${stats.passRate} (${stats.passedStudents}/${stats.totalStudents} passed)`);
        console.log(`   • Class Average  : ${stats.classAverage}`);
        console.log(`   • Top Performer  : ${stats.topPerformer.name} (${stats.topPerformer.department}) - ${stats.topPerformer.average}`);
        console.log('-'.repeat(68));

        console.log(`📋 Student Roster Sample:`);
        const preview = list.slice(0, 6).map(s => {
            const avg = ((s.maths + s.science + s.english + s.programming) / 4).toFixed(1);
            const status = (s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35) ? 'PASS' : 'FAIL';
            return {
                ID: s.id,
                Name: s.name,
                Dept: s.department,
                Avg: `${avg}%`,
                Attendance: `${s.attendance}%`,
                Status: status
            };
        });
        console.table(preview);
    } catch (e) {
        console.warn('Analytics summary skipped:', e.message);
    }

    console.log('='.repeat(68));
    console.log(`🚀 Web Application Live at : http://localhost:${activePort}`);
    console.log(`📡 REST API Endpoint at    : http://localhost:${activePort}/api/students`);
    console.log(`📊 Analytics API at        : http://localhost:${activePort}/api/analytics`);
    console.log(`📽️ Interactive Slides at   : http://localhost:${activePort}/presentation/index.html`);
    console.log(`✨ Launching your web browser automatically...`);
    console.log('='.repeat(68) + '\n');

    // Automatically launch default browser on local environments
    if (!process.env.PORT && !process.env.VERCEL && !process.env.RENDER && process.env.NODE_ENV !== 'production') {
        const url = `http://localhost:${activePort}`;
        const startCmd = process.platform === 'win32'
            ? `start "" "${url}"`
            : (process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
        try { exec(startCmd, () => {}); } catch (e) {}
    }
}

let currentPort = Number(PORT);

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const busyPort = currentPort;
        currentPort++;
        console.log(`⚠️ Port ${busyPort} is in use, automatically trying http://localhost:${currentPort}...`);
        setTimeout(() => {
            try { server.close(); } catch (e) {}
            server.listen(currentPort, '0.0.0.0', () => {
                printConsoleSummary(currentPort);
            });
        }, 150);
    } else {
        console.error('Server error:', err);
    }
});

server.listen(currentPort, '0.0.0.0', () => {
    printConsoleSummary(currentPort);
});

module.exports = server;
