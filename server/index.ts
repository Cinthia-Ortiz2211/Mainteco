import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Email Setup ---

const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

let transporter: nodemailer.Transporter | null = null;

if (EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });
    console.log(`📧 Email configurado con: ${EMAIL_USER}`);
} else {
    console.log('⚠️ No se configuraron credenciales de email (EMAIL_USER / EMAIL_PASS). Los emails se mostrarán en la consola.');
}

// Service name mapping for emails
const serviceNames: Record<string, string> = {
    plumbing: 'Plomería',
    electrical: 'Electricidad',
    carpentry: 'Carpintería',
    painting: 'Pintura',
};

async function sendConfirmationEmail(
    toEmail: string,
    clientName: string,
    service: string,
    date: string,
    time: string,
    price: string
) {
    const serviceName = serviceNames[service] || service;

    const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); padding: 32px 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">🔧 MaintenCo</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Mantenimiento profesional para tu hogar</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 8px;">¡Tu cita fue confirmada!</h2>
        <p style="color: #64748b; font-size: 15px; margin: 0 0 24px; line-height: 1.5;">
          Hola <strong>${clientName}</strong>, te confirmamos que tu cita de mantenimiento fue aceptada. A continuación te dejamos los detalles:
        </p>

        <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="display: flex; padding: 16px 20px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 13px; font-weight: 600; min-width: 120px; text-transform: uppercase; letter-spacing: 0.05em;">Servicio</span>
            <span style="color: #0f172a; font-size: 15px; font-weight: 700;">${serviceName}</span>
          </div>
          <div style="display: flex; padding: 16px 20px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 13px; font-weight: 600; min-width: 120px; text-transform: uppercase; letter-spacing: 0.05em;">Fecha</span>
            <span style="color: #0f172a; font-size: 15px; font-weight: 700;">📅 ${date}</span>
          </div>
          <div style="display: flex; padding: 16px 20px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 13px; font-weight: 600; min-width: 120px; text-transform: uppercase; letter-spacing: 0.05em;">Horario</span>
            <span style="color: #0f172a; font-size: 15px; font-weight: 700;">🕐 ${time}</span>
          </div>
          <div style="display: flex; padding: 16px 20px; background: #f0fdf4;">
            <span style="color: #94a3b8; font-size: 13px; font-weight: 600; min-width: 120px; text-transform: uppercase; letter-spacing: 0.05em;">Precio est.</span>
            <span style="color: #16a34a; font-size: 17px; font-weight: 800;">${price}</span>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 16px 20px; background: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
          <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong>📲 Próximo paso:</strong> Un técnico verificado se presentará en tu domicilio en la fecha y hora indicadas. Si necesitás reprogramar, contactanos por WhatsApp.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0; text-align: center; line-height: 1.4;">
          El precio es estimado y puede variar según el alcance del trabajo.<br>
          El profesional te confirmará el monto final antes de comenzar.
        </p>
      </div>

      <div style="background: #0f172a; padding: 20px 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          © 2026 MaintenCo — Mar del Plata, Argentina<br>
          Soluciones de mantenimiento para tu hogar
        </p>
      </div>
    </div>
  `;

    const mailOptions = {
        from: `"MaintenCo" <${EMAIL_USER || 'noreply@maintenco.com'}>`,
        to: toEmail,
        subject: `✅ Cita confirmada — ${serviceName} el ${date}`,
        html: htmlContent,
    };

    if (transporter) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Email enviado a ${toEmail}: ${info.messageId}`);
        } catch (error) {
            console.error(`❌ Error enviando email a ${toEmail}:`, error);
        }
    } else {
        console.log('\n📧 ═══════════════════════════════════════════════');
        console.log('   EMAIL DE CONFIRMACIÓN (modo consola)');
        console.log('═══════════════════════════════════════════════════');
        console.log(`   Para: ${toEmail}`);
        console.log(`   Asunto: ${mailOptions.subject}`);
        console.log(`   Cliente: ${clientName}`);
        console.log(`   Servicio: ${serviceName}`);
        console.log(`   Fecha: ${date} | Hora: ${time}`);
        console.log(`   Precio: ${price}`);
        console.log('═══════════════════════════════════════════════════\n');
    }
}

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

app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, address } = req.body;
    try {
        db.prepare(`
            UPDATE users SET firstName = ?, lastName = ?, phone = ?, address = ? WHERE id = ?
        `).run(firstName, lastName, phone, address, id);
        
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
        if (user) {
            delete user.password;
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
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
        INSERT INTO appointments (id, userId, service, date, time, tag, notes, problemDescription, address, photoUrl, paymentMethod, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, service, date, time, tag, notes || '', req.body.problemDescription || null, req.body.address || null, req.body.photoUrl || null, req.body.paymentMethod || null, 'pending');

        const user = db.prepare('SELECT firstName, lastName FROM users WHERE id = ?').get(userId) as any;
        const newAppt = {
            id, userId, service, date, time, tag, notes, status: 'pending',
            problemDescription: req.body.problemDescription, address: req.body.address, photoUrl: req.body.photoUrl, paymentMethod: req.body.paymentMethod,
            clientName: user ? `${user.firstName} ${user.lastName}` : 'Old Client'
        };
        res.status(201).json(newAppt);
    } catch (error: any) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: error.message || 'Error inserting appointment' });
    }
});

app.patch('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const { status, notes, servicePrice } = req.body;

    if (status) {
        db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
    }
    if (notes !== undefined) {
        db.prepare('UPDATE appointments SET notes = ? WHERE id = ?').run(notes, id);
    }

    // Send confirmation email when appointment is accepted
    if (status === 'accepted') {
        try {
            const appt = db.prepare(`
                SELECT a.*, u.email, u.firstName, u.lastName
                FROM appointments a
                LEFT JOIN users u ON a.userId = u.id
                WHERE a.id = ?
            `).get(id) as any;

            if (appt && appt.email) {
                const clientName = `${appt.firstName} ${appt.lastName}`;
                const price = servicePrice || 'A confirmar por el técnico';

                sendConfirmationEmail(
                    appt.email,
                    clientName,
                    appt.service,
                    appt.date,
                    appt.time,
                    price
                );
            }
        } catch (emailError) {
            console.error('Error preparing confirmation email:', emailError);
        }
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

// --- Portfolio Endpoints ---

app.get('/api/portfolio', (req, res) => {
    try {
        const portfolio = db.prepare('SELECT * FROM portfolio').all();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

app.post('/api/portfolio', (req, res) => {
    const { title, description, beforeImg, afterImg, testimonial, clientName, rating } = req.body;
    const id = randomUUID();
    try {
        db.prepare(`
            INSERT INTO portfolio (id, title, description, beforeImg, afterImg, testimonial, clientName, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, title, description, beforeImg || null, afterImg || null, testimonial || null, clientName || null, rating || 5);
        
        const newProject = db.prepare('SELECT * FROM portfolio WHERE id = ?').get(id);
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add portfolio project' });
    }
});

app.patch('/api/portfolio/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, beforeImg, afterImg, testimonial, clientName, rating } = req.body;
    try {
        db.prepare(`
            UPDATE portfolio SET title = ?, description = ?, beforeImg = ?, afterImg = ?, testimonial = ?, clientName = ?, rating = ?
            WHERE id = ?
        `).run(title, description, beforeImg || null, afterImg || null, testimonial || null, clientName || null, rating || 5, id);
        
        const updatedProject = db.prepare('SELECT * FROM portfolio WHERE id = ?').get(id);
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update portfolio project' });
    }
});

app.delete('/api/portfolio/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('DELETE FROM portfolio WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete portfolio project' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
