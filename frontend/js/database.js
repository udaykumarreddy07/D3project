/* ====================================================
   EDUPULSE LOCALSTORAGE DATABASE ENGINE (EduPulseDB)
   High-Performance Client-Side ORM & Storage Manager
==================================================== */

(function (window) {
    'use strict';

    // Primary Storage Keys Mapping
    const DB_KEYS = {
        students: 'student_dashboard_data_v6_100',
        assignments: 'portal_assignments_v1',
        fees: 'portal_student_fees_v1',
        notices: 'portal_notices_v1',
        users: 'portal_users_db',
        audit: 'edupulse_audit_logs_v1'
    };

    // In-memory defensive cache fallback
    const _cache = {};

    function _rawGet(key) {
        try {
            const val = localStorage.getItem(key);
            if (val !== null) return val;
            const sess = sessionStorage.getItem(key);
            if (sess !== null) return sess;
            return _cache[key] || null;
        } catch (e) {
            return _cache[key] || null;
        }
    }

    function _rawSet(key, val) {
        _cache[key] = val;
        try {
            localStorage.setItem(key, val);
        } catch (e) {
            try {
                sessionStorage.setItem(key, val);
            } catch (err) {
                console.warn("[EduPulseDB] Storage write quota exceeded, stored in memory cache.", err);
            }
        }
    }

    function _rawRemove(key) {
        delete _cache[key];
        try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        } catch (e) { }
    }

    // Collection Wrapper Class
    class Collection {
        constructor(name, storageKey) {
            this.name = name;
            this.key = storageKey;
        }

        getAll() {
            const raw = _rawGet(this.key);
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : (typeof parsed === 'object' && parsed !== null ? parsed : []);
            } catch (e) {
                console.error(`[EduPulseDB] Failed parsing collection: ${this.name}`, e);
                return [];
            }
        }

        setAll(data) {
            _rawSet(this.key, JSON.stringify(data));
            EduPulseDB.logAction('COLLECTION_SYNC', `Updated collection ${this.name} (${Array.isArray(data) ? data.length : Object.keys(data).length} entries)`);
            return data;
        }

        findById(id) {
            const list = this.getAll();
            if (Array.isArray(list)) {
                return list.find(item => String(item.id) === String(id)) || null;
            }
            return list[id] || null;
        }

        insert(item) {
            const list = this.getAll();
            if (Array.isArray(list)) {
                if (!item.id) item.id = Date.now();
                list.push(item);
                this.setAll(list);
                return item;
            } else if (typeof list === 'object' && list !== null) {
                const key = item.id || Date.now();
                list[key] = item;
                this.setAll(list);
                return item;
            }
            return null;
        }

        update(id, updates) {
            const list = this.getAll();
            if (Array.isArray(list)) {
                const idx = list.findIndex(item => String(item.id) === String(id));
                if (idx !== -1) {
                    list[idx] = Object.assign({}, list[idx], updates);
                    this.setAll(list);
                    return list[idx];
                }
            } else if (typeof list === 'object' && list !== null) {
                if (list[id]) {
                    list[id] = Object.assign({}, list[id], updates);
                    this.setAll(list);
                    return list[id];
                }
            }
            return null;
        }

        delete(id) {
            const list = this.getAll();
            if (Array.isArray(list)) {
                const filtered = list.filter(item => String(item.id) !== String(id));
                this.setAll(filtered);
                return true;
            } else if (typeof list === 'object' && list !== null) {
                delete list[id];
                this.setAll(list);
                return true;
            }
            return false;
        }

        query(filterFn) {
            const list = this.getAll();
            if (Array.isArray(list)) {
                return typeof filterFn === 'function' ? list.filter(filterFn) : list;
            }
            return [];
        }

        count() {
            const list = this.getAll();
            return Array.isArray(list) ? list.length : Object.keys(list).length;
        }
    }

    // Master EduPulseDB Object
    const EduPulseDB = {
        version: "2.1.0",
        name: "EduPulse Institutional LocalStorage Database",

        // Collection accessor
        collection(name) {
            const key = DB_KEYS[name] || `edupulse_${name}_v1`;
            return new Collection(name, key);
        },

        // Fast accessors
        students: new Collection('students', DB_KEYS.students),
        assignments: new Collection('assignments', DB_KEYS.assignments),
        fees: new Collection('fees', DB_KEYS.fees),
        notices: new Collection('notices', DB_KEYS.notices),
        users: new Collection('users', DB_KEYS.users),
        audit: new Collection('audit', DB_KEYS.audit),

        // Record Audit Logs
        logAction(action, details) {
            try {
                const raw = _rawGet(DB_KEYS.audit);
                const logs = raw ? JSON.parse(raw) : [];
                logs.unshift({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    action,
                    details,
                    user: (typeof currentUser !== 'undefined' && currentUser ? currentUser.name : 'System')
                });
                if (logs.length > 100) logs.pop();
                _rawSet(DB_KEYS.audit, JSON.stringify(logs));
            } catch (e) { }
        },

        // Detailed Storage Health & Stats
        getStorageStats() {
            let totalBytes = 0;
            const tableDetails = {};

            Object.keys(DB_KEYS).forEach(table => {
                const key = DB_KEYS[table];
                const raw = _rawGet(key) || '';
                const bytes = raw.length * 2; // UTF-16 approximation
                totalBytes += bytes;
                let count = 0;
                try {
                    const parsed = JSON.parse(raw);
                    count = Array.isArray(parsed) ? parsed.length : (typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0);
                } catch (e) { }

                tableDetails[table] = {
                    key,
                    bytes,
                    kb: (bytes / 1024).toFixed(2),
                    count
                };
            });

            const maxQuotaBytes = 5 * 1024 * 1024; // 5MB standard HTML5 LocalStorage limit
            const usedPercent = Math.min(100, ((totalBytes / maxQuotaBytes) * 100)).toFixed(2);

            return {
                tables: tableDetails,
                totalBytes,
                totalKB: (totalBytes / 1024).toFixed(2),
                maxQuotaMB: 5,
                usedPercent,
                timestamp: new Date().toLocaleTimeString()
            };
        },

        // Full Database Backup to JSON File
        exportBackup() {
            const dump = {
                _schema: "EduPulseDB_v2",
                exportedAt: new Date().toISOString(),
                version: this.version,
                data: {}
            };

            Object.keys(DB_KEYS).forEach(table => {
                const key = DB_KEYS[table];
                const raw = _rawGet(key);
                try {
                    dump.data[table] = raw ? JSON.parse(raw) : null;
                } catch (e) {
                    dump.data[table] = raw;
                }
            });

            const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `EduPulse_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof showToast === 'function') {
                showToast("📥 Database backup successfully downloaded as JSON file!", "success");
            }
            this.logAction('DATABASE_BACKUP', 'Exported full JSON snapshot of all collections.');
        },

        // Restore Database from JSON
        restoreBackup(jsonString) {
            try {
                const dump = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
                if (!dump.data) throw new Error("Invalid EduPulseDB backup structure: missing 'data' root.");

                Object.keys(dump.data).forEach(table => {
                    const key = DB_KEYS[table];
                    if (key && dump.data[table] !== null && dump.data[table] !== undefined) {
                        _rawSet(key, JSON.stringify(dump.data[table]));
                    }
                });

                this.logAction('DATABASE_RESTORE', 'Restored database from external JSON backup.');
                if (typeof showToast === 'function') {
                    showToast("✅ Database successfully restored from backup! Refreshing...", "success");
                }
                setTimeout(() => window.location.reload(), 800);
                return true;
            } catch (err) {
                console.error("[EduPulseDB] Restore error:", err);
                if (typeof showToast === 'function') {
                    showToast(`⚠️ Backup restore failed: ${err.message}`, "error");
                }
                return false;
            }
        },

        // Factory Reset Database to Defaults
        resetDatabase() {
            if (!confirm("Are you sure you want to reset the LocalStorage database to official factory seed data? All custom entries will be reverted.")) {
                return false;
            }

            Object.keys(DB_KEYS).forEach(table => {
                _rawRemove(DB_KEYS[table]);
            });

            // Re-seed default cohort data if function exists
            if (typeof resetToDefaultData === 'function') {
                resetToDefaultData();
            } else {
                window.location.reload();
            }

            this.logAction('DATABASE_RESET', 'Factory reset database to default institutional seed.');
            if (typeof showToast === 'function') {
                showToast("↺ LocalStorage Database successfully reset to factory defaults!", "success");
            }
            return true;
        }
    };

    // Global UI Modal Functions
    window.openDatabaseModal = function () {
        const modal = document.getElementById("localStorageDbModal");
        if (!modal) return;
        renderDatabaseModalUI();
        modal.classList.add("active");
    };

    window.closeDatabaseModal = function () {
        const modal = document.getElementById("localStorageDbModal");
        if (modal) modal.classList.remove("active");
    };

    window.renderDatabaseModalUI = function () {
        const stats = EduPulseDB.getStorageStats();
        const statsContainer = document.getElementById("dbStatsGrid");
        const barFill = document.getElementById("dbQuotaBarFill");
        const quotaText = document.getElementById("dbQuotaText");

        if (barFill) barFill.style.width = `${Math.min(100, Math.max(1, stats.usedPercent))}%`;
        if (quotaText) quotaText.innerText = `${stats.totalKB} KB used of 5,120 KB available (${stats.usedPercent}%)`;

        if (statsContainer) {
            statsContainer.innerHTML = Object.keys(stats.tables).map(tbl => {
                const item = stats.tables[tbl];
                const icons = {
                    students: '👥',
                    assignments: '📝',
                    fees: '💳',
                    notices: '📢',
                    users: '👤',
                    audit: '📜'
                };
                return `
                    <div class="db-table-card" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                                <span>${icons[tbl] || '📁'}</span>
                                <span style="text-transform: capitalize;">${tbl} Collection</span>
                            </div>
                            <span style="font-size: 11px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 8px; border-radius: 12px; font-weight: 700;">
                                ${item.count} Records
                            </span>
                        </div>
                        <div style="font-size: 12px; color: #94a3b8; font-family: monospace;">Key: ${item.key}</div>
                        <div style="font-size: 12px; color: #34d399; font-weight: 600; margin-top: 4px;">Size: ${item.kb} KB</div>
                    </div>
                `;
            }).join('');
        }
    };

    window.triggerDbFileImport = function () {
        const input = document.getElementById("dbFileInput");
        if (input) input.click();
    };

    window.handleDbFileUploaded = function (event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            EduPulseDB.restoreBackup(e.target.result);
        };
        reader.readAsText(file);
    };

    // Attach to window
    window.EduPulseDB = EduPulseDB;

})(typeof window !== 'undefined' ? window : this);
