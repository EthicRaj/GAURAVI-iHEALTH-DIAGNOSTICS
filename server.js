// BLOODLAB ADMIN BACKEND - NODE.JS/EXPRESS
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
// crypto already required above
const crypto = require('crypto');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const marked = require('marked');
const axios = require('axios');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Database setup - SQLite for development, PostgreSQL for production
let db;
let dbType = 'sqlite';

if (process.env.DATABASE_URL) {
  // Production: PostgreSQL
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  dbType = 'postgres';
  console.log('Using PostgreSQL database');
} else {
  // Development: SQLite
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'database', 'bloodlab.db');
  db = new sqlite3.Database(dbPath);
  console.log('Using SQLite database');
}

// Initialize database tables
if (dbType === 'sqlite') {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      phone TEXT,
      age INTEGER,
      gender TEXT,
      bloodType TEXT,
      status TEXT,
      address TEXT,
      registrationDate TEXT,
      password TEXT,
      meta TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      testId TEXT,
      testName TEXT,
      date TEXT,
      time TEXT,
      amount REAL,
      status TEXT,
      phone TEXT,
      email TEXT,
      city TEXT,
      quantity INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      name TEXT,
      price REAL,
      description TEXT,
      popularity INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      reminder_when TEXT,
      sent INTEGER,
      createdAt TEXT,
      bookingId TEXT,
      testData TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT,
      specialty TEXT,
      phone TEXT,
      email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      doctorId TEXT,
      userId TEXT,
      date TEXT,
      time TEXT,
      status TEXT,
      createdAt TEXT
    )`);

    console.log('SQLite database tables initialized');
  });
} else {
  // PostgreSQL initialization
  const initPgTables = async () => {
    try {
      await db.query(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        age INTEGER,
        gender TEXT,
        bloodType TEXT,
        status TEXT,
        address TEXT,
        registrationDate TEXT,
        password TEXT,
        meta TEXT
      )`);

      await db.query(`CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        userId TEXT,
        userName TEXT,
        testId TEXT,
        testName TEXT,
        date TEXT,
        time TEXT,
        amount REAL,
        status TEXT,
        phone TEXT,
        email TEXT,
        city TEXT,
        quantity INTEGER
      )`);

      await db.query(`CREATE TABLE IF NOT EXISTS tests (
        id TEXT PRIMARY KEY,
        name TEXT,
        price REAL,
        description TEXT,
        popularity INTEGER
      )`);

      await db.query(`CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        when TEXT,
        sent INTEGER,
        createdAt TEXT,
        bookingId TEXT,
        testData TEXT
      )`);

      await db.query(`CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT,
        specialty TEXT,
        phone TEXT,
        email TEXT
      )`);

      await db.query(`CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        doctorId TEXT,
        userId TEXT,
        date TEXT,
        time TEXT,
        status TEXT,
        createdAt TEXT
      )`);

      console.log('PostgreSQL database tables initialized');
    } catch (error) {
      console.error('Error initializing PostgreSQL tables:', error);
    }
  };
  initPgTables();
}

// Database helper functions
function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
// Twilio (optional)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
        const Twilio = require('twilio');
        twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio client initialized');
    } catch (e) { console.warn('Twilio init failed', e && e.message); }
}

// Payment gateway config (Razorpay). Provide these via environment variables.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
let RazorpayClient = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    try {
        const Razorpay = require('razorpay');
        RazorpayClient = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
        console.log('🔐 Razorpay client initialized');
    } catch (e) {
        console.warn('Razorpay SDK not installed or failed to initialize. Run `npm i razorpay` to enable gateway.', e && e.message);
    }
} else {
    console.log('Razorpay keys not configured; UPI/QR fallback will be used. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable.');
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname))); // Serve static files (HTML, CSS, JS)

// Simple request logger to aid debugging (prints method, path, and small body preview)
app.use((req, res, next) => {
    try {
        const preview = req.body && Object.keys(req.body).length ? JSON.stringify(req.body).slice(0, 240) : '';
        console.log(`${new Date().toISOString()} -> ${req.method} ${req.path} ${preview ? ' body=' + preview : ''}`);
    } catch (e) { /* ignore logging errors */ }
    next();
});

// Sessions (with sqlite store)
app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './database' }),
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: Number(process.env.SESSION_TTL_MS) || 30 * 60 * 1000 } // default 30m
}));

