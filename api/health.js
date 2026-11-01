module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const payload = {
        status: 'online',
        environment: 'vercel-serverless',
        version: '2.0.0',
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
