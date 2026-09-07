/**
 * Direct GitHub Repository Uploader for D3project
 * Target: https://github.com/udaykumarreddy07/D3project
 *
 * Usage:
 *   node push_to_github.js <YOUR_GITHUB_TOKEN>
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const token = (process.argv[2] || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
const owner = 'udaykumarreddy07';
const repoName = 'D3project';
const branch = 'main';

if (!token) {
    console.log(`
================================================================================
🔑 GitHub Personal Access Token Required!
================================================================================

Target Repository: https://github.com/${owner}/${repoName}

To get your token (takes 30 seconds):
1. Open in browser: https://github.com/settings/tokens/new
2. Note: "D3project Push"
3. Expiration: 30 days (or whatever you prefer)
4. Check the box for: [x] repo (Full control of private repositories)
5. Click "Generate token" at the bottom and copy the token (starts with ghp_ or github_pat_)

Then run:
   node push_to_github.js YOUR_COPIED_TOKEN

================================================================================
`);
    process.exit(1);
}

function githubRequest(endpoint, method, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'User-Agent': 'NodeJS-GitHub-Uploader',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        };

        if (data) {
            options.headers['Content-Type'] = 'application/json';
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(parsed);
                } else {
                    reject({ status: res.statusCode, data: parsed });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    const ignoreList = new Set(['node_modules', '.git', 'push_to_github.js']);
    
    files.forEach(file => {
        if (ignoreList.has(file)) return;
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

async function uploadViaGitDataApi(rootDir, allFiles) {
    console.log(`📦 Uploading ${allFiles.length} files as blobs to GitHub...`);
    const treeItems = [];

    for (let i = 0; i < allFiles.length; i++) {
        const filePath = allFiles[i];
        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        const contentBuffer = fs.readFileSync(filePath);
        const base64Content = contentBuffer.toString('base64');

        process.stdout.write(`  [${i + 1}/${allFiles.length}] Uploading ${relativePath}... `);
        const blobRes = await githubRequest(`/repos/${owner}/${repoName}/git/blobs`, 'POST', {
            content: base64Content,
            encoding: 'base64'
        });

        treeItems.push({
            path: relativePath,
            mode: '100644',
            type: 'blob',
            sha: blobRes.sha
        });
        console.log(`✔`);
    }

    console.log(`\n🌲 Creating Git Tree...`);
    const treeRes = await githubRequest(`/repos/${owner}/${repoName}/git/trees`, 'POST', {
        tree: treeItems
    });
    console.log(`✔ Tree SHA: ${treeRes.sha}`);

    // Check if branch exists to get parent commit
    let parentCommitSha = null;
    try {
        const refRes = await githubRequest(`/repos/${owner}/${repoName}/git/ref/heads/${branch}`, 'GET');
        if (refRes && refRes.object && refRes.object.sha) {
            parentCommitSha = refRes.object.sha;
        }
    } catch (e) {
        // Branch might not exist yet
    }

    console.log(`📝 Creating Git Commit...`);
    const commitPayload = {
        message: 'Initial project upload: Academic Analytics Portal',
        tree: treeRes.sha,
        parents: parentCommitSha ? [parentCommitSha] : []
    };
    const commitRes = await githubRequest(`/repos/${owner}/${repoName}/git/commits`, 'POST', commitPayload);
    console.log(`✔ Commit SHA: ${commitRes.sha}`);

    console.log(`🚀 Updating branch reference '${branch}'...`);
    if (parentCommitSha) {
        await githubRequest(`/repos/${owner}/${repoName}/git/refs/heads/${branch}`, 'PATCH', {
            sha: commitRes.sha,
            force: true
        });
    } else {
        await githubRequest(`/repos/${owner}/${repoName}/git/refs`, 'POST', {
            ref: `refs/heads/${branch}`,
            sha: commitRes.sha
        });
    }
}

async function uploadViaContentsApi(rootDir, allFiles) {
    console.log(`📦 Fallback: Uploading via Contents API...`);
    let count = 0;
    for (const filePath of allFiles) {
        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        const contentBuffer = fs.readFileSync(filePath);
        const base64Content = contentBuffer.toString('base64');

        let sha = null;
        try {
            const existing = await githubRequest(`/repos/${owner}/${repoName}/contents/${relativePath}`, 'GET');
            if (existing && existing.sha) sha = existing.sha;
        } catch (e) {}

        const payload = {
            message: `Add ${relativePath}`,
            content: base64Content,
            branch: branch
        };
        if (sha) {
            payload.sha = sha;
            payload.message = `Update ${relativePath}`;
        }

        await githubRequest(`/repos/${owner}/${repoName}/contents/${relativePath}`, 'PUT', payload);
        count++;
        console.log(`  ✔ [${count}/${allFiles.length}] Uploaded ${relativePath}`);
    }
}

async function main() {
    console.log(`\n================================================================================`);
    console.log(`🚀 Pushing project to https://github.com/${owner}/${repoName}`);
    console.log(`================================================================================\n`);

    const rootDir = __dirname;
    const allFiles = getAllFiles(rootDir);
    console.log(`📋 Discovered ${allFiles.length} files in project directory.\n`);

    try {
        await uploadViaGitDataApi(rootDir, allFiles);
    } catch (err) {
        console.warn(`⚠️ Git Data API upload encountered an error:`, err.data ? (err.data.message || JSON.stringify(err.data)) : err);
        console.log(`🔄 Retrying with Contents API...`);
        try {
            await uploadViaContentsApi(rootDir, allFiles);
        } catch (contentsErr) {
            console.error(`\n❌ Upload failed:`, contentsErr.data ? (contentsErr.data.message || JSON.stringify(contentsErr.data)) : contentsErr);
            process.exit(1);
        }
    }

    console.log(`
================================================================================
🎉 All files pushed successfully!
🌐 Check your public repository now:
   https://github.com/${owner}/${repoName}
================================================================================
`);
}

main();
