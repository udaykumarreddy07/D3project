/**
 * Vercel Serverless Function: /api/students
 */
const db = require('../database/db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    try {
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const parsedUrl = new URL(req.url, `${proto}://${host}`);

        if (req.method === 'GET') {
            const dept = parsedUrl.searchParams.get('department');
            if (dept) {
                return res.end(JSON.stringify(db.getStudentsByDepartment(dept), null, 2));
            }
            return res.end(JSON.stringify(db.getAllStudents(), null, 2));
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', c => body += c);
            req.on('end', () => {
                const parsed = body ? JSON.parse(body) : {};
                const created = db.insertStudent(parsed);
                res.statusCode = 201;
                return res.end(JSON.stringify(created, null, 2));
            });
            return;
        }

        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
    }
};
