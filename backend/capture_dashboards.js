const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const previewsDir = path.join(__dirname, '..', 'frontend', 'previews');

if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true });
}

async function capture() {
    console.log('🚀 Launching Chrome...');
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--disable-dev-shm-usage'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1.5 });

    // 1. Capture Faculty Dashboard
    console.log('📸 Navigating to Faculty Dashboard...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    await page.evaluate(() => {
        if (typeof quickLogin === 'function') quickLogin('admin');
        else if (typeof quickSwitchRole === 'function') quickSwitchRole('Faculty');
    });

    await page.waitForSelector('#facultyDashboardView', { visible: true, timeout: 10000 });
    await new Promise(r => setTimeout(r, 3000));

    const facultyPath = path.join(previewsDir, 'faculty_dashboard.png');
    await page.screenshot({ path: facultyPath, fullPage: true });
    console.log('✅ Faculty Dashboard captured at:', facultyPath);

    // 2. Capture Student Dashboard
    console.log('📸 Switching to Student Dashboard...');
    await page.evaluate(() => {
        if (typeof quickLogin === 'function') quickLogin('sneha');
        else if (typeof quickSwitchRole === 'function') quickSwitchRole('Student');
    });

    await page.waitForSelector('#studentDashboardView', { visible: true, timeout: 10000 });
    await new Promise(r => setTimeout(r, 3000));

    const studentPath = path.join(previewsDir, 'student_dashboard.png');
    await page.screenshot({ path: studentPath, fullPage: true });
    console.log('✅ Student Dashboard captured at:', studentPath);

    await browser.close();
    console.log('🎉 Both dashboards captured successfully in high resolution!');
}

capture().catch(err => {
    console.error('❌ Error capturing dashboards:', err);
    process.exit(1);
});
