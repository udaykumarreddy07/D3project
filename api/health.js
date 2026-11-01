/**
 * Vercel Serverless Function: /api/health
 */
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    return res.end(JSON.stringify({
        status: 'online',
        environment: 'vercel-serverless',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    }, null, 2));
};
