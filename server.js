const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
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

const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    let decodedUrl;
    try {
        decodedUrl = decodeURIComponent(cleanUrl);
    } catch {
        decodedUrl = cleanUrl;
    }

    if (decodedUrl === '/' || decodedUrl === '') {
        decodedUrl = '/index.html';
    }

    let filePath = path.join(__dirname, decodedUrl);

    // If path points to directory, serve index.html within that directory if present
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        const indexInDir = path.join(filePath, 'index.html');
        if (fs.existsSync(indexInDir)) {
            filePath = indexInDir;
        }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
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

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const nextPort = Number(PORT) + 1;
        console.log(`⚠️ Port ${PORT} is currently in use, automatically trying http://localhost:${nextPort}...`);
        server.listen(nextPort, () => {
            console.log(`🚀 Academic Analytics Portal running live at http://localhost:${nextPort}`);
            console.log(`📽️ Interactive presentation running at http://localhost:${nextPort}/presentation.html`);
        });
    } else {
        console.error('Server error:', err);
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Academic Analytics Portal running live at http://localhost:${PORT}`);
    console.log(`📽️ Interactive presentation running at http://localhost:${PORT}/presentation.html`);
});
