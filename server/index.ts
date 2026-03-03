import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import db from './db.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Auth Endpoints ---

app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    try {
        const id = randomUUID();
        db.prepare(`
      INSERT INTO users (id, firstName, lastName, email, phone, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, firstName, lastName, email, phone, password, 'user');

        res.status(201).json({ id, firstName, lastName, email, phone, role: 'user' });
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Email already registered' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
    }

    delete user.password;
    res.json(user);
});

// --- Appointment Endpoints ---

app.get('/api/appointments', (req, res) => {
    const { userId, role } = req.query;

    const query = `
      SELECT a.*, COALESCE(u.firstName || ' ' || u.lastName, 'Old Client') as clientName 
      FROM appointments a
      LEFT JOIN users u ON a.userId = u.id
    `;
    let appointments;
    if (role === 'admin') {
        appointments = db.prepare(query).all();
    } else if (userId) {
        // Find user email to support legacy email-based appointments
        const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as any;
        const email = user?.email;

        if (email) {
            appointments = db.prepare(`${query} WHERE a.userId = ? OR a.userId = ?`).all(userId, email);
        } else {
            appointments = db.prepare(`${query} WHERE a.userId = ?`).all(userId);
        }
    } else {
        appointments = [];
    }

    res.json(appointments);
});

app.post('/api/appointments', (req, res) => {
    const { userId, service, date, time, tag, notes } = req.body;
    const id = randomUUID();

    try {
        db.prepare(`
        INSERT INTO appointments (id, userId, service, date, time, tag, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, service, date, time, tag, notes || '', 'pending');

        const user = db.prepare('SELECT firstName, lastName FROM users WHERE id = ?').get(userId) as any;
        const newAppt = {
            id, userId, service, date, time, tag, notes, status: 'pending',
            clientName: user ? `${user.firstName} ${user.lastName}` : 'Old Client'
        };
        res.status(201).json(newAppt);
    } catch (error: any) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: error.message || 'Error inserting appointment' });
    }
});

app.patch('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (status) {
        db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
    }
    if (notes !== undefined) {
        db.prepare('UPDATE appointments SET notes = ? WHERE id = ?').run(notes, id);
    }

    res.json({ success: true });
});

// --- Availability Endpoints ---

app.get('/api/availability', (req, res) => {
    const rules = db.prepare('SELECT * FROM availability_rules').all() as any[];

    const config = {
        weekly: {} as any,
        exceptions: {} as any,
        blocked: [] as string[]
    };

    rules.forEach(rule => {
        if (rule.type === 'weekly') {
            config.weekly[rule.dayOfWeek] = {
                enabled: rule.enabled === 1,
                start: rule.startTime,
                end: rule.endTime
            };
        } else if (rule.type === 'exception') {
            config.exceptions[rule.specificDate] = {
                enabled: rule.enabled === 1,
                start: rule.startTime,
                end: rule.endTime
            };
        } else if (rule.type === 'blocked') {
            config.blocked.push(rule.specificDate);
        }
    });

    res.json(config);
});

app.post('/api/admin/availability', (req, res) => {
    const { type, dayOfWeek, specificDate, enabled, startTime, endTime } = req.body;
    const id = randomUUID();

    if (type === 'blocked') {
        const existing = db.prepare("SELECT id FROM availability_rules WHERE type = 'blocked' AND LOWER(specificDate) = LOWER(?)").get(specificDate) as any;
        if (!existing) {
            db.prepare('INSERT INTO availability_rules (id, type, specificDate) VALUES (?, ?, ?)').run(id, type, specificDate);
        }
    } else if (type === 'weekly') {
        // Upsert logic for weekly
        const existing = db.prepare("SELECT id FROM availability_rules WHERE type = 'weekly' AND dayOfWeek = ?").get(dayOfWeek) as any;
        if (existing) {
            db.prepare('UPDATE availability_rules SET enabled = ?, startTime = ?, endTime = ? WHERE id = ?')
                .run(enabled ? 1 : 0, startTime, endTime, existing.id);
        } else {
            db.prepare('INSERT INTO availability_rules (id, type, dayOfWeek, enabled, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?)')
                .run(id, type, dayOfWeek, enabled ? 1 : 0, startTime, endTime);
        }
    } else if (type === 'exception') {
        const existing = db.prepare("SELECT id FROM availability_rules WHERE type = 'exception' AND LOWER(specificDate) = LOWER(?)").get(specificDate) as any;
        if (existing) {
            db.prepare('UPDATE availability_rules SET enabled = ?, startTime = ?, endTime = ? WHERE id = ?')
                .run(enabled ? 1 : 0, startTime, endTime, existing.id);
        } else {
            db.prepare('INSERT INTO availability_rules (id, type, specificDate, enabled, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?)')
                .run(id, type, specificDate, enabled ? 1 : 0, startTime, endTime);
        }
    }

    res.json({ success: true });
});

app.delete('/api/admin/availability', (req, res) => {
    const { type, specificDate, dayOfWeek } = req.body;
    if (type === 'blocked' || type === 'exception') {
        db.prepare('DELETE FROM availability_rules WHERE type = ? AND LOWER(specificDate) = LOWER(?)').run(type, specificDate);
    }
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
