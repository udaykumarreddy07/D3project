const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9228;
const TARGET_URL = 'http://localhost:3000/hardcopy.html';
const OUTPUT_PDF = path.join(__dirname, 'Academic_Analytics_Portal_Final_Project_Report.pdf');

async function getWebSocketDebuggerUrl(port) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const check = () => {
            attempts++;
            http.get(`http://127.0.0.1:${port}/json`, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const tabs = JSON.parse(data);
                        // IMPORTANT: Filter specifically for the real web page target
                        const pageTab = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
                        if (pageTab) {
                            console.log(`🎯 Found Page Target: "${pageTab.title}" (${pageTab.url})`);
                            resolve(pageTab.webSocketDebuggerUrl);
                        } else {
                            if (attempts < 30) setTimeout(check, 400);
                            else reject(new Error('No page-type target found in Chrome session'));
                        }
                    } catch (e) {
                        if (attempts < 30) setTimeout(check, 400);
                        else reject(e);
                    }
                });
            }).on('error', err => {
                if (attempts < 30) setTimeout(check, 400);
                else reject(err);
            });
        };
        check();
    });
}

async function generatePDF() {
    console.log('🚀 Starting headless Chrome for PDF compilation...');
    const chrome = spawn(CHROME_PATH, [
        '--headless',
        `--remote-debugging-port=${DEBUG_PORT}`,
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=C:\\Users\\udayk\\AppData\\Local\\Temp\\chrome_pdf_clean'
    ]);

    try {
        const wsUrl = await getWebSocketDebuggerUrl(DEBUG_PORT);
        console.log('🔗 Connecting to CDP Page WebSocket:', wsUrl);

        const ws = new WebSocket(wsUrl);
        let id = 1;
        const pending = new Map();

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && pending.has(msg.id)) {
                const { resolve, reject } = pending.get(msg.id);
                pending.delete(msg.id);
                if (msg.error) reject(msg.error);
                else resolve(msg.result);
            }
        };

        await new Promise((resolve, reject) => {
            ws.onopen = () => resolve();
            ws.onerror = (err) => reject(err);
        });

        const send = (method, params = {}) => new Promise((resolve, reject) => {
            const reqId = id++;
            pending.set(reqId, { resolve, reject });
            ws.send(JSON.stringify({ id: reqId, method, params }));
        });

        console.log('📄 Enabling Page & Runtime domains...');
        await send('Page.enable');
        await send('Runtime.enable');

        console.log(`🌐 Navigating to ${TARGET_URL}...`);
        await send('Page.navigate', { url: TARGET_URL });

        // Wait for page load and table populating
        console.log('⏳ Waiting for full 100-student roster to populate DOM...');
        await new Promise(r => setTimeout(r, 4500));

        console.log('🖨️ Calling Page.printToPDF with A4 dimensions & printBackground: true...');
        const printResult = await send('Page.printToPDF', {
            paperWidth: 8.27,      // A4 width in inches
            paperHeight: 11.69,    // A4 height in inches
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false
        });

        console.log('💾 Writing compiled PDF buffer to disk...');
        const pdfBuffer = Buffer.from(printResult.data, 'base64');
        fs.writeFileSync(OUTPUT_PDF, pdfBuffer);

        const stats = fs.statSync(OUTPUT_PDF);
        console.log(`\n🎉 SUCCESS! Hardcopy Project Report compiled:`);
        console.log(`   📁 Output File: ${OUTPUT_PDF}`);
        console.log(`   📦 File Size  : ${(stats.size / 1024).toFixed(1)} KB`);

        ws.close();
    } catch (err) {
        console.error('❌ Failed to compile PDF:', err);
    } finally {
        chrome.kill();
        process.exit(0);
    }
}

generatePDF();