// Simple transporter for notifications (development: logs only unless SMTP configured)
let mailTransporter = null;
if (process.env.SMTP_HOST) {
    mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: !!process.env.SMTP_SECURE,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Test WhatsApp endpoint
app.post('/api/test/whatsapp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone number required' });

        const testUser = { name: 'Test User', phone };
        const result = await sendWhatsAppGreeting(testUser);

        res.json({
            success: result.success,
            sid: result.sid,
            error: result.error,
            twilioConfigured: !!twilioClient,
            whatsappFrom: process.env.TWILIO_WHATSAPP_FROM
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve login page at root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Database Files (JSON)
const dbDir = path.join(__dirname, 'database');
const usersFile = path.join(dbDir, 'users.json');
const bookingsFile = path.join(dbDir, 'bookings.json');
const testsFile = path.join(dbDir, 'tests.json');

// Initialize database directory
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize default data files
const defaultUsers = [
    {
        id: 'USR001',
        name: 'Raj Kumar',
        email: 'raj@example.com',
        phone: '+91 98765 43210',
        age: 35,
        gender: 'Male',
        bloodType: 'O+',
        status: 'active',
        address: '123 Main St, Delhi',
        registrationDate: '2024-01-15',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 'password'
    },
    {
        id: 'USR002',
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '+91 98765 43211',
        age: 28,
        gender: 'Female',
        bloodType: 'A+',
        status: 'active',
        address: '456 Oak Ave, Mumbai',
        registrationDate: '2024-01-20',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 'password'
    },
    {
        id: 'ADM001',
        name: 'Admin User',
        email: 'admin@roadmaster.com',
        phone: '+91 98765 43212',
        age: 30,
        gender: 'Male',
        bloodType: 'O+',
        status: 'active',
        address: 'Admin Office',
        registrationDate: '2024-01-01',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
        meta: { role: 'admin' }
    }
];

const defaultBookings = [
    {
        id: 'BK001',
        userId: 'USR001',
        userName: 'Raj Kumar',
        testId: 'fullbody',
        testName: 'Full Body Checkups',
        date: '2024-02-20',
        time: '09:00 AM',
        amount: 1999,
        status: 'confirmed'
    }
];

const defaultTests = [
    { id: 'cbc', name: 'CBC Test', price: 350, description: 'Complete Blood Count', popularity: 100 },
    { id: 'fullbody', name: 'Full Body Checkups', price: 1999, description: 'Complete health screening package', popularity: 100 },
    { id: 'thyroid', name: 'Thyroid Test', price: 500, description: 'T3, T4, TSH panel', popularity: 95 },
    { id: 'sugar', name: 'Sugar Test', price: 200, description: 'Fasting blood sugar test', popularity: 100 },
    { id: 'covid', name: 'Covid 19 Test', price: 1200, description: 'RT-PCR COVID detection test', popularity: 90 },
    { id: 'heart', name: 'Heart Test', price: 1400, description: 'Lipid + ECG + Cardiac markers', popularity: 80 },
    { id: 'kidney', name: 'Kidney Test', price: 950, description: 'Creatinine, Urea, Uric Acid', popularity: 85 },
    { id: 'liver', name: 'Liver Test', price: 1100, description: 'SGOT, SGPT, Bilirubin', popularity: 88 },
    { id: 'chol', name: 'Cholesterol Test', price: 450, description: 'Total cholesterol test', popularity: 75 },
    { id: 'hba1c', name: 'HbA1c Test', price: 600, description: '3-month blood sugar analysis', popularity: 90 },
    { id: 'hepb', name: 'Hepatitis B Test', price: 750, description: 'HBsAg blood test', popularity: 70 },
    { id: 'kft', name: 'Kidney Function Test', price: 1000, description: 'KFT panel (Urea, Creatinine)', popularity: 85 },
    { id: 'lft', name: 'Liver Function Test', price: 1050, description: 'Complete LFT panel', popularity: 88 },
    { id: 'preg', name: 'Pregnancy Test', price: 250, description: 'Urine hCG qualitative test', popularity: 95 },
    { id: 'typhoid', name: 'Typhoid Test', price: 450, description: 'Widal blood test', popularity: 70 },
    { id: 'uric', name: 'Uric Acid Test', price: 350, description: 'Joint pain & gout analysis', popularity: 75 },
    { id: 'b12', name: 'Vitamin B12 Test', price: 750, description: 'Vitamin deficiency test', popularity: 80 },
    { id: 'vitd', name: 'Vitamin D Test', price: 900, description: 'Bone health vitamin test', popularity: 90 },
    { id: 'allergy', name: 'Allergy Test', price: 1600, description: 'IgE allergy blood test', popularity: 70 },
    { id: 'arthritis', name: 'Arthritis Test', price: 1400, description: 'RA factor and CRP', popularity: 65 },
    { id: 'cancer', name: 'Cancer Test', price: 2500, description: 'Tumor marker screening', popularity: 60 },
    { id: 'bone', name: 'Bone And Joint', price: 1200, description: 'Calcium, Vitamin D, X-ray (demo)', popularity: 70 },
    { id: 'dengue', name: 'Dengue Test', price: 800, description: 'NS1, IgM, IgG panel', popularity: 95 },
    { id: 'diabetes', name: 'Diabetes Test', price: 400, description: 'Fasting & PP sugar test', popularity: 100 },
    { id: 'rheumatoid', name: 'Rheumatoid Test', price: 1100, description: 'RA factor blood test', popularity: 60 },
    { id: 'tb', name: 'Tuberculosis Test', price: 1600, description: 'TB Gold / ESR test', popularity: 55 },
    { id: 'fertility', name: 'Infertility Test', price: 2800, description: 'Hormone & fertility analysis', popularity: 60 },
    { id: 'diacare', name: 'Diabetes Care', price: 1800, description: 'Complete diabetes monitoring pack', popularity: 85 },
    { id: 'anemia', name: 'Anemia Test', price: 450, description: 'Iron, Ferritin, HB test', popularity: 80 },
    { id: 'gastro', name: 'GastroIntestinal', price: 1500, description: 'Digestive system test panel', popularity: 60 },
    { id: 'autoimmune', name: 'Autoimmune Disorders', price: 3000, description: 'ANA, ESR, CRP panel', popularity: 50 },
    { id: 'fever', name: 'Fever Test', price: 1200, description: 'Malaria, Dengue, Typhoid combo', popularity: 95 }
];

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
}
if (!fs.existsSync(bookingsFile)) {
    fs.writeFileSync(bookingsFile, JSON.stringify(defaultBookings, null, 2));
}
if (!fs.existsSync(testsFile)) {
    fs.writeFileSync(testsFile, JSON.stringify(defaultTests, null, 2));
}

// Utility functions
function readJSON(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', filePath, error);
        return [];
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing file:', filePath, error);
        return false;
    }
}

