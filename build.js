const fs = require('fs');
const path = require('path');

// 1. Read Modular Files
const stylesCss = fs.readFileSync(path.join(__dirname, 'css', 'styles.css'), 'utf8');
const authCss = fs.readFileSync(path.join(__dirname, 'css', 'auth.css'), 'utf8');
const dashboardCss = fs.readFileSync(path.join(__dirname, 'css', 'dashboard.css'), 'utf8');
const chartsCss = fs.readFileSync(path.join(__dirname, 'css', 'charts.css'), 'utf8');
const marksheetCss = fs.readFileSync(path.join(__dirname, 'css', 'marksheet.css'), 'utf8');

const dataJs = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');
const authJs = fs.readFileSync(path.join(__dirname, 'js', 'auth.js'), 'utf8');
const marksheetJs = fs.readFileSync(path.join(__dirname, 'js', 'marksheet.js'), 'utf8');
const uiJs = fs.readFileSync(path.join(__dirname, 'js', 'ui.js'), 'utf8');
const chartsJs = fs.readFileSync(path.join(__dirname, 'js', 'charts.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// 2. Extract Body Markup from index.html
const bodyMatch = indexHtml.match(/<body>([\s\S]*?)<!-- Modular JavaScript Controllers/i);
const bodyMarkup = bodyMatch ? bodyMatch[1].trim() : '';

// 3. Generate Single-File All-in-One Distribution (uday.html)
const bundledHtml = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Academic Analytics & Student Marksheet Portal | BIET Autonomous</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap"
        rel="stylesheet">

    <!-- D3.js with fallback -->
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script>
        if (typeof d3 === 'undefined') {
            document.write('<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"><\\/script>');
        }
    </script>

<style>
${stylesCss}

${authCss}

${dashboardCss}

${chartsCss}

${marksheetCss}
</style>
</head>

<body>

${bodyMarkup}

<script>
${dataJs}

${authJs}

${marksheetJs}

${uiJs}

${chartsJs}

${appJs}
</script>
</body>

</html>
`;

fs.writeFileSync(path.join(__dirname, 'uday.html'), bundledHtml, 'utf8');
console.log('✅ Synchronized uday.html bundle with modular assets (' + bundledHtml.length + ' bytes)');
console.log('✅ Modular files in css/ and js/ validated and up to date.');
