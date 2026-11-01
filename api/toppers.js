/**
 * Vercel Serverless Function: /api/toppers
 */
const db = require('../database/db');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
        const limit = parseInt(parsedUrl.searchParams.get('limit') || '5', 10);
        const toppers = db.getTopStudents(limit);
        res.statusCode = 200;
        return res.end(JSON.stringify(toppers, null, 2));
    } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
    }
};
