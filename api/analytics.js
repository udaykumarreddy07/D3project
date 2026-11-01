/**
 * Vercel Serverless Function: /api/analytics
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
        const stats = db.getAnalytics();
        res.statusCode = 200;
        return res.end(JSON.stringify(stats, null, 2));
    } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
    }
};
