const db = require('../database/db');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const payload = {
        name: 'EduPulse Academic Portal REST API',
        status: 'online',
        endpoints: {
            students: '/api/students',
            analytics: '/api/analytics',
            arrears: '/api/arrears',
            toppers: '/api/toppers',
            health: '/api/health'
        },
        timestamp: new Date().toISOString()
    };
    if (typeof res.json === 'function') {
        return res.status(200).json(payload);
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify(payload, null, 2));
    }
};
