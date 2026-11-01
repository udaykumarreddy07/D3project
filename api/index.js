/**
 * Vercel Serverless Function Handler
 * Routes all /api/* requests on Vercel deployment to the database layer
 */

const db = require('../database/db');

module.exports = async (req, res) => {
    // Enable CORS for universal frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const parsedUrl = new URL(req.url, `${proto}://${host}`);
    const pathname = parsedUrl.pathname;

    // Helper: JSON response
    const sendJson = (status, data) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data, null, 2));
    };

    // Helper: Parse body
    const parseBody = () => {
        return new Promise((resolve) => {
            if (req.body && typeof req.body === 'object') return resolve(req.body);
            let raw = '';
            req.on('data', chunk => raw += chunk);
            req.on('end', () => {
                try {
                    resolve(raw ? JSON.parse(raw) : {});
                } catch {
                    resolve({});
                }
            });
        });
    };

    try {
        // Base /api or /api/health
        if (pathname === '/api' || pathname === '/api/' || pathname === '/api/health') {
            return sendJson(200, {
                status: 'online',
                environment: 'vercel-serverless',
                version: '2.0.0',
                endpoints: [
                    '/api/students',
                    '/api/analytics',
                    '/api/arrears',
                    '/api/toppers',
                    '/api/health'
                ],
                timestamp: new Date().toISOString()
            });
        }

        // Cohort Analytics
        if (pathname === '/api/analytics') {
            return sendJson(200, db.getAnalytics());
        }

        // Remedial / Arrears Students
        if (pathname === '/api/arrears') {
            return sendJson(200, db.getStudentsWithArrears());
        }

        // Academic Toppers
        if (pathname === '/api/toppers') {
            const limit = parseInt(parsedUrl.searchParams.get('limit') || '5', 10);
            return sendJson(200, db.getTopStudents(limit));
        }

        // Students CRUD
        if (pathname === '/api/students' || pathname.startsWith('/api/students/')) {
            const parts = pathname.split('/').filter(Boolean);
            const id = parts[2]; // /api/students/:id

            if (req.method === 'GET') {
                if (id) {
                    const student = db.getStudentById(id);
                    if (!student) return sendJson(404, { error: 'Student not found' });
                    return sendJson(200, student);
                } else {
                    const dept = parsedUrl.searchParams.get('department');
                    if (dept) {
                        return sendJson(200, db.getStudentsByDepartment(dept));
                    }
                    return sendJson(200, db.getAllStudents());
                }
            }

            if (req.method === 'POST') {
                const body = await parseBody();
                const created = db.insertStudent(body);
                return sendJson(201, created);
            }

            if (req.method === 'PUT' && id) {
                const body = await parseBody();
                const updated = db.updateStudent(id, body);
                if (!updated) return sendJson(404, { error: 'Student not found' });
                return sendJson(200, updated);
            }

            if (req.method === 'DELETE' && id) {
                const deleted = db.deleteStudent(id);
                if (!deleted) return sendJson(404, { error: 'Student not found' });
                return sendJson(200, { success: true, message: `Student ${id} deleted` });
            }
        }

        return sendJson(404, { error: 'Endpoint not found', path: pathname });
    } catch (err) {
        return sendJson(500, { error: 'Internal Server Error', message: err.message });
    }
};

