const db = require('../database/db');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        return res.end();
    }

    try {
        const arrears = db.getStudentsWithArrears();
        if (typeof res.json === 'function') {
            return res.status(200).json(arrears);
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.end(JSON.stringify(arrears, null, 2));
        }
    } catch (e) {
        if (typeof res.json === 'function') {
            return res.status(500).json({ error: e.message });
        } else {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: e.message }));
        }
    }
};
