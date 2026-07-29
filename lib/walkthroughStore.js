const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { lockManager } = require('./security/lock');
const { getWritableDataPath } = require('./runtimePaths');

let getPool, queryDb;
try {
    const poolModule = require('./db/pool');
    getPool = poolModule.getPool;
    queryDb = poolModule.query;
} catch {
    getPool = null;
    queryDb = null;
}

class FileWalkthroughStore {
    constructor({ filePath } = {}) {
        this.filePath = filePath || getWritableDataPath('walkthroughs.json');
        this.ready = false;
    }

    async init() {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        try {
            await fs.access(this.filePath);
        } catch {
            await this._write([]);
        }
        this.ready = true;
    }

    async _ensureReady() {
        if (!this.ready) await this.init();
    }

    async _read() {
        await this._ensureReady();
        const raw = await fs.readFile(this.filePath, 'utf8');
        try {
            const data = JSON.parse(raw || '[]');
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    async _write(entries) {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        const tmpPath = `${this.filePath}.${crypto.randomUUID()}.tmp`;
        await fs.writeFile(tmpPath, `${JSON.stringify(entries, null, 2)}\n`);
        await fs.rename(tmpPath, this.filePath);
    }

    async add(entry) {
        const record = {
            id: crypto.randomUUID(),
            role: String(entry.role || 'founder').trim(),
            name: String(entry.name || '').trim(),
            email: String(entry.email || '').trim().toLowerCase(),
            phone: String(entry.phone || '').trim(),
            organization: String(entry.organization || '').trim(),
            website: String(entry.website || '').trim(),
            stage: String(entry.stage || '').trim(),
            objectives: Array.isArray(entry.objectives) ? entry.objectives : [],
            helpDetails: String(entry.helpDetails || '').trim().slice(0, 1000),
            selectedDate: String(entry.selectedDate || '').trim(),
            selectedTimeSlot: String(entry.selectedTimeSlot || '').trim(),
            timezone: String(entry.timezone || 'EST').trim(),
            meetPlatform: String(entry.meetPlatform || 'Google Meet').trim(),
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        if (queryDb && (process.env.DATABASE_URL || process.env.PGHOST)) {
            try {
                await queryDb(
                    `INSERT INTO walkthrough_bookings 
                     (id, role, name, email, phone, organization, website, stage, objectives, help_details, selected_date, selected_time_slot, timezone, meet_platform, status, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                    [
                        record.id, record.role, record.name, record.email, record.phone,
                        record.organization, record.website, record.stage,
                        JSON.stringify(record.objectives), record.helpDetails,
                        record.selectedDate, record.selectedTimeSlot, record.timezone,
                        record.meetPlatform, record.status, record.createdAt
                    ]
                );
            } catch (err) {
                console.warn('[WalkthroughStore] DB insert warning, writing to file fallback:', err.message);
            }
        }

        const release = await lockManager.acquire(this.filePath);
        try {
            const entries = await this._read();
            entries.push(record);
            await this._write(entries);
            return record;
        } finally {
            release();
        }
    }

    async readAll() {
        if (queryDb && (process.env.DATABASE_URL || process.env.PGHOST)) {
            try {
                const res = await queryDb(
                    `SELECT id, role, name, email, phone, organization, website, stage, objectives, help_details AS "helpDetails", selected_date AS "selectedDate", selected_time_slot AS "selectedTimeSlot", timezone, meet_platform AS "meetPlatform", status, created_at AS "createdAt" FROM walkthrough_bookings ORDER BY created_at DESC`
                );
                if (res?.rows?.length > 0) return res.rows;
            } catch (err) {
                console.warn('[WalkthroughStore] DB read warning, reading file fallback:', err.message);
            }
        }
        return this._read();
    }

    async count() {
        if (queryDb && (process.env.DATABASE_URL || process.env.PGHOST)) {
            try {
                const res = await queryDb(`SELECT COUNT(*)::int AS count FROM walkthrough_bookings`);
                if (res?.rows?.[0]) return res.rows[0].count;
            } catch {}
        }
        const entries = await this._read();
        return entries.length;
    }
}

module.exports = { FileWalkthroughStore };
