/**
 * EduPulse Build System
 * Reads modular CSS, JS, and HTML from the frontend directory,
 * inlines all dependencies, and compiles production bundles.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

// 1. Read Modular CSS Stylesheets
const stylesCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'styles.css'), 'utf8');
const authCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'auth.css'), 'utf8');
const dashboardCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'dashboard.css'), 'utf8');
const chartsCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'charts.css'), 'utf8');
const marksheetCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'marksheet.css'), 'utf8');
const feesNoticesCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'fees-notices.css'), 'utf8');
const assignmentsCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'assignments.css'), 'utf8');
const aiExplainerCss = fs.readFileSync(path.join(FRONTEND_DIR, 'css', 'ai-explainer.css'), 'utf8');

// 2. Read Modular JavaScript Controllers
const databaseJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'database.js'), 'utf8');
const dataJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'data.js'), 'utf8');
const authJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'auth.js'), 'utf8');
const marksheetJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'marksheet.js'), 'utf8');
const uiJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'ui.js'), 'utf8');
const chartsJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'charts.js'), 'utf8');
const feesNoticesJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'fees-notices.js'), 'utf8');
const assignmentsJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'assignments.js'), 'utf8');
const aiExplainerJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'ai-explainer.js'), 'utf8');
const appJs = fs.readFileSync(path.join(FRONTEND_DIR, 'js', 'app.js'), 'utf8');

// 3. Extract Body Markup from template.html (or index.html fallback)
const sourceHtmlPath = fs.existsSync(path.join(FRONTEND_DIR, 'template.html'))
    ? path.join(FRONTEND_DIR, 'template.html')
    : path.join(FRONTEND_DIR, 'index.html');

const indexHtml = fs.readFileSync(sourceHtmlPath, 'utf8');
const bodyMatch = indexHtml.match(/<body>([\s\S]*?)<!-- Modular JavaScript Controllers/i);
let bodyMarkup = bodyMatch ? bodyMatch[1].trim() : '';

// 4. Inline kare-logo.png as Base64 Data URI for 100% standalone portability
const logoPath = path.join(FRONTEND_DIR, 'kare-logo.png');
if (fs.existsSync(logoPath)) {
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    const logoDataUri = 'data:image/png;base64,' + logoBase64;
    bodyMarkup = bodyMarkup.replace(/src="kare-logo\.png"/g, `src="${logoDataUri}"`);
}

// 5. Generate Single-File All-in-One Distribution Bundle
const bundledHtml = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduPulse | Intelligent Campus Analytics & Student Marksheet Portal</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap"
        rel="stylesheet">

    <!-- D3.js Visualization Engine (High-Performance CDN with Local Fallback) -->
    <script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
    <script>
        if (typeof d3 === 'undefined') {
            document.write('<script src="d3.v7.min.js"><\\/script>');
        }
    </script>

<style>
${stylesCss}

${authCss}

${dashboardCss}

${chartsCss}

${marksheetCss}

${feesNoticesCss}

${assignmentsCss}

${aiExplainerCss}
</style>
</head>

<body>

${bodyMarkup}

<script>
${databaseJs}

${dataJs}

${authJs}

${marksheetJs}

${uiJs}

${chartsJs}

${feesNoticesJs}

${assignmentsJs}

${aiExplainerJs}

${appJs}
</script>
</body>

</html>
`;

// Write to frontend/index.html & frontend/uday.html
fs.writeFileSync(path.join(FRONTEND_DIR, 'index.html'), bundledHtml, 'utf8');
fs.writeFileSync(path.join(FRONTEND_DIR, 'uday.html'), bundledHtml, 'utf8');

// Also sync root uday.html for quick top-level offline launch if desired
fs.writeFileSync(path.join(ROOT_DIR, 'uday.html'), bundledHtml, 'utf8');

console.log('✅ Synchronized frontend/index.html & frontend/uday.html bundles (' + bundledHtml.length + ' bytes)');
console.log('✅ All CSS styles, JavaScript modules, and logos successfully compiled for production.');

