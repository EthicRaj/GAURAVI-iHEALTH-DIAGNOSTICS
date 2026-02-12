// Clean server file (temporary) — run this to verify server behavior while I clean server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny'));

const apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);

app.use(express.static(path.join(__dirname)));

const DB_DIR = path.join(__dirname, 'database');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DB_DIR, 'bookings.json');
const TESTS_FILE = path.join(DB_DIR, 'tests.json');

async function readJSON(filePath){ try{ const raw = await fs.readFile(filePath,'utf8'); return JSON.parse(raw||'null')||[]; }catch(e){ if(e.code==='ENOENT') return []; throw e } }
async function writeJSON(filePath,data){ const tmp = filePath+'.tmp'; await fs.writeFile(tmp, JSON.stringify(data,null,2),'utf8'); await fs.rename(tmp,filePath); }
async function ensureDatabaseFiles(){ if(!existsSync(DB_DIR)) await fs.mkdir(DB_DIR,{recursive:true}); const f=[ {p:USERS_FILE,d:[]},{p:BOOKINGS_FILE,d:[]},{p:TESTS_FILE,d:[]} ]; for(const x of f) if(!existsSync(x.p)) await writeJSON(x.p,x.d); }
function id(){ try{return require('crypto').randomUUID()}catch{ return `${Date.now()}-${Math.floor(Math.random()*1e6)}` }}
const wrap = fn => (req,res,next)=> Promise.resolve(fn(req,res,next)).catch(next);

ensureDatabaseFiles().catch(e=>{ console.error('DB init failed',e); process.exit(1); });

app.get('/health', (req,res)=> res.json({ status:'ok', uptime: process.uptime() }));

const usersRouter = express.Router();
usersRouter.get('/', wrap(async (req,res)=>{ const users = await readJSON(USERS_FILE); res.json(users); }));
usersRouter.post('/', wrap(async (req,res)=>{ const users = await readJSON(USERS_FILE); const now = new Date().toISOString(); const u={ id:id(), name:req.body.name||'Anonymous', email:req.body.email||null, createdAt:now, updatedAt:now }; users.push(u); await writeJSON(USERS_FILE, users); res.status(201).json(u); }));
app.use('/api/users', usersRouter);

app.listen(PORT, ()=> console.log(`Fixed server listening on ${PORT}`));

module.exports = app;
