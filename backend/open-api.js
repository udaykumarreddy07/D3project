#!/usr/bin/env node
/**
 * Direct API Opener Utility
 * Opens the deployed Vercel API (or local API endpoint) directly in your default browser.
 * 
 * Usage:
 *   node backend/open-api.js
 *   node backend/open-api.js https://your-app.vercel.app
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Resolve Vercel / API URL from CLI args, Environment variables, or vercel.config.json
let targetUrl = process.argv[2] || process.env.VERCEL_URL || process.env.API_URL || '';

if (!targetUrl) {
    const configPath = path.join(__dirname, '..', 'vercel.config.json');
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.vercelUrl && config.vercelUrl.trim()) {
                const endpoint = config.defaultApiEndpoint || '/api/students';
                let base = config.vercelUrl.trim().replace(/\/+$/, '');
                if (!base.startsWith('http://') && !base.startsWith('https://')) {
                    base = 'https://' + base;
                }
                targetUrl = `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
            }
        } catch (e) {}
    }
}

// Fallback to local API endpoint if no Vercel URL found
if (!targetUrl) {
    targetUrl = 'http://localhost:3000/api/students';
} else {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
    }
    if (!targetUrl.includes('/api')) {
        targetUrl = targetUrl.replace(/\/+$/, '') + '/api/students';
    }
}

console.log('\n' + '='.repeat(68));
console.log('       🚀 OPENING DEPLOYED REST API DIRECTLY IN BROWSER');
console.log('='.repeat(68));
console.log(`🌐 API Target URL : ${targetUrl}`);
console.log('='.repeat(68) + '\n');

const startCmd = process.platform === 'win32'
    ? `start "" "${targetUrl}"`
    : (process.platform === 'darwin' ? `open "${targetUrl}"` : `xdg-open "${targetUrl}"`);

try {
    exec(startCmd, (err) => {
        if (err) console.error('Failed to launch browser:', err.message);
        else console.log('✅ Browser launched successfully.');
    });
} catch (e) {
    console.error('Launch error:', e.message);
}

