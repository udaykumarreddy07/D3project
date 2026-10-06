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

const { exec } = require('child_process');

function printConsoleSummary(activePort) {
    console.log('\n' + '='.repeat(68));
    console.log('       🎓 ACADEMIC ANALYTICS & STUDENT MARKSHEET PORTAL');
    console.log('='.repeat(68));

    try {
        const dataPath = path.join(__dirname, 'data', 'students.json');
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf-8');
            const list = JSON.parse(raw);
            const total = list.length;
            const passed = list.filter(s => s.maths >= 35 && s.science >= 35 && s.english >= 35 && s.programming >= 35).length;
            const passPct = ((passed / total) * 100).toFixed(1);
            const avgs = list.map(s => (s.maths + s.science + s.english + s.programming) / 4);
            const classAvg = (avgs.reduce((a, b) => a + b, 0) / total).toFixed(1);
            
            let topStudent = list[0];
            let topAvg = 0;
            list.forEach(s => {
                const a = (s.maths + s.science + s.english + s.programming) / 4;
                if (a > topAvg) { topAvg = a; topStudent = s; }
            });

            console.log(`📊 Cohort Analytics Summary:`);
            console.log(`   • Total Students : ${total}`);
            console.log(`   • Pass Rate      : ${passPct}% (${passed}/${total} passed)`);
            console.log(`   • Class Average  : ${classAvg}%`);
            console.log(`   • Top Performer  : ${topStudent.name} (${topStudent.department}) - ${topAvg.toFixed(2)}%`);
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
        }
    } catch (e) { }

    console.log('='.repeat(68));
    console.log(`🚀 Web Application Live at : http://localhost:${activePort}`);
    console.log(`📽️ Interactive Slides at   : http://localhost:${activePort}/presentation.html`);
    console.log(`✨ Launching your web browser automatically...`);
    console.log('='.repeat(68) + '\n');

    // Automatically launch default browser on local environments only
    if (!process.env.PORT && !process.env.VERCEL && !process.env.RENDER && process.env.NODE_ENV !== 'production') {
        const url = `http://localhost:${activePort}`;
        const startCmd = process.platform === 'win32' ? `start "" "${url}"` : (process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
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