// --- Password hashing helpers ---
function hashPassword(plain) {
    return bcrypt.hashSync(String(plain), 10);
}
function verifyPassword(plain, hashed) {
    return bcrypt.compareSync(String(plain), String(hashed));
}

// --- Data encryption helpers (AES-256-GCM) ---
const ENC_KEY = process.env.ENCRYPTION_KEY || null; // base64 32 bytes
function encryptData(plain) {
    if (!ENC_KEY) return plain;
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(ENC_KEY, 'base64');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return iv.toString('base64') + ':' + tag.toString('base64') + ':' + encrypted.toString('base64');
}
function decryptData(blob) {
    if (!ENC_KEY) return blob;
    try {
        const [ivB, tagB, encB] = String(blob).split(':');
        const iv = Buffer.from(ivB, 'base64');
        const tag = Buffer.from(tagB, 'base64');
        const enc = Buffer.from(encB, 'base64');
        const key = Buffer.from(ENC_KEY, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        const out = Buffer.concat([decipher.update(enc), decipher.final()]);
        return out.toString('utf8');
    } catch (e) { return null; }
}

// --- OTP store (in-memory, simple) ---
const OTP_STORE = new Map(); // key -> { code, expiresAt }
function generateOTP(key) {
    // Use fixed OTP for testing in development
    const code = process.env.NODE_ENV === 'production' ?
        String(Math.floor(100000 + Math.random() * 900000)) : '123456';
    const expiresAt = Date.now() + (Number(process.env.OTP_TTL_MS) || 5 * 60 * 1000);
    OTP_STORE.set(key, { code, expiresAt });
    return code;
}
function verifyOTP(key, code) {
    const rec = OTP_STORE.get(key);
    if (!rec) return false;
    if (Date.now() > rec.expiresAt) { OTP_STORE.delete(key); return false; }
    if (rec.code === String(code)) { OTP_STORE.delete(key); return true; }
    return false;
}

// --- Reminders storage ---
const remindersFile = path.join(dbDir, 'reminders.json');
if (!fs.existsSync(remindersFile)) writeJSON(remindersFile, []);

// --- Doctors storage ---
const doctorsFile = path.join(dbDir, 'doctors.json');
if (!fs.existsSync(doctorsFile)) writeJSON(doctorsFile, []);

// --- Consultations storage ---
const consultFile = path.join(dbDir, 'consultations.json');
if (!fs.existsSync(consultFile)) writeJSON(consultFile, []);

// --- Blogs folder ---
const blogDir = path.join(__dirname, 'blog');
if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

// create a sample blog post if none exist
const samplePost = path.join(blogDir, 'welcome.md');
if (!fs.existsSync(samplePost)) fs.writeFileSync(samplePost, '# Welcome to BloodLab Blog\n\nThis is a sample post.');

// --- Health score helpers (simple heuristic) ---
function computeHealthScoreForUser(userId) {
    const bookings = readJSON(bookingsFile).filter(b => String(b.userId) === String(userId));
    let score = 70;
    bookings.forEach(b => { score -= Math.min(10, (b.amount || 0) / 1000 * 5); });
    score = Math.max(10, Math.min(99, Math.round(score)));
    return { userId, score, computedAt: new Date().toISOString() };
}

// --- Authentication middleware ---
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// ============================================
// USERS ROUTES
// ============================================

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await dbAll('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user
app.post('/api/users', (req, res) => {
    try {
        const users = readJSON(usersFile);
        const plainPassword = req.body.password || '';
        const newUser = {
            id: 'USR' + String(users.length + 1).padStart(3, '0'),
            ...req.body,
            password: plainPassword ? hashPassword(plainPassword) : undefined,
            registrationDate: new Date().toISOString().split('T')[0]
        };

        // Validate email uniqueness
        if (users.some(u => u.email === newUser.email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        users.push(newUser);
        if (writeJSON(usersFile, users)) {
            res.status(201).json(newUser);
        } else {
            res.status(500).json({ error: 'Failed to create user' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
app.put('/api/users/:id', (req, res) => {
    try {
        const users = readJSON(usersFile);
        const index = users.findIndex(u => u.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[index] = { ...users[index], ...req.body, id: req.params.id };
        if (writeJSON(usersFile, users)) {
            res.json(users[index]);
        } else {
            res.status(500).json({ error: 'Failed to update user' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    try {
        const users = readJSON(usersFile);
        const index = users.findIndex(u => u.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const deletedUser = users.splice(index, 1);
        if (writeJSON(usersFile, users)) {
            res.json(deletedUser[0]);
        } else {
            res.status(500).json({ error: 'Failed to delete user' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ============================================
// BOOKINGS ROUTES
// ============================================

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await dbAll('SELECT * FROM bookings');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get bookings by user ID
app.get('/api/bookings/user/:userId', async (req, res) => {
    try {
        const userBookings = await dbAll('SELECT * FROM bookings WHERE userId = ?', [req.params.userId]);
        res.json(userBookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Create new booking
app.post('/api/bookings', requireAuth, (req, res) => {
    try {
        const bookings = readJSON(bookingsFile);
        const tests = req.body.tests || [];
        const createdBookings = [];

        if (!Array.isArray(tests) || tests.length === 0) {
            return res.status(400).json({ error: 'At least one test is required' });
        }

        // Create a booking for each test
        tests.forEach(test => {
            const newBooking = {
                id: 'BK' + String(bookings.length + 1).padStart(3, '0'),
                userId: req.session.userId,
                userName: req.body.patientName || req.body.userName || '',
                testId: test.testId,
                testName: test.testName || '',
                date: req.body.date,
                time: req.body.time,
                amount: req.body.total || req.body.amount || 0,
                status: 'pending',
                phone: req.body.phone,
                email: req.body.email,
                city: req.body.city,
                quantity: test.quantity || 1
            };
            bookings.push(newBooking);
            createdBookings.push(newBooking);
        });

        if (writeJSON(bookingsFile, bookings)) {
            res.status(201).json({
                id: createdBookings[0].id,
                bookings: createdBookings,
                message: `${createdBookings.length} booking${createdBookings.length > 1 ? 's' : ''} created successfully`
            });
        } else {
            res.status(500).json({ error: 'Failed to create booking' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// ====================
// Payment endpoints
// POST /api/pay/create-order
// Body: { amount: number, currency?: 'INR', notes?: {} }
app.post('/api/pay/create-order', async (req, res) => {
    try {
        const amount = Number(req.body.amount || 0);
        const currency = req.body.currency || 'INR';
        const notes = req.body.notes || {};
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        // If Razorpay client is available, create an order
        if (RazorpayClient) {
            const options = {
                amount: Math.round(amount * 100), // paise
                currency,
                receipt: 'rcpt_' + Date.now(),
                payment_capture: 1,
                notes
            };
            const order = await RazorpayClient.orders.create(options);

            // create a booking/receipt placeholder
            const bookings = readJSON(bookingsFile);
            const newBooking = {
                id: 'BK' + String(bookings.length + 1).padStart(3, '0'),
                date: new Date().toISOString().split('T')[0],
                amount: amount,
                status: 'payment_pending',
                provider: 'razorpay',
                razorpay_order_id: order.id,
                createdAt: new Date().toISOString()
            };
            bookings.push(newBooking);
            writeJSON(bookingsFile, bookings);

            return res.json({ provider: 'razorpay', order, key: RAZORPAY_KEY_ID, bookingId: newBooking.id });
        }

        // Fallback UPI/QR flow (no external gateway)
        const upiVpa = process.env.UPI_VPA || 'your-upi@bank';
        const bookings = readJSON(bookingsFile);
        const newBooking = {
            id: 'BK' + String(bookings.length + 1).padStart(3, '0'),
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            status: 'pending_upi',
            provider: 'upi',
            upi_vpa: upiVpa,
            createdAt: new Date().toISOString(),
            receipt: 'rcpt_' + Date.now()
        };
        bookings.push(newBooking);
        writeJSON(bookingsFile, bookings);

        return res.json({ provider: 'upi', upiVpa, bookingId: newBooking.id, amount });
    } catch (error) {
        console.error('Error creating payment order', error && error.message);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// POST /api/pay/verify
// Verify payment (Razorpay): { provider: 'razorpay', razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
app.post('/api/pay/verify', (req, res) => {
    try {
        const provider = req.body.provider;
        if (provider === 'razorpay') {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
            if (!RAZORPAY_KEY_SECRET) return res.status(500).json({ error: 'Razorpay secret not configured on server' });
            const generated = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
            if (generated === razorpay_signature) {
                const bookings = readJSON(bookingsFile);
                const idx = bookings.findIndex(b => b.id === bookingId || b.razorpay_order_id === razorpay_order_id);
                if (idx !== -1) {
                    bookings[idx].status = 'paid';
                    bookings[idx].payment = { provider: 'razorpay', payment_id: razorpay_payment_id, order_id: razorpay_order_id, paidAt: new Date().toISOString() };
                    writeJSON(bookingsFile, bookings);
                    return res.json({ ok: true, booking: bookings[idx] });
                }
                return res.status(404).json({ error: 'Booking not found' });
            }
            return res.status(400).json({ error: 'Invalid signature' });
        }
        return res.status(400).json({ error: 'Unsupported provider' });
    } catch (error) {
        console.error('Payment verify error', error && error.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Update booking status
app.put('/api/bookings/:id', (req, res) => {
    try {
        const bookings = readJSON(bookingsFile);
        const index = bookings.findIndex(b => b.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        bookings[index] = { ...bookings[index], ...req.body, id: req.params.id };
        if (writeJSON(bookingsFile, bookings)) {
            res.json(bookings[index]);
        } else {
            res.status(500).json({ error: 'Failed to update booking' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// Delete booking
app.delete('/api/bookings/:id', (req, res) => {
    try {
        const bookings = readJSON(bookingsFile);
        const index = bookings.findIndex(b => b.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const deletedBooking = bookings.splice(index, 1);
        if (writeJSON(bookingsFile, bookings)) {
            res.json(deletedBooking[0]);
        } else {
            res.status(500).json({ error: 'Failed to delete booking' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

// ============================================
// TESTS ROUTES
// ============================================

// Get all tests
app.get('/api/tests', async (req, res) => {
    try {
        const tests = await dbAll('SELECT * FROM tests');
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ error: 'Failed to fetch tests' });
    }
});

// Get test by ID
app.get('/api/tests/:id', async (req, res) => {
    try {
        const test = await dbGet('SELECT * FROM tests WHERE id = ?', [req.params.id]);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        res.json(test);
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ error: 'Failed to fetch test' });
    }
});

// Create new test
app.post('/api/tests', (req, res) => {
    try {
        const tests = readJSON(testsFile);
        const newTest = {
            id: 'test_' + Date.now(),
            ...req.body,
            popularity: req.body.popularity || 50
        };

        tests.push(newTest);
        if (writeJSON(testsFile, tests)) {
            res.status(201).json(newTest);
        } else {
            res.status(500).json({ error: 'Failed to create test' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create test' });
    }
});

// Update test
app.put('/api/tests/:id', (req, res) => {
    try {
        const tests = readJSON(testsFile);
        const index = tests.findIndex(t => t.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Test not found' });
        }

        tests[index] = { ...tests[index], ...req.body, id: req.params.id };
        if (writeJSON(testsFile, tests)) {
            res.json(tests[index]);
        } else {
            res.status(500).json({ error: 'Failed to update test' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update test' });
    }
});

// Delete test
app.delete('/api/tests/:id', (req, res) => {
    try {
        const tests = readJSON(testsFile);
        const index = tests.findIndex(t => t.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Test not found' });
        }

        const deletedTest = tests.splice(index, 1);
        if (writeJSON(testsFile, tests)) {
            res.json(deletedTest[0]);
        } else {
            res.status(500).json({ error: 'Failed to delete test' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete test' });
    }
});

// --- AUTH: OTP endpoints ---
app.post('/api/auth/request-otp', (req, res) => {
    const phone = req.body.phone || req.body.email;
    if (!phone) return res.status(400).json({ error: 'phone/email required' });
    const code = generateOTP(phone);
    console.log(`OTP for ${phone}: ${code} (dev)`);
    if (mailTransporter && req.body.email) {
        mailTransporter.sendMail({ from: process.env.SMTP_FROM, to: req.body.email, subject: 'Your OTP', text: `Your OTP is ${code}` }).catch(e=>console.warn(e));
    }
    // Send SMS via Twilio if configured and phone looks like a number
    try {
        if (twilioClient && req.body.phone) {
            const from = process.env.TWILIO_FROM || process.env.TWILIO_PHONE_NUMBER;
            const to = req.body.phone;
            twilioClient.messages.create({ body: `Your OTP is ${code}`, from, to }).then(m => console.log('Twilio SMS sent', m.sid)).catch(e=>console.warn('Twilio send failed', e && e.message));
        }
    } catch (e) { console.warn('Twilio error', e && e.message); }
    res.json({ ok: true, ttl_ms: Number(process.env.OTP_TTL_MS) || 5*60*1000 });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const key = req.body.phone || req.body.email;
    const code = req.body.code;
    if (!key || !code) return res.status(400).json({ error: 'missing' });
    if (verifyOTP(key, code)) {
        const users = readJSON(usersFile);
        let user = users.find(u => u.phone === key || u.email === key);
        if (!user) {
            user = { id: 'USR' + String(users.length + 1).padStart(3, '0'), name: key, email: req.body.email || '', phone: req.body.phone || key, registrationDate: new Date().toISOString().split('T')[0] };
            users.push(user); writeJSON(usersFile, users);
        }
        req.session.userId = user.id;
        res.json({ ok: true, user });
    } else {
        res.status(400).json({ error: 'invalid or expired' });
    }
});

// --- AUTH: password login ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const id = (req.body.identifier || req.body.loginPhoneOrEmail || req.body.email || req.body.phone || '').toString().trim();
        const password = req.body.password || '';
        if (!id || !password) return res.status(400).json({ error: 'identifier and password required' });

        const user = await dbGet('SELECT * FROM users WHERE email = ? OR phone = ? OR id = ?', [id, id, id]);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.password) return res.status(400).json({ error: 'Account has no password, use OTP' });
        if (!verifyPassword(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

        // success: set session
        req.session.userId = user.id;

        // Send WhatsApp greeting on every login
        try {
            console.log(`Attempting to send WhatsApp greeting to ${user.name} (${user.phone})`);
            const greetingResult = await sendWhatsAppGreeting(user);
            if (greetingResult.success) {
                console.log(`Greeting sent successfully to ${user.name}: SID ${greetingResult.sid}`);
            } else {
                console.warn(`Failed to send greeting to ${user.name}:`, greetingResult.error);
            }
        } catch (greetingError) {
            console.warn('Error sending greeting:', greetingError.message);
            // Don't fail login if greeting fails
        }

        const resp = { ...user }; delete resp.password;
        res.json({ ok: true, user: resp });
    } catch (e) { console.error('Login error', e && e.message); res.status(500).json({ error: 'Login failed' }); }
});

app.post('/api/auth/logout', (req, res) => {
    try {
        // Clear the session completely
        req.session.destroy(err => {
            if (err) {
                console.warn('Session destroy failed', err && err.message);
                return res.status(500).json({ error: 'Logout failed' });
            }

            // Clear the session cookie
            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            res.json({ ok: true });
        });
    } catch (error) {
        console.warn('Logout error:', error.message);
        res.status(500).json({ error: 'Logout failed' });
    }
});

app.get('/api/me', (req, res) => {
    try {
        const uid = req.session && req.session.userId;
        if (!uid) return res.status(401).json({ error: 'Not authenticated' });
        const users = readJSON(usersFile);
        const user = users.find(u => u.id === uid);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const resp = { ...user }; delete resp.password;
        res.json(resp);
    } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// --- Doctor endpoints ---
app.get('/api/doctors', (req, res) => { res.json(readJSON(doctorsFile)); });
app.post('/api/doctors', (req, res) => { const docs = readJSON(doctorsFile); const d = { id: 'DR' + Date.now(), ...req.body }; docs.push(d); writeJSON(doctorsFile, docs); res.status(201).json(d); });

// Consultations
app.post('/api/consultations', (req, res) => {
    const consults = readJSON(consultFile);
    const c = { id: 'C' + Date.now(), ...req.body, status: 'scheduled', createdAt: new Date().toISOString() };
    consults.push(c); writeJSON(consultFile, consults);
    res.status(201).json(c);
});

app.get('/api/consultations', (req, res) => res.json(readJSON(consultFile)));

// Blog listing and post fetch
app.get('/api/blogs', (req, res) => {
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    const posts = files.map(f => ({ slug: f.replace(/\.md$/, ''), title: fs.readFileSync(path.join(blogDir, f), 'utf8').split('\n')[0].replace(/^#\s*/,''), file: f }));
    res.json(posts);
});

app.get('/blog/:slug', (req, res) => {
    const file = path.join(blogDir, req.params.slug + '.md');
    if (!fs.existsSync(file)) return res.status(404).send('Not found');
    const md = fs.readFileSync(file, 'utf8');
    const html = marked.parse(md);
    res.send(`<html><head><meta name="robots" content="index,follow"><title>Blog - ${req.params.slug}</title></head><body>${html}</body></html>`);
});

// Health score
app.get('/api/healthscore/:userId', (req, res) => {
    res.json(computeHealthScoreForUser(req.params.userId));
});

// Reminder scheduling endpoint
app.post('/api/reminders', (req, res) => {
    const reminders = readJSON(remindersFile);
    const r = { id: 'R' + Date.now(), ...req.body, createdAt: new Date().toISOString() };
    reminders.push(r); writeJSON(remindersFile, reminders);
    res.status(201).json(r);
});

app.get('/api/reminders', (req, res) => res.json(readJSON(remindersFile)));

// Manual reminder generation endpoint (for testing)
app.post('/api/reminders/generate', (req, res) => {
    try {
        generateUserReminders();
        res.json({ success: true, message: 'Reminder generation triggered' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// WhatsApp greeting function for successful login
async function sendWhatsAppGreeting(user) {
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_FROM) {
        console.warn('Twilio WhatsApp not configured for greeting');
        return { success: false, error: 'Twilio WhatsApp not configured' };
    }

    try {
        const message = `नमस्कार ${user.name} 👋

आपण लॉगिन केल्याबद्दल धन्यवाद.

आपल्या आरोग्याची काळजी घेण्यासाठी GAURAVI नेहमी आपल्या सोबत आहे.
काही मदत हवी असल्यास नक्की संपर्क करा.
आपल्या आरोग्य सेवेसाठी आम्ही सदैव तत्पर आहोत.
– GAURAVI टीम`;

        // Send WhatsApp message
        let cleanPhone = user.phone.replace(/\s|-/g, '');
        if (!cleanPhone.startsWith('+')) {
            cleanPhone = '+' + cleanPhone;
        }
        const result = await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: `whatsapp:${cleanPhone}`,
            body: message
        });

        console.log(`WhatsApp greeting sent to ${user.name} (${user.phone}):`, result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('WhatsApp greeting failed:', error.message);
        return { success: false, error: error.message };
    }
}

// WhatsApp reminder function
async function sendWhatsAppReminder(user, reminderType, testData = null) {
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_FROM) {
        console.warn('Twilio WhatsApp not configured');
        return { success: false, error: 'Twilio WhatsApp not configured' };
    }

    try {
        let message = '';
        const labName = testData && testData.labName ? testData.labName : 'GAURAVI iHEALTH DIAGNOSTICS';

        // Generate personalized Marathi message based on reminder type
        switch (reminderType) {
            case 'medicine':
                if (testData && testData.testName && testData.testDate) {
                    // Format date to readable format
                    const testDate = new Date(testData.testDate).toLocaleDateString('mr-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });

                    message = `नमस्कार ${user.name},

आपली ${testData.testName} चाचणी ${testDate} रोजी झाली होती.

💊 औषध वेळेवर घ्या
📅 दररोज नियमित औषध घेणे आवश्यक आहे

– ${labName} टीम`;
                } else {
                    message = `नमस्कार ${user.name},

💊 औषध वेळेवर घ्या
📅 दररोज नियमित औषध घेणे आवश्यक आहे

– ${labName} टीम`;
                }
                break;

            case 'followup_test':
                if (testData && testData.testName && testData.testDate) {
                    // Format date to readable format
                    const testDate = new Date(testData.testDate).toLocaleDateString('mr-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });

                    message = `नमस्कार ${user.name},

आपली ${testData.testName} चाचणी ${testDate} रोजी झाली होती.

💊 औषध वेळेवर घ्या
📅 पुढील तपासणी विसरू नका
🩺 वार्षिक हेल्थ चेकअप करणे आवश्यक आहे

– ${labName} टीम`;
                } else {
                    message = `नमस्कार ${user.name},

💊 औषध वेळेवर घ्या
📅 पुढील तपासणी विसरू नका
🩺 वार्षिक हेल्थ चेकअप करणे आवश्यक आहे

– ${labName} टीम`;
                }
                break;

            case 'annual_checkup':
                message = `नमस्कार ${user.name},

🩺 वार्षिक हेल्थ चेकअप करण्याची वेळ आली आहे.

💊 नियमित औषध घ्या
📅 हेल्थ चेकअप करून घ्या
🏥 आपल्या आरोग्याची काळजी घ्या

– ${labName} टीम`;
                break;

            default:
                message = `नमस्कार ${user.name},

आपल्या हेल्थ रेकॉर्डची आठवण करून देण्यासाठी धन्यवाद.

– ${labName} टीम`;
        }

        // Send WhatsApp message
        let cleanPhone = user.phone.replace(/\s|-/g, '');
        if (!cleanPhone.startsWith('+')) {
            // Assume Indian numbers if no country code
            cleanPhone = '+91' + cleanPhone;
        }
        console.log(`Sending WhatsApp to: whatsapp:${cleanPhone}, from: whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`);
        console.log(`Twilio client available: ${!!twilioClient}, TWILIO_WHATSAPP_FROM: ${process.env.TWILIO_WHATSAPP_FROM}`);
        console.log(`Message content: ${message.substring(0, 100)}...`);

        try {
            const result = await twilioClient.messages.create({
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
                to: `whatsapp:${cleanPhone}`,
                body: message
            });
            console.log(`Twilio API response:`, result);
        } catch (twilioError) {
            console.error(`Twilio API error:`, twilioError.message);
            console.error(`Twilio error details:`, twilioError);
            throw twilioError;
        }

        console.log(`WhatsApp reminder sent to ${user.name} (${user.phone}):`, result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('WhatsApp reminder failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Generate reminders for users based on their booking history
function generateUserReminders() {
    try {
        const users = readJSON(usersFile);
        const bookings = readJSON(bookingsFile);
        const existingReminders = readJSON(remindersFile);
        const now = new Date();

        // Get active sessions to check which users are logged in
        const activeSessions = getActiveSessions();

        console.log(`Found ${activeSessions.size} active sessions for reminder generation`);

        users.forEach(user => {
            if (user.status !== 'active') return;

            // Check if user has an active session (logged in)
            const hasActiveSession = activeSessions.has(user.id);
            if (!hasActiveSession) {
                console.log(`Skipping reminders for ${user.name} (${user.id}) - not logged in`);
                return;
            }

            // Get user's bookings
            const userBookings = bookings.filter(b => b.userId === user.id);

            userBookings.forEach(booking => {
                const bookingDate = new Date(booking.date);
                const daysSinceBooking = Math.floor((now - bookingDate) / (1000 * 60 * 60 * 24));

                // Medicine reminders (daily for 7 days after test)
                if (daysSinceBooking >= 1 && daysSinceBooking <= 7) {
                    const reminderKey = `medicine_${user.id}_${booking.id}_${daysSinceBooking}`;
                    if (!existingReminders.some(r => r.key === reminderKey && !r.sent)) {
                        existingReminders.push({
                            id: 'R' + Date.now() + Math.random(),
                            key: reminderKey,
                            userId: user.id,
                            type: 'medicine',
                            when: now.toISOString(),
                            sent: false,
                            createdAt: now.toISOString(),
                            bookingId: booking.id,
                            testData: {
                                testName: booking.testName,
                                testDate: booking.date,
                                labName: 'GAURAVI iHEALTH DIAGNOSTICS'
                            }
                        });
                        console.log(`Created medicine reminder for ${user.name} - Day ${daysSinceBooking} after ${booking.testName}`);
                    }
                }

                // Follow-up test reminders (after 30 days)
                if (daysSinceBooking === 30) {
                    const reminderKey = `followup_${user.id}_${booking.id}`;
                    if (!existingReminders.some(r => r.key === reminderKey && !r.sent)) {
                        existingReminders.push({
                            id: 'R' + Date.now() + Math.random(),
                            key: reminderKey,
                            userId: user.id,
                            type: 'followup_test',
                            when: now.toISOString(),
                            sent: false,
                            createdAt: now.toISOString(),
                            bookingId: booking.id,
                            testData: {
                                testName: booking.testName,
                                testDate: booking.date,
                                labName: 'GAURAVI iHEALTH DIAGNOSTICS'
                            }
                        });
                        console.log(`Created follow-up reminder for ${user.name} - 30 days after ${booking.testName}`);
                    }
                }

                // Annual checkup reminders (every 365 days)
                if (daysSinceBooking % 365 === 0 && daysSinceBooking > 0) {
                    const reminderKey = `annual_${user.id}_${booking.id}_${Math.floor(daysSinceBooking / 365)}`;
                    if (!existingReminders.some(r => r.key === reminderKey && !r.sent)) {
                        existingReminders.push({
                            id: 'R' + Date.now() + Math.random(),
                            key: reminderKey,
                            userId: user.id,
                            type: 'annual_checkup',
                            when: now.toISOString(),
                            sent: false,
                            createdAt: now.toISOString(),
                            bookingId: booking.id,
                            testData: {
                                testName: booking.testName,
                                testDate: booking.date,
                                labName: 'GAURAVI iHEALTH DIAGNOSTICS'
                            }
                        });
                        console.log(`Created annual checkup reminder for ${user.name} - ${Math.floor(daysSinceBooking / 365)} years after booking`);
                    }
                }
            });
        });

        writeJSON(remindersFile, existingReminders);
        console.log(`Generated reminders for ${activeSessions.size} logged-in users`);
    } catch (error) {
        console.error('Error generating reminders:', error.message);
    }
}

// Helper function to get active sessions
function getActiveSessions() {
    const activeSessions = new Set();
    try {
        // Read session data from SQLite database
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./database/sessions.sqlite');

        return new Promise((resolve) => {
            db.all("SELECT sess FROM sessions", [], (err, rows) => {
                if (err) {
                    console.warn('Error reading sessions:', err.message);
                    resolve(activeSessions);
                    return;
                }

                rows.forEach(row => {
                    try {
                        const sessionData = JSON.parse(row.sess);
                        if (sessionData.userId) {
                            activeSessions.add(sessionData.userId);
                        }
                    } catch (e) {
                        // Ignore invalid session data
                    }
                });

                db.close();
                resolve(activeSessions);
            });
        });
    } catch (error) {
        console.warn('Error accessing session database:', error.message);
        return Promise.resolve(activeSessions);
    }
}

// Cron job: run every minute to check reminders (simple)
cron.schedule('* * * * *', async () => {
    try {
        const now = Date.now();
        const reminders = readJSON(remindersFile);
        const pending = reminders.filter(r => !r.sent && new Date(r.when).getTime() <= now);

        // Get active sessions to check which users are logged in
        const activeSessions = await getActiveSessions();

        for (const r of pending) {
            console.log('Reminder firing for', r);

            // Check if user is still logged in
            if (!activeSessions.has(r.userId)) {
                console.log(`Skipping reminder for ${r.userId} - user not logged in`);
                r.sent = true;
                r.sentAt = new Date().toISOString();
                r.error = 'User not logged in';
                continue;
            }

            // Get user data
            const users = readJSON(usersFile);
            const user = users.find(u => u.id === r.userId);

            if (!user) {
                console.warn('User not found for reminder:', r.userId);
                r.sent = true;
                r.sentAt = new Date().toISOString();
                r.error = 'User not found';
                continue;
            }

            // Send WhatsApp reminder
            const result = await sendWhatsAppReminder(user, r.type, r.testData);

            if (result.success) {
                r.sent = true;
                r.sentAt = new Date().toISOString();
                r.sid = result.sid;
                console.log('Reminder sent successfully to', user.phone);
            } else {
                console.warn('Failed to send reminder to', user.phone, result.error);
                // Mark as sent to avoid retrying indefinitely
                r.sent = true;
                r.sentAt = new Date().toISOString();
                r.error = result.error || 'Failed to send';
            }
        }

        writeJSON(remindersFile, reminders);
    } catch (e) { console.warn('Reminder cron failed', e && e.message); }
});

// Cron job: run daily at 9 AM to generate new reminders
cron.schedule('0 9 * * *', () => {
    console.log('Generating daily reminders...');
    generateUserReminders();
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// Get dashboard statistics
app.get('/api/analytics/stats', (req, res) => {
    try {
        const users = readJSON(usersFile);
        const bookings = readJSON(bookingsFile);
        
        const stats = {
            totalUsers: users.length,
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
            activeUsers: users.filter(u => u.status === 'active').length,
            pendingBookings: bookings.filter(b => b.status === 'pending').length,
            completedBookings: bookings.filter(b => b.status === 'completed').length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get user growth data
app.get('/api/analytics/user-growth', (req, res) => {
    try {
        const users = readJSON(usersFile);
        
        // Group users by registration month
        const monthlyData = {};
        users.forEach(user => {
            const month = user.registrationDate.substring(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        res.json(monthlyData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user growth data' });
    }
});

// Get revenue data
app.get('/api/analytics/revenue', (req, res) => {
    try {
        const bookings = readJSON(bookingsFile);
        
        // Group revenue by month
        const monthlyRevenue = {};
        bookings.forEach(booking => {
            const month = booking.date.substring(0, 7);
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.amount;
        });

        res.json(monthlyRevenue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

// Central signup handler used for both API and form POSTs
async function handleSignup(req, res) {
    try {
        console.log('Signup request received from', req.ip || req.headers['x-forwarded-for'] || 'unknown');
        const name = req.body.name || '';
        const email = (req.body.email || '').toLowerCase();
        const phone = String(req.body.phone || '').trim();
        const password = req.body.password || '';
        const confirm = req.body.confirmPassword || req.body.confirm || '';

        if (!name || !phone) return res.status(400).json({ error: 'name and phone required' });
        if (!password || password.length < 6) return res.status(400).json({ error: 'password too short' });
        if (password !== confirm) return res.status(400).json({ error: 'passwords do not match' });

        // Email uniqueness check if provided
        if (email) {
            const existingEmail = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
            if (existingEmail) return res.status(400).json({ error: 'Email already exists' });
        }
        const existingPhone = await dbGet('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingPhone) return res.status(400).json({ error: 'Phone already registered' });

        const newUser = {
            id: 'USR' + Date.now(),
            name,
            email,
            phone,
            age: req.body.age || null,
            gender: req.body.gender || '',
            bloodType: req.body.bloodType || '',
            status: 'active',
            address: req.body.address || '',
            registrationDate: new Date().toISOString().split('T')[0],
            password: hashPassword(password),
            meta: JSON.stringify({ marketingOptIn: !!req.body.marketingOptIn })
        };

        await dbRun('INSERT INTO users (id, name, email, phone, age, gender, bloodType, status, address, registrationDate, password, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newUser.id, newUser.name, newUser.email, newUser.phone, newUser.age, newUser.gender, newUser.bloodType, newUser.status, newUser.address, newUser.registrationDate, newUser.password, newUser.meta]);

        // Set session
        try { req.session.userId = newUser.id; } catch (e) { /* ignore */ }

        const resp = { ...newUser };
        delete resp.password;

        // If the client expects HTML (regular form), redirect to home/dashboard
        const acceptsHtml = req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1;
        if (acceptsHtml) {
            return res.redirect('/');
        }

        res.status(201).json(resp);
    } catch (error) {
        console.error('Signup error', error && error.message);
        res.status(500).json({ error: 'Signup failed' });
    }
}

// Register routes that might be used by form or AJAX
app.post('/api/signup', handleSignup);
app.post('/signup', handleSignup);

// Serve signup page explicitly (fixes cases where static middleware misses it)
app.get(['/signup', '/signup.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// Serve login page explicitly (fixes cases where static middleware misses it)
app.get(['/login', '/login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});



// Global 404 handler: return HTML for browsers, JSON for API clients
app.use((req, res) => {
    if (req.accepts && req.accepts('html')) {
        return res.status(404).send(`<!doctype html><html><head><meta charset="utf-8"><title>Not found</title></head><body><h1>404 — Not found</h1><p>The requested URL ${req.originalUrl} was not found on this server.</p></body></html>`);
    }
    res.status(404).json({ error: 'Route not found' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ BloodLab Admin Server running on http://localhost:${PORT} (also accessible on 0.0.0.0:${PORT})`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`📁 Database Location: ${dbDir}\n`);
});

module.exports = app;
