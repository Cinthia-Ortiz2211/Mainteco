import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    tag TEXT CHECK(tag IN ('Routine', 'Urgent')) DEFAULT 'Routine',
    notes TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS availability_rules (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('weekly', 'exception', 'blocked')) NOT NULL,
    dayOfWeek INTEGER,
    specificDate TEXT,
    enabled INTEGER DEFAULT 1,
    startTime TEXT,
    endTime TEXT
  );
`);

// Seed Availability if empty
const existingRules = db.prepare('SELECT count(*) as count FROM availability_rules').get() as any;
if (existingRules.count === 0) {
  const defaultWeekly = {
    1: { enabled: 1, start: '09:00', end: '18:00' },
    2: { enabled: 1, start: '09:00', end: '18:00' },
    3: { enabled: 1, start: '09:00', end: '18:00' },
    4: { enabled: 1, start: '09:00', end: '18:00' },
    5: { enabled: 1, start: '09:00', end: '18:00' },
    6: { enabled: 0, start: '09:00', end: '14:00' },
    0: { enabled: 0, start: '00:00', end: '00:00' },
  };

  const stmt = db.prepare(`
    INSERT INTO availability_rules (id, type, dayOfWeek, enabled, startTime, endTime)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  Object.entries(defaultWeekly).forEach(([day, rule]) => {
    stmt.run(Math.random().toString(36).substr(2, 9), 'weekly', parseInt(day), rule.enabled, rule.start, rule.end);
  });
}

export default db;
